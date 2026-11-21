"use strict";
/* ================= run ================= */
/* 남는 재능 (V18): 특성을 고르고 남은 재능 1당 1레벨 기준 최대 체력 +5%, 공격레벨 +1, 방어레벨 +1 */
const talentBonus=h=>Math.max(0,heroTalentLeft(h));
function newRun(hero){
  const tb=talentBonus(hero),base1=hero.base1*hpMulOf(hero.traits)*(1+.05*tb),hp=hpAt(base1,1);
  const run={mode:'human',act:1,fate:hero.fate||'pick',diff:hero.diff||'easy',lvl:1,exp:0,base1,hp,maxHp:hp,atk:hero.atk+tb,def:hero.def+tb,talentBonus:tb,acc:hero.acc,eva:hero.eva,traits:hero.traits.slice(),talent:hero.talent,
    gold:TUNE.startGold,deck:[],map:null,pos:null,floor:0,flags:{kicked:false,events:[]},equip:[],dome:0,kills:0,turns:0,at:null,eatHp:0,tut:false,tutStep:0,weapon:'n_dagger',ults:[]};
  for(const[id,n]of(hero.deck||START_DECK))for(let i=0;i<n;i++)if(CARDS[id])run.deck.push({uid:UID++,id});
  ensureGear(run);run.map=newMap(run);
  return run;
}
/* 이전 버전 저장 이어하기 — 20막 지도 → 30막 세 갈래 지도, 장비 칸 추가 */
/* V2.31.54.14: 삭제된 카드(내던지기·쌓인 재·잿더미 방패·미련 없이)와 장비·소유 효과 물건을 저장 기록에서 걷어 냄 */
function purgeDeleted(r){if(!r)return r;const okc=c=>c&&CARDS[c.id],LG={"g_lhood":5,"g_lvest":8,"g_farmpants":4,"g_patrol":5,"g_ironhelm":15,"g_scale":10,"g_knightleg":8,"n_s3":80,"n_s6":80,"n_k2":200,"n_k3":80,"n_k6":80,"n_a3":80,"n_a6":80,"n_r2":200,"n_r3":80,"n_r6":80,"x_otg":40,"nd_helm":150,"nd_mail":300,"bm_pact":-40,"bm_mask":-25,"bm1_pact":-20,"bm1_mask":-12};
  for(const k of['deck','store'])if(Array.isArray(r[k]))r[k]=r[k].filter(okc);
  if(r.gear)for(const sl in r.gear)if(Array.isArray(r.gear[sl]))r.gear[sl]=r.gear[sl].map(k=>{if(k&&!GEAR[k]){const h=LG[k]||0;if(h){r.maxHp=Math.max(1,r.maxHp-h);r.hp=Math.max(1,Math.min(r.hp,r.maxHp))}return null}return k});
  if(Array.isArray(r.bag))r.bag=r.bag.filter(k=>GEAR[k]);if(Array.isArray(r.equip))r.equip=r.equip.filter(k=>EQUIP[k]);
  for(const p of[r.pal,...Object.values(r.mates||{})])if(p&&typeof p==='object'){if(Array.isArray(p.gear))p.gear=p.gear.filter(k=>GEAR[k]);if(Array.isArray(p.cards))p.cards=p.cards.filter(okc);if(p.first&&!GEAR[p.first])p.first=null}
  if(r.shop){if(Array.isArray(r.shop.gear))r.shop.gear=r.shop.gear.filter(it=>it&&(GEAR[it.k]||EQUIP[it.k]));if(Array.isArray(r.shop.cards))r.shop.cards=r.shop.cards.filter(it=>it&&CARDS[it.id])}
  if(r.m2&&Array.isArray(r.m2.nodes))for(const n of r.m2.nodes)if(n.shop){if(Array.isArray(n.shop.gear))n.shop.gear=n.shop.gear.filter(it=>it&&(GEAR[it.k]||EQUIP[it.k]));if(Array.isArray(n.shop.cards))n.shop.cards=n.shop.cards.filter(it=>it&&CARDS[it.id])}
  if(r.jm&&Array.isArray(r.jm.list))r.jm.list=r.jm.list.filter(x=>!(x.k==='noBuy'&&x.t==='gear')&&x.k!=='gearLock');
  return r}
function migrateRun(r){
  if(!r)return r;r.store=r.store||[];purgeDeleted(r);
  /* V2.32.61.14: 문서에서 빠진 특성(고지능·최상의 질병 5위·약화 부여 효과·장기기억증)은 저장 기록에서도 지움 */
  if(r.traits)r.traits=r.traits.filter(k=>PTRAIT[k]);ensureGear(r);if(r.mode==='human'&&!r.weapon)r.weapon='n_dagger';r.ults=r.ults||[];if(r.pal&&r.pal.k==='nord')r.pal=null;r.flags=r.flags||{events:[]};r.flags.events=r.flags.events||[];
  /* V2.29.48.12: 공방 동료(제바르크·오토·견습생) 롤백 — 건넨 카드·장비는 보관함으로, 리테만 남김 */
  {const OUT=['smith','otto','cadet'],back=p=>{if(!p)return;for(const c of p.cards||[])r.store.push(c);r.bag=r.bag||[];for(const g of p.gear||[])r.bag.push(g)};
    if(r.mates){for(const k of OUT)if(r.mates[k]){back(r.mates[k]);delete r.mates[k]}}
    if(r.pal&&OUT.includes(r.pal.k)){back(r.pal);r.pal=(r.mates&&r.mates.girl)||null;if(r.mates)delete r.mates.girl}}
  /* V36: 1장 30막 → 15막, 진행한 막은 절반으로 */
  if(r.map&&r.map.v===2&&r.map.path){const m=r.map,row=Math.min(ROWS-1,Math.ceil(m.row/2));m.path=m.path.slice(-row);m.path=row?m.path:[];m.row=row;m.opts=[];m.v=3;if(!r.act||r.act===1)r.floor=row;m.shops=Math.min(m.shops||0,SHOP_MAX);delete r.mapUndo}
  if(!r.map||r.map.g){const old=r.map&&r.map.g,path=[];
    if(old)for(let rr=0;rr<old.length;rr++){const n=old[rr].find(x=>x&&x.v);if(n)path.push({t:n.t,i:1,n:1})}
    const row=Math.min(path.length,BOSS_ROW-1);r.map={v:2,row,path:path.slice(0,row),opts:[],shops:path.filter(p=>p.t==='shop').length,bossDone:false};
    r.floor=row;r.map.opts=genOpts(r,row+1)}
  return r;
}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S.run))}catch(e){}}
function loadSave(){try{const s=localStorage.getItem(SAVE_KEY);return s?JSON.parse(s):null}catch(e){return null}}
function clearSave(){try{localStorage.removeItem(SAVE_KEY)}catch(e){}}
function syncUID(){let m=0;const scan=a=>a&&a.forEach(c=>{if(c.uid>m)m=c.uid});if(S.run)scan(S.run.deck);if(S.C){scan(S.C.draw);scan(S.C.hand);scan(S.C.disc);scan(S.C.exh)}UID=m+1}
/* 레벨 구간: 2~10 = 1, 11~20 = 2 … */
const zoneOf=lv=>Math.max(1,Math.ceil(lv/10));
/* 레벨로 얻는 공방렙: 레벨이 오를 때마다 0.4 ÷ 구간 (구간: 50레벨마다 +1), 소수점 누적 후 버림 */
const lvAB=L0=>{let s=0;for(let l=2;l<=L0;l++)s+=.4/Math.ceil((l-1)/50);return Math.floor(s+1e-9)};
const expNeed=L0=>Math.round(100*Math.pow(L0,1.5)*(1+.1*(zoneOf(L0+1)-1)));
/* 누적 LvHP% — 도달한 레벨마다 1.3% × 구간 */
function lvHpSum(L0){let s=0;for(let t=2;t<=L0;t++)s+=1.3*zoneOf(t);return s}
/* 레벨 L 체력 = 1레벨 체력 × (1 + 누적 LvHP% / 100) + 10 × (L − 1) */
const hpAt=(base1,L0)=>Math.round(base1*(1+lvHpSum(L0)/100)+10*(L0-1));
function gainExp(n,lines){
  const r=S.run;if((r.mode!=='human'&&r.mode!=='thor'&&r.mode!=='odin')||n<=0)return;
  if(TUNE.cb.expCap>0){const cap=Math.round(expNeed(r.lvl)*TUNE.cb.expCap);if(n>cap)n=cap}
  r.exp+=n;lines.push(['경험치',`+${n.toLocaleString()}`]);
  const l0=r.lvl;
  while(r.exp>=expNeed(r.lvl)){r.exp-=expNeed(r.lvl);r.lvl++}
  /* 체력은 전투가 끝나도 그대로 유지, 레벨업할 때 최대 체력의 5% 회복 (레벨마다) */
  if(r.lvl>l0){const k=r.lvl-l0,up=lvAB(r.lvl)-lvAB(l0);r.atk+=up;r.def+=up;const add=hpAt(r.base1,r.lvl)-hpAt(r.base1,l0);r.maxHp+=add;const h0=r.hp;r.hp=Math.min(r.maxHp,r.hp+k*Math.round(r.maxHp*(eq('u_diet')?.15:.05)));
    lines.push([`레벨 ${l0} → ${r.lvl}`,`공격레벨 +${up}, 방어레벨 +${up}, 최대 체력 +${add}, 체력 +${r.hp-h0} (${eq('u_diet')?15:5}% 회복${k>1?` ×${k}`:''})`])}
}
function cumExp(L0){let s=0;for(let k=1;k<L0;k++)s+=expNeed(k);return s}
/* 획득 경험치 = 상대 레벨까지의 누적 경험치의 66%, 주인공보다 레벨이 낮으면 33% */
function expFor(elv,plv){return Math.round(cumExp(elv)*(elv<plv?.33:.66))}
function addToDeck(id){if(!CARDS[id])return null;/* 삭제된 카드는 주지 않음 */const c={uid:UID++,id},r=S.run;r.store=r.store||[];r.store.push(c);return c}

/* ================= map ================= */
const NODE={rift:{n:'길을 막은 자들'},battle:{n:'전투'},elite:{n:'정예'},rest:{n:'휴식'},shop:{n:'상점'},event:{n:'사건'},boss:{n:'보스'}};
/* 노드 아이콘 (48×48 기준) */
const NODE_IC={
  battle:'<path d="M37 7h5v5L20.5 33.5l-5-5z"/><path class="st" d="M11 25.5l11.5 11.5M15.5 34.5L9 41"/><circle cx="7.5" cy="42.5" r="3"/>',
  elite:'<path fill-rule="evenodd" d="M24 6C14 6 8 12.5 8 21c0 5.2 2.3 8.6 5.5 10.6V39h4.2v-3.5h3.4V39h5.8v-3.5h3.4V39h4.2v-7.4C37.7 29.6 40 26.2 40 21 40 12.5 34 6 24 6zM12.6 21.5a5 5.5 0 1 0 10 0a5 5.5 0 1 0-10 0zM25.4 21.5a5 5.5 0 1 0 10 0a5 5.5 0 1 0-10 0zM24 26.5l-3 5h6z"/>',
  rest:'<path d="M24 5c1.5 6.5 10 10 10 19a10 10 0 0 1-20 0c0-4.5 2.6-7 4.2-10.2 1 3 2.2 4.6 3.6 5 .2-5-.6-9 2.2-13.8z"/><path class="st" d="M9 41l30-7M9 34l30 7"/>',
  shop:'<path d="M6 13h36l3 9H3z"/><path d="M3 22a5.25 4.5 0 0 0 10.5 0a5.25 4.5 0 0 0 10.5 0a5.25 4.5 0 0 0 10.5 0a5.25 4.5 0 0 0 10.5 0z"/><path class="st" d="M9 27v15M39 27v15M6 42h36"/><path d="M14 32h20v4H14z"/><path class="st" d="M24 6v7" style="stroke-width:3"/>',
};
function nodeIcon(t,x,y,s){if(t==='rift')t='elite';
  if(t==='event')return`<text class="q" x="${x}" y="${y+2}">?</text>`;
  if(t==='boss')return`<g class="ic" transform="translate(${x-24*s} ${y-24*s}) scale(${s})"><path d="M8 36l-3-20 10 8 9-14 9 14 10-8-3 20z"/><path d="M8 40h32v4H8z"/></g>`;
  return`<g class="ic" transform="translate(${x-24*s} ${y-24*s}) scale(${s})">${NODE_IC[t]}</g>`;
}
/* 지도 (웹게임 문서: 런 진행 · 지도)
   전투·휴식·사건·상점은 하나로 묶고 갈래로 나뉨 · 갈래는 항상 3개, 고른 갈래만 남고 다시 3개로 나뉨
   정예는 모든 갈래가 하나로 이어지는 5막째·10막째, 15막째는 보스 · 정예와 보스 바로 앞 막에는 휴식 갈래가 꼭 하나 이상 · 상점 막은 15막 중 최대 3번
   다인모드에서는 모든 막이 전투 또는 정예 */
const ROWS=15,ELITE_ROWS=[5,10],BOSS_ROW=15,SHOP_MAX=3;
function genOpts(r,row){
  if(row>BOSS_ROW)return[];
  if(row===BOSS_ROW)return['boss'];
  if(ELITE_ROWS.includes(row))return['elite'];
  if(r.mode==='human'&&(!r.act||r.act===1)&&row===11)return['rift'];
  if(r.mode==='dain')return[0,1,2].map(()=>rnd()<.25?'elite':'battle');
  if(row===1)return['battle','battle','battle'];
  /* 튜토리얼: 휴식과 상점에 한 번씩 꼭 들름 (건너뛰면 일반 지도) */
  const out=[],shops=(r.map&&r.map.shops)||0;
  for(let i=0;i<3;i++){const w={battle:60};
    if(row>=4&&!out.includes('rest'))w.rest=12;
    if(row>=3&&shops<SHOP_MAX&&!out.includes('shop'))w.shop=10;
    out.push(wpick(w))}
  if((row===BOSS_ROW-1||ELITE_ROWS.includes(row+1))&&!out.includes('rest'))out[ri(0,2)]='rest';
  return out;
}
function newMap(r){const m={v:3,row:0,path:[],opts:[],shops:0,bossDone:false};r.map=m;m.opts=genOpts(r,1);return m}
function showMap(){if(S.run&&S.run.act===2)return showA1End();
  if(S.run&&storyMap())return;
  S.screen='map';viewFor('map');hideCombatUI();closeModal();if(S.run.at)S.run.at=null;renderTop();save();setTimeout(tutShow,0);
  const r=S.run,M=r.map;if(!M.opts||(!M.opts.length&&M.row<BOSS_ROW))M.opts=genOpts(r,M.row+1);
  const VW=640,rowH=86,top=130,VH=top+ROWS*rowH+20;
  const Y=row=>VH-50-(row-1)*rowH,X=(i,n)=>n===1?VW/2:[170,320,470][i];
  let edges='',nodes='',rowlbl='';
  for(let row=1;row<=ROWS;row++){if(row===1||row%5===0)rowlbl+=`<text class="mrow" x="14" y="${Y(row)+4}">${row}</text>`}
  /* 걸어온 길 */
  M.path.forEach((p,k)=>{const x=X(p.i,p.n),y=Y(k+1);
    if(k>0){const q=M.path[k-1];edges+=`<path class="medge walked" d="M${X(q.i,q.n)} ${Y(k)} L${x} ${y}"/>`}});
  const cur=M.path.length?M.path[M.path.length-1]:null,cx=cur?X(cur.i,cur.n):VW/2,cy=cur?Y(M.row):VH-6;
  const nr=M.row+1,opts=M.row<BOSS_ROW?M.opts:[];
  opts.forEach((t,i)=>{edges+=`<path class="medge" d="M${cx} ${cy} L${X(i,opts.length)} ${Y(nr)}"/>`});
  /* 앞으로 정해진 막 (정예 · 보스) */
  for(const row of[...ELITE_ROWS,BOSS_ROW]){if(row<=nr)continue;const big=row===BOSS_ROW;
    nodes+=`<g class="mnode t-${big?'boss':'elite'} ahead"><circle class="ring" cx="${VW/2}" cy="${Y(row)}" r="${big?40:28}"/>${nodeIcon(big?'boss':'elite',VW/2,Y(row),big?1.05:.74)}</g>`}
  M.path.forEach((p,k)=>{const x=X(p.i,p.n),y=Y(k+1),isCur=k===M.path.length-1;const big=p.t==='boss';
    nodes+=`<g class="mnode t-${p.t} visited${isCur?' cur':''}"><circle class="ring" cx="${x}" cy="${y}" r="${big?40:30}"/>${nodeIcon(p.t,x,y,big?1.05:.82)}</g>`});
  opts.forEach((t,i)=>{const x=X(i,opts.length),y=Y(nr),big=t==='boss';
    nodes+=`<g class="mnode t-${t} avail" data-i="${i}" tabindex="0" role="button" aria-label="${NODE[t].n} (${nr}막)"><circle class="pulse" cx="${x}" cy="${y}" r="${big?40:30}"/><circle class="ring" cx="${x}" cy="${y}" r="${big?40:30}"/>${nodeIcon(t,x,y,big?1.05:.82)}</g>`});
  const bossLbl=`<text class="mrow" x="${VW/2}" y="${Y(BOSS_ROW)-58}" text-anchor="middle">순수유물주의자 (주교)</text>`;
  const sc=openScreen('');
  sc.innerHTML=`<div class="panel mappanel">
    <div class="maphead"><div><div class="ptitle">세계수 등반 · 미드가르드</div><div class="psub">${r.floor} / ${ROWS}막 · ${r.mode==='dain'?'다인모드 — 모든 막이 전투 또는 정예':`상점 ${M.shops} / ${SHOP_MAX}`} — 세 갈래 중 하나를 골라 위로 오른다</div></div>
    <div class="legend">${['battle','elite','rest','shop','event'].map(k=>`<span class="lg-${k}"><svg viewBox="0 0 48 48" aria-hidden="true">${k==='event'?'<text x="24" y="26">?</text>':NODE_IC[k]}</svg>${NODE[k].n}</span>`).join('')}</div></div>
    <div class="mapscroll" id="mapscroll"><svg viewBox="0 0 ${VW} ${VH}">${rowlbl}${edges}${nodes}${bossLbl}</svg></div></div>`;
  const ms=$('#mapscroll');
  requestAnimationFrame(()=>{const svgH=ms.scrollHeight;const yy=Y(Math.max(1,nr))/VH*svgH;ms.scrollTop=yy-ms.clientHeight*.55});
  sc.querySelectorAll('.mnode.avail').forEach(el=>{
    const go=()=>enterNode(+el.dataset.i);
    el.addEventListener('click',go);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
  });
}
/* 막에 들어설 때마다 자동 저장 — 전투는 시작 시점, 이벤트는 고르기 전으로 돌아감 */
function enterNode(i){
  const r=S.run,M=r.map,t=M.opts[i];if(!t||tutLocked('node'))return;
  tutEvent('node');
  if(r.pal&&t!=='rift'&&t!=='boss')palEv('map');
  stockTick();const row=M.row+1;M._prevOpts=M.opts.slice();M.path.push({t,i,n:M.opts.length});M.row=row;r.floor=row;if(t==='shop')M.shops++;
  M.opts=genOpts(r,row+1);
  let at;
  if(t==='battle'){r.mapUndo={row:row-1,opts:M._prevOpts,shops:M.shops,floor:row-1};at={kind:'combat',enemy:makeEnemy(r.pal&&r.pal.k==='nord'?'priest':row<5?pick(['priest','priest','cultist']):pick(['priest','cultist','cultist']))}}
  else if(t==='rift'){const e=makeEnemy('nordJudge');e.rift=true;at={kind:'combat',enemy:e}}
  else if(t==='elite')at={kind:'combat',enemy:makeEnemy('inquisitor')};
  else if(t==='boss')at={kind:'combat',enemy:makeEnemy('bishop')};
  else if(t==='rest')at={kind:'rest'};
  else if(t==='shop'){r.shop=null;at=r.tut?{kind:'shop'}:{kind:'shopAsk'}}
  /* 특수무기 사건은 1%, 나머지 일반 사건 99% */
  else at={kind:'event',ev:pickEvent()};
  r.at=at;if(at.kind==='shop')genShop();
  save();transition(resumeAt);
}
/* 곡해파 첫 만남 (V28) — 전투에 들어가기 전 그림과 선택지만. 반응은 각 50% */
const GOK_FIRST={q:'신화 원전은 잔혹한가? 신성한가? 어떤 게 정론인가?',
  c:[{b:'잔혹하다',no:'아닌데? 난 그렇게 생각 안 하는데?',yes:'그렇군, 참고하겠다.'},
     {b:'신성하다',no:'아닌데? 난 그렇게 생각 안 하는데?',yes:'그렇군, 참고하겠다.'},
     {b:'신화엔 정론이란 없다',no:'아닌데? 정론이 있어야 추론이 가능한데?',yes:'자네, 곡해파에 들어오지 않겠나?',offer:true}]};
function gokFirst(at){const r=S.run;r.flags.gokMet=true;at.gokDone=true;save();
  const E=at.enemies.find(f=>f.key==='interp'),m=$('#modal');m.hidden=false;S.modalLock=true;
  const shell=(body)=>`<div class="panel viewask gokask"><div class="gokfig">${a2SVG('w_ash')}</div><div class="ptitle">${E.name}</div>${body}</div>`;
  const pass=()=>{closeModal();at.enemies=at.enemies.filter(f=>f!==E);
    if(at.enemies.length){save();return startCombat(JSON.parse(JSON.stringify(at.enemies)))}
    if(r.act===2&&at.node!=null&&r.m2){const n=r.m2.nodes[at.node];if(n)n.cleared=true}
    r.at=null;save();showMap()};
  const fight=()=>{closeModal();save();startCombat(JSON.parse(JSON.stringify(at.enemies)))};
  m.innerHTML=shell(`<p class="vq">「${GOK_FIRST.q}」</p><div class="vopts">${GOK_FIRST.c.map((o,i)=>`<button class="plate-btn vopt" data-gok="${i}">${o.b}</button>`).join('')}</div>`);
  m.querySelectorAll('[data-gok]').forEach(b=>b.onclick=()=>{const o=GOK_FIRST.c[+b.dataset.gok],ok=rnd()<.5;
    if(!ok){m.innerHTML=shell(`<p class="vq">「${o.no}」</p><div class="vopts"><button class="plate-btn vopt" data-go="1">전투한다</button></div>`);m.querySelector('[data-go]').onclick=fight;return}
    if(!o.offer){m.innerHTML=shell(`<p class="vq">「${o.yes}」</p><div class="vopts"><button class="plate-btn vopt" data-go="1">지나간다</button></div>`);m.querySelector('[data-go]').onclick=pass;return}
    /* 입단 제의 — 수락 · 거절의 효과는 정해지면 넣음 (지금은 둘 다 전투 없이 지나감) */
    m.innerHTML=shell(`<p class="vq">「${o.yes}」</p><div class="vopts"><button class="plate-btn vopt" data-join="1">수락한다</button><button class="plate-btn vopt" data-join="0">거절한다</button></div>`);
    m.querySelectorAll('[data-join]').forEach(x=>x.onclick=()=>{if(x.dataset.join==='1'){r.flags.gokJoin=true;toast('곡해파','곡해파에 입단했다')}else toast('곡해파','입단을 거절했다');pass()})})}
/* 2장은 업데이트 대기 (V2.32.58.14) — 1장 보스를 쓰러뜨리면 여기서 끝 */
const A2_KINDS=['fall','land','dir','a2first','a2rain','shop2','contract','inn','a1end'];
function showA1End(){const r=S.run;if(r){r.at={kind:'a1end'};save()}S.screen='a1end';try{hideCombatUI()}catch(e){}renderTop();
  const sc=openScreen('',{full:true});sc.innerHTML=`<div class="panel" style="align-items:center;text-align:center;max-width:720px;margin:auto"><div class="psub">1장 · 미드가르드</div><div class="ptitle">순수유물주의자를 넘어섰다</div>
    <p style="opacity:.85;line-height:1.7">2장은 다음 업데이트를 기다려 주세요.</p>
    <div class="choices" style="width:100%">${r&&r.map&&r.mode==='human'?'<button class="choice" id="a1Stage"><b>막 골라 이어하기</b><span>1장의 원하는 막으로 돌아가 다시 오른다 · 덱·체력·카드는 지금 그대로</span></button>':''}<button class="choice" id="a1Title"><b>타이틀로</b><span>저장 기록은 이 자리에 남는다</span></button></div></div>`;
  if($('#a1Stage'))$('#a1Stage').onclick=showStagePick;
  $('#a1Title').onclick=()=>{S.run=null;showTitle()}}
/* V2.33.65.16: 막 골라 이어하기 — 1장을 끝낸 뒤 원하는 막으로 돌아가 다시 오름 (덱·체력·카드·실링은 그대로, 그 막부터 길을 새로 고름) */
function showStagePick(){const r=S.run,M=r.map;S.screen='a1end';
  const sc=openScreen('',{full:true}),lab=n=>n===BOSS_ROW?'보스 · 순수유물주의자':ELITE_ROWS.includes(n)?'정예':n===1?'처음 막':'',
    past=n=>{const p=M.path[n-1];return p&&NODE[p.t]?`지난번 ${NODE[p.t].n}`:''};
  sc.innerHTML=`<div class="panel" style="width:min(900px,100%);margin:auto"><div class="maphead"><div><div class="psub">1장 · 미드가르드 · 덱·체력·카드는 지금 그대로</div><div class="ptitle">막 골라 이어하기</div></div><button class="btn-ghost" id="spBack">돌아가기</button></div>
    <div class="choices stagepick" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;overflow:auto">${[...Array(ROWS)].map((_,k)=>{const n=k+1;return`<button class="choice" data-row="${n}"><b>${n}막</b><span>${[lab(n),past(n)].filter(Boolean).join(' · ')||'갈림길'}</span></button>`}).join('')}</div></div>`;
  $('#spBack').onclick=showA1End;
  sc.querySelectorAll('[data-row]').forEach(b=>b.onclick=()=>{const n=+b.dataset.row;
    M.path=M.path.slice(0,n-1);M.row=n-1;r.floor=n-1;M.shops=M.path.filter(p=>p.t==='shop').length;M.bossDone=false;M.opts=genOpts(r,n);
    delete r.mapUndo;r.shop=null;r.at=null;save();toast('막 골라 이어하기',`${n}막부터 다시 오른다`);transition(showMap)})}
function resumeAt(){
  const r=S.run,at=r.at;if(r.act===2||(at&&A2_KINDS.includes(at.kind)))return showA1End();if(!at)return showMap();
  if(at.kind==='combat'&&!at.gokDone&&!(r.flags&&r.flags.gokMet)&&(at.enemies||[]).some(f=>f.key==='interp'))return gokFirst(at);
  if(at.kind==='combat')return startCombat(JSON.parse(JSON.stringify(at.enemies||at.enemy)));
  if(at.kind==='shopAsk')return eventPanel('상점','','길가에 상점이 열려 있다.',[{b:'상점에 입장한다',s:'물건을 둘러본다',f:()=>{r.at={kind:'shop'};r.shop=null;genShop();save();transition(resumeAt)}},{b:'지나간다',s:'들르지 않고 다음 막으로',f:()=>{r.at=null;save();showMap()}}]);
  if(at.kind==='inn')return showInn();
  if(at.kind==='a2first')return showA2First();
  if(at.kind==='a2rain')return showA2Rain();
  if(at.kind==='fall')return showFall();
  if(at.kind==='land')return showLand();
  if(at.kind==='dir')return showDirPick();
  if(at.kind==='shop2')return showShop2();
  if(at.kind==='contract')return showContract();
  if(at.kind==='mjol'||at.kind==='laev'){r.at=null;save();return showMap()}
  if(at.kind==='rush')return startRush();
  if(at.kind==='rest')return showRest();
  if(at.kind==='shop')return r.act===2?showShop2():showShop();
  if(at.kind==='event'){if(at.node!=null&&r.m2){const n=r.m2.nodes[at.node];if(n)n.cleared=true}return showEventKey(at.ev)}
  if(at.kind==='reward')return showReward(at.gold,at.lines,at.loot);
  showMap();
}

