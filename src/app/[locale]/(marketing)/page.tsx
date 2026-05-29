import type { Metadata } from "next";

import { siteConfig } from "@/config";
import { SiteJsonLd, SoftwareAppJsonLd } from "@/components/seo/json-ld";
import { DetectionDemo } from "@/features/detection";
import {
  CTASection,
  FAQSection,
  FeatureGrid,
  HeroSection,
  HowItWorks,
  PricingSection,
  Testimonials,
  UseCasesSection,
} from "@/features/marketing/components";

/**
 * 生成首页 Metadata
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  const title = isZh
    ? "mairror - AI 品牌可见性监测"
    : "mairror - AI Brand Visibility Monitoring";

  const description = isZh
    ? "输入你的域名，10秒内获取 AI 可见性报告。了解 ChatGPT、Perplexity 等 AI 平台如何描述你的品牌，追踪竞品变化，获取可执行的优化方案。"
    : "Enter your domain and get an AI visibility report in under 10 seconds. See how ChatGPT, Perplexity, and other AI platforms describe your brand, track competitors, and get actionable improvement plans.";

  return {
    title,
    description,
    keywords: [
      "AI visibility",
      "brand monitoring",
      "AI search",
      "Perplexity optimization",
      "AI brand audit",
      ...(isZh
        ? ["AI可见性", "品牌监测", "AI搜索引擎", "品牌审计"]
        : []),
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteConfig.url}/${locale}`,
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteConfig.url}${siteConfig.ogImage}`,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteConfig.url}${siteConfig.ogImage}`],
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      {/* JSON-LD Structured Data */}
      <SiteJsonLd locale={locale as "en" | "zh"} />
      <SoftwareAppJsonLd locale={locale as "en" | "zh"} />

      {/* Page Sections */}
      <HeroSection />
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              免费检测你的 AI 可见性
            </h2>
            <p className="text-muted-foreground text-lg">
              输入域名，10 秒内查看品牌在 AI 平台的表现
            </p>
          </div>
          <DetectionDemo />
        </div>
      </section>
      <FeatureGrid />
      <HowItWorks />
      <UseCasesSection />
      <Testimonials />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
