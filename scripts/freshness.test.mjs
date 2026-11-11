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
 assert.equal(latest.id,'cve-2026-124848');
 assert.equal(latest.originalPublishedAt,'2026-11-10');
 assert.equal(latest.reviewedAt,'2026-11-11');
 const incident=items.find(i=>i.id==='primary-litellm-release-compromise-october');
 assert.equal(incident.originalPublishedAt,'2026-10-21');
 assert.equal(incident.sourceUpdatedAt,'2026-10-23');
 assert.equal(makeBriefing(items,'2026-10-27','daily').total,0);
 assert.equal(makeBriefing(items,'2026-10-26','daily').total,1);
});

test('今日更新保留历史日期、真实攻击与研究边界，未知利用不补零',()=>{
 assert.equal(makeBriefing(items,'2026-11-03','daily').total,6);
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

test('11月4日补录保留原日期、受控实验和未知条件，不拼接攻击后果',()=>{
 const get=id=>items.find(i=>i.id===id);
 const added=items.filter(i=>i.reviewedAt==='2026-11-04');
 assert.equal(added.length,9);
 assert.equal(makeBriefing(items,'2026-11-04','daily').total,0);
 const gitbook=get('primary-gitbook-infrastructure-credentials');
 assert.equal(gitbook.kind,'incident');assert.equal(gitbook.riskAssessment.dimensions.F,null);
 assert.equal(gitbook.riskAssessment.score,null);assert.match(gitbook.limitations,/可能|范围/);
 const surreal=get('advisory-surrealdb-mcp-statement-injection');
 assert.deepEqual(surreal.cveIds,[]);assert.equal(surreal.riskAssessment.score,null);
 const instatic=get('cve-2026-121458');
 assert.match(instatic.limitations,/0\.0\.5/);assert.match(instatic.limitations,/0\.0\.12/);
 assert.equal(instatic.riskAssessment.activity,'controlled_poc');
 assert.equal(get('research-voluntary-servitude').kind,'research');
 assert.equal(get('research-voluntary-servitude').riskAssessment.dimensions.I,1);
 assert.equal(get('research-glow-mcphantom').riskAssessment.activity,'attack_path');
 for(const id of ['cve-2026-116635','cve-2026-120497']){
  assert.equal(get(id).originalPublishedAt,'2026-11-02');assert.equal(get(id).cvePublishedAt,'2026-11-03');
 }
 assert.match(get('cve-2026-116635').preconditions.join(' '),/--enable-write/);
 assert.match(get('cve-2026-120497').limitations,/不能访问其他本地文件或凭据/);
 assert.ok(added.every(i=>i.riskAssessment.reviewed===false));
});

test('11-10 更新保留原始披露日期，5 条早于上次审阅的资料按原日期排序',()=>{
 const expected={
  'primary-checkpoint-chatgpt-lockdown-bypass':['2026-11-05',63],
  'primary-zenity-agentcorruption-agentcore':['2026-10-08',63],
  'advisory-mcp-server-everything-env-exposure':['2026-10-25',52],
  'cve-2026-111770':['2026-10-15',52],
  'advisory-fastmcp-oauth-issuer-binding':['2026-10-20',48],
  'primary-anthropic-aisi-mythos5-assessment':['2026-10-23',null]
 };
 for(const [id,[date,score]] of Object.entries(expected)){
  const item=items.find(i=>i.id===id);
  assert.equal(item.originalPublishedAt,date,id);
  assert.equal(item.reviewedAt,'2026-11-10',id);
  assert.equal(item.riskAssessment.score,score,id);
 }
 const cve=items.find(i=>i.id==='cve-2026-111770');
 assert.equal(cve.cvePublishedAt,'2026-11-05');
 assert.deepEqual(cve.affectedPackages.map(p=>p.name),['@modelcontextprotocol/server']);
 assert.equal(items.find(i=>i.id==='primary-anthropic-aisi-mythos5-assessment').riskAssessment.status,'not_applicable');
 assert.equal(makeBriefing(items,'2026-11-05','daily').total,1);
 const oct8=makeBriefing(items,'2026-10-08','daily');
 assert.ok(oct8.sections.some(s=>s.itemIds.includes('primary-zenity-agentcorruption-agentcore')));
});

test('11-11 核验保留旧公告日期、上海 CVE 日期和未完成的外传边界',()=>{
 const get=id=>items.find(i=>i.id===id);
 assert.equal(meta.updatedAt,'2026-11-11');
 assert.equal(makeBriefing(items,'2026-11-11','daily').total,0);
 assert.equal(get('advisory-agent-router-mcp-session-subject').originalPublishedAt,'2026-10-07');
 assert.equal(get('advisory-agent-router-mcp-session-subject').riskAssessment.activity,'attack_path');
 const dynatrace=get('cve-2026-123809');
 assert.equal(dynatrace.originalPublishedAt,'2026-06-09');
 assert.equal(dynatrace.cvePublishedAt,'2026-11-10');
 assert.match(dynatrace.riskAssessment.consequences.observed,/未成功投递/);
 assert.match(dynatrace.preconditions.join(' '),/有效连接器/);
 for(const id of ['cve-2026-125271','cve-2026-124848']){
  assert.equal(get(id).originalPublishedAt,'2026-11-10');
  assert.equal(get(id).cvePublishedAt,'2026-11-11');
  assert.equal(get(id).riskAssessment.activity,'attack_path');
 }
 assert.match(get('cve-2026-125271').limitations,/IAM/);
 assert.match(get('cve-2026-124848').recommendation,/启动一次/);
 const paper=get('research-deepmind-adaptive-injection-swarms');
 assert.equal(paper.riskAssessment.status,'not_applicable');
 assert.match(paper.limitations,/关闭.*模型外/);
 const opencode=get('primary-opencode-mcp-oauth');
 assert.equal(items.filter(i=>i.cveIds.includes('CVE-2026-119025')).length,1);
 assert.equal(opencode.originalPublishedAt,'2026-10-19');
 assert.equal(opencode.affectedPackages.length,3);
 assert.equal(opencode.riskAssessment.score,70);
 const reviewed=items.filter(i=>i.reviewedAt==='2026-11-11');
 assert.equal(reviewed.length,8);
 assert.ok(reviewed.every(i=>i.riskAssessment.reviewed===false&&!i.riskAssessment.stale));
});
