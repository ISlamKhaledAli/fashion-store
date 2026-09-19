import { Response } from "express";
import { env } from "../utils/validateEnv";
import logger from "../utils/logger";

export const GEMINI_OPENAI_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const AI_MODELS = {
  HAIKU_3: env.GEMINI_API_KEY ? "gemini-3.6-flash" : "anthropic/claude-3-haiku",
  HAIKU_3_5: env.GEMINI_API_KEY
    ? "gemini-3.6-flash"
    : "anthropic/claude-3.5-haiku",
  HAIKU_4_5: env.GEMINI_API_KEY
    ? "gemini-3.6-flash"
    : "anthropic/claude-haiku-4.5",
  PRO: env.GEMINI_API_KEY ? "gemini-2.5-pro" : "anthropic/claude-3.5-sonnet",
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
 * Executes a chat completions request with Google Gemini as primary engine,
 * and automatic fallback to OpenRouter if Gemini encounters any issue.
 */
export async function callOpenRouter(
  payload: OpenRouterPayload,
  options: CallOpenRouterOptions = {}
): Promise<globalThis.Response> {
  const useGemini = Boolean(env.GEMINI_API_KEY);

  if (useGemini) {
    try {
      const geminiModel = payload.model.startsWith("gemini-")
        ? payload.model
        : "gemini-3.6-flash";

      const geminiPayload = {
        ...payload,
        model: geminiModel,
      };

      const response = await fetch(GEMINI_OPENAI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(geminiPayload),
        signal: options.signal,
      });

      if (response.ok) {
        return response;
      }

      const errorText = await response.text();
      logger.warn(
        "Primary Gemini request returned non-OK status, falling back to OpenRouter",
        {
          status: response.status,
          errorText,
        }
      );
    } catch (geminiErr) {
      logger.warn(
        "Primary Gemini request encountered an exception, falling back to OpenRouter",
        {
          error: geminiErr,
        }
      );
    }
  }

  // Fallback to OpenRouter
  const headers = getOpenRouterHeaders(options.title);
  return fetch(OPENROUTER_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal: options.signal,
  });
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
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    if (streamBody) {
      if (typeof streamBody.getReader === "function") {
        const reader = streamBody.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      } else {
        for await (const chunk of streamBody) {
          res.write(chunk);
        }
      }
    }
  } catch (streamError) {
    logger.error("Error in AI SSE stream transmission", { error: streamError });
  } finally {
    res.end();
  }
}
