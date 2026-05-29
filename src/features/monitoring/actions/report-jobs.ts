import { and, eq, gte, lte, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "@/db";
import {
  user,
  monitoredKeyword,
  monitoringResult,
  alertRule,
  visibilityReport,
} from "@/db/schema";
import { inngest } from "@/inngest/client";
import { logger } from "@/lib/logger";
import { getResendClient, DEFAULT_FROM_EMAIL } from "@/features/mail/client";
import { WeeklyReportEmail } from "@/features/mail/templates/weekly-report-email";
import { VisibilityAlertEmail } from "@/features/mail/templates/visibility-alert-email";

/**
 * 生成周报
 * 每周一 UTC 9:00 执行
 */
export const generateWeeklyReports = inngest.createFunction(
  {
    id: "reports/weekly",
    retries: 2,
  },
  { cron: "0 9 * * 1" },
  async ({ step }) => {
    const users = await step.run("get-active-users", async () => {
      return db
        .select({ id: user.id, name: user.name, email: user.email })
        .from(user)
        .where(eq(user.banned, false))
        .limit(100);
    });

    for (const u of users) {
      await step.run(`report-user-${u.id}`, async () => {
        const keywords = await db
          .select()
          .from(monitoredKeyword)
          .where(
            and(
              eq(monitoredKeyword.userId, u.id),
              eq(monitoredKeyword.enabled, true),
            ),
          );

        if (keywords.length === 0) return { skipped: true, userId: u.id };

        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const keywordScores: Array<{
          keyword: string;
          score: number;
          change: number;
          trend: "up" | "down" | "stable";
        }> = [];

        for (const kw of keywords) {
          const thisWeek = await db
            .select({
              avgScore: sql<number>`ROUND(AVG(${monitoringResult.visibilityScore}))`,
            })
            .from(monitoringResult)
            .where(
              and(
                eq(monitoringResult.keywordId, kw.id),
                gte(monitoringResult.createdAt, oneWeekAgo),
                lte(monitoringResult.createdAt, now),
              ),
            );

          const lastWeek = await db
            .select({
              avgScore: sql<number>`ROUND(AVG(${monitoringResult.visibilityScore}))`,
            })
            .from(monitoringResult)
            .where(
              and(
                eq(monitoringResult.keywordId, kw.id),
                gte(monitoringResult.createdAt, twoWeeksAgo),
                lte(monitoringResult.createdAt, oneWeekAgo),
              ),
            );

          const score = thisWeek[0]?.avgScore ?? 0;
          const prevScore = lastWeek[0]?.avgScore ?? score;
          const change = score - prevScore;

          keywordScores.push({
            keyword: kw.keyword,
            score,
            change,
            trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
          });
        }

        const overallScore =
          keywordScores.reduce((sum, k) => sum + k.score, 0) / keywordScores.length || 0;
        const scoreChange =
          keywordScores.reduce((sum, k) => sum + k.change, 0) / keywordScores.length || 0;

        // 保存报告记录
        await db.insert(visibilityReport).values({
          id: nanoid(),
          userId: u.id,
          type: "weekly",
          reportData: {
            overallScore,
            scoreChange,
            keywords: keywordScores,
            generatedAt: now.toISOString(),
          },
          createdAt: now,
        });

        // 发送邮件
        if (u.email) {
          try {
            const resend = getResendClient();
            await resend.emails.send({
              from: DEFAULT_FROM_EMAIL,
              to: u.email,
              subject: `Weekly AI Visibility Report — Score: ${Math.round(overallScore)}/100`,
              react: WeeklyReportEmail({
                userName: u.name || u.email,
                keywords: keywordScores,
                overallScore: Math.round(overallScore),
                scoreChange: Math.round(scoreChange),
                reportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/monitoring`,
              }),
            });
          } catch (err) {
            logger.error({ userId: u.id, error: err }, "Failed to send weekly report email");
          }
        }

        return { userId: u.id, overallScore, keywordCount: keywords.length };
      });
    }

    return { usersProcessed: users.length };
  },
);

/**
 * 可见性下降告警检查
 * 每 6 小时执行一次
 */
export const checkVisibilityAlerts = inngest.createFunction(
  {
    id: "alerts/visibility-drop",
    retries: 1,
  },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const rules = await step.run("get-alert-rules", async () => {
      return db.select().from(alertRule).where(eq(alertRule.enabled, true));
    });

    for (const rule of rules) {
      await step.run(`check-rule-${rule.id}`, async () => {
        const now = new Date();
        const periodMs = rule.consecutiveWeeks * 7 * 24 * 60 * 60 * 1000;
        const oldPeriodMs = periodMs * 2;

        const recent = await db
          .select({
            avgScore: sql<number>`ROUND(AVG(${monitoringResult.visibilityScore}))`,
          })
          .from(monitoringResult)
          .where(
            and(
              eq(monitoringResult.keywordId, rule.keywordId),
              gte(monitoringResult.createdAt, new Date(now.getTime() - periodMs)),
            ),
          );

        const historical = await db
          .select({
            avgScore: sql<number>`ROUND(AVG(${monitoringResult.visibilityScore}))`,
          })
          .from(monitoringResult)
          .where(
            and(
              eq(monitoringResult.keywordId, rule.keywordId),
              gte(monitoringResult.createdAt, new Date(now.getTime() - oldPeriodMs)),
              lte(monitoringResult.createdAt, new Date(now.getTime() - periodMs)),
            ),
          );

        const recentScore = recent[0]?.avgScore ?? 0;
        const historicalScore = historical[0]?.avgScore ?? recentScore;

        if (historicalScore <= 0) return { skipped: true };

        const dropPercent =
          ((historicalScore - recentScore) / historicalScore) * 100;

        if (dropPercent >= rule.threshold) {
          const [kw] = await db
            .select({ keyword: monitoredKeyword.keyword })
            .from(monitoredKeyword)
            .where(eq(monitoredKeyword.id, rule.keywordId))
            .limit(1);

          const [u] = await db
            .select({ name: user.name, email: user.email })
            .from(user)
            .where(eq(user.id, rule.userId))
            .limit(1);

          if (u?.email && kw) {
            try {
              const resend = getResendClient();
              await resend.emails.send({
                from: DEFAULT_FROM_EMAIL,
                to: u.email,
                subject: `Alert: AI visibility dropped for "${kw.keyword}"`,
                react: VisibilityAlertEmail({
                  userName: u.name || u.email,
                  keyword: kw.keyword,
                  currentScore: recentScore,
                  previousScore: historicalScore,
                  dropPercent: Math.round(dropPercent),
                  dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/monitoring`,
                }),
              });
            } catch (err) {
              logger.error(
                { userId: rule.userId, error: err },
                "Failed to send alert email",
              );
            }
          }
        }

        return { checked: true, dropPercent: Math.round(dropPercent) };
      });
    }

    return { rulesChecked: rules.length };
  },
);

export const reportFunctions = [generateWeeklyReports, checkVisibilityAlerts];
