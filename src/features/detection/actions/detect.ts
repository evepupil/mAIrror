"use server";

import OpenAI from "openai";
import { actionClient } from "@/lib/safe-action";
import { detectDomainSchema } from "../schemas/detect";
import type { DetectionIndicator, DetectionResult } from "../types/detection";

const DETECTION_PROMPT = `You are an AI brand visibility auditor. Analyze the brand at the domain {domain} and return a JSON response about its AI search visibility.

Query multiple perspectives about this brand:
1. How well-known and cited is this brand in your training data?
2. What are the main topics, products, or services associated with this brand?
3. How would you evaluate the brand's technical readiness for AI agent discovery (structured data, content quality, clear messaging)?

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "overallScore": number (0-100),
  "indicators": [
    {
      "id": "brand_awareness",
      "label": "Brand Awareness",
      "value": number (0-100),
      "grade": "excellent" | "good" | "fair" | "poor",
      "description": "1-2 sentence assessment"
    },
    {
      "id": "ai_citation_rate",
      "label": "AI Citation Rate",
      "value": number (0-100),
      "grade": "excellent" | "good" | "fair" | "poor",
      "description": "1-2 sentence assessment"
    },
    {
      "id": "sentiment",
      "label": "Brand Sentiment",
      "value": number (0-100),
      "grade": "excellent" | "good" | "fair" | "poor",
      "description": "1-2 sentence assessment"
    },
    {
      "id": "content_quality",
      "label": "Content Quality",
      "value": number (0-100),
      "grade": "excellent" | "good" | "fair" | "poor",
      "description": "1-2 sentence assessment"
    },
    {
      "id": "technical_readiness",
      "label": "Technical Readiness",
      "value": number (0-100),
      "grade": "excellent" | "good" | "fair" | "poor",
      "description": "1-2 sentence assessment"
    },
    {
      "id": "competitiveness",
      "label": "Competitive Position",
      "value": number (0-100),
      "grade": "excellent" | "good" | "fair" | "poor",
      "description": "1-2 sentence assessment"
    }
  ],
  "platformCoverage": [
    { "platform": "ChatGPT", "mentioned": boolean, "snippet": "what AI says" },
    { "platform": "Perplexity", "mentioned": boolean, "snippet": "what AI says" }
  ]
}`;

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

function generateSuggestion(
  indicator: DetectionIndicator,
): string {
  const suggestions: Record<string, string> = {
    brand_awareness:
      "提升品牌知名度：发布高质量行业内容，参与行业会议，建立社交媒体存在感。",
    ai_citation_rate:
      "提升 AI 引用率：完善 llms.txt 文件，优化结构化数据（JSON-LD），确保核心页面内容清晰完整。",
    sentiment:
      "改善品牌情感：主动管理在线声誉，回应负面反馈，发布正面案例和客户成功故事。",
    content_quality:
      "提升内容质量：确保网站内容结构清晰、信息完整，使用语义化 HTML，定期更新关键页面。",
    technical_readiness:
      "提升技术就绪度：添加 llms.txt，完善 robots.txt，实现 JSON-LD 结构化数据，优化 Core Web Vitals。",
    competitiveness:
      "提升竞争地位：分析竞品 AI 可见性策略，差异化定位，强化独特价值主张。",
  };
  return suggestions[indicator.id] || "";
}

function getGrade(value: number): DetectionIndicator["grade"] {
  if (value >= 80) return "excellent";
  if (value >= 60) return "good";
  if (value >= 30) return "fair";
  return "poor";
}

function parseAIResponse(raw: string): {
  overallScore: number;
  indicators: DetectionIndicator[];
  platformCoverage: DetectionResult["platformCoverage"];
} {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("AI response could not be parsed as JSON");
  }

  if (
    typeof parsed.overallScore !== "number" ||
    !Array.isArray(parsed.indicators)
  ) {
    throw new Error("AI response missing required fields");
  }

  const indicators: DetectionIndicator[] = (
    parsed.indicators as Array<Record<string, unknown>>
  ).map((item) => ({
    id: String(item.id || ""),
    label: String(item.label || ""),
    value: Math.min(100, Math.max(0, Number(item.value) || 0)),
    grade: getGrade(Math.min(100, Math.max(0, Number(item.value) || 0))),
    description: String(item.description || ""),
    suggestion: "",
  }));

  for (const indicator of indicators) {
    indicator.suggestion = generateSuggestion(indicator);
  }

  const platformCoverage: DetectionResult["platformCoverage"] =
    Array.isArray(parsed.platformCoverage)
      ? (parsed.platformCoverage as Array<Record<string, unknown>>).map(
          (pc) => ({
            platform: String(pc.platform || ""),
            mentioned: Boolean(pc.mentioned),
            snippet: pc.snippet ? String(pc.snippet) : undefined,
          }),
        )
      : [];

  return {
    overallScore: Math.min(
      100,
      Math.max(0, Number(parsed.overallScore) || 0),
    ),
    indicators,
    platformCoverage,
  };
}

export const detectDomain = actionClient
  .metadata({ action: "detection.detectDomain" })
  .schema(detectDomainSchema)
  .action(async ({ parsedInput: { domain } }) => {
    const startTime = Date.now();

    const openai = getOpenAI();

    const prompt = DETECTION_PROMPT.replace(/{domain}/g, domain);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI brand visibility auditor. Always return valid JSON exactly as requested.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const raw = response.choices[0]?.message?.content || "";
    const parsed = parseAIResponse(raw);

    const durationMs = Date.now() - startTime;

    const result: DetectionResult = {
      domain,
      timestamp: new Date().toISOString(),
      overallScore: parsed.overallScore,
      indicators: parsed.indicators,
      platformCoverage: parsed.platformCoverage,
      durationMs,
    };

    return result;
  });
