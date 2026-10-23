# AIHOT 参考与 AI 安全信源清单

核实日期：2026-10-23。本站初版使用人工整理的资料快照；下文的入口检查不代表采集器、定时任务或模型分析已上线。

## 核实对象与许可

已直接读取 [AIHOT](https://github.com/KKKKhazix/AIHOT) 的四个文件与许可证：

| 文件 | 核实结论 | 文件 SHA |
| --- | --- | --- |
| [industry/sources.json](https://github.com/KKKKhazix/AIHOT/blob/main/industry/sources.json) | 首次启动导入的示范信源；之后由后台管理，已有信源不会被 seed 覆盖 | `44dce745cbe4fbbb420f3fed997280496bfbfc7d` |
| [docs/sources.md](https://github.com/KKKKhazix/AIHOT/blob/main/docs/sources.md) | 六种接入、采集预览、来源分级、参与方式、全文许可与外部推送 | 读取的是当日 main 分支文档 |
| [docs/architecture.md](https://github.com/KKKKhazix/AIHOT/blob/main/docs/architecture.md) | API、worker、web 三个进程，共用公开读取层 | `8a504fa21ce47b2a56d29d7abb6c2055fa4e212d` |
| [industry/taxonomy.ts](https://github.com/KKKKhazix/AIHOT/blob/main/industry/taxonomy.ts) | 分类、内容类型、标签同义词、实体名录及身份校验词典 | `3ca88560d6c38dd36d992e0b7ae1dd91916da14b` |
| [LICENSE](https://github.com/KKKKhazix/AIHOT/blob/main/LICENSE) | MIT；复制或实质使用代码时须保留版权与许可声明 | `2d848c9f3fed5317d59e0b88cafa289b42a29d2d` |

软件的 MIT 许可不替代上游文章的版权许可。本站初版自行撰写中文摘要、注明原文；AIHOT 是工程参考项目，不计入安全情报报道来源。

## 示范来源：18 个 RSS，并非线上完整名单

仓库文件明确写有“示范信源”。目前包含 18 个，全部为 `rss`，每个首次回填上限为 8 条，站内与再分发全文均默认关闭。不能据此推断 aihot.news 的生产数据库或线上来源总数。

| 分级 | 示范来源 | 对 AI 安全站的适用性 |
| --- | --- | --- |
| T1 | [OpenAI News](https://openai.com/news/rss.xml) | 可沿用入口，筛选安全研究、滥用调查和事件披露 |
| T1 | [Google DeepMind](https://deepmind.google/blog/rss.xml)、[Google Research](https://research.google/blog/rss/)、[Microsoft Research](https://www.microsoft.com/en-us/research/feed/)、[Berkeley AI Research](https://bair.berkeley.edu/blog/feed.xml) | 可补充安全与对齐研究，但需要主题过滤 |
| T1 | [Hugging Face](https://huggingface.co/blog/feed.xml)、[NVIDIA](https://blogs.nvidia.com/feed/)、[AWS Machine Learning](https://aws.amazon.com/blogs/machine-learning/feed/)、[GitHub AI & ML](https://github.blog/ai-and-ml/feed/)、[Mistral AI](https://mistral.ai/news/rss) | 泛 AI 产品和工程内容较多；作为候选池，不能整源直接收进安全事件流 |
| T2 | [The Verge AI](https://www.theverge.com/rss/ai-artificial-intelligence/index.xml)、[TechCrunch AI](https://techcrunch.com/category/artificial-intelligence/feed/)、[Ars Technica AI](https://arstechnica.com/ai/feed/)、[MIT Technology Review AI](https://www.technologyreview.com/topic/artificial-intelligence/feed)、[The Decoder](https://the-decoder.com/feed/) | 适合发现线索和补充语境；优先追到当事方或原始研究 |
| T2 | [Simon Willison](https://simonwillison.net/atom/everything/) | 提示注入、Agent 和工具权限方面值得重点筛选；保留作者原始论述与研究披露的区别 |
| T2 | [Import AI](https://importai.substack.com/feed)、[Latent Space](https://www.latent.space/feed) | 适合周报和背景研究；更新粒度与内容范围不适合作为实时安全事件主源 |

本表核实了仓库里的配置，未逐一重测这 18 个网络入口。初版信源库另选安全相关性更强的机构与研究者，详见 `content/sources.json`。

## 最值得借鉴的三处设计

1. **把来源身份、展示资格与全文许可分开。** `tier` 表示来源层级；`participation_mode` 分为参与编辑、仅作热度信号与隔离；`site_fulltext` 和 `syndicate_fulltext` 分别控制站内及订阅全文。AI 安全站应保留类似边界，不能因采集成功就自动公开或视为已证实事件。
2. **区分发现时间、原文时间与回填。** AIHOT 将首次导入和超过 48 小时的旧文归档，缺少可信发布时间的资料暂不公开，避免导入资料伪装成今日新闻。本站的快照、PDF 汇编、真实事件与受控研究应分别标识，未知日期保留未知。
3. **用一条公开读取链路约束多个出口。** AIHOT 的网页、RSS、API、MCP、报告等读取同一 publication 层，统一处理撤回与全文资格。事件归组保留报道证据；相关事件关联需要足够桥接证据，避免模型凭相似词把不同事件拼在一起。本站初版先用统一内容文件服务各个视图，后续自动化再接入同一数据链路。

分类也可借鉴其“稳定 key + 中文 label + 边界 guide + 同义词 + 实体词典”的做法。AIHOT 原有模型、产品、行业、论文、教程、观点分类面向泛 AI 新闻；本站需按安全任务重新定义，尤其分开真实事件、研究披露与观点，不能直接把“行业”类视为已发生事故。其身份词典会检查摘要中的机构是否确实在原文出现，可减少安全披露中的张冠李戴。

## 接入方式与后续自动化

AIHOT 支持 `rss`、`web_list`、`json_list`、`x_search`、`mp_account`、`external`。其中网页列表需要选择器，JSON 列表需要字段路径；X、公众号和 Jina 等可能依赖付费接口。`external` 是带令牌的脚本推送入口。其“预览抓取”不写入资料库，也不等于完成生产采集、分析、精选和公开发布。

建议本站第一阶段优先 RSS；Sitemap 只负责发现候选 URL，需继续读取详情并核对发布日期；GitHub Advisory API 需限制 AI 相关包并记录 advisory 标识；数据集采用带版本的批量导入。Sitemap、数据集和 PDF 不应因为都能返回文件就被称为 RSS。

后续数据流建议：采集 → URL / 标识去重 → 保留原始来源与时间 → 安全相关性过滤 → 摘要与分类 → 证据复核 → 事件归组 → 发布。定时采集与模型任务放后台，不在读者打开页面时调用模型。借鉴 AIHOT 的付费请求回执、重试复用和预算上限，可避免重试重复付费。

## 本站来源状态的含义

`content/sources.json` 是来源登记表：

- `checked`：本次调研已测试入口返回 HTTP 200 且 XML / JSON 可解析；不表示持续在线、不表示已接入自动采集，也不保证其每条内容属于 AI 安全。
- `reference`：本地汇编、待接入的数据集 / 订阅，或工程参考；必须结合 `category` 和 `notes` 阅读。
- `checkedAt`：本次来源登记与核实的日期。对于 `reference` 项，仅指资料核实日期，不冒充数据采集成功时间。

已检查的 11 个入口覆盖 Anthropic、OpenAI、Microsoft Security、Trail of Bits、Unit 42、Check Point Research、Embrace The Red、Pillar、Zenity、GitHub Advisories 与 Seebug。它们是候选信源，不是已经运行的采集任务。

补充参考：

- [MITRE ATLAS 数据仓库](https://github.com/mitre-atlas/atlas-data)发布针对 AI 系统的战术、技术与案例数据，适合建立攻击机制标签及历史案例关联；初版未导入。
- [AI Incident Database 快照](https://incidentdatabase.ai/research/snapshots/)提供每周数据库快照，包含 JSON / MongoDB archive / CSV，适合历史事件库；初版未下载或导入全库。
- [AWS Security Bulletins](https://aws.amazon.com/security/security-bulletins/)官方列出 [RSS](https://aws.amazon.com/security/security-bulletins/rss/feed/)；官方说明订阅只保留近 30 天，应另做增量归档；本次未完成该 XML 入口的解析检查。
- 本地《2026年10月人工智能安全事件一览.pdf》由“三所数据安全·AI事鉴”汇编；保留原编号与原始分类，未找到一手出处的条目标记“PDF 汇编，待补原始来源”。

以上均是信源与工程接入研究。初版不会据此展示“自动采集已上线”“实时监测”或未经计算的热度分数。
