"use client";

import { Search, Loader2, Globe, AlertCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { DetectionResult } from "../types/detection";

interface DetectionFormProps {
  onDetect?: (domain: string) => Promise<DetectionResult>;
  onResult?: (result: DetectionResult) => void;
  onError?: (error: string) => void;
}

export function DetectionForm({
  onDetect,
  onResult,
  onError,
}: DetectionFormProps) {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");

    if (!trimmed) {
      setError("请输入域名");
      return;
    }

    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(trimmed)) {
      setError("请输入有效的域名，如 example.com");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (onDetect) {
        const result = await onDetect(trimmed);
        onResult?.(result);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "检测失败，请稍后重试";
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              if (error) setError(null);
            }}
            placeholder="输入你的域名，如 example.com"
            className="pl-10 h-12 text-base"
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 px-8 text-base shrink-0"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              检测中...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              照一照
            </>
          )}
        </Button>
      </div>
      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        免费检测，无需注册。支持任意可访问的域名。
      </p>
    </form>
  );
}
