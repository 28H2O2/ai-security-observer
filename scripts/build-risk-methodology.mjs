import {RISK_RULES} from '../dist/risk-rules.js';
import {riskMethodologyMarkup} from '../dist/risk-methodology.js';
export function riskMethodologyPage(items=[]) {
 return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${RISK_RULES.name} · AI 威胁情报站</title><link rel="stylesheet" href="./styles.css"><link rel="stylesheet" href="./publication.css"><link rel="stylesheet" href="./risk.css"></head>
<body><main class="page-shell"><a class="risk-static-return" href="./#/risk-rules">← 返回站内评分规则</a>${riskMethodologyMarkup(items)}</main></body></html>\n`;
}
