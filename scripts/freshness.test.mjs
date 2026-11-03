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
 assert.equal(latest.id,'cve-2026-110474');
 assert.equal(latest.originalPublishedAt,'2026-10-26');
 assert.equal(latest.reviewedAt,'2026-10-27');
 const incident=items.find(i=>i.id==='primary-litellm-release-compromise-october');
 assert.equal(incident.originalPublishedAt,'2026-10-21');
 assert.equal(incident.sourceUpdatedAt,'2026-10-23');
 assert.equal(makeBriefing(items,'2026-10-27','daily').total,0);
 assert.equal(makeBriefing(items,'2026-10-26','daily').total,1);
});
