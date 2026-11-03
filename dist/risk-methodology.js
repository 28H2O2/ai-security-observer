import {RISK_RULES,DIMENSION_KEYS,MAX_RISK_SCORE,RISK_FORMULA} from './risk-rules.js';
import {matchesRiskAssessment} from './risk-score.js';

export function riskMethodologyMarkup(items=[]) {
 const counts=Object.fromEntries(['scored','pending','not_applicable'].map(status=>[status,items.filter(item=>matchesRiskAssessment(item,status)).length]));
 const coverage=items.length ? `<section class="risk-coverage" aria-label="评分覆盖情况"><h2>当前覆盖</h2><div><a href="./#/feed?assessment=scored&sort=risk">已评分 <strong>${counts.scored}</strong></a><a href="./#/feed?assessment=pending">待评估 <strong>${counts.pending}</strong></a><a href="./#/feed?assessment=not_applicable">不适用 <strong>${counts.not_applicable}</strong></a></div><p>共 ${items.length} 条。待评估包含尚未逐项审查和关键证据不足的资料，不能把它们全部当作低风险。</p></section>` : '';
 return `<article class="risk-rules-page"><h1>${RISK_RULES.name}</h1>
<p>根据公开证据，评估已界定的安全漏洞和攻击机制。分数用于比较技术后果、攻击条件、影响范围与利用证据。ASO 是本站自定义指标，非 CVSS、EPSS，也不是经过统计校准的攻击概率。</p>
<p><code>${RISK_FORMULA}</code>，总分 ${RISK_RULES.min}–${MAX_RISK_SCORE}。四维均有证据才计算总分；未知值保留为 null。分数越高，代表这套规则下的风险越高。</p>
${coverage}<h2>四个维度</h2>
${DIMENSION_KEYS.map(key => {const d=RISK_RULES.dimensions[key];return `<section><h3>${key} · ${d.name} / ${d.english} · ${d.coefficient * RISK_RULES.max}%</h3><table><thead><tr><th>分值</th><th>依据</th></tr></thead><tbody>${d.anchors.map((text,value) => `<tr><td>${value}</td><td>${text}</td></tr>`).join('')}</tbody></table></section>`;}).join('')}
<h2>怎样读评分</h2><p>后果维度描述有证据支持的潜在能力；实际观测单列。研究 PoC 可以证明机制可行，攻击请求可以证明有人尝试；成功入侵还需要相应记录。官方公告、CVE 编号与来源声誉都不能替代利用证据。</p>
<p>仅仅没有找到 PoC 或攻击记录时，A 保留为未知。已有具体路径可按 A=1 评估，但不能声称已经排除实际利用。A=0 需要明确记录核查范围与来源。来源可信度单独展示，不参与加权。</p>
<p>影响范围按已披露的产品、版本和配置判断。厂商规模、下载量或目标数量不直接等于受影响部署数。修复已发布不会降低固有后果，当前修复建议仍见条目正文。</p>
<h2>未评分的资料</h2><p>尚未逐项核对的条目显示“待评估”；缺少关键证据时保留具体缺口。方法文章或无法界定单一安全问题的资料可标为“不适用”。材料变化后，旧分数会暂停显示，等待重新复核。</p>
<p>“已评分”表示四维证据齐全并通过程序校验。是否人工复核另行显示；当前标注尚未人工复核。初版没有行业严重性等级或风险区间阈值。</p>
<h2>维护与版本</h2><p>评估日期独立于新闻日期，重新构建不会刷新日期。每次修改保存证据位置和理由，规则版本固定为 <code>${RISK_RULES.version}</code>。权重或分值定义变化时发布新版本，保留旧版记录，再用同一组样本比较差异。</p>
<p>当前覆盖情况与逐条待评估原因见 <a href="./data/risk-coverage.json">评估清单</a>。分数依赖公开材料与评估者判断，尚未经过多评估者一致性检验或历史攻击数据校准。</p>
</article>`;
}
