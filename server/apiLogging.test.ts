import { describe, it, expect, beforeAll } from "vitest";
import { recordApiLog, getApiUsageStats } from "./db";

describe("API Logging", () => {
  const testUserId = 999;

  beforeAll(async () => {
    // Insert test API log
    await recordApiLog({
      userId: testUserId,
      operation: "test_operation",
      model: "glm-4-flash",
      promptSummary: "Test prompt summary",
      promptTokens: 100,
      completionTokens: 200,
      totalTokens: 300,
      responseTime: 1500,
      success: 1,
      errorMessage: null,
    });
  });

  it("should record API log successfully", async () => {
    await recordApiLog({
      userId: testUserId,
      operation: "test_record",
      model: "glm-4-flash",
      promptSummary: "Another test",
      promptTokens: 50,
      completionTokens: 100,
      totalTokens: 150,
      responseTime: 1000,
      success: 1,
      errorMessage: null,
    });

    const stats = await getApiUsageStats(testUserId, 10);
    expect(stats.recent.length).toBeGreaterThan(0);
  });

  it("should get API usage stats for specific user", async () => {
    const stats = await getApiUsageStats(testUserId, 100);
    
    expect(stats).toHaveProperty("recent");
    expect(stats).toHaveProperty("byOperation");
    expect(stats).toHaveProperty("totalStats");
    expect(Array.isArray(stats.recent)).toBe(true);
    expect(Array.isArray(stats.byOperation)).toBe(true);
  });

  it("should calculate total statistics correctly", async () => {
    const stats = await getApiUsageStats(testUserId, 100);
    
    if (stats.totalStats) {
      expect(Number(stats.totalStats.totalCalls)).toBeGreaterThan(0);
      expect(Number(stats.totalStats.totalTokens)).toBeGreaterThan(0);
      expect(Number(stats.totalStats.successRate)).toBeGreaterThanOrEqual(0);
      expect(Number(stats.totalStats.successRate)).toBeLessThanOrEqual(100);
    }
  });

  it("should group by operation correctly", async () => {
    const stats = await getApiUsageStats(testUserId, 100);
    
    if (stats.byOperation.length > 0) {
      const firstOp = stats.byOperation[0];
      expect(firstOp).toHaveProperty("operation");
      expect(firstOp).toHaveProperty("count");
      expect(firstOp).toHaveProperty("totalTokens");
      expect(firstOp).toHaveProperty("avgResponseTime");
    }
  });

  it("should record failed API calls", async () => {
    await recordApiLog({
      userId: testUserId,
      operation: "test_failure",
      model: "glm-4-flash",
      promptSummary: "Failed test",
      promptTokens: null,
      completionTokens: null,
      totalTokens: null,
      responseTime: 500,
      success: 0,
      errorMessage: "Test error message",
    });

    const stats = await getApiUsageStats(testUserId, 100);
    const failedLog = stats.recent.find(
      (log: any) => log.operation === "test_failure"
    );
    
    expect(failedLog).toBeDefined();
    expect(failedLog?.success).toBe(0);
    expect(failedLog?.errorMessage).toBe("Test error message");
  });

  it("should get all users stats when userId is undefined (admin)", async () => {
    const stats = await getApiUsageStats(undefined, 100);
    
    expect(stats).toHaveProperty("recent");
    expect(stats).toHaveProperty("byOperation");
    expect(stats).toHaveProperty("byUser");
    expect(Array.isArray(stats.byUser)).toBe(true);
  });
});
