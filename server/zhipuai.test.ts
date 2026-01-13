import { describe, expect, it } from "vitest";
import { callZhipuAI } from "./zhipuai";

describe("Zhipu AI Integration", () => {
  it("should successfully call Zhipu AI API with valid credentials", async () => {
    // 简单的测试调用，验证API密钥是否有效
    const response = await callZhipuAI({
      messages: [
        {
          role: "user",
          content: "Say 'Hello' in one word",
        },
      ],
      max_tokens: 10,
    });

    expect(response).toBeTruthy();
    expect(typeof response).toBe("string");
    expect(response.length).toBeGreaterThan(0);
  }, 30000); // 30秒超时
});
