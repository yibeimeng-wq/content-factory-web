import axios from "axios";

const ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

export interface ZhipuMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ZhipuChatRequest {
  model?: string;
  messages: ZhipuMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ZhipuChatResponse {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 调用智谱AI API
 */
export async function callZhipuAI(request: ZhipuChatRequest): Promise<string> {
  const apiKey = process.env.GLM_API_KEY;
  
  if (!apiKey) {
    throw new Error("GLM_API_KEY environment variable is not set");
  }

  try {
    const response = await axios.post<ZhipuChatResponse>(
      ZHIPU_API_URL,
      {
        model: request.model || "glm-4-flash",
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 4000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        timeout: 60000,
      }
    );

    if (!response.data.choices || response.data.choices.length === 0) {
      throw new Error("No response from Zhipu AI");
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error?.message || error.message;
      throw new Error(`Zhipu AI API error: ${message}`);
    }
    throw error;
  }
}

/**
 * 分析视频内容
 */
export async function analyzeVideo(videoTitle: string, videoDescription: string): Promise<{
  coreIdea: string;
  contentType: string;
  targetAudience: string;
  keyElements: string[];
}> {
  const prompt = `分析以下视频的核心创意和关键要素：

标题：${videoTitle}
描述：${videoDescription}

请以JSON格式返回分析结果，包含以下字段：
- coreIdea: 核心创意（一句话概括）
- contentType: 内容类型（如：娱乐、教育、生活技巧等）
- targetAudience: 目标受众
- keyElements: 关键元素列表（数组）

只返回JSON，不要其他内容。不要使用换行符或特殊控制字符。`;

  const response = await callZhipuAI({
    messages: [
      {
        role: "system",
        content: "你是一个专业的视频内容分析师。只返回JSON格式的结果，不要包含任何其他文字。",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  // 清理响应中的控制字符
  const cleanedResponse = response.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
  
  // 尝试提取JSON
  let jsonStr = cleanedResponse.trim();
  const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse JSON:", jsonStr);
    // 返回默认值
    return {
      coreIdea: "基于视频内容的创意概念",
      contentType: "娱乐",
      targetAudience: "广泛观众",
      keyElements: ["视频内容", "创意元素"],
    };
  }
}

/**
 * 重新创作脚本
 */
export async function recreateScript(
  analysis: {
    coreIdea: string;
    contentType: string;
    targetAudience: string;
    keyElements: string[];
  },
  targetMarket: string,
  targetLanguage: string
): Promise<string> {
  const prompt = `基于以下视频分析结果，为${targetMarket}市场重新创作一个本地化的视频脚本：

核心创意：${analysis.coreIdea}
内容类型：${analysis.contentType}
目标受众：${analysis.targetAudience}
关键元素：${analysis.keyElements.join("、")}

要求：
1. 使用${targetLanguage}语言
2. 深度本地化：包含${targetMarket}的地理位置、文化元素、本地习俗
3. 创意转换：不要简单翻译，而是重新创作适合${targetMarket}市场的内容
4. 包含3-5个具体场景，每个场景都有本地化的地点和对白
5. 格式清晰，包含标题、场景描述、对白、本地化元素说明

请直接返回完整的脚本内容。`;

  const response = await callZhipuAI({
    messages: [
      {
        role: "system",
        content: `你是一个专业的内容本地化专家，擅长为不同市场创作本地化内容。你了解${targetMarket}的文化、语言和习俗。`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.8,
    max_tokens: 4000,
  });

  return response;
}
