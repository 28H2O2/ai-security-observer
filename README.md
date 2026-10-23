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

- 首页直接展示按日期排列的情报，提供事件档案、研究披露、来源库和详情。
- 标题、摘要、产品、标签与事件/CVE编号搜索，来源/主题/证据/时间组合筛选。
- URL保留筛选条件，详情可直接分享；已读在当前浏览器持久化。
- 68条去重记录，59条已附原始披露；本轮新增36条，来自现有登记来源。
- 11个实际供稿来源，包括PDF汇编；来源库登记15个情报/资料源，11个获取入口已核验。
- 本地PDF全部16条保留原编号；SalesBleed重复记录已合并；其中7条补到原始披露。
- 移除收藏、重点区与统计侧栏，手机列表标题21px、正文17px。

## 数据与维护

content/pdf-items.json 保存PDF整理材料，content/primary-items.json 保存首批原始披露，content/expanded-vendor-items.json 与 content/expanded-research-items.json 保存本轮扩充资料，content/sources.json 是来源登记表。运行 npm run build 生成公开数据，并合并原始披露与PDF中的同一事件。scripts/build-data.mjs 维护显式合并关系与原文补充，未部署任何实时抓取或LLM调用。

Item 字段包括 id、title、summary、kind、risk、tags、entities、publishedAt、originalPublishedAt、occurredAt、sourceId、references、evidence、limitations、impact、recommendation；PDF记录另外保留 externalId 与 pdfPage。原文披露时间用于排序，无法核定时使用汇编时间，实际发生时间独立保存。

未来自动化可以向相同数据合同写入记录。下一阶段需要实现采集器、增量去重、证据校验、中文摘要及定时发布，并为外部来源补充稳定性检查。status=checked 仅代表2026-10-23访问和格式检查通过，不代表采集器已经运行。

research/aihot-and-sources.md 记录AIHOT配置与信源调研；research/primary-evidence.md、research/expanded-vendor-evidence.md、research/expanded-research-evidence.md 记录原始披露核验。来源的版权归原作者，本站摘要为独立整理，不分发第三方全文或PDF。

## 开源参考

- AIHOT: https://github.com/KKKKhazix/AIHOT ，MIT协议，来源分级、时间归档、事件聚合和公开读取层的工程参考。本项目没有复制其品牌和界面，也未部署其Node/PostgreSQL后台。
- AI Safety Radar: https://github.com/nrc-cnrc/ai-safety-radar-securite-ia
- S33R: https://github.com/clivoa/S33R

当前版0.2.0，更新日期：2026-10-23，Asia/Taipei。无注册、在线模型摘要或第三方分析脚本。
