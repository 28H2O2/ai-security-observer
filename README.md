# AI 安全观察

复旦 JADE 公开阅读站，整理 AI 安全事件、漏洞公告、攻击研究与原始来源。联系人：张谧教授（mi_zhang@fudan.edu.cn）。

## ASO Risk Score v1.0

列表显示已评估条目的 `ASO 分数/100`，可按“风险优先”排序，或筛选已评分、待评估和不适用条目。默认仍按日期排列。详情页展示四维分值、评分理由和原始证据，并区分潜在后果与实际观测。

评分配置在 `content/risk-assessments.json`，构建时关联最终事件 ID，按 `7I + 5F + 4S + 4A` 计算；证据缺失时不生成总分。11 月 4 日完成全量评估：88 条资料中，70 条已评分、8 条证据不足、10 条不适用，没有尚未处理的条目。全部标注尚未人工复核。补证过程、评分边界和待补材料见 [全量评估记录](research/risk-assessment-2026-11-04.md)。

ASO 是本站自定义指标，非 CVSS、EPSS 或攻击概率。主导航的“评分规则”（`#/risk-rules`）展示公式、四维锚点、证据边界和覆盖数量，并可直接进入对应筛选。完整维护步骤及限制见 [评分规范](docs/aso-risk-score.md)；无需 JavaScript 的说明保留在 `risk-methodology.html`，两者共用规则与页面内容。待评估清单在 `dist/data/risk-coverage.json`。

## 2026-11-04 内容更新

新增 9 条一手资料：GitBook 凭据访问事件、Instatic 与 SurrealDB MCP 漏洞、Voluntary Servitude 实验、MCPhantom、GTIG LLMjacking 调查、两条 AWS 公告及 Haiou 提示广告软件研究。保留 11 月 2–3 日原始日期，未改动既有 88 条事实与评分。现共 97 条，77 条已评分、10 条证据不足、10 条不适用；新增评估均未人工复核。核验范围、日期和版本差异见 [本轮记录](research/update-2026-11-04.md)。

## 2026-11-11 内容更新

新增 7 条一手资料：Basic Memory、Agent Router、Dynatrace MCP 公告，DeepMind 自适应提示注入实验、微软 Lazarus 权重后门研究，以及 AWS API MCP、Kiro CLI 两条公告。原有 opencode 记录补充 CVE-2026-119025 与 MCP Inspector 范围，同一机制不重复计数。保留原始公告日期、CVE 上海发布日期和实验边界。现共 110 条：88 条已评分、10 条证据不足、12 条不适用；新增与修正评估均未人工复核。检查范围及待核验线索见 [本轮记录](research/update-2026-11-11.md)。

## 2026-11-10 内容更新

新增 6 条：Check Point 的 ChatGPT Lockdown Mode 绕过、Zenity 的 AWS AgentCore 研究、server-everything 与 FastMCP 的两条无 CVE 项目公告、CVE-2026-111770，以及 Anthropic 与 UK AISI 对 Mythos 5 评测事件的分析。其中 5 条是此前漏收的 10 月披露，保留原始日期。新增 5 个评分、1 个不适用，AgentCore 与 MCP SDK 的来源分歧写入 limitations。与 11 月 4 日的 9 条合并后共 103 条：82 条已评分、10 条证据不足、11 条不适用。未核对的线索和验证情况见 [本次核验](research/update-2026-11-10.md)。

## 2026-11-03 内容更新

新增 9 条：NCSC 当日 AI 威胁研判、Trigger.dev 环境变量泄露、Cursor 扩展投毒、Epoch AI 补丁时差实验、BrowseSafe++ 和 4 条 Langflow 漏洞公告。保留原始披露日期；Perplexity 的原文与索引日期差异单列说明。新增 4 个评分，另有 4 个新条目因关键证据不足暂停总分，2 篇宏观或方法研究不适用。记录见 [本次核验](research/update-2026-11-03.md)。

## 0.4.1 更新

- 官方 JADE Logo 本地化，页头加入团队主页、成员、联系人，首页改为蓝白阅读布局并移除页头资料日期。
- `#/briefings` 按日或按周（周一至周日）汇编已有资料；支持历史归档、空日期和 Markdown 下载。
- 情报列表按当前搜索、筛选、排序和已读状态导出 Markdown / JSON。
- 构建生成最新 50 条 RSS：`feed.xml`，以及无需 JavaScript 的 `methodology.html` 来源与核验说明。
- 日报、周报、导出和 RSS 都读取同一份去重数据，不生成未经核验的新结论。资料审阅截止 2026-10-27，新增 CreditNirvana 漏洞、OpenAI 隔离研究与 LiteLLM 事故复盘；原始披露日期保持不变。

整理说明见 [来源、消息格式与核验方法](research/site-methodology.md)。香港 Nginx 部署、正式域名配置、回滚与大陆三网验收见 [部署说明](deployment/README.md)。

本地打包运行 `npm run package:preview`。正式打包设置 `SITE_URL` 后运行 `npm run package`，自动执行生产构建、测试和归档；产物位于 `output/releases/`。本地包带 `-preview`，RSS 使用本机地址，正式部署前必须重新构建。生产构建拒绝缺失、占位、本地或非 HTTPS 地址。

## 本地预览

使用 Node.js 22，无第三方运行依赖。

```sh
npm ci
npm run build
npm test
npm start
```

打开终端给出的 http://127.0.0.1:4173 。部署使用 dist/ 静态目录，Sites 项目身份保存在 .openai/hosting.json。

## Vercel 部署

在 Vercel 新建项目，导入本 GitHub 仓库，根目录保留为仓库根目录 `.`，然后部署。

仓库内的 `vercel.json` 已配置：

| 项目 | 设置 |
| --- | --- |
| Framework Preset | Other |
| Node.js | 22.x |
| Install Command | `npm ci` |
| Build Command | `npm run build:production` |
| Output Directory | `dist` |
| Environment Variables | `SITE_URL` 可指定正式 HTTPS 根地址；未设置时使用 Vercel 提供的生产域名 |

在 Vercel 上，显式 `SITE_URL` 优先；缺省时读取 `VERCEL_PROJECT_PRODUCTION_URL` 并加上 HTTPS 协议，不使用临时预览域名。需保持平台的 Automatically expose System Environment Variables 设置开启；若关闭，则手动设置 `SITE_URL`。其他生产部署仍须显式设置 `SITE_URL`。参见 [Vercel 系统环境变量](https://vercel.com/docs/environment-variables/system-environment-variables)。

网页使用 `#/feed` 等哈希路由，无需额外添加路由重写。只发布 `dist/`，研究笔记和本地 PDF 不作为静态资源发布。`.openai/hosting.json` 仅用于原有 Sites 托管，Vercel 不使用该文件。

修改 `content/` 后运行构建与测试，再提交到 GitHub。定时采集尚未实现，部署不会自动产生新情报。Vercel 配置字段见[官方文档](https://vercel.com/docs/project-configuration/vercel-json)。

## 已实现

- 首页直接展示按日期排列的情报，提供真实事件、研究披露、来源库和详情；原始来源链接位于详情标题之后。
- 标题、摘要、产品、标签、包名与事件/CVE编号搜索，来源/主题/证据/时间组合筛选；“CVE 漏洞”主题覆盖34条带明确编号的资料。
- URL保留筛选条件，详情可直接分享；已读在当前浏览器持久化。
- 97条去重记录，88条已附原始披露；34条带明确 CVE 编号，保留受影响包、版本、利用条件与修复建议。
- 23个实际供稿来源，包括PDF汇编；公开来源库展示25个来源。原有12个获取入口检查记录保留，新来源以人工阅读方式登记。
- 来源库以分类关系图展示厂商官方9、安全研究11、结构化资料4、中文社区1；支持搜索、点击详情、关闭返回焦点与 `#/sources?source=cve` 深链接，960px以下纵向排列。
- 本地PDF全部16条保留原编号；SalesBleed重复记录已合并；其中7条补到原始披露。
- 移除收藏、重点区与统计侧栏，手机列表标题20px、正文15px，320px宽度进一步适配。

## 数据与维护

content/pdf-items.json 保存PDF整理材料，content/primary-items.json 保存首批原始披露，content/expanded-vendor-items.json 与 content/expanded-research-items.json 保存扩充资料，content/cve-items.json 保存人工核验的CVE公告，content/latest-items.json 保存本次增量，content/review.json 显式保存审阅日期（构建不会自动改成今天），content/sources.json 是来源登记表。运行 npm run build 生成公开数据，并合并原始披露与PDF中的同一事件。scripts/build-data.mjs 维护显式合并关系与原文补充，未部署任何实时抓取或LLM调用。

Item 字段包括 id、title、summary、kind、risk、tags、entities、publishedAt、originalPublishedAt、occurredAt、sourceId、references、evidence、limitations、impact、recommendation；PDF记录另外保留 externalId 与 pdfPage。原文披露时间用于排序，无法核定时使用汇编时间，实际发生时间独立保存。

CVE条目使用既有 advisory 类型，新增 cveIds、cvePublishedAt、preconditions 和 affectedPackages。包信息包含 name、ecosystem、affectedRange、fixedVersion、source。旧记录的CVE编号只从明确的 externalId、标签和 cveIds 补齐，不扫描解释性正文。新导入公告与既有非事件资料共享编号时构建会报错，要求人工核对；有实际攻击证据的事件可独立保留。

项目公告日期和CVE编号发布时间分开显示，按来源披露日期归档，日期快照采用 Asia/Shanghai。首批两条A2A项目公告早在8月公开，虽然10月才发布CVE编号，仍按8月排序。升级条件和来源差异保留在详情中，不能将官方漏洞公告当作已遭利用事件。

未来自动化可以向相同数据合同写入记录。下一阶段需要实现采集器、增量去重、证据校验、中文摘要及定时发布，并为外部来源补充稳定性检查。status=checked 仅代表2026-10-23访问和格式检查通过，不代表采集器已经运行。

research/aihot-and-sources.md 记录AIHOT配置与信源调研；research/primary-evidence.md、research/expanded-vendor-evidence.md、research/expanded-research-evidence.md 记录原始披露核验。来源的版权归原作者，本站摘要为独立整理，不分发第三方全文或PDF。

research/cve-verification-2026-10-23.md 及同名JSON保留本轮接入前的核验结果与来源快照；它们是研究证据，不作为静态资源发布。后续接入状态见 research/cve-integration-2026-10-23.md。

## 开源参考

- AIHOT: https://github.com/KKKKhazix/AIHOT ，MIT协议，来源分级、时间归档、事件聚合和公开读取层的工程参考。本项目没有复制其品牌和界面，也未部署其Node/PostgreSQL后台。
- AI Safety Radar: https://github.com/nrc-cnrc/ai-safety-radar-securite-ia
- S33R: https://github.com/clivoa/S33R

当前代码版0.4.1；本次资料核对日期：2026-11-04，Asia/Shanghai，不代表全部旧资料重新核验。无注册、在线模型摘要或第三方分析脚本。publication.js 由浏览器与构建脚本共享，data/briefings.json 仅保存分类和条目编号，避免复制事实正文。DOM 文本与导出格式分别转义。资料源与品牌素材说明见 research/site-methodology.md。
