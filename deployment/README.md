# 部署与国内访问验收

本包是复旦 JADE「AI 威胁情报站」0.4.0 的静态发布准备材料。当前没有提供正式域名和服务器，香港节点与大陆三网可达性尚未验收。

## 构建与打包

使用 Node.js 22 与系统 tar。所有读者端资源都位于 dist，不依赖 CDN、远程字体、模型接口或 GitHub 数据请求。

下面的 npm 命令在源码仓库中执行。发布归档只包含静态产物与部署材料，不包含构建源码；预览包需要回到源码仓库设置正式域名并重新打包。

```sh
npm ci
npm run package:preview
```

预览包名带 `-preview`，RSS 中是本地地址，**不能直接用于正式发布**。Windows PowerShell 生产构建：

```powershell
$env:SITE_URL = 'https://你的真实域名/'
npm run package
```

Linux/macOS：

```sh
SITE_URL='https://你的真实域名/' npm run package
```

上述域名必须替换为实际已配置的域名。打包过程依次执行生产构建、全部测试、tar 归档，产物在 output/releases。SITE_URL 缺失、占位、本地或非 HTTPS 时生产构建失败；不会自动退回某个托管商的域名。当前 Nginx 模板按站点根路径部署，SITE_URL 因此使用域名根路径。子路径托管需要相应修改 root/location。

## 香港 Linux + Nginx

准备具备域名解析、有效 TLS 证书的香港节点；域名 A/AAAA 记录必须指向实际提供服务的地址。不存在可用 IPv6 服务时不要发布 AAAA 记录。服务器无需 Node.js，只需 Nginx 和构建后的文件。

将归档解压到独立版本目录，例如 `/srv/jade-observer/releases/0.4.0-20261027/`，其中应含 `dist/index.html`。`current` 是指向版本目录的符号链接。先保留原 current 的指向，再切换新版本；不要覆盖运行中的目录。

以下命令在服务器执行，变量必须填写实际值；命令只作为部署说明，不会由打包脚本自动运行。

```sh
export SITE_HOST='实际域名'
export RELEASE_ROOT='/srv/jade-observer'
export TLS_CERT='/实际证书目录/fullchain.pem'
export TLS_KEY='/实际证书目录/privkey.pem'
envsubst '${SITE_HOST} ${RELEASE_ROOT} ${TLS_CERT} ${TLS_KEY}' \
  < deployment/nginx.conf.template > /etc/nginx/conf.d/jade-observer.conf
nginx -t
```

务必保留 envsubst 的限定变量列表，否则会误替换 Nginx 的 `$uri` 和 `$request_uri`。证书私钥留在服务器，不进入仓库或发布包。

首次发布创建 current 链接；升级时记录旧版本路径，建立 `current.next` 后用原子重命名替换 current。示例（版本路径由本次实际上传结果决定）：

```sh
readlink /srv/jade-observer/current
ln -s /srv/jade-observer/releases/0.4.0-20261027 /srv/jade-observer/current.next
mv -Tf /srv/jade-observer/current.next /srv/jade-observer/current
nginx -t && systemctl reload nginx
```

校验首页、CSS、JS、Logo、三份 data JSON、methodology.html 和 feed.xml 返回 200，RSS 链接指向正式域名。发生问题时用相同的建立新链接与原子替换流程将 current 指回记录的旧版本。归档只发布 dist；deployment、research 和源代码留在 Web 根目录之外。

缓存使用 no-cache，浏览器每次重新校验，避免未版本化资源在升级后长期滞留。Nginx 限制资源加载为同源；外部资料只能通过读者主动点击链接访问。内容更新后重新构建发布，不会自动采集。

## 大陆网络验收表

在真实电信、联通、移动网络分别关闭代理后测试，记录城市、运营商、时间、设备、URL、状态码、加载耗时、失败次数/总次数。每个网络至少测试三轮。

| 项目 | 验收要求 | 当前状态 |
| --- | --- | --- |
| DNS / TLS / 首页 | 无解析、证书或连接错误，能显示情报 | 待真实域名与节点 |
| 搜索 / 筛选 / 详情 | 组合筛选和返回状态正常，正文完整 | 待三网实测 |
| 日报 / 周报 / 空日期 | 日期范围、内容、空状态正确 | 待三网实测 |
| Markdown / JSON 下载 | 文件可打开，条数匹配所选结果 | 待三网实测 |
| RSS | XML 可解析，最新 50 条和正式域名正确 | 待三网实测 |
| 第三方阻断 | 阻断第三方请求后，本站核心阅读仍正常 | 待三网实测 |

不能用香港服务器自身的请求成功，或本机开启代理的测试结果，代替大陆三网验收。若延迟或失败率不可接受，再调整线路、节点或迁移到具备相应条件的大陆/校内资源。
