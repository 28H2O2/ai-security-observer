import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../dist/data/items.json',import.meta.url),'utf8'));
const sources=JSON.parse(readFileSync(new URL('../dist/data/sources.json',import.meta.url),'utf8'));
test('PDF完整保留16条来源编号、12真实与4研究，不重复计数',()=>{
 const pdf=data.items.filter(i=>i.pdfPage);assert.equal(pdf.length,16);assert.equal(pdf.filter(i=>i.kind==='incident').length,12);assert.equal(pdf.filter(i=>i.kind==='research').length,4);
 assert.equal(new Set(data.items.map(i=>i.id)).size,data.items.length);
 for(let n=1;n<=16;n++)assert.ok(pdf.some(i=>i.externalId===`AISID-2026-${String(n).padStart(4,'0')}`));
});
test('所有原始披露都附来源且参考链接仅为公开HTTP地址',()=>{
 for(const item of data.items){assert.ok(sources.some(s=>s.id===item.sourceId));assert.ok(item.limitations&&item.impact&&item.recommendation);if(item.evidence==='primary')assert.ok(item.references.some(r=>r.role==='primary'));for(const r of item.references){const u=new URL(r.url);assert.ok(['https:','http:'].includes(u.protocol));assert.equal(u.username,'');assert.equal(u.password,'');}}
});
test('PDF与新增披露中的SalesBleed合并为一个事件并保留原编号',()=>{
 assert.equal(data.items.filter(i=>/salesbleed/i.test(i.title+' '+JSON.stringify(i.references))).length,1);
 const item=data.items.find(i=>i.externalId==='AISID-2026-0015');assert.equal(item.sourceId,'zenity');assert.equal(item.evidence,'primary');assert.equal(item.originalPublishedAt,'2026-09-24');assert.ok(item.pdfPage);
});
test('扩充快照覆盖至少60条和10个实际来源，不声明自动采集',()=>{
 assert.equal(data.meta.scheduledCollection,false);assert.equal(data.meta.mode,'curated-snapshot');assert.ok(data.items.length>=60);assert.ok(new Set(data.items.map(item=>item.sourceId)).size>=10);assert.equal(data.items.filter(item=>item.featured).length,0);
});
test('Deadbugz补回一手原文并保留23未合并、19关闭4开放的区别',()=>{
 const item=data.items.find(value=>value.externalId==='AISID-2026-0007');assert.equal(item.evidence,'primary');assert.ok(item.limitations.includes('19'));assert.ok(item.limitations.includes('4'));assert.ok(!item.title.includes('全部被拦截'));
});
test('入口检查与工程参考分开，未来日期不会进入资料快照',()=>{
 assert.equal(sources.filter(s=>s.status==='checked').length,11);assert.equal(sources.find(s=>s.id==='aihot').category,'reference');for(const item of data.items){assert.ok(item.publishedAt<=data.meta.updatedAt);if(item.originalPublishedAt)assert.ok(item.originalPublishedAt<=data.meta.updatedAt);}
});
