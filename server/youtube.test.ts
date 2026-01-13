import { describe, expect, it } from "vitest";
import { searchYouTubeVideos, getMarketCodes } from "./youtube";

describe("YouTube API Integration", () => {
  it("should search YouTube videos successfully", async () => {
    const result = await searchYouTubeVideos("搞笑恶作剧", "en", "US", 3);

    expect(result).toBeDefined();
    expect(result.videos).toBeDefined();
    expect(Array.isArray(result.videos)).toBe(true);
    expect(result.videos.length).toBeGreaterThan(0);
    expect(result.videos.length).toBeLessThanOrEqual(3);

    // 检查第一个视频的结构
    const firstVideo = result.videos[0];
    expect(firstVideo).toBeDefined();
    expect(firstVideo.videoId).toBeTruthy();
    expect(firstVideo.title).toBeTruthy();
    expect(firstVideo.channelTitle).toBeTruthy();
    expect(Array.isArray(firstVideo.thumbnails)).toBe(true);
  }, 30000); // 30秒超时

  it("should return correct market codes", () => {
    const brazilCodes = getMarketCodes("巴西");
    expect(brazilCodes.language).toBe("pt");
    expect(brazilCodes.country).toBe("BR");

    const mexicoCodes = getMarketCodes("墨西哥");
    expect(mexicoCodes.language).toBe("es");
    expect(mexicoCodes.country).toBe("MX");

    const unknownCodes = getMarketCodes("未知市场");
    expect(unknownCodes.language).toBe("en");
    expect(unknownCodes.country).toBe("US");
  });
});
