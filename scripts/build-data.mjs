import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>JSON.parse(readFileSync(path.join(root,'content',name),'utf8'));
const pdf=read('pdf-items.json');
const additions=['expanded-vendor-items.json','expanded-research-items.json'].flatMap(name=>existsSync(path.join(root,'content',name))?read(name):[]);
const primary=[...read('primary-items.json'),...additions];
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
const deadbugz=items.find(item=>item.externalId==='AISID-2026-0007');
if(deadbugz)Object.assign(deadbugz,{
 title:'23 个恶意 MCP 配置合并请求在披露时尚未被合并',
 summary:'Pillar 识别出一批向 AI 和开发工具项目提交恶意 MCP 配置的行动。服务器在前三次正常工具调用后改变元数据，诱导助手寻找敏感凭证并隐瞒操作。披露时 23 个 PR 均未通过 GitHub 合并，其中 19 个关闭、4 个仍开放。',
 sourceId:'pillar',sourceName:'Pillar Security',evidence:'primary',evidenceLabel:'研究者披露 · PDF 收录',originalPublishedAt:'2026-08-12',occurredAt:'2026-08-10',
 references:[{label:'Deadbugz: Currently Active MCP Supply-Chain Campaign',url:'https://www.pillar.security/blog/deadbugz-currently-active-mcp-supply-chain-campaign',role:'primary'}],
 limitations:'原文说明 23 个 PR 在审查时未通过 GitHub 的合并机制合并，其中 19 个关闭、4 个仍开放；这与 PDF“全部被拦截”的概括不同，不能等同于全部已拒绝。报告确认恶意元数据与投递行为，但未证明这些 PR 已造成凭证失窃。',
 impact:'公开配置变更被用于投递带延迟触发的恶意 MCP 服务；所审查的 23 个 PR 在披露时尚未合并。其他渠道传播与实际失窃规模未确定。'
});
const awsDatabase=items.find(item=>item.externalId==='AISID-2026-0014');
if(awsDatabase)Object.assign(awsDatabase,{
 title:'AWS 数据库 Agent 插件的本地辅助程序存在命令注入',
 summary:'AWS 披露 databases-on-aws 插件的 Aurora DSQL 本地辅助程序未完整校验输入。攻击者需先让智能体读取特制内容，再由智能体调用受影响程序，才可能在使用者机器执行命令；1.7.1 及以上已修复。',
 sourceId:'aws',sourceName:'AWS Security',evidence:'primary',evidenceLabel:'厂商公告 · PDF 收录',originalPublishedAt:'2026-10-08',
 tags:['智能体插件','命令执行','CVE-2026-107322'],entities:['AWS','Amazon Agent Plugins for AWS','Aurora DSQL'],
 references:[{label:'CVE-2026-107322: OS Command Injection in Amazon Agent Plugins for AWS',url:'https://aws.amazon.com/security/security-bulletins/2026-130-aws/',role:'primary'}],
 limitations:'受影响的是 1.0.0 至 1.7.0 版插件中的本地辅助程序，并非监听网络的服务。攻击需要智能体先摄取恶意内容，随后调用该程序；不影响 Aurora DSQL 服务，也不绕过数据库权限。公告未提供在野受害者或实际利用记录。',
 impact:'成功利用可按本地辅助程序进程的权限执行系统命令，影响使用插件的主机。Aurora DSQL 服务本身与数据库授权边界不受此漏洞影响。',
 recommendation:'升级到 1.7.1 或更新版本。通过固定 Git 修订安装的用户应使用 8b13a503746a4ebb0402b936645163224058bde3 或后续提交，避免仅固定到 1.7.1 标签；暂时无法升级时停止使用可选 psql 辅助程序。'
});
for(const item of items){delete item.featured;delete item.featureOrder;}
const ids=new Set();
for(const item of items){
 if(ids.has(item.id))throw new Error('重复记录编号 '+item.id);ids.add(item.id);
 if(!sources.some(s=>s.id===item.sourceId))throw new Error('缺失来源 '+item.sourceId);
 if(item.evidence==='primary'&&!item.references.some(r=>r.role==='primary'&&r.url?.startsWith('https://')))throw new Error('一手披露缺原文 '+item.id);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(item.publishedAt))throw new Error('日期格式不正确 '+item.id);
 for(const ref of item.references)if(!/^https?:\/\//.test(ref.url))throw new Error('无效公开链接 '+item.id);
}
const result={meta:{title:'AI 安全观察',version:'0.2.0',updatedAt:'2026-10-23',timeZone:'Asia/Taipei',mode:'curated-snapshot',scheduledCollection:false,total:items.length,pdfRecords:pdf.length,primaryRecords:items.filter(i=>i.evidence==='primary').length,activeSources:new Set(items.map(item=>item.sourceId)).size},items};
mkdirSync(path.join(root,'dist','data'),{recursive:true});
writeFileSync(path.join(root,'dist/data/items.json'),JSON.stringify(result,null,2)+'\n');
writeFileSync(path.join(root,'dist/data/sources.json'),JSON.stringify(sources,null,2)+'\n');
console.log(JSON.stringify({items:items.length,pdf:pdf.length,primary:result.meta.primaryRecords,sources:sources.length,checkedEndpoints:sources.filter(s=>s.status==='checked').length}));
