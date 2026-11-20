import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {filterItems} from '../dist/model.js';
import {makeBriefing} from '../dist/publication.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const {items,meta}=read('dist/data/items.json');

test('11-20 保留可选功能、非默认清理、未知入口及对应 CVE 的 KEV 边界',()=>{
 const get=id=>items.find(i=>i.id===id);
 assert.equal(meta.updatedAt,'2026-11-20');
 assert.equal(makeBriefing(items,'2026-11-20','daily').total,0);
 const ms=get('research-microsoft-copilot-device-code-phishing');
 assert.equal(ms.kind,'research');
 assert.equal(ms.originalPublishedAt,'2026-11-17');
 assert.equal(ms.riskAssessment.activity,'controlled_poc');
 assert.match(ms.preconditions.join(' '),/用户批准.*设备码/);
 assert.match(ms.preconditions.join(' '),/在线活动会话/);
 const py=get('cve-2026-133161');
 assert.equal(py.originalPublishedAt,'2026-11-18');
 assert.equal(py.cvePublishedAt,'2026-11-19');
 assert.equal(py.affectedPackages[0].fixedVersion,'0.70.0');
 assert.match(py.preconditions.join(' '),/strip_ansi=True/);
 assert.match(py.recommendation,/v1.*0\.4\.0.*v2/);
 const junie=get('cve-2026-133195');
 assert.equal(junie.affectedPackages[0].fixedVersion,'26.6.29');
 assert.equal(junie.riskAssessment.dimensions.F,null);
 assert.equal(junie.riskAssessment.activity,'unknown');
 assert.equal(junie.riskAssessment.score,null);
 const lite=get('expanded-litellm-guardrail-exploit-attempts');
 assert.equal(lite.originalPublishedAt,'2026-06-30');
 assert.equal(lite.sourceUpdatedAt,'2026-11-18');
 assert.equal(lite.riskAssessment.activity,'confirmed_exploitation');
 assert.equal(lite.riskAssessment.score,73);
 assert.match(lite.limitations,/不证明每条蜜罐请求成功/);
 assert.match(lite.recommendation,/1\.83\.11/);
 assert.equal(items.filter(i=>i.cveIds.includes('CVE-2026-40217')).length,1);
 assert.ok(items.filter(i=>i.reviewedAt==='2026-11-20').every(i=>!i.riskAssessment.reviewed&&!i.riskAssessment.stale));
});

test('11-19 区分行动记录、确认受害和受控研究，版本冲突与上海日期不被抹平',()=>{
 const get=id=>items.find(i=>i.id===id);
 const added=items.filter(i=>i.reviewedAt==='2026-11-19');
 assert.equal(added.length,9);
 assert.equal(makeBriefing(items,'2026-11-19','daily').total,1);
 for(const id of ['primary-near-sglang-intrusion','primary-amazon-madpot-agent-records','primary-gtig-exploit-agent-staging']){
  assert.equal(get(id).riskAssessment.dimensions.F,null);
  assert.equal(get(id).riskAssessment.score,null);
 }
 assert.equal(get('primary-near-sglang-intrusion').originalPublishedAt,'2026-11-09');
 assert.equal(get('primary-near-sglang-intrusion').riskAssessment.activity,'confirmed_exploitation');
 assert.equal(get('primary-amazon-madpot-agent-records').riskAssessment.activity,'observed_attempts');
 assert.match(get('primary-amazon-madpot-agent-records').limitations,/拒绝了每次/);
 assert.equal(get('research-newcore-grok-background-access').riskAssessment.status,'not_applicable');
 assert.match(get('research-newcore-grok-background-access').summary,/没有读到数据/);
 const malware=get('primary-agent-framework-pypi-malware');
 assert.equal(malware.originalPublishedAt,'2026-11-17');
 assert.equal(malware.occurredAt,'2026-11-18');
 assert.equal(malware.affectedPackages[0].fixedVersion,null);
 assert.match(malware.recommendation,/避免启动.*Python 或 pip/);
 const djl=get('cve-2026-129266');
 assert.equal(djl.affectedPackages[0].fixedVersion,'0.40.0');
 assert.match(djl.limitations,/修复 0\.39\.0/);
 assert.equal(get('cve-2026-126816').affectedPackages[1].fixedVersion,null);
 assert.match(get('cve-2026-126816').recommendation,/迁移/);
 assert.match(get('cve-2026-126681').recommendation,/轮换/);
 for(const id of ['cve-2026-129266','cve-2026-126816','cve-2026-126681']){
  assert.equal(get(id).originalPublishedAt,'2026-11-16');
  assert.equal(get(id).cvePublishedAt,'2026-11-17');
 }
 const auto=get('cve-2026-130638');
 assert.equal(auto.originalPublishedAt,'2026-11-18');
 assert.equal(auto.cvePublishedAt,'2026-11-19');
 assert.match(auto.limitations,/不影响.*训练或推理 API/);
 assert.ok(added.every(i=>!i.riskAssessment.reviewed&&!i.riskAssessment.stale));
 assert.ok(added.every(i=>!JSON.stringify(i).includes('??')&&/[\u4e00-\u9fff]/u.test(i.title)));
});

test('11-15 补录不刷新原始日期，厂商事故、实验和 CVE 日期分别保留',()=>{
 const get=id=>items.find(i=>i.id===id);
 const added=items.filter(i=>i.reviewedAt==='2026-11-15');
 assert.equal(added.length,4);
 assert.equal(makeBriefing(items,'2026-11-15','daily').total,0);
 const fireworks=get('primary-fireworks-notion-data-exposure');
 assert.equal(fireworks.originalPublishedAt,'2026-10-09');
 assert.equal(fireworks.sourceUpdatedAt,'2026-11-13');
 assert.equal(fireworks.kind,'incident');
 assert.equal(fireworks.riskAssessment.dimensions.F,null);
 assert.equal(fireworks.riskAssessment.score,null);
 assert.match(fireworks.limitations,/未明确哪次入侵/);
 const darktrace=get('research-darktrace-memory-store-c2');
 assert.equal(darktrace.kind,'research');
 assert.equal(darktrace.riskAssessment.activity,'controlled_poc');
 assert.match(darktrace.limitations,/无客户数据/);
 for(const id of ['cve-2026-110279','cve-2026-129130']){
  assert.equal(get(id).cvePublishedAt,'2026-11-14');
  assert.ok(get(id).originalPublishedAt<'2026-11-14');
 }
 assert.equal(get('cve-2026-110279').affectedPackages[0].fixedVersion,'1.1.1');
 assert.match(get('cve-2026-110279').limitations,/版本栏写 2\.0/);
 assert.equal(get('cve-2026-129130').affectedPackages[0].affectedRange,'= 0.21.36');
 assert.match(get('cve-2026-129130').preconditions.join(' '),/有效 bearer token/);
 assert.ok(added.every(i=>!i.riskAssessment.reviewed&&!i.riskAssessment.stale));
});

test('11-14 保留实际攻击、研究链与两个独立修复的边界',()=>{
 const get=id=>items.find(i=>i.id===id);
 const added=items.filter(i=>i.reviewedAt==='2026-11-14');
 assert.equal(added.length,6);
 assert.equal(makeBriefing(items,'2026-11-14','daily').total,0);
 const railway=get('primary-railway-ai-key-theft');
 assert.equal(railway.originalPublishedAt,'2026-10-21');
 assert.equal(railway.sourceUpdatedAt,'2026-11-12');
 assert.equal(railway.riskAssessment.activity,'confirmed_exploitation');
 assert.equal(get('research-depi-codex-release-chain').kind,'research');
 assert.match(get('research-depi-codex-release-chain').limitations,/未证实.*公开 npm/);
 const cairn=get('primary-unit42-cairn-operations');
 assert.equal(cairn.riskAssessment.activity,'in_the_wild');
 assert.equal(cairn.riskAssessment.dimensions.F,null);
 assert.equal(cairn.riskAssessment.score,null);
 for(const id of ['cve-2026-100307','cve-2026-125926']){
  assert.equal(get(id).originalPublishedAt,'2026-11-11');
  assert.equal(get(id).cvePublishedAt,'2026-11-12');
  assert.equal(get(id).riskAssessment.activity,'attack_path');
 }
 assert.equal(get('cve-2026-100307').affectedPackages[0].fixedVersion,'1.25.0');
 assert.match(get('cve-2026-100307').recommendation,/升级不会清除/);
 assert.equal(get('cve-2026-125926').affectedPackages[0].fixedVersion,'1.35.0');
 assert.match(get('cve-2026-125926').recommendation,/升级不重写/);
 assert.equal(get('research-microsoft-post-training-poisoning').riskAssessment.status,'not_applicable');
 assert.ok(added.every(i=>!i.riskAssessment.reviewed&&!i.riskAssessment.stale));
});
test('审核日期独立于新闻日期，补录历史事件不会成为今日新闻',()=>{
 assert.equal(meta.updatedAt,read('content/review.json').reviewedAt);
 const latest=filterItems(items)[0];
 assert.equal(latest.id,'cve-2026-133195');
 assert.equal(latest.originalPublishedAt,'2026-11-19');
 assert.equal(latest.reviewedAt,'2026-11-20');
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
 assert.equal(meta.updatedAt,'2026-11-20');
 assert.equal(makeBriefing(items,'2026-11-11','daily').total,3);
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
