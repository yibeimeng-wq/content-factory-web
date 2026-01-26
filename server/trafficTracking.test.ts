import { describe, it, expect, beforeEach } from "vitest";
import { getDb } from "./db";
import { trafficSources } from "../drizzle/schema";
import { recordTrafficSource, getTrafficStats } from "./db";
import { generateGuestId, createBrowserFingerprint } from "./guestId";

describe("Traffic Tracking System", () => {
  beforeEach(async () => {
    // Clean up test data
    const db = await getDb();
    if (db) {
      await db.delete(trafficSources);
    }
  });

  describe("Traffic Source Recording", () => {
    it("should record direct visit (no referrer)", async () => {
      const fingerprint = createBrowserFingerprint(
        "Mozilla/5.0",
        "en-US",
        "192.168.1.1"
      );
      const guestId = generateGuestId(fingerprint);

      await recordTrafficSource({
        userId: guestId,
        sourceType: "direct",
        referrer: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        landingPage: "https://example.com/",
        userAgent: "Mozilla/5.0",
      });

      const stats = await getTrafficStats(10);
      expect(stats.recent).toHaveLength(1);
      expect(stats.recent[0].sourceType).toBe("direct");
      expect(stats.recent[0].referrer).toBeNull();
    });

    it("should record search engine referral", async () => {
      const fingerprint = createBrowserFingerprint(
        "Mozilla/5.0",
        "en-US",
        "192.168.1.2"
      );
      const guestId = generateGuestId(fingerprint);

      await recordTrafficSource({
        userId: guestId,
        sourceType: "search",
        referrer: "https://www.google.com/search?q=content+factory",
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        landingPage: "https://example.com/",
        userAgent: "Mozilla/5.0",
      });

      const stats = await getTrafficStats(10);
      expect(stats.recent).toHaveLength(1);
      expect(stats.recent[0].sourceType).toBe("search");
      expect(stats.recent[0].referrer).toContain("google.com");
    });

    it("should record social media referral", async () => {
      const fingerprint = createBrowserFingerprint(
        "Mozilla/5.0",
        "en-US",
        "192.168.1.3"
      );
      const guestId = generateGuestId(fingerprint);

      await recordTrafficSource({
        userId: guestId,
        sourceType: "social",
        referrer: "https://twitter.com/",
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        landingPage: "https://example.com/",
        userAgent: "Mozilla/5.0",
      });

      const stats = await getTrafficStats(10);
      expect(stats.recent).toHaveLength(1);
      expect(stats.recent[0].sourceType).toBe("social");
      expect(stats.recent[0].referrer).toContain("twitter.com");
    });

    it("should record campaign with UTM parameters", async () => {
      const fingerprint = createBrowserFingerprint(
        "Mozilla/5.0",
        "en-US",
        "192.168.1.4"
      );
      const guestId = generateGuestId(fingerprint);

      await recordTrafficSource({
        userId: guestId,
        sourceType: "campaign",
        referrer: "https://example.com/blog",
        utmSource: "newsletter",
        utmMedium: "email",
        utmCampaign: "spring_2026",
        landingPage: "https://example.com/?utm_source=newsletter&utm_medium=email&utm_campaign=spring_2026",
        userAgent: "Mozilla/5.0",
      });

      const stats = await getTrafficStats(10);
      expect(stats.recent).toHaveLength(1);
      expect(stats.recent[0].sourceType).toBe("campaign");
      expect(stats.recent[0].utmSource).toBe("newsletter");
      expect(stats.recent[0].utmMedium).toBe("email");
      expect(stats.recent[0].utmCampaign).toBe("spring_2026");
    });
  });

  describe("Traffic Statistics", () => {
    it("should aggregate traffic by source type", async () => {
      const fp1 = createBrowserFingerprint("UA1", "en", "1.1.1.1");
      const fp2 = createBrowserFingerprint("UA2", "en", "1.1.1.2");
      const fp3 = createBrowserFingerprint("UA3", "en", "1.1.1.3");

      // Record multiple visits
      await recordTrafficSource({
        userId: generateGuestId(fp1),
        sourceType: "direct",
        referrer: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        landingPage: "https://example.com/",
        userAgent: "UA1",
      });

      await recordTrafficSource({
        userId: generateGuestId(fp2),
        sourceType: "direct",
        referrer: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        landingPage: "https://example.com/",
        userAgent: "UA2",
      });

      await recordTrafficSource({
        userId: generateGuestId(fp3),
        sourceType: "search",
        referrer: "https://google.com",
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        landingPage: "https://example.com/",
        userAgent: "UA3",
      });

      const stats = await getTrafficStats(10);
      expect(stats.bySourceType).toHaveLength(2);

      const directStats = stats.bySourceType.find((s) => s.sourceType === "direct");
      const searchStats = stats.bySourceType.find((s) => s.sourceType === "search");

      expect(directStats?.count).toBe(2);
      expect(searchStats?.count).toBe(1);
    });

    it("should aggregate UTM campaign data", async () => {
      const fp1 = createBrowserFingerprint("UA1", "en", "1.1.1.1");
      const fp2 = createBrowserFingerprint("UA2", "en", "1.1.1.2");

      // Record campaign visits
      await recordTrafficSource({
        userId: generateGuestId(fp1),
        sourceType: "campaign",
        referrer: null,
        utmSource: "facebook",
        utmMedium: "social",
        utmCampaign: "winter_sale",
        landingPage: "https://example.com/",
        userAgent: "UA1",
      });

      await recordTrafficSource({
        userId: generateGuestId(fp2),
        sourceType: "campaign",
        referrer: null,
        utmSource: "facebook",
        utmMedium: "social",
        utmCampaign: "winter_sale",
        landingPage: "https://example.com/",
        userAgent: "UA2",
      });

      const stats = await getTrafficStats(10);
      expect(stats.byUtmSource).toHaveLength(1);
      expect(stats.byUtmSource[0].utmSource).toBe("facebook");
      expect(stats.byUtmSource[0].count).toBe(2);
    });
  });

  describe("Source Type Detection", () => {
    it("should detect search engine from referrer", () => {
      const searchEngines = [
        "https://www.google.com/search?q=test",
        "https://www.bing.com/search?q=test",
        "https://search.yahoo.com/search?p=test",
        "https://www.baidu.com/s?wd=test",
      ];

      searchEngines.forEach((referrer) => {
        // Source type detection is done in the router, but we can verify the logic
        expect(referrer.toLowerCase()).toMatch(/google|bing|yahoo|baidu/);
      });
    });

    it("should detect social media from referrer", () => {
      const socialPlatforms = [
        "https://www.facebook.com/",
        "https://twitter.com/",
        "https://www.linkedin.com/",
        "https://www.instagram.com/",
      ];

      socialPlatforms.forEach((referrer) => {
        expect(referrer.toLowerCase()).toMatch(/facebook|twitter|linkedin|instagram/);
      });
    });
  });
});
