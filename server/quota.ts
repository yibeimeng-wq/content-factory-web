import { and, count, eq, gte } from "drizzle-orm";
import { usageRecords } from "../drizzle/schema";
import { getDb } from "./db";
import { checkAndNotifyUserMilestone } from "./userStats";

/**
 * Quota configuration
 */
export const QUOTA_CONFIG = {
  // Guest users (not logged in): 1 generation per day
  GUEST_DAILY_LIMIT: 1,
  // Logged in users: 10 generations per day
  USER_DAILY_LIMIT: 10,
  // Time window: 24 hours in milliseconds
  TIME_WINDOW_MS: 24 * 60 * 60 * 1000,
};

/**
 * Check if user has remaining quota
 * @param userId - User ID (negative for guests, positive for logged-in users)
 * @param isGuest - Whether the user is a guest
 */
export async function checkQuota(
  userId: number,
  isGuest: boolean = false
): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
  isGuest: boolean;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Determine daily limit based on user type
  const dailyLimit = isGuest
    ? QUOTA_CONFIG.GUEST_DAILY_LIMIT
    : QUOTA_CONFIG.USER_DAILY_LIMIT;

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
  const remaining = Math.max(0, dailyLimit - usageCount);
  const allowed = remaining > 0;

  // Calculate reset time (24 hours from now)
  const resetAt = new Date(Date.now() + QUOTA_CONFIG.TIME_WINDOW_MS);

  return {
    allowed,
    remaining,
    limit: dailyLimit,
    resetAt,
    isGuest,
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

  // Check if we should notify about user milestone
  try {
    await checkAndNotifyUserMilestone(userId.toString());
  } catch (error) {
    console.error("[Quota] Failed to check user milestone:", error);
    // Don't throw - notification failure shouldn't block the main operation
  }
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
