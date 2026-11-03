import {RISK_RULES,DIMENSION_KEYS,emptyDimensions} from './risk-rules.js';

const own = (object,key) => Object.prototype.hasOwnProperty.call(object,key);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const fail = message => {throw new Error(`ASO: ${message}`);};
const requiredText = (value,label) => {
  if (typeof value !== 'string' || !value.trim()) fail(`${label} 缺少文字`);
};
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;

export function evidenceUrl(value) {
  if (typeof value !== 'string' || value !== value.trim()) return null;
  try {
    const url = new URL(value);
    return ['http:','https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch {return null;}
}

export function calculateRiskScore(dimensions) {
  if (!object(dimensions) || Object.keys(dimensions).length !== DIMENSION_KEYS.length ||
      DIMENSION_KEYS.some(key => !own(dimensions,key))) fail('dimensions 必须显式包含 I、F、S、A');
  for (const key of DIMENSION_KEYS) {
    const value = dimensions[key];
    if (value !== null && (!Number.isInteger(value) || value < RISK_RULES.min || value > RISK_RULES.max)) {
      fail(`${key} 必须是 ${RISK_RULES.min}–${RISK_RULES.max} 整数或 null`);
    }
  }
  if (DIMENSION_KEYS.some(key => dimensions[key] === null)) return null;
  return DIMENSION_KEYS.reduce((sum,key) => sum + dimensions[key] * RISK_RULES.dimensions[key].coefficient,0);
}

// Pure validation: no network, date clock, title heuristics, or score coercion.
export function validateAssessment(assessment,item) {
  if (!object(assessment)) fail('评估记录必须是对象');
  const a = assessment;
  if (!item || a.itemId !== item.id) fail(`不存在的事件 ID ${a.itemId}`);
  if (a.ruleVersion !== RISK_RULES.version) fail(`不支持的评分规则版本 ${a.ruleVersion}`);
  if (!own(RISK_RULES.statuses,a.status)) fail(`非法评估状态 ${a.status}`);
  if (!own(RISK_RULES.confidence,a.confidence)) fail('非法 confidence');
  if (typeof a.reviewed !== 'boolean') fail('reviewed 必须是布尔值');
  if (!validDate(a.assessedAt)) fail('assessedAt 必须是真实评估日期 YYYY-MM-DD');
  if (typeof a.itemFingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(a.itemFingerprint)) fail('缺少有效 itemFingerprint');
  requiredText(a.reason,'reason');
  const calculated = calculateRiskScore(a.dimensions);
  if (a.status === 'scored' && calculated === null) fail('缺失维度不能生成正式总分');
  if (a.status === 'insufficient_evidence' && calculated !== null) fail('证据不足必须指出未知维度');
  if (a.status === 'not_applicable' && DIMENSION_KEYS.some(key => a.dimensions[key] !== null)) fail('不适用条目不能赋分');
  const score = a.status === 'scored' ? calculated : null;
  if (own(a,'score') && a.score !== score) fail('总分与公式或评估状态不一致');
  if (!own(RISK_RULES.activity,a.activity) || RISK_RULES.activity[a.activity].value !== a.dimensions.A) {
    fail('Activity 分值与利用证据类型不一致；未知证据应使用 null');
  }
  if (!Array.isArray(a.sources) || !object(a.evidence)) fail('缺少 sources 或 evidence');
  const sourceIds = new Set();
  for (const source of a.sources) {
    if (!object(source)) fail('证据来源必须是对象');
    requiredText(source.id,'source.id');
    if (sourceIds.has(source.id)) fail(`重复证据来源 ${source.id}`);
    sourceIds.add(source.id);
    if (!evidenceUrl(source.url)) fail(`无效证据 URL ${source.id}`);
    if (!RISK_RULES.sourceKinds.includes(source.kind)) fail(`来源类型无效 ${source.id}`);
    if (source.kind === 'reference' && !item.references?.some(ref => evidenceUrl(ref.url) === evidenceUrl(source.url))) {
      fail(`来源未关联现有 reference ${source.id}`);
    }
    requiredText(source.label,'source.label');
    requiredText(source.locator,'source.locator');
    if (!validDate(source.accessedAt) || source.accessedAt > a.assessedAt) fail('来源读取日期无效或晚于评估日期');
  }
  if (Object.keys(a.evidence).some(key => !DIMENSION_KEYS.includes(key))) fail('未知证据维度');
  for (const key of DIMENSION_KEYS) {
    const e = a.evidence[key];
    if (!e && (a.dimensions[key] !== null || a.status === 'insufficient_evidence')) fail(`${key} 缺少评分依据`);
    if (!e) continue;
    requiredText(e.reason,`${key}.reason`);
    if (!Array.isArray(e.sources) || e.sources.some(id => !sourceIds.has(id))) fail(`${key} 引用了不存在的证据来源`);
    if (a.dimensions[key] !== null && !e.sources.length) fail(`${key} 缺少可追溯来源`);
  }
  if (a.status === 'not_applicable' && !a.sources.length) fail('不适用判断缺少来源');
  if (!object(a.consequences)) fail('必须分别记录潜在后果和实际观测');
  for (const key of ['potential','observed']) {
    if (a.status === 'scored') requiredText(a.consequences[key],`consequences.${key}`);
    else if (a.consequences[key] !== null) requiredText(a.consequences[key],`consequences.${key}`);
  }
  return {...a,score};
}

export function pendingAssessment(itemId) {
  return {
    itemId,ruleVersion: RISK_RULES.version,status: 'needs_review',score: null,
    dimensions: emptyDimensions(),confidence: null,evidence: {},sources: [],
    activity: 'unknown',reason: '尚未逐项核对评分证据。',assessedAt: null,reviewed: false,
    consequences: {potential: null,observed: null}
  };
}

export function hasRiskScore(assessment) {
  if (assessment?.status !== 'scored' || assessment.ruleVersion !== RISK_RULES.version || !Number.isInteger(assessment.score)) return false;
  try {return calculateRiskScore(assessment.dimensions) === assessment.score;} catch {return false;}
}

export function matchesRiskAssessment(item,filter = 'all') {
  const assessment = item.riskAssessment;
  if (filter === 'scored') return hasRiskScore(assessment);
  if (filter === 'pending') return !assessment || RISK_RULES.pendingStatuses.includes(assessment.status) ||
    (assessment.status === 'scored' && !hasRiskScore(assessment));
  if (filter === 'not_applicable') return assessment?.status === 'not_applicable';
  return true;
}

export function compareRiskScores(a,b) {
  const scoredA = hasRiskScore(a.riskAssessment),scoredB = hasRiskScore(b.riskAssessment);
  if (scoredA !== scoredB) return scoredA ? -1 : 1;
  return scoredA ? b.riskAssessment.score - a.riskAssessment.score : 0;
}
