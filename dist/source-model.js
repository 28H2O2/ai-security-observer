export const sourceCategories=[
 {id:'vendor',label:'厂商官方'},
 {id:'research',label:'安全研究'},
 {id:'database',label:'结构化资料'},
 {id:'chinese',label:'中文社区'}
];

export function sourceCatalogView(sources,{q='',source='all'}={}){
 const catalog=sources.filter(entry=>entry.id!=='pdf'&&sourceCategories.some(category=>category.id===entry.category));
 const words=q.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
 const groups=sourceCategories.map(category=>({...category,sources:catalog.filter(entry=>{
  if(entry.category!==category.id)return false;
  const text=[category.label,entry.name,entry.shortName,entry.description,entry.method,entry.notes,entry.url].join(' ').toLocaleLowerCase();
  return words.every(word=>text.includes(word));
 })})).filter(category=>category.sources.length);
 const visible=groups.flatMap(category=>category.sources);
 return {total:catalog.length,count:visible.length,groups,selected:visible.find(entry=>entry.id===source)||null};
}
