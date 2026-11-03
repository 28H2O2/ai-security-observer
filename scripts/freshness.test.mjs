import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {filterItems} from '../dist/model.js';
import {makeBriefing} from '../dist/publication.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const {items,meta}=read('dist/data/items.json');
test('审核日期独立于新闻日期，补录历史事件不会成为今日新闻',()=>{
 assert.equal(meta.updatedAt,read('content/review.json').reviewedAt);
 const latest=filterItems(items)[0];
 assert.equal(latest.id,'primary-ncsc-ai-cni-outlook');
 assert.equal(latest.originalPublishedAt,'2026-11-03');
 assert.equal(latest.reviewedAt,'2026-11-03');
 const incident=items.find(i=>i.id==='primary-litellm-release-compromise-october');
 assert.equal(incident.originalPublishedAt,'2026-10-21');
 assert.equal(incident.sourceUpdatedAt,'2026-10-23');
 assert.equal(makeBriefing(items,'2026-10-27','daily').total,0);
 assert.equal(makeBriefing(items,'2026-10-26','daily').total,1);
});

test('今日更新保留历史日期、真实攻击与研究边界，未知利用不补零',()=>{
 assert.equal(makeBriefing(items,'2026-11-03','daily').total,1);
 const cursor=items.find(i=>i.id==='primary-cursor-claude-extension-compromise');
 assert.equal(cursor.originalPublishedAt,'2026-10-29');
 assert.equal(cursor.sourceUpdatedAt,'2026-10-30');
 assert.match(cursor.limitations,/失败/);
 const trigger=items.find(i=>i.id==='primary-trigger-env-exposure');
 assert.equal(trigger.originalPublishedAt,'2026-11-01');
 assert.equal(trigger.riskAssessment.dimensions.A,5);
 assert.equal(trigger.riskAssessment.dimensions.F,null);
 assert.equal(trigger.riskAssessment.score,null);
 for(const id of ['cve-2026-93680','cve-2026-110186','cve-2026-110192']){
  const item=items.find(i=>i.id===id);
  assert.equal(item.originalPublishedAt,'2026-10-28');
  assert.equal(item.cvePublishedAt,'2026-10-29');
  if(id==='cve-2026-93680'){
   assert.equal(item.riskAssessment.activity,'controlled_poc');
   assert.equal(item.riskAssessment.score,62);
   assert.ok(item.riskAssessment.sources.some(s=>s.url==='https://github.com/rapid7/metasploit-framework/pull/21942'));
  }else{
   assert.equal(item.riskAssessment.activity,'unknown');
   assert.equal(item.riskAssessment.score,null);
  }
 }
 assert.equal(latestStatus('primary-ncsc-ai-cni-outlook'),'not_applicable');
 assert.equal(latestStatus('research-perplexity-browsesafe-plus-plus'),'not_applicable');
 function latestStatus(id){return items.find(i=>i.id===id).riskAssessment.status;}
});
