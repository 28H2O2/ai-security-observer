import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,cpSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {filterItems} from '../dist/model.js';
import {sourceCatalogView} from '../dist/source-model.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const read=name=>JSON.parse(readFileSync(path.join(root,name),'utf8'));
const {items,meta}=read('dist/data/items.json');
const audit=read('research/cve-verification-2026-10-23.json');
const imported=items.filter(item=>item.sourceId==='cve');

test('8条公告与已核验资料对应，保留项目日期、版本和来源，不混入真实事件',()=>{
 assert.equal(items.length,76);assert.equal(imported.length,8);
 assert.equal(items.filter(item=>item.evidence==='primary').length,67);
 assert.equal(items.filter(item=>item.kind==='incident').length,24);
 for(const item of imported){
  const evidence=audit.records.find(record=>record.cveId===item.externalId);
  assert.ok(evidence,item.id);assert.equal(item.kind,'advisory');
  assert.equal(item.originalPublishedAt,evidence.originalPublishedAt);
  assert.equal(item.cvePublishedAt,evidence.dates.cvePublishedAtTaipei.slice(0,10));
  assert.deepEqual(item.affectedPackages,evidence.affectedPackages);
  assert.deepEqual(item.preconditions,evidence.preconditions);
  assert.ok(item.references.some(ref=>ref.role==='primary'&&ref.url.includes('/security/advisories/')));
  assert.ok(item.references.some(ref=>ref.url.includes(audit.cveListCommit)));
 }
 const a2a=imported.filter(item=>item.entities.includes('A2A Java SDK'));
 assert.equal(a2a.length,2);assert.ok(a2a.every(item=>item.originalPublishedAt==='2026-08-28'&&item.cvePublishedAt==='2026-10-20'));
});

test('CVE筛选涵盖既有资料，支持编号、包名、来源、时间与已读组合',()=>{
 const all=filterItems(items,{topic:'cve'});
 assert.equal(all.length,26);assert.equal(meta.cveRecords,26);
 assert.ok(all.some(item=>item.externalId==='AISID-2026-0014'));
 assert.equal(filterItems(items,{topic:'cve',source:'cve'}).length,8);
 assert.equal(filterItems(items,{topic:'cve',source:'cve',period:'30'},new Set(),meta.updatedAt).length,6);
 assert.equal(filterItems(items,{topic:'cve',source:'cve',period:'7'},new Set(),meta.updatedAt).length,0);
 assert.equal(filterItems(items,{topic:'cve',q:'cve-2026-111767'})[0].id,'cve-2026-111767');
 assert.equal(filterItems(items,{q:'@modelcontextprotocol/client'})[0].id,'cve-2026-104850');
 assert.equal(filterItems(items,{source:'cve',unread:true},new Set([imported[0].id])).length,7);
 const probe={...imported[0],title:'一般产品公告',summary:'普通描述',tags:[],entities:[],externalId:null,cveIds:[],affectedPackages:[]};
 assert.equal(filterItems([probe],{topic:'cve'}).length,0);
 probe.cveIds=['CVE-2026-111767'];
 assert.equal(filterItems([probe],{q:'CVE-2026-111767'}).length,1);
 assert.equal(filterItems([{...probe,cveIds:[],affectedPackages:[{name:'exact-package-name',ecosystem:'pip'}]}],{q:'exact-package-name'}).length,1);
});

test('新CVE来源可在重构后的关系图中检索、选中，并关联8条情报',()=>{
 const view=sourceCatalogView(read('content/sources.json'),{q:'CVE',source:'cve'});
 assert.equal(view.selected.id,'cve');assert.equal(view.selected.category,'database');
 assert.ok(view.groups.find(group=>group.id==='database').sources.some(source=>source.id==='cve'));
 assert.equal(items.filter(item=>item.sourceId===view.selected.id).length,8);
});

test('构建拒绝重复CVE公告，已有真实利用事件可以单独记录',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'ai-security-cve-test-'));
 try{
  cpSync(path.join(root,'content'),path.join(dir,'content'),{recursive:true});
  cpSync(path.join(root,'package.json'),path.join(dir,'package.json'));
  mkdirSync(path.join(dir,'scripts'));
  cpSync(path.join(root,'scripts/build-data.mjs'),path.join(dir,'scripts/build-data.mjs'));
  const source=read('content/cve-items.json');
  source[1].cveIds.push(source[0].cveIds[0]);
  writeFileSync(path.join(dir,'content/cve-items.json'),JSON.stringify(source));
  const run=()=>spawnSync(process.execPath,[path.join(dir,'scripts/build-data.mjs')],{encoding:'utf8'});
  const rejected=run();assert.notEqual(rejected.status,0);assert.match(rejected.stderr,/重复漏洞公告/);
  source[1].cveIds=[source[1].externalId];
  writeFileSync(path.join(dir,'content/cve-items.json'),JSON.stringify(source));
  const primary=read('content/primary-items.json');
  primary.push({...primary[0],id:'fixture-observed-attack',kind:'incident',externalId:source[0].externalId});
  writeFileSync(path.join(dir,'content/primary-items.json'),JSON.stringify(primary));
  const accepted=run();assert.equal(accepted.status,0,accepted.stderr);
  const built=JSON.parse(readFileSync(path.join(dir,'dist/data/items.json'),'utf8'));
  assert.equal(built.items.length,77);
  assert.equal(built.items.filter(item=>item.cveIds.includes(source[0].externalId)).length,2);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
