export interface DetectionIndicator {
  /** 指标唯一 ID */
  id: string;
  /** 指标名称 */
  label: string;
  /** 指标值 (百分比 0-100) */
  value: number;
  /** 评分等级 */
  grade: "excellent" | "good" | "fair" | "poor" | "unknown";
  /** 详细说明 */
  description: string;
  /** 改进建议 */
  suggestion?: string;
}

export interface DetectionResult {
  /** 被检测的域名 */
  domain: string;
  /** 检测时间戳 */
  timestamp: string;
  /** 总体可见性得分 (0-100) */
  overallScore: number;
  /** 各项指标 */
  indicators: DetectionIndicator[];
  /** AI 平台覆盖 */
  platformCoverage: {
    platform: string;
    mentioned: boolean;
    snippet?: string | undefined;
  }[];
  /** 检测所耗毫秒 */
  durationMs: number;
}

export interface DetectionFormState {
  domain: string;
  status: "idle" | "loading" | "success" | "partial" | "error";
  result?: DetectionResult;
  error?: string;
}
