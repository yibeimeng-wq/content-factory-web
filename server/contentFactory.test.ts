import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Content Factory API", () => {
  it("should generate script successfully with valid input", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contentFactory.generate({
      keyword: "搞笑恶作剧",
      targetMarket: "巴西",
      targetLanguage: "葡萄牙语（巴西）",
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.originalVideo).toBeDefined();
    expect(result.data.originalVideo.title).toContain("搞笑恶作剧");
    expect(result.data.analysis).toBeDefined();
    expect(result.data.analysis.coreIdea).toBeTruthy();
    expect(result.data.analysis.contentType).toBeTruthy();
    expect(result.data.analysis.targetAudience).toBeTruthy();
    expect(result.data.script).toBeTruthy();
    expect(typeof result.data.script).toBe("string");
    expect(result.data.script.length).toBeGreaterThan(100);
  }, 60000); // 60秒超时，因为需要调用AI API

  it("should reject empty keyword", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contentFactory.generate({
        keyword: "",
        targetMarket: "巴西",
        targetLanguage: "葡萄牙语（巴西）",
      })
    ).rejects.toThrow();
  });
});
