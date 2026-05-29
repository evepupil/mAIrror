/**
 * 订阅计划权限配置
 *
 * 定义各订阅计划的监测权限和功能访问限制
 */

import { PRICE_IDS } from "./payment";

// ============================================
// 计划类型定义
// ============================================

/**
 * 订阅计划类型
 */
export type SubscriptionPlan = "free" | "starter" | "pro" | "ultra";

/**
 * 监测频率
 */
export type MonitoringFrequency = "none" | "weekly" | "daily";

/**
 * 计划特权配置
 */
export interface PlanPrivileges {
  /** 计划名称 */
  name: string;
  /** 可监测的关键词数量 */
  maxKeywords: number;
  /** 可添加的竞品数量 */
  maxCompetitors: number;
  /** 监测频率 */
  frequency: MonitoringFrequency;
  /** 趋势历史保留天数 */
  historyDays: number;
  /** 周报推送 */
  weeklyReport: boolean;
  /** 竞品分析报告 */
  competitorReport: boolean;
  /** 就绪度审计 */
  readinessAudit: boolean;
  /** 告警通知 */
  alerts: boolean;
  /** API 接入 */
  apiAccess: boolean;
  /** 白标报告 */
  whiteLabel: boolean;
}

// ============================================
// 计划特权配置
// ============================================

/**
 * 各计划的特权配置
 */
export const PLAN_PRIVILEGES: Record<SubscriptionPlan, PlanPrivileges> = {
  free: {
    name: "Free",
    maxKeywords: 0,
    maxCompetitors: 0,
    frequency: "none",
    historyDays: 1,
    weeklyReport: false,
    competitorReport: false,
    readinessAudit: false,
    alerts: false,
    apiAccess: false,
    whiteLabel: false,
  },
  starter: {
    name: "Basic",
    maxKeywords: 3,
    maxCompetitors: 0,
    frequency: "weekly",
    historyDays: 90,
    weeklyReport: true,
    competitorReport: false,
    readinessAudit: false,
    alerts: true,
    apiAccess: false,
    whiteLabel: false,
  },
  pro: {
    name: "Pro",
    maxKeywords: 10,
    maxCompetitors: 3,
    frequency: "weekly",
    historyDays: 365,
    weeklyReport: true,
    competitorReport: true,
    readinessAudit: true,
    alerts: true,
    apiAccess: false,
    whiteLabel: false,
  },
  ultra: {
    name: "Enterprise",
    maxKeywords: 30,
    maxCompetitors: 10,
    frequency: "daily",
    historyDays: 365 * 10,
    weeklyReport: true,
    competitorReport: true,
    readinessAudit: true,
    alerts: true,
    apiAccess: true,
    whiteLabel: true,
  },
};

// ============================================
// Price ID 到计划的映射
// ============================================

/**
 * 根据 Price ID 获取计划类型
 */
export function getPlanFromPriceId(priceId: string): SubscriptionPlan | null {
  if (
    priceId === PRICE_IDS.STARTER_MONTHLY ||
    priceId === PRICE_IDS.STARTER_YEARLY
  ) {
    return "starter";
  }

  if (
    priceId === PRICE_IDS.PRO_MONTHLY ||
    priceId === PRICE_IDS.PRO_YEARLY
  ) {
    return "pro";
  }

  if (
    priceId === PRICE_IDS.ULTRA_MONTHLY ||
    priceId === PRICE_IDS.ULTRA_YEARLY
  ) {
    return "ultra";
  }

  return null;
}

// ============================================
// 特权检查工具函数
// ============================================

export function getPlanPrivileges(plan: SubscriptionPlan): PlanPrivileges {
  return PLAN_PRIVILEGES[plan];
}

export function getUpgradeMessage(
  currentPlan: SubscriptionPlan,
  requiredFeature: string,
): string {
  const upgradeTo =
    currentPlan === "free"
      ? "Basic"
      : currentPlan === "starter"
        ? "Pro"
        : "Enterprise";

  return `${requiredFeature} requires ${upgradeTo} plan or higher. Please upgrade to continue.`;
}
