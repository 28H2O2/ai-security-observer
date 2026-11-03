# AI 安全观察

复旦 JADE 公开阅读站，整理 AI 安全事件、漏洞公告、攻击研究与原始来源。联系人：张谧教授（mi_zhang@fudan.edu.cn）。

## ASO Risk Score v1.0

列表显示已评估条目的 `ASO 分数/100`，可按“风险优先”排序，或筛选已评分、待评估和不适用条目。默认仍按日期排列。详情页展示四维分值、评分理由和原始证据，并区分潜在后果与实际观测。

评分配置在 `content/risk-assessments.json`，构建时关联最终事件 ID，按 `7I + 5F + 4S + 4A` 计算；证据缺失时不生成总分。首批 15 条中，12 条已评分、1 条证据不足、2 条不适用，另外 64 条尚待逐项评估。全部示范标注尚未人工复核。

ASO 是本站自定义指标，非 CVSS、EPSS 或攻击概率。完整规则、维护步骤及限制见 [评分规范](docs/aso-risk-score.md)；网页说明在 `risk-methodology.html`，待评估清单在 `dist/data/risk-coverage.json`。评分与候选模板均离线运行，无新增依赖或模型 API。

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
| Environment Variables | `SITE_URL`：正式站点 HTTPS 根地址 |

网页使用 `#/feed` 等哈希路由，无需额外添加路由重写。只发布 `dist/`，研究笔记和本地 PDF 不作为静态资源发布。`.openai/hosting.json` 仅用于原有 Sites 托管，Vercel 不使用该文件。

修改 `content/` 后运行构建与测试，再提交到 GitHub。定时采集尚未实现，部署不会自动产生新情报。Vercel 配置字段见[官方文档](https://vercel.com/docs/project-configuration/vercel-json)。

## 已实现

- 首页直接展示按日期排列的情报，提供真实事件、研究披露、来源库和详情；原始来源链接位于详情标题之后。
- 标题、摘要、产品、标签、包名与事件/CVE编号搜索，来源/主题/证据/时间组合筛选；“CVE 漏洞”主题覆盖27条带明确编号的资料。
- URL保留筛选条件，详情可直接分享；已读在当前浏览器持久化。
- 79条去重记录，70条已附原始披露；本轮新增8条人工核验的AI产品与工具链CVE公告，保留受影响包、版本、利用条件与修复建议。
- 13个实际供稿来源，包括PDF汇编；登记表保留17个情报/资料源，公开来源库展示其中16个来源，12个获取入口已核验。
- 来源库以分类关系图展示厂商官方5、安全研究6、结构化资料4、中文社区1；支持搜索、点击详情、关闭返回焦点与 `#/sources?source=cve` 深链接，960px以下纵向排列。
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

当前代码版0.4.1；资料审阅截止：2026-10-27，Asia/Shanghai。无注册、在线模型摘要或第三方分析脚本。新增 publication.js 由浏览器与构建脚本共享，data/briefings.json 仅保存分类和条目编号，避免复制事实正文。DOM 文本与导出格式分别转义。资料源与品牌素材说明见 research/site-methodology.md。
