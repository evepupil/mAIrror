"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { z } from "zod";

import { db } from "@/db";
import {
  monitoredKeyword,
  monitoringResult,
} from "@/db/schema";
import { protectedAction } from "@/lib/safe-action";
import { getPlanPrivileges } from "@/config/subscription-plan";
import { getUserPlan } from "@/features/subscription";

import { addKeywordSchema } from "./schemas";

export const addKeywordAction = protectedAction
  .metadata({ action: "monitoring.addKeyword" })
  .schema(addKeywordSchema)
  .action(async ({ parsedInput: { keyword }, ctx }) => {
    const { plan } = await getUserPlan(ctx.userId);
    const priv = getPlanPrivileges(plan);

    if (priv.maxKeywords <= 0) {
      throw new Error("Your plan does not support keyword monitoring. Please upgrade.");
    }

    const existing = await db
      .select({ id: monitoredKeyword.id })
      .from(monitoredKeyword)
      .where(
        and(
          eq(monitoredKeyword.userId, ctx.userId),
          eq(monitoredKeyword.keyword, keyword),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error("This keyword is already being monitored.");
    }

    const count = await db
      .select()
      .from(monitoredKeyword)
      .where(eq(monitoredKeyword.userId, ctx.userId));

    if (count.length >= priv.maxKeywords) {
      throw new Error(
        `Keyword limit (${priv.maxKeywords}) reached. Please upgrade to add more.`,
      );
    }

    const id = nanoid();
    await db.insert(monitoredKeyword).values({
      id,
      userId: ctx.userId,
      keyword,
      enabled: true,
    });

    revalidatePath("/dashboard/monitoring");

    return { id, keyword };
  });

export const removeKeywordAction = protectedAction
  .metadata({ action: "monitoring.removeKeyword" })
  .schema(z.object({ keywordId: z.string().min(1) }))
  .action(async ({ parsedInput: { keywordId }, ctx }) => {
    await db
      .delete(monitoredKeyword)
      .where(
        and(
          eq(monitoredKeyword.id, keywordId),
          eq(monitoredKeyword.userId, ctx.userId),
        ),
      );

    revalidatePath("/dashboard/monitoring");

    return { success: true };
  });

export const getKeywordsAction = protectedAction
  .metadata({ action: "monitoring.getKeywords" })
  .action(async ({ ctx }) => {
    const keywords = await db
      .select()
      .from(monitoredKeyword)
      .where(eq(monitoredKeyword.userId, ctx.userId))
      .orderBy(desc(monitoredKeyword.createdAt));

    return keywords;
  });

export const getMonitoringResultsAction = protectedAction
  .metadata({ action: "monitoring.getResults" })
  .action(async ({ ctx }) => {
    const results = await db
      .select()
      .from(monitoringResult)
      .where(eq(monitoringResult.userId, ctx.userId))
      .orderBy(desc(monitoringResult.createdAt))
      .limit(50);

    return results;
  });
