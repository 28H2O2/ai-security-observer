# 0.4.1 发布与验收记录

验证日期：2026-10-27。Sites 第 8 版已成功发布；源码提交 `804e3a4aa81b01b41941c9b9252df8140face72c`。

线上地址：https://ai-security-observer.groovymesa1.chatgpt.site/

## 资料更新

审阅截止日期通过 `content/review.json` 显式记录，不在每次构建时自动改成当天。新增 3 条，共 79 条，其中 70 条附原始披露、27 条带明确 CVE 编号、13 个实际主来源。

- CreditNirvana CVE-2026-110474：读取 CERT-In 提交到 CVEProject/cvelistV5 的官方记录，原始发布时间 2026-10-26T12:08:43.439Z。受影响版本低于 2.0.0，修复版本 2.0.0。没有将漏洞公告写成已遭利用事件。CERT-In 独立网页本次读取超时，已在详情中注明。
- OpenAI 训练隔离研究：读取 https://openai.com/index/securing-our-frontier-model-training-environment/ ，发布于 10 月 23 日。归入研究披露，不声称客户环境发生逃逸。
- LiteLLM 1.107.0 发布链事件：读取 https://docs.litellm.ai/blog/security-incident-oct-21-2026-attack-chain 及初始事故说明。原始披露 10 月 21 日、定稿复盘 10 月 23 日；纠正初稿关于令牌来源的猜测，保留历史日期。

本次检索截止 10 月 27 日，新增资料中最新确认的原始披露是 10 月 26 日。没有把今日审核或 CVE 数据库收录时间当成今日新事件，也不宣称已经穷尽所有消息源。

## 验收

- 生产构建与 25 项测试通过，包括原有数据、组合筛选、CVE 去重、日/周简报、导出一致性、RSS、生产地址约束和新增日期语义测试。
- 真实线上页面返回版本 0.4.1、79 条资料、审阅日期 2026-10-27；首条为 CreditNirvana。页头不再显示资料更新时间与人工整理字样。
- 1440px 桌面、390px 和 320px 手机检查。首页及简报没有页面横向溢出；Logo 加载成功，邮箱正确。
- 在线搜索 CVE-2026-110474 后立即导出 JSON，只有该条记录；Markdown 也显示 1 条。下载测试捕获 Blob 内容，避免自动化浏览器下载目录产生不必要文件。
- 选择周内日期 10 月 27 日，周报正确覆盖 10 月 26 日至 11 月 1 日，包含 1 条；选择 10 月 27 日日报，显示“本站暂无收录”。
- 浏览器解析 RSS 无 XML 错误，共 50 条，首条与列表一致，链接采用实际站点域名。
- 在线首页资源请求均为同源。此轮未执行运营商级阻断、吞吐或大陆三网测试；不能宣称国内可达性已验收。
- Paseo 远程浏览器能够执行布局和交互检查，但截图接口连续返回 screenshot_no_frame。改用本机 Playwright + 无头 Chrome 访问实际发布地址获取截图，没有替换页面内容或制作效果图。

截图：`output/homepage-desktop.png`、`output/homepage-mobile.png`、`output/homepage-mobile-320.png`。

可部署包：`output/releases/jade-observer-0.4.1.tar.gz`，包含静态网页、Nginx 配置及说明。该包的 SITE_URL 当前指向已发布 Sites 地址；迁移自有域名时应按部署说明重新构建。

当前仍为人工整理静态站，无定时采集、自动评分和实时事实核验服务。香港服务器和自有域名部署、国内三网验收尚未执行。
