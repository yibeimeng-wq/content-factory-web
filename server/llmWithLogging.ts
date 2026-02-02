import { invokeLLM, InvokeParams, InvokeResult } from "./_core/llm";
import { recordApiLog } from "./db";

/**
 * Wrapper around invokeLLM that automatically logs API usage
 * @param params - LLM invocation parameters
 * @param userId - User ID making the request (optional)
 * @param operation - Operation name for logging (e.g., 'generate_script', 'chat')
 * @returns LLM invocation result
 */
export async function invokeLLMWithLogging(
  params: InvokeParams,
  userId?: number,
  operation: string = "llm_call"
): Promise<InvokeResult> {
  const startTime = Date.now();
  let success = true;
  let errorMessage: string | undefined;
  let result: InvokeResult | null = null;

  try {
    result = await invokeLLM(params);
    return result;
  } catch (error) {
    success = false;
    errorMessage = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    const responseTime = Date.now() - startTime;

    // Extract prompt summary (first message or first 200 chars)
    let promptSummary = "";
    if (params.messages && params.messages.length > 0) {
      const firstMessage = params.messages[0];
      if (typeof firstMessage.content === "string") {
        promptSummary = firstMessage.content.substring(0, 200);
      } else if (Array.isArray(firstMessage.content)) {
        const textContent = firstMessage.content.find(
          (c) => typeof c === "string" || (typeof c === "object" && c.type === "text")
        );
        if (textContent) {
          promptSummary =
            typeof textContent === "string"
              ? textContent.substring(0, 200)
              : "text" in textContent
              ? textContent.text.substring(0, 200)
              : "";
        }
      }
    }

    // Log API usage (don't await to avoid blocking)
    recordApiLog({
      userId: userId ?? null,
      operation,
      model: result?.model ?? "gemini-2.5-flash",
      promptSummary,
      promptTokens: result?.usage?.prompt_tokens ?? null,
      completionTokens: result?.usage?.completion_tokens ?? null,
      totalTokens: result?.usage?.total_tokens ?? null,
      responseTime,
      success: success ? 1 : 0,
      errorMessage: errorMessage ?? null,
    }).catch((err) => {
      console.error("[API Logging] Failed to record API log:", err);
    });
  }
}
