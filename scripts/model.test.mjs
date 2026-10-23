import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {filterItems} from '../dist/model.js';
const {items,meta}=JSON.parse(readFileSync(new URL('../dist/data/items.json',import.meta.url),'utf8'));
test('首页默认含全部资料，按原文日期展示最新AWS披露',()=>{
 const result=filterItems(items);assert.equal(result.length,items.length);assert.equal(result[0].id,'primary-aws-strands-a2a-isolation');assert.ok(result.some(item=>item.evidence==='compilation'));
});
test('按外部编号找到PDF记录，不受来源证据默认过滤',()=>{
 const result=filterItems(items,{q:'AISID-2026-0014'});assert.equal(result.length,1);assert.equal(result[0].id,'pdf-2026-0014');
});
test('来源与关键词主题可组合，不混入其他来源',()=>{
 const result=filterItems(items,{source:'embrace',q:'SSMS',topic:'injection'});assert.equal(result.length,2);assert.ok(result.every(item=>item.sourceId==='embrace'));
});
test('事件与研究互斥；已读排除和不存在关键词按预期工作',()=>{
 const incidents=filterItems(items,{view:'incidents'});const research=filterItems(items,{view:'research'});assert.equal(incidents.length+research.length,items.length);
 const seen=new Set([items[0].id]);assert.equal(filterItems(items,{unread:true},seen,meta.updatedAt).length,items.length-1);assert.equal(filterItems(items,{q:'zz-no-such-record-971'}).length,0);
});
