import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { checkQuota, recordUsage } from "./quota";
import { analyzeVideo, recreateScript } from "./zhipuai";
import { searchYouTubeVideos as searchYT, getMarketCodes } from "./youtube";



export const contentFactoryRouter = router({
  /**
   * 获取用户配额状态
   */
  getQuota: protectedProcedure.query(async ({ ctx }) => {
    return await checkQuota(ctx.user.id);
  }),

  /**
   * 生成内容脚本
   */
  generate: protectedProcedure
    .input(
      z.object({
        keyword: z.string().min(1, "关键词不能为空"),
        targetMarket: z.string(),
        targetLanguage: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { keyword, targetMarket, targetLanguage } = input;

      try {
        // 检查配额
        const quotaStatus = await checkQuota(ctx.user.id);
        if (!quotaStatus.allowed) {
          throw new Error(
            `每日配额已用完。您今天已使用 ${quotaStatus.limit} 次生成。配额将在 ${quotaStatus.resetAt.toLocaleString('zh-CN')} 重置。`
          );
        }
        // 1. 搜索YouTube视频（使用真实API）
        const { language, country } = getMarketCodes(targetMarket);
        const youtubeResult = await searchYT(keyword, language, country, 3);
        
        if (!youtubeResult.videos || youtubeResult.videos.length === 0) {
          throw new Error("未找到相关视频");
        }
        
        const selectedVideo = youtubeResult.videos[0];

        // 2. 分析视频内容
        const analysis = await analyzeVideo(
          selectedVideo.title,
          selectedVideo.descriptionSnippet || selectedVideo.title
        );

        // 3. 重新创作脚本
        const script = await recreateScript(
          analysis,
          targetMarket,
          targetLanguage
        );

        return {
          success: true,
          data: {
            originalVideo: {
              title: selectedVideo.title,
              channel: selectedVideo.channelTitle,
              views: selectedVideo.viewCountText,
              videoId: selectedVideo.videoId,
              publishedAt: selectedVideo.publishedTimeText,
              duration: selectedVideo.lengthText,
              description: selectedVideo.descriptionSnippet || "",
            },
            analysis: {
              coreIdea: analysis.coreIdea,
              contentType: analysis.contentType,
              targetAudience: analysis.targetAudience,
              keyElements: analysis.keyElements,
            },
            script,
          },
        };

        // 记录使用
        await recordUsage(ctx.user.id, keyword, targetMarket);
      } catch (error) {
        console.error("Content generation error:", error);
        throw new Error(
          error instanceof Error ? error.message : "生成失败，请重试"
        );
      }
    }),
});
