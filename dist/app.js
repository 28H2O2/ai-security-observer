const main = document.querySelector('#main-content');
const icons = {
  search:'<circle cx="9" cy="9" r="6"/><path d="m14 14 4 4"/>',
  bookmark:'<path d="M5 3h10v15l-5-3-5 3z"/>',
  arrow:'<path d="M4 10h12m-5-5 5 5-5 5"/>',
  external:'<path d="M7 4h9v9M16 4 4 16"/>',
  back:'<path d="M16 10H4m5-5-5 5 5 5"/>',
  check:'<path d="m4 10 4 4 8-8"/>',
  evidence:'<path d="m10 2 6 3v5c0 4-6 8-6 8s-6-4-6-8V5z"/><path d="m7 10 2 2 4-4"/>',
  reset:'<path d="M4 7a6 6 0 1 1 0 6M4 3v4h4"/>',
  share:'<path d="M10 13V2m-4 4 4-4 4 4M4 10v7h12v-7"/>',
  empty:'<path d="M3 5h14v12H3zM3 9h4l2 3h2l2-3h4M7 2h6"/>'
};
const svg = name => `<svg aria-hidden="true" viewBox="0 0 20 20">${icons[name] || icons.arrow}</svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kindNames = {incident:'真实事件',research:'研究披露',advisory:'漏洞公告'};
const riskNames = {attack:'针对 AI 的攻击',autonomy:'自主越界',abuse:'AI 滥用',failure:'功能失效'};
const categories = {vendor:'厂商与官方披露',research:'AI 安全研究',security:'安全机构',chinese:'中文资料',database:'结构化资料'};
const topics = [
  {id:'all',label:'全部主题',words:[]},
  {id:'injection',label:'提示注入',words:['提示注入','prompt injection','Promptware','指令注入']},
  {id:'agent',label:'智能体越权',words:['越权','越界','失控','沙箱','自主','权限']},
  {id:'mcp',label:'MCP 与工具',words:['MCP','OAuth','工具投毒','插件']},
  {id:'supply',label:'供应链',words:['供应链','投毒','恶意配置','npm','模型权重']},
  {id:'misuse',label:'模型滥用',words:['滥用','勒索','蒸馏','钓鱼','入侵']}
];
const storagePrefix = 'ai-security-observer:v1:';
function restoreSet(key){try{const v=JSON.parse(localStorage.getItem(storagePrefix+key)||'[]');return new Set(Array.isArray(v)?v.filter(x=>typeof x==='string'):[]);}catch{return new Set();}}
const saved = restoreSet('saved');
const read = restoreSet('read');
let items = [], sources = [], meta = {}, toastTimer, returnHash = '#/feed';
let lastHash = location.hash || '#/feed';
let activeInputMethod = 'pointer';
document.addEventListener('keydown',()=>{activeInputMethod='keyboard';});
document.addEventListener('pointerdown',()=>{activeInputMethod='pointer';});

function persist(key,value){try{localStorage.setItem(storagePrefix+key,JSON.stringify([...value]));return true;}catch{return false;}}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2200);}
function isoDate(item){return item.originalPublishedAt || item.publishedAt;}
function dateNumber(value){const d=Date.parse(value);return Number.isFinite(d)?d:0;}
function displayDate(value){return value ? value.slice(0,10).replaceAll('-','.') : '未披露';}
function shortDate(value){return value ? `${Number(value.slice(5,7))} 月 ${Number(value.slice(8,10))} 日` : '日期待补';}
function safeUrl(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}
function sourceFor(item){return sources.find(s=>s.id===item.sourceId);}
function sourceMark(item){const source=sourceFor(item);return (source?.shortName || item.sourceName || item.sourceId || 'AI').replace(/[^\p{Letter}\p{Number}]/gu,'').slice(0,2).toUpperCase();}
function sourceName(item){return item.sourceName || sourceFor(item)?.name || item.sourceId;}
function sourceBadge(item){return `<span class="source-icon" aria-hidden="true">${esc(sourceMark(item))}</span><span>${esc(sourceName(item))}</span>`;}
function itemUrl(item){return `#/item/${encodeURIComponent(item.id)}`;}
function parseRoute(){
  const hash=location.hash.replace(/^#\/?/,'') || 'feed';
  const split=hash.indexOf('?');
  const path=split<0?hash:hash.slice(0,split);
  const params=new URLSearchParams(split<0?'':hash.slice(split+1));
  const [view,rawId]=path.split('/');
  let id;try{id=decodeURIComponent(rawId||'');}catch{id='';}
  return {view,id,params,q:params.get('q')||'',topic:params.get('topic')||'all',risk:params.get('risk')||'all',source:params.get('source')||'all',period:params.get('period')||'all',evidence:params.get('evidence')||(view==='feed'?'primary':'all'),sort:params.get('sort')||'latest',unread:params.get('unread')==='1',category:params.get('category')||'all'};
}
function updateParam(key,value,{replace=false}={}){
  const route=parseRoute();
  const defaults={q:'',topic:'all',risk:'all',source:'all',period:'all',sort:'latest',unread:'0',category:'all',evidence:route.view==='feed'?'primary':'all'};
  if(value===defaults[key] || !value)route.params.delete(key);else route.params.set(key,value);
  const query=route.params.toString();
  const hash=`#/${route.view}${query?'?'+query:''}`;
  if(replace){history.replaceState(null,'',hash);render({preserveFocus:true});}else location.hash=hash;
}
function clearFilters(){const route=parseRoute();location.hash=`#/${route.view}`;if(!route.params.size)render();}
function matchesTopic(item,topic){if(topic==='all')return true;const t=topics.find(t=>t.id===topic);if(!t)return true;const hay=[item.title,...item.tags,item.summary,...item.entities].join(' ').toLowerCase();return t.words.some(w=>hay.includes(w.toLowerCase()));}
function filteredItems(route){
  let result=items.filter(item=>route.view==='incidents'?item.kind==='incident':route.view==='research'?item.kind!=='incident':route.view==='bookmarks'?saved.has(item.id):true);
  if(route.evidence!=='all')result=result.filter(i=>i.evidence===route.evidence);
  if(route.unread)result=result.filter(i=>!read.has(i.id));
  if(route.source!=='all')result=result.filter(i=>i.sourceId===route.source);
  if(route.risk!=='all')result=result.filter(i=>i.risk===route.risk);
  result=result.filter(i=>matchesTopic(i,route.topic));
  const tokens=route.q.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if(tokens.length)result=result.filter(i=>{const hay=[i.title,i.summary,i.externalId,...i.tags,...i.entities,sourceName(i)].join(' ').toLocaleLowerCase();return tokens.every(t=>hay.includes(t));});
  if(route.period!=='all'){const start=dateNumber(meta.updatedAt)-Number(route.period)*86400000;result=result.filter(i=>dateNumber(isoDate(i))>=start);}
  result.sort((a,b)=>(route.sort==='oldest'?1:-1)*(isoDate(a).localeCompare(isoDate(b))) || a.id.localeCompare(b.id));
  return result;
}
function bookmarkButton(item){return `<button class="bookmark-button ${saved.has(item.id)?'saved':''}" data-action="bookmark" data-id="${esc(item.id)}" aria-label="${saved.has(item.id)?'取消收藏':'收藏'}：${esc(item.title)}" aria-pressed="${saved.has(item.id)}">${svg('bookmark')}</button>`;}
function kindLabel(item){return `<span class="kind ${esc(item.kind)}">${kindNames[item.kind]}</span>`;}
function topicTags(item){return item.tags.slice(0,3).map(t=>`<span class="tag">${esc(t)}</span>`).join('');}
function evidenceBadge(item){return `<span class="evidence-label ${item.evidence==='compilation'?'compilation':''}" title="${item.evidence==='primary'?'已附原始披露，事实与影响仍以原文限定为准':'来自本地 PDF 汇编，尚未补到原始披露'}">${svg(item.evidence==='primary'?'evidence':'empty')}${item.evidence==='primary'?'附原始披露':'PDF 汇编 · 待补原文'}</span>`;}
function metaLine(item){return `<div class="meta">${kindLabel(item)}<span>·</span><time datetime="${esc(isoDate(item))}">${displayDate(isoDate(item))}</time>${item.tags[0]?`<span class="tag">${esc(item.tags[0])}</span>`:''}</div>`;}
function pageHeading(title,description,right=''){return `<div class="section-heading"><div><h1>${title}</h1>${description?`<p>${description}</p>`:''}</div>${right?`<div class="heading-right">${right}</div>`:''}</div>`;}
function renderFocus(){
  const selected=items.filter(i=>i.featured&&i.evidence==='primary').sort((a,b)=>(a.featureOrder||99)-(b.featureOrder||99));
  if(selected.length<3)return '';
  const [lead,...secondary]=selected;
  return `<section class="focus-section" aria-label="重点关注"><article class="focus-lead"><div class="kicker">本期关注 <span class="eyebrow" lang="en">/ IN FOCUS</span></div><h2><a href="${itemUrl(lead)}">${esc(lead.title)}</a></h2><p class="focus-summary">${esc(lead.summary)}</p><div class="focus-bottom"><span class="source-sign">${sourceBadge(lead)}<span>· ${displayDate(isoDate(lead))}</span></span><a class="text-link" href="${itemUrl(lead)}">阅读披露 ${svg('arrow')}</a></div></article><div class="focus-secondary">${secondary.slice(0,2).map((item,i)=>`<article class="focus-small"><span class="focus-number">0${i+2}</span><div>${metaLine(item)}<h3><a href="${itemUrl(item)}">${esc(item.title)}</a></h3><span class="source-sign">${sourceBadge(item)}</span></div></article>`).join('')}</div></section>`;
}
function renderFilters(route){
  const options=sources.filter(s=>items.some(i=>i.sourceId===s.id));
  return `<form class="filter-form" id="filter-form" role="search" aria-label="搜索和筛选情报"><div class="search-row"><label class="search-box" for="search-input">${svg('search')}<input id="search-input" type="search" autocomplete="off" placeholder="搜索事件、产品或 CVE 编号…" aria-label="搜索事件、产品或 CVE 编号" value="${esc(route.q)}"><kbd aria-hidden="true">/</kbd></label><select class="select" id="source-filter" aria-label="按来源筛选" data-filter="source"><option value="all">全部来源</option>${options.map(s=>`<option value="${esc(s.id)}" ${route.source===s.id?'selected':''}>${esc(s.name)}</option>`).join('')}</select></div><div class="topic-row" aria-label="主题筛选">${topics.map(t=>`<button type="button" class="topic-button ${route.topic===t.id?'active':''}" data-action="topic" data-value="${t.id}" aria-pressed="${route.topic===t.id}">${t.label}</button>`).join('')}</div><div class="filter-bottom"><div class="filter-meta"><select class="select" data-filter="evidence" aria-label="按来源证据筛选"><option value="primary" ${route.evidence==='primary'?'selected':''}>一手披露</option><option value="all" ${route.evidence==='all'?'selected':''}>含 PDF 汇编</option><option value="compilation" ${route.evidence==='compilation'?'selected':''}>仅 PDF 汇编</option></select><select class="select" data-filter="period" aria-label="按时间范围筛选"><option value="all" ${route.period==='all'?'selected':''}>全部时间</option><option value="7" ${route.period==='7'?'selected':''}>快照前 7 天</option><option value="30" ${route.period==='30'?'selected':''}>快照前 30 天</option></select><select class="select" data-filter="sort" aria-label="排序方式"><option value="latest" ${route.sort==='latest'?'selected':''}>最新在前</option><option value="oldest" ${route.sort==='oldest'?'selected':''}>最早在前</option></select>${route.risk!=='all'?`<span class="tag">${riskNames[route.risk]||esc(route.risk)}</span>`:''}</div><button type="button" class="filter-reset" data-action="reset">${svg('reset')}清空筛选</button></div></form>`;
}
function renderItem(item,index){return `<article class="news-item ${read.has(item.id)?'is-read':''}" data-item-id="${esc(item.id)}"><span class="news-index">${String(index+1).padStart(2,'0')}</span><div>${metaLine(item)}<h3><a class="news-title" href="${itemUrl(item)}">${esc(item.title)}</a></h3><p class="news-summary">${esc(item.summary)}</p><div class="news-footer"><span class="source-sign">${sourceBadge(item)}</span>${evidenceBadge(item)}</div><div class="item-tags" style="margin-top:10px">${topicTags(item)}</div></div>${bookmarkButton(item)}</article>`;}
function renderList(list,route){
  if(!list.length){const isEmptyCollection=route.view==='bookmarks'&&!saved.size;return `<div class="empty-state">${svg(isEmptyCollection?'bookmark':'search')}<h2>${isEmptyCollection?'暂无收藏':'没有匹配结果'}</h2><p>${isEmptyCollection?'点击条目旁的收藏图标添加。':'更换关键词或清空筛选。'}</p>${isEmptyCollection?'<a class="outline-button" href="#/feed">去看最新披露 →</a>':'<button class="outline-button" data-action="reset">清空筛选</button>'}</div>`;}
  let previous='';
  return list.map((item,index)=>{const date=isoDate(item);const heading=date!==previous?`<div class="day-label"><time datetime="${date}">${shortDate(date)}</time><span>${date.slice(0,4)}</span></div>`:'';previous=date;return heading+renderItem(item,index);}).join('')+`<div class="results-caption">共 ${list.length} 条</div>`;
}
function renderRail(){
  const counts={};Object.keys(riskNames).forEach(key=>counts[key]=items.filter(i=>i.risk===key).length);
  const bySource=sources.filter(s=>s.category!=='reference').map(s=>({...s,count:items.filter(i=>i.sourceId===s.id).length})).filter(s=>s.count).sort((a,b)=>b.count-a.count).slice(0,4);
  return `<aside class="reading-rail" aria-label="资料概览"><section class="rail-block"><h2 class="rail-title">本期资料</h2><div class="numbers"><div><strong>${items.filter(i=>i.kind==='incident').length}</strong><span>真实事件</span></div><div><strong>${items.filter(i=>i.kind!=='incident').length}</strong><span>研究与漏洞</span></div></div></section><section class="rail-block"><h2 class="rail-title">风险分类</h2>${Object.entries(riskNames).map(([key,name])=>`<a class="risk-row" href="#/feed?evidence=all&risk=${key}"><span class="risk-label"><i class="risk-dot ${key}"></i>${name}</span><b>${counts[key]} ↗</b></a>`).join('')}</section><section class="rail-block"><h2 class="rail-title">本期来源 <a href="#/sources" aria-label="查看全部来源">↗</a></h2>${bySource.map(s=>`<a class="source-rail-row" href="#/feed?evidence=all&source=${s.id}"><span class="source-icon">${esc(s.shortName.slice(0,2).toUpperCase())}</span><span>${esc(s.name)}</span><span>${s.count}</span></a>`).join('')}</section></aside>`;
}

function renderFeed(route){
  const info={feed:['情报流','','最近披露'],incidents:['事件档案','','事件记录'],research:['研究披露','','研究与漏洞'],bookmarks:['我的收藏','','收藏资料']}[route.view];
  const list=filteredItems(route);
  const isFiltered=route.params.size>0;
  return pageHeading(info[0],info[1],`${items.length} 条资料 · ${sources.filter(s=>s.category!=='reference').length} 个来源`)+(route.view==='feed'&&!isFiltered?renderFocus():'')+`<div class="list-layout"><section aria-label="${info[2]}"><div class="feed-toolbar"><h2>${info[2]} <span>${list.length} 条</span></h2><div class="toolbar-actions"><label class="toggle-unread"><input type="checkbox" id="unread-toggle" ${route.unread?'checked':''}>只看未读</label></div></div>${renderFilters(route)}<div id="news-list" aria-live="polite">${renderList(list,route)}</div></section>${renderRail()}</div>`;
}
function renderSources(route){
  const available=sources.filter(s=>s.category!=='reference');
  const q=route.q.trim().toLowerCase();
  const list=available.filter(s=>!q||[s.name,s.description,s.method,s.notes].join(' ').toLowerCase().includes(q));
  return pageHeading('来源库','',`${available.length} 个来源 · ${available.filter(s=>s.status==='checked').length} 个入口已核验`)+`<div class="source-tools"><label class="search-box" for="source-search">${svg('search')}<input type="search" id="source-search" aria-label="搜索来源" placeholder="搜索来源或获取方式…" value="${esc(route.q)}"></label><span>入口核验：${displayDate(meta.updatedAt)} · 定时采集待接入</span></div>`+Object.entries(categories).map(([key,label])=>{const group=list.filter(s=>s.category===key);if(!group.length)return '';return `<section class="source-group"><h2 class="source-group-heading">${label}<small>${String(group.length).padStart(2,'0')}</small></h2><div class="source-grid">${group.map(s=>`<article class="source-entry"><span class="source-icon" aria-hidden="true">${esc(s.shortName.slice(0,2))}</span><div><div class="source-entry-header"><h3>${esc(s.name)}</h3><span class="method-label">${esc(s.method.toUpperCase())}</span></div><p>${esc(s.description)}</p><div class="source-status ${s.status==='reference'?'reference':''}"><i></i>${s.status==='checked'?'公开入口已核验':'参考资料'}<span>· ${displayDate(s.checkedAt)}</span></div><div class="source-entry-links">${safeUrl(s.url)?`<a href="${safeUrl(s.url)}" target="_blank" rel="noopener noreferrer">访问来源 ${svg('external')}</a>`:''}${safeUrl(s.endpoint)?`<a href="${safeUrl(s.endpoint)}" target="_blank" rel="noopener noreferrer">查看获取入口 ${svg('external')}</a>`:''}${items.some(i=>i.sourceId===s.id)?`<a href="#/feed?evidence=all&source=${s.id}">本期 ${items.filter(i=>i.sourceId===s.id).length} 条 →</a>`:''}</div><details class="source-details"><summary>接入说明</summary><p>${esc(s.notes)}</p></details></div></article>`).join('')}</div></section>`;}).join('')+(!list.length?`<div class="empty-state">${svg('search')}<h2>没有找到这个来源。</h2><p>试试机构名称，或 RSS、API 等获取方式。</p><button class="outline-button" data-action="reset">清空搜索</button></div>`:'');
}
function renderDetail(id){
  const item=items.find(i=>i.id===id);if(!item)return renderNotFound();
  if(!read.has(id)){read.add(id);persist('read',read);}
  const refs=item.references.filter(r=>safeUrl(r.url));
  const similar=items.filter(i=>i.id!==id&&i.evidence==='primary'&&(i.risk===item.risk||i.tags.some(t=>item.tags.includes(t)))).slice(0,2);
  const source=sourceFor(item);
  return `<div class="back-row"><a class="back-link" href="${esc(returnHash)}">${svg('back')}返回资料列表</a><div class="toolbar-actions"><button class="outline-button" data-action="share" data-id="${esc(id)}">${svg('share')}复制链接</button>${bookmarkButton(item)}</div></div><div class="detail-top"><article class="detail-main"><div class="meta">${kindLabel(item)}<span>·</span><span>${esc(item.evidenceLabel)}</span><span>·</span><time datetime="${esc(isoDate(item))}">${displayDate(isoDate(item))}</time></div><h1>${esc(item.title)}</h1><div class="item-tags">${topicTags(item)}</div>${item.externalId?`<p class="detail-id">${esc(item.externalId)}</p>`:''}<p class="detail-deck">${esc(item.summary)}</p><div class="evidence-box"><h2>${svg('evidence')}证据与边界</h2><p>${esc(item.limitations)}</p></div><section class="detail-section"><h2>已披露的影响 <span lang="en">IMPACT</span></h2><p>${esc(item.impact)}</p></section><section class="detail-section"><h2>可以关注什么 <span lang="en">TAKEAWAY</span></h2><p>${esc(item.recommendation)}</p></section><section class="detail-section"><h2>回到来源 <span lang="en">SOURCE MATERIAL</span></h2>${refs.map(r=>`<a class="reference-link" href="${safeUrl(r.url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(r.label)} <em>↗</em></strong><span>${esc(new URL(r.url).hostname)} · ${r.role==='primary'?'原始披露':'相关资料'}</span></a>`).join('')}${item.pdfPage?`<p class="pdf-reference">另见《2026年10月人工智能安全事件一览》第 ${Number(item.pdfPage)} 页 · 三所数据安全 · ${esc(item.externalId)}。</p>`:''}${!refs.length?'<p class="pdf-reference">此条来自 PDF 汇编，汇编未附公开原始链接；补到原始披露前保留这一状态。</p>':''}</section></article><aside class="detail-rail"><div><h2 class="rail-title">资料卡 <small lang="en">RECORD</small></h2><dl class="detail-dl"><div><dt>披露来源</dt><dd>${esc(sourceName(item))}</dd></div><div><dt>原始披露日期</dt><dd>${displayDate(item.originalPublishedAt)}${!item.originalPublishedAt?' · 汇编发布于 '+displayDate(item.publishedAt):''}</dd></div><div><dt>事件发生时间</dt><dd>${esc(item.occurredAt||'未披露')}</dd></div><div><dt>风险类别</dt><dd>${riskNames[item.risk]}</dd></div><div><dt>涉及对象</dt><dd>${item.entities.map(esc).join('、')||'未具名'}</dd></div><div><dt>资料状态</dt><dd>${item.evidence==='primary'?'已附原始披露':'PDF 汇编，待补原文'}</dd></div></dl>${source?`<a class="text-link" href="#/sources?q=${encodeURIComponent(source.name)}">查看来源信息 ${svg('arrow')}</a>`:''}</div></aside></div>${similar.length?`<section class="related-section"><h2 class="rail-title">继续阅读 <small lang="en">RELATED NOTES</small></h2><div class="related-grid">${similar.map(i=>`<article class="related-item">${metaLine(i)}<h3><a href="${itemUrl(i)}">${esc(i.title)}</a></h3></article>`).join('')}</div></section>`:''}`;
}
function renderAbout(){return pageHeading('收录说明','','')+`<div class="about-layout"><aside class="about-aside">AI SECURITY OBSERVER<br>EDITION 001<br><br>2026.10.23<br>Asia/Taipei</aside><div class="about-copy"><section><h2>我们记录什么</h2><p>AI 安全观察整理与模型、智能体及其工具链直接相关的安全事件和研究披露，包括提示注入、数据外泄、供应链攻击、模型滥用和自主越界。</p><p>初版包含 ${items.length} 条记录：${items.filter(i=>i.kind==='incident').length} 条来源归类的真实事件、${items.filter(i=>i.kind!=='incident').length} 条研究与漏洞披露。PDF 的 16 条资料保留原 AISID 编号和分类；其中部分已补充厂商原始披露。</p></section><section><h2>不同资料，分别阅读</h2><ul><li>真实事件：来源报告已触及真实系统的攻击、滥用、越界或失效。</li><li>研究披露：受控环境中的实验、红队结果和攻击路径。</li><li>漏洞公告：公开披露的受影响条件、版本与修复信息。</li></ul><p>“附原始披露”表示可以回到原作者或厂商的公开材料，不意味着本站独立验证了全部实验、影响与归因。存在日期冲突、厂商异议或未知损失时，详情会保留这些条件。</p></section><section><h2>这是一份资料快照</h2><p>本期整理日期为 2026 年 10 月 23 日。原始披露时间、实际发生时间和汇编发布时间分别保存；未知日期保留未知。当前没有开启定时采集或在线模型摘要。</p><p>来源库登记了 ${sources.filter(s=>s.status==='checked').length} 个已核验公开入口，以及其他可供接入的结构化资料。入口检查只验证访问与数据格式，持续采集的覆盖、稳定性和质量还需要后续验证。</p><p>收藏和已读仅保存在当前浏览器，本期没有注册、云端同步或第三方分析脚本。</p></section><section><h2>框架与开放资料</h2><p>网站采用独立界面和品牌。整理流程参考 AIHOT 的来源分级、按原文日期归档、同事件归组和原始证据引用；仓库中 18 个 RSS 是示范名单，其余信源按 AI 安全主题另行整理。</p><div class="project-ref"><a href="https://github.com/KKKKhazix/AIHOT" target="_blank" rel="noopener noreferrer">AIHOT ↗</a><p>MIT 许可的行业热点框架，含采集、筛选、中文摘要、事件归组和日报。</p></div><div class="project-ref"><a href="https://github.com/nrc-cnrc/ai-safety-radar-securite-ia" target="_blank" rel="noopener noreferrer">AI Safety Radar ↗</a><p>面向 AI safety 与 security 的自动摘要项目，可参考多源配置和静态发布流程。</p></div><div class="project-ref"><a href="https://github.com/clivoa/S33R" target="_blank" rel="noopener noreferrer">S33R ↗</a><p>安全 RSS 聚合、来源状态、历史归档和资讯界面的开源参考。</p></div></section><section><h2>内容归属与更正</h2><p>本站提供简明中文整理和来源链接，原始内容归各作者与机构所有。PDF 资料来自“三所数据安全”发布的《2026年10月人工智能安全事件一览》；未补原文的条目明确标记。</p><p>核对某条资料时，可复制详情链接，并连同原始来源、修正事实和日期提交给站点维护者。</p></section></div></div>`;}
function renderNotFound(){return `<div class="empty-state" style="margin-top:40px"><span class="eyebrow">RECORD NOT FOUND</span><h2>这条资料没有找到。</h2><p>它可能使用了旧链接。返回情报流，按标题或编号重新查找。</p><a class="outline-button" href="#/feed">返回情报流 ${svg('arrow')}</a></div>`;}
function render({preserveFocus=false}={}){
  const active=document.activeElement;
  const focusId=preserveFocus?active?.id:null;
  const start=preserveFocus&&active instanceof HTMLInputElement?active.selectionStart:null;
  const route=parseRoute();
  document.querySelectorAll('[data-nav]').forEach(a=>{const on=a.dataset.nav===route.view;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  const navRail=document.querySelector('.nav-links');
  const activeNav=navRail.querySelector('[aria-current="page"]');
  if(activeNav){const railRect=navRail.getBoundingClientRect();const activeRect=activeNav.getBoundingClientRect();if(activeRect.right>railRect.right)navRail.scrollLeft+=activeRect.right-railRect.right+8;else if(activeRect.left<railRect.left)navRail.scrollLeft-=railRect.left-activeRect.left+8;}
  const validSaved=[...saved].filter(id=>items.some(i=>i.id===id));
  document.querySelector('#bookmark-count').textContent=validSaved.length;
  const titles={feed:'情报流',incidents:'事件档案',research:'研究披露',sources:'来源库',bookmarks:'我的收藏',about:'收录说明'};
  document.title=`${route.view==='item'?(items.find(i=>i.id===route.id)?.title||'资料详情'):(titles[route.view]||'页面未找到')} | AI 安全观察`;
  main.innerHTML=['feed','incidents','research','bookmarks'].includes(route.view)?renderFeed(route):route.view==='sources'?renderSources(route):route.view==='item'?renderDetail(route.id):route.view==='about'?renderAbout():renderNotFound();
  if(focusId){const target=document.getElementById(focusId);target?.focus({preventScroll:true});if(start!==null&&target?.type==='search'){try{target.setSelectionRange(start,start);}catch{}}}
}

document.addEventListener('click',async event=>{
  if(event.target.closest('.skip-link')){event.preventDefault();main.focus();main.scrollIntoView({block:'start'});return;}
  const button=event.target.closest('[data-action]');
  if(!button)return;
  const action=button.dataset.action;
  if(action==='bookmark'){
    const id=button.dataset.id;const had=saved.has(id);had?saved.delete(id):saved.add(id);
    const stored=persist('saved',saved);render({preserveFocus:true});toast(stored?(had?'已取消收藏':'已收藏'):'收藏已临时保存；当前浏览器未允许本地存储');
  }else if(action==='topic')updateParam('topic',button.dataset.value);
  else if(action==='reset')clearFilters();
  else if(action==='share'){
    const url=new URL(location.href);url.hash=`/item/${encodeURIComponent(button.dataset.id)}`;
    try{await navigator.clipboard.writeText(url.href);toast('详情链接已复制');}catch{
      const input=document.createElement('input');input.value=url.href;input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();let copied=false;try{copied=document.execCommand('copy');}catch{}input.remove();toast(copied?'详情链接已复制':'可从浏览器地址栏复制详情链接');
    }
  }
});
document.addEventListener('change',event=>{if(event.target.matches('[data-filter]'))updateParam(event.target.dataset.filter,event.target.value);if(event.target.id==='unread-toggle')updateParam('unread',event.target.checked?'1':'0');});
let searchTimer;
document.addEventListener('input',event=>{if(['search-input','source-search'].includes(event.target.id)){const value=event.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(()=>updateParam('q',value,{replace:true}),180);}});
document.addEventListener('submit',event=>{if(event.target.id==='filter-form'){event.preventDefault();clearTimeout(searchTimer);updateParam('q',document.querySelector('#search-input').value,{replace:true});}});
document.addEventListener('keydown',event=>{
  if(event.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName)){const input=document.querySelector('#search-input, #source-search');if(input){event.preventDefault();input.focus();}}
  if(event.key==='Escape'&&event.target.matches('#search-input, #source-search')){clearTimeout(searchTimer);event.target.value='';updateParam('q','',{replace:true});}
});
window.addEventListener('hashchange',()=>{
  clearTimeout(searchTimer);
  const old=lastHash;lastHash=location.hash;
  const next=parseRoute();
  const oldView=old.replace(/^#\/?/,'').split(/[/?]/)[0];
  if(next.view==='item'&&oldView!=='item')returnHash=old;
  render();
  if(oldView!==next.view){window.scrollTo({top:0});if(activeInputMethod==='keyboard')main.focus({preventScroll:true});}
});
window.addEventListener('storage',event=>{if([storagePrefix+'saved',storagePrefix+'read'].includes(event.key)){const target=event.key.endsWith('saved')?saved:read;const fresh=restoreSet(event.key.endsWith('saved')?'saved':'read');target.clear();fresh.forEach(x=>target.add(x));render();}});

try{
  const responses=await Promise.all([fetch('./data/items.json'),fetch('./data/sources.json')]);
  if(responses.some(r=>!r.ok))throw new Error('资料文件读取失败');
  const [data,sourceData]=await Promise.all(responses.map(r=>r.json()));
  items=data.items;sources=sourceData;meta=data.meta;
  render();
}catch(error){main.innerHTML=`<div class="empty-state"><h1>资料暂时未能打开。</h1><p>请刷新页面重试。${location.protocol==='file:'?'本地预览请先运行 npm start，再打开终端显示的网址。':''}</p><button class="outline-button" data-reload>重新加载</button></div>`;document.querySelector('[data-reload]')?.addEventListener('click',()=>location.reload());console.error(error);}
