# AI 安全观察

公开阅读站初版，围绕 AI 安全事件、攻击研究和来源证据组织内容。

## 本地预览

需要 Node.js 22 或更新版本，无第三方运行依赖。

```sh
npm run build
npm test
npm start
```

打开终端给出的 http://127.0.0.1:4173 。部署使用 dist/ 静态目录，Sites 项目身份保存在 .openai/hosting.json。

## 已实现

- 独立报刊式界面，事件档案、研究披露、来源库、详情和收藏。
- 标题、摘要、产品、标签与事件/CVE编号搜索，来源/主题/证据/时间组合筛选。
- URL保留筛选条件，详情可直接分享；收藏与已读在当前浏览器持久化。
- 32条去重记录，21条已附原始披露；15个情报来源/资料源，11个获取入口已核验。
- 本地PDF全部16条保留原编号；SalesBleed重复记录已合并；其中5条补到原始披露。

## 数据与维护

content/pdf-items.json 保存PDF整理材料，content/primary-items.json 保存新增披露，content/sources.json 是来源登记表。运行 npm run build 生成公开数据，并合并原始披露与PDF中的同一事件。scripts/build-data.mjs 维护显式合并关系和本期重点条目，未部署任何实时抓取或LLM调用。

Item 字段包括 id、title、summary、kind、risk、tags、entities、publishedAt、originalPublishedAt、occurredAt、sourceId、references、evidence、limitations、impact、recommendation；PDF记录另外保留 externalId 与 pdfPage。原文披露时间用于排序，无法核定时使用汇编时间，实际发生时间独立保存。

未来自动化可以向相同数据合同写入记录。下一阶段需要实现采集器、增量去重、证据校验、中文摘要及定时发布，并为外部来源补充稳定性检查。status=checked 仅代表2026-10-23访问和格式检查通过，不代表采集器已经运行。

research/aihot-and-sources.md 记录AIHOT配置与信源调研；research/primary-evidence.md 记录原始披露核验。来源的版权归原作者，本站摘要为独立整理，不分发第三方全文或PDF。

## 开源参考

- AIHOT: https://github.com/KKKKhazix/AIHOT ，MIT协议，来源分级、时间归档、事件聚合和公开读取层的工程参考。本项目没有复制其品牌和界面，也未部署其Node/PostgreSQL后台。
- AI Safety Radar: https://github.com/nrc-cnrc/ai-safety-radar-securite-ia
- S33R: https://github.com/clivoa/S33R

当前版更新日期：2026-10-23，Asia/Taipei。无注册、云收藏、在线模型摘要或第三方分析脚本。
