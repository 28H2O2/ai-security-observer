import {RISK_RULES,DIMENSION_KEYS,MAX_RISK_SCORE,RISK_FORMULA} from './risk-rules.js';
import {matchesRiskAssessment} from './risk-score.js';

const STATUS_CARDS=[
 {key:'scored',label:'已评分',hint:'四维证据齐全'},
 {key:'pending',label:'待评估',hint:'未审查或证据不足'},
 {key:'not_applicable',label:'不适用',hint:'无法界定单一问题'}
];
const BOUNDARIES=[
 ['neutral','非 CVSS / EPSS，不是攻击概率'],
 ['blue','四维都有证据才出总分'],
 ['amber','未知保持未知，不按 0 分处理'],
 ['red','公告、CVE 编号都不等于利用证据'],
 ['green','来源可信度单独展示，不加权']
];

export function riskMethodologyMarkup(items=[]) {
 const counts=Object.fromEntries(STATUS_CARDS.map(({key})=>[key,items.filter(item=>matchesRiskAssessment(item,key)).length]));
 const href={scored:'assessment=scored&sort=risk',pending:'assessment=pending',not_applicable:'assessment=not_applicable'};
 const coverage=items.length ? `<section class="rules-panel rules-coverage" aria-label="评分覆盖情况">
<div class="coverage-bar" aria-hidden="true">${STATUS_CARDS.map(({key})=>counts[key]?`<i class="cov-${key}" style="flex:${counts[key]}"></i>`:'').join('')}</div>
<div class="coverage-items">${STATUS_CARDS.map(({key,label,hint})=>`<a class="cov-${key}" href="./#/feed?${href[key]}">${label} <strong>${counts[key]}</strong><small>${hint}</small></a>`).join('')}</div>
</section>` : '';
 const weights=DIMENSION_KEYS.map(key=>{const d=RISK_RULES.dimensions[key];const pct=d.coefficient*RISK_RULES.max;return `<span class="dim-${key}" style="flex:${pct}"><b>${key}</b>${pct}%</span>`;}).join('');
 const dimensions=DIMENSION_KEYS.map(key=>{
  const d=RISK_RULES.dimensions[key];
  return `<section class="dim-card dim-${key}">
<header><span class="dim-letter" aria-hidden="true">${key}</span><h2>${d.name}<small>${d.english}</small></h2><span class="dim-weight">${d.coefficient*RISK_RULES.max}%</span></header>
<ol class="dim-ladder" start="${RISK_RULES.min}">${d.anchors.map((text,value)=>`<li class="lv-${value}"><b>${value}</b><span>${text}</span></li>`).join('')}</ol>
</section>`;
 }).join('');
 return `<article class="risk-rules-page">
<header class="rules-hero">
<div class="rules-title"><h1>评分规则</h1><code>${RISK_RULES.version}</code></div>
<p class="rules-formula" aria-label="${RISK_FORMULA}，总分 ${RISK_RULES.min} 到 ${MAX_RISK_SCORE}">${RISK_FORMULA}<span>= ${RISK_RULES.min}–${MAX_RISK_SCORE}</span></p>
<div class="rules-weights" aria-hidden="true">${weights}</div>
</header>
${coverage}
<div class="dim-grid">${dimensions}</div>
<ul class="rules-boundaries" aria-label="使用边界">${BOUNDARIES.map(([tone,text])=>`<li class="tone-${tone}">${text}</li>`).join('')}</ul>
<footer class="rules-footer"><a href="./data/risk-coverage.json">评估清单 ↗</a><span>评估日期独立于新闻日期；规则变更会发布新版本。</span></footer>
</article>`;
}
