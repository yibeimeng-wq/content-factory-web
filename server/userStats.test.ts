import { describe, it, expect, beforeEach } from "vitest";
import { getDb } from "./db";
import { usageRecords } from "../drizzle/schema";
import { getUniqueUserCount, checkAndNotifyUserMilestone } from "./userStats";

describe("User Statistics and Notifications", () => {
  beforeEach(async () => {
    // Clean up test data
    const db = await getDb();
    if (db) {
      await db.delete(usageRecords);
    }
  });

  it("should count unique users correctly", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Insert usage records for 3 different users
    await db.insert(usageRecords).values([
      {
        userId: 1,
        operationType: "generate_script",
        keyword: "test1",
        targetMarket: "brazil",
      },
      {
        userId: 1,
        operationType: "generate_script",
        keyword: "test2",
        targetMarket: "mexico",
      },
      {
        userId: 2,
        operationType: "generate_script",
        keyword: "test3",
        targetMarket: "indonesia",
      },
      {
        userId: 3,
        operationType: "generate_script",
        keyword: "test4",
        targetMarket: "thailand",
      },
    ]);

    const count = await getUniqueUserCount();
    expect(count).toBe(3);
  });

  it("should return 0 when no users exist", async () => {
    const count = await getUniqueUserCount();
    expect(count).toBe(0);
  });

  it("should handle notification check without errors", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Insert 9 users
    for (let i = 1; i <= 9; i++) {
      await db.insert(usageRecords).values({
        userId: i,
        operationType: "generate_script",
        keyword: `test${i}`,
        targetMarket: "brazil",
      });
    }

    // This should not throw
    await expect(checkAndNotifyUserMilestone("9")).resolves.not.toThrow();

    // Add 10th user - this should trigger notification
    await db.insert(usageRecords).values({
      userId: 10,
      operationType: "generate_script",
      keyword: "test10",
      targetMarket: "brazil",
    });

    // This should trigger notification but not throw
    await expect(checkAndNotifyUserMilestone("10")).resolves.not.toThrow();

    const count = await getUniqueUserCount();
    expect(count).toBe(10);
  });

  it("should count users across different operations", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Insert multiple operations for same user
    await db.insert(usageRecords).values([
      {
        userId: 1,
        operationType: "generate_script",
        keyword: "test1",
        targetMarket: "brazil",
      },
      {
        userId: 1,
        operationType: "generate_script",
        keyword: "test2",
        targetMarket: "mexico",
      },
      {
        userId: 1,
        operationType: "generate_script",
        keyword: "test3",
        targetMarket: "indonesia",
      },
    ]);

    const count = await getUniqueUserCount();
    // Should still be 1 unique user despite 3 operations
    expect(count).toBe(1);
  });
});
