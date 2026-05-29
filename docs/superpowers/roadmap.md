# mairror Project Roadmap

## Product Goal

打造 **AI 品牌可见性监测服务**——帮助企业看清 AI 眼中的自己，提供持续监测 + 竞品对比 + 改造方案，建立 ARR 驱动的 SaaS 订阅业务。

## Current Phase

**Phase 1: MVP 代码完成** — 7 个里程碑全部实现，待数据库连接后联调

## Milestones

| ID | Milestone | Goal | Status | Priority | Depends On | Evidence |
|----|-----------|------|--------|----------|------------|----------|
| M1 | 免费检测工具 + Landing Page | 用户输入域名 → 实时返回可见性指标，作为获客漏斗入口 | done | P0 | — | b5bcc94, dea8a45 |
| M2 | 用户系统 + 支付集成 | 注册/登录、OAuth、订阅支付（复用 NextDevTpl） | done | P0 | M1 | c31cd29 |
| M3 | 品牌监测引擎 | 关键词设定、周期监测、结果存储、趋势分析 | done | P0 | M2 | 77866c0 |
| M4 | 周报 + 通知系统 | 邮件周报、站内通知、异常告警 | done | P1 | M3 | d3bfe63 |
| M5 | 竞品对比 | 竞品管理、对比报告、可见性得分 | done | P1 | M3 | d425825 |
| M6 | 就绪度审计 | llms.txt/robots.txt/JSON-LD/CWV/内容协商 5 维审计 | done | P1 | M1 | 802143a |
| M7 | 改造方案咨询 | 审计→改造方案→实施服务的 upsell 流程 | done | P2 | M5, M6 | 802143a |

## Active Work

- None. MVP Phase 1 code complete.

## Next Recommended Steps

1. **数据库迁移**: 运行 `pnpm db:generate` + `pnpm db:migrate` 创建新增监测表
2. **API Key 配置**: 配置 OPENAI_API_KEY, RESEND_API_KEY, INNGEST_EVENT_KEY
3. **端到端测试**: 连接数据库后跑集成测试，验证检测→注册→支付→监测→报告完整链路
4. **第一个真实客户**: 手动跑 5 个真实域名的检测和监测，积累案例数据

## Inbox

| Item | Source | Status | Triage |
|------|--------|--------|--------|
| 定价具体数字（免费→付费价格差） | 需求 §10 | proposed | 产品负责人确认 |
| 目标市场：中国优先 or 全球 | 需求 §10 | proposed | 产品负责人确认 |
| MVP 是否需要全自动化监测 pipeline | 需求 §10 | proposed | 技术负责人（代码已支持，需 API 配置后开启） |
| 营销官网和工具同一域名还是独立站点 | 需求 §10 | proposed | 技术负责人 |
| 白标报告支持 | 需求 §10 | proposed | — |

## Backlog

| Item | Priority | Reason | Status |
|------|----------|--------|--------|
| 多 AI 平台覆盖（Perplexity + OpenAI + Claude + Bing） | P1 | 首批仅 OpenAI，后续扩展 | planned |
| 内容营销（博客/HN/PH） | P1 | 获客渠道 P1 优先级 | planned |
| 社区渗透（IH/Twitter/Reddit/V2EX） | P1 | 获客渠道 P1 优先级 | planned |
| 手动挖前 20 个客户 | P0 | 获客渠道 P0 优先级 | planned |
| 代理/渠道合作 | P2 | 获客渠道 P2 优先级 | planned |

## Risks and Unknowns

| Risk/Question | Impact | Status |
|---------------|--------|--------|
| AI API 调用成本控制 — 每次监测消耗多个 API token | 定价需要覆盖成本，影响毛利率 | 待评估 |
| AI 搜索结果非确定性 — "排名"概念不成立 | 已决策用"可见性得分"替代排名 | resolved |
| 竞品 Sivussa 可能迭代补齐短板 | 需持续差异化，先发优势窗口有限 | 监控中 |
| 首批监测多少个 AI 平台 | 影响 API 集成工作量 | 待决策 |
| 就绪度审计是 AI 全自动还是人工审核 | 影响交付质量和成本结构 | 待决策 |

## Decision Log

| Date | Decision | Reason | Evidence |
|------|----------|--------|----------|
| 2026-05-29 | 基于 NextDevTpl 构建 mairror | 已有 auth/payment/mail/dashboard/storage 等 SaaS 基础设施，可大幅缩短开发周期 | 需求 §8.1 技术栈建议 |
| 2026-05-29 | 不做"AI 搜索排名"，做"可见性" | AI 搜索结果非确定性，"排名"概念不成立，用提及率/引用率替代 | 需求 §5.1 |
| 2026-05-29 | MVP 不做全自动 PDF 报告 | 先用邮件 HTML + 在线仪表盘，降低 MVP 复杂度 | 需求 §2.2, §8.2 |
| 2026-05-29 | 监测是周期性的不是实时的 | 批量调用 API 后聚合，不需要 streaming | 需求 §8.2 |

## Recent Progress

- 2026-05-29: 全部 7 个里程碑代码完成 (M1-M7)，commits: d3bfe63 → 802143a
- 2026-05-29: M1-1 品牌重塑完成 — site config, i18n messages, nav, logo, pricing
- 2026-05-29: 需求文档完成（docs/requirements.md），明确产品定位、功能范围、MVP 路线
- 2026-05-29: Git 仓库初始化，基于 NextDevTpl 代码库
- 2026-05-29: 项目 Roadmap 创建
