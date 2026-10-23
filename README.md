# AI 安全观察

公开阅读站，整理 AI 安全事件、漏洞公告、攻击研究与原始来源。

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
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variables | 无需配置 |

网页使用 `#/feed` 等哈希路由，无需额外添加路由重写。只发布 `dist/`，研究笔记和本地 PDF 不作为静态资源发布。`.openai/hosting.json` 仅用于原有 Sites 托管，Vercel 不使用该文件。

修改 `content/` 后运行构建与测试，再提交到 GitHub。定时采集尚未实现，部署不会自动产生新情报。Vercel 配置字段见[官方文档](https://vercel.com/docs/project-configuration/vercel-json)。

## 已实现

- 首页直接展示按日期排列的情报，提供真实事件、研究披露、来源库和详情；原始来源链接位于详情标题之后。
- 标题、摘要、产品、标签、包名与事件/CVE编号搜索，来源/主题/证据/时间组合筛选；“CVE 漏洞”主题覆盖26条带明确编号的资料。
- URL保留筛选条件，详情可直接分享；已读在当前浏览器持久化。
- 76条去重记录，67条已附原始披露；本轮新增8条人工核验的AI产品与工具链CVE公告，保留受影响包、版本、利用条件与修复建议。
- 12个实际供稿来源，包括PDF汇编；登记表保留16个情报/资料源，公开来源库展示其中15个来源，12个获取入口已核验。
- 来源库以分类关系图展示厂商官方4、安全研究6、结构化资料4、中文社区1；支持搜索、点击详情、关闭返回焦点与 `#/sources?source=cve` 深链接，960px以下纵向排列。
- 本地PDF全部16条保留原编号；SalesBleed重复记录已合并；其中7条补到原始披露。
- 移除收藏、重点区与统计侧栏，手机列表标题21px、正文17px。

## 数据与维护

content/pdf-items.json 保存PDF整理材料，content/primary-items.json 保存首批原始披露，content/expanded-vendor-items.json 与 content/expanded-research-items.json 保存扩充资料，content/cve-items.json 保存人工核验的CVE公告，content/sources.json 是来源登记表。运行 npm run build 生成公开数据，并合并原始披露与PDF中的同一事件。scripts/build-data.mjs 维护显式合并关系与原文补充，未部署任何实时抓取或LLM调用。

Item 字段包括 id、title、summary、kind、risk、tags、entities、publishedAt、originalPublishedAt、occurredAt、sourceId、references、evidence、limitations、impact、recommendation；PDF记录另外保留 externalId 与 pdfPage。原文披露时间用于排序，无法核定时使用汇编时间，实际发生时间独立保存。

CVE条目使用既有 advisory 类型，新增 cveIds、cvePublishedAt、preconditions 和 affectedPackages。包信息包含 name、ecosystem、affectedRange、fixedVersion、source。旧记录的CVE编号只从明确的 externalId、标签和 cveIds 补齐，不扫描解释性正文。新导入公告与既有非事件资料共享编号时构建会报错，要求人工核对；有实际攻击证据的事件可独立保留。

项目公告日期和CVE编号发布时间分开显示，均按Asia/Taipei归档。首批两条A2A项目公告早在8月公开，虽然10月才发布CVE编号，仍按8月排序。升级条件和来源差异保留在详情中，不能将官方漏洞公告当作已遭利用事件。

未来自动化可以向相同数据合同写入记录。下一阶段需要实现采集器、增量去重、证据校验、中文摘要及定时发布，并为外部来源补充稳定性检查。status=checked 仅代表2026-10-23访问和格式检查通过，不代表采集器已经运行。

research/aihot-and-sources.md 记录AIHOT配置与信源调研；research/primary-evidence.md、research/expanded-vendor-evidence.md、research/expanded-research-evidence.md 记录原始披露核验。来源的版权归原作者，本站摘要为独立整理，不分发第三方全文或PDF。

research/cve-verification-2026-10-23.md 及同名JSON保留本轮接入前的核验结果与来源快照；它们是研究证据，不作为静态资源发布。后续接入状态见 research/cve-integration-2026-10-23.md。

## 开源参考

- AIHOT: https://github.com/KKKKhazix/AIHOT ，MIT协议，来源分级、时间归档、事件聚合和公开读取层的工程参考。本项目没有复制其品牌和界面，也未部署其Node/PostgreSQL后台。
- AI Safety Radar: https://github.com/nrc-cnrc/ai-safety-radar-securite-ia
- S33R: https://github.com/clivoa/S33R

当前版0.3.0，更新日期：2026-10-23，Asia/Taipei。无注册、在线模型摘要或第三方分析脚本。
