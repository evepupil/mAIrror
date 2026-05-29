/**
 * 站点配置
 *
 * 集中管理站点的基本信息，用于 SEO、元数据、页脚等
 */
export const siteConfig = {
  /** 站点名称 */
  name: "mairror",

  /** 站点描述 */
  description:
    "AI Brand Visibility Monitoring — see how AI search engines describe your brand, compare with competitors, and get actionable improvement plans.",

  /** 站点 URL (生产环境) */
  url: process.env.NEXT_PUBLIC_APP_URL || "https://mairror.com",

  /** OG 图片 URL */
  ogImage: "/og-image.png",

  /** 作者信息 */
  author: {
    name: "mairror Team",
    url: "https://mairror.com",
    email: "hello@mairror.com",
  },

  /** 社交链接 */
  links: {
    twitter: "https://twitter.com/mairrorhq",
    github: "https://github.com/mairrorhq/mairror",
    discord: "https://discord.gg/mairror",
  },

  /** 关键词 (SEO) */
  keywords: [
    "AI visibility",
    "AI search",
    "brand monitoring",
    "AI brand audit",
    "AI SEO",
    "Perplexity optimization",
    "competitor analysis",
    "LLM optimization",
  ],
} as const;

/**
 * 站点配置类型
 */
export type SiteConfig = typeof siteConfig;
