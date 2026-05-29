import {
  Bot,
  Coins,
  CreditCard,
  Globe,
  Headset,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Shield,
  Ticket,
  Users,
  Zap,
} from "lucide-react";

/**
 * 导航链接类型
 */
export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: LucideIcon;
  description?: string;
}

/**
 * 导航分组类型
 */
export interface NavGroup {
  title: string;
  items: NavItem[];
}

/**
 * Products 下拉菜单项类型
 */
export interface ProductNavItem {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Products 下拉菜单分组类型
 */
export interface ProductNavGroup {
  title: string;
  items: ProductNavItem[];
}

// ============================================
// Marketing 导航配置
// ============================================

/**
 * Products 下拉菜单内容
 */
export const productsNav: ProductNavGroup[] = [
  {
    title: "Monitor",
    items: [
      {
        title: "Brand Detection",
        href: "/#features",
        description: "Real-time AI search visibility scan",
        icon: Shield,
      },
      {
        title: "Competitive Analysis",
        href: "/#features",
        description: "Compare with competitors side by side",
        icon: CreditCard,
      },
      {
        title: "Weekly Reports",
        href: "/#features",
        description: "Automated monitoring & trend tracking",
        icon: Coins,
      },
    ],
  },
  {
    title: "Improve",
    items: [
      {
        title: "Readiness Audit",
        href: "/#features",
        description: "Technical audit for AI agent friendliness",
        icon: Zap,
      },
      {
        title: "Content Optimization",
        href: "/#features",
        description: "Structured data & AI content strategy",
        icon: Globe,
      },
      {
        title: "Consulting",
        href: "/#features",
        description: "Expert improvement plans & execution",
        icon: Bot,
      },
    ],
  },
];

/**
 * 主导航链接 (Header)
 */
export const mainNav: NavItem[] = [
  { title: "Docs", href: "/docs" },
  { title: "Pricing", href: "/#pricing" },
  { title: "Blog", href: "/blog" },
];

/**
 * Footer 导航配置
 */
export const footerNav = {
  /** 产品 (Product) */
  product: [
    { title: "Pricing", href: "/#pricing" },
    { title: "Changelog", href: "/blog" },
    { title: "Contact Us", href: "mailto:hello@example.com" },
  ] as NavItem[],

  /** 法律 (Legal) */
  legal: [
    { title: "Terms of Service", href: "/legal/terms" },
    { title: "Privacy Policy", href: "/legal/privacy" },
    { title: "Cookie Policy", href: "/legal/cookie-policy" },
  ] as NavItem[],
};

// ============================================
// Dashboard 导航配置
// ============================================

/**
 * Dashboard 侧边栏导航分组
 */
export const dashboardNav: NavGroup[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Credits",
        href: "/dashboard/credits",
        icon: Coins,
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
      {
        title: "Support",
        href: "/dashboard/support",
        icon: Headset,
      },
    ],
  },
];

// ============================================
// Admin 导航配置
// ============================================

/**
 * Admin 侧边栏导航分组
 */
export const adminNav: NavGroup[] = [
  {
    title: "管理中心",
    items: [
      {
        title: "控制面板",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        title: "用户管理",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "工单管理",
        href: "/admin/tickets",
        icon: Ticket,
      },
    ],
  },
];

// ============================================
// 导出配置对象
// ============================================

/**
 * Marketing 页面配置
 */
export const marketingConfig = {
  mainNav,
  footerNav,
};

/**
 * Dashboard 页面配置
 */
export const dashboardConfig = {
  sidebarNav: dashboardNav,
};

/**
 * Admin 页面配置
 */
export const adminConfig = {
  sidebarNav: adminNav,
};
