import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,cpSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {RISK_RULES,DIMENSION_KEYS,MAX_RISK_SCORE,emptyDimensions} from '../dist/risk-rules.js';
import {calculateRiskScore,validateAssessment,hasRiskScore,pendingAssessment,evidenceUrl} from '../dist/risk-score.js';
import {attachRiskAssessments,riskCoverage,itemFingerprint,createRiskCandidate} from './build-risk.mjs';
import {riskBadge,riskAssessmentMarkup} from '../dist/risk-view.js';
import {riskMethodologyMarkup} from '../dist/risk-methodology.js';
import {filterItems,itemDate} from '../dist/model.js';
import {exportJson,detailUrl} from '../dist/publication.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=name=>JSON.parse(readFileSync(path.join(root,name),'utf8'));
const {items,meta}=read('dist/data/items.json');
const dataset=read('content/risk-assessments.json');
const facts=items.map(({riskAssessment,...item})=>item);
const example=dataset.assessments.find(a=>a.itemId==='primary-opencode-mcp-oauth');
const exampleItem=facts.find(item=>item.id===example.itemId);
const clone=value=>structuredClone(value);
const validated=change=>{const a=clone(example);change(a);return validateAssessment(a,exampleItem);};

test('ASO 公式逐一覆盖全部 1296 种整数输入及 0、100 边界',()=>{
  for(let I=0;I<=5;I++)for(let F=0;F<=5;F++)for(let S=0;S<=5;S++)for(let A=0;A<=5;A++){
    assert.equal(calculateRiskScore({I,F,S,A}),7*I+5*F+4*S+4*A);
  }
  assert.equal(MAX_RISK_SCORE,100);
  assert.equal(calculateRiskScore({I:0,F:0,S:0,A:0}),0);
  assert.equal(calculateRiskScore({I:5,F:5,S:5,A:5}),100);
  assert.ok(Object.isFrozen(RISK_RULES.dimensions.I.anchors));
});

test('未知值不转为零，缺失键、浮点数、字符串、NaN 和越界值被拒绝',()=>{
  for(const key of DIMENSION_KEYS){
    const dimensions={I:5,F:4,S:3,A:2};dimensions[key]=null;
    assert.equal(calculateRiskScore(dimensions),null);
    for(const invalid of [-1,6,1.5,'3',true,undefined,NaN,Infinity]){
      dimensions[key]=invalid;assert.throws(()=>calculateRiskScore(dimensions),/整数或 null/);
    }
    delete dimensions[key];assert.throws(()=>calculateRiskScore(dimensions),/显式包含/);
  }
  for(const invalid of [null,[],{},false,{I:0,F:0,S:0,A:0,extra:1}])assert.throws(()=>calculateRiskScore(invalid));
});

test('正式总分只由完整维度产生，来源总分不能覆盖公式',()=>{
  assert.equal(validateAssessment(example,exampleItem).score,70);
  assert.throws(()=>validated(a=>a.score=100),/总分/);
  assert.throws(()=>validated(a=>a.dimensions.F=null),/缺失维度/);
  const pending=validated(a=>{a.status='needs_review';a.score=null;});
  assert.equal(pending.score,null);assert.equal(hasRiskScore(pending),false);
  assert.throws(()=>validated(a=>a.status='insufficient_evidence'),/未知维度/);
  assert.throws(()=>validated(a=>a.status='not_applicable'),/不适用/);
});

test('来源可信度和人工复核标记均不参与总分',()=>{
  const a=validated(a=>{a.confidence='high';a.reviewed=true;});
  const b=validated(a=>{a.confidence='low';a.reviewed=false;});
  assert.equal(a.score,b.score);
  assert.throws(()=>validated(a=>a.reviewed='true'),/布尔值/);
  assert.throws(()=>validated(a=>a.confidence='certain'),/confidence/);
});

test('规则版本、状态与日期显式校验',()=>{
  for(const value of [undefined,'aso-risk-v2.0'])assert.throws(()=>validated(a=>a.ruleVersion=value),/规则版本/);
  for(const value of ['2026-02-30','2026-13-01','today',null])assert.throws(()=>validated(a=>a.assessedAt=value),/评估日期/);
  assert.throws(()=>validated(a=>a.status='published'),/评估状态/);
  assert.throws(()=>validated(a=>a.reason='  '),/reason/);
  assert.throws(()=>validated(a=>a.itemFingerprint='unknown'),/itemFingerprint/);
});

test('Activity 分类与分值对应，未找到攻击证据不能隐式记零',()=>{
  assert.throws(()=>validated(a=>a.activity='in_the_wild'),/Activity/);
  const unknown=validated(a=>{a.status='insufficient_evidence';a.dimensions.A=null;a.activity='unknown';a.evidence.A={reason:'尚未取得利用证据。',sources:[]};});
  assert.equal(unknown.score,null);
  const noEvidence=validated(a=>{a.activity='confirmed_no_public_evidence';a.dimensions.A=0;a.evidence.A.reason='测试夹具：来源明确陈述核查结果及范围。';});
  assert.equal(noEvidence.score,62);
  assert.throws(()=>validated(a=>{a.dimensions.A=0;a.activity='unknown';}),/Activity/);
});

test('非空维度必须有理由及能追溯的证据引用',()=>{
  assert.throws(()=>validated(a=>delete a.evidence.I),/评分依据/);
  assert.throws(()=>validated(a=>a.evidence.I.reason=''),/缺少文字/);
  assert.throws(()=>validated(a=>a.evidence.F.sources=[]),/可追溯来源/);
  assert.throws(()=>validated(a=>a.evidence.A.sources=['missing']),/不存在的证据/);
  assert.throws(()=>validated(a=>a.sources.push(clone(a.sources[0]))),/重复证据/);
  assert.throws(()=>validated(a=>a.evidence.X=a.evidence.I),/未知证据维度/);
  assert.throws(()=>validated(a=>a.sources[0].locator=''),/locator/);
  assert.throws(()=>validated(a=>a.sources[0].accessedAt='2026-11-12'),/读取日期/);
});

test('证据必须关联 reference 或显式原始 URL，拒绝危险链接',()=>{
  assert.throws(()=>validated(a=>a.sources[0].url='https://unrelated.example/report'),/reference/);
  const explicit=validated(a=>{a.sources[0].kind='primary_url';a.sources[0].url='https://publisher.example/research';});
  assert.equal(explicit.sources[0].kind,'primary_url');
  for(const url of ['javascript:alert(1)','data:text/html,hi','file:///secret','https://user:pass@publisher.example','not-a-url']){
    assert.equal(evidenceUrl(url),null);assert.throws(()=>validated(a=>a.sources[0].url=url),/URL/);
  }
});

test('不存在的事件、重复评分对象和数据集版本不匹配均中止集成',()=>{
  const orphan=clone(example);orphan.itemId='missing-event';
  assert.throws(()=>attachRiskAssessments(facts,{ruleVersion:RISK_RULES.version,assessments:[orphan]}),/不存在的事件 ID/);
  assert.throws(()=>attachRiskAssessments(facts,{ruleVersion:RISK_RULES.version,assessments:[example,example]}),/重复评分对象/);
  assert.throws(()=>attachRiskAssessments([facts[0],facts[0]],dataset),/事件 ID 重复/);
  assert.throws(()=>attachRiskAssessments(facts,{...dataset,ruleVersion:'unknown'}),/版本/);
});

test('构建按最终事件 ID 关联评分，保持原有事实和来源不变',()=>{
  const before=clone(facts),input=clone(dataset);
  const result=attachRiskAssessments(facts,dataset);
  assert.deepEqual(facts,before);assert.deepEqual(dataset,input);
  assert.deepEqual(result.map(({riskAssessment,...item})=>item),facts);
  assert.deepEqual(result,items);
  assert.equal(result.find(item=>item.id==='pdf-2026-0015').riskAssessment.score,56);
  assert.ok(!result.some(item=>item.id==='primary-salesbleed-agentforce'));
  for(const item of result){
    assert.equal(item.riskAssessment.itemId,item.id);
    assert.equal(item.riskAssessment.ruleVersion,RISK_RULES.version);
  }
});

test('条目材料变化使旧分数失效，键顺序变化不影响指纹',()=>{
  const reversed=Object.fromEntries(Object.entries(exampleItem).reverse());
  assert.equal(itemFingerprint(reversed),itemFingerprint(exampleItem));
  assert.equal(itemFingerprint({...exampleItem,riskAssessment:{score:100}}),itemFingerprint(exampleItem));
  const changed=clone(facts);changed.find(item=>item.id===example.itemId).limitations+=' 新证据待核。';
  const result=attachRiskAssessments(changed,dataset).find(item=>item.id===example.itemId).riskAssessment;
  assert.equal(result.status,'needs_review');assert.equal(result.score,null);assert.equal(result.reviewed,false);assert.equal(result.stale,true);
  assert.match(result.reason,/材料已变化/);
  assert.equal(riskBadge(result),'');
});

test('覆盖清单区分已评分、证据不足、不适用和尚未逐项评估',()=>{
  const coverage=riskCoverage(items);
  assert.deepEqual(coverage,read('dist/data/risk-coverage.json'));
  assert.equal(coverage.total,110);assert.equal(coverage.withCve,39);
  assert.equal(coverage.assessed,110);
  assert.deepEqual(coverage.statuses,{scored:88,insufficient_evidence:10,not_applicable:12,needs_review:0});
  assert.deepEqual(coverage.applicability,{applicable:98,notApplicable:12,undetermined:0});
  assert.equal(coverage.pending.length,10);
  assert.equal(new Set(coverage.pending.map(item=>item.itemId)).size,10);
  assert.ok(dataset.assessments.every(a=>a.reviewed===false));
});

test('风险排序降序，同分按日期再按 ID，未评分放最后',()=>{
  const result=filterItems(items,{sort:'risk'});
  assert.equal(result[0].id,'pdf-2026-0004');
  assert.equal(result[0].riskAssessment.score,84);
  for(let index=1;index<88;index++)assert.ok(result[index-1].riskAssessment.score>=result[index].riskAssessment.score);
  assert.ok(result.slice(88).every(item=>!hasRiskScore(item.riskAssessment)));
  const base=items[0];
  const scored=validateAssessment(example,exampleItem);
  const fixtures=[
    {...base,id:'older',originalPublishedAt:'2026-01-01',riskAssessment:scored},
    {...base,id:'b',originalPublishedAt:'2026-02-01',riskAssessment:scored},
    {...base,id:'a',originalPublishedAt:'2026-02-01',riskAssessment:scored},
    {...base,id:'unscored',originalPublishedAt:'2026-12-01',riskAssessment:pendingAssessment('unscored')}
  ];
  assert.deepEqual(filterItems(fixtures,{sort:'risk'}).map(item=>item.id),['a','b','older','unscored']);
  assert.deepEqual(filterItems([...fixtures].reverse(),{sort:'risk'}),filterItems(fixtures,{sort:'risk'}));
});

test('全量评估有逐条来源，部分补证不能制造总分或迁移其他 CVE 的利用证据',()=>{
  assert.equal(dataset.assessments.length,items.length);
  for(const item of items){
    const a=item.riskAssessment;
    assert.ok(a.assessedAt&&a.sources.length>0,item.id);
    assert.equal(a.stale,undefined,item.id);
    assert.equal(a.reviewed,false,item.id);
    if(a.status==='insufficient_evidence'){
      assert.equal(a.score,null,item.id);
      assert.ok(DIMENSION_KEYS.some(k=>a.dimensions[k]===null),item.id);
      for(const k of DIMENSION_KEYS)assert.ok(a.evidence[k].reason,item.id);
    }
  }
  const assessment=id=>items.find(i=>i.id===id).riskAssessment;
  const korea=assessment('pdf-2026-0002');
  assert.deepEqual(korea.dimensions,{I:3,F:null,S:null,A:4});
  assert.ok(korea.sources.some(s=>s.kind==='primary_url'&&s.url.includes('crowdstrike.com/')));
  const mcp=assessment('cve-2026-93680');
  assert.equal(mcp.activity,'controlled_poc');assert.equal(mcp.score,62);
  for(const id of ['cve-2026-110186','cve-2026-110192']){
    assert.equal(assessment(id).dimensions.A,null);
    assert.equal(assessment(id).score,null);
    assert.ok(!assessment(id).sources.some(s=>s.url.includes('metasploit')));
  }
  assert.equal(assessment('pdf-2026-0004').score,84);
  assert.match(assessment('pdf-2026-0004').reason,/初始/);
  assert.match(assessment('pdf-2026-0004').consequences.observed,/来源未知/);
  assert.equal(assessment('expanded-adk-cross-agent-boundary').dimensions.I,3);
  assert.match(assessment('expanded-adk-cross-agent-boundary').consequences.observed,/维护者/);
});

test('0 分仍是有效评分，不与 null 混排',()=>{
  const zero={...validateAssessment(example,exampleItem),score:0,dimensions:{I:0,F:0,S:0,A:0},activity:'confirmed_no_public_evidence'};
  const a={...items[0],id:'zero',riskAssessment:zero};
  const b={...items[0],id:'pending',riskAssessment:pendingAssessment('pending')};
  assert.equal(hasRiskScore(zero),true);assert.match(riskBadge(zero),/ASO 0\/100/);
  assert.deepEqual(filterItems([b,a],{sort:'risk'}).map(item=>item.id),['zero','pending']);
  assert.equal(filterItems([b,a],{assessment:'scored'}).length,1);
});

test('评估筛选保留未评估条目，旧数据没有新字段也能浏览',()=>{
  assert.equal(filterItems(items,{assessment:'scored'}).length,88);
  assert.equal(filterItems(items,{assessment:'pending'}).length,10);
  assert.equal(filterItems(items,{assessment:'not_applicable'}).length,12);
  assert.equal(filterItems(items).length,110);
  assert.equal(filterItems(facts,{assessment:'pending'}).length,110);
  assert.equal(filterItems(facts,{assessment:'scored'}).length,0);
  assert.match(riskAssessmentMarkup(facts[0]),/待评估/);
  assert.equal(riskBadge(undefined),'');
});

test('新增筛选可与搜索、CVE、来源、类别、日期和已读条件组合',()=>{
  const filters={assessment:'scored',topic:'cve',source:'cve',q:'MCP',sort:'risk'};
  const result=filterItems(items,filters);
  assert.deepEqual(result.map(item=>item.id),['cve-2026-105697','cve-2026-59951','cve-2026-111770','cve-2026-104850','cve-2026-123809','cve-2026-111767']);
  assert.deepEqual(filterItems(items,{...filters,unread:true},new Set([result[0].id])).map(i=>i.id),result.slice(1).map(i=>i.id));
  assert.deepEqual(new Set(filterItems(items,{assessment:'scored',view:'incidents',risk:'attack',evidence:'primary'}).map(i=>i.id)),new Set([
    'primary-cursor-claude-extension-compromise','primary-litellm-release-compromise-october','primary-litellm-admin-api-observed-attacks',
    'pdf-2026-0007','expanded-chaindrop-agent-hooks','expanded-ollama-pull-ssrf-observed','expanded-litellm-guardrail-exploit-attempts']));
  assert.equal(filterItems(items,{...filters,period:'7'},new Set(),meta.updatedAt).length,0);
  assert.equal(filterItems(items,{...filters,q:'no-match-985'}).length,0);
  assert.deepEqual(filterItems(items).map(item=>item.id),filterItems(facts).map(item=>item.id));
  assert.deepEqual(filterItems(items,{sort:'oldest'}).map(item=>item.id),filterItems(facts,{sort:'oldest'}).map(item=>item.id));
});

test('JSON 导出保留当前评估筛选、排序、完整证据与详情 URL',()=>{
  const filters={assessment:'scored',sort:'risk',q:'MCP'};
  const list=filterItems(items,filters);
  const exported=JSON.parse(exportJson(list,meta,filters,'https://observer.example/'));
  assert.deepEqual(exported.filters,filters);
  assert.deepEqual(exported.items.map(item=>item.id),list.map(item=>item.id));
  assert.deepEqual(exported.items[0].riskAssessment,list[0].riskAssessment);
  assert.equal(exported.items[0].detailUrl,detailUrl(list[0],'https://observer.example/'));
});

test('详情显示分值、四维条形图、贡献值、来源和评估边界',()=>{
  const item=items.find(item=>item.id===example.itemId),html=riskAssessmentMarkup(item);
  assert.match(html,/ASO 70/);assert.equal((html.match(/<meter /g)||[]).length,4);
  assert.match(html,/贡献 35 分/);assert.match(html,/原始证据/);assert.match(html,/潜在后果/);assert.match(html,/实际观测/);
  assert.match(html,/证据可信度：中/);assert.match(html,/未人工复核/);assert.match(html,/2026-11-11/);
  assert.match(html,/aso-risk-v1\.0/);assert.match(html,/ASO 自定义指标，非 CVSS/);
  assert.ok(html.includes(example.sources[0].url));
  const incomplete=riskAssessmentMarkup(items.find(item=>item.id==='pdf-2026-0002'));
  assert.match(incomplete,/证据不足/);assert.match(incomplete,/未知/);assert.doesNotMatch(incomplete,/ASO \d/);
  assert.equal((incomplete.match(/<meter /g)||[]).length,2);
  const na=riskAssessmentMarkup(items.find(item=>item.id==='primary-microsoft-open-weight-risk-taxonomy'));
  assert.match(na,/不适用/);assert.doesNotMatch(na,/<meter|ASO 0/);
});

test('评分文本与证据链接按文本转义，危险协议不进入 DOM',()=>{
  const item=clone(items.find(item=>item.id===example.itemId));
  const payload='<img src=x onerror="alert(1)">';
  for(const key of DIMENSION_KEYS)item.riskAssessment.evidence[key].reason=payload;
  item.riskAssessment.reason=payload;item.riskAssessment.consequences.observed=payload;
  item.riskAssessment.sources[0].label=payload;item.riskAssessment.sources[0].url='javascript:alert(1)';
  const html=riskAssessmentMarkup(item);
  assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img'));assert.ok(!html.includes('href="javascript:'));
  item.riskAssessment.score=99;
  assert.equal(riskBadge(item.riskAssessment),'');assert.match(riskAssessmentMarkup(item),/评分无效/);
});

test('站内规则与静态说明共享锚点，覆盖链接与实际筛选一致',()=>{
  const html=riskMethodologyMarkup(items);
  assert.equal((html.match(/class="dim-card /g)||[]).length,4);
  assert.equal((html.match(/<li class="lv-/g)||[]).length,24);
  for(const key of DIMENSION_KEYS)for(const anchor of RISK_RULES.dimensions[key].anchors)assert.ok(html.includes(anchor));
  for(const key of DIMENSION_KEYS){
    const levels=[...html.split(`dim-card dim-${key}`)[1].split('</ol>')[0].matchAll(/<li class="lv-(\d)"/g)].map(m=>Number(m[1]));
    assert.deepEqual(levels,[5,4,3,2,1,0]);
  }
  assert.ok(readFileSync(path.join(root,'dist/risk-methodology.html'),'utf8').includes(html));
  assert.match(riskAssessmentMarkup(exampleItem),/待评估/);
  assert.ok(riskAssessmentMarkup(items.find(i=>i.id===example.itemId)).includes('href="#/risk-rules"'));
});

test('未来提取器的离线候选接口不会声称已评分或人工复核',()=>{
  const candidate=createRiskCandidate(exampleItem,'2026-11-03');
  assert.equal(candidate.status,'needs_review');assert.equal(candidate.score,null);assert.equal(candidate.reviewed,false);
  assert.deepEqual(candidate.dimensions,emptyDimensions());
  assert.equal(validateAssessment(candidate,exampleItem).score,null);
});

test('重复构建输出逐字一致；非法评分中止构建并保留已有产物',()=>{
  const dir=mkdtempSync(path.join(tmpdir(),'aso-risk-build-'));
  try{
    for(const name of ['content','dist','scripts'])cpSync(path.join(root,name),path.join(dir,name),{recursive:true});
    cpSync(path.join(root,'package.json'),path.join(dir,'package.json'));
    const env={...process.env,NODE_ENV:'test',VERCEL_ENV:'',SITE_URL:''};
    const run=()=>spawnSync(process.execPath,['scripts/build-data.mjs'],{cwd:dir,env,encoding:'utf8'});
    const outputNames=['data/items.json','data/sources.json','data/briefings.json','data/risk-coverage.json','feed.xml','methodology.html','risk-methodology.html'];
    const snapshot=()=>outputNames.map(name=>readFileSync(path.join(dir,'dist',name),'utf8'));
    let result=run();assert.equal(result.status,0,result.stderr);const first=snapshot();
    result=run();assert.equal(result.status,0,result.stderr);assert.deepEqual(snapshot(),first);
    const bad=clone(dataset);bad.assessments[0].dimensions.I=6;
    writeFileSync(path.join(dir,'content/risk-assessments.json'),JSON.stringify(bad));
    result=run();assert.notEqual(result.status,0);assert.match(result.stderr,/ASO/);assert.deepEqual(snapshot(),first);
    const built=JSON.parse(first[0]);assert.deepEqual(built.items.map(({riskAssessment,...item})=>item),facts);
  }finally{
    assert.equal(path.dirname(path.resolve(dir)),path.resolve(tmpdir()));
    assert.ok(path.basename(dir).startsWith('aso-risk-build-'));
    rmSync(dir,{recursive:true,force:true});
  }
});
