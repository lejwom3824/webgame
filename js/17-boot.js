"use strict";
/* ================= boot ================= */
function boot(data){
  if(data&&data.v===3&&data.S&&data.S.run){Object.assign(S,data.S,{busy:false});if(S.run)migrateRun(S.run);syncUID();
    if(S.C&&S.C.phase==='enemy')S.C.phase='player';}
  addEventListener('resize',fit);
  document.addEventListener('gesturestart',e=>e.preventDefault());
  if(window.visualViewport)visualViewport.addEventListener('resize',fit);
  applyUI();const o0=S.orient;S.orient='';fit();if(!S.orient)S.orient=o0;
  if(!REDUCED)requestAnimationFrame(loop);
  else if(S.run&&['combat','map','reward','rest','shop','event'].includes(S.screen))resumeAt();
  else if(S.screen==='climbPrep')showClimbPrep();
  else showTitle({menu:!!S.titleMenu});
}
try{window.claude?.hot?.snapshot?.(()=>({v:3,S:JSON.parse(JSON.stringify({...S,busy:false}))}))}catch(e){}
window.claude?.hot?.ready?window.claude.hot.ready(boot):boot(window.claude?.hot?.data??{});

/* V17 글자 넘침 방지 — 카드 이름·앞면·뒷면 글이 칸을 넘으면 넘지 않을 때까지 글자 크기를 줄임 */
function fitBox(box){
  const inner=box.firstElementChild;if(!inner||!box.clientHeight)return;
  const sig=inner.innerHTML.length+'|'+box.clientWidth+'|'+box.clientHeight;if(box._fit===sig)return;
  box.style.fontSize='';let f=parseFloat(getComputedStyle(box).fontSize),min=f*.55,g=0;
  const over=()=>inner.scrollHeight>box.clientHeight+1||inner.scrollWidth>box.clientWidth+1;
  while(over()&&f>min&&g++<30){f*=.93;box.style.fontSize=f+'px'}
  box._fit=sig;
}
/* V2.34.68.19: 카드 글자 크기는 일정하게 — 줄이지 않고, 넘치는 글은 카드 안에서 스크롤 */
function fitCards(root=document){}
let fitQ=0;const fitSoon=()=>{if(fitQ)return;fitQ=requestAnimationFrame(()=>{fitQ=0;try{fitCards()}catch(e){}})};
try{new MutationObserver(fitSoon).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});addEventListener('resize',fitSoon)}catch(e){}
document.fonts&&document.fonts.ready.then(()=>{if(S.C&&S.screen==="combat")fitFront($("#hand"))});
