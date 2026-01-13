import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { analyzeVideo, recreateScript } from "./zhipuai";

// 模拟YouTube搜索结果（实际项目中应该调用YouTube Data API）
function searchYouTubeVideos(keyword: string) {
  return [
    {
      id: "demo1",
      title: `${keyword} - 2025年最火合集`,
      description: `这是一个关于${keyword}的精彩视频合集，包含了2025年最受欢迎的内容。`,
      channel: "Demo Channel",
      views: "1.2M",
      thumbnail: "https://via.placeholder.com/320x180",
    },
    {
      id: "demo2",
      title: `${keyword}精选 | 爆笑时刻`,
      description: `收集了最搞笑的${keyword}片段，保证让你笑到停不下来！`,
      channel: "Funny Moments",
      views: "850K",
      thumbnail: "https://via.placeholder.com/320x180",
    },
    {
      id: "demo3",
      title: `终极${keyword}挑战`,
      description: `挑战各种${keyword}，看看谁能坚持到最后！`,
      channel: "Challenge Masters",
      views: "2.1M",
      thumbnail: "https://via.placeholder.com/320x180",
    },
  ];
}

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
        // 1. 搜索YouTube视频（使用模拟数据）
        const videos = searchYouTubeVideos(keyword);
        const selectedVideo = videos[0]; // 选择第一个视频

        // 2. 分析视频内容
        const analysis = await analyzeVideo(
          selectedVideo.title,
          selectedVideo.description
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
              channel: selectedVideo.channel,
              views: selectedVideo.views,
              description: selectedVideo.description,
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
