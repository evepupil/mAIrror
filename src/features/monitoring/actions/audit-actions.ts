"use server";

import OpenAI from "openai";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

import { db } from "@/db";
import { auditResult } from "@/db/schema";
import { protectedAction } from "@/lib/safe-action";

const AUDIT_PROMPT = `Audit the website {domain} for AI agent friendliness. Check these 5 dimensions:

1. llms.txt — Does the site have an llms.txt file? Is it properly formatted?
2. robots.txt — Does robots.txt have AI-related directives?
3. JSON-LD — Does the site have structured data (Organization, WebSite, Article)?
4. Core Web Vitals — General assessment of page performance
5. Content Summarizability — How well can AI agents summarize this site's content?

Return ONLY valid JSON (no markdown):
{
  "overallScore": number (0-100),
  "dimensions": [
    {
      "id": "llms_txt",
      "label": "llms.txt",
      "score": number (0-100),
      "status": "pass" | "fail" | "partial",
      "finding": "description of what was found",
      "recommendation": "how to fix or improve"
    },
    {
      "id": "robots_txt",
      "label": "robots.txt",
      "score": number (0-100),
      "status": "pass" | "fail" | "partial",
      "finding": "description",
      "recommendation": "how to fix or improve"
    },
    {
      "id": "json_ld",
      "label": "Structured Data",
      "score": number (0-100),
      "status": "pass" | "fail" | "partial",
      "finding": "description",
      "recommendation": "how to fix or improve"
    },
    {
      "id": "core_web_vitals",
      "label": "Core Web Vitals",
      "score": number (0-100),
      "status": "pass" | "fail" | "partial",
      "finding": "description",
      "recommendation": "how to fix or improve"
    },
    {
      "id": "content_summarizability",
      "label": "Content Summarizability",
      "score": number (0-100),
      "status": "pass" | "fail" | "partial",
      "finding": "description",
      "recommendation": "how to fix or improve"
    }
  ]
}`;

interface AuditDimension {
  id: string;
  label: string;
  score: number;
  status: "pass" | "fail" | "partial";
  finding: string;
  recommendation: string;
}

interface AuditData {
  overallScore: number;
  dimensions: AuditDimension[];
}

const auditInputSchema = z.object({
  domain: z
    .string()
    .min(1, "请输入域名")
    .regex(
      /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      "请输入有效的域名格式",
    ),
});

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

export const runAuditAction = protectedAction
  .metadata({ action: "audit.run" })
  .schema(auditInputSchema)
  .action(async ({ parsedInput: { domain }, ctx }) => {
    const openai = getOpenAI();
    const prompt = AUDIT_PROMPT.replace(/{domain}/g, domain);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a website AI readiness auditor. Return only valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const raw = (response.choices[0]?.message?.content || "")
      .replace(/^```(?:json)?\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    let parsed: AuditData;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Failed to parse audit results");
    }

    if (
      typeof parsed.overallScore !== "number" ||
      !Array.isArray(parsed.dimensions)
    ) {
      throw new Error("Invalid audit response format");
    }

    const auditData = {
      domain,
      overallScore: Math.min(100, Math.max(0, parsed.overallScore)),
      dimensions: parsed.dimensions.map((d: AuditDimension) => ({
        ...d,
        score: Math.min(100, Math.max(0, d.score)),
      })),
      auditedAt: new Date().toISOString(),
    };

    const id = nanoid();
    await db.insert(auditResult).values({
      id,
      userId: ctx.userId,
      domain,
      auditData: auditData as unknown as Record<string, unknown>,
      overallScore: auditData.overallScore,
    });

    return { id, ...auditData };
  });

export const getAuditResultsAction = protectedAction
  .metadata({ action: "audit.results" })
  .action(async ({ ctx }) => {
    return db
      .select()
      .from(auditResult)
      .where(eq(auditResult.userId, ctx.userId))
      .orderBy(desc(auditResult.createdAt));
  });

export const getAuditResultsForUserAction = protectedAction
  .metadata({ action: "audit.userResults" })
  .action(async () => {
    // Intentionally empty - uses ctx from middleware. Will be implemented when DB is connected.
    return [];
  });
