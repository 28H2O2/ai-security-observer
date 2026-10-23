// Curves are decorative; the category sections carry the semantic structure.
export function connectSourceGraph(graph){
 const svg=graph.querySelector('.source-connections');
 const hub=graph.querySelector('.source-hub');
 const panels=[...graph.querySelectorAll('.source-category')];
 const selected=svg.querySelector('.is-selected');
 // Shared vertical segments must not paint over the highlighted branch.
 if(selected)svg.append(selected);
 let frame=0;
 function draw(){
  frame=0;
  const bounds=graph.getBoundingClientRect(),root=hub.getBoundingClientRect();
  const vertical=window.matchMedia('(max-width: 959px)').matches;
  svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
  for(const panel of panels){
   const box=panel.getBoundingClientRect();
   const path=svg.querySelector(`[data-branch="${panel.dataset.category}"]`);
   const sy=root.top-bounds.top+root.height/2,ey=box.top-bounds.top+box.height/2;
   const ex=box.left-bounds.left;
   if(vertical){
    const sx=root.left-bounds.left,spine=16,radius=10;
    path.setAttribute('d',`M ${sx} ${sy} H ${spine+radius} Q ${spine} ${sy} ${spine} ${sy+radius} V ${ey-radius} Q ${spine} ${ey} ${spine+radius} ${ey} H ${ex}`);
   }else{
    const sx=root.right-bounds.left,curve=(ex-sx)*.55;
    path.setAttribute('d',`M ${sx} ${sy} C ${sx+curve} ${sy}, ${ex-curve} ${ey}, ${ex} ${ey}`);
   }
  }
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(draw);};
 const observer=new ResizeObserver(schedule);
 [graph,hub,...panels].forEach(node=>observer.observe(node));
 window.addEventListener('resize',schedule);
 schedule();
 return ()=>{observer.disconnect();window.removeEventListener('resize',schedule);cancelAnimationFrame(frame);};
}
