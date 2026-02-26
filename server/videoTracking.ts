import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { videoPlaybacks } from "../drizzle/schema";
import { generateGuestId } from "./guestId";

export const videoTrackingRouter = router({
  /**
   * Track video playback
   */
  trackPlayback: publicProcedure
    .input(
      z.object({
        videoType: z.enum(["ecommerce", "creators", "kols", "jesus-manus"]),
        duration: z.number().optional(),
        completed: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get user ID or generate guest ID
      const userId = ctx.user?.id || generateGuestId(ctx.req.headers['user-agent'] || '');

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      await db.insert(videoPlaybacks).values({
        userId,
        videoType: input.videoType,
        duration: input.duration,
        completed: input.completed ? 1 : 0,
      });

      return { success: true };
    }),

  /**
   * Get video playback statistics
   */
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return [];
    }

    const stats = await db
      .select({
        videoType: videoPlaybacks.videoType,
      })
      .from(videoPlaybacks)
      .groupBy(videoPlaybacks.videoType);

    return stats;
  }),
});
