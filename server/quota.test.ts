import { describe, it, expect, beforeEach } from "vitest";
import { checkQuota, recordUsage, QUOTA_CONFIG } from "./quota";
import { getDb } from "./db";
import { usageRecords } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Quota Management", () => {
  const testUserId = 999999; // Use a test user ID

  beforeEach(async () => {
    // Clean up test data before each test
    const db = await getDb();
    if (db) {
      await db.delete(usageRecords).where(eq(usageRecords.userId, testUserId));
    }
  });

  it("should allow usage when quota is available", async () => {
    const result = await checkQuota(testUserId);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(QUOTA_CONFIG.FREE_DAILY_LIMIT);
    expect(result.limit).toBe(QUOTA_CONFIG.FREE_DAILY_LIMIT);
  });

  it("should decrease remaining quota after recording usage", async () => {
    // Record one usage
    await recordUsage(testUserId, "test keyword", "brazil");

    const result = await checkQuota(testUserId);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(QUOTA_CONFIG.FREE_DAILY_LIMIT - 1);
  });

  it("should deny usage when quota is exhausted", async () => {
    // Use up all quota
    for (let i = 0; i < QUOTA_CONFIG.FREE_DAILY_LIMIT; i++) {
      await recordUsage(testUserId, `test ${i}`, "brazil");
    }

    const result = await checkQuota(testUserId);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should record usage with correct data", async () => {
    const keyword = "test keyword";
    const targetMarket = "mexico";

    await recordUsage(testUserId, keyword, targetMarket);

    const db = await getDb();
    if (db) {
      const records = await db
        .select()
        .from(usageRecords)
        .where(eq(usageRecords.userId, testUserId));

      expect(records.length).toBe(1);
      expect(records[0]?.keyword).toBe(keyword);
      expect(records[0]?.targetMarket).toBe(targetMarket);
      expect(records[0]?.operationType).toBe("generate_script");
    }
  });
});
