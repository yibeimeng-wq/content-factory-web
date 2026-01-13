import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { checkQuota, recordUsage } from "./quota";
import { analyzeVideo, recreateScript } from "./zhipuai";
import { searchYouTubeVideos as searchYT, getMarketCodes } from "./youtube";
import { generateGuestId, createBrowserFingerprint } from "./guestId";

export const contentFactoryRouter = router({
  /**
   * 获取用户配额状态（支持访客和登录用户）
   */
  getQuota: publicProcedure.query(async ({ ctx }) => {
    // 如果用户已登录，使用真实用户ID
    if (ctx.user) {
      return await checkQuota(ctx.user.id, false);
    }

    // 访客模式：基于浏览器指纹生成ID
    const userAgent = ctx.req.headers["user-agent"] || "";
    const acceptLanguage = ctx.req.headers["accept-language"] || "";
    const ip = ctx.req.ip || ctx.req.socket.remoteAddress || "";
    
    const fingerprint = createBrowserFingerprint(userAgent, acceptLanguage, ip);
    const guestId = generateGuestId(fingerprint);

    return await checkQuota(guestId, true);
  }),

  /**
   * 生成内容脚本（支持访客和登录用户）
   */
  generate: publicProcedure
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
        // 确定用户ID和类型
        let userId: number;
        let isGuest: boolean;

        if (ctx.user) {
          // 登录用户
          userId = ctx.user.id;
          isGuest = false;
        } else {
          // 访客用户
          const userAgent = ctx.req.headers["user-agent"] || "";
          const acceptLanguage = ctx.req.headers["accept-language"] || "";
          const ip = ctx.req.ip || ctx.req.socket.remoteAddress || "";
          
          const fingerprint = createBrowserFingerprint(userAgent, acceptLanguage, ip);
          userId = generateGuestId(fingerprint);
          isGuest = true;
        }

        // 检查配额
        const quotaStatus = await checkQuota(userId, isGuest);
        if (!quotaStatus.allowed) {
          const userType = isGuest ? "访客" : "用户";
          const loginHint = isGuest 
            ? "登录后可获得每天10次的完整配额。" 
            : "";
          throw new Error(
            `每日配额已用完。${userType}今天已使用 ${quotaStatus.limit} 次生成。${loginHint}配额将在 ${quotaStatus.resetAt.toLocaleString('zh-CN')} 重置。`
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

        // 记录使用（在返回结果之前）
        await recordUsage(userId, keyword, targetMarket);

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
