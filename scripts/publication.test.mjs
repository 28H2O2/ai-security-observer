import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,cpSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {filterItems,itemDate} from '../dist/model.js';
import {validDate,periodBounds,makeBriefing,buildBriefings,resolveSiteUrl,exportMarkdown,exportJson,briefingMarkdown,buildRss} from '../dist/publication.js';
const {items,meta}=JSON.parse(readFileSync(new URL('../dist/data/items.json',import.meta.url),'utf8'));
const base='https://jade.fudan.edu.cn/observer/'; // Fixture only; not a deployment claim.
test('按周使用周一至周日，跨年、闰日与无效日期',()=>{
 assert.deepEqual(periodBounds('2026-01-01','weekly'),{start:'2025-12-29',end:'2026-01-04'});
 assert.deepEqual(periodBounds('2026-10-25','weekly'),{start:'2026-10-19',end:'2026-10-25'});
 assert.equal(validDate('2024-02-29'),true);assert.equal(validDate('2026-02-29'),false);assert.equal(validDate('2026-13-01'),false);
 assert.throws(()=>periodBounds('2026-02-30'));
});
test('每日与每周归档各覆盖全部去重记录且稳定排序',()=>{
 const index=buildBriefings(items,meta);
 for(const editions of [index.daily,index.weekly]){
  const ids=editions.flatMap(b=>b.sections.flatMap(s=>s.itemIds));
  assert.equal(ids.length,items.length);assert.equal(new Set(ids).size,items.length);
  for(let n=1;n<editions.length;n++)assert.ok(editions[n-1].start>editions[n].start);
  for(const b of editions){assert.equal(b.sections.reduce((n,s)=>n+s.itemIds.length,0),b.total);for(const s of b.sections)for(const id of s.itemIds){const item=items.find(i=>i.id===id);assert.equal(item.kind,s.kind);assert.ok(itemDate(item)>=b.start&&itemDate(item)<=b.end);}}
 }
 assert.deepEqual(buildBriefings([...items].reverse(),meta),index);
 assert.deepEqual(JSON.parse(readFileSync(new URL('../dist/data/briefings.json',import.meta.url),'utf8')),index);
});
test('历史公告按原始披露归档，空日期不产生新内容',()=>{
 const item=items.find(i=>i.cvePublishedAt&&i.cvePublishedAt!==i.originalPublishedAt);
 assert.ok(makeBriefing(items,item.originalPublishedAt).sections.flatMap(s=>s.itemIds).includes(item.id));
 assert.ok(!makeBriefing(items,item.cvePublishedAt).sections.flatMap(s=>s.itemIds).includes(item.id));
 const empty=makeBriefing(items,'2000-01-01');assert.equal(empty.total,0);
 assert.match(briefingMarkdown(empty,items,meta,base),/本站暂无收录/);
});
test('组合筛选和已读条件的 Markdown、JSON 与页面使用相同记录顺序',()=>{
 const conditions=[{source:'embrace',topic:'injection',q:'SSMS'},{view:'research',topic:'cve',sort:'oldest'},{unread:true,period:'30'},{q:'no-match-98432'}];
 const read=new Set(items.slice(0,8).map(i=>i.id));
 for(const filters of conditions){
  const list=filterItems(items,filters,read,meta.updatedAt);
  const json=JSON.parse(exportJson(list,meta,filters,base)),md=exportMarkdown(list,meta,base);
  assert.deepEqual(json.items.map(i=>i.id),list.map(i=>i.id));assert.equal(json.meta.total,list.length);assert.deepEqual(json.filters,filters);
  assert.equal((md.match(/^### /gm)||[]).length,list.length);
  let position=-1;for(const item of list){const link=`${base}#/item/${encodeURIComponent(item.id)}`;assert.ok(md.indexOf(link)>position);position=md.indexOf(link);}
  assert.match(md,/人工整理，非实时核验/);assert.equal(json.meta.updatedAt,meta.updatedAt);
 }
});
test('简报下载保留影响、建议、证据与版本，按三类分组',()=>{
 const item=items.find(i=>i.affectedPackages?.length);
 const b=makeBriefing(items,itemDate(item),'weekly'),md=briefingMarkdown(b,items,meta,base);
 assert.match(md,/## 真实事件/);assert.match(md,/## 漏洞公告/);assert.match(md,/## 研究披露/);
 for(const label of ['影响范围','处置建议','证据与边界','受影响版本'])assert.ok(md.includes(label));
 assert.ok(md.includes(item.affectedPackages[0].name));assert.ok(md.includes(meta.updatedAt));
});
test('RSS 为最近50条，日期稳定、站点路径正确且 XML 特殊字符转义',()=>{
 const rss=buildRss(items,meta,base);
 assert.equal((rss.match(/<item>/g)||[]).length,50);
 assert.ok(rss.indexOf(filterItems(items)[0].id)<rss.indexOf(filterItems(items)[1].id));
 assert.ok(rss.includes(`${base}feed.xml`));assert.ok(!rss.includes('127.0.0.1'));
 assert.equal(buildRss([...items].reverse(),meta,base),rss);
 const dangerous={...items[0],title:'<script>& "标题"',summary:'A & B < C'};
 assert.match(buildRss([dangerous],meta,base),/&lt;script&gt;&amp; &quot;标题&quot;/);
 const fallback={...dangerous,originalPublishedAt:null};assert.match(buildRss([fallback],meta,base),/汇编归档日期，原始披露日期未确认/);
});
test('生产地址拒绝缺失、占位域名、本地地址、凭据与非HTTPS',()=>{
 for(const value of [undefined,'https://example.com','https://jade.example.com','http://jade.fudan.edu.cn','https://localhost','https://127.0.0.1','https://your-domain.com','https://site.test'])assert.throws(()=>resolveSiteUrl(value,{production:true}));
 assert.throws(()=>resolveSiteUrl('https://user@jade.fudan.edu.cn'));
 assert.throws(()=>resolveSiteUrl('https://jade.fudan.edu.cn/#a'));
 assert.equal(resolveSiteUrl(base,{production:true}),base);
 assert.equal(resolveSiteUrl(), 'http://127.0.0.1:4173/');
 const fail=spawnSync(process.execPath,['scripts/build-data.mjs','--production'],{cwd:new URL('..',import.meta.url),env:{...process.env,SITE_URL:'',VERCEL:''},encoding:'utf8'});
 assert.notEqual(fail.status,0);assert.match(fail.stderr,/SITE_URL/);
});

test('Vercel 缺少 SITE_URL 时使用稳定生产域名，显式配置优先且保留校验',()=>{
 const options={production:true,vercelProductionDomain:'ai-security-observer.vercel.app'};
 assert.equal(resolveSiteUrl('',options),'https://ai-security-observer.vercel.app/');
 assert.equal(resolveSiteUrl(base,options),base);
 assert.throws(()=>resolveSiteUrl('http://localhost',options));
 for(const domain of ['localhost','example.com','https://site.vercel.app','user@site.vercel.app','site.vercel.app/path']){
  assert.throws(()=>resolveSiteUrl('',{production:true,vercelProductionDomain:domain}));
 }
 const dir=mkdtempSync(path.join(tmpdir(),'aso-vercel-build-'));
 try{
  for(const name of ['content','dist','scripts','package.json'])cpSync(new URL(`../${name}`,import.meta.url),path.join(dir,name),{recursive:true});
  const env={...process.env,SITE_URL:'',VERCEL:'1',VERCEL_ENV:'production',VERCEL_PROJECT_PRODUCTION_URL:options.vercelProductionDomain,VERCEL_URL:'temporary-preview.vercel.app'};
  const result=spawnSync(process.execPath,['scripts/build-data.mjs','--production'],{cwd:dir,env,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const built=JSON.parse(readFileSync(path.join(dir,'dist/data/items.json'),'utf8'));
  assert.equal(built.meta.siteUrl,'https://ai-security-observer.vercel.app/');
  assert.equal(built.meta.preview,false);
  assert.equal(built.meta.riskScoring.statuses.scored,16);
  const rss=readFileSync(path.join(dir,'dist/feed.xml'),'utf8');
  assert.ok(rss.includes('https://ai-security-observer.vercel.app/feed.xml'));
  assert.ok(!rss.includes('temporary-preview.vercel.app'));
 }finally{
  assert.equal(path.dirname(path.resolve(dir)),path.resolve(tmpdir()));
  assert.ok(path.basename(dir).startsWith('aso-vercel-build-'));
  rmSync(dir,{recursive:true,force:true});
 }
});
