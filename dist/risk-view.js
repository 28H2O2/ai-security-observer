import {RISK_RULES,DIMENSION_KEYS,MAX_RISK_SCORE,RISK_FORMULA} from './risk-rules.js';
import {hasRiskScore,pendingAssessment,evidenceUrl} from './risk-score.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sourceLink = (source,label) => evidenceUrl(source?.url) ?
  `<a href="${esc(evidenceUrl(source.url))}" target="_blank" rel="noopener noreferrer" title="${esc(source.label)} · ${esc(source.locator)}">${esc(label)}</a>` : '';

export function riskBadge(assessment) {
  return hasRiskScore(assessment) ? `<span class="aso-badge" title="ASO 自定义指标；${assessment.reviewed ? '已人工复核' : '未人工复核'}" aria-label="ASO 风险评分 ${assessment.score}，满分 ${MAX_RISK_SCORE}">ASO ${assessment.score}/${MAX_RISK_SCORE}</span>` : '';
}

export function riskAssessmentMarkup(item) {
  const a = item.riskAssessment || pendingAssessment(item.id);
  const scored = hasRiskScore(a),notApplicable = a.status === 'not_applicable';
  const sources = Array.isArray(a.sources) ? a.sources : [];
  const citations = ids => (ids || []).map(id => {
    const index = sources.findIndex(source => source.id === id);
    return index < 0 ? '' : sourceLink(sources[index],`[${index + 1}]`);
  }).join(' ');
  const dimensions = !notApplicable && !a.stale && DIMENSION_KEYS.some(key => a.evidence?.[key]) ?
    `<div class="risk-dimensions">${DIMENSION_KEYS.map(key => {
      const rule = RISK_RULES.dimensions[key],value = a.dimensions?.[key];
      const known = Number.isInteger(value) && value >= RISK_RULES.min && value <= RISK_RULES.max;
      return `<div class="risk-dimension"><div class="risk-dimension-heading"><h3>${key} · ${rule.name}</h3><span>${known ? `${value}/${RISK_RULES.max}` : '未知'}${scored ? `<small>贡献 ${value * rule.coefficient} 分</small>` : ''}</span></div>
        ${known ? `<meter min="${RISK_RULES.min}" max="${RISK_RULES.max}" value="${value}" aria-label="${rule.name} ${value}/${RISK_RULES.max}，权重 ${rule.coefficient * RISK_RULES.max}%">${value}/${RISK_RULES.max}</meter>` : '<div class="risk-unknown-bar" aria-hidden="true"></div>'}
        <p>${esc(a.evidence?.[key]?.reason || '尚未核对这一维度的证据。')} <span class="risk-citations">${citations(a.evidence?.[key]?.sources)}</span></p></div>`;
    }).join('')}</div>` : '';
  const validStatus = Object.prototype.hasOwnProperty.call(RISK_RULES.statuses,a.status);
  const status = !scored && a.status === 'scored' ? '待评估 · 评分无效' : validStatus ? RISK_RULES.statuses[a.status] : '待评估';
  return `<section class="risk-assessment" aria-labelledby="risk-assessment-title">
    <div class="risk-heading"><h2 id="risk-assessment-title">安全风险评估</h2><a href="./risk-methodology.html">评分规则 ↗</a></div>
    <div class="risk-total">${scored ? `<strong>ASO ${a.score}<span>/${MAX_RISK_SCORE}</span></strong>` : `<strong class="risk-status">${esc(status)}</strong>`}${!notApplicable && !a.stale && a.assessedAt ? `<span>${esc(RISK_RULES.activity[a.activity]?.label || '')}</span>` : ''}</div>
    <p class="risk-reason">${esc(!scored && a.status === 'scored' ? '评分未通过规则校验，需重新核对。' : a.reason)}</p>
    ${dimensions}
    ${scored ? `<p class="risk-formula">${RISK_FORMULA} = ${a.score}</p>` : ''}
    ${!a.stale && (a.consequences?.potential || a.consequences?.observed) ? `<dl class="risk-consequences">${a.consequences.potential ? `<div><dt>潜在后果</dt><dd>${esc(a.consequences.potential)}</dd></div>` : ''}${a.consequences.observed ? `<div><dt>实际观测</dt><dd>${esc(a.consequences.observed)}</dd></div>` : ''}</dl>` : ''}
    <div class="risk-assessment-meta">${a.confidence && !a.stale ? `<span>证据可信度：${esc(RISK_RULES.confidence[a.confidence] || '未知')}</span>` : ''}${a.assessedAt ? `<span>${a.stale ? '原评估于' : '评估于'} <time datetime="${esc(a.assessedAt)}">${esc(a.assessedAt)}</time></span>` : ''}<span>${a.reviewed ? '已人工复核' : '未人工复核'}</span><code>${esc(a.ruleVersion)}</code></div>
    ${sources.length ? `<details class="risk-evidence"><summary>原始证据</summary><ol>${sources.map(source => `<li>${sourceLink(source,source.label + ' ↗')}<p>${esc(source.locator)} · 读取于 ${esc(source.accessedAt)}</p></li>`).join('')}</ol></details>` : ''}
    <p class="risk-disclaimer">ASO 自定义指标，非 CVSS；不代表攻击概率。</p>
  </section>`;
}
