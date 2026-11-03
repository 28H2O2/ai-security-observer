# ASO Risk Score v1.0 验收记录

2026-11-03，在本地分支 `feat/aso-risk-score-v1` 完成开发验收；验收时尚未提交、推送或部署。发布状态以托管平台记录为准。

## 改动文件

| 用途 | 文件 |
| --- | --- |
| 规则、计算与校验 | `dist/risk-rules.js`、`dist/risk-score.js` |
| 评分源数据 | `content/risk-assessments.json` |
| 构建关联与覆盖统计 | `scripts/build-risk.mjs`、`scripts/build-data.mjs` |
| 候选模板接口 | `scripts/risk-candidate.mjs` |
| 详情模块与样式 | `dist/risk-view.js`、`dist/risk.css` |
| 列表、筛选、排序与页面入口 | `dist/app.js`、`dist/model.js`、`dist/index.html` |
| 网页规则生成 | `scripts/build-risk-methodology.mjs` |
| 自动生成产物 | `dist/data/items.json`、`dist/data/risk-coverage.json`、`dist/risk-methodology.html` |
| 测试 | `scripts/risk.test.mjs`、`scripts/cve.test.mjs` |
| 文档 | `README.md`、`docs/aso-risk-score.md`、本文件 |

原有 79 条事件的事实字段、日期和来源逐字段比对一致。未修改原始事件配置，未新增依赖；生成数据由构建脚本写入。

## 验证结果

- Node.js 22.23.4 下，`npm run build`、`npm run build:production`、`npm test`、`npm run package:preview` 均成功。
- 自动化测试 46 项通过，其中新增 21 项。公式遍历全部 1,296 种合法四维组合，覆盖 0 和 100，以及 null、非法值、事件和证据关联、旧评分失效、排序与筛选、导出和文本转义。
- 重复构建产物逐字一致；无效评分配置会中止构建，不覆盖已有产物。
- Chrome 实际浏览器检查 15 组通过，无页面脚本错误。检查默认时间排序、风险排序、评分筛选、详情证据、返回时保留筛选、搜索和 JSON 下载、来源关联、每周简报，以及原始 CVSS 与 ASO 分别展示。
- 桌面及 390px、320px 宽度检查通过，列表、筛选和详情无横向溢出。
- `git diff --check` 通过。

本地浏览器结果和截图保存在忽略目录 `output/aso-risk/`，预览包为 `output/releases/jade-observer-0.4.1-preview.tar.gz`。预览包不是生产发布包。最终工作区已按现有站点 URL 完成生产构建；这不会更新线上网站。

## 数据与人工复核

共 79 条：12 条已评分、1 条证据不足、2 条不适用、64 条尚待逐项评估。页面“待评估”共 65 条。不能把未评估的 64 条直接视为证据不足。

15 条示范配置全部 `reviewed: false`。具体复核问题保存在每条配置的 `reviewNotes`；优先核对影响范围、严重损害界限、复合攻击的前置条件，以及实际攻击尝试与成功利用的区别。测试验证程序行为，不代替证据审阅或漏洞复现。

LLM 部分仅提供离线候选模板和校验接口，未实现模型调用。后续先建立人工复核样本，再接入结构化证据提取；候选默认待审，总分继续由确定性公式计算。

## 本地查看

运行 `npm start`，打开 `http://127.0.0.1:4173/#/feed?assessment=scored&sort=risk`。正式发布前按目标部署环境设置 `SITE_URL` 并重新生产构建。
