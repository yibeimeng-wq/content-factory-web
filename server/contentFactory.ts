import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { analyzeVideo, recreateScript } from "./zhipuai";
import { searchYouTubeVideos as searchYT, getMarketCodes } from "./youtube";



export const contentFactoryRouter = router({
  /**
   * 生成内容脚本
   */
  generate: publicProcedure
    .input(
      z.object({
        keyword: z.string().min(1, "关键词不能为空"),
        targetMarket: z.string(),
        targetLanguage: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { keyword, targetMarket, targetLanguage } = input;

      try {
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
      } catch (error) {
        console.error("Content generation error:", error);
        throw new Error(
          error instanceof Error ? error.message : "生成失败，请重试"
        );
      }
    }),
});
