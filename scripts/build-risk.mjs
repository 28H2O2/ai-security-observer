import {createHash} from 'node:crypto';
import {RISK_RULES,DIMENSION_KEYS} from '../dist/risk-rules.js';
import {validateAssessment,pendingAssessment} from '../dist/risk-score.js';

const canonical = value => Array.isArray(value) ? value.map(canonical) :
  value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key,canonical(value[key])])) : value;

export function itemFingerprint(item) {
  const {riskAssessment,...facts} = item;
  return createHash('sha256').update(JSON.stringify(canonical(facts))).digest('hex');
}

export function attachRiskAssessments(items,dataset) {
  if (dataset?.ruleVersion !== RISK_RULES.version || !Array.isArray(dataset.assessments)) throw new Error('ASO: 评分数据集或规则版本无效');
  const byId = new Map(items.map(item => [item.id,item]));
  if (byId.size !== items.length) throw new Error('ASO: 事件 ID 重复');
  const assessments = new Map();
  for (const input of dataset.assessments) {
    if (assessments.has(input.itemId)) throw new Error(`ASO: 重复评分对象 ${input.itemId}`);
    const item = byId.get(input.itemId);
    const assessment = validateAssessment(input,item);
    if (input.itemFingerprint !== itemFingerprint(item)) {
      assessment.status = 'needs_review';
      assessment.score = null;
      assessment.reviewed = false;
      assessment.stale = true;
      assessment.reason = '条目材料已变化，原评分需重新核对。';
    }
    assessments.set(input.itemId,assessment);
  }
  return items.map(item => ({...item,riskAssessment: assessments.get(item.id) || pendingAssessment(item.id)}));
}

export function riskCoverage(items) {
  const count = key => Object.fromEntries([...new Set(items.map(item => item[key]))].sort().map(value => [value,items.filter(item => item[key] === value).length]));
  const statuses = Object.fromEntries(Object.keys(RISK_RULES.statuses).map(status => [status,items.filter(item => item.riskAssessment.status === status).length]));
  const pending = items.filter(item => RISK_RULES.pendingStatuses.includes(item.riskAssessment.status));
  return {
    ruleVersion: RISK_RULES.version,total: items.length,byKind: count('kind'),byRisk: count('risk'),byEvidence: count('evidence'),
    withCve: items.filter(item => item.cveIds?.length).length,statuses,
    assessed: items.filter(item => item.riskAssessment.assessedAt !== null).length,
    applicability: {
      applicable: items.filter(item => ['scored','insufficient_evidence'].includes(item.riskAssessment.status)).length,
      notApplicable: statuses.not_applicable,
      undetermined: statuses.needs_review
    },
    pending: pending.map(item => ({itemId: item.id,title: item.title,status: item.riskAssessment.status,
      reason: item.riskAssessment.reason,missingDimensions: DIMENSION_KEYS.filter(key => item.riskAssessment.dimensions[key] === null)}))
  };
}

// An offline contract for a future extractor. It cannot publish a score or mark human review.
export function createRiskCandidate(item,assessedAt) {
  return {...pendingAssessment(item.id),itemFingerprint: itemFingerprint(item),assessedAt,confidence: 'low',
    reason: '候选记录，待核对原始证据。'};
}
