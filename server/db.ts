import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

import { InsertTrafficSource, trafficSources } from "../drizzle/schema";
import { desc, sql } from "drizzle-orm";

/**
 * Record a traffic source visit
 */
export async function recordTrafficSource(data: InsertTrafficSource): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record traffic source: database not available");
    return;
  }

  try {
    await db.insert(trafficSources).values(data);
  } catch (error) {
    console.error("[Database] Failed to record traffic source:", error);
    throw error;
  }
}

/**
 * Get traffic source statistics
 */
export async function getTrafficStats(limit: number = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get traffic stats: database not available");
    return { recent: [], bySourceType: [], byUtmSource: [] };
  }

  try {
    // Recent visits
    const recent = await db
      .select()
      .from(trafficSources)
      .orderBy(desc(trafficSources.createdAt))
      .limit(limit);

    // Group by source type
    const bySourceType = await db
      .select({
        sourceType: trafficSources.sourceType,
        count: sql<number>`COUNT(*)`,
      })
      .from(trafficSources)
      .groupBy(trafficSources.sourceType)
      .orderBy(desc(sql`COUNT(*)`));

    // Group by UTM source (for campaign tracking)
    const byUtmSource = await db
      .select({
        utmSource: trafficSources.utmSource,
        utmMedium: trafficSources.utmMedium,
        utmCampaign: trafficSources.utmCampaign,
        count: sql<number>`COUNT(*)`,
      })
      .from(trafficSources)
      .where(sql`${trafficSources.utmSource} IS NOT NULL`)
      .groupBy(
        trafficSources.utmSource,
        trafficSources.utmMedium,
        trafficSources.utmCampaign
      )
      .orderBy(desc(sql`COUNT(*)`));

    return { recent, bySourceType, byUtmSource };
  } catch (error) {
    console.error("[Database] Failed to get traffic stats:", error);
    throw error;
  }
}

import { InsertApiLog, apiLogs } from "../drizzle/schema";

/**
 * Record an API call log
 */
export async function recordApiLog(data: InsertApiLog): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record API log: database not available");
    return;
  }

  try {
    await db.insert(apiLogs).values(data);
  } catch (error) {
    console.error("[Database] Failed to record API log:", error);
    // Don't throw - logging should not break the main flow
  }
}

/**
 * Get API usage statistics
 */
export async function getApiUsageStats(userId?: number, limit: number = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get API stats: database not available");
    return { recent: [], byOperation: [], byUser: [], totalStats: null };
  }

  try {
    // Recent API calls
    const recentQuery = db
      .select()
      .from(apiLogs)
      .orderBy(desc(apiLogs.createdAt))
      .limit(limit);
    
    const recent = userId 
      ? await recentQuery.where(eq(apiLogs.userId, userId))
      : await recentQuery;

    // Group by operation
    const byOperationQuery = db
      .select({
        operation: apiLogs.operation,
        count: sql<number>`COUNT(*)`,
        totalTokens: sql<number>`SUM(${apiLogs.totalTokens})`,
        avgResponseTime: sql<number>`AVG(${apiLogs.responseTime})`,
      })
      .from(apiLogs)
      .groupBy(apiLogs.operation)
      .orderBy(desc(sql`COUNT(*)`));
    
    const byOperation = userId
      ? await byOperationQuery.where(eq(apiLogs.userId, userId))
      : await byOperationQuery;

    // Group by user (admin only)
    const byUser = userId ? [] : await db
      .select({
        userId: apiLogs.userId,
        count: sql<number>`COUNT(*)`,
        totalTokens: sql<number>`SUM(${apiLogs.totalTokens})`,
      })
      .from(apiLogs)
      .where(sql`${apiLogs.userId} IS NOT NULL`)
      .groupBy(apiLogs.userId)
      .orderBy(desc(sql`COUNT(*)`));

    // Total statistics
    const totalStatsQuery = db
      .select({
        totalCalls: sql<number>`COUNT(*)`,
        totalTokens: sql<number>`SUM(${apiLogs.totalTokens})`,
        totalPromptTokens: sql<number>`SUM(${apiLogs.promptTokens})`,
        totalCompletionTokens: sql<number>`SUM(${apiLogs.completionTokens})`,
        avgResponseTime: sql<number>`AVG(${apiLogs.responseTime})`,
        successRate: sql<number>`AVG(${apiLogs.success}) * 100`,
      })
      .from(apiLogs);
    
    const totalStatsResult = userId
      ? await totalStatsQuery.where(eq(apiLogs.userId, userId))
      : await totalStatsQuery;
    
    const totalStats = totalStatsResult[0] || null;

    return { recent, byOperation, byUser, totalStats };
  } catch (error) {
    console.error("[Database] Failed to get API stats:", error);
    throw error;
  }
}
