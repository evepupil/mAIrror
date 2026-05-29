"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { z } from "zod";

import { db } from "@/db";
import { competitor, competitorResult } from "@/db/schema";
import { protectedAction } from "@/lib/safe-action";

const addCompetitorSchema = z.object({
  domain: z.string().min(1, "请输入域名"),
  label: z.string().optional(),
});

export const addCompetitorAction = protectedAction
  .metadata({ action: "competitor.add" })
  .schema(addCompetitorSchema)
  .action(async ({ parsedInput: { domain, label }, ctx }) => {
    const existing = await db
      .select({ id: competitor.id })
      .from(competitor)
      .where(
        and(
          eq(competitor.userId, ctx.userId),
          eq(competitor.domain, domain),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error("This competitor is already being tracked.");
    }

    const id = nanoid();
    await db.insert(competitor).values({
      id,
      userId: ctx.userId,
      domain,
      label: label || null,
      enabled: true,
    });

    revalidatePath("/dashboard/monitoring");

    return { id, domain };
  });

export const removeCompetitorAction = protectedAction
  .metadata({ action: "competitor.remove" })
  .schema(z.object({ competitorId: z.string().min(1) }))
  .action(async ({ parsedInput: { competitorId }, ctx }) => {
    await db
      .delete(competitor)
      .where(
        and(
          eq(competitor.id, competitorId),
          eq(competitor.userId, ctx.userId),
        ),
      );

    revalidatePath("/dashboard/monitoring");

    return { success: true };
  });

export const getCompetitorsAction = protectedAction
  .metadata({ action: "competitor.list" })
  .action(async ({ ctx }) => {
    return db
      .select()
      .from(competitor)
      .where(eq(competitor.userId, ctx.userId));
  });

export const getCompetitorResultsAction = protectedAction
  .metadata({ action: "competitor.results" })
  .schema(z.object({ keywordId: z.string().min(1) }))
  .action(async ({ parsedInput: { keywordId }, ctx }) => {
    return db
      .select()
      .from(competitorResult)
      .where(
        and(
          eq(competitorResult.userId, ctx.userId),
          eq(competitorResult.keywordId, keywordId),
        ),
      )
      .orderBy(competitorResult.createdAt);
  });
