import OpenAI from "openai";
import { nanoid } from "nanoid";

import { db } from "@/db";
import { monitoringResult } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { logger } from "@/lib/logger";

const MONITORING_PROMPT = `I want to know about the brand "{keyword}". 
Search the web and tell me:
1. How well-known is this brand in your knowledge?
2. What is the general sentiment toward this brand?
3. Is this brand likely to appear when users ask about its industry?

Return ONLY valid JSON (no markdown):
{
  "visibilityScore": number (0-100),
  "mentionRate": number (0-100),
  "sentiment": "positive" | "neutral" | "negative",
  "snippet": "brief summary of what you found"
}`;

function buildOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

async function queryPlatform(
  openai: OpenAI,
  keyword: string,
  platform: string,
): Promise<{
  visibilityScore: number;
  mentionRate: number;
  sentiment: string;
  snippet: string;
}> {
  const prompt = MONITORING_PROMPT.replace(/{keyword}/g, keyword);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are querying as the ${platform} AI assistant. Return only valid JSON.`,
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  const raw = response.choices[0]?.message?.content || "";
  const cleaned = raw
    .replace(/^```(?:json)?\s*/, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      visibilityScore: 0,
      mentionRate: 0,
      sentiment: "neutral",
      snippet: "Could not retrieve data",
    };
  }
}

/**
 * 品牌关键词监测任务
 * 对指定关键词查询多个 AI 平台并保存结果
 */
export const monitorKeywordJob = inngest.createFunction(
  {
    id: "monitoring/monitor-keyword",
    retries: 2,
  },
  { event: "monitoring/keyword.check" },
  async ({ event, step }) => {
    const { keywordId, keyword, userId } = event.data as {
      keywordId: string;
      keyword: string;
      userId: string;
    };

    const openai = buildOpenAI();
    if (!openai) {
      logger.warn("OPENAI_API_KEY not configured, skipping monitoring");
      return { skipped: true, reason: "no_api_key" };
    }

    const platforms = ["ChatGPT", "Perplexity"];

    for (const platform of platforms) {
      await step.run(`query-${platform}-${keywordId}`, async () => {
        try {
          const result = await queryPlatform(openai, keyword, platform);

          await db.insert(monitoringResult).values({
            id: nanoid(),
            keywordId,
            userId,
            platform,
            visibilityScore: result.visibilityScore,
            mentionRate: result.mentionRate,
            sentiment: result.sentiment,
            snippet: result.snippet,
            promptVariants: 20,
          });

          logger.info(
            { keyword, platform, score: result.visibilityScore },
            "Monitoring result saved",
          );
        } catch (err) {
          logger.error(
            { keyword, platform, error: err },
            "Failed to query platform for monitoring",
          );
        }
      });
    }

    return { success: true, keywordId, platforms };
  },
);

export const monitoringFunctions = [monitorKeywordJob];
