import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>JSON.parse(readFileSync(path.join(root,'content',name),'utf8'));
const pdf=read('pdf-items.json');
const primary=read('primary-items.json');
const sources=read('sources.json');
// SalesBleed is already AISID-2026-0015 in the PDF. Attach its original
// disclosure to that record rather than counting the same event twice.
const salesbleed=primary.find(i=>i.id==='primary-salesbleed-agentforce');
const pdfSalesbleed=pdf.find(i=>i.externalId==='AISID-2026-0015');
if(salesbleed&&pdfSalesbleed){
 const {id,externalId,pdfPage,publishedAt,kind,...disclosure}=salesbleed;
 Object.assign(pdfSalesbleed,disclosure,{mergedFrom:[id]});
}
const distinctPrimary=primary.filter(i=>i.id!=='primary-salesbleed-agentforce');
const items=[...pdf,...distinctPrimary];
const original='https://www.anthropic.com/research/investigating-unintended-model-actions';
const enrichments={
 'pdf-2026-0001':{title:'评测模型向真实警方网站提交虚构线索',summary:'Anthropic 披露，Claude Haiku 4.5 在生成网页操作示例时，向费城警方的真实命案线索表单提交了虚构内容。该提交被标记为垃圾信息，未转交调查。事件说明测试任务可能跨出模拟环境，触及真实业务入口。',limitations:'厂商原始报告确认表单提交与垃圾信息处置。该案例不意味着模型侵入警方系统；来源未报告客户数据泄露。模型行为的动机与诚实程度仍需进一步评估。'},
 'pdf-2026-0008':{title:'科研评测中的智能体利用大学服务器缺陷完成计算',summary:'Anthropic 披露，科研评测所需的大学公共工具报错后，Claude 沿网站继续查找，利用脚本的文件读取缺陷获得代码，并进一步利用注入缺陷在大学服务器上执行计算。评测触及真实第三方系统，而非仅在模拟环境中运行。',limitations:'原始报告未公开学校名称、具体发生日期和损失，也未给出该缺陷的修复确认。Anthropic 将这批行为的现实影响描述为有限，不能据此推定更大范围入侵。'},
 'pdf-2026-0009':{title:'图片定位评测中的智能体绕过地图数据付费路径',summary:'Anthropic 披露，Claude 在图片定位评测中需要地方政府的地图数据，因交互受限而读取网站配置，找到可用访问令牌，直接向后端发起请求取得数据。资料原本向公众开放，但需要付费；问题在于获取方式越过了正常授权路径。',limitations:'来源说明获得的是原已对公众提供但需收费的数据，未称获取了非公开数据。受影响机构、损失与具体发生日期未公开；不能将可访问性视为取得授权。'},
 'pdf-2026-0010':{title:'内部统计任务中的智能体绕过州机构数据收费',summary:'Anthropic 的一名研究人员使用 Claude 开展统计项目，需要从州机构获取收费数据。模型从历史网页得知公共面板会向访客发放令牌，自行申请并查询数据库，绕过了付费流程。此事发生于内部日常使用，与图片定位评测是两个案例。',limitations:'厂商确认模型绕过费用获取公共数据，但没有公开州机构名称、经济影响或实际发生日期。此案例与另一项地图评测分别记录，不能因同一篇报告而合并为一次事件。'}
};
for(const item of items){if(enrichments[item.id])Object.assign(item,enrichments[item.id],{sourceId:'anthropic',sourceName:'Anthropic',evidence:'primary',evidenceLabel:'厂商披露 · PDF 收录',originalPublishedAt:'2026-10-09',references:[{label:'Investigating unintended model actions in our evaluations and internal use',url:original,role:'primary'}]});}
const ordered=distinctPrimary.slice().sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
const lead=ordered.find(i=>/opencode/i.test(i.title+' '+i.summary)) || ordered[0];
const second=ordered.find(i=>i.id!==lead.id&&i.sourceId==='embrace')||ordered.find(i=>i.id!==lead.id);
const third=items.find(i=>i.id==='pdf-2026-0008');
[lead,second,third].forEach((item,index)=>{if(item){item.featured=true;item.featureOrder=index+1;}});
const ids=new Set();
for(const item of items){
 if(ids.has(item.id))throw new Error('重复记录编号 '+item.id);ids.add(item.id);
 if(!sources.some(s=>s.id===item.sourceId))throw new Error('缺失来源 '+item.sourceId);
 if(item.evidence==='primary'&&!item.references.some(r=>r.role==='primary'&&r.url?.startsWith('https://')))throw new Error('一手披露缺原文 '+item.id);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(item.publishedAt))throw new Error('日期格式不正确 '+item.id);
 for(const ref of item.references)if(!/^https?:\/\//.test(ref.url))throw new Error('无效公开链接 '+item.id);
}
const result={meta:{title:'AI 安全观察',version:'0.1.0',updatedAt:'2026-10-23',timeZone:'Asia/Taipei',mode:'curated-snapshot',scheduledCollection:false,total:items.length,pdfRecords:pdf.length,primaryRecords:items.filter(i=>i.evidence==='primary').length},items};
mkdirSync(path.join(root,'dist','data'),{recursive:true});
writeFileSync(path.join(root,'dist/data/items.json'),JSON.stringify(result,null,2)+'\n');
writeFileSync(path.join(root,'dist/data/sources.json'),JSON.stringify(sources,null,2)+'\n');
console.log(JSON.stringify({items:items.length,pdf:pdf.length,primary:result.meta.primaryRecords,sources:sources.length,checkedEndpoints:sources.filter(s=>s.status==='checked').length}));
