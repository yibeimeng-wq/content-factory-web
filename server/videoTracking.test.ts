import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { videoPlaybacks } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Video Tracking", () => {
  let testUserId: number;

  beforeAll(async () => {
    // Use a unique test user ID
    testUserId = -99999;
    
    // Clean up any existing test data
    const db = await getDb();
    if (db) {
      await db.delete(videoPlaybacks).where(eq(videoPlaybacks.userId, testUserId));
    }
  });

  it("should track video playback", async () => {
    const caller = appRouter.createCaller({
      req: {
        headers: { 'user-agent': 'test-browser' }
      } as any,
      res: {} as any,
      user: { id: testUserId } as any,
    });

    const result = await caller.videoTracking.trackPlayback({
      videoType: "ecommerce",
      duration: 30,
      completed: false,
    });

    expect(result.success).toBe(true);

    // Verify the record was created
    const db = await getDb();
    if (db) {
      const records = await db
        .select()
        .from(videoPlaybacks)
        .where(eq(videoPlaybacks.userId, testUserId));

      expect(records.length).toBeGreaterThan(0);
      expect(records[0].videoType).toBe("ecommerce");
      expect(records[0].duration).toBe(30);
      expect(records[0].completed).toBe(0);
    }
  });

  it("should track video completion", async () => {
    const caller = appRouter.createCaller({
      req: {
        headers: { 'user-agent': 'test-browser' }
      } as any,
      res: {} as any,
      user: { id: testUserId } as any,
    });

    const result = await caller.videoTracking.trackPlayback({
      videoType: "creators",
      duration: 120,
      completed: true,
    });

    expect(result.success).toBe(true);

    // Verify the completion was recorded
    const db = await getDb();
    if (db) {
      const records = await db
        .select()
        .from(videoPlaybacks)
        .where(eq(videoPlaybacks.userId, testUserId));

      const completedRecord = records.find(r => r.videoType === "creators");
      expect(completedRecord).toBeDefined();
      expect(completedRecord?.completed).toBe(1);
      expect(completedRecord?.duration).toBe(120);
    }
  });

  it("should get video playback stats", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: null,
    });

    const stats = await caller.videoTracking.getStats();
    
    expect(Array.isArray(stats)).toBe(true);
    // Stats should include at least the test data we inserted
    const ecommerceStats = stats.find(s => s.videoType === "ecommerce");
    expect(ecommerceStats).toBeDefined();
  });
});
