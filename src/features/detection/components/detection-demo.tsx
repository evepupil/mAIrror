"use client";

import { useState } from "react";

import type { DetectionResult } from "../types/detection";
import { DetectionForm } from "./detection-form";
import { DetectionResults } from "./detection-results";
import { detectDomain } from "../actions/detect";

interface DetectionDemoProps {
  className?: string;
}

export function DetectionDemo({ className }: DetectionDemoProps) {
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDetect = async (domain: string): Promise<DetectionResult> => {
    const actionResult = await detectDomain({ domain });
    if (actionResult && "serverError" in actionResult) {
      throw new Error(
        typeof actionResult.serverError === "string"
          ? actionResult.serverError
          : "检测服务暂不可用",
      );
    }
    return actionResult.data as DetectionResult;
  };

  return (
    <div className={className}>
      <div className="mb-8">
        <DetectionForm
          onDetect={handleDetect}
          onResult={setResult}
          onError={setError}
        />
      </div>

      {error && !result && (
        <div className="text-center p-6 bg-destructive/5 rounded-xl border border-destructive/10">
          <p className="text-sm text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">
            请检查域名是否正确，或稍后重试。检测服务需要有效的 API Key 配置。
          </p>
        </div>
      )}

      {result && <DetectionResults result={result} />}
    </div>
  );
}
