# 全量风险评估补证记录

资料检索于 2026 年 11 月 3–4 日完成，评估于 11 月 4 日写入。88 条既有记录均已处理：70 条有分数，8 条证据不足，10 条不适用。此前为 16 条有分数、5 条证据不足、4 条不适用、63 条未处理。本次新增 54 个分数，没有修改原有 16 个分数，也没有改动事件正文、来源判断或新闻日期。

逐条来源、原文位置、评估对象、四维值与事实指纹见 [核验清单](risk-assessment-2026-11-04.json)。配置合计引用 91 个不同 URL。完整逐维理由保存在 [评分配置](../content/risk-assessments.json)，构建后可在网页详情中查看。清单覆盖包括原有配置在内的全部 88 条，不表示本轮重新读取了每条旧配置的所有来源。

## 补证方式

先读取每条记录的原文链接，再补查研究者报告、维护者公告及公开复现。汇编条目新增的原始链接放在评分的 `sources` 中，保留原条目的汇编属性。检索摘要和新闻转述用于定位材料，不单独支撑技术维度。

本轮找到并读取了此前缺失的 Tensorlake 维护者公告、SOCRadar CyberXero 调查、Sysdig JADEPUFFER 调查、CrowdStrike 韩国金融机构调查，以及 OpenAI 非预期行为报告。对五条此前未评估的 SDK/CVE 公告，核对了受影响配置、攻击前提、复现段落及修复边界。AWS 公告逐条处理，没有由 CVSS 推算 ASO。

只阅读公开材料，没有运行攻击代码、访问受害系统或调用付费模型。分值由逐条结构化判断写入，公式仍由确定性程序计算；没有根据标题、标签或漏洞名称批量赋值。

## 对象与分数

| 记录 | I / F / S / A | ASO | 评分边界 |
| --- | --- | --- | --- |
| JADEPUFFER | 5 / 5 / 2 / 4 | 84 | 只评 Langflow 初始 RCE；后续 MySQL root 凭据的来源未知 |
| Tensorlake 0.5.144 | 5 / 3 / 2 / 5 | 78 | 已污染 npm 包的安装路径；维护者确认发布链失陷，不等于下游感染已确认 |
| GTG-20006 | 4 / 3 / 3 / 5 | 75 | 设备代码钓鱼到云邮件外传；不把其他攻击链混为同一入口 |
| Langflow CVE-2026-93680 | 3 / 5 / 2 / 2 | 62 | 未授权 MCP 信息读取，公开模块不是完整 RCE 证明 |
| ADK 跨代理调用 | 3 / 3 / 2 / 2 | 52 | PR 权限滥用与审查轨迹篡改，实际合并仍需维护者动作 |

JADEPUFFER 的初始入口来自 [Sysdig 原始调查](https://www.sysdig.com/blog/jadepuffer-agentic-ransomware-for-automated-database-extortion)。Tensorlake 的发布与下游使用界限来自 [维护者公告](https://github.com/tensorlakeai/tensorlake/security/advisories/GHSA-8g63-53c9-65j2)。GTG-20006 的云邮件链见 [Anthropic 威胁情报报告](https://www.anthropic.com/threat-intelligence-report-september-2026)。ADK 的审核权限与合并限制见 [研究原文及 Google 回应](https://www.pillar.security/blog/ill-just-call-you-agent-to-agent-privilege-boundary-failures-in-ci-cd-on-googles-adk-repository)。

### Langflow PoC 的核对

补查找到了 [Rapid7 PR #21942](https://github.com/rapid7/metasploit-framework/pull/21942) 和 [模块说明](https://raw.githubusercontent.com/rapid7/metasploit-framework/master/documentation/modules/auxiliary/gather/langflow_auth_bypass_cve_2026_93680.md)，其中包含 CVE-2026-93680 的 MCP 会话初始化、工具枚举和维护者测试记录。因此该条从证据不足改为 A=2，不继续沿用“未找到 PoC”的判断。

模块列出的范围是 1.5.0–1.11.4，测试为 1.8.4，示例容器启用了 `AUTO_LOGIN`；[IBM 公告](https://www.ibm.com/support/pages/node/7294467) 列出的受影响范围更宽。两者差异保留在复核备注中。模块的测试结果没有验证同批 CVE-2026-110186 的代码执行或 CVE-2026-110192 的凭据暴露，也不证明在野利用。

## 仍缺哪些材料

| 记录 | 未知维度 | 所需材料 |
| --- | --- | --- |
| 模型向警方提交举报 | F | 可重复触发该自主行为的输入与工具条件 |
| 韩国金融机构 / ARTEX | F、S | 受害系统的具体漏洞、权限条件及同一机制的部署范围 |
| 面向 AI 的钓鱼邮件 | S | 实际受影响助手产品、配置和执行结果 |
| 工作簿上传临时托管 | F | 可复现的攻击者入口，而非仅有自主行动轨迹 |
| Linux 间谍活动 | F | 首次入侵及取得执行权限的路径 |
| Trigger.dev | F | 平台技术复盘中的入口和认证要求 |
| CVE-2026-110186 | F、A | 与该编号对应的触发步骤、部署条件及利用验证 |
| CVE-2026-110192 | F、A | 凭据读取的具体接口、权限边界及利用验证 |

韩国金融机构条目已经补到 [CrowdStrike 原始调查](https://www.crowdstrike.com/en-us/blog/unknown-threat-actor-uses-artex-to-target-south-korean-finance/)。它足以支持部分后果和实际活动判断，但没有公开完整技术入口；没有沿用新闻中的受害数量作为 S 的依据。[Trigger.dev 官方博客](https://trigger.dev/blog/security-incident-nov-2026) 与状态页都确认环境变量被访问，仍未披露机制。

10 条不适用记录包括风险分类、补丁验证方法、蒸馏活动、影响行动、防护设计、宏观预测和综合基准研究。不适用只表示没有符合本评分模型的单一技术对象，不表示这些主题没有风险。

## 人工复核与后续

全部 88 条配置均为 `reviewed: false`。优先复核复合攻击中选定的评分对象、I=3 与 I=4 的后果界限、S=2 与 S=3 的部署范围，以及公开复现和在野证据的区分。AgentCorruption 保留 AWS 对角色凭据访问属于预期行为的回应；不能把研究者的表述当作双方一致的漏洞结论。

后续半自动提取器可接收这些记录的事件 ID、证据位置和事实指纹，输出前置条件、后果、实际观测和未知项。候选数据继续进入 `needs_review`，公式不交给模型计算。当前标注可用于设计评估任务，未经人工复核不能直接当作金标准。

## 验证

Node.js 22 下，`npm run build`、`npm run build:production` 和全部 50 项 `npm test` 通过。测试覆盖完整公式、未知值、来源关联、重复构建、补证后的排序筛选，以及不把一个 CVE 的 PoC 转用于其他编号。与变更前提交 `3466971` 比较，88 条事件的事实字段一致，原有 16 个评分配置未变。

本地 Chrome 检查通过：规则标签页、三类覆盖链接、风险排序、四维条形图、待评估原因、来源图及日报日期均正常；390px 和 320px 下，规则、列表、筛选及详情没有页面横向溢出，浏览器未报脚本错误。未在本站独立复现外部报告中的漏洞。
