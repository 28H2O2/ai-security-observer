import {readFileSync} from 'node:fs';
import {createRiskCandidate} from './build-risk.mjs';
import {validateAssessment} from '../dist/risk-score.js';
const [itemId,assessedAt] = process.argv.slice(2);
if (!itemId || !/^\d{4}-\d{2}-\d{2}$/.test(assessedAt || '')) throw new Error('用法：node scripts/risk-candidate.mjs <事件ID> <YYYY-MM-DD>');
const {items} = JSON.parse(readFileSync(new URL('../dist/data/items.json',import.meta.url),'utf8'));
const item = items.find(item => item.id === itemId);
if (!item) throw new Error(`不存在的事件 ID ${itemId}`);
console.log(JSON.stringify(validateAssessment(createRiskCandidate(item,assessedAt),item),null,2));
