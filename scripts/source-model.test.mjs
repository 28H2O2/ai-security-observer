import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sourceCatalogView} from '../dist/source-model.js';
const sources=JSON.parse(readFileSync(new URL('../content/sources.json',import.meta.url),'utf8'));
const {items}=JSON.parse(readFileSync(new URL('../dist/data/items.json',import.meta.url),'utf8'));

test('来源图保留15个唯一来源，按4/6/4/1分类，排除PDF和工程参考',()=>{
 const view=sourceCatalogView(sources);
 const visible=view.groups.flatMap(group=>group.sources);
 assert.equal(view.total,15);assert.equal(view.count,15);
 assert.deepEqual(view.groups.map(group=>[group.id,group.sources.length]),[['vendor',4],['research',6],['database',4],['chinese',1]]);
 assert.equal(new Set(visible.map(source=>source.id)).size,15);
 assert.ok(!visible.some(source=>['pdf','aihot'].includes(source.id)));
 assert.equal(view.selected,null);
});
test('未收录的结构化资料仍可选中，不依赖情报数量',()=>{
 const view=sourceCatalogView(sources,{source:'github'});
 assert.equal(view.selected.id,'github');
 assert.equal(items.filter(item=>item.sourceId===view.selected.id).length,0);
 assert.deepEqual(view.groups.find(group=>group.id==='database').sources.map(source=>source.id),['cve','github','atlas','aiid']);
});
test('关键词和分类搜索同步计数，过滤掉选中来源时关闭详情',()=>{
 const vendor=sourceCatalogView(sources,{q:'厂商官方'});
 assert.equal(vendor.count,4);assert.equal(vendor.groups.length,1);
 const pillar=sourceCatalogView(sources,{q:'PILLAR MCP',source:'pillar'});
 assert.equal(pillar.count,1);assert.equal(pillar.selected.id,'pillar');
 assert.equal(sourceCatalogView(sources,{q:'OpenAI',source:'pillar'}).selected,null);
 const empty=sourceCatalogView(sources,{q:'zz-no-source-971',source:'pillar'});
 assert.equal(empty.count,0);assert.equal(empty.groups.length,0);assert.equal(empty.selected,null);
 assert.equal(sourceCatalogView(sources,{source:'pdf'}).selected,null);
});
