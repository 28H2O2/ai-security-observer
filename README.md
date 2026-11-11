# AI 威胁情报站

复旦 JADE 的 AI 安全情报阅读站，全称「复旦 JADE · AI 威胁情报站」。把公开的安全事件、漏洞公告与攻击研究整理成中文摘要，逐条标注来源、证据边界与原始链接，不做未经核验的推断。

站名与[同名微信小程序](https://github.com/28H2O2/ai-security-observer-miniprogram)保持一致：两端共用同一份人工整理的数据快照，本仓库是完整网页版，小程序是移动阅读版。仓库名 `ai-security-observer` 作为工程标识保留不变，避免已有链接失效。线上地址见仓库首页的 Vercel 生产域名。

## 这份资料是什么

当前数据快照（`content/review.json` 的审阅日期为准）：

| 项目 | 数值 |
| --- | --- |
| 资料审阅日期 | 2026-11-11（Asia/Shanghai） |
| 去重资料 | 110 条（真实事件 30 / 漏洞公告 33 / 研究披露 47） |
| 附原始披露 | 101 条 |
| 带明确 CVE 编号 | 39 条 |
| 实际供稿来源 | 24 个 |
| PDF 汇编原始收录 | 16 条 |
| ASO 评分 | 88 已评分 / 10 证据不足 / 12 不适用 / 0 待处理 |

最近一次更新（2026-11-11）新增 7 条一手资料，并修正了 opencode 条目的 CVE 覆盖；核验范围与待核验线索见[本轮记录](research/update-2026-11-11.md)。

这是**人工整理的静态快照**：没有实时抓取、定时采集、在线模型摘要或自动事实核验，部署也不会自动产生新情报。日期只表示审阅快照，不表示采集器运行时间。AI 辅助生成的摘要与评分均**尚未人工复核**。

「附原始披露」只表示能追溯到披露者，不等于独立证实或本站已复现；存在漏洞不等于攻击已经发生；未知日期、损失与利用情况一律保留为「未披露／未确认」。详见[来源、消息格式与核验方法](research/site-methodology.md)。

## 能做什么

- **浏览**：情报流、真实事件、研究披露三个视图；按披露日期排列，URL 保留搜索与筛选条件，详情可直接分享，已读状态保存在当前浏览器。
- **检索**：标题、摘要、产品、标签、包名、事件与 CVE 编号搜索；来源、主题、证据、时间、评分状态组合筛选；按日期或风险优先排序。
- **详情**：影响范围、处置建议、证据与边界、利用前提、受影响包与版本、修复建议，原始来源链接紧跟标题之后。
- **简报与导出**：按日或按周（周一至周日）汇编已有资料，支持历史归档与空日期；当前筛选结果可导出 Markdown / JSON；`feed.xml` 提供最新 50 条的 RSS。
- **来源库**：按厂商官方、安全研究、结构化资料、中文社区展示来源关系图，支持搜索、详情与 `#/sources?source=cve` 深链接。
- **ASO Risk Score v1.0**：列表显示 `ASO 分数/100`，详情页给出四维分值、评分理由与原始证据；`#/risk-rules` 展示公式 `7I + 5F + 4S + 4A`、锚点与覆盖情况，证据缺失时不生成总分。ASO 是本站自定义指标，**不是 CVSS、EPSS 或攻击概率**。完整规范见 [docs/aso-risk-score.md](docs/aso-risk-score.md)。
- **无 JavaScript 可读**：`methodology.html`（来源与核验说明）与 `risk-methodology.html`（评分规范）由构建生成，与站内页面共用同一套规则与数据。

网页使用 `#/feed`、`#/item/<id>` 等哈希路由，静态托管无需额外重写规则。

## 快速开始

需要 Node.js 22，运行时无第三方依赖。

```sh
npm ci
npm run build   # 由 content/ 生成 dist/data、feed.xml 与两个静态说明页
npm test
npm start       # 打开 http://127.0.0.1:4173
```

`npm run build` 是预览构建：`SITE_URL` 缺省为本机地址，RSS 与详情链接也指向本机，产物不可直接用于正式发布。仓库中提交的 `dist/` 用生产构建生成（例如 `SITE_URL='https://你的正式域名/' npm run build:production`）；本地预览后不要把 `127.0.0.1` 的 `meta.siteUrl` 与 RSS 链接提交回去。

## 目录

| 路径 | 作用 |
| --- | --- |
| `content/` | 唯一事实来源：资料条目、来源登记表、评分配置、审阅日期 |
| `scripts/` | 构建脚本与测试；`build-data.mjs` 负责合并、校验与产物生成 |
| `dist/` | 可直接静态托管的站点：页面、样式、脚本与生成的数据 |
| `dist/data/` | 生成数据：`items.json`、`briefings.json`、`sources.json`、`risk-coverage.json` |
| `docs/` | 评分规范与验证记录 |
| `research/` | 历次内容更新、来源核验与方法论记录，不作为静态资源发布 |
| `deployment/` | Nginx 部署模板与国内访问验收说明 |
| `vercel.json` | Vercel 构建配置 |

## 数据维护

1. 在 `content/` 中增修资料。`review.json` 显式保存审阅日期（构建不会自动改成今天），`sources.json` 是来源登记表，`risk-assessments.json` 是评分配置。
2. 运行 `npm run build`：合并 PDF 汇编与原始披露中的同一事件，补齐显式标注的原文与 CVE 编号，并校验编号唯一、来源存在、日期格式、公开链接与重复公告；同时生成简报、RSS、评分覆盖与两个静态说明页。
3. 运行 `npm test`，然后提交 `content/` 与 `dist/`。
4. 小程序仓库运行 `scripts/sync-data.mjs` 与 `scripts/build-pages.mjs`，把这份快照同步成移动端数据。

Item 的主要字段：`id`、`title`、`summary`、`kind`、`risk`、`tags`、`entities`、`publishedAt`、`originalPublishedAt`、`occurredAt`、`sourceId`、`references`、`evidence`、`limitations`、`impact`、`recommendation`；PDF 记录另保留 `externalId` 与 `pdfPage`，CVE 条目另保留 `cveIds`、`cvePublishedAt`、`preconditions`、`affectedPackages`。原文披露时间用于排序，无法核定时退回汇编时间；项目公告日期与 CVE 编号发布时间分开显示，时间快照采用 Asia/Shanghai。

`publication.js` 由浏览器与构建脚本共用，`briefings.json` 只保存分类和条目编号，避免复制事实正文。DOM 文本与导出格式分别转义。当前没有实现采集器、增量去重、证据自动校验与定时发布；来源状态 `checked` 仅代表登记日期的访问与格式检查通过。

## 部署

### Vercel

在 Vercel 导入本仓库，根目录保留 `.`。`vercel.json` 已配置：

| 项目 | 设置 |
| --- | --- |
| Framework Preset | Other |
| Node.js | 22.x |
| Install Command | `npm ci` |
| Build Command | `npm run build:production` |
| Output Directory | `dist` |
| `SITE_URL` | 可选，指定正式 HTTPS 根地址；未设置时读取 `VERCEL_PROJECT_PRODUCTION_URL` |

显式 `SITE_URL` 优先；不使用临时预览域名。需保持平台的 Automatically expose System Environment Variables 开启，否则手动设置 `SITE_URL`。生产构建拒绝缺失、占位、本地或非 HTTPS 地址，也不会自动退回某个托管商的域名。只发布 `dist/`，研究笔记与本地 PDF 不作为静态资源发布。Vercel 配置字段见[官方文档](https://vercel.com/docs/project-configuration/vercel-json)。

### 自有服务器

```sh
npm ci
npm run package:preview                          # 本机预览包，RSS 指向 127.0.0.1
SITE_URL='https://你的正式域名/' npm run package   # 生产包
```

`package` 依次执行生产构建、全部测试与 tar 归档，产物在 `output/releases/`。归档只包含静态产物与部署材料，服务器只需 Nginx，不需要 Node.js。香港节点部署、TLS、回滚与大陆三网验收见 [deployment/README.md](deployment/README.md)。原有 Sites 托管身份保存在 `.openai/hosting.json`，Vercel 不使用该文件。

## 延伸阅读

- [DESIGN.md](DESIGN.md)：视觉、排印与交互约定
- [docs/aso-risk-score.md](docs/aso-risk-score.md)：ASO 评分公式、四维锚点与维护步骤
- [research/site-methodology.md](research/site-methodology.md)：来源、消息格式与核验方法
- [research/update-2026-11-11.md](research/update-2026-11-11.md)：最近一次内容更新与核验范围（`research/update-*.md` 为历次记录）
- [research/risk-assessment-2026-11-04.md](research/risk-assessment-2026-11-04.md)：ASO 全量评估记录
- 工程参考：[AIHOT](https://github.com/KKKKhazix/AIHOT)（MIT）、[AI Safety Radar](https://github.com/nrc-cnrc/ai-safety-radar-securite-ia)、[S33R](https://github.com/clivoa/S33R)；本项目未复制其品牌、界面或后台代码

## 联系与版权

复旦大学 · JADE 团队：[团队主页](https://whitzard-ai.github.io/index.html) · [团队成员](https://whitzard-ai.github.io/member.html)；联系人：张谧教授（[mi_zhang@fudan.edu.cn](mailto:mi_zhang@fudan.edu.cn)）。

原始资料版权归原作者。本站只提供独立整理的中文摘要与原文链接，不分发第三方全文或 PDF。代码版本 0.4.1；资料核对日期 2026-11-11，不代表全部历史资料已重新核验。无注册、在线模型摘要或第三方分析脚本。
