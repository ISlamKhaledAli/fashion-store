import { Response } from "express";
import { env } from "../utils/validateEnv";
import logger from "../utils/logger";

export const GEMINI_OPENAI_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const AI_MODELS = {
  HAIKU_3: "anthropic/claude-3-haiku",
  HAIKU_3_5: "anthropic/claude-haiku-4.5",
  HAIKU_4_5: "anthropic/claude-haiku-4.5",
  PRO: "anthropic/claude-haiku-4.5",
} as const;

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: any;
  name?: string;
  tool_call_id?: string;
  tool_calls?: any[];
}

export interface OpenRouterPayload {
  model: string;
  messages: OpenRouterMessage[];
  tools?: any[];
  tool_choice?: any;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

export interface CallOpenRouterOptions {
  title?: string;
  signal?: AbortSignal;
}

/**
 * Returns standard OpenRouter HTTP request headers
 */
export function getOpenRouterHeaders(
  title = "The Curator AI"
): Record<string, string> {
  return {
    Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": env.CLIENT_URL || "http://localhost:3000",
    "X-Title": title,
  };
}

/**
 * Executes a chat completions request via OpenRouter with ultra-fast latency (<1s),
 * with fallback safety.
 */
export async function callOpenRouter(
  payload: OpenRouterPayload,
  options: CallOpenRouterOptions = {}
): Promise<globalThis.Response> {
  // Ensure model is valid for OpenRouter
  let targetModel = payload.model;
  if (
    !targetModel ||
    targetModel.startsWith("gemini-") ||
    targetModel.includes("claude-3.5-haiku")
  ) {
    targetModel = "anthropic/claude-3-haiku";
  }

  const openRouterPayload = {
    ...payload,
    model: targetModel,
  };

  const headers = getOpenRouterHeaders(options.title);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(openRouterPayload),
      signal: options.signal,
    });

    if (response.ok) {
      return response;
    }

    const errorText = await response.text();
    logger.warn("OpenRouter request returned non-OK status", {
      status: response.status,
      errorText,
    });

    // Fallback to Google Gemini only if a valid AI Studio key (starts with AIzaSy) is configured
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.startsWith("AIzaSy")) {
      logger.info("Attempting fallback to Gemini API...");
      const geminiResponse = await fetch(GEMINI_OPENAI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          model: "gemini-2.0-flash",
        }),
        signal: options.signal,
      });

      if (geminiResponse.ok) {
        return geminiResponse;
      }
    }

    // Return original response if fallback not viable
    return new globalThis.Response(errorText, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    logger.error("Error dispatching AI completions request", { error: err });
    throw err;
  }
}

export const callAiService = callOpenRouter;

/**
 * Pipes an SSE stream from a fetch Response body to an Express Response
 */
export async function pipeSseStream(
  streamBody: any,
  res: Response
): Promise<void> {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  try {
    if (streamBody) {
      if (typeof streamBody.getReader === "function") {
        const reader = streamBody.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
          if (typeof (res as any).flush === "function") {
            (res as any).flush();
          }
        }
      } else {
        for await (const chunk of streamBody) {
          res.write(chunk);
          if (typeof (res as any).flush === "function") {
            (res as any).flush();
          }
        }
      }
    }
  } catch (streamError) {
    logger.error("Error in AI SSE stream transmission", { error: streamError });
  } finally {
    res.end();
  }
}
