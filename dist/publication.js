import {itemDate,kindNames,riskNames,filterItems} from './model.js';

export const sectionKinds=['incident','advisory','research'];
export function validDate(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;
 const date=new Date(`${value}T00:00:00Z`);
 return Number.isFinite(+date)&&date.toISOString().slice(0,10)===value;
}
export function periodBounds(value,mode='daily'){
 if(!validDate(value))throw new Error('日期无效');
 const date=new Date(`${value}T00:00:00Z`);
 if(mode==='weekly')date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+6)%7);
 const start=date.toISOString().slice(0,10);
 if(mode==='weekly')date.setUTCDate(date.getUTCDate()+6);
 return {start,end:date.toISOString().slice(0,10)};
}
export function makeBriefing(items,value,mode='daily'){
 const {start,end}=periodBounds(value,mode);
 const selected=filterItems(items).filter(item=>itemDate(item)>=start&&itemDate(item)<=end);
 return {mode,start,end,total:selected.length,sections:sectionKinds.map(kind=>({kind,label:kindNames[kind],itemIds:selected.filter(item=>item.kind===kind).map(item=>item.id)}))};
}
export function buildBriefings(items,meta){
 const dates=[...new Set(items.map(itemDate))].sort().reverse();
 const weeks=[...new Set(dates.map(value=>periodBounds(value,'weekly').start))];
 return {meta:{updatedAt:meta.updatedAt,mode:meta.mode,timeZone:meta.timeZone},daily:dates.map(value=>makeBriefing(items,value)),weekly:weeks.map(value=>makeBriefing(items,value,'weekly'))};
}
export function resolveSiteUrl(value,{production=false,vercelProductionDomain}={}){
 if(!value&&vercelProductionDomain){
  if(typeof vercelProductionDomain!=='string'||!/^[a-z0-9.-]+$/i.test(vercelProductionDomain))throw new Error('VERCEL_PROJECT_PRODUCTION_URL 必须是无协议和路径的域名');
  value=`https://${vercelProductionDomain}`;
 }
 if(!value&&production)throw new Error('生产构建必须设置 SITE_URL 为正式 HTTPS 域名');
 const url=new URL(value||'http://127.0.0.1:4173/');
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.search||url.hash)throw new Error('SITE_URL 必须是无凭据、查询或片段的 HTTP(S) 地址');
 const host=url.hostname.toLowerCase();
 const placeholder=/(^|\.)(localhost|local|test|invalid|example|example\.com|example\.org|example\.net)$/.test(host)||!host.includes('.')||host.includes(':')||/^\d+\.\d+\.\d+\.\d+$/.test(host)||/^(your[-.]|replace[-.]|placeholder[.-])/.test(host);
 if(production&&(url.protocol!=='https:'||placeholder))throw new Error('生产 SITE_URL 必须使用正式 HTTPS 域名，不能使用占位或本地地址');
 url.pathname=url.pathname.replace(/\/?$/,'/');return url.href;
}
export function detailUrl(item,base){return new URL(`#/item/${encodeURIComponent(item.id)}`,base).href;}
const md=value=>String(value??'未披露').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/([\\`*_[\]#])/g,'\\$1');
function referenceUrl(value){try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)&&!url.username&&!url.password?url.href.replace(/[()]/g,c=>c==='('?'%28':'%29'):null;}catch{return null;}}
export function itemMarkdown(item,base){
 const lines=[`### ${md(item.title)}`,'',`- 披露日期：${item.originalPublishedAt||'未披露'}${!item.originalPublishedAt?`（汇编归档：${item.publishedAt}）`:''}`,`- 来源：${md(item.sourceName)}｜${kindNames[item.kind]}｜${riskNames[item.risk]}`,`- 资料状态：${item.evidence==='primary'?'附原始披露':'PDF 汇编，待补原文'}`,`- 本站详情：${detailUrl(item,base)}`,'',`**核心摘要：** ${md(item.summary)}`,'',`**影响范围：** ${md(item.impact)}`,'',`**处置建议：** ${md(item.recommendation)}`,'',`**证据与边界：** ${md(item.limitations)}`];
 if(item.cveIds?.length)lines.push('',`**CVE：** ${item.cveIds.map(md).join('、')}`);
 if(item.cvePublishedAt)lines.push('',`**CVE 发布日期：** ${item.cvePublishedAt}`);
 if(item.preconditions?.length)lines.push('','**利用条件：**','',...item.preconditions.map(x=>`- ${md(x)}`));
 if(item.affectedPackages?.length)lines.push('','**受影响版本：**','',...item.affectedPackages.map(p=>`- ${md(p.name)} (${md(p.ecosystem)})：${md(p.affectedRange)}；修复版本：${md(p.fixedVersion)}`));
 lines.push('','**原始来源：**','');
 const refs=(item.references||[]).filter(r=>referenceUrl(r.url));
 lines.push(...refs.map(r=>`- [${md(r.label)}](${referenceUrl(r.url)})`));
 if(item.pdfPage)lines.push(`- 《2026年10月人工智能安全事件一览》第 ${item.pdfPage} 页 · ${md(item.externalId)}`);
 if(!refs.length)lines.push('- 原始公开链接待补。');
 return lines.join('\n');
}
export function exportMarkdown(items,meta,base,{title='复旦 JADE · AI 安全观察',coverage='当前筛选结果'}={}){
 return [`# ${title}`,'',`${coverage} · ${items.length} 条`,'',`按已收录资料汇编 · 资料更新：${meta.updatedAt} · 人工整理，非实时核验`,'',...items.map(item=>itemMarkdown(item,base))].join('\n\n').replace(/\n{3,}/g,'\n\n')+'\n';
}
export function exportJson(items,meta,filters,base){
 return JSON.stringify({meta:{title:meta.title,version:meta.version,updatedAt:meta.updatedAt,timeZone:meta.timeZone,mode:meta.mode,scheduledCollection:false,total:items.length,siteUrl:base},filters,items:items.map(item=>({...item,detailUrl:detailUrl(item,base)}))},null,2)+'\n';
}
export function briefingMarkdown(briefing,items,meta,base){
 const byId=new Map(items.map(item=>[item.id,item]));
 const title=`复旦 JADE · 安全${briefing.mode==='weekly'?'周报':'日报'}`;
 const lines=[`# ${title}`,'',`覆盖日期：${briefing.start} 至 ${briefing.end} · ${briefing.total} 条`,'',`按已收录资料汇编 · 资料更新：${meta.updatedAt} · 人工整理，非实时核验`];
 if(!briefing.total)lines.push('','本站暂无收录。');
 else for(const section of briefing.sections){lines.push('',`## ${section.label}（${section.itemIds.length}）`,'',...(section.itemIds.length?section.itemIds.map(id=>itemMarkdown(byId.get(id),base)):['本站暂无收录。']));}
 return lines.join('\n\n').replace(/\n{3,}/g,'\n\n')+'\n';
}
const xml=value=>String(value??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
const rssDate=value=>new Date(`${value}T00:00:00+08:00`).toUTCString();
export function buildRss(items,meta,base,{preview=false}={}){
 const latest=filterItems(items).slice(0,50);
 return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>${xml('复旦 JADE · AI 安全观察'+(preview?'（本地预览）':''))}</title><link>${xml(base)}</link>
<description>AI 安全事件、漏洞公告与研究披露。人工整理，按已收录资料汇编；不代表实时核验。</description><language>zh-CN</language>
<lastBuildDate>${rssDate(meta.updatedAt)}</lastBuildDate><atom:link href="${xml(new URL('feed.xml',base).href)}" rel="self" type="application/rss+xml"/>
${latest.map(item=>`<item><title>${xml(item.title)}</title><link>${xml(detailUrl(item,base))}</link><guid isPermaLink="true">${xml(detailUrl(item,base))}</guid><pubDate>${rssDate(itemDate(item))}</pubDate><category>${xml(kindNames[item.kind])}</category><description>${xml(`${item.summary}\n来源：${item.sourceName}；${item.originalPublishedAt?'原始披露日期':'汇编归档日期，原始披露日期未确认'}：${itemDate(item)}。\n证据与边界：${item.limitations}`)}</description></item>`).join('\n')}
</channel></rss>\n`;
}
