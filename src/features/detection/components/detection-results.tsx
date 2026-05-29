"use client";

import {
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { DetectionResult } from "../types/detection";

interface DetectionResultsProps {
  result: DetectionResult;
}

const gradeConfig = {
  excellent: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    label: "优秀",
  },
  good: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    label: "良好",
  },
  fair: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    label: "一般",
  },
  poor: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    label: "较差",
  },
  unknown: {
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: "未知",
  },
} as const;

function ScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80
      ? "stroke-emerald-500"
      : score >= 60
        ? "stroke-blue-500"
        : score >= 30
          ? "stroke-amber-500"
          : "stroke-red-500";

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold">{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function IndicatorCard({
  indicator,
}: {
  indicator: DetectionResult["indicators"][number];
}) {
  const config =
    gradeConfig[indicator.grade] || gradeConfig.unknown;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-sm">{indicator.label}</h4>
          <Badge variant="secondary" className={cn("text-xs", config.bg, config.color)}>
            {config.label}
          </Badge>
        </div>
        <Progress value={indicator.value} className="h-1.5 mb-2" />
        <p className="text-xs text-muted-foreground">{indicator.description}</p>
        {indicator.suggestion && (
          <p className="mt-2 text-xs text-primary/80 border-l-2 border-primary/30 pl-2">
            {indicator.suggestion}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function DetectionResults({ result }: DetectionResultsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 总体得分 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ScoreGauge score={result.overallScore} />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold mb-1">
                {result.domain}
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                AI 可见性综合评分
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {result.platformCoverage.map((pc) => (
                  <Badge
                    key={pc.platform}
                    variant={pc.mentioned ? "default" : "outline"}
                    className="gap-1"
                  >
                    {pc.mentioned ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {pc.platform}
                  </Badge>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                检测耗时 {(result.durationMs / 1000).toFixed(1)}s
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 各项指标 */}
      <div>
        <h3 className="font-semibold text-lg mb-3">详细指标</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.indicators.map((indicator) => (
            <IndicatorCard key={indicator.id} indicator={indicator} />
          ))}
        </div>
      </div>

      {/* 平台引用详情 */}
      {result.platformCoverage.some((pc) => pc.snippet) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI 平台引用详情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.platformCoverage
              .filter((pc) => pc.snippet)
              .map((pc) => (
                <div key={pc.platform} className="text-sm">
                  <span className="font-medium">{pc.platform}:</span>
                  <p className="mt-1 text-muted-foreground italic">
                    "{pc.snippet}"
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/10">
        <h3 className="font-semibold mb-2">
          想持续追踪你的 AI 可见性？
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          订阅即可获得每周自动报告、竞品对比和趋势分析。
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <a href="/sign-up">免费注册</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/#pricing">查看方案</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
