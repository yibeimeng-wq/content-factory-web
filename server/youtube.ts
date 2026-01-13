import { callDataApi } from "./_core/dataApi";

export interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedTimeText: string;
  viewCountText: string;
  lengthText: string;
  thumbnails: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  descriptionSnippet?: string;
}

export interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  estimatedResults: number;
  cursorNext?: string;
}

/**
 * 搜索YouTube视频
 * @param query 搜索关键词
 * @param language 语言代码 (如 'en', 'pt', 'es')
 * @param country 国家代码 (如 'US', 'BR', 'MX')
 * @param maxResults 最大结果数量
 */
export async function searchYouTubeVideos(
  query: string,
  language: string = "en",
  country: string = "US",
  maxResults: number = 5
): Promise<YouTubeSearchResult> {
  try {
    const response = await callDataApi("Youtube/search", {
      query: {
        q: query,
        hl: language,
        gl: country,
      },
    }) as any;

    // 过滤出视频类型的结果
    const contents = response.contents || [];
    const videos: YouTubeVideo[] = contents
      .filter((item: any) => item.type === "video")
      .slice(0, maxResults)
      .map((item: any) => {
        const video = item.video || {};
        const author = video.author || {};
        const stats = video.stats || {};
        return {
          videoId: video.videoId || "",
          title: video.title || "",
          channelTitle: author.title || "",
          publishedTimeText: video.publishedTimeText || "",
          viewCountText: stats.views ? `${stats.views.toLocaleString()} views` : "",
          lengthText: video.lengthSeconds ? `${Math.floor(video.lengthSeconds / 60)}:${(video.lengthSeconds % 60).toString().padStart(2, '0')}` : "",
          thumbnails: video.thumbnails || [],
          descriptionSnippet: video.descriptionSnippet || "",
        };
      });

    return {
      videos,
      estimatedResults: response.estimatedResults || 0,
      cursorNext: response.cursorNext,
    };
  } catch (error) {
    console.error("YouTube API error:", error);
    throw new Error(`Failed to search YouTube videos: ${error}`);
  }
}

/**
 * 根据市场获取语言和国家代码
 */
export function getMarketCodes(market: string): { language: string; country: string } {
  const marketMap: Record<string, { language: string; country: string }> = {
    巴西: { language: "pt", country: "BR" },
    墨西哥: { language: "es", country: "MX" },
    印尼: { language: "id", country: "ID" },
    泰国: { language: "th", country: "TH" },
    越南: { language: "vi", country: "VN" },
    菲律宾: { language: "fil", country: "PH" },
  };

  return marketMap[market] || { language: "en", country: "US" };
}
