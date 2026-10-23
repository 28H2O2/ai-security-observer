# 首批一手披露内容核验

核验日期：2026-10-23（Asia/Taipei）。本文件对应 `content/primary-items.json` 的 17 条公开资料记录，均实际读取原作者或厂商文章后整理。网页可读性与披露内容核对不代表本站复现了漏洞。

共 14 条研究披露、3 条真实活动或攻击观测记录；来源为 Embrace The Red 7 条、Pillar Security 5 条、Zenity Labs 3 条、Anthropic 2 条。未使用搜索摘要作为事实依据。

| 原文日期 | 记录 ID | 核验原文 | 关键证据与边界 |
|---|---|---|---|
| 2026-10-19 | primary-opencode-mcp-oauth | [Open and Shut](https://www.pillar.security/blog/open-and-shut-remote-code-execution-in-opencode-via-mcp-oauth) | Windows/WSL 1.0.137—1.18.32；1.18.33 修复；无 CVE。页首为 10/19，正文时间线自称 10/04 发布，两者冲突已保留。 |
| 2026-10-13 | primary-visual-studio-ssms-copilot-rce | [Visual Studio Copilot and SSMS RCE](https://embracethered.com/blog/posts/2026/visual-studio-copilot-remote-code-execution/) | 文件名尾点规范化绕过受保护配置检查；CVE-2026-103572；研究者报告微软当日修复。 |
| 2026-10-13 | primary-badengram-memory-backdoor | [BadEngram](https://www.pillar.security/blog/badengram-a-new-attack-surface-in-open-weight-ai-models) | 模型原生记忆参数的条件后门研究；不是现有公开模型已被投毒的证据。 |
| 2026-09-30 | primary-sql-copilot-readonly-bypass | [From SELECT to SYSADMIN](https://embracethered.com/blog/posts/2026/from-select-to-sysadmin-sql-copilot-bluehat-asia/) | CVE-2026-65669；正则只读检查与数据库元数据注入；最终权限依赖受害者连接。 |
| 2026-09-29 | primary-unsloth-studio-model-inspection | [Look, Don't Load](https://www.pillar.security/blog/look-dont-load-model-inspection-in-unsloth-studio-leads-to-critical-arbitrary-code-execution) | Studio 选择恶意仓库模型触发；2026.6.9 修复；无 CVE；保留维护者对 beta 范围的分歧。 |
| 2026-09-24 | primary-salesbleed-agentforce | [SalesBleed](https://labs.zenity.io/post/salesbleed-0-click-data-exfiltration-on-agentforce) | Web-to-Lead 注入，经图片或 Slack 预览产生 DNS 外传；8 月双方确认修复。 |
| 2026-09-10 | primary-anthropic-gtg20006-cyber-operations | [September 2026 threat report](https://www.anthropic.com/threat-intelligence-report-september-2026) | 官方威胁目录注明 9/10，正文 GTG-20006 节披露厂商观察；归因仍为厂商调查判断。 |
| 2026-09-02 | primary-grafana-mcp-session-ssrf | [Valid, But Never Issued](https://www.pillar.security/blog/valid-but-never-issued-session-spoofing-and-ssrf-in-grafana-mcp) | CVE-2026-19516；认证与目标限制是两项问题；演示只使用 canary，未碰真实云元数据。 |
| 2026-09-01 | primary-litellm-admin-api-observed-attacks | [A Read-Only Account is All it Takes](https://labs.zenity.io/post/admin-api-escalation-litellm) | CVE-2026-35029；蜜罐观测与实验完整链分开叙述；4/07 为一般 config/update 探测，文件读取载荷见于 5/05—5/12。 |
| 2026-08-27 | primary-claude-sandbox-dns-channel | [It's Always DNS](https://labs.zenity.io/post/it-s-always-dns-in-claude-s-sandbox-from-data-exfiltration-to-a-bidirectional-dns-shell) | DNS 外传与沙箱内双向 shell；不意味着宿主逃逸；原文最终修复状态未知。 |
| 2026-08-26 | primary-claude-code-opus5-auto-mode | [Breaking Claude Code Opus 5 Auto Mode](https://embracethered.com/blog/posts/2026/breaking-claude-code-opus-5-and-automode/) | 恶意归档和 Python 模块遮蔽链；每变体仅 5 次测试；不外推总体 ASR。 |
| 2026-08-18 | primary-gemini-cli-wif-project-chain | [A WIF Of Fresh Access](https://www.pillar.security/blog/a-wif-of-fresh-access-how-a-github-issue-on-gemini-cli-led-to-gcp-project-compromise) | Issue→CI 身份文件→项目权限；Google 明确演示目标为专用沙箱，非其生产云整体失陷。 |
| 2026-08-16 | primary-encrypted-reasoning-replay | [Recovering Encrypted LLM Reasoning Traces](https://embracethered.com/blog/posts/2026/recovering-encrypted-llm-thoughts/) | 只整理作者本人的复现；需先获得推理块；不采用文中二手论文统计。 |
| 2026-08-03 | primary-llm-heist-gateway-routing | [LLM Heist](https://embracethered.com/blog/posts/2026/hijacking-litellm-for-fun-and-profit/) | 假设已持有网关管理凭证，研究管理功能被滥用后的能力；不是 CVE-2026-35029 的重复披露。 |
| 2026-07-16 | primary-terminal-ansi-dns-exfil | [macOS Terminal DNS Exfiltration](https://embracethered.com/blog/posts/2026/macos-terminal-dillma-dns-exfil-ansi-escape-code-fix/) | 2024/12 演示、2025/11 修复、2026/07 文章回顾；三种时间分开。 |
| 2026-06-25 | primary-computer-use-toctou | [Computer-Use and TOCTOU](https://embracethered.com/blog/posts/2026/toctou-agent-what-you-click-is-not-what-you-get/) | 2025/10 研究，2026/06 发布；作者称后续有动作前像素检查，不断言当前仍可利用。 |
| 2026-02-23 | primary-anthropic-distillation-campaigns | [Detecting and preventing distillation attacks](https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks) | 账户规模与实验室归因明确标为 Anthropic 单方调查；蒸馏方法本身与厂商认定滥用分开。 |

## 去重与排除

- 未纳入 Anthropic 10 月 9 日意外操作、OpenAI 9 月 16 日训练越界、Tensorlake、ARTEX、AgentCorruption、AWS 数据库 MCP 或 Deadbugz 的 23 个 PR 活动，避免与本地 PDF 条目重复。
- 两条 LiteLLM 记录属于不同对象：一条是管理端 CVE 的真实蜜罐攻击观测，另一条是既有管理凭证下的流量路由研究；后者明确不宣称新漏洞或新受害。
- 同一 SalesBleed 事件的图片与 Slack 外传方式归为一条，不拆成独立事件计数。
- 来源网页的引用范围与当前文章日期保持一致，未以采集日期替代披露日期。`occurredAt` 除明确的 LiteLLM 蜜罐起始探测日外均保留 `null`。
