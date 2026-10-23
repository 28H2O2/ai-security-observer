export const kindNames={incident:'真实事件',research:'研究披露',advisory:'漏洞公告'};
export const riskNames={attack:'针对 AI 的攻击',autonomy:'自主越界',abuse:'AI 滥用',failure:'功能失效'};
export const topics=[
 {id:'all',label:'全部',words:[]},
 {id:'cve',label:'CVE 漏洞',words:[]},
 {id:'injection',label:'提示注入',words:['提示注入','prompt injection','Promptware','指令注入']},
 {id:'agent',label:'智能体',words:['Agent','智能体','越权','越界','权限','沙箱']},
 {id:'mcp',label:'MCP 与工具',words:['MCP','OAuth','工具投毒','插件']},
 {id:'supply',label:'供应链',words:['供应链','投毒','恶意配置','npm','模型权重']},
 {id:'misuse',label:'模型滥用',words:['滥用','勒索','蒸馏','钓鱼','入侵']}
];
export function itemDate(item){return item.originalPublishedAt||item.publishedAt;}
export function filterItems(items,filters={},read=new Set(),snapshotDate='2026-10-23'){
 const {view='feed',q='',source='all',topic='all',risk='all',period='all',evidence='all',sort='latest',unread=false}=filters;
 const words=q.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
 const topicInfo=topics.find(t=>t.id===topic);
 const start=period==='all'?null:Date.parse(snapshotDate)-Number(period)*86400000;
 return items.filter(item=>{
  if(view==='incidents'&&item.kind!=='incident')return false;
  if(view==='research'&&item.kind==='incident')return false;
  if(topic==='cve'&&!item.cveIds?.length)return false;
  if(source!=='all'&&item.sourceId!==source)return false;
  if(risk!=='all'&&item.risk!==risk)return false;
  if(evidence!=='all'&&item.evidence!==evidence)return false;
  if(unread&&read.has(item.id))return false;
  if(start!==null&&Date.parse(itemDate(item))<start)return false;
  const text=[item.title,item.summary,item.externalId,item.sourceName,...item.tags,...item.entities,...(item.cveIds||[]),...(item.affectedPackages||[]).flatMap(p=>[p.name,p.ecosystem])].join(' ').toLocaleLowerCase();
  if(words.some(word=>!text.includes(word)))return false;
  if(topicInfo&&topicInfo.words.length&&!topicInfo.words.some(word=>text.includes(word.toLocaleLowerCase())))return false;
  return true;
 }).sort((a,b)=>(sort==='oldest'?1:-1)*itemDate(a).localeCompare(itemDate(b))||a.id.localeCompare(b.id));
}
