import { and, count, eq, gte } from "drizzle-orm";
import { usageRecords } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Quota configuration
 */
export const QUOTA_CONFIG = {
  // Free tier: 10 generations per day
  FREE_DAILY_LIMIT: 10,
  // Time window: 24 hours in milliseconds
  TIME_WINDOW_MS: 24 * 60 * 60 * 1000,
};

/**
 * Check if user has remaining quota
 */
export async function checkQuota(userId: number): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Calculate time window start (24 hours ago)
  const windowStart = new Date(Date.now() - QUOTA_CONFIG.TIME_WINDOW_MS);

  // Count usage in the last 24 hours
  const result = await db
    .select({ count: count() })
    .from(usageRecords)
    .where(
      and(
        eq(usageRecords.userId, userId),
        eq(usageRecords.operationType, "generate_script"),
        gte(usageRecords.createdAt, windowStart)
      )
    );

  const usageCount = result[0]?.count || 0;
  const remaining = Math.max(0, QUOTA_CONFIG.FREE_DAILY_LIMIT - usageCount);
  const allowed = remaining > 0;

  // Calculate reset time (24 hours from now)
  const resetAt = new Date(Date.now() + QUOTA_CONFIG.TIME_WINDOW_MS);

  return {
    allowed,
    remaining,
    limit: QUOTA_CONFIG.FREE_DAILY_LIMIT,
    resetAt,
  };
}

/**
 * Record a usage event
 */
export async function recordUsage(
  userId: number,
  keyword: string,
  targetMarket: string
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(usageRecords).values({
    userId,
    operationType: "generate_script",
    keyword,
    targetMarket,
  });
}

/**
 * Get user's usage history
 */
export async function getUserUsageHistory(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db
    .select()
    .from(usageRecords)
    .where(eq(usageRecords.userId, userId))
    .orderBy(usageRecords.createdAt)
    .limit(limit);
}
