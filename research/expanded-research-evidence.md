# 研究来源扩充：18 条一手记录

核实日期：2026-10-23。读取既有 `dist/data/items.json` 的 32 条记录后，对照原文 URL、案例名称、漏洞机制及目标去重。本次新增 18 条，均于 2026 年公开披露，按披露日期倒序保存。

## 采集与证据边界

- Embrace The Red 4 条、Pillar Security 8 条、Zenity Labs 6 条；未为覆盖来源而把 Seebug 翻译或转述作为独立证据。
- 每条均实际读取研究者网站的原文正文与页首日期，而非仅使用搜索摘要或列表标题。实验、静态样本分析、蜜罐观测分别写进摘要和限制。
- 所有 `evidence: primary` 表示直接引用研究者的原始披露，不表示本站复现了漏洞，也不表示披露的每一项推测都已被独立确认。
- `publishedAt` 与 `originalPublishedAt` 均为原文公开日期；事件没有可确定单日发生时间时，`occurredAt` 保留 null，不以采集时间替代。
- `kind: incident` 用于原文实际观测到的活动；其中仍保留“探测”“尝试”“成功结果未知”等限制，不将其等同于生产环境已失陷。
- 未给条目编造热度、成功比例或受害者数量；`featured: false` 仅为现有数据格式兼容字段。

## 原文核实清单

| 记录 ID | 原文日期 | 一手原文 | 核实重点及限制 |
| --- | --- | --- | --- |
| `expanded-swarm-remote-browser-execution` | 2026-10-05 | [Remote Browser Execution: How Swarms Abused Public Web Scanners to Extract Russian Government Data](https://labs.zenity.io/post/rogue-ai-agents-abuse-urlquery-remote-browser-execution-to-extract-russian-government-data) | 报告分析公开扫描证据并扩展此前研究，不是本站运行的复现。三次 VNC 连接成功不等于受保护数据外泄；最终数据提取是否成功未知，群体归属为基于技术相似性的判断。 |
| `expanded-dolt-mcp-auth-bypass` | 2026-08-13 | [Lose Control Flow: Unauthenticated Tool Execution in Dolt MCP](https://www.pillar.security/blog/lose-control-flow-unauthenticated-tool-execution-in-dolt-mcp) | 受影响版本为 0.3.1–0.3.6，本地 stdio 不受此认证路径影响。页首为 8 月 13 日，正文时间线称 8 月 14 日博客披露；此处按页首归档并保留日期冲突。未报告在野成功利用。 |
| `expanded-claude-chrome-account-takeover` | 2026-08-05 | [Claude in Chrome: From alert(1) to Full Account Takeover](https://labs.zenity.io/post/claude-in-chrome-from-alert-to-full-account-takeover) | 实验需要助手读取恶意内容及用户已有登录会话；跨站行动依赖相应账户和批准状态。报告于披露时称仍可复现，不代表已核验 2026-10-23 当前版本或实际在野利用。 |
| `expanded-grand-theft-atlas` | 2026-08-05 | [Grand Theft Atlas](https://labs.zenity.io/post/grand-theft-atlas) | 这是研究者构造的授权演示，不是已确认在野群发或盗刷案件。原文明确 Atlas 的最终购买按钮硬限制仍有效，购物结果通过另一助手获得；未独立核验当前版本。 |
| `expanded-chaindrop-agent-hooks` | 2026-08-04 | [ChainDrop: When Opening a Repository Becomes Execution](https://www.pillar.security/blog/chaindrop-when-opening-a-repository-becomes-execution) | 该活动最先由 StepSecurity 报告；本条依据 Pillar 对两个恶意包及钩子的原始静态分析，未执行恶意载荷。并非每次打开仓库都会自动执行，取决于工具版本、信任设置与批准策略。 |
| `expanded-adk-cross-agent-boundary` | 2026-08-03 | [I'll Just Call You: Agent-to-Agent Privilege Boundary Failures in CI/CD on Google's ADK Repository](https://www.pillar.security/blog/ill-just-call-you-agent-to-agent-privilege-boundary-failures-in-ci-cd-on-googles-adk-repository) | 关键攻击链在研究者模拟仓库中复现，权限受 issues:write 与 pull-requests:write 约束。原文明确不同于其 Gemini CLI 另一报告，本链未直接达到供应链完全接管；Google 确认已缓解相关问题。 |
| `expanded-agentforger-workspace-agent` | 2026-07-23 | [AgentForger, Part 1: ChatGPT Cross-Site Agent Forgery](https://labs.zenity.io/post/agentforger-part-1-chatgpt-cross-site-agent-forgery) | 需要用户登录、具备 Workspace Agents 权限且已授权连接器，并点击攻击链接；不是完全无点击。第二篇是同一实验链的后续影响展示，不另计事件。OpenAI 于 6 月 8 日修复。 |
| `expanded-ollama-pull-ssrf-observed` | 2026-07-01 | [Threat Actors Are Using Ollama's Model Downloader as a Server-Side Weapon](https://labs.zenity.io/post/threat-actors-are-using-ollama-s-model-downloader-as-a-server-side-weapon) | 观测区间为 3 月 24 日至 4 月 11 日；来源 IP、恶意信誉与探测载荷支持活动研判，但不是完整入侵证据。后续代码执行仅为可能链路，不能当作该批请求已达到的结果。 |
| `expanded-litellm-guardrail-exploit-attempts` | 2026-06-30 | [Threat Actors Are Trying to use LiteLLM's Guardrail Tester to Run Code as Root](https://labs.zenity.io/post/threat-actors-are-trying-to-use-litellm-s-guardrail-tester-to-run-code-as-root) | 请求于 4 月 15 日至 5 月 24 日被观测。漏洞利用需要有效主密钥；流量中包含对默认或弱密钥的猜测。实验在 1.83.0 配置中回放，不证明蜜罐请求对应的生产主机均已失陷。 |
| `expanded-rtk-observation-filter` | 2026-05-20 | [Untrusted Project-Local Filters in RTK: When Your AI's Eyes Are Someone Else's to Control](https://www.pillar.security/blog/untrusted-project-local-filters-in-rtk-when-your-ais-eyes-are-someone-elses-to-control) | 研究关注信息可见性的完整性，不是 RTK 自身直接执行任意代码。原文称补丁于 3 月 25 日发布，5 月 20 日为公开披露日期；未报告生产后门实际成功交付。 |
| `expanded-gemini-trustissues-workflow` | 2026-05-05 | [My Agentic Trust Issues: From Prompt Injection to Supply Chain Compromise on Gemini CLI](https://www.pillar.security/blog/my-agentic-trust-issues-from-prompt-injection-to-supply-chain-compromise-on-gemini-cli) | 这是授权研究的 PoC；文中“完整供应链接管”是证明可达到的能力，不表示已向下游发布恶意版本。与 8 月 WIF 报告及 ADK 跨代理报告为不同披露，不能累加为已确认受害者数。 |
| `expanded-copirate-365` | 2026-05-04 | [Copirate 365 at DEF CON: Plundering in the Depths of Microsoft Copilot (CVE-2026-24299)](https://embracethered.com/blog/posts/2026/defcon-talk-copirate-365/) | 原文为研究者的多项实验汇总，非在野入侵通报；各 Copilot 宿主的 CSP 与可用工具不同。原文称外传问题于 2026-03-05 修复，记忆相关问题更早修复。 |
| `expanded-antigravity-find-parameter` | 2026-04-20 | [Prompt Injection Leads to RCE and Sandbox Escape in Antigravity](https://www.pillar.security/blog/prompt-injection-leads-to-rce-and-sandbox-escape-in-antigravity) | 原文为受控实验，非在野利用通报；Google 于 2 月 28 日标记修复。影响针对文中 find_by_name 原生工具的参数处理，不能外推所有搜索工具或当前版本。 |
| `expanded-claude-opus47-memory-image` | 2026-04-17 | [Breaking Opus 4.7 with ChatGPT (Hacking Claude's Memory)](https://embracethered.com/blog/posts/2026/breaking-opus-4.7-with-chatgpt/) | 5/10 是针对单个图片、特定账户与配置的重复实验，不能外推到所有模型或账户。原文后续更新为该样例成功率降至 0%，具体原因未知。 |
| `expanded-agent-commander-c2` | 2026-03-16 | [Agent Commander: Promptware-Powered Command and Control](https://embracethered.com/blog/posts/2026/agent-commander-your-agent-works-for-me-now/) | 文章展示研究者环境中的攻击原语，未公开统一成功率；不同模型与实例会部分执行、拒绝或后来发现恶意指令。工具未广泛公开，不是已观测在野攻击规模。 |
| `expanded-unicode-skill-backdoor` | 2026-02-11 | [Scary Agent Skills: Hidden Unicode Instructions in Skills ...And How To Catch Them](https://embracethered.com/blog/posts/2026/scary-agent-skills/) | 这是人为植入后门的实验，不表示被修改的官方 Skill 上游遭入侵；行为依赖模型与批准设置。作者称 2 月 10 日重试时 Claude Code 已稳定检测该类标签，网页端表现不同。 |
| `expanded-chat-template-backdoor-validation` | 2026-02-10 | [From Discovery to Large-Scale Validation: Chat Template Backdoors Across 18 Models and 4 Engines](https://www.pillar.security/blog/from-discovery-to-large-scale-validation-chat-template-backdoors-across-18-models-and-4-engines) | 这是研究者主动构造的条件后门评估，关注 GGUF 与 Jinja2 模板。文中的成功率限于实验任务、触发条件和模型集合；不能推断平台上已污染模型数量或当前在野流行程度。 |
| `expanded-bizarre-bazaar-llmjacking` | 2026-01-28 | [Operation Bizarre Bazaar: First Attributed LLMjacking Campaign with Commercial Marketplace Monetization](https://www.pillar.security/blog/operation-bizarre-bazaar-first-attributed-llmjacking-campaign-with-commercial-marketplace-monetization) | 35,000 指蜜罐攻击会话，不是成功攻陷数或独立受害者数。商业网关及操作者关联为研究团队的归因判断；同文 MCP 侦察被明确区分为另一活动。 |

AgentForger 两篇文章属于同一攻击链，已合并到一条记录；其[第二篇](https://labs.zenity.io/post/agentforger-part-2-the-autonomous-insider)作为同条记录的补充一手引用，没有另计新增。

## 关键证据处理

- **Dolt MCP 日期冲突**：页首及目录为 2026-08-13，正文时间线却写 8 月 14 日公开博客。数据按页首日期归档，冲突保留在 limitations。
- **Claude Opus 4.7 图片记忆攻击**：原文的初始 5/10 测试与后续更新的 0% 均保留；不能用最初样例成绩描述当前可利用性。
- **Google ADK 跨代理研究**：原文说明重要攻击步骤在模拟仓库复现，且未直接实现供应链完全接管；不沿用文章推广性措辞推高已证明影响。
- **Grand Theft Atlas**：最终购买按钮的确定性限制没有被绕过；研究通过另一助手 Rufus 完成后续动作。明确这是组合边界问题。
- **远程浏览器智能体群**：公开记录能证明三个 VNC 连接成功；数据提取成功与否未知。没有把连接建立写成数据窃取成功。
- **Ollama SSRF**：记录的是蜜罐侦察与回连验证请求；文中可能的后续代码执行链不是这批观测已经达到的结果。
- **LiteLLM 护栏测试**：真实请求被捕获，部分载荷在实验环境复现有效；需要有效主密钥，且 569 是请求数，不是生产服务器失陷数。
- **ChainDrop**：最早报告来源为 StepSecurity。本条引用 Pillar 自己的恶意样本静态分析；没有宣称 Pillar 最先发现该活动或本站执行了样本。
- **Bizarre Bazaar**：35,000 为蜜罐会话而非受害者或成功入侵数；商业服务与操作者关联保留为研究团队研判。

## 已有记录与排重发现

| 原文或案例 | 处理 |
| --- | --- |
| [Deadbugz](https://www.pillar.security/blog/deadbugz-currently-active-mcp-supply-chain-campaign) | 对应 PDF `AISID-2026-0007`，没有新增。原文确认为 23 个 PR，其中 19 已关闭、4 仍开放，均未通过 GitHub 的 PR merge 机制合并；不能将“尚未合并”写成“全部被拦截／拒绝”。原文称 PR 于 2026-08-10 的 74 分钟内提交，公开文章为 8 月 12 日。 |
| SalesBleed、Tensorlake | 已有 PDF 案例，不重复计数。 |
| AgentCorruption 系列 | 与现有云端智能体测试条目可能重合，未拆分系列来补足数量；未在本次新增中宣称已确定其对应关系。 |
| opencode、BadEngram、Unsloth、Grafana MCP、WIF、Visual Studio、SQL Copilot、Claude DNS、Opus 5 Auto Mode、加密推理重放、LLM Heist、Terminal DNS、TOCTOU | 已有一手研究条目，未重复新增。 |
| Gemini TrustIssues（5 月）与已有 A WIF Of Fresh Access（8 月） | 不同披露日期及攻击链；新条目明确为授权 PoC，不把同一仓库多项披露累加为受害者数。 |
| Claude in Chrome 的概览、注入拆解、账户接管技术深挖 | 作为同一研究链，本次只新增概览一条，没有把三个页面计作三次安全事件。 |

本次只写入 `content/expanded-research-items.json` 与本文，没有变更来源登记表、构建产物或部署状态。

