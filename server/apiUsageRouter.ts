import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "./_core/trpc";
import { getApiUsageStats } from "./db";

export const apiUsageRouter = router({
  /**
   * Get API usage statistics (admin only - see all users)
   */
  getAdminStats: adminProcedure
    .input(
      z.object({
        limit: z.number().optional().default(100),
      })
    )
    .query(async ({ input }) => {
      const stats = await getApiUsageStats(undefined, input.limit);
      return stats;
    }),

  /**
   * Get user's own API usage statistics
   */
  getMyStats: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const stats = await getApiUsageStats(ctx.user.id, input.limit);
      return stats;
    }),
});
