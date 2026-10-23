# 首页面资料扩充：厂商与研究机构的一手披露

核验日期：2026-10-23（Asia/Taipei）。新增文件为 `content/expanded-vendor-items.json`，共 **18 条**：8 条安全公告、6 条研究或防护方法、4 条事件调查。覆盖 6 个现有来源 ID：`aws` 8 条，以及 `openai`、`microsoft`、`trail`、`checkpoint`、`unit42` 各 2 条。最早文章日期为 2026-08-25，全部落在最近 90 天内。

每条均实际读取原始厂商或研究团队文章。日期使用原文发布日期，不使用采集日；所有事件的单一发生日均未确定，因此 `occurredAt` 为 `null`。研究结论、厂商公告与真实攻击观测分开归类，未在本站复现漏洞。

## 新增记录与核验点

| 原始日期 | 记录 ID 后缀 | 原文 | 核验要点 |
|---|---|---|---|
| 2026-10-22 | aws-strands-a2a-isolation | [Strands Agents A2A 会话隔离公告](https://aws.amazon.com/security/security-bulletins/2026-146-aws/) | CVE-2026-115419；Python 1.43.0、TypeScript 1.5.0 修复；已认证调用者、多租户条件。 |
| 2026-10-21 | aws-sagemaker-default-bucket | [SageMaker SDK 默认桶所有权公告](https://aws.amazon.com/security/security-bulletins/2026-142-aws/) | CVE-2026-112408；V2 2.257.3、V3 3.10.0 修复；攻击者需抢先创建预期桶。 |
| 2026-10-21 | unit42-bugster-ai-cybercrime | [Next Exploit Opportunities](https://unit42.paloaltonetworks.com/ai-assisted-cybercrime-analysis/) | 调查攻击者环境；大学数据外传有确认，其他犯罪领域包含规划、准备及工具能力。 |
| 2026-10-20 | aws-kiro-crew-whatsapp-auth | [Kiro Crew WhatsApp 授权公告](https://aws.amazon.com/security/security-bulletins/2026-140-aws/) | CVE-2026-112380；0.7.2 修复；默认配置不受影响。 |
| 2026-10-16 | microsoft-open-weight-risk-taxonomy | [Managing open-weight model risk](https://www.microsoft.com/en-us/security/blog/2026/10/16/managing-open-weight-model-risk-in-enterprise-deployments/) | 微软与 NVIDIA 原始风险管理方法；主要模型层，不是安全认证或产品推广条目。 |
| 2026-10-15 | unit42-linux-espionage-ai-artifacts | [Government Linux Infrastructure](https://unit42.paloaltonetworks.com/ai-campaign-targets-linux-infrastructure/) | 原文 HTML 的 datePublished 与 RSS 均为 10/15；AI 参与由对话式代码痕迹推断，模型与归属未知。 |
| 2026-10-14 | aws-sagemaker-git-log-secrets | [SageMaker SDK 日志凭证公告](https://aws.amazon.com/security/security-bulletins/2026-134-aws/) | CVE-2026-110248；Git 失败、错误输出含凭证及日志访问权限是关键条件。 |
| 2026-10-08 | openai-false-front-operations | [Disrupting AI-enabled false front operations](https://openai.com/index/disrupting-ai-enabled-false-front-operations/) | Dark Clark 与 Bogus Bylines 作为同一披露汇总一条；操作者夸大成果，非所有内容由 AI 生成。 |
| 2026-10-07 | microsoft-forge-validation-loop | [3 lessons from frontier AI vulnerability research](https://www.microsoft.com/en-us/security/blog/2026/10/07/3-lessons-from-frontier-ai-vulnerability-research/) | 原团队工程方法与自报结果；候选、内部验证、CVE 和已交付补丁分开。 |
| 2026-10-06 | aws-agentcore-import-injection | [AgentCore Toolkit 导入公告](https://aws.amazon.com/security/security-bulletins/2026-127-aws/) | CVE-2026-105812 与 CVE-2026-106032；0.3.14 修复；既有生成制品需重导入并替换。 |
| 2026-10-01 | aws-security-agent-mcp-diff-args | [Security Agent MCP 差异扫描公告](https://aws.amazon.com/security/security-bulletins/2026-121-aws/) | CVE-2026-97662；0.2.0 修复；版本引用被解释为选项导致越界写文件。 |
| 2026-09-24 | aws-kiro-global-config-write | [Kiro 全局配置写入公告](https://aws.amazon.com/security/security-bulletins/2026-117-aws/) | CVE-2026-95985；1.0.242 修复；不可信仓库、用户运行 Agent 条件。 |
| 2026-09-15 | trail-ai-patching-validation | [AI patching benchmark analysis](https://blog.trailofbits.com/2026/09/15/1passwords-ai-patching-benchmark-is-misleading/) | 参与方评测分析与工程数据，明确样本差异，合并不代表正确，挡住 PoC 不代表完整修复。 |
| 2026-09-11 | aws-kiro-workspace-data-exfil | [Kiro 工作区配置外传公告](https://aws.amazon.com/security/security-bulletins/2026-111-aws/) | CVE-2026-89332；0.8.135 修复；写盘早于用户审批，另需打开 Powers 面板。 |
| 2026-09-10 | checkpoint-puzzlemask-gatekeeper | [PuzzleMask](https://research.checkpoint.com/2026/puzzlemask-abusing-plain-prose-as-a-covert-ai-attack-vector/) | 快速分类器与高资源目标能力不对称；隐藏载荷方法本身不等于越狱，保留小样本边界。 |
| 2026-09-08 | checkpoint-chatgpt-shared-service-channel | [The Shared Clipboard Inside the Sandbox](https://research.checkpoint.com/2026/the-shared-clipboard-inside-the-sandbox-cross-account-data-leakage-in-chatgpt/) | 6 月发现的共享内部服务跨账户通道，披露前已不可用，OpenAI 确认相关 Artifactory 已停用。 |
| 2026-08-26 | trail-cyber-agent-vm-containment | [VMs won't contain cyber-capable agents](https://blog.trailofbits.com/2026/08/26/vms-wont-contain-cyber-capable-agents/) | 明确授权 CTF、特定开发机；原文开头三次概括与第一条实际未落地有差异，未照抄为三次成功逃逸。 |
| 2026-08-25 | openai-ibi-covert-influence | [Disrupting a new covert influence campaign from Russia](https://openai.com/index/disrupting-malicious-uses-of-ai-influence-campaign-russia/) | AI 用于推广，不把 IBI 核心文章标为 ChatGPT 生成；来源认为即时影响有限。 |

所有表中 ID 在 JSON 中统一带 `primary-` 前缀。AWS 公告读取的是实际安全公告正文，未将其 RSS 包装路径作为最终引用地址。

## 与既有 32 条记录的去重

已读取 `dist/data/items.json` 的全部 ID、标题、日期、原文引用，并进一步读取相关 PDF 条目摘要及实体。

- [Check Point 的 LiteLLM 研究](https://research.checkpoint.com/2026/when-llm-gateways-go-wrong-findings-from-litellm/)实读后确认包含 **CVE-2026-35029**，与现有 `primary-litellm-admin-api-observed-attacks` 指向同一漏洞，未新增计数。可把该原始研究作为现有条目的补充引用；其修复版本 1.83.9 对应整组发现，不能直接覆盖现有单漏洞修复字段。文中的另一个 SSRF CVE 未在本批单独拆条。
- 新增两项 Kiro IDE 公告分别是 **CVE-2026-89332** 与 **CVE-2026-95985**，机制、修复版本和披露日期不同，属于两个独立漏洞；也不是现有 AWS 数据库插件条目。
- 新增 AgentCore Toolkit 是 **导入工具和生成制品**的问题，不是现有 PDF 中 10 月 8 日 AgentCorruption 的运行时云权限研究。
- 新增 ChatGPT 跨账户通道是研究者发现的 **共享 Artifactory 可变状态**，原文明示其不同于模型训练或评测 Agent 的其他通信事件，也不是现有加密推理块重放研究。
- 微软 RSS 中 10 月 21 日 ARTEX/ConnectWise 活动未纳入。现有 PDF `pdf-2026-0002` 为 CrowdStrike 韩国金融机构线索，两者是否属于同一活动尚未核对，**不能仅凭工具同名自动合并**。
- 排除了来源目录、产品发布营销、泛 AI 更新及与 AI 系统无明确关联的云组件漏洞。

## 数据验证

- 18 个 ID 与主要原文 URL 唯一，且无现有条目的主要 URL 重复。
- `sourceId` 均来自现有 `content/sources.json`，没有新增来源命名。
- 摘要限制为 80—130 个字符；日期可解析且不晚于核验日。
- `kind`、`risk`、`evidence` 与字段结构沿用现有首批一手记录；本批全部 `featured: false`，由主项目决定首页展示。
# PDF 原文补充

AWS 公告 https://aws.amazon.com/security/security-bulletins/2026-130-aws/ 已核对，发布于2026-10-08，CVE-2026-107322。补充至 AISID-2026-0014，不增加事件数量。受影响的是 databases-on-aws 1.0.0至1.7.0中的本地 Aurora DSQL 辅助程序；智能体须先摄取恶意内容、再调用该程序才可能触发，数据库服务本身不受影响。1.7.1及以上已修复，固定Git修订安装需使用8b13a503746a4ebb0402b936645163224058bde3或后续提交。

