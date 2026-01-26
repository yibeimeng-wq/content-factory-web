import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { recordTrafficSource, getTrafficStats } from "./db";
import { createBrowserFingerprint, generateGuestId } from "./guestId";

/**
 * Determine source type based on referrer and UTM parameters
 */
function determineSourceType(referrer: string | null, utmSource: string | null): string {
  // Campaign tracking (has UTM parameters)
  if (utmSource) {
    return "campaign";
  }

  // Direct visit (no referrer)
  if (!referrer) {
    return "direct";
  }

  const referrerLower = referrer.toLowerCase();

  // Search engines
  const searchEngines = [
    "google",
    "bing",
    "yahoo",
    "baidu",
    "duckduckgo",
    "yandex",
    "ask.com",
  ];
  if (searchEngines.some((engine) => referrerLower.includes(engine))) {
    return "search";
  }

  // Social media
  const socialPlatforms = [
    "facebook",
    "twitter",
    "linkedin",
    "instagram",
    "reddit",
    "pinterest",
    "tiktok",
    "youtube",
    "whatsapp",
    "telegram",
  ];
  if (socialPlatforms.some((platform) => referrerLower.includes(platform))) {
    return "social";
  }

  // Other referrals
  return "referral";
}

export const trafficTrackingRouter = router({
  /**
   * Track a visitor's traffic source
   */
  trackVisit: publicProcedure
    .input(
      z.object({
        referrer: z.string().nullable().optional(),
        utmSource: z.string().nullable().optional(),
        utmMedium: z.string().nullable().optional(),
        utmCampaign: z.string().nullable().optional(),
        landingPage: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Get user ID (use browser fingerprint for guests)
        let userId: number;
        if (ctx.user) {
          userId = ctx.user.id;
        } else {
          const userAgent = ctx.req.headers["user-agent"] || "";
          const acceptLanguage = ctx.req.headers["accept-language"] || "";
          const ip = ctx.req.ip || ctx.req.socket.remoteAddress || "";
          const fingerprint = createBrowserFingerprint(userAgent, acceptLanguage, ip);
          userId = generateGuestId(fingerprint);
        }

        // Determine source type
        const sourceType = determineSourceType(
          input.referrer || null,
          input.utmSource || null
        );

        // Get user agent
        const userAgent = ctx.req.headers["user-agent"] || null;

        // Record the visit
        await recordTrafficSource({
          userId,
          sourceType,
          referrer: input.referrer || null,
          utmSource: input.utmSource || null,
          utmMedium: input.utmMedium || null,
          utmCampaign: input.utmCampaign || null,
          landingPage: input.landingPage || null,
          userAgent,
        });

        return {
          success: true,
          sourceType,
        };
      } catch (error) {
        console.error("[Traffic Tracking] Failed to track visit:", error);
        return {
          success: false,
          error: "Failed to track visit",
        };
      }
    }),

  /**
   * Get traffic statistics (protected - admin only)
   */
  getStats: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(100),
      })
    )
    .query(async ({ input, ctx }) => {
      // Only allow admin users to view stats
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      try {
        const stats = await getTrafficStats(input.limit);
        return stats;
      } catch (error) {
        console.error("[Traffic Tracking] Failed to get stats:", error);
        throw new Error("Failed to get traffic statistics");
      }
    }),
});
