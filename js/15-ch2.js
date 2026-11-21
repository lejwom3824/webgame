"use strict";
/* ================= 2장 진행 — 낙하 · 방향 · 지도 ================= */
const DIR2={E:{n:'동',ws:'stein',v:[1,0]},S:{n:'남',ws:'ash',v:[0,1]},W:{n:'서',ws:'remi',v:[-1,0]},N:{n:'북',ws:'kriv',v:[0,-1]}};
const DIR_ORDER=['E','S','W','N'];
/* 방향을 고를 때 나오는 간략한 설명 (원전 설정의 공방 설명) */
const DIR_DESC={E:'스타인러 공방 — 증기 중심, 전부 수동, 장인과 드워프의 손길이 남은 곳',N:'크리뷔스 공방 — 냉매제 중심, 생산이 가장 힘들고 소모가 크며 대부분의 공방이 협업하는 곳',
  S:'아쉬부티 공방 — 유물 중심, 지금은 예술품과 교육을 내세우는 곳',W:'레미 공방 — 식품 중심, 모든 식품업체가 이곳을 통해 물자를 받는 곳'};
const D99_OK=100;/* 위로 올라간다·아래로 내려간다는 둘 다 무조건 실패 판정 (사용자 확정) */
/* 임시 (V2.28) — 설정에서 2장으로 건너뛰기 */
function skipToA2(){let r=S.run;if(r&&r.act===2&&r.m2){closeModal();return toast('2장','이미 2장이다')}
  closeModal();try{endTitleScene()}catch(e){}sayHide();if(S.C){S.C.over=true}S.C=null;try{hideCombatUI()}catch(e){}
  if(!r||!r.deck){S.run=newRun(rollHero('easy'));r=S.run}
  r.tut=false;r.tutStep=999;r.pal=null;r.flags.sOpen=1;r.flags.sNord=1;r.flags.riftDone=r.flags.riftDone||'left';r.flags.sRift=1;r.at=null;save();
  toast('2장','2장으로 건너뛴다');transition(a2Begin)}
function a2Begin(){const r=S.run;r.at={kind:'fall'};save();showFall()}
function showFall(){
  const r=S.run;S.screen='fall';renderTop();hideCombatUI();
  const sc=openScreen('',{full:true});sc.innerHTML=`<div class="fallcut" id="fallcut"><div class="fstreaks">${[...Array(36)].map(()=>`<i style="left:${ri(0,100)}%;animation-delay:${(rnd()*1.6).toFixed(2)}s;animation-duration:${(.5+rnd()*.7).toFixed(2)}s"></i>`).join('')}</div>
    <div class="fbody"><div class="psub">세계수 아래로</div><div class="ptitle">2장 · 니다벨리르</div></div></div>`;
  S.bg='black';
  const go=()=>{if(S.screen!=='fall')return;
    /* 지역 이동 로딩 — 레바테인 사건 1% */
    landDome()};
  setTimeout(go,REDUCED?200:2600);sc.onclick=()=>{sc.onclick=null;go()};
}
function landDome(){const r=S.run;
  if(!r.flags.landed){r.flags.landed=true;const l=Math.round(r.hp*.4);r.hp=Math.max(1,r.hp-l);r.flags.fallLoss=l}
  r.act=2;r.floor=0;r.next=null;r.flags.actF={};r.at={kind:'land'};save();showLand()}
function showLand(){const r=S.run;S.screen='event';renderTop();viewFor('map');
  eventPanel('철제 돔','2장 · 니다벨리르',`철제 돔의 허술한 부분에 떨어졌다. 현재 체력의 40%가 깎였다 (−${r.flags.fallLoss||0}).`,[
    {b:'미드가르드로 돌아가려 세계수를 타고 올라간다',s:`d99 판정 · 무조건 실패 — 낙하, 현재 체력의 20% 소모, 무작위 방향으로 튕겨 나감`,f:()=>d99('up')},
    {b:'이 돔 밑으로 내려갈 방법을 찾는다',s:`d99 판정 · 무조건 실패 — 접지름, 현재 체력의 5% 소모`,f:()=>d99('down')}])}
function d99(way){const r=S.run,roll=ri(1,99),ok=false;
  const sc=openScreen('',{dim:true});
  sc.innerHTML=`<div class="panel evpanel" style="width:min(640px,100%);align-items:center;text-align:center"><div><div class="psub">${way==='up'?'위로 올라간다':'아래로 내려간다'}</div><div class="ptitle">d99</div></div>
    <div class="d99" id="d99">—</div><div class="lines" style="min-width:min(420px,100%)"><div><span>목표</span><b>무조건 실패</b></div></div>
    <div class="dres" id="dres" hidden></div><button class="btn-main" id="dGo" hidden>계속</button></div>`;
  const fin=()=>{const el=$('#d99');if(!el)return;el.textContent=roll;el.className='d99 '+(ok?'ok':'ng');sfx(ok?'block':'hurt',.6);
    let txt;if(ok)txt='성공';else if(way==='up'){const l=Math.round(r.hp*.2);r.hp=Math.max(1,r.hp-l);txt=`낙하 — 체력 -${l}. 눈앞이 깜깜해진 뒤 무작위 방향으로 튕겨 나갔다.`}else{const l=Math.max(1,Math.round(r.hp*.05));r.hp=Math.max(1,r.hp-l);txt=`접지름 — 체력 -${l}`}
    save();const dr=$('#dres');dr.hidden=false;dr.className='dres '+(ok?'ok':'ng');dr.innerHTML=`<b>${ok?'성공':'실패'}</b><span>${txt}</span>`;
    const g=$('#dGo');g.hidden=false;g.onclick=()=>{if(!ok&&way==='up')startDir(pick(DIR_ORDER));else showDirPick()}};
  if(REDUCED)return fin();let n=0;const tick=()=>{const el=$('#d99');if(!el)return;if(n++>=14)return fin();el.textContent=ri(1,99);setTimeout(tick,45+n*6)};tick();}
/* 어디 방향으로 내려갈까? — 검은 화면, 사분면 끝 지점의 반짝이는 선택지, 중앙은 막혀 있음 */
function showDirPick(sel){const r=S.run;r.at={kind:'dir'};save();S.screen='event';renderTop();S.bg='black';
  const pos={N:[50,12],E:[88,50],S:[50,88],W:[12,50]};
  const sc=openScreen('',{full:true});
  sc.innerHTML=`<div class="dirpick"><div class="dtitle">어디 방향으로 내려갈까?</div>
    ${DIR_ORDER.map(k=>`<button class="dspark${sel===k?' on':''}" data-d="${k}" style="left:${pos[k][0]}%;top:${pos[k][1]}%" aria-label="${DIR2[k].n}"><i></i><b>${DIR2[k].n}</b></button>`).join('')}
    <div class="dcenter">막혀 있는 곳</div>
    ${sel?`<div class="dinfo"><b>${DIR2[sel].n} · ${WS2[DIR2[sel].ws].n}</b><span>${DIR_DESC[sel]}</span><div class="choices" style="flex-direction:row;justify-content:center"><button class="btn-main" id="dGo">이쪽으로 내려간다</button><button class="btn-ghost" id="dNo">다른 곳을 본다</button></div></div>`:''}</div>`;
  sc.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>showDirPick(b.dataset.d));
  if(sel){$('#dGo').onclick=()=>startDir(sel);$('#dNo').onclick=()=>showDirPick()}}
function startDir(dir){const r=S.run;r.dir=dir;r.m2=genMap2(dir);r.hostile=r.mode==='dain';r.contract=null;r.quiet=0;r.at=null;save();
  toast('2장 · 니다벨리르',`${DIR2[dir].n} · ${WS2[DIR2[dir].ws].n}에서 시작`);if(r.mode==='human'&&!r.flags.sA2){r.flags.sA2=1;r.flags.a2New=1;r.at={kind:'shop2',node:r.m2.cur,intro:1};save();return showScene(sceneA2(dir),()=>transition(resumeAt),{sky:true})}transition(()=>showMap())}
/* 2장 지도 (웹게임 문서: 2장 니다벨리르 · 맵 항목 무작위 배치)
   원 안에 계단식 피라미드, 꼭짓점 넷에 공방(북 크리뷔스 · 동 스타인러 · 남 아쉬부티 · 서 레미), 꼭대기(가운데)에 중앙정부
   칸은 줄 맞춤 없이 흩뿌리고, 가까운 막끼리 겹치지 않게 길을 이은 뒤 일부를 지워 갈림길을 만듦 · 지역마다 15막
   중앙정부로 가는 길목은 45도 틀어진 북동·남동·남서·북서에 하나씩, 중앙정부는 이 넷과만 이어짐
   숫자 주머니: 지역마다 0×4, 1×4, 2×4, 3×3 — 0 상점 · 1 전투 · 2 정예 · 3 사건
   만약에: 그 지도에 전투가 없으면 0·1을 상점으로, 정예가 없으면 2·3을 사건으로 (니다벨리르는 둘 다 없음 → 지역마다 상점 8 · 사건 7) */
const M2R=500,M2D=430,M2PER=15,M2BAG=[4,4,4,3];
const A2RULE={combat:false,elite:false};
const WS_POS={N:[0,-M2D],E:[M2D,0],S:[0,M2D],W:[-M2D,0]};
const regionOf=(x,y)=>-y>=Math.abs(x)?'N':y>=Math.abs(x)?'S':x>0?'E':'W';
function segCross(a,b,c,d){const o=(p,q,r)=>Math.sign((q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x));if(a===c||a===d||b===c||b===d)return false;return o(a,b,c)!==o(a,b,d)&&o(c,d,a)!==o(c,d,b)}
function genMap2(dir){
  const nodes=[{id:0,kind:'center',reg:'C',x:0,y:0}];
  for(const k of'NESW')nodes.push({id:nodes.length,kind:'ws',reg:k,x:WS_POS[k][0],y:WS_POS[k][1]});
  const cnt={N:0,E:0,S:0,W:0};let md=92,tries=0;const A=150/Math.SQRT2;
  for(const[dx,dy,g,dk]of[[1,-1,'N','NE'],[1,1,'E','SE'],[-1,1,'S','SW'],[-1,-1,'W','NW']]){nodes.push({id:nodes.length,kind:'room',reg:g,x:dx*A,y:dy*A,gate:dk});cnt[g]++}
  while(Object.values(cnt).some(c=>c<M2PER)){if(++tries%4000===0)md*=.93;
    const x=(rnd()*2-1)*M2D,y=(rnd()*2-1)*M2D;if(Math.abs(x)+Math.abs(y)>M2D-22||Math.hypot(x,y)<120)continue;
    const g=regionOf(x,y);if(cnt[g]>=M2PER)continue;if(nodes.some(n=>Math.hypot(n.x-x,n.y-y)<(n.kind==='room'?md:md*1.15)))continue;
    nodes.push({id:nodes.length,kind:'room',reg:g,x,y});cnt[g]++}
  const adj=nodes.map(()=>new Set()),E=[];
  for(const n of nodes)if(n.gate){adj[0].add(n.id);adj[n.id].add(0);E.push([0,n.id])}
  const cand=[];for(let i=1;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const d=Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y),lim=(nodes[i].kind==='room'&&nodes[j].kind==='room')?md*2.1:md*2.7;if(d<=lim)cand.push([d,i,j])}
  cand.sort((a,b)=>a[0]-b[0]);const cap=n=>nodes[n].kind==='room'?4:6;
  for(const[,i,j]of cand){if(adj[i].size>=cap(i)||adj[j].size>=cap(j))continue;if(E.some(([a,b])=>segCross(nodes[i],nodes[j],nodes[a],nodes[b])))continue;adj[i].add(j);adj[j].add(i);E.push([i,j])}
  const reach=()=>{const seen=new Set([0]),q=[0];while(q.length){for(const n of adj[q.pop()])if(!seen.has(n)){seen.add(n);q.push(n)}}return seen};
  for(let g=0;g<60;g++){const seen=reach();if(seen.size===nodes.length)break;let best=null;for(const a of seen)if(a!==0)for(const n of nodes)if(!seen.has(n.id)){const d=Math.hypot(nodes[a].x-n.x,nodes[a].y-n.y);if(!best||d<best[0])best=[d,a,n.id]}
    if(!best)break;adj[best[1]].add(best[2]);adj[best[2]].add(best[1]);E.push([best[1],best[2]])}
  for(let i=E.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[E[i],E[j]]=[E[j],E[i]]}
  for(const[a,b]of E){if(a===0||b===0||rnd()>.32||adj[a].size<3||adj[b].size<3)continue;adj[a].delete(b);adj[b].delete(a);if(reach().size!==nodes.length){adj[a].add(b);adj[b].add(a)}}
  for(const g of'NESW'){const bag=[];M2BAG.forEach((c,v)=>{for(let i=0;i<c;i++)bag.push(v)});shuffle(bag);nodes.filter(n=>n.kind==='room'&&n.reg===g).forEach((n,i)=>n.v=bag[i])}
  nodes.forEach((n,i)=>{n.adj=[...adj[i]];n.x=Math.round(n.x);n.y=Math.round(n.y)});
  /* 2장 시작 (11/6): 낙하한 방향 지역의 중앙 근처 막에서 시작 → 그 방향 공방 → 중앙정부 */
  const ws=nodes.find(n=>n.kind==='ws'&&n.reg===dir),st=m2PickStart(nodes,dir)||ws;st.vis=true;if(st!==ws)st.isStart=true;
  const M={v:2,nodes,cur:st.id,start:st.id,walked:[],inside:null,wsNeed:null,wsDone:true};m2AssignFix(M);return M;
}
function m2PickStart(nodes,dir){let best=null;for(const n of nodes){if(n.kind!=='room'||n.reg!==dir||n.gate||n.adj.includes(0))continue;const d=Math.hypot(n.x,n.y);if(!best||d<best[0])best=[d,n]}return best?best[1]:null}
/* 동료 영입 막 (위치 고정) — 스타인러 제바르크의 작업장 · 크리뷔스 오토의 냉각 작업장 · 아쉬부티 아카데미 앞 */
const FIX_N={smith:'제바르크의 작업장',otto:'오토의 냉각 작업장',cadet:'아카데미 앞'};
function m2AssignFix(M){M.fixDone=true;return;/* V2.29.48.12: 공방 동료 영입 막 롤백 */
  if(M.fixDone)return;for(const[g,k]of[['E','smith'],['N','otto'],['S','cadet']]){let best=null;
  for(const n of M.nodes){if(n.kind!=='room'||n.reg!==g||n.gate||n.isStart||n.fix||n.id===M.cur||n.cleared||n.used||n.shop)continue;const d=Math.abs(Math.hypot(n.x,n.y)-M2D*.55);if(!best||d<best[0])best=[d,n]}
  if(best)best[1].fix=k}M.fixDone=true}
const m2Node=id=>S.run.m2.nodes[id];
const regWS=reg=>reg==='C'?'krim':DIR2[reg].ws;
/* 막 종류 — 숫자를 그 지도의 '만약에' 규칙으로 읽음 */
function m2Type(n){const r=S.run;if(n.kind==='center')return'rush';if(n.kind==='ws')return r.m2&&n.id===r.m2.start?'start':'ws';if(n.isStart)return'begin';if(n.cleared)return'empty';
  if(r.mode==='dain')return n.v===2?'elite':'combat';if(r.hostile&&!isFriend(regWS(n.reg)))return'combat';
  let v=n.v;if(!A2RULE.combat&&v<=1)v=2;else if(!A2RULE.elite&&v>=2)v=1;return['combat','event','shop','elite'][v]}
const M2N={begin:'시작 지점',mate:'동료',shop:'상점',event:'사건',combat:'전투',elite:'정예',empty:'빈 칸',start:'시작',ws:'공방',rush:'중앙정부 · 정예 러시',gate:'중앙정부 입구',boss:'보스'};
const M2IC={begin:'<path class="ic" d="M-5 9 V-9 L8 -5 L-5 -1"/>',mate:'<circle class="ic" cy="-4" r="4.5"/><path class="ic" d="M-8 10 C-8 2 8 2 8 10"/>',shop:'<path class="ic" d="M-9 -1 L0 -9 L9 -1 M-6 -1 V8 H6 V-1"/>',event:'<text class="ic" x="0" y="7" text-anchor="middle">?</text>',
  combat:'<path class="ic" d="M-7 -7 L7 7 M7 -7 L-7 7"/>',elite:'<path class="ic" d="M0 -9 L8 -4 L8 5 L0 10 L-8 5 L-8 -4Z"/><circle class="ic" r="2.5"/>',
  empty:'<circle r="3" fill="#6b7178"/>',ws:'<path class="ic" d="M-10 -4 H10 L5 2 H-5Z M-3 2 V8 M3 2 V8 M-6 8 H6"/>',start:'<path class="ic" d="M-10 -4 H10 L5 2 H-5Z M-3 2 V8 M3 2 V8 M-6 8 H6"/>',
  rush:'<path class="ic" d="M-11 7 V-6 L-5 0 L0 -10 L5 0 L11 -6 V7Z"/>',boss:'<path class="ic" d="M-11 7 V-6 L-5 0 L0 -10 L5 0 L11 -6 V7Z"/>',gate:'<path class="ic" d="M-8 9 V-3 A8 8 0 0 1 8 -3 V9 M-12 9 H12"/>'};
const WS_LAB={N:'크리뷔스 공방',E:'스타인러 공방',S:'아쉬부티 공방',W:'레미 공방'};
/* 중앙정부 안 — 들어온 길목에서 계단을 시계 방향으로 한 층씩 올라 정예 1 → 2 → 3 → 4, 꼭대기에 보스 (앞으로만 감) */
function innerNodes(diag){const U={N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]},ord='NESW',G={NE:[1,-1],SE:[1,1],SW:[-1,1],NW:[-1,-1]};
  const i=ord.indexOf({NE:'E',SE:'S',SW:'W',NW:'N'}[diag]);const o=[{id:0,kind:'gate',x:G[diag][0]*M2D/2,y:G[diag][1]*M2D/2}];
  for(let j=1;j<=4;j++){const k=ord[(i+j-1)%4],s=M2D*(1-j*.2);o.push({id:j,kind:'re',n:j,x:U[k][0]*s,y:U[k][1]*s})}o.push({id:5,kind:'boss',x:0,y:0});return o}
function m2Svg(mode){const r=S.run,M=r.m2,IN=M.inside;
  let h=`<circle r="${M2R}" class="disc"/>`;const tiers=IN?5:4,st=IN?.2:.25;
  for(let k=0;k<tiers;k++){const s=M2D*(1-k*st);/* 계단식 테두리 */const p=[];const n=6;for(let q=0;q<4;q++)for(let i=0;i<n;i++){const a=i/n,b=(i+1)/n;const P=[[s*a,-s*(1-a)],[s*b,-s*(1-a)],[s*b,-s*(1-b)]];for(let[x,y]of P){for(let z=0;z<q;z++)[x,y]=[-y,x];p.push(`${x.toFixed(1)},${y.toFixed(1)}`)}}
    h+=`<polygon class="tier${k===0?' tier0':''}" points="${p.join(' ')}"/>`}
  for(const k of'NESW')h+=`<line class="ridge" x1="${WS_POS[k][0]}" y1="${WS_POS[k][1]}" x2="0" y2="0"/>`;
  if(IN){const nd=innerNodes(IN.diag);
    for(let j=0;j<5;j++)h+=`<line class="edge${j<IN.cur?' walked':''}${j===IN.cur?' pick':''}" x1="${nd[j].x}" y1="${nd[j].y}" x2="${nd[j+1].x}" y2="${nd[j+1].y}"/>`;
    for(const n of nd){const t=n.kind==='re'?'elite':n.kind,big=n.kind==='boss'?26:22,ch=n.id===IN.cur+1,here=n.id===IN.cur;if(mode==='mini'&&!ch&&!here)continue;
      h+=`<g class="node ${t}${here?' here':''}${ch?' choice':''}${n.id<IN.cur?' done':''}" ${ch?`data-in="${n.id}"`:''} transform="translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})"><circle class="halo" r="${big+7}"/><circle class="base" r="${big}"/>${n.kind==='re'?`<text class="ic" x="0" y="7" text-anchor="middle">${n.n}</text>`:M2IC[t]}</g>`;
      if(mode!=='mini'||ch||here)h+=`<text class="lab small" x="${n.x}" y="${n.y+(n.kind==='boss'?52:46)}">${n.kind==='re'?'정예 '+n.n:n.kind==='boss'?'보스':'입구'}</text>`}
    if(mode==='full')h+=`<text class="lab" x="0" y="${-M2R+56}">중앙정부 안</text>`;
    return h}
  const cur=m2Node(M.cur),nb=new Set(cur.adj),walked=new Set(M.walked||[]),only=mode==='mini'?new Set([M.cur,...cur.adj]):null;
  for(const n of M.nodes)for(const j of n.adj){if(j<n.id)continue;const pk=(n.id===M.cur&&nb.has(j))||(j===M.cur&&nb.has(n.id));if(only&&!pk)continue;const m=M.nodes[j];
    h+=`<line class="edge${walked.has(n.id+'-'+j)?' walked':''}${pk?' pick':''}" x1="${n.x}" y1="${n.y}" x2="${m.x}" y2="${m.y}"/>`}
  for(const n of M.nodes){if(only&&!only.has(n.id))continue;const t=m2Type(n),big=n.kind!=='room'?(n.kind==='center'?36:32):26,ch=nb.has(n.id),here=n.id===M.cur;
    const jn=jmNoted(n.id);h+=`<g class="node ${t}${here?' here':''}${ch?' choice':''}${n.vis&&!here?' seen':''}${jn?(jn>1?' jmfix':' jmno'):''}" ${ch?`data-id="${n.id}"`:''} transform="translate(${n.x} ${n.y})"><circle class="halo" r="${big+9}"/><circle class="base" r="${big}"/><g transform="scale(1.55)">${M2IC[t]}</g>${n.used&&t==='shop'?`<text class="used" y="${big+16}" text-anchor="middle">사용함</text>`:''}<title>${M2N[t]}</title></g>`;
    }
  if(mode==='full'){const off={N:-52,E:66,S:72,W:66};for(const k of'NESW')h+=`<text class="lab" x="${WS_POS[k][0]}" y="${WS_POS[k][1]+off[k]}">${WS_LAB[k]}</text>`;h+=`<text class="lab small" x="0" y="66">중앙정부</text>`}
  if(mode==='mini'&&cur.kind!=='center'){const half=m2MiniHalf(),lk=M.wsNeed!=null&&!M.wsDone?m2Node(M.wsNeed):null,a=lk?Math.atan2(lk.y-cur.y,lk.x-cur.x):Math.atan2(-cur.y,-cur.x),x=cur.x+Math.cos(a)*half*.84,y=cur.y+Math.sin(a)*half*.84;h+=`<g class="m2arrow" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(a*180/Math.PI).toFixed(1)}) scale(${(half/170).toFixed(2)})"><path d="M-18 -13 L18 0 L-18 13 L-9 0Z"/></g>`}
  return h}
/* 중앙정부까지 남은 막 수 (안 가 본 길도 셈) */
function m2Dist(src=0){const N=S.run.m2.nodes,d=N.map(()=>Infinity);d[src]=0;const q=[src];while(q.length){const a=q.shift();for(const b of N[a].adj)if(d[b]===Infinity){d[b]=d[a]+1;q.push(b)}}return d}
function m2Bearing(n){const a=(Math.atan2(n.x,-n.y)*180/Math.PI+382.5)%360;return['북','북동','동','남동','남','남서','서','북서'][Math.floor(a/45)%8]}
function m2MiniHalf(){const r=S.run,M=r.m2;let pts;if(M.inside){const nd=innerNodes(M.inside.diag);pts=[nd[M.inside.cur],nd[Math.min(5,M.inside.cur+1)]]}else{const c=m2Node(M.cur);pts=[c,...c.adj.map(j=>M.nodes[j])]}
  const c=pts[0];let m=60;for(const p of pts)m=Math.max(m,Math.hypot(p.x-c.x,p.y-c.y));return m+85}
function m2MiniBox(){const M=S.run.m2,half=m2MiniHalf(),c=M.inside?innerNodes(M.inside.diag)[M.inside.cur]:m2Node(M.cur);return`${c.x-half} ${c.y-half} ${half*2} ${half*2}`}
function showMap2(full){const r0=S.run;if(r0.m2)r0.m2.wsNeed=null;/* V2.30.51.14: 공방을 먼저 들를 필요 없음 — 문은 20시간이 넘으면 열림 */
  if(r0.m2&&r0.m2.v===2&&!r0.m2.fixDone)m2AssignFix(r0.m2);
  if(r0.artNext){const a=r0.artNext;r0.artNext=null;save();return m2Arrive(a.id,a.first)}
  if(r0.flags&&r0.flags.cadetJoin===1){r0.flags.cadetJoin=2;save();return cadetJoinScene()}
  if(S.run.pendJoin)return showJoin();if(S.run.pendZone){const z=S.run.pendZone;S.run.pendZone=null;save();return showScene([ZONE_TXT[z]],()=>showMap2())}if(S.run.pendFav){S.run.pendFav=false;setTimeout(()=>a2Guide('fav'),0)}
  const r=S.run;if(!r.m2||r.m2.v!==2)r.m2=genMap2(r.dir||'E');const M=r.m2;S.screen='map';viewFor('map');hideCombatUI();closeModal();r.at=null;renderTop();save();
  const IN=M.inside,cur=IN?null:m2Node(M.cur),t=IN?(IN.cur===0?'gate':IN.cur===5?'boss':'elite'):m2Type(cur);
  const where=IN?`중앙정부 안 · ${IN.cur===0?'입구':IN.cur>=5?'보스':'정예 '+IN.cur}`:`${cur.kind==='ws'?WS_LAB[cur.reg]:(cur.reg!=='C'?DIR2[cur.reg].n+' · ':'')+M2N[t]}`;
  const lockC=!IN&&M.wsNeed!=null&&!M.wsDone,DIST=IN?null:lockC?m2Dist(M.wsNeed):m2Dist(),tg=lockC?m2Node(M.wsNeed):{x:0,y:0};
  const what=IN?'앞으로만 간다 — 정예 1 → 2 → 3 → 4 → 보스, 사이에 회복 없음':r.mode==='dain'?'다인모드 — 모든 막이 전투 또는 정예':r.hostile?'모든 공방이 적대 — 모든 막이 전투':`전투 없이 지난 막 ${r.quiet||0}${r.contract?` · 계약: ${WS2[r.contract].n}`:''}`;
  const guide=IN?'':lockC?`먼저 <b>${WS_LAB[r.dir]}</b>까지 최소 <b>${DIST[M.cur]}막</b> · ${m2Bearing({x:tg.x-cur.x,y:tg.y-cur.y})}쪽 · 그다음 중앙정부`:`중앙정부까지 최소 <b>${DIST[M.cur]}막</b> · ${m2Bearing({x:-cur.x,y:-cur.y})}쪽 방향`;
  const FL=!IN&&FIELD[cur.reg],fld=FL?`${FL.n} — ${FL.t}${cur.reg==='E'?` · 지금 증기 ${r.fSteam||0} / 10`:''}`:'';
  const optBtn=(attr,type,name,note,cls)=>`<button class="m2opt ${type}${cls||''}" ${attr}><svg viewBox="-15 -15 30 30" aria-hidden="true">${M2IC[type]}</svg><b>${name}</b>${note?`<small>${note}</small>`:''}</button>`;
  let opts,shopIn='';
  if(!IN&&cur.kind==='ws')shopIn+=optBtn('data-spar="1"','ws','대련장에 들어간다','언제든 그만둘 수 있다',' near');
  if(!IN&&m2Type(cur)==='shop')shopIn+=optBtn('data-shopin="1"','shop',cur.inn?'여관에 들어간다':'상점에 입장한다','들르지 않고 지나가도 된다',' near');
  if(IN){const nd=innerNodes(IN.diag),nx=nd[IN.cur+1];opts=nx?optBtn(`data-in="${nx.id}"`,nx.kind==='re'?'elite':nx.kind,nx.kind==='re'?'정예 '+nx.n:'보스','',''):''}
  else opts=[...cur.adj].sort((a,b)=>DIST[a]-DIST[b]).map(j=>{const n=M.nodes[j],ty=m2Type(n),close=DIST[j]<DIST[M.cur];return optBtn(`data-id="${j}"`,ty,n.kind==='ws'?WS_LAB[n.reg]:M2N[ty],`${m2Bearing2(cur,n)}쪽${close?(lockC?' · 공방 방향':' · 중앙정부 방향'):''}${n.kind==='center'&&lockC?' · 공방에 먼저 다녀와야 함':n.kind==='center'&&!jmS().open?' · 문이 닫혀 있음':''}${jmNoted(j)?(jmNoted(j)>1?' · 기입':' · 보류'):''}`,close?' near':'')}).join('');
  const shopGo=()=>{const n=M.nodes[M.cur];if(S.busy||m2Type(n)!=='shop')return;if(n.inn==null)n.inn=rnd()<.25;r.at=n.inn?{kind:'inn',node:n.id}:{kind:'shop2',node:n.id};save();transition(resumeAt)};
  const LEG=[['here','내 위치'],['can','갈 수 있는 곳'],['shop','상점'],['event','사건'],['combat','전투'],['elite','정예'],['ws','공방'],['rush','중앙정부']];
  const sc=openScreen('');
  sc.innerHTML=`<div class="m2stage"><div class="m2head"><b>${where}</b>${guide?`<span>${guide}</span>`:''}<span class="${r.hostile&&!IN?'bad':''}">${what}</span>${fld?`<span class="m2fld">${fld}</span>`:''}${IN?'':`<span>${jmS().open?'중앙정부의 문이 열려 있다':'중앙정부의 문은 닫혀 있다'}</span>`}${!IN&&cur.kind==='ws'?'<span>이 공방에는 대련장이 있다</span>':''}</div><div class="m2opts">${shopIn}${opts}</div>
    <div class="m2tag">누르면 전체 지도</div><div class="m2mini" id="m2mini" tabindex="0" role="button" aria-label="전체 지도 열기"><svg viewBox="${m2MiniBox()}">${m2Svg('mini')}</svg></div>
    <div class="m2full" id="m2full" hidden><svg id="m2fsvg" viewBox="-520 -520 1040 1040">${m2Svg('full')}</svg>
      <div class="m2legend">${LEG.map(([k,n])=>`<span class="lg ${k}"><i></i>${n}</span>`).join('')}</div>
      <div class="m2tools"><button class="btn-ghost" id="m2in" aria-label="확대">＋</button><button class="btn-ghost" id="m2out" aria-label="축소">－</button><button class="btn-ghost" id="m2me">내 위치</button><button class="btn-ghost" id="m2all">전체</button><button class="btn-ghost" id="m2close">작게 보기</button></div></div></div>`;
  const pickNode=e=>{const g=e.target.closest('[data-id],[data-in]');if(!g)return false;e.stopPropagation();if(g.dataset.in!=null)innerGo(+g.dataset.in);else enterNode2(+g.dataset.id);return true};
  sc.querySelectorAll('.m2opt').forEach(b=>b.onclick=b.dataset.shopin?(e=>{e.stopPropagation();shopGo()}):b.dataset.spar?(e=>{e.stopPropagation();openSpar()}):pickNode);
  /* 전체 지도 — 내 위치에서 크게 시작, 끌어서 이동 · 휠이나 두 손가락으로 확대 */
  const fs=$('#m2fsvg'),box=$('#m2full'),me=IN?innerNodes(IN.diag)[IN.cur]:cur,V={x:me.x,y:me.y,w:620},MIN=320,MAX=1060;
  const draw=()=>{const W=fs.clientWidth||1,H=fs.clientHeight||1,a=H/W;V.w=clamp(V.w,MIN,MAX);V.x=clamp(V.x,-M2R,M2R);V.y=clamp(V.y,-M2R,M2R);let w=V.w,h=V.w;if(a<1)w=V.w/a;else h=V.w*a;fs.setAttribute('viewBox',`${V.x-w/2} ${V.y-h/2} ${w} ${h}`)};
  const unit=()=>{const W=fs.clientWidth||1,H=fs.clientHeight||1;return(H<W?V.w/H:V.w/W)};
  const openFull=()=>{box.hidden=false;V.x=me.x;V.y=me.y;V.w=620;draw()};
  const pts=new Map();let moved=false,last=null,pinch=0;
  fs.addEventListener('pointerdown',e=>{pts.set(e.pointerId,[e.clientX,e.clientY]);moved=false;last=[e.clientX,e.clientY];pinch=0});
  fs.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);
    if(pts.size>=2){const[a,b]=[...pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch){V.w*=pinch/d;draw()}pinch=d;moved=true;return}
    const dx=e.clientX-last[0],dy=e.clientY-last[1];if(!moved&&Math.hypot(dx,dy)<8)return;moved=true;const u=unit()/(S.scale||1);V.x-=dx*u;V.y-=dy*u;last=[e.clientX,e.clientY];draw()});
  const up=e=>{pts.delete(e.pointerId);pinch=0;if(pts.size)last=[...pts.values()][0]};
  fs.addEventListener('pointerup',up);fs.addEventListener('pointercancel',up);fs.addEventListener('pointerleave',up);
  fs.addEventListener('wheel',e=>{e.preventDefault();V.w*=e.deltaY>0?1.15:.87;draw()},{passive:false});
  $('#m2mini').addEventListener('click',e=>{if(!pickNode(e))openFull()});
  $('#m2mini').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openFull()}});
  fs.addEventListener('click',e=>{if(moved)return;pickNode(e)});
  $('#m2in').onclick=()=>{V.w*=.75;draw()};$('#m2out').onclick=()=>{V.w*=1.33;draw()};
  $('#m2me').onclick=()=>{V.x=me.x;V.y=me.y;V.w=620;draw()};$('#m2all').onclick=()=>{V.x=0;V.y=0;V.w=MAX;draw()};
  $('#m2close').onclick=()=>{box.hidden=true};
  if(full)openFull();
  palRender();palIdle();
}
function m2Bearing2(a,b){return m2Bearing({x:b.x-a.x,y:b.y-a.y})}
function a2Group(shopWs){const n=ri(1,3),o=[];for(let i=0;i<n;i++)o.push(pick(A2_NORMAL));const staff=shopWs&&SHOP_STAFF[shopWs];if(staff)o[0]=staff;return o.map(k=>makeEnemy(k))}
/* 중앙정부 안에서 다음 막으로 */
function innerGo(id){const r=S.run,IN=r.m2.inside;if(!IN||id!==IN.cur+1)return;stockTick();r.at={kind:'rush',i:id-1};save();transition(startRush)}
function enterNode2(id){
  const r=S.run,M=r.m2,n=m2Node(id),from=M.cur;M.wsNeed=null;if(!m2Node(from).adj.includes(id))return;
  if(n.kind==='center'&&M.wsNeed!=null&&!M.wsDone)return toast('중앙정부',`${WS_LAB[r.dir]}에 먼저 다녀와야 한다`);
  if(n.kind==='center'&&!jmS().open){const J=jmS(),nw=!J.ticket;J.ticket=true;if(nw){J.noteNew=true;renderTop()}save();toast('중앙정부','이곳으로 갈 수 없습니다');if(nw)setTimeout(()=>toast('번호표','노트에 끼워졌다'),900);return}
  {const dn=jmMoveDeny(from,id);if(dn)return toast('안내',dn)}
  const a=Math.min(from,id),b=Math.max(from,id);M.walked=M.walked||[];if(!M.walked.includes(a+'-'+b))M.walked.push(a+'-'+b);
  if(n.kind==='center'){const gate=m2Node(from).gate||'NE';return confirmBox('중앙정부','중앙정부 안으로 들어간다 — 정예 4명과 보스를 차례로 상대한다. 사이에 회복은 없고, 도망칠 수 없으며, 되돌아갈 수 없다.','들어간다',()=>{M.cur=id;n.vis=true;M.inside={diag:gate,cur:0};save();showMap();a2Guide('gov','krim')})}
  M.cur=id;const first=!n.vis;n.vis=true;r.floor=(r.floor||0)+1;stockTick();jmAct();jmDoor();palEv('map');
  if(fieldStep(n,id,first))return;
  m2Arrive(id,first)}
function m2Arrive(id,first){const r=S.run,M=r.m2,n=m2Node(id);
  a2GuideRegion(n.reg);
  if(n.kind==='ws'&&n.id===M.wsNeed&&!M.wsDone){M.wsDone=true;save();toast(WS_LAB[n.reg],'공방에 닿았다 — 이제 중앙정부로 향할 수 있다')}
  if(n.kind==='ws'&&n.reg==='S'&&r.mode==='human'){save();return gokStall()}
    const t=m2Type(n);let at=null;
  if((t==='combat'||t==='elite')&&!r.hostile&&r.mode==='human'){n.cleared=true;save();showMap();return confirmBox('적대','이곳의 사람들은 적대하지 않으면 싸우지 않는다. 적대하면 모든 공방이 플레이어를 적대한다.','적대한다',()=>{r.hostile=true;n.cleared=false;toast('적대','모든 공방이 플레이어를 적대한다');r.at={kind:'combat',enemies:a2Group(null),node:id};save();transition(resumeAt)})}
  if(t==='combat')at={kind:'combat',enemies:a2Group(n.v===0||n.shop?(n.shop?n.shop.ws:regWS(n.reg)):null),node:id};
  else if(t==='elite')at={kind:'combat',enemies:[makeEnemy(pick(['sender','examiner']))],node:id};
  else if(t==='shop'||t==='event'){
    if(first)r.quiet=(r.quiet||0)+1;
    if(t==='shop'){
      if(false){r.flags.mjolSeen=true;at={kind:'mjol',node:id}}
      else{if(n.inn==null)n.inn=rnd()<.25;at=null/* V2.29.50.14: 자동 입장 없음 — 지도에서 '상점에 입장한다'를 눌러야 들어감 */}}
    else if(r.mode==='human'&&r.flags.a2New&&!r.flags.a2Ev1){r.flags.a2Ev1=1;at={kind:'a2first',node:id}}
    else if(r.mode==='human'&&r.flags.pendRain){r.flags.pendRain=0;at={kind:'a2rain',node:id}}
    else{const ev=pickEvent(n.reg);at=ev?{kind:'event',ev,node:id}:null}
    /* 특수 대장장이 — 노드에 들어갔을 때 1% */
  }
  r.at=at;save();if(!at)return showMap();transition(resumeAt);
}

/* ================= 동료 영입 막 (11/6, 위치 고정) ================= */
function mateVisit(n){n.fixDone=true;save();return showMap();const k=n.fix;if(hasMate(k)){n.fixDone=true;save();return showMap()}if(k==='smith')return smithVisit(n);if(k==='otto')return ottoVisit(n);if(k==='cadet')return cadetVisit(n);showMap()}
const sceneDone=()=>{save();transition(()=>showMap())};
function smithVisit(n){const r=S.run,F=r.flags,SB='제바르크',price=Math.round(GEAR.x_sbh.p*.1);S.screen='event';renderTop();
  const buyF=()=>{if(r.gold<price){toast(SB,'돈이 모자라다');return}r.gold-=price;renderTop();gainGear('x_sbh')};
  const buy={b:`산다 (${money(price)})`,f:buyF,then:[[SB,'부서지면 가져와. 아, 고치는 건 안 해. 새로 줄게.']]},no={b:'안 산다',then:[[SB,'그래. 다음에 와.']]};
  if(F.sbMet&&wornGear(r).includes('x_sbh'))return showScene(['망치 소리가 멈춘다. 장인이 내 오른손을 본다.',[SB,'그거, 내 거잖아.'],[SB,'…써 주는구나.'],{c:[{b:'고개를 끄덕인다'}]},[SB,'좋아, 따라간다. 부서지면 바로 말해. 고치진 않아. 새로 만들어 줄게.'],{c:[{b:'함께 간다',f:()=>mateJoin('smith')}]}],sceneDone);
  if(F.sbMet)return showScene(['망치 소리가 여전하다.',[SB,'또 왔냐. 내 거 쓸 거야?'],{c:[buy,no]}],sceneDone);
  F.sbMet=1;const w=(r.gear&&r.gear.rh&&r.gear.rh[0])||null;
  const breakW=()=>{if(w){takeOff(r,'rh',0);toast(SB,`「${GEAR[w].n}」이(가) 산산조각 났다`);renderTop()}};
  const nope={b:'아뇨 딱히?',f:breakW,then:[w?'(망치가 무기를 내리꽂아 산산조각낸다)':'(망치가 허공을 내리찍는다. 내 손에는 부술 무기가 없었다.)',{c:[{b:w?'으악 내 무기!':'…방금 뭘 하려던 겁니까?'}]},[SB,'내 거 써. 90% 할인해 줄 테니깐.'],{c:[buy,no]}]};
  const yes={b:'네, 저한테 아주 소중한 거예요',then:[[SB,'그럼 나 말고 다른 장인한테 가 봐. 난 소중한 건 안 건드려. 아니, 못 건드려.']]};
  showScene(['증기 사이로 망치 소리가 울린다. 작업대 앞의 장인이 고개도 들지 않고 손을 내민다.',[SB,'이거 소중한 거야?'],{c:[{b:'왜요?',then:[[SB,'소중한 거냐고.'],{c:[nope,yes]}]},nope,yes]}],sceneDone)}
function ottoVisit(n){const r=S.run,F=r.flags,O='오토';S.screen='event';renderTop();
  const st=F.ottoSt||0,glove=(r.bag||[]).includes('x_otg')||wornGear(r).includes('x_otg');
  if(st===0){F.ottoSt=1;return showScene(['눈보라 속, 냉각기 옆에서 노인 하나가 혼자 냉매통을 나르고 있다.',{c:[{b:'조수로 받아 달라고 한다'}]},[O,'안 받는다.'],'노인은 다시 통을 들어 올린다. 더 말을 붙일 틈이 없다.'],sceneDone)}
  if(st===1){F.ottoSt=2;return showScene(['작업장에 아무도 없다. 냉각기만 웅웅거린다.','작업대 위에 두꺼운 장갑 한 켤레가 놓여 있다. 누군가 일부러 꺼내 둔 것처럼.'],()=>gainGear('x_otg',sceneDone))}
  if(glove&&r.hp<=r.maxHp*.5)return showScene(['노인이 내 꼴을 위아래로 훑는다.',[O,'…또 이러는군.'],[O,'자네 같던 사람이 이전에 넷 있었지.'],{c:[{b:'지금은 어디 있는데요?'}]},[O,'전부 얼어붙었네.'],{c:[{b:'아...'}]},[O,'저놈 혼자 두면 얼어 죽겠다.'],'노인이 장갑 낀 손으로 내 어깨를 툭 친다.',[O,'조수는 아니다. 따라가는 것뿐이야.'],{c:[{b:'함께 간다',f:()=>mateJoin('otto')}]}],sceneDone);
  showScene(['노인은 눈길도 주지 않는다.',[O,'어이, 신입. 여긴 놀러 오는 데 아니다.'],...(glove?[]:['장갑을 어디 두고 왔는지, 노인이 혀를 찬다.'])],sceneDone)}
function cadetVisit(n){const r=S.run,F=r.flags,CD='견습생';S.screen='event';renderTop();
  if(F.cadetGone){n.fixDone=true;save();return showScene(['아카데미 앞 계단이 비어 있다.'],sceneDone)}
  showScene(['아카데미 앞 계단에 생도 하나가 끝나지 않은 작품을 끌어안고 앉아 있다.',[CD,'이방인이시죠? 제 작품, 어느 파벌 것 같아요?'],[CD,'보존파 선배는 고증이 틀렸대요. 곡해파 선배는 너무 얌전하대요. 방직파는… 아직 실이 안 닿았대요.'],[CD,'말로는 모르겠어요. 직접 부딪혀 봐야 알 것 같아요.'],
    {c:[{b:'상대해 준다',f:()=>{F.cadetFight=1}},{b:'지나간다'}]}],()=>{if(F.cadetFight){F.cadetFight=0;r.at={kind:'combat',enemies:[makeEnemy('cadet')],evb:[],node:n.id};save();toast(CD,'체력이 70% 아래로 떨어지면 설득하기 카드가 생긴다');return transition(resumeAt)}sceneDone()})}
function cadetJoinScene(){const CD='견습생';showScene(['생도가 붓을 내려놓고, 다 된 작품을 한참 바라본다.',[CD,'…아직 어느 파벌인지는 모르겠어요.'],[CD,'그래도 처음으로 끝까지 그렸어요. 이방인 덕분이에요.'],[CD,'따라가도 돼요? 보관함에 뭘 넣고 다니시는지 보면, 제 방향도 정해질 것 같아요.'],{c:[{b:'함께 간다',f:()=>mateJoin('cadet')}]}],()=>{save();showMap()})}
/* 아쉬부티 공방 바로 옆 가판대 — 곡해파 예술가 (동료 아님, 대화할 수 있는 NPC, 이름 미정) */
const GOK_TALK=['오늘의 작품은 『붉은 망토의 등』. 천둥신이 등을 보이고 달아나는 그림이지. 다들 화를 내더군.','『자비라는 이름의 망치』. 그 망치가 연민이 아니라 질투였다면? 아, 그냥 해석이야.','『빛에게 먹힌 빛』. 빛의 신은 살해당한 게 아니라 자기 빛에 삼켜진 거라네.','『겁 많은 왕』. 주신은 지혜로웠던 게 아니라, 세상이 무서웠던 거지.','방직파도 보존파도 날 싫어하지. 그런데 매일 이 앞을 지나가면서 꼭 한 번씩은 보고 가더군.','고장 난 시계도 하루에 두 번은 맞는다네. 나는 그 두 번을 위해 하루 종일 틀리는 거고.'];
function gokStall(){const r=S.run,F=r.flags,G='곡해파 예술가',i=(F.gokTalk||0)%GOK_TALK.length;S.screen='event';renderTop();
  showScene([F.gokTalk?'아쉬부티 공방 바로 옆 가판대. 오늘도 그가 있다.':'아쉬부티 공방 바로 옆 가판대에, 누구도 감히 입에 올리지 못할 그림들이 걸려 있다. 지나가는 사람들이 얼굴을 찌푸리면서도 걸음을 늦춘다.',
    {c:[{b:'가판대의 작품을 본다',f:()=>{F.gokTalk=(F.gokTalk||0)+1},then:[[G,GOK_TALK[i]]]},{b:'지나간다'}]}],sceneDone)}
/* ================= 지역 필드 (11/6) — 그 공방 구역 안에서 막을 옮길 때마다 발동, 필드 이름은 같은 이름의 키워드와 별개 ================= */
const FIELD={N:{n:'냉기 필드',t:'움직일 때마다 최대 체력의 5%씩 체력 감소, 이것으로 쓰러질 수 있음'},S:{n:'예술 필드',t:'어느 막에 가든 10% 확률로 이벤트가 먼저 발동'},E:{n:'열기 필드',t:'움직일 때마다 증기 +1, 최대 10, 다음 전투에 적용'}};
function artEvent(){const ks=Object.keys(GEV).filter(k=>GEV[k].zone==='S'),kid=ks.filter(k=>/납치/.test(GEV[k].title)),thr=ks.filter(k=>/(^|\s)실(\s|$)/.test(GEV[k].title));const pool=rnd()<.7?kid:thr;return pool.length?pick(pool):(kid[0]||thr[0]||null)}
function fieldStep(n,id,first){const r=S.run,F=FIELD[n.reg];if(!F||n.kind==='center')return false;
  r.flags.fld=r.flags.fld||{};if(!r.flags.fld[n.reg]){r.flags.fld[n.reg]=1;toast(F.n,F.t)}
  if(n.reg==='N'){const d=Math.max(1,Math.round(r.maxHp*.05));r.hp-=d;renderTop();toast('냉기 필드',`체력 -${d}`);palEv('fN');if(r.hp<=0){r.hp=0;r.at=null;save();gameOver();return true}}
  if(n.reg==='E'){const v=Math.min(10,(r.fSteam||0)+1);if(v!==(r.fSteam||0)){r.fSteam=v;toast('열기 필드',`증기 ${v} / 10`)}palEv('fE');}
  if(n.reg==='S'&&rnd()<.1){const ev=artEvent();if(ev){r.artNext={id,first};r.at={kind:'event',ev,node:null};save();toast('예술 필드','막에 들어서기 전에 무언가가 먼저 다가온다');palEv('fS');transition(resumeAt);return true}}
  save();return false}
/* 2장 상점 — 공방 상점 (영웅 등급 이하), 진열 카드 5 · 장비 5, 상점 오른쪽 아래 전투 선택지 */
function shop2Price(base,kind){const r=S.run;let disc=0;if(eq('u_contract'))disc=Math.max(disc,.3);if(kind==='card'&&eq('u_plan'))disc=Math.max(disc,.4);if(kind==='food'&&eq('u_ticket'))disc=Math.max(disc,.5);
  if(r.flags.actF&&r.flags.actF.nextShop30&&S.run.shopDiscNow)disc=Math.max(disc,.3);
  return Math.round(base*.5*(1-disc)*(1+((r.flags.actF&&r.flags.actF.shopUp)||0)))}/* 2장 물가 50% 인하 */
function genShop2(n){const r=S.run;if(n.shop)return n.shop;
  const ws=regWS(n.reg||'C');const W=WS2[ws];/* 그 구역 공방 카드만 판매 */
  const nc=5+(eq('u_case')?1:0),ng=5+(eq('u_case')?1:0);
  const cards=shuffle(W.cards.slice()).slice(0,nc).map(id=>({id}));
  const gearPool=[...Object.keys(GEAR).filter(k=>GEAR[k].ws2===ws&&GEAR[k].nw).map(k=>({k,type:'gear'})),...Object.keys(EQUIP).filter(k=>EQUIP[k].ws2===ws&&EQUIP[k].nw&&!(r.equip||[]).includes(k)).map(k=>({k,type:'held'}))];
  const gear=shuffle(gearPool).slice(0,ng);
  r.shopN2=(r.shopN2||0)+1;
  n.shop={ws,cards,gear,rer:0};return n.shop}
/* ================= 상점 반응 (V37.26) — 2장 상점 주인 멜헬름, 리테가 있으면 리테도 ================= */
const MEL_BARK={rich:['허허, 통 크구먼! 그거 들고 오래 살아남아야 본전 뽑는 거여.','그걸 사네? 자네 오늘부터 단골이여.','잘 샀어. 환불은 없고.'],cheap:['소박하구먼. 그런 게 오래 가.','그거 하나면 되겠어? 아이고, 알았어.'],
  quit:['에이, 보기만 하는 건 공짜여. 근데 너무 오래 보진 말고. 여기선 그거 갖고도 맞는 수가 있거든.','다음에 와. 그때까지 안 팔리면 자네 거여.'],poor:['주머니가 가볍구먼. 주식이라도 좀 굴려 봐.','외상은 안 돼. 미안혀.'],
  rer:['창고 좀 뒤져 보지. 잠깐만.','또? 허허, 돈 내는 사람 맘이지.'],sbuy:['좋아, 인정 한 장 샀구먼.','오를 거여. 아마도.'],swin:['거 봐, 내 말 듣길 잘했지?','이야, 오늘 저녁은 자네가 사.'],sloss:['흠… 수업료 낸 셈 쳐.','원래 오르락내리락하는 거여. 아마도.'],
  sup:['자네 갖고 있는 거 올랐더라? 지금 팔든 더 기다리든, 난 몰러.'],sdown:['자네 종목, 오늘 좀 안 좋더라. 기송관 문서 보다가 내가 다 놀랐어.'],fight:['진심이여? 그럼 도망은 못 가.'],kick:['목숨은 붙여서 내보내 주는 거여. 수업료로 5000실링은 받아 가고. 다신 그러지 마.']};
const RIT_BARK={rich:['은인님, 멋있어요! 저도 저거 쳐다보다가 맞았었는데.'],quit:['은인님, 그건 다음에 사요. 다음이 있으면요.'],poor:['제가 주운 나사라도 드릴까요? 다섯 개 있어요.'],sdown:['은인님, 종이가 싸졌대요. 그럼 더 많이 살 수 있는 거죠?']};
const mpick=a=>a[Math.floor(Math.random()*a.length)];
function showBark(who,tx){let b=$('#mbark');if(!b){b=document.createElement('div');b.id='mbark';$('#stage').appendChild(b)}const e=document.createElement('div');e.className='mb'+(who==='리테'?' rt':'');e.innerHTML=`<b>${who}</b><span>${tx}</span>`;b.appendChild(e);while(b.children.length>2)b.firstChild.remove();setTimeout(()=>{e.classList.add('out');setTimeout(()=>e.remove(),400)},3800)}
function shopBark(k,line){const r=S.run;if(k==='rich'||k==='cheap')palEv('buy');else if(k==='quit')palEv('leave');if(!r||r.act!==2||r.mode!=='human')return;const l=line||(k&&MEL_BARK[k]?mpick(MEL_BARK[k]):'');if(!l)return;showBark('멜헬름',l);const p=r.pal;if(k&&p&&p.k==='girl'&&!p.away&&RIT_BARK[k]&&Math.random()<.6)setTimeout(()=>showBark('리테',mpick(RIT_BARK[k])),1300)}
function melRegion(n,delay){const r=S.run,F=r.flags,reg=n&&n.reg;if(!reg||reg==='C'||(r.pal&&r.pal.k==='girl')||!F.melIntro)return;F.melReg=F.melReg||{};F.reg=F.reg||{};
  if(F.melReg[reg]===1||!F.reg[reg]){F.melReg[reg]=2;F.reg[reg]=1;save();setTimeout(()=>shopBark(null,MEL_REGION[reg]),delay||1800)}}
function shopOnEnter(n){const r=S.run,key=(r.at&&r.at.node)+'|'+(r.floor||0);if(S.shopVisit===key)return;S.shopVisit=key;S.shopLook=false;S.shopBought=false;jmAct();jmNoteSync();save();if(r.mode!=='human')return;
  const st=r.stock;if(st&&st.own){st.seen=st.seen||{};let best=0;for(const k in st.own){const p=st.p[k],s0=st.seen[k];if(s0){const ch=(p-s0)/s0;if(Math.abs(ch)>Math.abs(best))best=ch}}for(const k in st.own)st.seen[k]=st.p[k];
    if(best>=.15)setTimeout(()=>shopBark('sup'),600);else if(best<=-.15)setTimeout(()=>shopBark('sdown'),600)}
  melRegion(n)}
function showShop2(){
  const r=S.run,n=m2Node(r.at.node),sh=genShop2(n),W=WS2[sh.ws];S.screen='shop';viewFor('shop');renderTop();
  setTimeout(()=>palEv('shop'),350);
  if(r.flags.actF&&r.flags.actF.nextShop30&&!sh.disc30){sh.disc30=true;r.flags.actF.nextShop30=0}S.run.shopDiscNow=!!sh.disc30;
  const my=myth(),freeR=(eq('u_pass')&&!sh.rer)||(r.flags.actF&&r.flags.actF.freeRer>0);
  const rerCost=freeR?0:Math.round(1500*(sh.rer+1)*(eq('u_key')?.7:1));
  const gd=r.guild&&(r.guild===sh.ws||r.guild===regWS(n.reg))?.8:1;
  /* V2.30.51.14: 카드 값은 이전의 12분의 1 · 수입품(마지막 칸, 다른 공방 카드)은 20% 더 받음 */
  const cPrice=it=>Math.max(50,Math.round(shop2Price(CARD_PRICE2[it.id],CARDS[it.id].food?'food':'card')*gd/12*(it.imp?1.2:1)/50)*50);
  const gPrice=it=>Math.round(shop2Price(it.type==='gear'?GEAR[it.k].p:EQUIP[it.k].p,'gear')*gd);
  const sc=openScreen('',{dim:true});
  sc.innerHTML=`<div class="panel shoppanel" style="width:min(1320px,100%)">
    <div class="maphead"><div><div class="psub">공방 상점 · 영웅 등급 이하${(r.flags.actF&&r.flags.actF.shopUp)?` · 가격 +${Math.round(r.flags.actF.shopUp*100)}%`:''}${sh.disc30?' · 영업부서 계약 -30%':''}${FAV_WS.includes(sh.ws)?` · 친호도 ${favOf(sh.ws)}${isFriend(sh.ws)?' · 친우':''}`:''}${gd<1?' · 입단 -20%':''}</div><div class="ptitle">${W.n}</div></div><div class="purse">보유 <b>${money(r.gold)}</b></div></div>
    <div class="shoplay"><div class="shopmain"><div class="ap-h">카드</div>
    ${my?'<div class="hint">신화덱은 고정되어 있어 카드를 사지 않는다</div>':`<div class="cardrow shoprow">${sh.cards.map((it,i)=>{const p=cPrice(it);return`<div class="cardpick">${staticCard(it.id,false)}<span class="eqtag">${GRADE[cardGrade(it.id)]}${it.imp?' · 수입품':''}</span>${it.sold?'<span class="hint">판매됨</span>':`<button class="plate-btn${r.gold<p?' dis':''}" data-bc="${i}">구매 <span class="price">${money(p)}</span></button>`}</div>`}).join('')}</div>`}
    ${my?'':`<div class="ap-h">장비</div><div class="eqgrid shopgear">${sh.gear.length?'':'<div class="hint">진열된 장비가 없다</div>'}${sh.gear.map((it,i)=>{const p=gPrice(it),act=`<div class="eqact">${it.sold?'<span class="hint">판매됨</span>':`<button class="plate-btn${r.gold<p?' dis':''}" data-bg="${i}">구매 ${money(p)}</button>`}</div>`;return it.type==='gear'?gearCardHTML(it.k,act):`<div class="eqcard g-hero"><span class="eqtag">소유 효과</span><b>${EQUIP[it.k].n}</b><div class="eqt">${EQUIP[it.k].t}</div>${act}</div>`}).join('')}</div>`}
    </div><div class="shopside">
      <div class="ap-h">상점</div>
      <button class="svc${r.gold<rerCost?' dis':''}" id="sRer" title="카드"><b>새로고침</b><span class="price">${rerCost?money(rerCost):'무료'}</span></button>
      <div class="ap-h">거래</div>
      <button class="svc trade" id="sStock"><b>주식</b><span>${stockLine(r)}</span></button>
      <button class="svc main" id="sLeave"><b>떠난다</b></button>
      <button class="svc danger" id="sFight" title="모든 공방이 적대한다"><b>전투</b></button></div></div></div>`;
  eqToggle(sc);$('#sStock').onclick=()=>featGuide('stock',()=>openStock(showShop2));
  bindStatic(sc);
  sc.querySelectorAll('.shoprow .cardpick,.shopgear .eqcard').forEach(e=>e.addEventListener('click',ev=>{if(!ev.target.closest('button'))S.shopLook=true}));
  const bought=(p,g0)=>{S.shopBought=true;shopBark(p>=g0*.5?'rich':Math.random()<.5?'cheap':null)};
  sc.querySelectorAll('[data-bc]').forEach(b=>b.onclick=()=>{const it=sh.cards[+b.dataset.bc],p=cPrice(it);if(it.sold)return;if(jmNoBuy('card',+b.dataset.bc))return toast('상점','이 물건은 지금 살 수 없다');if(r.gold<p)return shopBark('poor');const g0=r.gold;r.gold-=p;it.sold=true;n.used=true;addToDeck(it.id);toast('카드',`「${CARDS[it.id].name}」 — 카드 보관함으로`);save();showShop2();bought(p,g0)});
  sc.querySelectorAll('[data-bg]').forEach(b=>b.onclick=()=>{const it=sh.gear[+b.dataset.bg],p=gPrice(it);if(it.sold)return;if(jmNoBuy('gear',+b.dataset.bg))return toast('상점','이 물건은 지금 살 수 없다');if(r.gold<p)return shopBark('poor');const g0=r.gold;r.gold-=p;it.sold=true;n.used=true;save();setTimeout(()=>bought(p,g0),50);
    if(it.type==='held'){r.equip=r.equip||[];if(!r.equip.includes(it.k))r.equip.push(it.k);toast('소유 효과 장비',`「${EQUIP[it.k].n}」 — 장비 보관함에 있으면 효과가 난다`);save();showShop2()}else gainGear(it.k,showShop2)});
  $('#sRer').onclick=()=>{if(r.gold<rerCost)return shopBark('poor');r.gold-=rerCost;if(freeR&&!(eq('u_pass')&&!sh.rer)&&r.flags.actF.freeRer>0)r.flags.actF.freeRer--;sh.rer++;n.shop=null;const keep={rer:sh.rer,removed:sh.removed,removeCost:sh.removeCost,disc30:sh.disc30,ws:sh.ws};
    r.shopN2--;const ns=genShop2(n);Object.assign(ns,keep);n.shop=ns;
    const W2c=WS2[ns.ws];ns.cards=shuffle(W2c.cards.slice()).slice(0,5+(eq('u_case')?1:0)).map(id=>({id}));for(const i of jmKeepSlots())if(sh.cards[i]&&i<ns.cards.length)ns.cards[i]=sh.cards[i];save();showShop2();if(Math.random()<.5)shopBark('rer')};
  $('#sLeave').onclick=()=>{const q=S.shopLook&&!S.shopBought;showMap();if(q)shopBark('quit')};
  $('#sFight').onclick=()=>confirmBox('전투','이 버튼을 누르면 전투가 시작됩니다. 모든 공방이 적대하고 상점이 닫힙니다.','전투한다',()=>{favHit(sh.ws);r.hostile=true;toast('적대','모든 공방이 플레이어를 적대한다');shopBark('fight');r.at={kind:'combat',enemies:a2Group(sh.ws),node:n.id,noFlee:true,shopFight:true};save();transition(resumeAt)});
  shopOnEnter(n);
  if(r.at&&r.at.intro&&!r.flags.melIntro){r.flags.melIntro=1;r.at.intro=0;save();return showScene(sceneMelShop(),()=>{save();renderTop();showShop2();melRegion(n,900)},{lite:true})}
  if(!r.flags.melIntro){a2Guide('shop')}
}
/* 주식 (V22) — 모의 주식 투자. 니다벨리르 5대 공방 5종목
   지도에서 한 막 이동할 때마다 1시간이 지나고 주가가 움직임 · 1장·2장 모든 상점에서 매수·매도
   V30.13.5 밸런스: 위험이 클수록 기대 수익도 큼(레미 안정 … 크리밀라 고위험), 오름세(drift)는 지도 이동으로 흐른 시간에만,
   시간 넘기기는 오름세 없이 출렁이기만 함 · 상점 한 번 들를 때마다 최대 24시간 · 매도 수수료 2% · 급등·급락은 종목마다 빈도·크기가 다르고 기대값 0
   (모의실험: 20막 보유 시 평균 레미 +2% · 스타인러 +4% · 아쉬부티 +5% · 크리뷔스 +7% · 크리밀라 +11%, 손해 볼 확률 40~47%) */
const STOCKS={remi:{base:120,vol:.015,drift:.002,jp:.01,js:.10},stein:{base:180,vol:.025,drift:.003,jp:.015,js:.15},ash:{base:240,vol:.035,drift:.0035,jp:.02,js:.18},kriv:{base:150,vol:.05,drift:.0045,jp:.03,js:.20},krim:{base:90,vol:.075,drift:.006,jp:.04,js:.25}};
const STOCK_FEE=.02,STOCK_SKIP=24;
const stockNet=(p,n)=>Math.floor(p*n*(1-STOCK_FEE));
const STOCK_HIST=48;
function ensureStock(r){if(!r.stock){const p={},hist={};for(const k in STOCKS){p[k]=Math.round(STOCKS[k].base*(.85+rnd()*.3));hist[k]=[p[k]]}r.stock={h:0,p,hist,own:{},log:[]}}return r.stock}
function stockTick(skip){const r=S.run;if(!r||r.act!==2)return;const st=ensureStock(r);st.h++;if(!skip)st.nat=(st.nat||0)+1;
  for(const k in STOCKS){const d=STOCKS[k],g=(rnd()+rnd()+rnd()-1.5)/.5*d.vol;let m=1+(skip?0:d.drift)+g;
    if(rnd()<d.jp)m*=rnd()<1/(2+d.js)?1+d.js:1/(1+d.js);st.p[k]=Math.max(Math.round(d.base*.1),Math.round(st.p[k]*m));const h=st.hist[k];h.push(st.p[k]);if(h.length>STOCK_HIST)h.shift()}jmHour()}
function stockSpark(h){const w=120,ht=34,lo=Math.min(...h),hi=Math.max(...h),sp=hi-lo||1;
  const pts=h.map((v,i)=>`${(i/(Math.max(1,h.length-1))*w).toFixed(1)},${(ht-2-(v-lo)/sp*(ht-4)).toFixed(1)}`).join(' ');
  const up=h[h.length-1]>=h[0];return`<svg viewBox="0 0 ${w} ${ht}" width="${w}" height="${ht}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${up?'#9ad6c4':'#ee9a8e'}" stroke-width="2"/></svg>`}
function eqToggle(root){root.querySelectorAll('.shoppanel .eqcard').forEach(c=>{c.tabIndex=0;c.setAttribute('role','button');c.setAttribute('aria-expanded','false');const t=e=>{if(e.target.closest('button'))return;const o=c.classList.toggle('open');c.setAttribute('aria-expanded',o)};c.addEventListener('click',t);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();t(e)}})})}
function stockLine(r){const st=ensureStock(r);let w=0,c=0;for(const k in st.own){w+=stockNet(st.p[k],st.own[k].n);c+=st.own[k].cost}return w?`평가 ${money(w)} · <em class="${w>=c?'up':'dn'}">${w>=c?'+':'-'}${money(Math.abs(Math.round(w-c)))}</em>`:`${st.h}시간째`}
function openStock(back){
  const r=S.run,st=ensureStock(r),m=$('#modal');m.hidden=false;
  let worth=0;for(const k in st.own)worth+=stockNet(st.p[k],st.own[k].n);
  if(st.skipNat!==(st.nat||0)){st.skipNat=st.nat||0;st.skipLeft=STOCK_SKIP}const left=st.skipLeft;
  const row=k=>{const h=st.hist[k],p=st.p[k],prev=h.length>1?h[h.length-2]:p,ch=prev?(p-prev)/prev*100:0,o=st.own[k]||{n:0,cost:0},avg=o.n?o.cost/o.n:0,pl=o.n?(stockNet(p,o.n)-o.cost):0,maxN=Math.floor(r.gold/p);
    return`<div class="stk"><div class="stk-h"><b>${WS2[k].n}</b><span class="stk-p">${money(p)}</span><span class="stk-c ${ch>0?'up':ch<0?'dn':''}">${ch>0?'▲':ch<0?'▼':'–'} ${Math.abs(ch).toFixed(1)}%</span></div>
      <div class="stk-m">${stockSpark(h)}<span>보유 ${o.n.toLocaleString()}주${o.n?` · 평균 ${money(Math.round(avg))} · 매도 시 ${money(stockNet(p,o.n))} · <em class="${pl>=0?'up':'dn'}">${pl>=0?'+':'-'}${money(Math.abs(Math.round(pl)))}</em>`:''}</span></div>
      <div class="stk-b"><span class="stk-l">매수</span>${[1,10,100].map(n=>`<button class="plate-btn buy" data-buy="${k}" data-n="${n}" ${maxN<n?'disabled':''}>${n}</button>`).join('')}<button class="plate-btn buy" data-buy="${k}" data-n="max" ${maxN<1?'disabled':''}>최대</button>
        <span class="stk-l">매도</span>${[1,10,100].map(n=>`<button class="plate-btn sell" data-sell="${k}" data-n="${n}" ${o.n<n?'disabled':''}>${n}</button>`).join('')}<button class="plate-btn sell" data-sell="${k}" data-n="all" ${o.n<1?'disabled':''}>전부</button></div></div>`};
  m.innerHTML=`<div class="panel" style="width:min(980px,100%)"><div class="maphead"><div><div class="psub">${st.h}시간째 · 보유 ${money(r.gold)}${worth?` · 평가 ${money(worth)}`:''}</div><div class="ptitle">주식</div></div><button class="btn-ghost" id="mClose">돌아가기</button></div>
    <div class="stks">${Object.keys(STOCKS).map(row).join('')}</div>
    <div class="stk-t"><span class="stk-l">시간 넘기기 · 남은 ${left}시간</span>${[1,6,24].map(h=>`<button class="plate-btn" data-skip="${h}" ${left<h?'disabled':''}>+${h}시간</button>`).join('')}<span class="stk-l">매도 수수료 2%</span><button class="linkbtn" id="stHelp">주식 설명</button></div></div>`;
  $('#stHelp').onclick=()=>featGuide('stock',()=>openStock(back),true);
  m.querySelectorAll('[data-skip]').forEach(b=>b.onclick=()=>{const n=Math.min(+b.dataset.skip,st.skipLeft);if(n<1)return;st.skipLeft-=n;for(let i=0;i<n;i++)stockTick(true);jmAct();save();openStock(back)});
  $('#mClose').onclick=()=>{closeModal();back()};
  m.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{if(jmNoStock(b.dataset.buy))return toast('주식','이 공방의 주식은 지금 사고팔 수 없다');const k=b.dataset.buy,p=st.p[k],n=b.dataset.n==='max'?Math.floor(r.gold/p):+b.dataset.n;if(n<1||r.gold<p*n)return;
    r.gold-=p*n;const o=st.own[k]=st.own[k]||{n:0,cost:0};o.n+=n;o.cost+=p*n;st.seen=st.seen||{};st.seen[k]=p;save();renderTop();openStock(back);if(Math.random()<.6)shopBark('sbuy')});
  m.querySelectorAll('[data-sell]').forEach(b=>b.onclick=()=>{if(jmNoStock(b.dataset.sell))return toast('주식','이 공방의 주식은 지금 사고팔 수 없다');const k=b.dataset.sell,o=st.own[k];if(!o||!o.n)return;const n=b.dataset.n==='all'?o.n:Math.min(o.n,+b.dataset.n),p=st.p[k];
    const avg=o.cost/o.n,gain=stockNet(p,n)-avg*n;r.gold+=stockNet(p,n);o.cost-=avg*n;o.n-=n;if(!o.n)delete st.own[k];save();renderTop();openStock(back);shopBark(gain>=0?'swin':'sloss')});
}
const FG_KEY='ash-midgard-featguide-v1';
const FGUIDE={
  stock:['주식',['공방에 투자할 수 있어요. 지도에서 한 막 이동할 때마다 1시간이 지나고 주가가 변해요. 다 잃어도 괜찮아요. 그러면 더 잃을 것도 없으니까요.','레미 공방은 잘 움직이지 않는 대신 조금씩 오르고, 크리밀라 공방은 크게 출렁이는 대신 잘 풀리면 많이 올라요. 가끔 급등하거나 급락해요.','주식은 2장 니다벨리르에서만 거래해요. 산 주식은 모든 공방 상점과 암시장에서 팔 수 있어요. 팔 때 수수료 2%를 내므로, 평균가보다 2% 넘게 비싸게 팔아야 이득이에요. 그래프는 최근 48시간의 주가예요.','시간 넘기기로 이동하지 않고 시간을 보낼 수 있어요. 상점에 한 번 들를 때마다 24시간까지 넘길 수 있어요. 공방이 일해야 오르기 때문에, 넘긴 시간에는 주가가 오르내리기만 하고 오름세는 없어요.']],
};
function fgSeen(){try{return JSON.parse(localStorage.getItem(FG_KEY)||'{}')}catch(e){return{}}}
function featGuide(k,then,force){const g=FGUIDE[k];if(!g)return then&&then();const seen=fgSeen();if(seen[k]&&!force)return then&&then();
  seen[k]=1;try{localStorage.setItem(FG_KEY,JSON.stringify(seen))}catch(e){}
  const m=$('#modal');m.hidden=false;let i=0;
  const draw=()=>{m.innerHTML=`<div class="panel" style="width:min(640px,100%)"><div class="maphead"><div><div class="psub">튜토리얼 · ${i+1} / ${g[1].length}</div><div class="ptitle">${g[0]}</div></div><button class="btn-ghost" id="fgSkip">건너뛰기</button></div>
    <div class="ptext">${g[1][i]}</div><div class="choices"><button class="btn-main" id="fgNext">${i<g[1].length-1?'다음':'알겠다'}</button></div></div>`;
    const end=()=>{closeModal();then&&then()};$('#fgSkip').onclick=end;$('#fgNext').onclick=()=>{if(i<g[1].length-1){i++;draw()}else end()}};draw()}
/* 사건 — 방향(구역)별 사건과 공통 사건 */
/* 계약-공방 — 전투 없이 10개 이상의 노드를 거쳤다면, 방향에 맞는 공방(낙하 때 고른 방향)에서 카드와 물건을 지원받음 (이벤트 글은 작성 예정) */
/* 공방 친호도 — 최대 100, 사건과 선택지로만 오름, 50이면 입단 제의, 100을 찍으면 친우(70 이상이면 유지) */
const FAV_WS=['stein','kriv','ash','remi'];
const favOf=ws=>(S.run.fav&&S.run.fav[ws])||0;
const isFriend=ws=>{const r=S.run;return!!(r.friend&&r.friend[ws]&&favOf(ws)>=70)};
function favAdd(ws,n,notes){const r=S.run;r.fav=r.fav||{};const v=clamp(favOf(ws)+n,0,100);r.fav[ws]=v;if(v>=100){r.friend=r.friend||{};r.friend[ws]=true}if(notes)notes.push(`${WS2[ws].n} 친호도 ${n>0?'+':''}${n} (${v})`);
  r.joinAsked=r.joinAsked||{};if(v>=50&&!r.guild&&!r.joinAsked[ws]&&r.mode==='human')r.pendJoin=ws;if(n>0)r.pendFav=true}
function favHit(ws){const r=S.run;if(!FAV_WS.includes(ws))return;r.favHit=r.favHit||{};const c=r.favHit[ws]=(r.favHit[ws]||0)+1,d=[5,15,25,50][Math.min(c,4)-1];r.fav=r.fav||{};r.fav[ws]=Math.max(0,favOf(ws)-d);if(r.friend&&r.friend[ws]&&r.fav[ws]<70)r.friend[ws]=false;toast('친호도',`${WS2[ws].n} 친호도 -${d} (${r.fav[ws]})`)}
function showJoin(){const r=S.run,ws=r.pendJoin,W=WS2[ws];r.pendJoin=null;r.joinAsked=r.joinAsked||{};r.joinAsked[ws]=true;save();S.screen='event';renderTop();viewFor('map');
  const sc=openScreen('',{dim:true});sc.innerHTML=`<div class="panel evpanel" style="width:min(800px,100%)"><div><div class="psub">공방 입단 제의</div><div class="ptitle">${W.n}</div></div><div class="ptext">${W.n}에서 함께하자는 제의가 왔다.</div>
    <div class="choices"><button class="choice" id="jYes"><b>입단한다</b><span>입단은 한 곳만 할 수 있다 · 이 지역 상점 가격 -20%</span></button><button class="choice" id="jNo"><b>거절한다</b><span>친호도는 그대로 남는다</span></button></div></div>`;
  $('#jYes').onclick=()=>{r.guild=ws;toast('입단',`${W.n}에 입단했다`);save();showMap()};$('#jNo').onclick=()=>{save();showMap()}}
function showContract(){const r=S.run,ws=DIR2[r.dir].ws,W=WS2[ws],then=r.at.then;S.screen='event';renderTop();viewFor('map');
  eventPanel('계약-공방',`특수 이벤트 · ${W.n}`,`전투 없이 ${r.quiet}곳을 지났다. ${W.n}이(가) 계약을 제안한다.`,[
    {b:'계약한다',s:`${W.n} 카드 1장과 공방 장비 1개를 지원받는다 — 정예 러시 세 번째 상대가 ${ENEMY[CONTRACT_P[ws]].name}(계약 파기 전투)가 되고, 그 전투에서는 ${W.n} 카드를 쓸 수 없다`,f:()=>{
      r.contract=ws;const cid=pick(W.cards.filter(id=>!myth()));if(cid&&!myth())addToDeck(cid);
      const gk=pick(Object.keys(GEAR).filter(k=>GEAR[k].ws2===ws));save();toast('계약',`${W.n}와(과) 계약했다${cid&&!myth()?` · 「${CARDS[cid].name}」`:''}`);
      gainGear(gk,()=>{r.at=then;save();then?resumeAt():showMap()})}},
    {b:'계약하지 않는다',s:'지원 없음',f:()=>{r.at=then;save();then?resumeAt():showMap()}}])}
/* 신화 빌드 — 묠니르(토르): 일반 카드 없이 토르의 고유 카드로만 덱을 구성 (1레벨 기준 체력 210 · 공 11 · 방 11 · 명중 70(-20) · 회피 50(+20)) · 레벨은 이어 감 (임시 해석) */
function becomeThor(){const r=S.run;const ratio=r.hp/r.maxHp;
  const mc=mythCarry(r,11+(r.lvl-1),11+(r.lvl-1),hpAt(210,r.lvl));Object.assign(r,{mode:'thor',base1:Math.max(210,r.base1||0),atk:mc.atk,def:mc.def,acc:50,eva:70});r.maxHp=mc.maxHp;r.hp=Math.max(1,Math.round(r.maxHp*ratio));
  r.deck=[];for(const[id,n]of MYTH_DECK.thor)for(let i=0;i<n;i++)addToDeck(id);r.hostile=true;r.flags.mjolnir=true;save();toast('묠니르','신화 빌드 · 모든 공방이 적대')}
/* 신화 빌드 — 궁니르(오딘): 1레벨 기준 체력 130(외안 -10%) · 공 11 · 방 4 · 명중 70(+999) · 회피 50(+20, 외안 -10) · 레벨은 이어 감 */
function becomeOdin(){const r=S.run;const ratio=r.hp/r.maxHp;
  const mc=mythCarry(r,11+(r.lvl-1),4+(r.lvl-1),hpAt(117,r.lvl));Object.assign(r,{mode:'odin',base1:Math.max(117,r.base1||0),atk:mc.atk,def:mc.def,acc:1069,eva:60});r.maxHp=mc.maxHp;r.hp=Math.max(1,Math.round(r.maxHp*ratio));
  r.deck=[];for(const[id,n]of MYTH_DECK.odin)for(let i=0;i<n;i++)addToDeck(id);r.flags.gungnir=true;save();toast('궁니르','신화 빌드 · 필중과 관통')}
/* 정예 러시 — 정예 → 정예 → 정예 → 정예 → 보스, 정예 사이에 회복 없음 */
for(const k in GEAR)if(GEAR[k].s==='arm')GEAR[k].s='rh';
const RUSH=['sender','examiner','contract','guard','clerk'];
function startRush(){const r=S.run,i=r.at.i||0;let key=RUSH[i];
  if(key==='contract'){const ws=pick(Object.keys(CONTRACT_P));r.rushWs=ws;key=CONTRACT_P[ws];
    if(isFriend(ws)||r.guild===ws){const h=Math.round(r.maxHp*.15);r.hp=Math.min(r.maxHp,r.hp+h);toast('공방의 사람',`${WS2[ws].n} 사람이 길을 비켜 주었다 · 체력 +${h}`);if(r.m2&&r.m2.inside)r.m2.inside.cur=i+1;r.at=null;save();return showMap()}}
  const E=makeEnemy(key);r.at={kind:'combat',enemies:[E],rush:i};save();resumeAt()}
/* 2장 튜토리얼 — 지점(방향)마다 다르게, 상점부터 키워드 설명 (문서: 튜토리얼 · 2장 튜토리얼) */
const A2_GUIDE={
  equip:['장비',['공방 상점에서는 장비를 살 수 있어요. 산 장비는 바로 적용되지 않고 장비 보관함으로 들어가요.','장비 보관함에서 장비를 눌러 머리, 몸통, 다리, 오른손, 왼손, 발 칸에 착용해요.']],
  fav:['공방 친호도',['공방 사건의 선택에 따라 그 공방의 친호도가 올라요.','친호도가 50이 되면 공방에서 입단을 제의해요. 입단은 한 곳만 할 수 있어요.','입단하면 그 지역 상점이 20% 싸져요. 거절해도 친호도는 그대로예요. 다들 괜찮다고 웃어 주실 거예요. 기억은 하시겠지만요.','친호도가 100이 되면 친우가 돼요.','공방 사건에서 벌어지는 전투는 적대로 이어지지 않아요.']],
  shop:['니다벨리르 상점',['니다벨리르는 미드가르드보다 물건값이 훨씬 비싸요. 놀라지 마세요. 돈이 없는 건 게으르다는 증거라고들 하니까요.','니다벨리르부터 일반 카드는 나오지 않아요. 공방 상점에서는 희귀와 영웅 등급을 팔아요.','범용 장비는 착용하지 않아도 보관함에 넣어 두기만 하면 효과가 적용돼요. 같은 범용 장비는 하나만 가질 수 있고, 할인 효과는 서로 겹치지 않아요.','상점에서 전투를 고르면 모든 공방이 적대하고 상점이 닫혀요. 부디 그러지 마세요. 걱정돼서 그래요.']],
  gov:['중앙정부',['이곳은 공방이 아니라 모든 것을 정의하는 곳이에요.','여기서 사망으로 기록되면, 맞든 틀리든 그날부터 돌아가신 분이에요. 서류는 꼭 확인하세요. 걱정돼서 그래요.']],
  krim:['크리밀라 공방',['인간의 기술로 신의 능력을 따라 하는 곳이에요. 꿈이 있는 분들은 참 멋지죠. 옆자리 분이 사라져도 놀라지 마세요. 새로운 분이 금방 오시거든요.']],
};
const A2G_KEY='ash-midgard-a2guide-v1';
function a2GuideSeen(){try{return JSON.parse(localStorage.getItem(A2G_KEY)||'{}')}catch(e){return{}}}
function a2Guide(k,then){const g=A2_GUIDE[k];if(!g)return;const seen=a2GuideSeen();if(seen[k]&&tutDone())return then&&a2Guide(then);seen[k]=1;try{localStorage.setItem(A2G_KEY,JSON.stringify(seen))}catch(e){}
  setTimeout(()=>{const m=$('#modal');if(!m.hidden)return;m.hidden=false;let i=0;const draw=()=>{m.innerHTML=`<div class="panel" style="width:min(640px,100%)"><div class="maphead"><div><div class="psub">${S.run&&S.run.pal&&S.run.pal.k==='girl'?'리테':'니다벨리르 안내'} · ${i+1} / ${g[1].length}</div><div class="ptitle">${g[0]}</div></div><button class="btn-ghost" id="gSkip">건너뛰기</button></div>
    <div class="ptext">${g[1][i]}</div><div class="choices"><button class="btn-main" id="gNext">${i<g[1].length-1?'다음':'알겠다'}</button></div></div>`;
    const end=()=>{closeModal();if(then)a2Guide(then)};$('#gSkip').onclick=end;$('#gNext').onclick=()=>{if(i<g[1].length-1){i++;draw()}else end()}};draw()},REDUCED?50:450)}
function a2GuideRegion(reg){const r=S.run;if(!reg||reg==='C')return;r.flags.reg=r.flags.reg||{};if(!r.flags.reg[reg]){r.flags.reg[reg]=1;if(r.pal&&r.pal.k==='girl')palSay(PAL_REGION[reg],true);else{r.flags.melReg=r.flags.melReg||{};r.flags.melReg[reg]=r.flags.melReg[reg]||1}}if(r.floor>=10&&r.mode==='human'&&!r.flags['zn'+reg]){r.flags['zn'+reg]=1;r.pendZone=reg}}
/* ================= 이야기 장면 · 동료 · 상태이상 설명 (V37) ================= */
/* 장면: '글' | ['이름','대사'] | {c:[{b:'선택지',f:함수,then:[이어지는 장면]}]} */
/* V2.28.47.11 대화 장면 — 비주얼 노벨식 (허리 위 인물, 이름표, 아래 대사창). 그림은 PORTRAIT에 이름으로 넣는다: {img, face:{x,y,w}, ar} — x·y·w는 그림 가로 기준 비율, ar은 세로/가로 */
const PORTRAIT={};
const VN_NOFIG=new Set(['주인공','나','']);
function vnFig(n){const P=PORTRAIT[n]||(n==='순수유물주의자'&&typeof BISHOP_BODY!=='undefined'?{img:BISHOP_BODY}:null);
  return P?`<img class="vn-img" src="${P.img}" alt="${n}">`:`<div class="vn-sil" aria-hidden="true"><i></i><u></u></div>`}
function faceHTML(n){const P=PORTRAIT[n];if(!P||!P.face)return '<span class="fsil" aria-hidden="true"><i></i><u></u></span>';
  const f=P.face,W=100/f.w,ar=P.ar||2;return `<img class="fimg" alt="" src="${P.img}" style="width:${W}%;left:${-(f.x-f.w/2)*W}%;top:${-(f.y*ar-f.w/2)*W}%">`}
function showScene(list,done,opt){opt=opt||{};let vnL='',vnR='',vnLast='',vnHist=[],vnAuto=false,vnPrev=null;
  const vnTop=()=>{const r=S.run,loc=r?(r.act===2?`2장 · ${r.dir&&typeof DIR2!=='undefined'&&DIR2[r.dir]?DIR2[r.dir].n+' 구역':'니다벨리르'}`:'1장 · 미드가르드'):'';return `<div class="vn-top"><span>${loc}</span><span class="vn-tools"><button class="vn-tool" id="vnLog">기록</button><button class="vn-tool${vnAuto?' on':''}" id="vnAuto">자동</button></span></div>`};
  const vnBind=next=>{const l=$('#vnLog'),a=$('#vnAuto');if(l)l.onclick=e=>{e.stopPropagation();const o=document.createElement('div');o.className='vn-log';o.innerHTML=`<div class="vn-logbox">${vnHist.map(h=>`<p>${h[0]?`<b>${h[0]}</b>`:''}${h[1]}</p>`).join('')||'<p>아직 없음</p>'}<small>눌러서 닫기</small></div>`;o.onclick=()=>o.remove();$('#modal .vn').appendChild(o)};
    if(a)a.onclick=e=>{e.stopPropagation();vnAuto=!vnAuto;a.classList.toggle('on',vnAuto);if(vnAuto&&next)next()}};
  const vnStage=w=>{if(w&&!VN_NOFIG.has(w)){if(w!==vnL&&w!==vnR){if(!vnR)vnR=w;else if(!vnL)vnL=w;else if(vnLast==='r')vnL=w;else vnR=w}vnLast=w===vnR?'r':'l'}
    const one=(n,sd)=>n?`<div class="vn-p ${sd}${n===w?' on':''}">${vnFig(n)}</div>`:'';return `<div class="vn-ps">${one(vnL,'l')}${one(vnR,'r')}</div>`};
  const m=$('#modal');list=list.slice();$('#tut').hidden=true;stage.removeAttribute('data-tut');palRender(false);m.hidden=false;m.classList.add('scn');m.classList.remove('scn-sky','scn-dark','scn-lite');if(opt.sky)m.classList.add('scn-sky');if(opt.lite)m.classList.add('scn-lite');S.modalLock=true;let i=0,tmr=0;
  const end=()=>{clearTimeout(tmr);S.modalLock=false;closeModal();if(done)done()};
  const dark=()=>{m.classList.add('scn-dark');m.classList.remove('scn-sky')};
  const draw=()=>{clearTimeout(tmr);const it=list[i];if(it==null)return end();
    if(it.fx==='fade'){dark();vnL=vnR='';i++;return draw()}
    if(it.c){const pv=vnPrev;m.innerHTML=`<div class="vn">${vnTop()}${vnStage(pv&&pv[0]||'')}<div class="vn-box vn-ch">${pv&&pv[0]?`<div class="vn-name">${pv[0]}</div>`:''}${pv?`<div class="scn-t">${pv[1]}</div>`:''}<div class="vn-chrow">${it.c.map((x,j)=>`<button class="vn-cb" data-sc="${j}">${x.b}</button>`).join('')}</div></div></div>`;vnBind();
      m.querySelectorAll('[data-sc]').forEach(b=>b.onclick=()=>{const x=it.c[+b.dataset.sc];jmAct();if(x.f)x.f();if(x.then)list.splice(i+1,0,...x.then);i++;draw()});return}
    /* 타이핑 — 한 글자씩, 건너뛸 수 없음, 다 나온 뒤 1초 후 다음 */
    if(it.ty==='typing'){m.innerHTML=`<div class="panel scene"><div class="scn-t" id="scT"></div><div class="scn-b"><span></span><button class="btn-main" id="scNext" style="visibility:hidden">다음</button></div></div>`;
      const el=$('#scT'),tx=it.t;let k=0;const step=()=>{if(!el.isConnected)return;k++;el.textContent=tx.slice(0,k);
        if(k<tx.length)tmr=setTimeout(step,80);else tmr=setTimeout(()=>{const b=$('#scNext');if(b&&b.isConnected){b.style.visibility='';b.onclick=()=>{i++;draw()}}},1000)};tmr=setTimeout(step,300);return}
    const who=Array.isArray(it)?it[0]:(it.who||''),tx=Array.isArray(it)?it[1]:(typeof it==='string'?it:it.t);
    /* 자동 진행 — 누를 것 없이 넘어감 (손에 이끌림) */
    if(it.auto){m.innerHTML=`<div class="panel scene ${it.cls||''}">${who?`<div class="scn-who">${who}</div>`:''}<div class="scn-t">${tx}</div></div>`;tmr=setTimeout(()=>{i++;draw()},it.auto);return}
    vnHist.push([who,tx]);vnPrev=[who,tx];m.innerHTML=`<div class="vn">${vnTop()}${vnStage(who)}<div class="vn-box">${who?`<div class="vn-name">${who}</div>`:''}<div class="scn-t">${tx}</div><div class="scn-b"><button class="btn-ghost" id="scSkip">건너뛰기</button><button class="btn-main" id="scNext">다음</button></div></div></div>`;
    const go=()=>{clearTimeout(tmr);i++;draw()};$('#scNext').onclick=go;m.querySelector('.scn-t').onclick=go;vnBind(()=>{clearTimeout(tmr);tmr=setTimeout(go,1600+String(tx).length*45)});if(vnAuto)tmr=setTimeout(go,1600+String(tx).length*45);$('#scSkip').onclick=()=>{clearTimeout(tmr);/* 스토리 전부 건너뛰기 — 선택지는 맨 위의 것으로 */for(let j=i+1;j<list.length;j++){const x=list[j];if(x&&x.c){const c0=x.c[0];if(c0.f)c0.f();if(c0.then)list.splice(j+1,0,...c0.then)}}i=list.length;end()}};
  draw()}
ENEMY.nordJudge={name:'노르드교 이행자',sub:'노르드교',tier:'elite',lv:35,hp1:250,st:{hp:[200,300],atk:[45,70],def:[40,65]},acc:90,eva:60,ap:[5,7],art:'cultist',nord:1,
  deck:{'행동-약점 찢기':3,'행동-표식 강제 부여':2,'행동-파쇄':2,'행동-처형 집행':1},
  passives:[['표식','노르드교 공통 패시브 — 한 턴에 대상을 공격으로 맞히면 다음 턴에 표식Ⅰ, 표식이 붙은 턴에 다시 맞히면 약점 노출, 그다음 턴에 표식 단계가 오름, 최대 Ⅴ, 표식이 붙은 턴에 한 번도 맞히지 못하면 소멸, 단계 1당 표식을 건 쪽에게 받는 데미지 +10%'],['도망 불가','이 전투에서는 도망칠 수 없음']]};
const ZONE_TXT={N:'이전에 느껴본 적 없는 종류의 추위가 살결을 얼린다. 이번 거대 공방은 멈춤의 공방인 것 같다.',E:'매캐한 연기와 습한 분위기, 익숙한 분위기가 나를 반긴다. 이번 공방은 압력의 공방인 것 같다.',W:'역겨우면서도 달콤한 냄새가 코를 강타한다. 이번 공방은 배부름의 공방인 것 같다.',S:'이해할 수 없는 알 수 없는 무언가들이 나를 환영한다. 이번 공방은 교육과 예술의 공방인 것 같다.'};
const DIR_VIRTUE={N:'본능',E:'욕구',S:'갈망',W:'허기'};
const PAL_REGION={N:'차가워요... 들은 얘긴데, 여기선 마음보다 손가락이 먼저 언대요.',E:'여기 사람들은 전부 손으로 한대요. 증기에 데면 손가락부터 세어 보래요.',S:'여기선 작품을 보면 \'오...\'라고만 하래요. 왜인지는 저도 몰라요.',W:'재료만 안 물어보면 다들 친절하대요. 뭔가 엄청난 냄새!'};
const MEL_REGION={N:'여기 춥지? 사람들도 딱 날씨만큼 차가워. 말 걸 땐 손부터 녹이고 혀.',E:'여긴 전부 손으로 만드는 동네여. 증기 조심혀, 데면 손가락부터 세어 봐야 혀.',S:'작품 보면 그냥 \'오...\' 하고 지나가. 뭐냐고 물었다간 해설만 반나절 듣는 거여.',W:'밥은 맛있어. 뭘로 만들었는지만 묻지 마. 그럼 다들 친절혀.'};
const josaUl=w=>{const c=w.charCodeAt(w.length-1)-0xAC00;return w+(c>=0&&c%28?'을':'를')};
/* 2장 진입 — 하늘을 보고(하늘 배경) 페이드 아웃, 멜헬름과 대화, 선택 없이 손에 이끌려 상점으로 */
function sceneA2(dir){const M='멜헬름';
  return['뚫린 공간에 몸을 던졌다.','그곳에서 나는 내가 바라던 하늘을 보았다. 모든 게 밝고, 환하며, 푸르렀다.',{ty:'typing',t:'나는 한동안 멍하니 그 광경을 바라보았다.'},{fx:'fade'},
   [M,'허허, 또 하나 떨어졌구먼. 주기적으로 내려오는 그 자살 집단 생존자여?'],[M,'여긴 니다벨리르여. 꿈이랑 기술의 동네지. 공방 다섯 개가 동서남북이랑 가운데에 하나씩 있고.'],'나는 위를 가리켰다.',[M,'저거? 하늘이여.'],
   {c:[{b:'하늘이 무엇입니까?'}]},[M,'하늘이니까 하늘이지 뭐. 그렇게 정해진 거여. 이미 정해진 거에 꼭 뜻이 있어야 하나?'],'그렇다면, 왜 나는 당연한 걸 갈망한 것인가.','그렇다면, 그 꿈은 이곳에 오라고 나를 불렀던 것인가.','고개를 내리지 못하고 멍하니 하늘을 바라보는 나를, 상점 주인이 훑는다. 꾀죄죄한 몰골, 이가 나간 칼날, 해진 옷.',
   [M,'나는 멜헬름이여. 행색 보아하니 주머니가 텅 비었구먼.'],
   {auto:2200,t:'멜헬름이 대답도 듣지 않고 내 손목을 덥석 잡는다.'},{auto:2000,who:M,t:'일단 들어와. 밖에서 하늘만 보다간 목 꺾여.'},{auto:2100,cls:'tug',t:'나는 이끌리는 대로 상점 안으로 들어갔다.'}]}
/* 첫 상점 — 멜헬름이 털털하게 설명하고 첫 종목을 줌 */
function sceneMelShop(){const r=S.run,M='멜헬름';
  const stk=k=>()=>{const st=ensureStock(r),o=st.own[k]=st.own[k]||{n:0,cost:0};o.n+=1;toast('주식',`${WS2[k].n} 1주`)};
  return[[M,'자, 여기가 내 가게여. 미드가르드보다 값이 좀 셀 거여. 놀라지 말고.'],[M,'여기선 돈 없는 걸 게으르다고들 혀. 나 말고 딴 사람들이.'],[M,'니다벨리르부터는 흔해 빠진 카드는 안 팔아. 희귀랑 영웅 등급만 갖다 놓지.'],
   [M,'산 카드랑 장비는 바로 손에 안 붙어. 보관함에 들어가니까 정비할 때 꺼내 써.'],[M,'장비는 머리, 몸통, 다리, 오른손, 왼손, 발에 차는 거여.'],
   [M,'물건이 맘에 안 들면 새로고침 눌러. 그것도 돈이여.'],[M,'돈 버는 법 하나 알려 줄까. 주식이라는 거여. 물질적으로 만들어 낸, 기업에 대한 인정이지.'],[M,'그 인정의 값은 사람들이 얼마나 갖고 있냐에 따라 한 시간마다 바뀌어.'],
   '전자음과 함께 기송관에서 문서 하나가 내려온다.',[M,'마침 시세표 왔구먼. 첫 종목은 내가 쏘는 거여. 골라 봐.'],{c:['stein','kriv','ash','remi'].map(k=>({b:WS2[k].n,f:stk(k)}))},
   [M,'아, 그리고 내 가게에서 칼 뽑을 생각은 하지 마. 공방들이 전부 등 돌리고 가게도 문 닫아. 그래도 덤비면 도망은 못 가는 거여.']]}
/* 2장 첫 사건 막 — 그 전에 아무도 쓰러뜨리지 않았으면 구출(리테 합류), 비는 언제나 */
function sceneRescue(dir){const v=DIR_VIRTUE[dir]||'갈망',M='멜헬름',G='피투성이 청년',R='리테';
  const join=()=>{S.run.pal={k:'girl',cards:[],gear:[],away:false,first:null,ind:0,hp:0};save()};
  return['이곳에선 들려서는 안 될, 살이 터지는 피육음이 들린다.','상점 주인들이 사람 하나를 둘러싸고 있다.','나는 검을 뽑으려다, 이곳에선 그러면 안 된다고 생각해 다시 집어넣었다.',
   ['상점 주인','훔쳐볼 눈빛으로 가판대를 쳐다봤다네.'],[G,'그냥... 멋있어서요. 돈이 없어서 못 샀어요.'],['상점 주인','생김새부터 직위, 재화, 목표까지 하급인 부랑아일세. 가판대를 쳐다볼 자격이 없지.'],['상점 주인','자네도 곧 같아질 걸세.'],{c:[{b:'여기가 어딥니까?'}]},['상점 주인',`여긴 ${WS_LAB[dir]||'니다벨리르'} 구역일세. 이곳에선 ${josaUl(v)} 따르는 사람만 존중받아.`],['상점 주인','변화가 멈추면 그 자리에서 벗어날 수 없거든. 현실에 안주한 사람은 더 나아갈 수도, 그 자리를 지킬 수도 없는 하급품이 되지.'],
   {c:[{b:'죽일 생각이라면 이 검으로 확실히 죽여라',then:['멜헬름이 검을 쥐고 망설인다.',['주인공','이곳에선 그런 모습은 어울리지 않는다고 하지 않았나.'],['주인공','당신도 상점 주인이라는 현실에 만족하고 살면서, 왜 자신에겐 그 인식이 없지?']]},{b:'이곳의 법칙대로 하고 있으니 존중해 달라',then:['상점 주인들이 물러나고, 멜헬름이 다른 주인들을 몰아 해산시킨다.',[M,'자자, 구경 끝났어! 다들 장사들 하러 가!']]}]},
   '나는 피투성이가 된 청년을 일으켜 세웠다.',{c:[{b:'이름을 묻는다'}]},
   [R,'리테예요. 저, 살았어요? 와... 은인님이세요! 생명의 은인이에요!'],[R,'저 따라가도 돼요? 주신 걸로 충분해요! 아, 아직 아무것도 안 주셨구나.'],{c:[{b:'고개를 끄덕인다',f:join}]}]}
function sceneRain(pal){const R='리테',M='멜헬름';
  return['철제 돔 위쪽에서 묽고 투명한 액체가 떨어진다.','이것은 물이다. 미드가르드에서의 물은 구원에 가까운 생명력이었다.','나는 손을 모으고 입을 벌렸다. 곧 통을 꺼내 물을 받았다.',...(pal?[[R,'은인님, 그거 곧 소리 나요.']]:[]),
   '지직거리는 소리와 함께, 태엽을 감은 듯한 이질적인 목소리가 들려온다.',['음성','스타인러 공방의 온도 급상승으로, 비 행위를 10분간 지속합니다.'],'이것은 물인데. 떨어진다는 이유만으로 비라는 행위가 되었다.','떨어지든, 올라가든, 엎어지든 물은 물이었다.','나는, 나도 모른 채 나만의 하늘을 뺏겨 버린 건 아닐까.',
   {c:[{b:'비를 모은 양동이를 샘물이라 하고 판다',then:['사람들은 처음 듣는 샘물이라는 말에 관심을 보였고, 양동이는 금방 동났다.']},{b:'이것을 누가 정했는지 묻는다',then:[pal?[R,'저 목소리요? 가운데 있는 크리밀라에서 나온대요. 왜 그런지는 저도 몰라요.']:[M,'저 소리? 가운데 크리밀라에서 나오는 거여. 왜냐고는 묻지 마. 다들 모르니께.']]}]}]}
function showA2First(){const r=S.run,at=r.at;if(at.node!=null&&r.m2){const n=r.m2.nodes[at.node];if(n)n.cleared=true}S.screen='event';renderTop();
  const resc=!r.flags.a2Felled,list=resc?sceneRescue(r.dir):sceneRain(false);if(resc)r.flags.pendRain=1;
  showScene(list.filter(x=>!(x&&x.fx==='none')),()=>{r.at=null;save();transition(()=>showMap())})}
function showA2Rain(){const r=S.run,at=r.at;if(at&&at.node!=null&&r.m2){const n=r.m2.nodes[at.node];if(n)n.cleared=true}S.screen='event';renderTop();
  showScene(sceneRain(!!(r.pal&&r.pal.k==='girl')),()=>{r.at=null;save();transition(()=>showMap())})}
function storyMap(){const r=S.run;if(r&&r.pal&&r.pal.k==='nord')r.pal=null;return false}
/* ---- 동료 ---- */
const PAL_FIG='<svg viewBox="0 0 48 64" aria-hidden="true"><circle cx="24" cy="15" r="10" fill="#14171b" stroke="#6b7178" stroke-width="1.5"/><path d="M6 62 C6 40 14 28 24 28 C34 28 42 40 42 62Z" fill="#14171b" stroke="#6b7178" stroke-width="1.5"/></svg>';
const PAL_LINES={girl:{rest:'편하네요~'},smith:{rest:'망치는 쉬어도 손은 안 쉰다.'},otto:{rest:'불 쬐어라. 얼기 전에.'},cadet:{rest:'잠깐 스케치 좀 할게요.'}};
/* ================= 동료 대사 (V2.28) — 상황마다 확률 없이 매번, 여러 줄 중 하나 ================= */
const PAL_TALK={
 girl:{
  start:['은인님, 저 뒤에 있을게요! 아, 앞이 나은가?','싸워요? 지금요? 네, 네! 준비됐어요!','저 사람 눈빛이 무서워요... 그래도 은인님이 계시니까요!','들은 얘긴데, 먼저 때리는 쪽이 이긴대요. 아마도요.','심호흡... 심호흡... 좋아요, 가요!','은인님, 다치시면 안 돼요. 제가 다치는 건 괜찮아요!'],
  turn:['다음은 뭐 하실 거예요?','은인님 차례예요! 아, 알고 계시죠?','저 사람이 뭔가 준비하는 것 같아요.','손에 든 카드 많네요! 다 좋은 거죠?','천천히 하셔도 돼요. 저 사람은 안 기다려 주겠지만요.'],
  def:['막아요, 막아요!','그거 단단해 보여요!','좋아요, 이제 안 아프겠죠?','방패... 저도 하나 갖고 싶어요.','잘 막으셨어요! 아직 안 맞았지만요!'],
  eva:['피하는 거죠? 저도 따라 해 볼게요!','휙휙! 멋있어요!','몸 낮추는 거, 저도 맞을 때 많이 했어요.','바람처럼요!','오, 안 맞을 것 같아요!'],
  hit:['맞았어요! 맞았어요!','와, 아프겠다... 저 사람이요!','은인님 최고예요!','방금 소리 들으셨어요? 퍽!','그렇게 치는 거구나... 외워 둘게요!'],
  big:['우와아! 저게 사람이 낼 수 있는 힘이에요?','엄청나요! 저 사람 휘청거려요!','방금 거 한 번 더요! 한 번 더!','은인님 진짜 은인님이세요!','저 바닥 금 간 거 아니에요?'],
  miss:['아깝다! 진짜 아깝다!','괜찮아요, 다음엔 맞을 거예요!','저 사람 너무 잘 피해요... 반칙 아니에요?','공기를 베셨어요! 공기도 아팠을 거예요!','아앗, 조금만 더 왼쪽이었으면!'],
  hurt:['은인님!! 괜찮으세요?!','피 나요, 피!','저 사람 나빠요! 은인님을 때렸어요!','아파 보여요... 제가 대신 맞을걸.','조심하세요! 저 사람 또 와요!'],
  low:['은인님, 숨 쉬고 계신 거죠? 그렇죠?','안 돼요, 쓰러지시면 안 돼요!','물러나도 돼요! 제가 시간 벌게요!','제발요... 저 혼자 남기 싫어요.','피가 너무 많이 나요...!'],
  block:['막았어요! 하나도 안 들어갔어요!','쾅! 그런데 멀쩡하세요!','방어도 최고예요!','저 사람 손 아프겠다.','그렇게 막는 거구나!'],
  dodge:['안 맞았어요! 휙!','저 사람 헛손질했어요!','은인님 너무 빨라요!','방금 봤어요? 머리카락만 스쳤어요!','피했다! 피했다!'],
  kill:['한 명 쓰러졌어요!','남은 사람도 금방이에요!','잘하셨어요! 아직 끝은 아니에요!','휴... 한 명 줄었어요.','다음 사람이요!'],
  win:['이겼어요! 이겼어요!','은인님 다치신 데 없죠? 다행이다...','역시 은인님이에요!','끝났어요... 다리가 후들거려요.','이긴 거 맞죠? 그렇죠?','저도 조금은 도움이 됐죠? 그렇다고 해 주세요!'],
  follow:['거들게요!','저도요! 저도 칠게요!','에잇!','은인님이 주신 걸로요!','제 차례예요!'],
  out:['죄송해요 조금만 쉴게요..','더는 못 버티겠어요... 금방 올게요!','잠깐만요, 숨 좀...','은인님, 저 빼고 이기셔야 해요!'],
  back:['다시 도와드릴게요!','저 왔어요! 많이 기다리셨죠?','다 나았어요! 거의요!','이번엔 안 쓰러질게요!'],
  map:['이쪽이에요? 좋아요!','어디로 가든 따라갈게요!','저기 가판대 반짝거려요...','발 아파요. 아, 아니에요! 괜찮아요!','니다벨리르는 길이 너무 꼬불꼬불해요.','은인님 발걸음 빠르시다...'],
  shop:['우와, 다 비싸 보여요!','구경만 해도 되죠?','저거, 저거 멋있어요! 아니에요, 그냥 본 거예요.','여기 주인 아저씨 무서워요...','돈은 있으세요? 저는 없어요!'],
  buy:['샀어요! 좋은 거예요?','와, 그거 진짜 멋있어요!','돈 쓰는 거 처음 봐요. 아니, 처음은 아니지만요.','그거 저도 만져 봐도 돼요?'],
  leave:['안 사요? 그럼 저도 안 볼게요.','다음에 또 와요!','저 주인 아저씨가 쳐다봐요... 빨리 가요!'],
  event:['무슨 일이에요?','저 사람들 뭐 하는 거예요?','조심하세요, 니다벨리르 사람들은 웃으면서 찔러요.','뭔가 재밌는 일이에요? 무서운 일이에요?','저 여기 가 본 적 있어요! 아마도요.'],
  rest:['편하네요~','은인님도 좀 주무세요. 제가 지킬게요!','불 따뜻하다...','이런 거 처음이에요. 누구랑 같이 쉬는 거.','내일은 어디 가요?'],
  bag:['보관함이다! 저 뭐 주실 거예요?','이거 다 은인님 거예요? 부자다...','저기 저거 빛나요!','정리 잘하시네요. 저는 다 바닥에 둬요.'],
  give:['저 주시는 거에요? 진짜요? 와.. 진짜 감사해요! 은인님!','소중히 쓸게요! 진짜로요!','이걸로 은인님 지켜 드릴게요!','받아도 돼요? 진짜로요?'],
  fN:['차가워요... 손가락이 안 움직여요.','숨 쉴 때마다 코가 아파요!','여기 사람들은 어떻게 사는 거예요?','은인님, 체온 괜찮으세요?'],
  fE:['숨이 막혀요... 몸이 눅눅해져요.','여기 연기 냄새 너무 나요!','증기가 자꾸 몸에 붙어요.','덥다... 아니 축축하다...'],
  fS:['저기 누가 우리 쪽으로 와요!','도망쳐요! 아, 늦었다.','여기 사람들은 왜 다 손을 잡고 끌고 가요?'],
  fix:['저기 누가 있어요. 말 걸어 볼까요?','저 사람, 우리 같이 갈 수 있을까요?','저기 혼자 있는 사람이요, 왠지 신경 쓰여요.'],
  idle:['은인님... 아, 바쁘시구나.','돌멩이를 세고 있어요. 다섯 개예요.','심심해요... 아니에요, 괜찮아요.','저 지금 말 걸어도 돼요? 걸었네요.','은인님, 자요? 아, 눈 뜨고 계시네.','저기 비둘기... 아니 기계 새다.']},
 smith:{
  start:['그거 소중한 거야? 아니면 내 거 써.','부술 거 많네. 좋아.','망치 데워졌다. 가자.','저놈 무기 좋아 보이네. 부숴도 되지?','물러서 있어. 파편 튄다.','실패하면 다시 두드리면 돼. 넌 실패하지 마.'],
  turn:['뭐 해. 휘둘러.','손이 놀잖아.','다음 거. 빨리.','생각하지 말고 쳐. 생각은 부서진 다음에.','그 카드 날 무뎌 보인다. 그래도 써.'],
  def:['막는 건 내 취향 아닌데.','방패도 결국 맞으면 깨져.','그거 누가 만든 거야? 이음새가 엉망이네.','막을 거면 단단히 막아.','쳇, 방어냐.'],
  eva:['피해? 맞고 고치면 되잖아. 아, 난 안 고치지.','잘 빠지네.','도망치는 건 망치질이 아니야.','움직임은 괜찮다.'],
  hit:['좋은 소리.','방금 그거, 손목 잘 썼다.','더 세게.','그래, 그렇게 내려치는 거야.','갈라졌다. 좋아.'],
  big:['하! 그게 망치질이지!','방금 거 내 작업장에서 해 볼래?','저거 다시 붙일 수도 없겠다.','좋아, 아주 좋아. 박살이다.','그 소리 오랜만이다.'],
  miss:['허공을 쳤네.','빗나간 망치는 손목만 상해.','다시. 실패는 다시 하라는 뜻이야.','하, 나도 그렇게 빗나간 적 많다.','눈 감고 휘둘렀냐?'],
  hurt:['맞았냐? 어디 부서졌어?','부서지면 말해. 새로 만들어 줄게. 사람은 못 만들지만.','이 자식이.','피 닦아. 손 미끄러진다.','아프면 소리 질러. 그게 낫다.'],
  low:['야. 아직 서 있냐.','그거 소중한 거야? 네 목숨 말이야.','물러나. 부서진 건 못 고쳐.','쓰러지지 마. 난 고치는 거 안 한다고.','...젠장, 버텨.'],
  block:['막았네. 방패가 버텼다.','쾅. 멀쩡하냐? 방패 말고 너.','좋은 막음이다.','저놈 손목 나갔겠다.'],
  dodge:['빠지네.','맞을 뻔했다.','운 좋은 줄 알아.','눈은 좋네.'],
  kill:['하나.','부서졌다.','다음 거.','잘 깨졌다.'],
  win:['끝. 무기는 멀쩡하냐?','부술 거 다 부쉈다.','실패 없이 끝났네. 재미없게.','다친 데 있으면 말해. 고치진 않지만.','좋아, 망치 식히자.'],
  follow:['부서지면 말해!','비켜!','내리친다!','두드린다!','이건 내 거다!'],
  out:['망치 좀 식히고 온다.','손목 나갔다. 잠깐.','젠장, 쉬었다 간다.','부서진 건 나였네.'],
  back:['다시 두드린다.','식었다. 간다.','손목 돌아왔다.','나 없어서 심심했냐.'],
  map:['길 좁네.','저 집 기둥 금 갔다. 부숴 주고 싶다.','어디 가. 빨리 가.','저기 대장간이다. 들르지 마. 내 거 써.','걷는 것도 망치질이랑 같아. 박자.'],
  shop:['그거 사지 마. 내 게 더 좋아.','이 가게 물건 이음새 다 엉망이야.','돈 아까워. 내 거 써.','저 망치 누가 만든 거야. 부숴 버리고 싶네.','구경만 해. 사는 건 나한테서.'],
  buy:['그걸 샀다고?','...뭐, 부서지면 가져와. 내 거 줄게.','남이 만든 걸. 흥.','돈 많네.'],
  leave:['잘했어. 아무것도 사지 마.','그래, 나가자.','내 거 써.'],
  event:['또 무슨 일이야.','부술 거면 불러.','말로 하는 건 네가 해.','시끄럽네.'],
  rest:['망치는 쉬어도 손은 안 쉰다.','불 좋다. 쇠 달구기 딱이네.','자. 나는 좀 두드릴게.','...가끔 꿈에 펜던트가 나와. 아무것도 아니야.'],
  bag:['잡동사니 많네.','저거 다 부숴도 돼?','이건 소중한 거야? 이건? 이건?','정리 좀 해. 망치 찾기 힘들다.'],
  give:['남이 만든 거네. …뭐, 써 보지.','이거 이음새 다시 해야겠다. 아, 고치는 건 안 하지.','받아 둔다. 부서지면 말할게.','내 게 더 좋은데.'],
  fN:['쇠가 얼어. 망치질 못 하겠다.','이 동네는 화로가 없냐.','손가락 감각 없다.','추운 데선 쇠가 쉽게 깨져. 사람도.'],
  fE:['아, 익숙한 냄새.','여긴 내 동네다.','증기 조심해. 데면 손가락부터 세.','망치 소리 들리지? 고향이다.'],
  fS:['저놈들 또 납치하냐.','예술가들은 부수는 맛을 몰라.','뭐 하는 놈들이야.'],
  fix:['저기 누가 있네. 말 걸든지.','저 사람 무기 좋아 보인다. 부숴도 돼?','동료 늘리게? 그래, 부서질 사람 많을수록 좋지.'],
  idle:['안 가?','망치 근질근질하다.','뭐 부술 거 없냐.','...','저기 저 문 경첩 삐걱거린다. 신경 쓰여.','빨리 가자.']},
 otto:{
  start:['어이, 신입. 뒤에 서.','...또 싸우나.','몸 굳기 전에 끝내라.','자네는 내 뒤다. 알겠나.','추운 데서 싸우는 법은 하나다. 빨리.','이번엔 아무도 안 얼어.'],
  turn:['서두르지 마라. 그렇다고 늦지도 말고.','손 녹았나.','다음.','숨 고르고.','...보고 있다.'],
  def:['그래, 막아라.','막는 건 잘하는군.','버텨라. 버티는 놈이 산다.','좋다.'],
  eva:['피하는 것도 기술이다.','발 미끄러지지 마라.','...잘 빠지는군.','그렇게 살아남는 거다.'],
  hit:['됐다.','좋다.','...나쁘지 않군.','한 번 더.','그렇지.'],
  big:['허, 신입치고는.','...잘했다.','저건 오래 남겠군.','힘 조절은 나중에 가르쳐 주지.'],
  miss:['빗나갔다.','괜찮다. 다시.','눈이 얼었나.','서두르니까 그렇다.'],
  hurt:['...또 이러는군.','어이, 신입.','피 멈추게 눌러라.','움직여라. 서 있으면 언다.','내 앞에 서지 말라고 했지.'],
  low:['...또 이러는군.','물러나라. 지금.','넷째도 그렇게 서 있다가 갔다.','쓰러지지 마라. 부탁이다.','어이. 대답해.'],
  block:['잘 막았다.','...그래.','버텼군.','좋다. 그렇게만 해라.'],
  dodge:['잘 피했다.','...휴.','다음엔 맞는다. 조심해.','좋은 발이다.'],
  kill:['하나 갔다.','...다음.','끝까지 봐라.','쓰러졌다.'],
  win:['끝났다. 불 쬐어라.','...살았군. 다행이다.','다친 데 보여 봐라. 아니, 됐다.','오늘도 아무도 안 얼었다.','가자. 해 지기 전에.'],
  follow:['뒤에 서라.','비켜.','...간다.','내가 하마.'],
  out:['…잠깐 몸 좀 녹이마.','다리가 굳었다. 잠깐.','늙은이는 쉬어야지.','먼저 가라. 따라가마.'],
  back:['아직 안 얼었다.','왔다.','...쉬었다.','괜찮다. 가자.'],
  map:['발밑 조심해라.','길이 미끄럽다.','...이쪽인가.','천천히 가도 된다. 얼지만 않으면.','나는 뒤에서 가마.'],
  shop:['필요한 것만 사라.','장갑은 있나.','...비싸군.','따뜻한 거 사라.'],
  buy:['...그래.','잘 샀다.','그거 오래 쓸 수 있겠군.'],
  leave:['그래, 가자.','돈은 아껴라.','...잘했다.'],
  event:['조심해라.','...무슨 일이지.','남의 일에 끼면 언다.','말은 자네가 해라.'],
  rest:['불 쬐어라. 얼기 전에.','자라. 내가 보고 있으마.','...녀석들도 이렇게 같이 앉곤 했지.','손 내밀어 봐라. 차군. 더 가까이 앉아.','내일도 걸어야 한다. 자라.'],
  bag:['정리 잘해라. 급할 때 못 찾는다.','장갑 어디 있나.','...잡동사니가 많군.'],
  give:['…받아 두마.','이건 자네가 써라. ...알았다, 받으마.','고맙다는 말은 안 한다.','...따뜻하군.'],
  fN:['고향이다.','손 비벼라. 계속.','여기선 멈추면 언다. 걸어라.','...녀석들이 여기서 얼었지.','숨은 코로 쉬어라.'],
  fE:['덥군.','증기 냄새는 싫다.','...얼지는 않겠군.'],
  fS:['저놈들 조심해라. 끌고 간다.','...예술은 모르겠다.','따라가지 마라.'],
  fix:['누가 있군.','...말 걸어 봐라.','혼자 두면 얼 놈 같은데.'],
  idle:['...','어이, 신입. 안 가나.','손 녹이고 있다.','...녀석들 이름을 세고 있었다.','가자.']},
 cadet:{
  start:['오늘은 뭔가 보일 것 같아요.','전투도 작품이에요! 아마도요.','선배들이 그러는데 첫 획이 중요하대요!','저 사람 구도가 좋아요. 아, 지금 그럴 때가 아니죠.','붓 준비됐어요!'],
  turn:['다음 획은 뭐예요?','이번엔 어느 파벌 방식으로 하실 거예요?','손이 근질근질해요!','보고 배울게요!','방금 거 스케치해 둘게요.'],
  def:['보존파 선배라면 박수 쳤을 거예요!','단단한 구도네요.','막는 것도 하나의 표현이에요!','정석이에요, 정석!'],
  eva:['방직파 같아요! 실 위를 걷는 것처럼!','우아해요!','휙, 선 하나가 지나갔어요!','저도 저렇게 움직이고 싶어요.'],
  hit:['좋은 선이에요!','획이 살아 있어요!','방금 거 그려도 돼요?','이게 해석이구나!','명중! 붓이 아니라 칼로요!'],
  big:['걸작이에요! 걸작!','곡해파 선배가 봤으면 울었을 거예요!','저 균열 모양 좀 보세요!','이건 전시해야 해요!'],
  miss:['괜찮아요, 습작이에요!','선이 빗나갔어요! 지울 수 있어요!','실패도 작품이래요. 선배가 그랬어요.','아깝다, 구도는 완벽했는데!'],
  hurt:['물감이... 아니 피예요!','괜찮으세요? 색이 안 좋아요!','저 사람 해석이 너무 거칠어요!','아파 보여요...!'],
  low:['안 돼요, 이 작품 아직 미완성이에요!','물러나세요! 지금 구도가 안 좋아요!','은... 아니 이방인님! 버티세요!','끝까지 그려야 해요, 제발요!'],
  block:['완벽한 방어예요!','보존파 정석!','막아냈어요!'],
  dodge:['피했다! 선이 흔들렸어요!','우아한 회피예요!','저도 저렇게 피하고 싶어요!'],
  kill:['한 작품 끝났어요!','다음 작품이요!','쓰러졌어요... 마무리 획이네요.'],
  win:['다 끝났어요! 이건 전시감이에요!','방금 전투, 그림으로 남겨도 돼요?','이방인님 덕분에 또 배웠어요!','제 방향이 조금 보인 것 같아요!'],
  follow:['제 차례예요!','습작이지만요!','에잇, 표현!','해석해 볼게요!'],
  out:['물감이… 다 떨어졌어요.','붓이 부러졌어요... 잠깐만요!','영감이 바닥났어요...'],
  back:['다시 그려 볼게요!','새 붓 챙겼어요!','영감 돌아왔어요!'],
  map:['저 건물 선이 예뻐요!','여기 풍경 스케치하고 싶어요.','어디 가요? 아카데미보다 재밌는 데요?','길도 하나의 선이래요.','저 그림자 좀 보세요!'],
  shop:['물감 파는 데는 없나요?','이 진열 구도 좋다...','저거 곡해파 작품 같은데요?','다 사고 싶어요!'],
  buy:['그거 보관함에 넣으실 거죠? 제 방향이 바뀔지도!','좋은 선택이에요!','어느 파벌 거예요?'],
  leave:['다음에 또 와요!','구경만 해도 영감 받았어요!'],
  event:['무슨 일이에요? 스케치감이에요?','아, 이거 선배들한테 들은 거예요!','재밌겠다!'],
  rest:['잠깐 스케치 좀 할게요.','불빛 색이 좋아요.','오늘 그린 거 보실래요? 아직 미완성이에요.','이방인님 자는 얼굴 그려도 돼요? 농담이에요.'],
  bag:['보관함을 보면 제 방향이 보여요!','곡해파 카드 많네요... 저 곡해파 가요?','방직파 실이다!','보존파 교재다!'],
  give:['와, 이걸로 뭘 그려 볼까요?','소중히 쓸게요!','이거 어느 파벌 거예요?','영감이 와요!'],
  fN:['물감이 얼어요!','손이 굳어서 선이 떨려요...','추운 색이네요, 여기.'],
  fE:['연기가 붓에 묻어요.','증기도 하나의 질감이에요!','습해서 종이가 울어요...'],
  fS:['고향이다! 아, 선배들 조심하세요. 끌고 가요.','저 납치하는 선배들 다 아는 사람이에요...','여기선 정중하게 거절하면 안 돼요!'],
  fix:['저 사람 그려 봐도 될까요?','누가 있어요! 동료 될까요?'],
  idle:['스케치 중이에요.','이방인님, 이 선 어때요?','아직 방향을 모르겠어요...','붓 씻고 있어요.','저기 저 구름, 아니 돔 무늬 좋다.']},
 nord:{
  start:['형제여, 칼을 들게나.','저들도 결국 재가 될 걸세.','자네 등 뒤는 내가 보겠네. 이 몸으로라도.','노른교 놈들이로군.','불이 붙기 전에 끝내세나.'],
  turn:['형제여, 다음은?','서두르지 말게나.','보고 있네.','자네 차례일세.'],
  def:['잘 막았네. 살아 있어야 태울 수도 있지 않겠나.','막는 것도 싸움일세.','단단하군.'],
  eva:['그렇지, 피하게나.','몸이 가볍군.','칼은 피하면 그만일세.'],
  hit:['멋진 공격이다!','그렇지!','타올라라!','좋네, 형제여!'],
  big:['감탄스러운 실력이군','자네는 우리 사람이야!','저건 재도 안 남겠군!'],
  miss:['허공을 베었군. 괜찮네, 나무는 도망가지 않으니.','다음엔 맞을 걸세.','서두르지 말게.'],
  hurt:['형제여 칼을 왜 피하지 않는겐가? 그렇다면 맞을것인데?','괜찮은가!','피가 나는군. 닦게나.'],
  low:['형제여, 뒤로 물러나는 것도 칼질일세.','쓰러지지 말게!','자네가 쓰러지면 누가 태우나.'],
  block:['잘 막았네. 살아 있어야 태울 수도 있지 않겠나.','단단하군!'],
  dodge:['형제여 잘했다 이번엔 멋지게 피했군','잘 피했네!'],
  kill:['하나 쓰러졌군.','재가 되어라.'],
  win:['형제여, 살아남았군.','오늘도 불빛이 붉군.','잘했네.'],
  map:['이쪽으로 가세나','이쪽이 더 빠를 거네','마땅한 선택이네','다리가 무겁군. 그래도 가세.'],
  shop:['양심껏 챙기게나.','필요한 것만 사게.','돈은 재가 되면 쓸모없네.'],
  event:['조심하게, 형제여.','무슨 일인가.'],
  rest:['오늘도 불빛이 붉군. 곧 전부 재가 될 걸세.','자게나, 형제여. 내가 보겠네.','이 불도 언젠가 꺼지겠지.'],
  bag:['짐이 많군.','필요 없는 건 태우게나.'],
  idle:['형제여, 가지 않는가?','...다리가 쑤시는군.','저 불빛 보이나.']}};
for(const k in PAL_TALK){const o=PAL_LINES[k]||(PAL_LINES[k]={});for(const s in PAL_TALK[k])o[s]=PAL_TALK[k][s]}

const PAL_NAME={nord:'부상당한 노르드교 단원',girl:'리테',smith:'제바르크',otto:'오토',cadet:'견습생'};
/* 2장 공방 동료 (11/6) — 스타인러 단조 · 크리뷔스 물질 · 아쉬부티 예술 · 크리밀라 자유(리테), 레미는 미정 */
const MATE={girl:{n:'리테',a:.6,d:.6,h:.5},
  smith:{n:'제바르크',a:.7,d:.5,h:.5,die:A(60,85),dn:'망치질',hit:'부서지면 말해!',start:'그거 소중한 거야? 아니면 내 거 써.',back:'다시 두드린다.',out:'망치 좀 식히고 온다.',kw:'steam'},
  otto:{n:'오토',a:.5,d:.8,h:.7,die:A(50,70),dn:'얼음 곡괭이',hit:'뒤에 서라.',start:'어이, 신입. 뒤에 서.',low:'…또 이러는군.',back:'아직 안 얼었다.',out:'…잠깐 몸 좀 녹이마.',kw:'cool'},
  cadet:{n:'견습생',a:.55,d:.55,h:.5,die:A(50,70),dn:'습작',hit:'제 차례예요!',start:'오늘은 뭔가 보일 것 같아요.',back:'다시 그려 볼게요!',out:'물감이… 다 떨어졌어요.'}};
const MATE_GIVE={girl:'저 주시는 거에요? 진짜요? 와.. 진짜 감사해요! 은인님!',smith:'남이 만든 거네. …뭐, 써 보지.',otto:'…받아 두마.',cadet:'와, 이걸로 뭘 그려 볼까요?'};
const MATE_SAY={girl:'주신 걸로 충분해요!',smith:'그거 소중한 거야? 아니면 내 거 써.',otto:'조수는 아니다. 따라가는 것뿐이야.',cadet:'보관함을 보면 제 방향이 보일 것 같아요.'};
const isMate=p=>!!(p&&MATE[p.k]);
const CARD_FAC={w_a1:'gok',w_a4:'gok',w_a6:'gok',w_a7:'gok',w_a13:'gok',w_a3:'pres',w_a9:'pres',w_a12:'pres',w_a5:'spin',w_a8:'spin',w_a10:'spin',w_a11:'spin',w_a14:'spin'};
const FAC_N={gok:'곡해파',pres:'보존파',spin:'방직파'},FAC_T={gok:['노비스','인터프리터','비저너리'],pres:['코디네이터','테크니션','컨서베이터'],spin:['스피너','위버','룸마스터']};
const mateN=p=>!p?'':p.k==='cadet'&&p.title?`견습생 · ${p.title}`:(PAL_NAME[p.k]||'');
/* 견습생 승급 파벌 — 카드 보관함에 보관 중인 아쉬부티 카드 중 어느 분파의 카드가 더 많은지 */
function cadetFac(){const n={gok:0,pres:0,spin:0};for(const c of S.run.store||[]){const f=CARD_FAC[c.id];if(f)n[f]++}let b=null;for(const k of['gok','pres','spin'])if(n[k]&&(!b||n[k]>n[b]))b=k;return b}
const hasMate=k=>{const r=S.run;return!!((r.pal&&r.pal.k===k)||(r.mates&&r.mates[k]))};
function mateJoin(k){const r=S.run,o={k,cards:[],gear:[],away:false,first:null,ind:0,hp:0};r.mates=r.mates||{};
  if(isMate(r.pal)){r.mates[k]=o;toast('동료',`${MATE[k].n} 합류 — 정비의 동료 탭에서 함께 갈 동료를 바꿀 수 있다`)}else{r.pal=o;toast('동료',`${MATE[k].n} 합류`)}
  const n=r.m2&&r.m2.nodes.find(x=>x.fix===k);if(n)n.fixDone=true;save()}
function mateSwap(k){const r=S.run;if(!r.mates||!r.mates[k]||!isMate(r.pal))return;r.mates[r.pal.k]=r.pal;r.pal=r.mates[k];delete r.mates[k];r.pal.away=false;save();toast('동료',`이제 ${mateN(r.pal)}와(과) 함께 간다`)}
function cadetWork(v,nm){const C=S.C,E=liveFoes().find(f=>f.key==='cadet');if(!E)return;E.work=Math.min(100,(E.work||0)+v);fxAt('enemy',`작품 제작 ${E.work}%`,'info');clog(`${nm}: 견습생의 작품 제작 +${v}% (현재 ${E.work}%)`,'h');
  if(E.work>=100){E.fled=true;E.spared=true;S.run.flags.cadetJoin=1;toast('작품 완성','견습생이 붓을 내려놓았다 — 처치하지 않고 끝남');if(!liveFoes().length)winCombat({});else{C.E=liveFoes()[0];renderCombat()}}else renderCombat()}
const palUp=()=>{const r=S.run;return!!(r&&isMate(r.pal)&&!r.pal.away&&S.C&&!S.C.over)};
function palStats(){const r=S.run,p=r.pal,Q=MATE[p.k]||MATE.girl,rb=p.k==='cadet'?.1*(p.rank||0):0;let atk=Math.round(r.atk*(Q.a+rb)),def=Math.round(r.def*Q.d),acc=r.acc,hp=Math.round(r.maxHp*Q.h);for(const k of p.gear||[]){const e=GEAR[k];if(!e||!e.fx)continue;atk+=e.fx.atk||0;def+=e.fx.def||0;acc+=e.fx.acc||0;hp+=e.fx.hp||0}return{atk,def,acc,maxHp:hp}}
function palStart(){const r=S.run,p=r.pal;if(!isMate(p))return;const back=p.away,Q=MATE[p.k];p.away=false;p.lowSaid=false;p.hp=palStats().maxHp;if(back)setTimeout(()=>palEv('back'),400)}
let palT=0,palHide=0;
function palRender(on){let b=$('#palbox');const r=S.run,show=on!==false&&r&&r.pal&&(S.screen==='combat'||S.screen==='map');
  if(!show){if(b)b.hidden=true;return}
  if(!b){b=document.createElement('div');b.id='palbox';b.innerHTML='<div class="pfig"></div><div class="pinfo"></div><div class="psay" hidden></div>';stage.appendChild(b)}
  const p=r.pal,gone=p.away||(p.k==='nord'&&r.flags.riftDone);b.hidden=false;b.className=(S.screen==='combat'?'fight':'')+(gone?' gone':'');b.querySelector('.pfig').innerHTML=faceHTML(p.k==='nord'?PAL_NAME.nord:mateN(p));
  const st=isMate(p)?palStats():null,pct=st?clamp(p.hp/st.maxHp*100,0,100):0;
  b.querySelector('.pinfo').innerHTML=`<b>${mateN(p)}</b>${st&&S.screen==='combat'?`<div class="pbar"><i style="width:${pct}%"></i><u></u><span>${Math.max(0,p.hp)} / ${st.maxHp}</span></div>`:''}${p.away?'<em>퇴각</em>':''}`;
  if(S.screen==='combat'){b.style.left='30px';b.style.top=(S.orient==='port'?112:76)+'px';b.style.bottom='auto'}else{b.style.left='28px';b.style.top='auto';b.style.bottom=(S.orient==='port'?108:104)+'px'}}
function palSay(t){const r=S.run;if(!r||!r.pal||!t)return;{const bx=$('#palbox');if(bx){bx.classList.remove('talk');void bx.offsetWidth;bx.classList.add('talk');clearTimeout(bx._tk);bx._tk=setTimeout(()=>bx.classList.remove('talk'),2600)}}{const bx=$('#palbox'),q=bx&&bx.querySelector('.psay');if(S.screen==='combat'&&q&&!bx.hidden){q.textContent=t;q.hidden=false;clearTimeout(q._t);q._t=setTimeout(()=>{q.hidden=true},Math.min(6000,2200+t.length*55));return}}sayShow(r.pal.k==='nord'?PAL_NAME.nord:mateN(r.pal),t)}
/* 말풍선 (V2.28, V2.29.49.13 수정) — 모든 화면 맨 앞, 조작을 막지 않음, 어디든 누르면 사라짐, 안 누르면 몇 초 뒤 사라짐 */
function sayShow(who,t){let L=$('#saylayer');if(!L){L=document.createElement('div');L.id='saylayer';L.hidden=true;stage.appendChild(L);
    /* V2.29.49.13: 말풍선은 조작을 막지 않음 — 어디를 누르든 말풍선이 닫히고, 누른 것은 그대로 눌림 */
    document.addEventListener('pointerdown',()=>{const l=$('#saylayer');if(l&&!l.hidden&&Date.now()-(l._t||0)>250)sayHide()},true)}
  L.innerHTML=`<div class="sb" role="button" tabindex="0"><i class="sbface">${faceHTML(who)}</i><div><b>${who}</b><span>${t}</span></div></div>`;L.hidden=false;L._t=Date.now();clearTimeout(palHide);palHide=setTimeout(sayHide,Math.min(6500,2400+t.length*55))}
function sayHide(){clearTimeout(palHide);const L=$('#saylayer');if(L)L.hidden=true}
function palEv(k){const r=S.run;if(!r||!r.pal)return;if(r.pal.away&&S.C&&!S.C.over&&k!=='back'&&k!=='out')return;const L=PAL_LINES[r.pal.k],v=L&&L[k];if(!v)return;palSay(Array.isArray(v)?pick(v):v)}
function bagTalk(){const n=Date.now();if(n-(S.bagT||0)>10000){S.bagT=n;palEv('bag')}}
function palBark(key,line,kw){const r=S.run;if(!r||!r.pal||r.pal.k!=='girl')return;r.flags.barks=r.flags.barks||{};if(r.flags.barks[key])return;r.flags.barks[key]=1;palSay(line,true);if(kw)setTimeout(()=>{document.querySelectorAll('.chip').forEach(c=>{if(c.textContent.includes(kw)){c.classList.add('pulse');setTimeout(()=>c.classList.remove('pulse'),2600)}});if(kw==='행동'){const i=$('#intent');i.classList.add('pulse');setTimeout(()=>i.classList.remove('pulse'),2600)}},60)}
function palWatch(){const C=S.C,r=S.run;if(!C||!r||!r.pal||C.over)return;if(isMate(r.pal)&&r.pal.k!=='girl')return;if(r.pal.k!=='girl')return;const E=C.E;
  if(C.pSteam)palBark('steam','숨이 막혀요... 몸이 눅눅해지는 것 같아요.','증기');if(C.heat)palBark('heat','뜨거워요! 뭔가 힘이 나는데요? 금방 식을 것 같아요.','열기');
  if(C.pCool)palBark('cool','차가워요... 몸이 잘 안 움직여요.','냉매');if(C.pFrozen)palBark('frozen','얼었어요! 움직일 수가 없어요!','냉동');if(C.pCrack)palBark('crack','언 부분을 맞았더니 엄청 아파요..!','깨짐');
  if(C.art)palBark('art','방금 그거, 왠지 멋있었어요. 왜인지는 모르겠어요.','예술적');if(C.hand.some(c=>c.id==='art_wip'))palBark('wip','뭔가 만들어지고 있어요.');if(typeof masterOn==='function'&&masterOn())palBark('done','다 됐어요! 잘은 모르겠는데 대단해요!','작품');
  if(C.food)palBark('food','뭔가 엄청난 맛! 맛있어요!','먹기');if(C.full)palBark('full','배불러요, 이제 열심히 해 볼게요!','배부름');if(C.sat)palBark('sat','뭔가 더 강하게 내려칠 수 있을 것 같아요! 하지만.. 이제 조금 속이 안 좋네요.','포화');
  if(E){const g=gimOf(E);if(g==='guard')palBark('g_guard','위험해 보여요!','행동');if(g==='read')palBark('g_read','저 사람, 어디를 칠지 보고 있어요!','행동');if(g==='stagger')palBark('g_stag','뭔가 더 아플 것 같아요!','행동');if(E.charged)palBark('charged','뭔가 큰 게 와요!','송출');if(E.intent==='빚 독촉')palBark('debt','돈이 없으면 더 아파요... 저는 알아요.','행동')}}
async function palHit(){const r=S.run,C=S.C,p=r.pal;if(!palUp())return;const E=C.E;if(!E||!alive(E))return;const Q=MATE[p.k]||MATE.girl;
  const atkC=(p.cards||[]).filter(c=>(CARDS[c.id].d||[]).some(x=>x.t==='atk'));if(!atkC.length&&!Q.die)return;
  const c=atkC.length?pick(atkC):null,die=c?CARDS[c.id].d.find(x=>x.t==='atk'):Q.die,cn=c?CARDS[c.id].name:Q.dn,st=palStats(),nm=mateN(p);
  /* 견습생 동료 기믹 — 졸업작품 생성 10% (성공하면 승급, 파벌은 카드 보관함 기준) · 실패하면 작품 던지기(명중률 -30%, 공격력 +50%) */
  let mul=1,accD=0;
  if(p.k==='cadet'&&(p.rank||0)<3){const f=rnd()<.1?cadetFac():null;
    if(f){p.rank=(p.rank||0)+1;p.fac=f;p.title=FAC_T[f][p.rank-1];toast('졸업작품',`견습생이 ${FAC_N[f]} ${p.title}(으)로 승급했다`);clog(`졸업작품 성공 — ${FAC_N[f]} ${p.title}`,'h');palSay('됐어요! 제 방향이 보여요!',true);palRender()}
    else{mul=1.5;accD=-30;palSay('작품 던질게요!',true)}}
  else palEv('follow');
  await wait(220);
  const v=rollDie(die)+gapP(st.atk,E.def),ch=Math.max(5,hitChance(st.acc,E.eva+E.evaB)+accD),hit=ri(1,100)<=ch;
  if(!hit){fxAt('enemy','빗나감','miss');clog(`${nm} · ${cn}${mul>1?' (작품 던지기)':''} → 빗나감`);return}
  const f=formula(v,0,st.atk,[],E.def),fin=Math.round(f.fin*mul),bl=Math.min(E.block,fin),loss=fin-bl;E.block-=bl;E.hp-=loss;E.dmgTurn=(E.dmgTurn||0)+loss;clog(`${nm} · ${cn}${mul>1?' (작품 던지기)':''} 주사위 ${v} → 피해 ${loss}`);fxAt('enemy',String(loss),'');sfx('hit');
  if(Q.kw&&E.hp>0)a2Hit(Q.kw,1,E);
  renderCombat();
  if(E.hp<=0&&!E.boss)E.dotKill=true;checkEnemy();await wait(160)}
async function palHurt(die){const C=S.C,E=C.E,r=S.run,p=r.pal,st=palStats();const v=eAdj(rollDie(die)),f=formula(v,0,E.atk,eTraits(),st.def),dmg=Math.round(f.fin*(E.dmgMul||1));await wait(240);p.hp-=dmg;clog(`${E.name}의 공격이 ${mateN(p)}에게 — 피해 ${dmg}`,'e');toast(mateN(p),`-${dmg}`);const box=$('#palbox');if(box){box.classList.remove('hit');void box.offsetWidth;box.classList.add('hit')}
  if(p.hp<=st.maxHp*.5){p.away=true;palEv('out')}renderCombat();await wait(200);return 0}
let palIdleT=0;
const PAL_SOLO=['길가의 가판대를 들여다보고 있다.','주워 온 나사를 닦고 있다.','받은 물건을 이리저리 돌려 보고 있다.','할 일을 찾아 두리번거린다.'];
const PAL_BORED=['은인님... 아, 바쁘시구나.','돌멩이를 세고 있다. 다섯 개다.','심심해요... 아니에요, 괜찮아요.'];
function palIdle(){clearTimeout(palIdleT);const r=S.run;if(!r||!r.pal)return;const scr=S.screen;let n=0;
  const tick=()=>{if(S.screen!==scr||!S.run||!S.run.pal)return;palEv('idle');if(++n<6)palIdleT=setTimeout(tick,15000)};palIdleT=setTimeout(tick,12000)}
function openPalTab(){const r=S.run,p=r.pal,m=$('#modal'),fight=S.screen==='combat'&&S.C&&!S.C.over;m.hidden=false;S.prepTab='pal';const st=palStats();
  const say=S.palLine||MATE_SAY[p.k]||'주신 걸로 충분해요!';const row=(c,attr,lb)=>`<div class="cardpick">${staticCard(c.id,false,c)}<button class="plate-btn" ${attr}="${c.uid}">${lb}</button></div>`;
  m.innerHTML=`<div class="panel" style="width:min(1300px,100%);height:100%"><div class="maphead">${prepTabs(r,'pal')}<button class="btn-ghost" id="mClose">닫기</button></div>
    <div class="psub">${mateN(p)}${p.k==='cadet'?` (${p.fac?FAC_N[p.fac]:'방향 없음'})`:''} · 공 ${st.atk} · 방 ${st.def} · 명중 ${st.acc} · 체력 ${st.maxHp}${p.first?` · 처음 받은 장비: ${GEAR[p.first]?GEAR[p.first].n:''}`:''} — "${say}"</div>
    <div style="overflow:auto;flex:1;min-height:0;display:block"><div class="ap-h">${MATE[p.k].n}에게 준 카드 ${p.cards.length}장</div><div class="cardgrid" style="overflow:visible;height:auto;max-height:none">${p.cards.map(c=>row(c,'data-pback','돌려받기')).join('')||'<div class="hint">아직 없음 · 공격 카드를 주면 함께 공격한다</div>'}</div>
    <div class="ap-h">카드 보관함</div><div class="cardgrid" style="overflow:visible;height:auto;max-height:none">${(r.store||[]).map(c=>row(c,'data-pgive','건네기')).join('')||'<div class="hint">비어 있음</div>'}</div>
    <div class="ap-h">${MATE[p.k].n}의 장비</div><div class="gb-g">${(p.gear||[]).map((k,i)=>`<button class="gb-c" data-pgb="${i}"><b>돌려받기</b><span>${GEAR[k].n}</span></button>`).join('')||'<div class="hint">없음</div>'}</div>
    <div class="ap-h">장비 보관함</div><div class="gb-g">${(r.bag||[]).map((k,i)=>GEAR[k]?`<button class="gb-c" data-pgg="${i}"><b>건네기</b><span>${GEAR[k].n}</span></button>`:'').join('')||'<div class="hint">비어 있음</div>'}</div>
    ${!fight&&r.mates&&Object.keys(r.mates).length?`<div class="ap-h">함께 갈 동료 바꾸기</div><div class="gb-g">${Object.keys(r.mates).map(k=>`<button class="gb-c" data-mswap="${k}"><b>함께 간다</b><span>${mateN(r.mates[k])}</span></button>`).join('')}</div>`:''}</div></div>`;
  bindPrepTabs(m);bindStatic(m);$('#mClose').onclick=()=>{S.palLine=null;S.prepTab='card';prepClose(fight)};
  m.querySelectorAll('[data-mswap]').forEach(b=>b.onclick=()=>{mateSwap(b.dataset.mswap);S.palLine=null;openPalTab()});
  m.querySelectorAll('[data-pgive]').forEach(b=>b.onclick=()=>{const c=r.store.find(x=>x.uid===+b.dataset.pgive);if(!c)return;r.store.splice(r.store.indexOf(c),1);p.cards.push(c);S.palLine=MATE_GIVE[p.k]||'';palEv('give');save();openPalTab()});
  m.querySelectorAll('[data-pback]').forEach(b=>b.onclick=()=>{const c=p.cards.find(x=>x.uid===+b.dataset.pback);if(!c)return;p.cards.splice(p.cards.indexOf(c),1);r.store.push(c);save();openPalTab()});
  m.querySelectorAll('[data-pgg]').forEach(b=>b.onclick=()=>{const i=+b.dataset.pgg,k=r.bag[i];r.bag.splice(i,1);p.gear.push(k);S.palLine=p.k!=='girl'?MATE_GIVE[p.k]:p.first?`주신 걸로 충분해요! ${GEAR[p.first].n}도 아직 잘 있어요.`:'주신 걸로 충분해요!';p.first=p.first||k;save();openPalTab()});
  m.querySelectorAll('[data-pgb]').forEach(b=>b.onclick=()=>{const i=+b.dataset.pgb,k=p.gear[i];p.gear.splice(i,1);r.bag.push(k);save();openPalTab()})}
/* ---- 전투 버튼: 세로 화면에서 체력창 바로 밑 ---- */
function dockFit(){requestAnimationFrame(()=>{const a=$('#dockL'),b=$('#dockR'),pp=$('#ppanel');if(!a||!b||!pp)return;const on=S.orient==='port'&&S.screen==='combat';for(const e of[a,b]){if(on){const o=stage.getBoundingClientRect(),sc=S.scale||1,t=(pp.getBoundingClientRect().bottom-o.top)/sc+8;e.style.top=t/UIZ+'px';e.style.bottom='auto'}else{e.style.top='';e.style.bottom=''}}})}
/* ---- 상태이상 설명 창 ---- */
const STATUS_INFO=[[/노르드교 조잡한 단검/,WEAPON.n_dagger.t],[/^표식/,'맞힐 때마다 단계 상승 · 단계 1당 받는 데미지 +10% · 한 턴 동안 맞지 않으면 소멸'],[/약점 노출/,'이번 턴 유지'],[/^힘/,'위력 +1 · 턴 종료 시 소멸'],[/흘려 베기/,'회피 시 반격'],[/^처단/,'피해 3번 시 처단 사용 가능'],[/방어도 감소/,'턴마다 얻는 방어도 감소'],[/방어도/,'피해를 먼저 대신 받음 · 다음 턴 시작 시 50%만 남음'],[/회피/,'높을수록 공격이 빗나감 · 회피 주사위는 한 턴 최대 +30'],[/^허약/,'공격 데미지 -10% · 최대 10 · 턴 종료 시 소멸'],[/약화/,'위력 -1 · 턴 종료 시 소멸'],[/취약/,'받는 데미지 +10% · 최대 10 · 턴 종료 시 소멸'],[/전격/,'쌓인 만큼 고정 피해'],[/소각/,'턴마다 불타는 피해 · 냉매로 중화'],[/증기/,'증기 1당 받는 피해 +10% · 턴 종료 시 10 이상이면 10 소모해 열기 1'],[/열기/,'열기 1당 공격 주사위 +1 · 턴마다 1 감소 · 증기 10으로만 획득'],[/냉동/,'1턴 행동 불가 · 얼어 있을 때 공격받으면 깨짐 2단계 상승'],[/냉매/,'냉매 1당 행동 포인트 +1, 코스트 -1 · 3 이상이면 냉동 · 소각 중화'],[/깨짐/,'1단계당 받는 피해 +50%'],[/먹기/,'먹기 1당 최대 체력 +5% · 10이면 배부름 · 배부름 3턴 지속 시 포화 누적'],[/예술적 감각/,'같은 카드 또는 다른 카드 3번 연속 사용 시 상승 · 1당 드로우 +1, 코스트 +1 · 3이면 작품 준비 카드 생성'],[/작품 준비/,'턴마다 5~20% 확률로 작품-완성 · 턴이 지나도 유지'],[/작품/,'패에 있으면 공격 위력 +200%, 드로우 +3, 코스트 +2'],[/송출 대기/,'다음 행동 위력 +50%'],[/버팀/,'방어도가 다음 턴에도 전부 유지'],[/마비/,'명중 -10'],[/궁니르-명중/,'쌓인 만큼 궁니르 공격 연속'],[/복수심/,'맞을수록 공격 강화'],[/유희/,'쌓인 만큼 피해 증가'],[/단련/,'방패 찍기의 고정 피해 증가'],[/반동/,'공격받으면 그만큼 반사'],[/명령-보호|은빛 기사/,'은빛 기사가 살아 있는 동안 순수유물주의자의 피해를 대신 받음 · 50%는 전부, 50%는 75%를 대신 받고 나머지만 보스가 받음 · 대신 받은 기사는 다음 턴 행동 불가 · 기사는 대상 지정 불가'],[/페이즈/,'보스의 현재 단계'],[/분노/,'특수무기 사용 시마다 상승 · 3이면 이성 상실']];
function statusRule(t){if(TRAITS[t])return TRAITS[t].text;for(const[re,x]of STATUS_INFO)if(re.test(t))return x;return''}
function stSheet(items,anchor){let b=$('#stsheet');if(!items){if(b)b.hidden=true;return}if(!b){b=document.createElement('div');b.id='stsheet';stage.appendChild(b);b.addEventListener('pointerdown',e=>e.stopPropagation())}
  b.innerHTML=items.map(([n,x])=>`<div><b>${n}</b><span>${x||'설명이 아직 없습니다.'}</span></div>`).join('');b.hidden=false;b.scrollTop=0;setTimeout(()=>tbEv('sheet'),0);
  const o=stage.getBoundingClientRect(),a=anchor.getBoundingClientRect(),sc=S.scale||1,w=440,h=Math.min(260,b.offsetHeight||260),W=o.width/sc,H=o.height/sc;let x=clamp((a.left-o.left)/sc+(a.width/sc)/2-w/2,12,W-w-12),y=(a.bottom-o.top)/sc+8;if(y+h>H-12)y=Math.max(60,(a.top-o.top)/sc-h-8);b.style.left=x+'px';b.style.top=y+'px';b.style.width=w+'px'}
stage.addEventListener('click',e=>{const kfg=e.target.closest('.knfig');if(kfg&&S.C){e.stopPropagation();stSheet([['명령-보호',statusRule('명령-보호')]],kfg);return}const sh=$('#stsheet');if(sh&&!sh.hidden&&!e.target.closest('#stsheet')){sh.hidden=true}
  const ch=e.target.closest('.chip');if(ch&&ch.closest('#echips,#ppanel,#foebar,#foefigs')){e.stopPropagation();const box=ch.parentElement,all=[...box.querySelectorAll('.chip')],sorted=[ch,...all.filter(x=>x!==ch)];stSheet(sorted.map(x=>[x.textContent.trim(),statusRule(x.textContent.trim())]),box);return}
  const it=e.target.closest('#intent');if(it&&S.C&&S.C.E&&ACT[S.C.E.intent]){e.stopPropagation();const E=S.C.E,g=gimOf(E),a=ACT[E.intent];stSheet([[E.intent,a.tag||(a.k==='atk'?'공격한다.':a.k==='def'?'방어도를 얻는다.':'효과를 발휘한다.')],...(g?[[GIM[g].n,GIM[g].t]]:[])],it)}},true);
/* 여관 — 2장 상점 막에 들어가면 25%로 여관. 5단화로 최대 체력 15% 회복, 쉴 때마다 8시간이 지나 주가가 움직임 */
const INN_COST=5000,INN_HEAL=.15,INN_HOURS=8;
/* ================= 자명종의 강제 · 기입관의 고정 · 노트 (V2.29.48.12) =================
   자명종(시간): 니다벨리르에 온 뒤 10시간마다 강제가 하나 걸림. 굳지 않은 강제는 다음 10시간에 사라지고 새 강제가 생김.
     중앙정부 문이 열린 뒤에는 사라지지 않고 10시간마다 하나씩 겹쳐 쌓임.
   기입관(행동): 행동 3회(이동 · 사건 · 상점 · 시간 보내기 · 선택지)마다 걸려 있는 강제 하나를 굳힘. 굳힐 강제가 없으면 버려짐.
   노트: 상점에 들어갈 때마다 관으로 내려와 갱신. 글만 있으면 강제, 도장이 찍혀 있으면 고정.
   중앙정부 문: 판마다 10~20막 사이에서 정해진 막 수를 지나고, 20시간을 넘겨야 열림. */
const JM_KIND=['noGo','mustGo','noBuy','noStock','gearLock','cardLock','noRefresh'];
const JM_MUST=new Set(['mustGo','gearLock','cardLock']);
const ORD_N=['첫째','둘째','셋째','넷째','다섯째','여섯째'];
function jmOn(){const r=S.run;return!!(r&&r.act===2&&r.m2&&r.m2.v===2)}
function jmS(){const r=S.run;if(!r.jm)r.jm={acts:0,list:[],need:ri(10,20),open:false,note:[],noteNew:false,seq:0};return r.jm}
const jmList=()=>jmOn()?jmS().list:[];
const jmHas=k=>jmList().some(x=>x.k===k);
function jmBlockedNode(id,extra){const n=m2Node(id);if(!n||n.kind==='center')return false;const L=extra?[...jmList(),extra]:jmList();
  return L.some(x=>x.k==='noGo'&&(x.node===id||(x.reg&&x.reg===n.reg)))}
/* 지금 자리에서 중앙정부(그리고 아직 안 간 내 공방)까지 갈 길이 남는지 */
function jmSafe(extra){const M=S.run.m2,seen=new Set([M.cur]),q=[M.cur];
  while(q.length){const a=q.pop();for(const b of M.nodes[a].adj){if(seen.has(b))continue;if(b!==0&&jmBlockedNode(b,extra))continue;seen.add(b);if(b!==0)q.push(b)}}
  if(!seen.has(0))return false;if(M.wsNeed!=null&&!M.wsDone&&!seen.has(M.wsNeed))return false;
  /* 고립 방지 (V2.29.50.14): 지금 선 자리에서 중앙정부가 아닌 막으로 나갈 길이 하나는 남아야 함 */
  if(!M.nodes[M.cur].adj.some(b=>b!==0&&!jmBlockedNode(b,extra)))return false;return true}
function jmDoor(){if(!jmOn())return;const r=S.run,J=jmS(),st=ensureStock(r);if(!J.open&&st.h>20){J.open=true;if(J.ticket)J.noteNew=true;toast('중앙정부','문이 열렸다');try{sfx('block',.5)}catch(e){}}}
function jmMoveDeny(from,id){if(!jmOn())return null;const M=S.run.m2,J=jmS();
  /* 고립 방지: 갈 수 있는 막이 하나도 없으면 강제는 이 걸음에 적용되지 않음 */
  {const cOpen=J.open&&!(M.wsNeed!=null&&!M.wsDone);if(!M.nodes[from].adj.some(j=>M.nodes[j].kind==='center'?cOpen:!jmBlockedNode(j)))return null}
  if(jmBlockedNode(id))return'이쪽으로 가실 수 없습니다';
  if(jmHas('mustGo')){const goal=(M.wsNeed!=null&&!M.wsDone)?M.wsNeed:0,D=m2Dist(goal);
    const ok=j=>!jmBlockedNode(j)&&!(M.nodes[j].kind==='center'&&(!J.open||(M.wsNeed!=null&&!M.wsDone)));
    const closer=M.nodes[from].adj.filter(j=>D[j]<D[from]&&ok(j));if(closer.length&&!closer.includes(id))return'이쪽으로 가셔야 합니다'}
  return null}
function jmNew(){const r=S.run,M=r.m2,J=jmS(),cur=M.nodes[M.cur],dup=(k,f)=>J.list.some(x=>x.k===k&&f(x));
  for(const k of shuffle(JM_KIND.slice())){
    if(k==='noGo'){
      if(rnd()<.4){const regs=shuffle('NESW'.split('')).filter(g=>g!==cur.reg&&!(M.wsNeed!=null&&!M.wsDone&&g===r.dir)&&!dup('noGo',x=>x.reg===g));
        for(const g of regs){const it={k,reg:g};if(jmSafe(it))return it}}
      const near=shuffle(cur.adj.slice()),far=shuffle(M.nodes.filter(n=>n.kind==='room'&&!cur.adj.includes(n.id)).map(n=>n.id));
      for(const id of[...near,...far]){const n=M.nodes[id];if(n.kind!=='room'||n.gate||id===M.cur||id===M.wsNeed||jmBlockedNode(id))continue;const it={k,node:id};if(jmSafe(it))return it}
      continue}
    if(k==='mustGo'){if(jmHas('mustGo'))continue;return{k}}
    if(k==='noBuy'){const c=shuffle([0,1,2,3,4].flatMap(i=>[{t:'card',i}])).find(o=>!dup('noBuy',x=>x.t===o.t&&x.i===o.i));if(c)return{k,...c};continue}
    if(k==='noStock'){const c=shuffle(Object.keys(STOCKS)).find(s=>!dup('noStock',x=>x.ws===s));if(c)return{k,ws:c};continue}
    if(k==='gearLock'){ensureGear(r);const c=shuffle(GSLOT_ORDER.slice()).find(s=>r.gear[s]&&r.gear[s][0]&&GEAR[r.gear[s][0]]&&!dup('gearLock',x=>x.s===s));if(c)return{k,s:c,g:r.gear[c][0]};continue}
    if(k==='cardLock'){const c=shuffle(r.deck.slice()).find(c=>!dup('cardLock',x=>x.uid===c.uid||x.cid===c.id));if(c)return{k,uid:c.uid,cid:c.id};continue}
    if(k==='noRefresh'){const c=shuffle([0,1,2,3,4]).find(i=>!dup('noRefresh',x=>x.i===i));if(c!=null)return{k,i:c};continue}
  }return null}
/* 자명종 — 10시간마다 */
function jmBell(){if(!jmOn()||S.run.m2.inside)return;const J=jmS();if(!J.open)J.list=J.list.filter(x=>x.fixed);
  const it=jmNew();if(it){it.id=++J.seq;it.fixed=false;J.list.push(it)}
  toast('자명종','어디선가 자명종이 울린다');try{sfx('block',.4)}catch(e){}}
function jmHour(){if(!jmOn())return;const st=ensureStock(S.run);if(st.h>0&&st.h%10===0)jmBell();jmDoor()}
/* 기입관 — 행동 3회마다 */
function jmAct(){if(!jmOn()||S.run.m2.inside)return;const J=jmS();J.acts=(J.acts||0)+1;if(J.acts<3)return;J.acts=0;
  const c=J.list.filter(x=>!x.fixed);if(c.length)pick(c).fixed=true}
const jmGearLocked=s=>jmList().some(x=>x.k==='gearLock'&&x.s===s);
const jmCardLocked=uid=>jmList().some(x=>x.k==='cardLock'&&x.uid===uid);
/* 겹친 카드는 한 장만 고정 — 같은 카드 중 고정되지 않은 장을 대신 내줌 */
function jmDeckPick(c){const r=S.run;if(!c||!jmCardLocked(c.uid))return c;const q=x=>x.id===c.id&&(x.mods||[]).join(',')===(c.mods||[]).join(',');return r.deck.find(x=>q(x)&&!jmCardLocked(x.uid))||null}
const jmNoBuy=(t,i)=>jmList().some(x=>x.k==='noBuy'&&x.t===t&&x.i===i);
const jmNoStock=ws=>jmList().some(x=>x.k==='noStock'&&x.ws===ws);
const jmKeepSlots=()=>jmList().filter(x=>x.k==='noRefresh').map(x=>x.i);
function jmLine(x){
  if(x.k==='noGo')return x.reg?`${DIR2[x.reg].n}쪽 구역에 들어가는 것`:`지도에 표시된 막에 들어가는 것`;
  if(x.k==='mustGo')return'가야 할 곳에 가까워지는 쪽으로만 걷는 것';
  if(x.k==='noBuy')return`상점 ${x.t==='card'?'카드':'장비'} 진열대 ${ORD_N[x.i]} 칸의 물건을 사는 것`;
  if(x.k==='noStock')return`${WS2[x.ws].n} 주식을 사고파는 것`;
  if(x.k==='gearLock')return`${GSLOT[x.s].n}의 「${GEAR[x.g]?GEAR[x.g].n:'장비'}」을(를) 그대로 끼고 있는 것`;
  if(x.k==='cardLock')return`「${CARDS[x.cid]?CARDS[x.cid].name:'카드'}」 한 장을 덱에 넣어 두는 것`;
  if(x.k==='noRefresh')return`상점 카드 진열대 ${ORD_N[x.i]} 칸을 새것으로 바꾸는 것`;return''}
/* 상점에 들어갈 때 — 주식 시세가 내려오는 관으로 노트가 내려옴 */
/* ================= 기입관이 잘못 보낸 메모 (V2.31.52.14) =================
   자명종이 뱉은 이방인의 기록 파편을 기입관이 받아 적고 분류하다 만 메모. 정식 기록만 내려보내야 하는데 실수로 섞여 내려옴.
   노트가 갱신될 때마다 8% · 문이 열릴 때까지 한 번도 안 왔으면 다음 갱신에 반드시 · 회수 없음.
   받은 시점의 경과 시간만큼만 분석이 적혀 있음(V2.31.53.14) · 같은 상태로는 다시 오지 않고 더 진행된 상태로 갱신됨 · 50시간이 지나면 확정 메모가 반드시 옴.
   파편 문장은 전부 사용자가 보낸 글에서 끊은 것. 종류: N 인명 · V 서술 · O 대상 · T 시점/수량 · C 이음말 · Q 인용 */
const MEMO_F={
g1a:['이전의 세계수는','O'],g1b:['거인들만이 살던 곳','O'],g2a:['서리가 흩날리는 곳에서 살았기에','V'],g2b:['서리거인이라 불리었다','V'],g3:['욕심과 소유욕이 강했다','V'],
g4a:['각자 자기만의 동굴','O'],g4b:['소중하게 여기는 것을 보관했다','V'],g5a:['유폐해 놓았던 괴수들이','O'],g5b:['잡아 죽이기 시작했다','V'],g6a:['뭉쳐 저항하고','V'],g6b:['토벌했다','V'],
g7a:['이미르','N'],g7b:['가장 앞에서 괴수들을 처리하던','V'],g7c:['거인들의 영웅','O'],g8a:['세계수는 괴수들로 인해 불타올랐고','V'],g8b:['잿더미로 변했다','V'],
g9a:['재 속에서','C'],g9b:['새로운 세계수를 찾아 들어 올렸고','V'],g9c:['그의 몸과 세계수의 재로','O'],g10a:['그 이름이 워그드라실','O'],g10b:['가장 꼭대기에서','C'],g10c:['신들이 하나둘 나타나기 시작했다','V'],
g11a:['새롭게 나타난 신들에 의해','C'],g11b:['단칸방처럼 놔두어진','V'],g11c:['요툰헤임에 갇혔다','V'],g12a:['결정을 존중했다','V'],g12b:['동시에 분노했다','V'],g12c:['배신자로 여기기까지 했다','V'],
g13a:['사라졌고','V'],g13b:['남은 것은 애병 레바테인뿐','O'],g14a:['온몸이 불로 뒤덮여','V'],g14b:['수많은 서리거인을 몰살한','V'],g14c:['거대 괴수의 척추를 단조해 만든 검','O'],
g15a:['잠들어 있는','V'],g15b:['깨울 방법을 찾는다','V'],g16a:['주인에게만 반응했다','V'],g16b:['신성한 하얀 불을 훔친다','V'],
g17a:['오딘이 세계수에서 떼어낸 사생아','O'],g17b:['로키','N'],g17c:['요툰헤임으로 향했고','V'],g17d:['끝끝내 그에게 검을 쥐여 준다','V'],g18a:['검을 잡고 들어 올리자','V'],g18b:['맥동이 들려온다','V'],
g19:['이미르와 같은 그것을 느꼈기 때문','V'],g20a:['거인 중 하나가','O'],g20b:['하얀 불을 던져 버린다','V'],g21a:['순식간에 타들어 가며','V'],g21b:['손과 손잡이가 달라붙어 하나가','V'],
g22:['깨어나길 기다렸다','V'],g23a:['맥동만 들리고','V'],g23b:['타 버린 시체','O'],g23c:['아무런 움직임조차','C'],g24a:['깨어날 레바테인을 놔두고','V'],g24b:['먼저 신들과의 전쟁을 시작한다','V'],
g25a:['서리거인들을 몰살했던 불의 괴수','O'],g25b:['레바테인을 통해 다시 나타났다','V'],g26a:['레바테인으로 만들어진 자','O'],g26b:['수르트라고 불렸다','V'],g27a:['실험체이자','O'],g27b:['적이며','O'],g27c:['동시에 그들의 왕','O'],
p1a:['다섯 살이 되던 해','T'],p1b:['부모는 돌아오지 않았다','V'],p2a:['스무 명이 넘어가는','T'],p2b:['위탁 가정에 맡겨졌다','V'],p3a:['똑같은 이유로','C'],p3b:['부모를 기다리는 아이들','O'],
p4:['계속해서 똑같은 꿈','O'],p5a:['꿈에서','C'],p5b:['하늘이 되었다','V'],p6a:['푸르디푸른','C'],p6b:['전에 겪어 본 적 없는','C'],p6c:['더없이 자유로운 감각','O'],
p7a:['일어나는 순간 없어졌고','V'],p7b:['그 감각을 느끼기 위해 달렸다','V'],p8a:['다른 아이들이 부모님에 대해 물을 때','C'],p8b:['그는 이 세상에 대해 물어봤다','V'],
p9a:['붉은 이유는','O'],p9b:['세계수에 불이 붙었기 때문','V'],p9c:['찾는 건 꼭대기에 있을 수도 있다','Q'],p10a:['그때부터','C'],p10b:['목적이 세계수 꼭대기에 가는 것','O'],
p11a:['힘든 것들은 모두','O'],p11b:['하늘 위를 가리키며','V'],p12a:['그 말을 믿었고','V'],p12b:['꼭대기가 목표가 되었다','V'],p13:['그곳은 어떤 모습일까','Q'],
p14a:['황금빛 초원','O'],p14b:['푸른 하늘이 있을 거라고','Q'],p15a:['이곳이든 그곳이든 모두 불타 버려서','V'],p15b:['부모님도 푸른 하늘도','O'],p15c:['전부 타 없어졌을 거라고','Q'],
p16a:['그럼에도','C'],p16b:['계속해서 먼저 들으러 오는','V'],p17a:['부모가 불길에 휩싸이는 모습을','O'],p17b:['눈앞에서 지켜보았다','V'],
p18a:['타오르는 불길에 뛰어들어','V'],p18b:['구하려 한 흔적','O'],p18c:['몸과 마음에 깊이','C'],p19a:['끼워 주지 않자','V'],p19b:['외톨이가 되었다','V'],p19c:['눈에 띄게 말이 없어졌다','V'],
p20a:['이야기를 시작할 때면','C'],p20b:['항상 먼저 앉아 들었다','V'],p21a:['열다섯 살이 되던 해','T'],p21b:['길을 잘못 들어','V'],p21c:['완전히 다른 길로','C'],
p22a:['엄청나게 커다란 광장','O'],p22b:['완전히 교단 밖','O'],p23:['먼저 벗어나기로 했다','V'],p24a:['뤼펀스','N'],p24b:['표냐','N'],p24c:['드류뱌','N'],p24d:['꿈에 대한 그림을 주었다','V'],
p25a:['놀림받을까 주지 않은','V'],p25b:['어릴 적 그린 그림','O'],p26a:['마지막 인사 때','T'],p26b:['이름을 밝혔다','V'],p26c:['마리에','N'],p26d:['다음에 꼭 만나자고','Q']};
/* 엮는 메모 — 기입관이 파편을 맞게 이은 것. lv 1 작은 정답 · 2 이방인을 파악함 · 3 대상은 하나 · 4 확정. x: 오래된 일이 낀 것은 30시간쯤에는 잘못 읽음 */
const MEMO_W=[
{k:['p1a','p1b'],l:['같은 건. 붙임','이방인 유년기 항목으로 기입'],lv:1},
{k:['p2a','p2b'],l:['수량은 가정의 인원','붙임. 이방인 거처 항목'],lv:1},
{k:['p3a','p3b'],l:['아이들. 이방인도 그중 하나','붙임'],lv:1},
{k:['p5a','p5b'],l:['꿈속의 일. 오기 아님','분류: 꿈'],lv:1},
{k:['p21a','p21b','p21c'],l:['열다섯. 길. 붙임','다섯 살 건의 뒤'],lv:1},
{k:['p22a','p22b'],l:['장소 둘은 같은 곳','광장이 곧 교단 밖'],lv:1},
{k:['p24a','p24b','p24c'],l:['인명 셋. 한 줄로 수신된 것으로 봄','이방인과 친하게 지낸 자들'],lv:1},
{k:['p26c','p26b'],l:['인명. 마지막에 밝힌 이름','붙임'],lv:1},
{k:['p25a','p25b'],l:['그림 건. 붙임','품목: 그림'],lv:1},
{k:['p9a','p9b'],l:['이유와 답. 붙임','붉은 것은 불 때문'],lv:1},
{k:['g2a','g2b'],l:['호칭의 유래. 붙임','이방인 건과 무관해 보임 → 같은 접수. 보관'],x:['호칭의 유래?','서리: 계절 이름으로 봄. 겨울에 난 자들'],lv:1},
{k:['g13a','g13b'],l:['사라진 자와 남은 물건','품목: 레바테인'],x:['사라진 자가 남긴 것','레바테인: 유족의 이름?'],lv:1},
{k:['g26a','g26b'],l:['호칭. 붙임','인명: 수르트'],x:['만든 물건에 붙인 상표?','품목: 수르트'],lv:1},
{k:['g10a','g10b','g10c'],l:['지명: 워그드라실','꼭대기에 신들. 붙임'],x:['워그드라실: 건물 이름으로 봄','꼭대기 층에 입주자들'],lv:1},
{k:['g17b','g17a'],l:['로키 = 사생아. 붙임','인명 대장에 올림'],x:['로키와 사생아. 별개의 두 사람','붙이지 않음'],lv:1},
{k:['g7a','g7c'],l:['이미르 = 거인들의 영웅. 붙임','인명 대장에 올림'],x:['이미르: 영웅을 따르던 자?','붙임 → ~~붙임~~ 보류'],lv:1},
{k:['p5b','p7b','p10b'],l:['꿈 → 달림 → 목적. 순서 맞음','이방인 이동 사유: 꿈','사유란에 "꿈"이라고 적어도 되는가. 적음'],lv:2},
{k:['p1a','p21a'],l:['다섯, 열다섯. 사이 십 년','위탁 가정 건은 전부 이 사이에 둠'],lv:2},
{k:['p15c','p17b','p18a'],l:['타 없어졌을 거라 말한 아이 = 불길을 본 아이','같은 아이. 이방인 아님'],lv:2},
{k:['p16b','p20b','p26c'],l:['먼저 들으러 오는 아이 = 이름을 밝힌 아이','마리에'],lv:2},
{k:['p14a','p14b','p24d'],l:['그림의 내용: 초원과 하늘','이방인이 그림. 세 명에게 줌'],lv:2},
{k:['g9b','g9c','g10a'],l:['들어 올린 자의 몸과 재가 재료','만들어진 것: 워그드라실'],x:['재료 목록과 이름','워그드라실: 재로 빚은 그릇?'],lv:2},
{k:['g16a','g19','g18b'],l:['검은 주인에게만 반응','주인은 이미르','로키에게서 같은 것 → 맥동'],x:['검이 사람을 가림','주인: 로키로 봄','이미르: 로키의 다른 이름?'],lv:2},
{k:['p10b','g10b'],l:['"꼭대기" 두 건','같은 나무의 꼭대기'],x:['"꼭대기" 두 건','다른 나무로 봄. 나무가 둘?'],lv:2},
{k:['g7a','g13a','p1a'],l:['접수 번호가 전부 이방인 건으로 나옴','자명종은 틀리지 않음','대상은 하나'],lv:3},
{k:['g7c','p2b'],l:['영웅과 위탁 아동이 한 접수','~~나눔~~','나눌 수 없음. 나누지 않음'],lv:3},
{k:['g7a','p1a','g13a'],l:['~~대상은 둘~~','~~오기~~','이미르가 이방인.','기입함'],lv:4}];
const MEMO_KEYS=Object.keys(MEMO_F),MEMO_IDS=[...MEMO_KEYS.map(k=>'f:'+k),...MEMO_W.map((w,i)=>'w:'+i)],MEMO_FINAL='w:'+MEMO_W.findIndex(w=>w.lv===4);
/* 접수 번호 — 받은 순서도 시간 순서도 아닌, 자명종이 뱉은 대로의 번호 */
const MEMO_NO=(()=>{const r=mulberry(4127),a=MEMO_KEYS.map((k,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}const o={};MEMO_KEYS.forEach((k,i)=>o[k]=String(31+a[i]*6+(i%5)).padStart(4,'0'));return o})();
/* 조각에서 기입관이 붙드는 낱말 */
const MEMO_KW={g1a:'세계수',g1b:'거인',g4a:'동굴',g5a:'괴수',g7c:'영웅',g9c:'재',g10a:'워그드라실',g13b:'레바테인',g14c:'검',g17a:'사생아',g20a:'거인',g23b:'시체',g25a:'괴수',g26a:'만들어진 자',g27a:'실험체',g27b:'적',g27c:'왕',
  p3b:'아이들',p4:'꿈',p6c:'감각',p9a:'붉은 것',p10b:'꼭대기',p11a:'힘든 것',p14a:'초원',p15b:'하늘',p17a:'불길',p18b:'흔적',p22a:'광장',p22b:'교단',p25b:'그림'};
/* 한 장씩 직접 쓴 조각 — [10시간, 20시간, 30시간, 40시간 이후] */
const MEMO_SPEC={
g5a:[['괴수? 신원미상-'],['괴수: 가축의 일종?','순서 미상'],['괴수: ~~가축~~ 가둬 두는 것','가둔 쪽 미수신','순서 미상'],['괴수: 가둬 두던 것이 풀려남','풀려난 뒤의 일은 다른 접수에 있음','순서: 앞쪽']],
g7a:[['이미르? 신원미상-'],['인명 추정','주민 대장에 없음'],['인명','이곳 사람 아님','~~이방인의 지인~~ 근거 없음'],['인명. 오래된 이름','같은 접수의 다른 조각에 다시 나옴','보류 → 보류 해제 못 함']],
g7c:[['영웅? 누구의-'],['호칭','거인: 키 큰 주민?'],['호칭','거인: ~~주민~~ 종족','누구를 가리키는지 미수신'],['호칭. 거인이라는 종족의 영웅','가리키는 자: 같은 접수 안에 있음','순서: 앞쪽']],
g13a:[['누가-'],['주어 미수신','사망? 실종?'],['주어 미수신','~~사망~~ 사라짐. 죽었다고는 안 함','뒤 조각 대기'],['사라진 자: 같은 접수 안의 인명','사망 기록 없음','사라진 뒤의 순서 미상']],
g9c:[['재? 무엇의-'],['재료 목록?','그: 누구'],['재료: 몸, 재','무엇을 만들었는지 미수신','그: ~~이방인~~ 아님'],['재료: 한 사람의 몸과 나무의 재','만든 것은 다른 접수에 있음','순서: 앞쪽']],
g10a:[['워그드라실? 신원미상-'],['이름','인명? 지명?'],['~~인명~~ 나무의 이름','이곳 나무와 같은 나무인지 미확인'],['지명: 워그드라실','이곳이 선 나무','"새로운"이라는 말이 붙어 옴. 이전 것이 있었나']],
g13b:[['레바테인? 신원미상-'],['품목','애병: 병의 일종?'],['품목: 무기','~~병~~ 애병 = 아끼는 무기','주인 미수신'],['품목: 무기 레바테인','주인은 사라진 자','지금 있는 곳 미상']],
g19:[['그것? 무엇-'],['비교','무엇이 같은지 미수신'],['두 사람에게서 같은 것이 느껴짐','느낀 쪽 미수신'],['느낀 쪽: 검','같은 것: 미수신. 적을 수 없음','보류']],
g22:[['누가-'],['주어 미수신','잠든 자?'],['기다린 쪽 여럿','깨어나는 쪽 하나','~~이방인의 부모~~ 아님'],['기다린 쪽: 거인들','깨어나는 쪽: 사람이 아님','순서: 앞쪽']],
g26b:[['수르트? 신원미상-'],['호칭','부른 쪽 미수신'],['인명: 수르트','~~주민~~ 아님','불린 자 미수신'],['인명: 수르트','부른 쪽: 거인들','이방인 건에 왜 섞였는지 미상. 보관']],
p1a:[['다섯 살. 누구-'],['시점','기준 연도 없음'],['시점: 이방인 다섯 살','이것만 순서 잡힘'],['시점: 이방인 다섯 살','유년기 항목 첫 줄','기입함']],
p1b:[['부모. 누구의-'],['실종?','신고 기록 없음'],['이방인의 부모','~~사망~~ 돌아오지 않음. 사유 미수신'],['이방인의 부모. 돌아오지 않음','다섯 살 건과 같은 해','가족 항목: 없음으로 기입']],
p2a:[['스무 명. 무엇의-'],['수량','무엇의?'],['수량: 사람','어디의 사람인지 미수신'],['수량: 위탁 가정의 인원','이방인 거처 항목에 덧붙임']],
p2b:[['맡겨짐. 누가-'],['거처 항목?','맡긴 쪽 미수신'],['이방인 거처 항목','맡긴 쪽: 교단으로 추정','다섯 살 건의 뒤'],['이방인 거처 항목으로 기입','맡긴 쪽: 교단','다섯 살과 열다섯 살 사이']],
p5b:[['하늘? 되었다-'],['분류: 직업?','하늘지기 같은 것인가'],['분류: ~~직업~~ → ~~사망?~~ → 미분류','사람이 하늘이 될 수는 없음. 오기로 처리할 것','~~오기로 처리~~ 자명종은 틀리지 않음'],['분류: 꿈','꿈속의 일로 기입','~~그런데 왜 꿈이 기록으로 나오는가~~']],
p10b:[['목적? 누구의-'],['이동 사유?','꼭대기: 어디'],['이방인 이동 목적','~~관광~~ 미분류'],['이방인 이동 목적: 세계수 꼭대기','이곳은 꼭대기가 아님. 경유지','기입함']],
p18b:[['흔적? 무엇의-'],['상처?','누구의'],['화상 흔적으로 추정','이방인의 것? 대조할 수 없음'],['화상 흔적','~~이방인~~ 다른 아이의 것','이방인 신체 항목에 적지 않음']],
p21a:[['열다섯 살. 누구-'],['시점','다섯 살 건과 같은 사람?'],['시점: 이방인 열다섯 살','다섯 살 건의 뒤'],['시점: 이방인 열다섯 살','위탁 가정을 나온 해','기입함']],
p23:[['누가-'],['주어 미수신','도주?'],['이방인','~~도주~~ 스스로 나옴','어디서: 미수신'],['이방인. 스스로 나옴','어디서: 아이들이 있는 곳','열다섯 살 건의 뒤. 기입함']],
p26c:[['마리에? 신원미상-'],['인명 추정','주민 대장에 없음'],['인명','이곳 사람 아님. 이방인이 온 곳의 사람','~~가족~~ 아님'],['인명: 마리에','이방인의 이야기를 듣던 아이','지인 항목으로 기입']]};
const memoStage=h=>h<10?0:h<20?1:h<30?2:h<40?3:4;
/* 분석의 진도 — st 0 받아 적기만 · 1 한 줄 쓰다 맒 · 2 추측과 물음표 · 3 분류 시도 · 4 그 조각에서 갈 수 있는 끝. 오래된 일(신화 쪽)은 끝까지 가도 덜 맞음 */
function memoLines(id,st){
  if(st<=0)return[];
  if(id[0]==='w'){const w=MEMO_W[+id.slice(2)];if(w.lv>=3)return w.l;if(st<=2)return['나란히 놓음','결론 없음-'];return st===3&&w.x?w.x:w.l}
  const k=id.slice(2),[tx,ty]=MEMO_F[k],myth=k[0]==='g',no=+MEMO_NO[k],kw=MEMO_KW[k];
  if(MEMO_SPEC[k])return MEMO_SPEC[k][st-1];
  if(st===1)return[ty==='N'?`${tx}? 신원미상-`:ty==='O'?`${kw||'무엇'}? 신원미상-`:ty==='T'?'언제의 누구-':ty==='C'?'앞뒤 없음-':ty==='Q'?'누가 한 말-':'누가-'];
  if(st===2)return ty==='N'?['인명 추정','대조할 명부 없음']:ty==='O'?[`${kw||'대상'}: 품목? 장소?`,'순서 미상']:ty==='T'?['시점 또는 수량','무엇의?']:ty==='C'?['이음말만 수신','앞 조각 대기']:ty==='Q'?['인용','화자 미상']:['주어 미수신','순서 미상'];
  const r=mulberry(no*7+3),pk=a=>a[Math.floor(r()*a.length)],nb=String(Math.max(31,no-(1+Math.floor(r()*9)))).padStart(4,'0');
  const T={N:[['인명 추정','대조할 명부 없음','보류'],['인명','이곳 사람 아님','보류'],['인명 추정','~~주민 대장 대조~~ 없음','보류']],
    V:[['주어 미수신','앞 조각 대기 → ~~대기~~','정렬 불가'],['누가?','~~이방인~~ 근거 없음','미분류'],['서술만 수신','주어 칸 비움','순서 미상'],['주어 미수신',`${nb}과 붙여 봄. 안 붙음`,'보류']],
    O:[['대상','무엇의?',`${nb}과 붙여 봄. 안 붙음`],['품목? 장소?','~~품목~~ → ~~장소~~ → 미분류'],['명사만 수신','서술 대기','보류'],['대상','누구의?','순서 미상']],
    T:[['시점','기준 연도 없음','이것만 순서 잡힘. 나머지 순서 미상'],['수량 또는 시점','무엇의?','단위 미수신']],
    C:[['이음말만 수신','앞뒤 없음','~~폐기~~ 자명종은 틀리지 않음. 보관'],['조각의 조각','앞 조각 대기','순서 미상'],['꾸밈말만 수신','꾸밀 것 미수신','보류']],
    Q:[['인용','화자 미상','보류'],['누가 한 말?','~~이방인~~ → 미상','순서 미상']]};
  let L=pk(T[ty]||T.V).slice();const d=r(),k2=3+Math.floor(r()*17);
  if(st>=4){if(myth)L=ty==='N'?[`인명: ${tx}`,'이곳 사람 아님. 오래된 이름','보류']:[L[0],'이방인 건과 무관해 보임 → 같은 접수. 보관','순서: 앞쪽?'];
    else L=ty==='N'?[`인명: ${tx}`,'이방인과 친하게 지낸 자','지인 항목으로 기입']:ty==='Q'?['인용','화자: 이방인 또는 곁의 아이','이방인 건으로 기입함']:[L[0].replace('주어 미수신','주어: 이방인 또는 곁의 아이').replace('누가?','이방인 또는 곁의 아이'),'다섯 살과 열다섯 살 사이로 봄','이방인 건으로 기입함']}
  /* 업무가 밀려 엉킨 흔적 */
  if(d<.12)L.push(`퇴근 전까지 ${k2}건`);else if(d<.2)L.unshift(`접수 ~~${nb}~~ ${MEMO_NO[k]}`);else if(d<.26)L.push('같은 조각 두 번 분류함. 하나 지움');else if(d<.31)L.push('점심 뒤 다시 볼 것 → ~~다시 봄~~');
  return L}
const memoStrike=s=>s.replace(/~~(.+?)~~/g,'<s>$1</s>');
function memoHTML(id,st=4,cls=''){const w=id[0]==='w'?MEMO_W[+id.slice(2)]:null,ks=w?w.k:[id.slice(2)],r=mulberry((+MEMO_NO[ks[0]])*13+(w?7:1)+st*31),L=memoLines(id,st);
  return`<div class="memo${w?' weave':''}${cls}" style="--mr:${(r()*3-1.5).toFixed(2)}deg"><div class="memo-no">접수 ${ks.map(k=>MEMO_NO[k]).join(' · ')}</div>
    <div class="memo-q${L.length?'':' bare'}">${ks.map(k=>MEMO_F[k][0]).join(' <i>/</i> ')}</div>${L.length?`<ul>${L.map(l=>`<li>${memoStrike(l)}</li>`).join('')}</ul>`:''}</div>`}
/* 겹친 메모 — 갱신된 것이 위에 덮이고 이전 것은 밑에 깔림. 누르면 펼쳐짐 */
function memoStack(e,open,attr){const s=e.s.slice().sort((a,b)=>b-a),n=s.length;
  return`<div class="mstack${n>1?' many u'+Math.min(3,n-1):''}${open?' open':''}" ${n>1?`${attr}="${e.i}" role="button" tabindex="0" aria-label="겹친 메모 ${n}장 — 누르면 ${open?'접힘':'펼쳐짐'}"`:''}>${(open?s:[s[0]]).map((st,j)=>memoHTML(e.i,st,j?' old':'')).join('')}${n>1&&!open?`<span class="mstack-n">${n}</span>`:''}</div>`}
const memoNoOf=id=>+MEMO_NO[id[0]==='w'?MEMO_W[+id.slice(2)].k[0]:id.slice(2)];
function memoStore(){let a=[];try{const v=localStorage.getItem('ashMemo2');if(v)a=JSON.parse(v);else{const o=JSON.parse(localStorage.getItem('ashMemo')||'[]');if(Array.isArray(o))a=o.map(i=>({i,s:[4]}))}}catch(e){}
  return Array.isArray(a)?a.filter(x=>x&&MEMO_IDS.includes(x.i)&&Array.isArray(x.s)&&x.s.length):[]}
let MEMO_MEM=null;/* 저장소를 쓸 수 없는 곳에서는 켜 둔 동안만 기억 */
function memoSeen(){return MEMO_MEM||(MEMO_MEM=memoStore())}
function memoAdd(id,st){const a=memoSeen();let e=a.find(x=>x.i===id);if(!e){e={i:id,s:[]};a.push(e)}if(!e.s.includes(st))e.s.push(st);try{localStorage.setItem('ashMemo2',JSON.stringify(a))}catch(x){}}
/* 노트가 갱신될 때 호출 — 조용히 섞여 옴(알림 없음). 같은 상태로는 다시 오지 않고, 더 진행된 상태로는 다시 올 수 있음(갱신) */
function memoRoll(){if(!jmOn())return false;const J=jmS(),h=ensureStock(S.run).h,st=memoStage(h);J.memos=(J.memos||[]).map(x=>typeof x==='string'?{i:x,s:[4]}:x);
  const seen=memoSeen(),top=id=>{const e=seen.find(x=>x.i===id);return e?Math.max(...e.s):-1},give=(id,s)=>{memoAdd(id,s);let e=J.memos.find(x=>x.i===id);if(!e){e={i:id,s:[]};J.memos.push(e)}if(!e.s.includes(s))e.s.push(s);return true};
  if(h>=50&&top(MEMO_FINAL)<0)return give(MEMO_FINAL,4);/* 50시간: 확정 메모는 반드시 */
  const due=J.open&&!J.memos.length;if(!(rnd()<.08||due))return false;
  const pool=MEMO_IDS.filter(id=>{if(id===MEMO_FINAL)return false;if(id[0]==='w'){const lv=MEMO_W[+id.slice(2)].lv;if(lv>=3)return st>=4&&top(id)<0;if(st<2)return false}return top(id)<st});
  if(!pool.length)return false;const id=pick(pool);return give(id,id[0]==='w'&&MEMO_W[+id.slice(2)].lv>=3?4:st)}
/* 메모 보관함 — 받은 만큼만 쌓임. 전체 장수는 보이지 않음 */
function openVault(back){const m=$('#modal');m.hidden=false;const seen=memoSeen();S.vaultSort=S.vaultSort||'got';
  const list=S.vaultSort==='no'?seen.slice().sort((a,b)=>memoNoOf(a.i)-memoNoOf(b.i)):seen.slice();
  m.innerHTML=`<div class="panel vault" style="width:min(980px,100%)"><div class="maphead"><div><div class="psub">${seen.length?`${seen.length}장`:'&nbsp;'}</div><div class="ptitle">보관함</div></div>
    <div style="display:flex;gap:10px">${seen.length>1?`<button class="btn-ghost" id="vSort">${S.vaultSort==='no'?'접수 번호 순서':'받은 순서'}</button>`:''}<button class="btn-ghost" id="mClose">닫기</button></div></div>
    ${seen.length?`<div class="vault-grid">${list.map(e=>memoStack(e,S.vaultOpen===e.i,'data-vm')).join('')}</div>`:'<div class="vault-empty">아직 모은 것이 없다...</div>'}</div>`;
  $('#mClose').onclick=()=>{S.vaultOpen=null;closeModal();if(back)back()};const vs=$('#vSort');if(vs)vs.onclick=()=>{S.vaultSort=S.vaultSort==='no'?'got':'no';openVault(back)};
  m.querySelectorAll('[data-vm]').forEach(el=>{const f=()=>{const sc=m.querySelector('.panel').scrollTop;S.vaultOpen=S.vaultOpen===el.dataset.vm?null:el.dataset.vm;openVault(back);m.querySelector('.panel').scrollTop=sc};el.onclick=f;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}}})}
function jmNoteSync(){if(!jmOn())return;const J=jmS(),a=JSON.stringify(J.note||[]),nw=J.list.map(x=>({...x}));J.note=nw;if(JSON.stringify(nw)!==a){J.noteNew=true;toast('노트','관에서 쪽지가 떨어졌다');renderTop()}
  if(memoRoll()){J.noteNew=true;renderTop()}}
const jmNoted=id=>{if(!jmOn())return 0;const n=m2Node(id);if(!n||n.kind==='center')return 0;let v=0;for(const x of jmS().note||[])if(x.k==='noGo'&&(x.node===id||(x.reg&&x.reg===n.reg)))v=Math.max(v,x.fixed?2:1);return v};
function openNote(){if(S.modalLock||S.busy)return;const r=S.run,J=jmS(),m=$('#modal');m.hidden=false;J.noteNew=false;
  const N=J.note||[],row=x=>`<li class="${x.fixed?'fx':''}"><span>${jmLine(x)}</span>${x.fixed?'<i class="jm-seal">기입</i>':''}</li>`;
  const must=N.filter(x=>JM_MUST.has(x.k)),not=N.filter(x=>!JM_MUST.has(x.k));
  m.innerHTML=`<div class="panel jm-note" style="width:min(680px,100%)"><div class="maphead"><div><div class="psub">상점에 들어갈 때마다 관으로 내려온다</div><div class="ptitle">노트</div></div><button class="btn-ghost" id="mClose">닫기</button></div>
    ${J.ticket?`<div class="jm-ticket"><div><b>이방인 접수</b><span>도착 20시간 이후</span></div>${J.open?'<i class="jm-seal">호출</i>':`<em>앞으로 ${Math.max(1,21-ensureStock(r).h)}시간</em>`}</div>`:''}
    <div class="jm-h">당신이 해야 하는 것</div><ul class="jm-l">${must.map(row).join('')||'<li class="none">—</li>'}</ul>
    <div class="jm-h">당신이 하면 안 되는 것</div><ul class="jm-l">${not.map(row).join('')||'<li class="none">—</li>'}</ul>
    ${(J.memos||[]).length?`<div class="memo-row">${J.memos.map(x=>typeof x==='string'?{i:x,s:[4]}:x).map(e=>memoStack(e,S.noteMemoOpen===e.i,'data-nm')).join('')}</div>`:''}</div>`;
  m.querySelectorAll('[data-nm]').forEach(el=>{el.onclick=()=>{S.noteMemoOpen=S.noteMemoOpen===el.dataset.nm?null:el.dataset.nm;openNote()}});
  $('#mClose').onclick=()=>{closeModal();renderTop()};save()}

/* ================= 기입관 보스전 (V2.29.48.12) =================
   한 턴에 같은 카드(이름 기준)를 2번째 쓰면 검게 변해 경고, 3번째 쓰면 그 사용은 효과도 피해도 없이 자물쇠로 묶임(2턴이 지나야 풀림).
   그 턴에 가장 많이 쓴 카드(같으면 마지막에 쓴 카드)는 다음 1턴 동안 약하게 잠김 — 굳지 않음.
   카드 3장을 쓸 때마다 도장: 자물쇠로 묶인 카드 중 전투 누적으로 가장 많이 쓴 카드(같으면 마지막에 쓴 카드)가 굳어 전투가 끝날 때까지 못 씀. 묶인 카드가 없으면 버려짐. */
function jcOn(){const C=S.C;return!!(C&&!C.over&&S.screen==='combat'&&C.foes&&liveFoes().some(f=>f.key==='clerk'))}
function jcS(){const C=S.C;return C.jc||(C.jc={use:{},tot:{},ord:{},seq:0,weak:{},lock:{},fix:{},n3:0})}
function jcDeny(c){if(!jcOn())return null;const J=jcS(),id=c.id,T=S.C.turn;
  if(J.fix[id])return'기입됨 — 이 전투에서는 쓸 수 없습니다';
  if(J.lock[id]>=T)return`자물쇠 — ${J.lock[id]-T+1}턴 뒤에 풀립니다`;
  if(J.weak[id]>=T)return'잠김 — 다음 턴에 풀립니다';return null}
function jcPlay(c){if(!jcOn())return false;const J=jcS(),id=c.id,T=S.C.turn;J.use[id]=(J.use[id]||0)+1;J.tot[id]=(J.tot[id]||0)+1;J.ord[id]=++J.seq;J.n3++;
  if(J.use[id]>=3){J.lock[id]=T+2;clog(`기입: 「${CARDS[id].name}」 — 한 턴에 3번째 사용, 효과 없음 · 자물쇠 (2턴)`,'e');fxAt('player','자물쇠','info');return true}
  if(J.use[id]===2)clog(`기입: 「${CARDS[id].name}」 — 한 턴에 2번째 사용, 한 번 더 쓰면 묶인다`,'e');return false}
function jcAfter(){if(!jcOn())return;const J=jcS(),T=S.C.turn;if(J.n3<3)return;J.n3=0;
  const ids=Object.keys(J.lock).filter(id=>J.lock[id]>=T&&!J.fix[id]);
  if(!ids.length){clog('기입: 도장을 찍을 카드가 없다','e');return}
  ids.sort((a,b)=>((J.tot[b]||0)-(J.tot[a]||0))||((J.ord[b]||0)-(J.ord[a]||0)));const id=ids[0];J.fix[id]=1;
  clog(`기입: 「${CARDS[id].name}」에 도장 — 이 전투가 끝날 때까지 쓸 수 없다`,'e');fxAt('enemy','기입','info');toast('기입',`「${CARDS[id].name}」`)}
function jcEndTurn(){const C=S.C;if(!C||!C.jc)return;const J=C.jc,ids=Object.keys(J.use).filter(id=>J.use[id]>0);
  if(ids.length&&jcOn()){ids.sort((a,b)=>(J.use[b]-J.use[a])||((J.ord[b]||0)-(J.ord[a]||0)));const id=ids[0];
    if(!(J.lock[id]>=C.turn)&&!J.fix[id]){J.weak[id]=C.turn+1;clog(`기입: 이번 턴에 가장 많이 쓴 「${CARDS[id].name}」 — 다음 턴 잠김`,'e')}}
  J.use={}}
function jcMark(c){if(!jcOn())return null;const J=jcS(),id=c.id,T=S.C.turn;
  if(J.fix[id])return{cls:'jc-lock',m:'<span class="mark jcfix">기입</span>'};
  if(J.lock[id]>=T)return{cls:'jc-lock',m:`<span class="mark jclock">자물쇠 ${J.lock[id]-T+1}</span>`};
  if(J.weak[id]>=T)return{cls:'jc-lock',m:'<span class="mark jclock">잠김</span>'};
  if((J.use[id]||0)>=2)return{cls:'jc-warn',m:'<span class="mark jcwarn">경고</span>'};return null}

/* ================= 공방 대련장 (V2.30.51.14) =================
   각 지역 끝의 공방 막. 언제든 그만둘 수 있고, 지면 체력 1로 나옴. 이기면 그 공방 카드 3장 중 1장과 실링.
   정예에게 도전 — 공방마다 한 번만 이길 수 있고, 이기면 그 공방의 값비싼 카드 중에서 고름. 적대로 이어지지 않고 경험치도 없음. */
const SPAR_FOE={stein:['mech'],kriv:['porter'],remi:['server'],ash:['weaver','keeper'],krim:['appr']};
const SPAR_ELITE={stein:'craftsman',kriv:'collab',ash:'docent',remi:'chef'};
function openSpar(){const r=S.run,M=r.m2,n=M.nodes[M.cur];if(!n||n.kind!=='ws'||S.busy)return;const ws=regWS(n.reg),W=WS2[ws],ek=SPAR_ELITE[ws];r.flags.sparWon=r.flags.sparWon||{};const done=!!r.flags.sparWon[ws];
  const go=elite=>{const key=elite?ek:pick(SPAR_FOE[ws]||['appr']);stockTick();r.at={kind:'combat',enemies:[makeEnemy(key)],node:n.id,spar:{ws,elite:!!elite},gokDone:true};save();transition(resumeAt)};
  S.screen='event';
  eventPanel(`${W.n} 대련장`,'언제든 그만둘 수 있다','공방 사람들이 몸을 푸는 자리다. 여기서는 누구도 죽지 않는다.',[
    {b:'대련한다',s:'이기면 이 공방의 카드 하나와 실링',f:()=>go(false)},
    ...(ek?[done?{b:`${ENEMY[ek].name}`,s:'이미 이겼다',f:()=>openSpar()}:{b:`${ENEMY[ek].name}에게 도전한다`,s:'이기면 이 공방의 값비싼 카드 하나와 큰 실링 · 한 번만 이길 수 있다',f:()=>go(true)}]:[]),
    {b:'나간다',s:'',f:()=>{r.at=null;save();showMap()}}])}
function sparLeave(){const C=S.C,r=S.run;if(!C||C.over)return;C.over=true;C.phase='over';S.busy=false;a2CombatEnd(C);hideCombatUI();r.at=null;r.next=null;save();toast('대련','그만두고 나왔다');showMap()}
function showInn(){const r=S.run;S.screen='shop';viewFor('shop');renderTop();hideCombatUI();const amt=Math.round(r.maxHp*INN_HEAL),off=r.gold<INN_COST||r.hp>=r.maxHp;
  const sc=openScreen('',{dim:true});sc.innerHTML=`<div class="panel evpanel" style="width:min(640px,100%)"><div><div class="psub">니다벨리르</div><div class="ptitle">여관</div></div><div class="ptext">상점인 줄 알았는데 침대가 놓여 있다. 주인이 값부터 부른다.</div>
    <div class="lines"><div><span>체력</span><b>${r.hp} / ${r.maxHp}</b></div><div><span>보유</span><b>${money(r.gold)}</b></div></div>
    <div class="choices"><button class="choice" id="iRest" ${off?'disabled':''}><b>쉰다</b><span>${money(INN_COST)} · 체력 +${amt} · ${INN_HOURS}시간이 지남${r.hp>=r.maxHp?' · 체력이 가득 찼다':r.gold<INN_COST?' · 돈이 모자란다':''}</span></button><button class="choice" id="iLeave"><b>떠난다</b></button></div></div>`;
  $('#iRest').onclick=()=>{if(r.gold<INN_COST||r.hp>=r.maxHp)return;r.gold-=INN_COST;r.hp=Math.min(r.maxHp,r.hp+amt);for(let i=0;i<INN_HOURS;i++)stockTick();jmAct();save();renderTop();showInn()};
  $('#iLeave').onclick=()=>{r.at=null;save();showMap()}}
/* 2장 승리 — 업데이트 대기 */
function showAct2Victory(gold,lines,loot){S.screen='victory';renderTop();const r=S.run,sc=openScreen('',{dim:true});lines=lines||[];clearSave();
  sc.innerHTML=`<div class="panel" style="align-items:center;text-align:center;max-width:720px"><div class="psub">2장 · 니다벨리르</div><div class="ptitle">기록하는 공무원을 쓰러뜨렸다</div>
    <div class="lines" style="min-width:min(420px,100%)">${gold?`<div><span>실링</span><b>+${money(gold)} · 보유 ${money(r.gold)}</b></div>`:''}${lines.map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}${loot?`<div><span>장비 탈취</span><b>${GEAR[loot].n}</b></div>`:''}<div><span>처치</span><b>${r.kills}</b></div><div><span>남은 체력</span><b>${r.hp} / ${r.maxHp}</b></div><div><span>레벨</span><b>${r.lvl}</b></div></div>
    <div class="hint">노트에 찍혀 있던 도장이 전부 떨어져 나갔다.</div><div class="hint">3장은 아직 준비 중입니다 (업데이트 대기).</div><button class="btn-main" id="goT">처음으로</button></div>`;
  $('#goT').onclick=()=>showTitle({menu:true});}
/* 니다벨리르 배경 (임시) — 철제 돔 */
function drawNida(g,t){const cv=g.canvas,W=cv.width,H=cv.height;const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#14171b');gr.addColorStop(.55,'#22262b');gr.addColorStop(1,'#0c0d0f');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.strokeStyle='#3a3f46';g.lineWidth=3;for(let i=0;i<9;i++){g.beginPath();g.ellipse(W/2,H*1.05,W*(.25+i*.09),H*(.75+i*.04),0,Math.PI,2*Math.PI);g.stroke()}
  g.strokeStyle='#2c3036';g.lineWidth=2;for(let i=-6;i<=6;i++){g.beginPath();g.moveTo(W/2,H*1.05-H*.95);g.lineTo(W/2+i*W*.12,H);g.stroke()}
  g.fillStyle='rgba(255,180,90,.06)';for(let i=0;i<14;i++){const x=(i*137+t*.01)%W,y=H*.7+Math.sin(t/900+i)*8;g.fillRect(x,y,3,60)}
  const v=g.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,H);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.7)');g.fillStyle=v;g.fillRect(0,0,W,H)}

