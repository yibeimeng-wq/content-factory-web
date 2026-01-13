import { describe, it, expect, beforeEach } from "vitest";
import { getDb } from "./db";
import { usageRecords } from "../drizzle/schema";
import { checkQuota, recordUsage, QUOTA_CONFIG } from "./quota";
import { generateGuestId, createBrowserFingerprint } from "./guestId";

describe("Guest Access and Mixed Mode", () => {
  beforeEach(async () => {
    // Clean up test data
    const db = await getDb();
    if (db) {
      await db.delete(usageRecords);
    }
  });

  describe("Guest ID Generation", () => {
    it("should generate consistent guest IDs for same fingerprint", () => {
      const fingerprint = "Mozilla/5.0|en-US|192.168.1.1";
      const id1 = generateGuestId(fingerprint);
      const id2 = generateGuestId(fingerprint);

      expect(id1).toBe(id2);
      expect(id1).toBeLessThan(0); // Guest IDs are negative
    });

    it("should generate different IDs for different fingerprints", () => {
      const fp1 = "Mozilla/5.0|en-US|192.168.1.1";
      const fp2 = "Chrome/100.0|zh-CN|192.168.1.2";

      const id1 = generateGuestId(fp1);
      const id2 = generateGuestId(fp2);

      expect(id1).not.toBe(id2);
    });

    it("should create browser fingerprint from headers", () => {
      const fingerprint = createBrowserFingerprint(
        "Mozilla/5.0",
        "en-US",
        "192.168.1.1"
      );

      expect(fingerprint).toBe("Mozilla/5.0|en-US|192.168.1.1");
    });
  });

  describe("Guest Quota System", () => {
    it("should allow guest users 3 attempts per day", async () => {
      const guestId = -12345; // Negative ID for guest

      const quotaStatus = await checkQuota(guestId, true);

      expect(quotaStatus.isGuest).toBe(true);
      expect(quotaStatus.limit).toBe(QUOTA_CONFIG.GUEST_DAILY_LIMIT);
      expect(quotaStatus.remaining).toBe(3);
      expect(quotaStatus.allowed).toBe(true);
    });

    it("should decrease guest quota after usage", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const guestId = -12345;

      // Record one usage
      await db.insert(usageRecords).values({
        userId: guestId,
        operationType: "generate_script",
        keyword: "test",
        targetMarket: "brazil",
      });

      const quotaStatus = await checkQuota(guestId, true);

      expect(quotaStatus.remaining).toBe(2);
      expect(quotaStatus.allowed).toBe(true);
    });

    it("should deny guest access after 3 uses", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const guestId = -12345;

      // Record 3 usages
      for (let i = 0; i < 3; i++) {
        await db.insert(usageRecords).values({
          userId: guestId,
          operationType: "generate_script",
          keyword: `test${i}`,
          targetMarket: "brazil",
        });
      }

      const quotaStatus = await checkQuota(guestId, true);

      expect(quotaStatus.remaining).toBe(0);
      expect(quotaStatus.allowed).toBe(false);
    });
  });

  describe("Logged-in User Quota System", () => {
    it("should allow logged-in users 10 attempts per day", async () => {
      const userId = 1; // Positive ID for logged-in user

      const quotaStatus = await checkQuota(userId, false);

      expect(quotaStatus.isGuest).toBe(false);
      expect(quotaStatus.limit).toBe(QUOTA_CONFIG.USER_DAILY_LIMIT);
      expect(quotaStatus.remaining).toBe(10);
      expect(quotaStatus.allowed).toBe(true);
    });

    it("should decrease user quota after usage", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = 1;

      // Record 5 usages
      for (let i = 0; i < 5; i++) {
        await db.insert(usageRecords).values({
          userId,
          operationType: "generate_script",
          keyword: `test${i}`,
          targetMarket: "brazil",
        });
      }

      const quotaStatus = await checkQuota(userId, false);

      expect(quotaStatus.remaining).toBe(5);
      expect(quotaStatus.allowed).toBe(true);
    });

    it("should deny user access after 10 uses", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = 1;

      // Record 10 usages
      for (let i = 0; i < 10; i++) {
        await db.insert(usageRecords).values({
          userId,
          operationType: "generate_script",
          keyword: `test${i}`,
          targetMarket: "brazil",
        });
      }

      const quotaStatus = await checkQuota(userId, false);

      expect(quotaStatus.remaining).toBe(0);
      expect(quotaStatus.allowed).toBe(false);
    });
  });

  describe("Mixed Mode Isolation", () => {
    it("should keep guest and user quotas separate", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const guestId = -12345;
      const userId = 1;

      // Guest uses 2 times
      for (let i = 0; i < 2; i++) {
        await db.insert(usageRecords).values({
          userId: guestId,
          operationType: "generate_script",
          keyword: `guest${i}`,
          targetMarket: "brazil",
        });
      }

      // User uses 5 times
      for (let i = 0; i < 5; i++) {
        await db.insert(usageRecords).values({
          userId,
          operationType: "generate_script",
          keyword: `user${i}`,
          targetMarket: "brazil",
        });
      }

      const guestQuota = await checkQuota(guestId, true);
      const userQuota = await checkQuota(userId, false);

      expect(guestQuota.remaining).toBe(1); // 3 - 2 = 1
      expect(userQuota.remaining).toBe(5); // 10 - 5 = 5
    });
  });
});
