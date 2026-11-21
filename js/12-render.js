"use strict";
/* ================= rendering ================= */
function rerender(){
  if(S.screen==='title')return showTitle({menu:S.titleMenu});
  if(S.screen==='climbPrep')return showClimbPrep();
  renderTop();
  if(S.screen==='combat'){positionScene();renderCombat();return}
  if(S.screen==='map')return showMap();
  if(S.screen==='shop')return S.run&&S.run.act===2?showShop2():showShop();
}
function dockEl(id){let e=$('#'+id);if(!e){e=document.createElement('div');e.id=id;$('#stage').appendChild(e)}return e}
function renderTop(){
  stage.classList.toggle('a2',!!(S.run&&S.run.act===2));
  if(!S.run)for(const id of['dockL','dockR']){const e=$('#'+id);if(e)e.hidden=true}
  const tb=$('#topbar');
  const r=S.run;if(!r){tb.hidden=true;return}tb.hidden=false;
  const need=expNeed(r.lvl),pct=Math.round(r.exp/need*100);
  tb.innerHTML=`<div class="tb-l"><span class="logo">재의 미드가르드</span>${r.act===2?`<span class="tb-chip">2장 · <b>니다벨리르</b></span><span class="tb-chip">${r.dir?DIR2[r.dir].n+' · ':''}<b>${r.floor||0}</b>막</span>${r.hostile?'<span class="tb-chip" style="color:#ef9a8c">적대</span>':''}`:`<span class="tb-chip">1장 · <b>미드가르드</b></span><span class="tb-chip"><b>${r.floor}</b> / ${ROWS}막</span>`}</div>
   <div class="tb-r"><span class="tb-chip">체력 <b>${Math.max(0,r.hp)}</b>/${r.maxHp}</span><span class="tb-chip"><b>${money(r.gold)}</b></span>
   <span class="tb-chip">${r.mode==='dain'?'<b style="color:#ef9a8c">다인모드</b>':`${r.mode==='thor'?'<b style="color:#a9cdea">묠니르</b> · ':r.mode==='odin'?'<b style="color:#a9c2d6">궁니르</b> · ':''}Lv <b>${r.lvl}</b><i class="xp" title="경험치 ${r.exp} / ${need}"><i style="width:${pct}%"></i></i>`}</span>
   ${['over','victory'].includes(S.screen)?'':'<button class="plate-btn" id="menuBtn" aria-label="메뉴">메뉴</button>'}</div>${S.screen==='combat'&&S.C?`<span class="tb-mid">${S.C.turn||1}턴</span>`:''}`;
  {const fight=S.screen==='combat',dl=dockEl('dockL'),dr=dockEl('dockR'),show=!['over','victory'].includes(S.screen);
    dl.className=dr.className=fight?'dock fight':'dock';dl.hidden=false;
    dl.innerHTML=`<button class="plate-btn big" id="deckBtn">덱 ${r.deck.length}</button>${S.screen==='map'||fight?`<button class="plate-btn big" id="prepBtn">보관함 ${(r.store||[]).length}</button>`:''}${jmOn()?`<button class="plate-btn big${jmS().noteNew?' jm-new':''}" id="noteBtn">노트</button>`:''}`;
    dr.hidden=!show;dr.innerHTML=`${r.traits&&r.traits.length?`<button class="plate-btn" id="trBtn">특성 ${r.traits.length}</button>`:''}${show?`<button class="plate-btn auto${SET.auto?' on':''}" id="autoBtn" title="자동 전투 — 오른쪽 카드부터 쓸 수 있는 카드를 전부 쓰고 턴을 끝낸다" aria-pressed="${!!SET.auto}">AUTO${SET.auto?' · 켬':''}</button>`:''}`}
  $('#deckBtn').onclick=()=>openList('덱',[...r.deck].sort(deckSort));if($('#menuBtn'))$('#menuBtn').onclick=openGameMenu;if($('#autoBtn'))$('#autoBtn').onclick=autoToggle;if($('#prepBtn'))$('#prepBtn').onclick=openPrep;if($('#noteBtn'))$('#noteBtn').onclick=openNote;
  if($('#trBtn'))$('#trBtn').onclick=()=>{const m=$('#modal');m.hidden=false;
    m.innerHTML=`<div class="panel" style="width:min(720px,100%)"><div class="maphead"><div class="ptitle">주인공 특성</div><button class="btn-ghost" id="mClose">닫기</button></div>
      <div class="plist">${r.traits.map(k=>`<div><b>${PTRAIT[k].n}</b>${PTRAIT[k].t}</div>`).join('')}</div></div>`;$('#mClose').onclick=closeModal};
}
/* 정비 시간 — 노드가 끝나고 지도 화면에서 카드 보관함과 덱을 오가며 편성, 덱 최소 5장 */
const PREP_MIN=5;
/* 전투 중에도 정비를 열어 카드를 빼고 넣을 수 있음 — 바꾸면 이번 턴을 소모함 */
function prepSync(c,out){const C=S.C;if(!C||C.over)return;if(out){for(const p of[C.draw,C.disc,C.hand,C.exh]){const i=(p||[]).findIndex(x=>x.uid===c.uid);if(i>=0)p.splice(i,1)}}else C.disc.push(c)}
/* 카드를 옮겨 다시 그려도 스크롤 위치 유지 — 보관함→덱은 덱이 늘어난 만큼 보관함 제목 기준으로 맞춤 */
const prepView=()=>{const a=$('#prepScroll'),h=$('#prepStoreH');return a&&h?{top:a.scrollTop,h:h.offsetTop}:null};
/* 장비 보관함 — 왼쪽 사람 그림과 6칸, 오른쪽 빽빽한 칸. 전투 중에는 확인만, 소유 효과는 발동 중(황금빛) */
const prepTabs=(r,on)=>`<div class="gb-tabs"><button class="gb-tab${on==='card'?' on':''}" data-ptab="card">카드 보관함 ${(r.store||[]).length}</button><button class="gb-tab${on==='gear'?' on':''}" data-ptab="gear">장비 보관함 ${(r.bag||[]).length+(r.equip||[]).length+wornGear(r).length}</button>${isMate(r.pal)?`<button class="gb-tab${on==='pal'?' on':''}" data-ptab="pal">${MATE[r.pal.k].n}</button>`:''}</div>`;
const GB_FIG='<svg viewBox="0 0 150 430"><circle cx="75" cy="38" r="36"/><rect x="26" y="84" width="98" height="166" rx="26"/><rect x="0" y="92" width="24" height="154" rx="12"/><rect x="126" y="92" width="24" height="154" rx="12"/><rect x="34" y="230" width="38" height="196" rx="14"/><rect x="78" y="230" width="38" height="196" rx="14"/></svg>';
function openGearBag(){bagTalk();const r=ensureGear(S.run),m=$('#modal'),fight=S.screen==='combat'&&S.C&&!S.C.over;m.hidden=false;S.prepTab='gear';S.gearF=S.gearF||'all';
  const pal=isMate(r.pal)?r.pal:null;
  const sel=S.gearSel,slot=(s,x)=>{const k=r.gear[s][0];return`<button class="gb-slot${k?' on':''}${sel&&sel.s===s?' sel':''}" data-gs="${s}" style="${x}"${k&&!fight?` data-duid="s:${s}" data-dsrc="wear" data-dname="${GEAR[k].n}"`:''}><i>${GSLOT[s].n}</i><em>${k?GEAR[k].n:'비어 있음'}</em></button>`};
  const F=S.gearF,bag=r.bag.map((k,i)=>({k,i})).filter(x=>GEAR[x.k]&&(F==='all'||(F==='wp'?['rh','lh'].includes(GEAR[x.k].s):F==='ar'?!['rh','lh'].includes(GEAR[x.k].s):false))),own=(F==='all'||F==='own')?(r.equip||[]).filter(k=>EQUIP[k]):[];
  const cells=bag.map(x=>`<button class="gb-c${sel&&sel.i===x.i?' sel':''}" data-gi="${x.i}"${fight?'':` data-duid="b:${x.i}" data-dsrc="bag" data-dname="${GEAR[x.k].n}"`}><b>${GSLOT[GEAR[x.k].s].n}</b><span>${GEAR[x.k].n}</span></button>`).join('')+own.map(k=>`<button class="gb-c own${fight?' live':''}${sel&&sel.o===k?' sel':''}" data-go="${k}"><b>${fight?'발동 중':'소유'}</b><span>${EQUIP[k].n}</span></button>`).join('')+'<div class="gb-c e"></div>'.repeat(Math.max(0,32-bag.length-own.length));
  let tip='';if(sel){const k=sel.s?r.gear[sel.s][0]:sel.o||r.bag[sel.i],e=sel.o?EQUIP[k]:GEAR[k];if(e)tip=`<div class="gb-tip"><h4>${e.n}</h4><p>${e.t}</p>${sel.o?`<small>소유 효과 · 착용하지 않아도 효과가 남</small>`:fight?'<small>전투 중에는 확인만 할 수 있다</small>':`<button class="plate-btn" id="gbAct">${sel.s?'벗기':'착용'}</button>`}</div>`}
  m.innerHTML=`<div class="panel" style="width:min(1300px,100%);height:100%"><div class="maphead">${prepTabs(r,'gear')}<button class="btn-ghost" id="mClose">닫기</button></div>
   <div class="gb-m"><div class="gb-fig" data-dz="wear">${GB_FIG}${slot('head','left:3%;top:4%')}${slot('body','left:3%;top:36%')}${slot('leg','left:3%;top:68%')}${slot('rh','right:3%;top:4%')}${slot('lh','right:3%;top:36%')}${slot('foot','right:3%;top:68%')}</div>
   <div class="gb-r"><div class="gb-fl">${[['all','전체'],['wp','무기'],['ar','방어구']].map(([k,n])=>`<button class="${F===k?'on':''}" data-gf="${k}">${n}</button>`).join('')}</div><div class="gb-g" data-dz="bag">${cells}${(r.keep||[]).includes('nred')?'<button class="gb-c keep" id="gbRed"><b>귀속</b><span>노르드교의 붉은 천</span></button>':''}</div>${tip}
   ${pal?`<div class="ap-h" style="margin-top:12px">${MATE[pal.k].n}의 장비<span class="dzhint">${fight?'전투 중에는 확인만 할 수 있다':'끌어다 놓으면 건네준다'}</span></div><div class="gb-g" data-dz="palgear" style="min-height:64px">${(pal.gear||[]).map((k,i)=>GEAR[k]?`<button class="gb-c"${fight?'':` data-duid="p:${i}" data-dsrc="palgear" data-dname="${GEAR[k].n}"`}><b>${MATE[pal.k].n}</b><span>${GEAR[k].n}</span></button>`:'').join('')||'<div class="hint">비어 있음</div>'}</div>`:''}</div></div></div>`;if($('#gbRed'))$('#gbRed').onclick=e=>{const b=e.currentTarget;b.classList.toggle('open');b.innerHTML=b.classList.contains('open')?'<b>귀속 · 버릴 수 없음</b><span>노르드교의 붉은 천</span><em>동료를 아낀 자의 최후</em>':'<b>귀속</b><span>노르드교의 붉은 천</span>'};
  bindPrepTabs(m);$('#mClose').onclick=()=>{S.gearSel=null;prepClose(fight)};
  m.querySelectorAll('[data-gf]').forEach(b=>b.onclick=()=>{S.gearF=b.dataset.gf;S.gearSel=null;openGearBag()});
  m.querySelectorAll('[data-gs]').forEach(b=>b.onclick=()=>{S.gearSel=r.gear[b.dataset.gs][0]?{s:b.dataset.gs}:null;openGearBag()});
  m.querySelectorAll('[data-gi]').forEach(b=>b.onclick=()=>{S.gearSel={i:+b.dataset.gi};openGearBag()});
  m.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{S.gearSel={o:b.dataset.go};openGearBag()});
  if(!fight)bindDrag(m,(from,to,id)=>{const v=id.split(':')[1];
    const GL=s=>{if(jmGearLocked(s)){toast('장비','이 장비는 바꿀 수 없다');return true}return false};
    if(from==='bag'&&to==='wear'){const i=+v,k=r.bag[i];if(!k)return;if(GL(GEAR[k].s))return;r.bag.splice(i,1);const old=wearAt(r,k,GEAR[k].s,0);if(old)r.bag.push(old)}
    else if(from==='wear'&&to==='bag'){if(GL(v))return;const old=takeOff(r,v,0);if(old)r.bag.push(old)}
    else if(from==='bag'&&to==='palgear'&&pal){const i=+v,k=r.bag[i];if(!k)return;r.bag.splice(i,1);pal.gear.push(k);pal.first=pal.first||k;toast(MATE[pal.k].n,`「${GEAR[k].n}」 건넴`);palEv('give')}
    else if(from==='wear'&&to==='palgear'&&pal){if(GL(v))return;const old=takeOff(r,v,0);if(!old)return;pal.gear.push(old);pal.first=pal.first||old;toast(MATE[pal.k].n,`「${GEAR[old].n}」 건넴`);palEv('give')}
    else if(from==='palgear'&&(to==='bag'||to==='wear')&&pal){const i=+v,k=pal.gear[i];if(!k)return;if(to==='wear'&&GL(GEAR[k].s))return;pal.gear.splice(i,1);if(to==='wear'){const old=wearAt(r,k,GEAR[k].s,0);if(old)r.bag.push(old)}else r.bag.push(k)}
    else return;S.gearSel=null;save();renderTop();openGearBag()});
  if($('#gbAct'))$('#gbAct').onclick=()=>{if(jmGearLocked(sel.s||GEAR[r.bag[sel.i]].s))return toast('장비','이 장비는 바꿀 수 없다');if(sel.s){const old=takeOff(r,sel.s,0);if(old)r.bag.push(old)}else{const k=r.bag[sel.i],s=GEAR[k].s;r.bag.splice(sel.i,1);const old=wearAt(r,k,s,0);if(old)r.bag.push(old)}S.gearSel=null;save();renderTop();openGearBag()};
}
function bindPrepTabs(m){m.querySelectorAll('[data-ptab]').forEach(b=>b.onclick=()=>{S.gearSel=null;S.prepTab=b.dataset.ptab;openPrep()})}
function prepClose(fight){closeModal();renderTop();if(fight){if(S.C.prepEdit){S.C.prepEdit=false;clog('전투 중 정비 — 이번 턴을 소모했다','h');renderCombat();endTurn()}else renderCombat()}}
/* 카드 보관함: 공격 · 방어 · 유틸로 나누고 그 안에서 희귀도로 나눔, 같은 카드는 패처럼 ×N으로 겹침 */
/* 보관함 끌어서 편성 (V37.26) — 마우스는 바로, 손가락은 잠깐 누른 뒤 끌기 */
function bindDrag(root,onDrop){root.querySelectorAll('[data-duid]').forEach(el=>{el.addEventListener('contextmenu',e=>e.preventDefault());
  el.addEventListener('pointerdown',e=>{if(e.button>0)return;const btn=e.target.closest('button');if(btn&&btn!==el&&el.contains(btn))return;
    const touch=e.pointerType!=='mouse',sx=e.clientX,sy=e.clientY;let g=null,over=null,armed=!touch,dead=false,ly=sy,scT=0;
    const scr=root.querySelector('#prepScroll');/* 끄는 중 위아래 끝에 가면 저절로 스크롤 */
    const auto=()=>{if(!g||!scr)return;const rr=scr.getBoundingClientRect();if(ly>rr.bottom-70)scr.scrollTop+=16;else if(ly<rr.top+70)scr.scrollTop-=16};
    const holdT=touch?setTimeout(()=>{if(!dead){armed=true;el.classList.add('darm')}},220):0;
    const tm=ev=>{if(g&&ev.cancelable)ev.preventDefault()};el.addEventListener('touchmove',tm,{passive:false});
    const mv=ev=>{if(dead)return;const d=Math.hypot(ev.clientX-sx,ev.clientY-sy);
      if(!g){if(!armed){if(d>8){dead=true;clearTimeout(holdT)}return}if(d<10)return;g=document.createElement('div');g.className='dghost';g.textContent=el.dataset.dname||'';document.body.appendChild(g);el.classList.add('dsrc');el.classList.remove('darm');scT=setInterval(auto,30)}
      ly=ev.clientY;
      if(ev.cancelable)ev.preventDefault();g.style.left=ev.clientX+'px';g.style.top=ev.clientY+'px';const tg=document.elementFromPoint(ev.clientX,ev.clientY),z=tg&&tg.closest('[data-dz]');if(over&&over!==z)over.classList.remove('dzon');over=z&&root.contains(z)?z:null;if(over)over.classList.add('dzon')};
    const up=()=>{clearTimeout(holdT);clearInterval(scT);el.classList.remove('darm');removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);el.removeEventListener('touchmove',tm);if(!g)return;g.remove();el.classList.remove('dsrc');if(over)over.classList.remove('dzon');
      const sw=e2=>{e2.stopPropagation();e2.preventDefault()};el.addEventListener('click',sw,{capture:true,once:true});setTimeout(()=>el.removeEventListener('click',sw,{capture:true}),80);
      if(over&&over.dataset.dz!==el.dataset.dsrc)onDrop(el.dataset.dsrc,over.dataset.dz,el.dataset.duid)};
    addEventListener('pointermove',mv,{passive:false});addEventListener('pointerup',up);addEventListener('pointercancel',up)})})}
const cardCat=id=>{const t=CARDS[id].type;return t==='atk'?'공격':t==='def'?'방어':'지원'};
const CF_LIST=['전체','공격','방어','지원'];
const cfBar=cur=>`<div class="cfilt" role="group" aria-label="분류">${CF_LIST.map(k=>`<button class="cfb${k===cur?' on':''}" data-cf="${k}" aria-pressed="${k===cur}">${k}</button>`).join('')}</div>`;
const cfPass=(c,f)=>!f||f==='전체'||cardCat(c.id)===f;
function storeHTML(list){
  const cat=c=>cardCat(c.id),gr=c=>cardGrade(c.id)||'unique',RK=['common','rare','hero','legend','myth','unique'],GN={common:'일반',rare:'희귀',hero:'영웅',legend:'전설',myth:'신화',unique:'고유'};
  return['공격','방어','지원'].map(k=>{const a=list.filter(c=>cat(c)===k);if(!a.length)return'';
    return`<div class="prep-c">${k} ${a.length}장</div>`+RK.map(g=>{const b=a.filter(c=>gr(c)===g);if(!b.length)return'';const m=new Map();for(const c of b){const q=c.id+'|'+(c.mods||[]).join(',');if(!m.has(q))m.set(q,[]);m.get(q).push(c)}
      return`<div class="prep-g">${GN[g]}</div><div class="cardgrid" style="overflow:visible;height:auto;max-height:none">${[...m.values()].map(x=>{const ok=wpnOk(x[0].id);return`<div class="cardpick${x.length>1?' st-stack':''}${ok?'':' off'}" data-duid="${x[0].uid}" data-dsrc="store" data-dname="${CARDS[x[0].id].name}">${x.length>1?`<span class="st-n">×${x.length}</span>`:''}${staticCard(x[0].id,false,x[0])}${CARDS[x[0].id].ranged?'<span class="rtag">원거리 · 동료에게</span>':''}<button class="plate-btn" data-in="${x[0].uid}" ${ok?'':'disabled'}>덱으로</button></div>`}).join('')}</div>`}).join('')}).join('')}
function openPrep(v,anchor){if(!S.prepOpenT||Date.now()-S.prepOpenT>1500)bagTalk();S.prepOpenT=Date.now();if(S.prepTab==='pal'&&S.run.pal)return openPalTab();const r=S.run,m=$('#modal'),fight=S.screen==='combat'&&S.C&&!S.C.over;if(fight&&(S.busy||S.C.phase!=='player'||S.C.select))return;r.store=r.store||[];if(fight&&S.tb)return;m.hidden=false;
  if(S.prepTab==='gear')return openGearBag();
  const row=(c,act,lb,off)=>`<div class="cardpick">${staticCard(c.id,false,c)}<button class="plate-btn" data-${act}="${c.uid}" ${off?'disabled':''}>${lb}</button></div>`;
  const PF=S.prepF||'전체',dk=[...r.deck].filter(c=>cfPass(c,PF)).sort(deckSort),st=[...r.store].filter(c=>cfPass(c,PF)).sort(deckSort),palC=isMate(r.pal)?r.pal:null;
  m.innerHTML=`<div class="panel" style="width:min(1300px,100%);height:100%"><div class="maphead"><div>${prepTabs(r,'card')}<div class="psub">${fight?'전투 중 정비 · 카드를 바꾸면 이번 턴이 끝난다':'정비 시간'} · 덱 ${r.deck.length}장 · 덱은 최소 ${PREP_MIN}장</div></div>${cfBar(PF)}<button class="btn-ghost" id="mClose">닫기</button></div>
    <div id="prepScroll" style="overflow:auto;flex:1;min-height:0;display:block"><div class="ap-h">덱<span class="dzhint">끌어서 옮길 수 있다</span></div><div class="cardgrid" data-dz="deck" style="overflow:visible;height:auto;max-height:none;margin-bottom:16px;min-height:120px">${[...dk.reduce((m,c)=>{const q=c.id+'|'+(c.mods||[]).join(',');if(!m.has(q))m.set(q,[]);m.get(q).push(c);return m},new Map()).values()].map(x=>`<div class="cardpick${x.length>1?' st-stack':''}" data-duid="${x[0].uid}" data-dsrc="deck" data-dname="${CARDS[x[0].id].name}">${x.length>1?`<span class="st-n">×${x.length}</span>`:''}${staticCard(x[0].id,false,x[0])}<button class="plate-btn" data-out="${x[0].uid}" ${r.deck.length<=PREP_MIN?'disabled':''}>보관함으로</button></div>`).join('')}</div>
    ${palC?`<div class="ap-h">${MATE[palC.k].n}에게 준 카드 ${palC.cards.length}장<span class="dzhint">끌어다 놓으면 건네준다</span></div><div class="cardgrid" data-dz="pal" style="overflow:visible;height:auto;max-height:none;margin-bottom:16px;min-height:120px">${palC.cards.map(c=>`<div class="cardpick" data-duid="${c.uid}" data-dsrc="pal" data-dname="${CARDS[c.id].name}">${staticCard(c.id,false,c)}<button class="plate-btn" data-pback2="${c.uid}">돌려받기</button></div>`).join('')||'<div class="hint">아직 없음 · 공격 카드를 주면 함께 공격한다</div>'}</div>`:''}
    <div data-dz="store" style="min-height:160px"><div class="ap-h" id="prepStoreH">카드 보관함</div>${storeHTML(st)||'<div class="hint">비어 있음</div>'}</div></div></div>`;
  bindStatic(m);bindPrepTabs(m);$('#mClose').onclick=()=>prepClose(fight);
  m.querySelectorAll('[data-cf]').forEach(b=>b.onclick=()=>{S.prepF=b.dataset.cf;openPrep()});
  m.querySelectorAll('[data-out]').forEach(b=>b.onclick=()=>{const view=prepView(),c0=r.deck.find(x=>x.uid===+b.dataset.out),c=jmDeckPick(c0);if(c0&&!c)return toast('덱','이 카드는 덱에서 뺄 수 없다');if(!c||r.deck.length<=PREP_MIN)return;r.deck.splice(r.deck.indexOf(c),1);r.store.push(c);if(fight){prepSync(c,true);S.C.prepEdit=true}tutEvent('prepOut');save();openPrep(view)});
  m.querySelectorAll('[data-in]').forEach(b=>b.onclick=()=>{const view=prepView(),c=r.store.find(x=>x.uid===+b.dataset.in);if(!c||!wpnOk(c.id))return;r.store.splice(r.store.indexOf(c),1);r.deck.push(c);if(fight){prepSync(c,false);S.C.prepEdit=true}tutEvent('prepIn');save();openPrep(view,true)});
  m.querySelectorAll('[data-pback2]').forEach(b=>b.onclick=()=>{const view=prepView(),c=palC.cards.find(x=>x.uid===+b.dataset.pback2);if(!c)return;palC.cards.splice(palC.cards.indexOf(c),1);r.store.push(c);save();openPrep(view)});
  bindDrag(m,(from,to,uid)=>{uid=+uid;const view=prepView(),L={deck:r.deck,store:r.store,pal:palC?palC.cards:null},a=L[from],b=L[to];if(!a||!b)return;let c=a.find(x=>x.uid===uid);if(!c)return;if(from==='deck'){c=jmDeckPick(c);if(!c)return toast('덱','이 카드는 덱에서 뺄 수 없다')}
    if(from==='deck'&&r.deck.length<=PREP_MIN){toast('덱',`덱은 최소 ${PREP_MIN}장이어야 한다`);return}
    if(to==='deck'&&!wpnOk(c.id))return;
    a.splice(a.indexOf(c),1);b.push(c);if(fight&&(from==='deck'||to==='deck')){prepSync(c,from==='deck');S.C.prepEdit=true}
    if(from==='deck'&&to==='store')tutEvent('prepOut');if(from==='store'&&to==='deck')tutEvent('prepIn');
    if(to==='pal'){const pk=S.run.pal.k;S.palLine=MATE_GIVE[pk]||'';palEv('give');toast(MATE[pk]?MATE[pk].n:'동료',`「${CARDS[c.id].name}」 건넴`)}
    save();openPrep(view,to==='deck')});
  if(v&&typeof v.top==='number'){const a=$('#prepScroll'),h=$('#prepStoreH');if(a&&h)a.scrollTop=v.top+(anchor?h.offsetTop-v.h:0)}}
function showCombatUI(){$('#cui').hidden=false;$('#enemy').hidden=false;$('#enemy').className='';positionScene()}
function hideCombatUI(){try{ultReset()}catch(e){}{const b=document.getElementById('trFxBtn');if(b)b.remove()}stSheet(null);palRender(false);for(const k of['#dockL','#dockR']){const e=$(k);if(e){e.style.top='';e.style.bottom=''}}if(S.screen!=='title')endTitleScene();{document.querySelectorAll('.knfig').forEach(k=>k.hidden=true)}$('#foebar').hidden=true;{const bx=$('#foefigs');if(bx){bx.hidden=true;bx.innerHTML=''}const o=L[S.orient];if(o.ex0!=null){o.ex=o.ex0;o.ew=o.ew0;o.eh=o.eh0}}const df=$('#dfocus');if(df)df.hidden=true;$('#tut').hidden=true;stage.removeAttribute('data-tut');$('#cui').hidden=true;$('#enemy').hidden=true;$('#hand').innerHTML='';handEls.clear();hideSpeech();$('#prompt').hidden=true}
const EFEET0={land:L.land.efeet,port:L.port.efeet};
function positionScene(){
  const o=L[S.orient],en=$('#enemy');
  /* 적은 그림의 바닥선에 발을 딛음 */
  const gnd=S.screen==='combat'&&S.bg==='view'?sceneGround():null;
  o.efeet=(gnd?clamp(gnd,S.orient==='land'?560:560,S.orient==='land'?700:800):EFEET0[S.orient])-(S.orient==='port'?(UIZ-1)*180:0);
  en.style.width=o.ew+'px';en.style.height=o.eh+'px';en.style.left=(o.ex-o.ew/2)+'px';en.style.top=(o.efeet-o.eh)+'px';
  const sp=$('#speech');
  if(S.orient==='land'){sp.style.left=(o.ex+o.ew/2+10)+'px';sp.style.top=Math.max(230,o.efeet-o.eh+60)+'px';sp.style.right='';sp.style.bottom=''}
  else{sp.style.left='24px';sp.style.top='250px';}
}
const ICON={
  atk:'<svg viewBox="0 0 24 24"><path d="M4 20 15 9M14 4l6 6-3 1-4-4zM3 17l4 4" stroke="#f0b8ae" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
  def:'<svg viewBox="0 0 24 24"><path d="M12 3 20 6v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" fill="#a6bfd1"/></svg>',
  debuff:'<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke="#b9a7d6" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#b9a7d6"/></svg>',
  curse:'<svg viewBox="0 0 24 24"><path d="M12 3c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12z" fill="#7d6a98"/></svg>',
  mercy:'<svg viewBox="0 0 24 24"><path d="M12 2c3 5 6 7 6 12a6 6 0 0 1-12 0c0-5 3-7 6-12z" fill="#fff"/></svg>',
};
/* V32.20.2.6 은빛 기사 그림 — 보스 옆에 서서 보스 대신 피해를 받음 */
function renderKnight(){[0,1].forEach(i=>{const kf=$('#knightFig'+(i?'2':''));if(kf){kf.hidden=true;kf.className='knfig'}});return;const C=S.C,E=C&&C.E;[0,1].forEach(i=>{const kf=$('#knightFig'+(i?'2':''));if(!kf)return;
  const k=E&&E.boss&&S.screen==='combat'&&!C.over&&E.kns?E.kns[i]:null;if(!k){kf.hidden=true;kf.className='knfig';return}
  const o=L[S.orient],w=o.ew*.62,h=o.eh*.72,land=S.orient==='land',off=o.ew*(land?.78:.62);kf.style.width=w+'px';kf.style.height=h+'px';kf.style.left=(o.ex+(i?off:-off)-w/2)+'px';kf.style.top=(o.efeet+16-h)+'px';
  const art=kf.querySelector('.kn-art');if(!art.dataset.k){art.dataset.k=1;art.innerHTML=ENEMY_SVG.inquisitor||''}
  kf.querySelector('.kn-bar i').style.width=clamp(k.hp/k.max*100,0,100)+'%';kf.querySelector('.kn-bar em').textContent=`${k.hp} / ${k.max}`;kf.querySelector('.kn-st').textContent=k.hp>0&&k.stun>=C.turn?'다음 턴 행동 불가':'';
  if(kf.hidden){kf.hidden=false;kf.className='knfig in'}kf.classList.toggle('dead',k.hp<=0)})}
function knightHitAnim(i){const a=$(`#knightFig${i?'2':''} .kn-art`);if(!a||REDUCED)return;a.classList.remove('hit');void a.offsetWidth;a.classList.add('hit')}
function renderEnemy(){
  const C=S.C,E=C.E;renderKnight();
  const art=$('#eart');
  if(art.dataset.k!==E.key){art.dataset.k=E.key;art.classList.toggle('still',false);art.innerHTML=false?`<div class="bwrap"><img class="bbody" alt="${E.name}" src="${BISHOP_BODY}"><img class="bface" alt="" src="${BISHOP_FACE.neutral}" data-f="neutral"></div>`:ENEMY_IMG[E.key]?`<img alt="${E.name}" src="${ENEMY_IMG[E.key]}">`:(ENEMY_SVG[ENEMY[E.key].art]||a2SVG(ENEMY[E.key].art))}
  bishopFace();
  $('#intent').innerHTML='';
  const chips=[];
  if(E.block)chips.push(`<span class="chip">방어도 ${E.block}</span>`);
  if(E.evaB)chips.push(`<span class="chip">회피 +${E.evaB}</span>`);
  if(E.weak)chips.push(`<span class="chip bad">허약 ${E.weak}</span>`);
  if(E.vuln)chips.push(`<span class="chip bad">취약 ${E.vuln}</span>`);
  if(E.pmk&&E.pmk.lv)chips.push(`<span class="chip bad">표식${ROMAN[E.pmk.lv]} · 받는 데미지 +${E.pmk.lv*10}%${E.pmk.lock>=S.C.turn?' · 유지':''}</span>`);if(pExpo(E))chips.push(`<span class="chip bad">약점 노출</span>`);
  if(E.el)chips.push(`<span class="chip bad">전격 ${E.el}</span>`);
  if(E.burn)chips.push(`<span class="chip bad">소각 ${E.burn}</span>`);
  if(E.frost)chips.push(`<span class="chip bad">냉매 · 명중 -20</span>`);
  if(E.revenge)chips.push(`<span class="chip">복수심 +${E.revenge}</span>`);
  if(E.steam)chips.push(`<span class="chip bad">증기 ${E.steam}</span>`);if(E.heat)chips.push(`<span class="chip brass">열기 ${E.heat}</span>`);
  if(E.cool)chips.push(`<span class="chip bad">냉매 ${E.cool}</span>`);if(E.frozen||E.frozeSkip)chips.push(`<span class="chip bad">냉동 — 다음 행동 불가</span>`);if(E.crack)chips.push(`<span class="chip bad">깨짐 ${E.crack}단계</span>`);
  if(E.food)chips.push(`<span class="chip brass">먹기 ${E.food}${E.full?' · 배부름':''}${E.sat?` · 포화 ${E.sat}`:''}</span>`);
  if(E.art)chips.push(`<span class="chip brass">예술적 감각 ${E.art}</span>`);if(E.wipT!=null)chips.push(`<span class="chip brass">작품 준비 </span>`);if(E.done)chips.push(`<span class="chip bad">작품 완성 · 위력 +200%</span>`);if(E.stun)chips.push(`<span class="chip good">말문이 막힘 · 다음 행동 취소</span>`);if(E.rage)chips.push(`<span class="chip bad">분노 · 위력 +${Math.round((E.rage-1)*100)}%</span>`);
  if(E.mark)chips.push(`<span class="chip bad">궁니르-명중 ${E.mark}</span>`);
  if(E.charged)chips.push(`<span class="chip bad">송출 대기</span>`);if(E.para)chips.push(`<span class="chip bad">마비 · 명중 -10</span>`);
  if(E.key==='clerk'&&E.phase===2)chips.push(`<span class="chip brass">페이즈 2</span>`);
  if(E.knight&&E.hurtT===C.turn)chips.push(`<span class="chip bad">원호 방어만</span>`);
  if(E.boss){chips.push(`<span class="chip brass">페이즈 ${E.phase} · ${['','정화','단죄','번제화'][E.phase]}</span>`);
    if(knAlive(E).length)chips.push(`<span class="chip good">에인헤랴르 ${knAlive(E).length} · 새겨진 본능-보호</span>`);
    if(E.pendPhase)chips.push(`<span class="chip bad">페이즈 ${E.pendPhase} 준비</span>`);
    if(E.human)chips.push(`<span class="chip">인간의 몸 명중 -${E.human*5}</span>`);
}
  E.traits.forEach(t=>chips.push(`<span class="chip trait">${t}</span>`));
  const pct=clamp(E.hp/E.maxHp*100,0,100);
  const ep=$('#eplate');ep.innerHTML=`<div class="ename">${E.name}${E.sub?`<small>${E.sub}</small>`:''}<small>Lv ${E.lv}</small></div>
    <div class="ebar"><i style="width:${pct}%"></i><span>${Math.max(0,E.hp)} / ${E.maxHp}</span>${E.block?`<b class="blk">${E.block}</b>`:''}</div>
    ${foeOrbs(E)}`;if($('#echips'))$('#echips').innerHTML=chips.join('');
  requestAnimationFrame(()=>{const en=$('#enemy');if(en)en.style.setProperty('--ph',(ep.offsetHeight+14)+'px')});
  renderFoeBar();
}
function renderPlayer(){
  const C=S.C,r=S.run,dain=r.mode==='dain';
  const chips=[];
  if(C.evaB)chips.push(`<span class="chip good">회피 +${C.evaB}</span>`);
  if(C.pWeak)chips.push(`<span class="chip bad">허약 ${C.pWeak}</span>`);
  if(C.pWkF)chips.push(`<span class="chip bad">약화 ${C.pWkF} · 위력 -${C.pWkF}</span>`);
  if(C.pStr)chips.push(`<span class="chip good">힘 ${C.pStr} · 위력 +${C.pStr}</span>`);
  if(C.parryN)chips.push(`<span class="chip good">흘려 베기 · 반격 ${C.parryN}</span>`);
  if(r.ults&&r.ults.includes('u_purge')&&C.pPurge)chips.push(`<span class="chip brass">처단 ${Math.min(3,C.pPurge)}/3</span>`);
  if(dagger())chips.push(`<span class="chip brass">노르드교 조잡한 단검</span>`);
  if(C.mk&&C.mk.lv)chips.push(`<span class="chip bad">표식${ROMAN[C.mk.lv]} · 받는 데미지 +${C.mk.lv*10}%${C.mk.lock>=C.turn?' · 유지':''}</span>`);
  if(expoOn())chips.push(`<span class="chip bad">약점 노출</span>`);
  if(fracOn())chips.push(`<span class="chip bad">골절 · 턴 시작 코스트 -1 (${C.fracEnd-C.turn+(C.turn>C.fracS?1:0)}턴)</span>`);
  if(S.run.flags&&S.run.flags.heresy&&(S.run.act||1)===1)chips.push(`<span class="chip bad">이단 표식</span>`);
  if(C.pVuln)chips.push(`<span class="chip bad">취약 ${C.pVuln}</span>`);
  if(C.pEl)chips.push(`<span class="chip bad">전격 ${C.pEl}</span>`);
  if(C.pBurn)chips.push(`<span class="chip bad">소각 ${C.pBurn}</span>`);
  if(C.yu)chips.push(`<span class="chip good">유희 ${C.yu} · +${C.yu*20}%</span>`);
  if(C.temper)chips.push(`<span class="chip good">단련 +${C.temper*25}</span>`);
  if(C.recoil)chips.push(`<span class="chip good">반동 ${C.recoil}</span>`);
  if(C.hold)chips.push(`<span class="chip good">버팀</span>`);
  if(C.ashBonus)chips.push(`<span class="chip good">재의 흔적 · 다음 카드 +${C.ashBonus}</span>`);
  if(C.nextEnergy)chips.push(`<span class="chip good">다음 턴 코스트 +${C.nextEnergy}</span>`);if(C.nextDraw)chips.push(`<span class="chip good">다음 턴 드로우 +${C.nextDraw}</span>`);if(C.lockDisc&&C.lockDisc.length)chips.push(`<span class="chip">대절단 재료 ${C.lockDisc[0].t-C.turn}턴 뒤 복귀</span>`);
  if(C.discount)chips.push(`<span class="chip good">파편 장식 · 다음 카드 -1</span>`);
  if(C.blockDebt)chips.push(`<span class="chip bad">방어도 감소 -${C.blockDebt}</span>`);
  if(C.pSteam)chips.push(`<span class="chip bad">증기 ${C.pSteam}</span>`);if(C.heat)chips.push(`<span class="chip good">열기 ${C.heat}</span>`);
  if(C.pCool)chips.push(`<span class="chip bad">냉매 ${C.pCool} · 코스트 -${C.pCool}</span>`);if(C.pFrozen)chips.push(`<span class="chip bad">냉동</span>`);if(C.pCrack)chips.push(`<span class="chip bad">깨짐 ${C.pCrack}단계</span>`);
  if(C.art)chips.push(`<span class="chip good">예술적 감각 ${C.art}</span>`);if(masterOn())chips.push(`<span class="chip good">작품-완성</span>`);
  if(C.food)chips.push(`<span class="chip good">먹기 ${C.food}${C.full?' · 배부름':''}${C.sat?` · 포화 ${C.sat}`:''}</span>`);
  if(C.nullKinds&&C.nullKinds.length)chips.push(`<span class="chip bad">무효: ${C.nullKinds.map(k=>KIND_N[k]).join('·')}</span>`);
  if(C.talkDisc)chips.push(`<span class="chip good">해설 · 다음 카드 ${C.talkDisc}장 -1</span>`);if(C.thrown)chips.push(`<span class="chip brass">묠니르 던짐</span>`);
  if(dain){chips.push(`<span class="chip brass">섭취 ${C.eat}</span>`);if(berserk())chips.push(`<span class="chip bad">광전사-강화</span>`)}
  const pct=clamp(r.hp/r.maxHp*100,0,100);
  $('#ppanel').innerHTML=`<div class="pp-name">${dain?'다인슬레이프':r.mode==='thor'?'묠니르 (토르)':r.mode==='odin'?'궁니르 (오딘)':'일반인'}<small>${dain?'Lv 1 고정':`Lv ${r.lvl}`}</small></div>
    <div class="pp-hp"><div class="pbar"><i style="width:${pct}%"></i><span>${Math.max(0,r.hp)} / ${r.maxHp}</span></div></div>
    <div class="pp-row">${dain?`<div class="orb blood" title="코스트 대신 체력을 소모해 카드를 사용함">포식</div>`:(C.maxE<=8?`<div class="orb eorbs" title="코스트 ${C.energy} / ${C.maxE}">${Array.from({length:Math.max(C.maxE,C.energy)},(_,k)=>`<i class="${k<C.energy?(k>=C.maxE?'on ex':'on'):''}"></i>`).join('')}</div>`:`<div class="orb" title="코스트">${C.energy}<small>/${C.maxE}</small></div>`)}
      <div class="shield${C.block?'':' zero'}"><b>${C.block}</b>방어도</div></div>
    ${chips.length?`<div class="chips">${chips.join('')}</div>`:''}`;
  {const pp=$('#ppanel');pp.onclick=e=>{if(e.target.closest('.chip'))return;openMePanel()}}
  pilesHTML(C,C.phase==='enemy'?'적의 차례':'턴 종료',C.phase!=='player'||C.over||!!C.select,endTurn);
  palRender();palWatch();dockFit();
}
/* 오른쪽 아래: 뽑을 카드 · 버린 카드 · 소멸 · 계산 로그 · 턴 종료 */
/* 자동 전투 (V31.16.5) — 켜 두면 패의 오른쪽 카드부터, 지금 쓸 수 있는 카드를 전부 쓰고 턴을 끝냄 (설정에 남음) */
let AUTO_RUN=false;
async function autoLoop(){if(AUTO_RUN)return;AUTO_RUN=true;const skip=new Set();let lt=-1;
  try{while(SET.auto){
    if(S.screen!=='combat')break;const C=S.C;if(!C||C.over||C.dead)break;
    if(S.tb){SET.auto=false;saveSet();toast('자동 전투','튜토리얼 중에는 쓸 수 없다');renderCombat();break}
    await wait(240);if(S.C!==C||C.over||!SET.auto)break;
    if(C.phase!=='player'||S.busy||!$('#modal').hidden||!$('#veil').hidden)continue;
    if(C.turn!==lt){lt=C.turn;skip.clear()}
    if(C.select){if(C.select.type==='toss'){finishToss();continue}if(C.select.type==='discard'){C.select.pick=C.hand.slice(-overHand()).map(x=>x.uid);finishDiscard();continue}if(C.hand.length)doSelect(C.hand[0]);else C.select=null;continue}
    const st=handStacks();let did=false;
    for(let i=st.length-1;i>=0;i--){const c=st[i].cards[st[i].cards.length-1];if(skip.has(c.uid))continue;if(canPlay(c))continue;
      {if(C.E&&!alive(C.E)){const f=liveFoes()[0];if(f)C.E=f}await playStack([c.uid])}
      if(C.hand.includes(c))skip.add(c.uid);did=true;break}
    if(!did&&SET.auto&&S.C===C&&C.phase==='player'&&!S.busy&&!C.over&&!C.select)await endTurn()
  }}finally{AUTO_RUN=false}}
function autoToggle(){if(!SET.auto&&S.tb&&S.screen==='combat'){toast('자동 전투','튜토리얼 중에는 쓸 수 없다');return}SET.auto=!SET.auto;saveSet();toast('자동 전투',SET.auto?'켬 — 전투에서 오른쪽 카드부터 쓸 수 있는 카드를 전부 쓴다':'끔');renderTop();if(S.screen==='combat')renderCombat();if(SET.auto)autoLoop()}
function pilesHTML(C,label,dis,onEnd){
  const tutA=S.screen==='combat'&&!!S.tb;
  $('#piles').innerHTML=`<div class="pcol"><div class="pilex">${S.screen==='combat'?`<button class="plate-btn" id="pFlee" ${dis||!canFlee()?'disabled':''} title="${canFlee()?'1턴을 쓰고 주사위로 도망친다':'정예·보스 전투에서는 도망칠 수 없다'}">도망치기</button>`:''}<button class="plate-btn" id="pExh">소멸 ${C.exh.length}</button>${C.log?'<button class="plate-btn" id="pLog">계산 로그</button>':''}${S.screen==='combat'&&S.run&&((S.run.equip||[]).length||C.tempEq)?`<button class="plate-btn" id="pEq">장비${C.spinArm||C.flaskArm?' ●':''}${C.plank?' · 판자 1':''}</button>`:''}</div>
    <div class="pilegrp"><button class="pile" id="pDraw">뽑을 카드<b>${C.draw.length}</b></button><button class="pile" id="pDisc">버린 카드<b>${C.disc.length}</b></button></div></div>
    <button id="endTurn" ${dis?'disabled':''}>${label}</button>`;
  $('#pDraw').onclick=()=>openList('뽑을 카드 더미',[...C.draw].sort(deckSort),'순서는 섞여 있습니다');
  $('#pDisc').onclick=()=>openList('버린 카드 더미',[...C.disc]);
  $('#pExh').onclick=()=>openList('소멸한 카드',[...C.exh],'이번 전투 동안 덱에서 제외');
  if(C.log)$('#pLog').onclick=openLog;
  if($('#pEq'))$('#pEq').onclick=openEquip;
  $('#endTurn').onclick=onEnd;if($('#pFlee'))$('#pFlee').onclick=fleeTry;
  if(SET.auto&&!AUTO_RUN&&!tutA)setTimeout(autoLoop,60);
}
function openLog(){
  const C=S.C;if(!C||!C.log)return;const m=$('#modal');m.hidden=false;
  m.innerHTML=`<div class="panel" style="width:min(1300px,100%);height:100%"><div class="maphead"><div><div class="ptitle">계산 로그</div><div class="psub">주사위 · 최종 데미지 공식 · 적중률 · 판정 · 방어도 흡수 · 최종 피해</div></div><button class="btn-ghost" id="mClose">닫기</button></div>
    <div class="logl" id="logl">${C.log.map(([c,t])=>`<div class="${c}">${t}</div>`).join('')}</div></div>`;
  $('#mClose').onclick=closeModal;const l=$('#logl');l.scrollTop=l.scrollHeight;
}
function renderCombat(){if(!S.C||S.screen!=='combat')return;setTimeout(ultReadyMark,0);settleHand();renderEnemy();ultCheck();renderPlayer();renderHand();renderTop();showSelectPrompt();dainCheck()}

/* ================= hand ================= */
const handEls=new Map();
function costHTML(c){
  const k=costOf(c);
  if(k.none)return`<div class="cost none"></div>`;
  if(k.hp!=null)return`<div class="cost hp${k.down?' down':''}"><b>HP<br>${k.pct}%</b></div>`;
  return`<div class="cost${k.down?' down':''}"><b>${k.e}</b></div>`;
}
/* 카드 그림 — 사용자가 보내 주면 카드 id별로 넣음 (지금은 빈 틀) */
const CARD_ART={};
const CARD_FRONT={"어설픈 베기":"어설프게 베어 피해를 입힙니다","막기":"공격을 막습니다","숨 고르기":"카드를 뽑습니다","찌르기":"적을 가볍게 타격합니다","연속 베기":"적을 2회 타격합니다","내려찍기":"적을 강하게 타격합니다","방패 세우기":"공격을 단단히 막습니다","빈틈 노리기":"적을 타격하고 취약하게 만듭니다","레미 공방의 건빵":"체력을 조금 회복합니다","노른교의 기도":"공격을 막고 카드를 뽑습니다","몸 낮추기":"공격을 피할 준비를 하고 조금 막습니다","흘려 베기":"공격을 피할 준비를 하고 적을 타격합니다","정리":"카드를 버리고 그만큼 새로 뽑습니다","스타인러 공방의 증기 장치":"다음 턴 코스트를 늘립니다","크리밀라 공방의 모조 무구":"적을 강하게 타격하고 특수무기 카드를 가져옵니다","아쉬부티 공방의 파편 장식":"다음 카드의 코스트를 줄입니다","등반가의 갈고리":"적을 타격합니다","단련":"이번 전투 동안 공격 카드가 강해집니다","글레이프니르의 실":"적의 다음 행동을 취소합니다","드라우프니르의 파편":"패의 카드를 복제합니다","결계의 기억":"매 턴 방어도를 얻습니다","미미르의 한 모금":"카드를 많이 뽑는 대신 최대 체력을 잃습니다","베기":"깔끔하게 베어 피해를 입힙니다","갈라내기":"세게 갈라 큰 피해를 입힙니다","일섬":"순식간에 베어 피해를 입힙니다","검도-정석":"베면서 몸을 지킵니다","검도-변화":"베고, 다시 벱니다","피륙":"살을 찢어 큰 피해를 입힙니다","도려내기":"깊게 도려내 큰 피해를 입힙니다","대절단":"크게 베어 압도적인 피해를 입힙니다","더러운 참격":"체력을 써서 적을 타격합니다","동족 포식":"체력을 써서 적을 타격하고 섭취합니다","거인 베기":"체력을 써서 적을 타격합니다","탐식":"체력을 써서 3회 타격하고 체력을 회복합니다","바스라지는 날":"체력이 낮을 때만 쓸 수 있는 강한 타격입니다","굶주린 칼":"체력을 써서 타격합니다","투척-명중":"적을 맞혀 궁니르-명중을 부여합니다","투척-관통":"적을 꿰뚫습니다","미미르의 샘":"카드와 코스트를 얻는 대신 회피가 줄어듭니다","궁니르-회수":"적을 타격하고 투척 카드를 돌려받습니다","궁니르-파쇄":"궁니르-명중을 터뜨려 5회 타격합니다","파편":"적을 가볍게 타격합니다","휘두르기":"적을 타격하고 코스트를 돌려받습니다","주먹 휘두르기":"적을 타격하고 카드를 뽑습니다","던지기":"묠니르를 던져 타격합니다","회수":"던진 묠니르를 되찾으며 타격합니다","사냥":"적을 타격합니다","전격":"쌓인 전격을 터뜨려 피해를 줍니다","천둥":"전격이 쌓인 만큼 여러 번 타격합니다","점화":"카드를 뽑고 적을 불태웁니다","연소":"적의 소각을 터뜨리고 절반을 나에게 옮깁니다","레바테인-추격":"적을 타격하고 불태웁니다","레바테인-타격":"적을 강하게 타격하고 불태웁니다","고치":"다음 턴을 쉬고 그다음 턴에 크게 강해집니다","라그나로크":"적을 크게 불태우고 카드를 뽑습니다","후긴의 눈":"적 전체에 궁니르-명중을 부여합니다","무닌의 기억":"버린 투척 카드를 되찾고 카드를 뽑습니다","아홉 밤의 매달림":"체력을 바쳐 궁니르-명중 한도를 늘립니다","슬레이프니르":"8회 타격하며 궁니르-명중을 쌓습니다","메긴기요르드":"빗나갈수록 다음 공격이 강해집니다","야른그레이프르":"묠니르를 바로 되찾고 코스트와 카드를 얻습니다","염소 구이":"유희만큼 체력을 회복합니다","뇌우":"적 전체의 전격을 2배로 만듭니다","무스펠의 숨":"적 전체와 나를 불태웁니다","재가 된 이름":"적의 소각을 전부 터뜨립니다","흉내 낸 칼날":"처치한 적의 공격을 따라 합니다","꺼지지 않는 불씨":"매 턴 적을 불태웁니다","뽑힌 칼은":"체력을 써서 강하게 타격합니다","아물지 않는 상처":"체력을 써서 타격하고 적의 회복을 막습니다","신념의 균열":"체력이 낮을 때 이번 턴 체력 소모를 없앱니다","거인의 식탁":"체력을 써서 강하게 타격합니다","압력 배출":"증기를 없애고 그만큼 방어도를 얻습니다","과열 가동":"증기를 얻고 카드를 뽑습니다","냉각수 밸브":"적을 식히고 증기를 줄이며 코스트를 얻습니다","수동 피스톤":"적을 3회 타격합니다","냉기 분사":"적을 식히고 카드를 뽑습니다","온기 주머니":"냉기를 없애고 카드와 코스트를 얻습니다","체온 유지":"매 턴 냉매를 줄이고 방어도를 얻습니다","얼음 깨기":"적을 강하게 타격합니다","진열대":"예술적 감각을 얻고 카드를 뽑습니다","해설":"다음 카드 2장의 코스트를 줄이고 카드를 뽑습니다","감정서":"패의 카드에 특수능력을 붙입니다","유물 모사화":"특수무기 카드의 효과를 발동합니다","고기 수프":"체력을 회복하고 배를 채웁니다","진한 차":"코스트를 얻고 배를 조금 채웁니다","보존식":"체력을 회복하고 배를 채웁니다","레미 정식":"배를 크게 채우고 이번 전투 동안 강해집니다","모조 전격":"적을 타격하고 전격을 부여합니다","모조 소각":"적을 크게 불태웁니다","시제품":"적에게 무작위 나쁜 효과를 3개 겁니다","모조 필중":"방어도를 무시하고 반드시 맞힙니다","작품 준비":"언젠가 작품으로 완성됩니다","작품-완성":"패에 있으면 공격이 크게 강해집니다","꼬마 드워프의 망치질":"적을 타격하고 증기를 얻습니다","증기 밸브 잠금":"공격을 막고 증기를 얻습니다","압력계 확인":"공격을 막습니다","증기 장막":"공격을 피할 준비를 하고 증기를 얻습니다","응급 용접":"체력을 회복하고 증기를 얻습니다","증기 분사기":"적에게 증기를 뿜습니다","수동 크랭크":"코스트를 얻고 증기도 얻습니다","배기관 청소":"증기를 줄이고 카드를 뽑습니다","마스터의 한 수":"적을 강하게 타격합니다","마이티의 망치":"열기를 모두 써서 적을 매우 강하게 타격합니다","증기 갑주":"턴이 끝날 때 증기만큼 방어도를 얻습니다","연막 배출":"공격을 잘 피할 준비를 하고 증기를 줄입니다","장인의 휴식":"체력을 크게 회복하고 증기를 얻습니다","엘더의 조언":"카드를 많이 뽑고 증기를 얻습니다","장인의 고집":"열기 한도를 늘리고 열기가 줄지 않습니다","고드름 던지기":"적을 타격합니다","눈벽 쌓기":"공격을 막고 적을 식힙니다","냉각관 연결":"공격을 막고 적을 식힙니다","눈보라 속으로":"공격을 피할 준비를 하고 적을 식힙니다","얼음 찜질":"체력을 회복하고 냉매를 줄입니다","연차 수당":"3턴째부터 코스트와 카드를 얻습니다","따뜻한 한마디":"냉매를 줄이고 체력을 조금 회복합니다","화가 난 고참":"적을 강하게 타격합니다","눈사태":"깨짐을 모두 써서 적을 매우 강하게 타격합니다","얼음판":"공격을 잘 피할 준비를 하고 적의 다음 공격을 빗나가게 합니다","뜨거운 국물":"체력을 크게 회복하고 냉매를 없앱니다","고참의 경고":"적을 깨뜨리고 다음 공격을 빗나가게 합니다","24시간 냉각기":"매 턴 적을 식힙니다","살아남은 자":"전투가 길어질수록 공격 카드가 강해집니다","납치 권유":"적을 타격하고 다음 공격을 빗나가게 합니다","아카데미 교재":"공격을 막습니다","특색 있는 의상":"공격을 피할 준비를 하고 조금 막습니다","치유의 실":"체력을 회복합니다","곡해 주입":"적을 약화시키고 취약하게 만듭니다","억지 해석":"예술적 감각을 얻고 카드를 버립니다","실 한 가닥":"카드를 뽑습니다","고증 완료":"적을 강하게 타격합니다","실 위로 걷기":"공격을 잘 피할 준비를 하고 카드를 뽑습니다","봉합":"체력을 크게 회복하고 약화와 취약을 없앱니다","전시 개막":"예술적 감각을 크게 얻습니다","강제 강의":"적의 행동을 늦추고 취약하게 만듭니다","선택받은 실":"매 턴 카드를 더 뽑습니다","비누":"나쁜 효과를 전부 씻어내고 카드를 뽑습니다","국자 들기":"적을 타격합니다","식감 찍어내기":"공격을 막고 배를 조금 채웁니다","미끄러운 기름":"공격을 피할 준비를 하고 배를 조금 채웁니다","퇴비 수프":"체력을 회복하고 배를 채웁니다","진흙 경단":"체력을 조금 회복하고 배를 조금 채웁니다","불량 식품":"배를 채우는 대신 다음 턴 코스트가 줄어듭니다","야간 교대":"체력을 써서 카드를 뽑습니다","공방 없는 노동":"적을 3회 타격합니다","무쇠 솥":"공격을 단단히 막습니다","몸 낮춘 노동":"공격을 잘 피할 준비를 하고 체력을 회복합니다","경험 찍어내기":"체력을 회복하고 배를 채우며 카드를 뽑습니다","과식":"체력을 써서 배를 크게 채웁니다","쉬지 않는 노동":"매 턴 배를 채웁니다","기도":"공격을 막습니다","냉각통 내려놓기":"공격을 막습니다","시식":"공격을 막습니다","실 걸기":"공격을 막습니다","원전 대조":"공격을 막습니다","움츠리기":"공격을 막습니다","지팡이":"적을 타격합니다","증기 분사":"적을 타격합니다","압력 렌치":"적을 타격합니다","냉매 투척":"적을 타격합니다","국자 내려치기":"적을 타격합니다","북 던지기":"적을 타격합니다","액자 휘두르기":"적을 타격합니다","복원 망치":"적을 타격합니다","시제품 시험":"적을 타격합니다","실패작 던지기":"적을 타격합니다","주먹질":"적을 타격합니다","불씨":"적을 가볍게 타격합니다","기습":"적을 2회 타격합니다"};
const frontOf=d=>CARD_FRONT[d.name]||d.front||(d.type==='atk'?'적을 타격합니다':d.type==='def'?'공격을 막습니다':'효과를 발휘합니다');
/* 카드 뒷면 글 — 줄마다 묶고 범위 수치를 따로 표시, 패에서 힘·약화가 걸리면 공격 위력이 바뀐 값으로 보임 */
function cardLines(d,inst){const C=S.C,live=inst&&C&&!C.over&&S.screen==='combat'&&C.hand&&C.hand.includes(inst),adj=live?(C.pStr||0)-(C.pWkF||0):0;
  return d.text.split('\n').map(l=>`<span class="ln">${l.replace(/(공격 )?(\d+)~(\d+)/g,(m,p,a,b)=>p&&adj?`${p}<span class="rng ${adj<0?'dn':'up'}">${Math.max(0,+a+adj)}~${Math.max(0,+b+adj)}</span>`:`${p||''}<span class="rng">${a}~${b}</span>`)}</span>`).join('<br>')}
function facesHTML(id,costBlock,inst,n=1){
  const d=CARDS[id],nm=cardName(id,inst)+(n>1?` ×${n}`:'');const long=false;
  const rd=inst&&S.C&&S.screen==='combat'&&S.C.redef&&S.C.redef[inst.uid];
  const txt=(rd?`<span class="modline">재정의${rd.dc?` · 코스트 ${rd.dc>0?'+1':'-1'}`:''}${rd.swap?' · 공격↔방어':''}</span><br>`:'')+(inst&&S.C&&S.C.nullKinds&&S.screen==='combat'&&S.C.hand&&S.C.hand.includes(inst)&&nulled(inst)?'<span class="modline">무효로 정의됨 — 주사위 값 0</span><br>':'')+cardLines(d,inst);const dense=false;
  const tl=(d.rar==='special'?`특수무기 · ${TYPE_LABEL[d.type]}`:RAR_LABEL[d.rar]?`${RAR_LABEL[d.rar]} · ${TYPE_LABEL[d.type]}`:TYPE_LABEL[d.type]);
  return`<div class="lift"><div class="inner">
    <div class="face front r-${d.rar} gr-${cardGrade(id)||'none'} t-${d.type}">${costBlock}<div class="cname${long?' long':''}"><span>${nm}</span></div><div class="art">${CARD_ART[id]?`<img src="${CARD_ART[id]}" alt="">`:''}</div><div class="ctext"><div>${frontOf(d)}</div></div><div class="ctype">${tl}</div><div class="marks"></div></div>
    <div class="face back r-${d.rar} gr-${cardGrade(id)||'none'} t-${d.type}"><div class="bname">${nm}</div><div class="btext${dense?' dense':''}"><div>${txt}</div></div></div>
  </div></div>`;
}
/* 카드 앞면 주사위 — 전투 중이면 예상 피해 범위와 적중률을 함께 표시 */
function diceRowHTML(id,inst){
  const d=CARDS[id];if(!d.d||!d.d.length)return'';
  const C=S.C,live=inst&&C&&!C.over&&C.hand&&C.hand.includes(inst)&&S.screen==='combat';
  const g=[];for(const x of d.d){const l=g[g.length-1];if(l&&l.t===x.t&&l.a===x.a&&l.b===x.b)l.n++;else g.push({...x,n:1})}
  return g.map(x=>{let p='';
    if(live&&S.screen==='combat'){
      if(x.t==='atk'){const v=pPreview(inst,x);p=`<span><em>${v.lo}~${v.hi}</em> · 적중 ${v.ch}%</span>`}
      else if(x.t==='def'){const f=v=>Math.round(v*(pt('defUp')?1.25:1)*(pt('defDown')?.75:1));p=`<span><em>+${f(x.a)}~${f(x.b)}</em></span>`}
      else{const room=Math.max(0,EVA_DICE_CAP-C.evaB);p=`<span>적중 ${hitChance(enemyAcc(),pEva())}→<em>${hitChance(enemyAcc(),pEva()+Math.min(x.b,room))}%</em></span>`}}
    if(!p)return'';
    return`<div class="dz ${x.t}"><b>${x.t==='atk'?'예상 피해':x.t==='def'?'방어도':'적 적중'}${x.n>1?` ×${x.n}`:''}</b>${p}</div>`}).join('');
}
function staticCard(id,showBack,inst){
  const d=CARDS[id],lt=0,dainLike=!!(S.run&&S.run.mode==='dain');
  let cb;
  if(d.unplayable)cb='<div class="cost none"></div>';
  else if(dainLike){const pct=d.hpCost!=null?d.hpCost:Math.max(0,(d.cost||0)-lt)*TUNE.humanHpCostPerCost;cb=`<div class="cost hp"><b>HP<br>${pct}%</b></div>`}
  else cb=`<div class="cost${lt?' down':''}"><b>${Math.max(0,(d.cost||0)-lt)}</b></div>`;
  return`<div class="scard${showBack?' flipped':''}" tabindex="0" role="button" aria-label="${cardName(id,inst)}: ${d.text.replace(/\n/g,' ')}">${facesHTML(id,cb,inst)}</div>`;
}
function flipCard(el){if(REDUCED){el.classList.toggle('flipped');return}if(el.classList.contains('turning'))return;el.classList.add('turning');setTimeout(()=>el.classList.toggle('flipped'),150);setTimeout(()=>el.classList.remove('turning'),310)}
function bindStatic(root){root.querySelectorAll('.scard').forEach(el=>{const f=()=>flipCard(el);el.addEventListener('click',f);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}})})}
/* 같은 카드는 한 뭉치로 묶음 (찌르기 ×2) — 뭉치는 한 번에 모두 사용, 행동 포인트도 장수만큼 줄어듦 */
function stackKey(c){const C=S.C;return[c.id,(c.mods||[]).join(','),c.temp?'t':'',C.seal&&C.seal[c.uid]?'s'+C.seal[c.uid]:'',C.brand&&C.brand.includes(c.uid)?'b':'',c.w||''].join('|')}
/* 뭉치 합성 (임시) — 같은 카드 3장이 패에 모이면 합성 카드로 바뀜 */
const FUSE={ms_split:{n:3,into:'f_ryeo'},ms_flash:{n:3,into:'f_dae'}};
const fusionOpen=()=>!!(S.run&&S.run.ms&&S.run.ms.step>=5);
function handStacks(){const C=S.C,m=new Map();for(const c of C.hand){const k=stackKey(c);if(!m.has(k))m.set(k,[]);m.get(k).push(c)}
  const out=[];for(const[key,cards]of m){const f=S.screen==='combat'&&fusionOpen()&&FUSE[cards[0].id];
    if(f&&cards.length>=f.n&&!(cards[0].mods||[]).length&&!cards[0].temp){out.push({key:key+'|F',cards:cards.slice(0,f.n),fuse:f.into});if(cards.length>f.n)out.push({key,cards:cards.slice(f.n)})}
    else out.push({key,cards})}
  return out}
const fuseCanPlay=into=>{const C=S.C;return C.phase==='player'&&!C.over&&C.energy>=(CARDS[into].cost||0)};
const stackOf=uid=>{for(const[k,el]of handEls){if(el._uids&&el._uids.includes(uid))return el}return null};
function renderHand(){
  const C=S.C,hand=$('#hand'),st=handStacks(),keys=new Set(st.map(x=>x.key));
  for(const[k,el]of handEls)if(!keys.has(k)){el.remove();handEls.delete(k)}
  st.forEach(({key,cards,fuse})=>{
    const c=cards[0],n=cards.length,sig=(fuse||c.id)+'|'+n+'|'+(C.pStr||0)+'|'+(C.pWkF||0);
    let el=handEls.get(key);
    if(!el){el=document.createElement('div');el.className='card';el.dataset.key=key;el._sig='';
      const o=L[S.orient];el.style.transform=`translate(${o.W-120}px,${o.H+40}px) rotate(10deg)`;
      hand.appendChild(el);handEls.set(key,el);bindCard(el,key);}
    el._uids=cards.map(x=>x.uid);el._fuse=fuse||null;
    if(el._sig!==sig){el._sig=sig;el.innerHTML=fuse?facesHTML(fuse,`<div class="cost"><b>${CARDS[fuse].cost}</b></div>`,null,1):facesHTML(c.id,costHTML(c),c,n)}
    else if(!fuse){const cb=el.querySelector('.cost');const tmp=document.createElement('div');tmp.innerHTML=costHTML(c);cb.replaceWith(tmp.firstChild);
      const dr=el.querySelector('.dicerow');if(dr)dr.innerHTML=diceRowHTML(c.id,c)}
    el.classList.toggle('stack',n>1);el.classList.toggle('fused',!!fuse);el.dataset.n=n;el.classList.toggle('wk',!fuse&&cdef(c).type==='atk'&&(C.pWkF||0)>(C.pStr||0));
    const why=C.phase==='player'&&!C.over?(fuse?(fuseCanPlay(fuse)?null:'x'):canPlay(c)):'x';
    el.classList.toggle('cant',!!why&&C.phase==='player');
    {const ty=(fuse?CARDS[fuse]:cdef(c)).type,gt=why?'':({atk:'atk',def:'def'}[ty]||'sup');if(gt){if(el.dataset.gl!==gt)el.dataset.gl=gt}else if(el.dataset.gl)delete el.dataset.gl;}
    const marks=[];
    if(C.seal[c.uid])marks.push(`<span class="mark seal">봉인 ${C.seal[c.uid]}</span>`);
    if(C.brand.includes(c.uid))marks.push(`<span class="mark brand">낙인</span>`);
    if(c.temp)marks.push(`<span class="mark temp">복제</span>`);
    {const jm=!fuse&&jcMark(c);if(jm)marks.push(jm.m);el.classList.toggle('jc-warn',!!jm&&jm.cls==='jc-warn');el.classList.toggle('jc-lock',!!jm&&jm.cls==='jc-lock')}
    {const pk=C.select&&C.select.pick?cards.filter(x=>C.select.pick.includes(x.uid)).length:0;if(pk)marks.push(`<span class="mark temp">버림 ${pk}</span>`);el.classList.toggle('picked',pk>0)}
    el.querySelector('.marks').innerHTML=marks.join('');
    el.classList.toggle('sealed',!!C.seal[c.uid]);
  });
  requestAnimationFrame(layoutHand);
}
function handPos(i,n){
  const o=L[S.orient],cw=16.8*o.cfs,ch=23.6*o.cfs,mid=(n-1)/2,off=i-mid;
  /* 겹친 카드 뭉치 — 부채꼴로 겹쳐 펼치고, 마우스를 올린 카드만 앞으로 나옴 */
  if(S.orient==='land'){
    const hw=760-(UIZ-1)*300,hc=800-(UIZ-1)*50,sp=n>1?Math.min(cw*.98,(hw-cw)/(n-1)):0,rr=Math.min(4,24/Math.max(1,n));
    return{x:hc-cw/2+off*sp,y:o.H-ch*.92+off*off*2.2,r:off*rr};
  }
  const sp=n>1?Math.min(cw*.92,(860-cw)/(n-1)):0,rr=Math.min(5,30/Math.max(1,n));
  return{x:450-cw/2+off*sp,y:handPortY()+Math.min(60,off*off*3),r:off*rr};
}
function layoutHand(){
  const C=S.C;if(!C)return;
  const st=handStacks(),n=st.length;
  st.forEach(({key},i)=>{const el=handEls.get(key);if(!el||el.classList.contains('dragging')||el.classList.contains('zoom'))return;
    const p=handPos(i,n);el.style.transform=`translate(${p.x}px,${p.y}px) rotate(${p.r}deg)`;el.style.zIndex=10+i;});
}
/* 뭉치는 묶음 표시 — 쓰면 1장만 나가고 나머지는 패에 남음 */
async function playStack(uids){return playCard(uids[0])}
async function playFused(uids,into){
  const C=S.C;if(!fuseCanPlay(into)||S.busy)return;
  const cards=uids.map(u=>C.hand.find(x=>x.uid===u)).filter(Boolean);if(cards.length<uids.length)return;
  /* 대절단: 합성에 쓴 카드는 3턴 뒤에 버린 패로 돌아옴 */
  for(const c of cards){C.hand.splice(C.hand.indexOf(c),1);if(into==='f_dae')(C.lockDisc=C.lockDisc||[]).push({c,t:C.turn+3});else C.disc.push(c)}
  const f={uid:UID++,id:into,mods:[],fusedTmp:true};C.hand.push(f);
  clog(`합성: ${CARDS[cards[0].id].name} ${cards.length}장 → 「${CARDS[into].name}」`,'h');toast('합성',`「${CARDS[into].name}」`);
  try{await playCardRaw(f.uid,{noTick:true})}catch(e){console.error(e);clog('오류: '+e.message,'e')}finally{S.busy=false}
  for(const a of[C.disc,C.exh,C.hand]){const i=a.indexOf(f);if(i>=0)a.splice(i,1)}
  tutEvent('fuse');
  if(S.C===C&&!C.over&&!C.dead&&S.run.hp>0)await apTick(CARDS[into].ap||1);
  if(S.C&&!S.C.over)renderCombat();
}
let drag=null;
function bindCard(el,key){
  const first=()=>{const C=S.C;return C&&el._uids?C.hand.find(x=>x.uid===el._uids[0]):null};
  el.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!drag)el.classList.add('hover')});
  el.addEventListener('pointerleave',()=>el.classList.remove('hover'));
  el.addEventListener('pointerdown',e=>{
    if(drag&&(!document.contains(drag.el)||drag.el===el))drag=null;
    if(e.button>0||drag)return;
    const C=S.C;if(!C||C.over)return;
    const c=first();if(!c)return;
    if(C.select){if(c){doSelect(c)}return}
    if(tutLocked('card',c))return;
    drag={el,sx:e.clientX,sy:e.clientY,moved:false,zoomed:el.classList.contains('zoom')};
    /* 길게 누르기: 끌지 않고 그 자리에서 길게 누르면 카드가 확대되어 화면 정중앙에 놓임 */
    if(!drag.zoomed)drag.lp=setTimeout(()=>{if(drag&&drag.el===el&&!drag.moved){drag.long=true;zoomCard(el,true)}},450);
    try{el.setPointerCapture(e.pointerId)}catch(err){}
  });
  el.addEventListener('pointermove',e=>{
    if(!drag||drag.el!==el)return;
    const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;
    if(el.classList.contains('flipped')&&!drag.moved){const bt=el.querySelector('.btext');if(bt&&bt.scrollHeight>bt.clientHeight+2&&Math.abs(dy)>4){if(drag.st0==null)drag.st0=bt.scrollTop;bt.scrollTop=drag.st0-dy/(S.scale||1);drag.scrolled=true;clearTimeout(drag.lp);return}}
    if(!drag.moved&&Math.hypot(dx,dy)>5){drag.moved=true;clearTimeout(drag.lp);drag.single=!el._fuse&&(el._uids||[]).length>1;if(drag.long||drag.zoomed)showDragInfo(first());if(el.classList.contains('zoom'))zoomCard(el,false);el.classList.add('dragging');el.classList.toggle('single',drag.single);el.classList.remove('hover');if(S.tb)stage.classList.add('tbdrag')}
    if(!drag.moved)return;
    const o=L[S.orient],cw=16.8*o.cfs,ch=23.6*o.cfs;const pt=stageXY(e);
    el.style.transform=`translate(${pt.x-cw/2}px,${pt.y-ch*.55}px) rotate(0deg)`;
    const inZone=pt.y<o.dropY;
    const C=S.C,c=first();const ok=inZone&&c&&C.phase==='player'&&(el._fuse&&!drag.single?fuseCanPlay(el._fuse):!canPlay(c))&&!S.busy;
    el.classList.toggle('armed',ok);{$('#enemy').classList.toggle('target',ok);
      const ff=c&&C.phase==='player'&&!S.busy&&!canPlay(c)&&!(el._fuse&&!drag.single)?(foeAt(e.clientX,e.clientY)||(inZone?C.E:null)):null;
      const pk=ff?c.uid+'|'+(drag.single?1:(el._uids||[]).length)+'|'+foes().indexOf(ff):'';if(drag.pk!==pk){drag.pk=pk;hpPreview(ff?c:null,drag.single?1:(el._uids||[]).length,ff)}}
  });
  const up=e=>{
    if(!drag||drag.el!==el)return;
    const d=drag;drag=null;clearTimeout(d.lp);showDragInfo(null);hpPreview(null);stage.classList.remove('tbdrag');el.classList.remove('dragging','armed','single');$('#enemy').classList.remove('target');
    if(!d.moved){if(d.scrolled)return;if(d.long&&!d.zoomed)return;if(d.zoomed){zoomCard(el,false);return}flipCard(el);tutEvent('flip');return}
    if(tutLocked('drag')){layoutHand();return}
    const pt=stageXY(e),o=L[S.orient];
    const C=S.C;
    if(e.type==='pointerup'&&C&&C.phase==='player'&&!S.busy&&!C.over){const ff=foeAt(e.clientX,e.clientY);if(ff)setTarget(ff)}
    if(e.type==='pointerup'&&(pt.y<o.dropY||foeAt(e.clientX,e.clientY))&&C&&C.phase==='player'&&!S.busy&&!C.over){if(el._fuse&&!d.single)playFused(el._uids.slice(),el._fuse);else playStack(d.single?el._uids.slice(0,1):el._uids.slice())}
    else layoutHand();
  };
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
}
/* V30 드래그 중 예상 체력 — 상대 위에 올리면 공격 후 남을 체력 범위를 체력 막대에 보여 줌 */
function hpPreview(c,n,f){
  document.querySelectorAll('.hppv,.hppvt').forEach(x=>x.remove());
  const C=S.C;if(!c||!C||!f||!alive(f)||S.screen!=='combat')return;
  const d=cdef(c),dice=(d.d||[]).filter(x=>x.t==='atk');if(!dice.length)return;
  const prev=C.E;C.E=f;let lo=0,hi=0,ch=100;
  try{for(const x of dice){const v=pPreview(c,x);lo+=v.lo;hi+=v.hi;ch=v.ch}}catch(e){C.E=prev;return}
  const o=(()=>{try{return cardStrikeOpts(c)}catch(e){return{}}})();C.E=prev;
  lo*=n;hi*=n;const bl=o.pierce?0:(f.block||0);
  const aLo=Math.max(0,f.hp-Math.max(0,hi-bl)),aHi=Math.max(0,f.hp-Math.max(0,lo-bl));
  let bar=null;
  if(foes().length>1){const i=foes().indexOf(f);bar=document.querySelector(`#foefigs .ufoe[data-foe="${i}"] .fhp`)}
  if(!bar)bar=f===C.E?document.querySelector('#eplate .ebar'):null;if(!bar)return;
  const P=v=>clamp(v/f.maxHp*100,0,100);
  const seg=document.createElement('b');seg.className='hppv';seg.style.left=P(aLo)+'%';seg.style.width=(P(f.hp)-P(aLo))+'%';
  const sure=document.createElement('b');sure.className='hppv sure';sure.style.left=P(aHi)+'%';sure.style.width=(P(f.hp)-P(aHi))+'%';
  bar.append(seg,sure);
  const t=document.createElement('div');t.className='hppvt';
  t.innerHTML=`${f.hp} → <b>${aLo===aHi?aLo:`${aLo}~${aHi}`}</b>${aLo<=0?(aHi<=0?' <em>처치</em>':' <em>처치 가능</em>'):''} · 적중 ${ch}%${dice.length*n>1?` · ${dice.length*n}회`:''}`;
  bar.after(t);
}
function showDragInfo(c){let el=$('#dragInfo');if(!c){if(el)el.remove();return}
  if(!el){el=document.createElement('div');el.id='dragInfo';$('#stage').appendChild(el)}
  const d=CARDS[c.id];el.innerHTML=`<b>${cardName(c.id,c)}</b>${d.text.replace(/\n/g,' · ')}`}
function zoomCard(el,on){
  if(on)tutEvent('zoom');
  handEls.forEach(x=>{if(x!==el&&x.classList.contains('zoom')){x.classList.remove('zoom')}});
  if(on){const o=L[S.orient],cw=16.8*o.cfs,ch=23.6*o.cfs,k=S.orient==='land'?2.3*CFS0.land/o.cfs:2.2*CFS0.port/o.cfs;
    el.classList.add('zoom');el.classList.remove('hover');el.style.zIndex=60;
    el.style.transform=`translate(${o.W/2-cw/2}px,${o.H/2-ch/2-(S.orient==='land'?20:120)}px) scale(${k})`}
  else{el.classList.remove('zoom');layoutHand()}
}
/* 버리기 — 카드 효과로 버린 장수는 이번 턴·이번 전투 동안 셈 */
function tossCards(list){const C=S.C;for(const c of list){const i=C.hand.indexOf(c);if(i<0)continue;C.hand.splice(i,1);C.disc.push(c);C.tossed=(C.tossed||0)+1;C.tossTurn=(C.tossTurn||0)+1}renderCombat()}
function pickToss(max,label){const C=S.C;if(!C.hand.length)return Promise.resolve(0);
  return new Promise(res=>{C.select={type:'toss',max:Math.min(max,C.hand.length),n:0,label,done:res};S.busy=false;renderCombat()}).then(n=>{S.busy=true;return n})}
function finishToss(){const C=S.C,s=C&&C.select;if(!s||s.type!=='toss')return;const list=C.hand.filter(x=>(s.pick||[]).includes(x.uid));C.select=null;$('#prompt').hidden=true;tossCards(list);s.n=list.length;clog(`${s.label}: ${s.n}장 버림`);renderCombat();s.done(s.n)}
/* 패 초과 버림도 고른 뒤 확인을 눌러야 버려짐 */
const overHand=()=>{const C=S.C,fz=fusionOpen()?handStacks().filter(x=>x.fuse).length*2:0;return Math.max(0,C.hand.length-fz-MAX_HAND)};
function finishDiscard(){const C=S.C,s=C&&C.select;if(!s||s.type!=='discard'||(s.pick||[]).length<overHand())return;for(const c of C.hand.filter(x=>s.pick.includes(x.uid))){C.hand.splice(C.hand.indexOf(c),1);C.disc.push(c);if(C.log)clog(`패 초과: 「${CARDS[c.id].name}」 버림`)}C.select=null;$('#prompt').hidden=true;renderCombat()}
/* 고르기: 같은 뭉치는 누를 때마다 1장씩 더 고르고, 한도에 닿으면 1장 뺌 */
function togglePick(c,max){const C=S.C,s=C.select,pk=s.pick=s.pick||[],same=C.hand.filter(x=>stackKey(x)===stackKey(c)),free=same.find(x=>!pk.includes(x.uid));if(free&&pk.length<max)pk.push(free.uid);else{const on=[...same].reverse().find(x=>pk.includes(x.uid));if(on)pk.splice(pk.indexOf(on.uid),1)}}
function doSelect(c){
  const C=S.C;if(!C.select)return;
  if(C.select.type==='toss'){
    togglePick(c,C.select.max);
  }else if(C.select.type==='discard'){
    togglePick(c,overHand());
  }
  $('#prompt').hidden=true;renderCombat();
}
function showSelectPrompt(){
  const C=S.C,p=$('#prompt');
  if(C&&C.select&&C.select.type==='toss'){p.hidden=false;p.innerHTML=`<span>${C.select.label} — 버릴 카드를 패에서 고른다 <b>${(C.select.pick||[]).length} / ${C.select.max}</b></span><button class="plate-btn" id="tossDone">확인</button>`;$('#tossDone').onclick=finishToss}
  else if(C&&C.select&&C.select.type==='discard'){p.hidden=false;p.innerHTML=`<span>패가 ${MAX_HAND}장을 넘었다 — 버릴 카드를 패에서 고른다 <b>${(C.select.pick||[]).length} / ${overHand()}</b></span><button class="plate-btn" id="discDone" ${(C.select.pick||[]).length<overHand()?'disabled':''}>확인</button>`;$('#discDone').onclick=finishDiscard}
  else if(C&&C.select){p.hidden=false;p.innerHTML=`복제할 카드를 패에서 고른다 <button class="plate-btn" id="selCancel">취소</button>`;$('#selCancel').onclick=()=>{C.select=null;p.hidden=true;renderCombat()}}
  else p.hidden=true;
}

/* ================= modal lists & enemy info ================= */
function openList(title,cards,note,f='전체'){
  const m=$('#modal');m.hidden=false;const L2=cards.filter(c=>cfPass(c,f));
  m.innerHTML=`<div class="panel" style="width:min(1300px,100%);height:100%"><div class="maphead"><div><div class="ptitle">${title}</div><div class="psub">${cards.length}장${note?` · ${note}`:''} · 카드를 누르면 뒤집힌다</div></div>${cfBar(f)}<button class="btn-ghost" id="mClose">닫기</button></div>
    <div class="cardgrid">${L2.length?L2.map(c=>staticCard(c.id,false,c)).join(''):'<div class="hint">비어 있습니다</div>'}</div></div>`;
  bindStatic(m);$('#mClose').onclick=closeModal;$('#mClose').focus();
  m.querySelectorAll('[data-cf]').forEach(b=>b.onclick=()=>openList(title,cards,note,b.dataset.cf));
}
function closeModal(){const m=$('#modal');m.hidden=true;m.innerHTML='';m.classList.remove('scn','scn-sky','scn-dark','scn-lite','side');document.querySelectorAll('.aside').forEach(x=>x.classList.remove('aside'));S.modalLock=false}

/* 적 상태창 (V2.31.55.14) — 적을 누르면 림버스처럼 적이 옆으로 비켜서고 상태창이 열림 */
function foeOrbs(f){if(f.noAct)return'';const pip=(n,m,cls)=>`<div class="or ${cls}">${[...Array(Math.max(0,m||0))].map((_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}<b>${Math.max(0,n||0)} / ${m||0}</b></div>`;return`<div class="forbs">${pip(f.c,f.cMax,'c')}${pip(f.ap,f.apMax,'a')}</div>`}
const FK_COL={atk:'#a8473b',def:'#3c6a96',sup:'#4c8442'};
function openFoePanel(f){const C=S.C;if(!C||drag||!f||!alive(f))return;const d=ENEMY[f.key];
  document.querySelectorAll('.aside').forEach(x=>x.classList.remove('aside'));
  const all=foes(),i=all.indexOf(f),fig=f===C.E?$('#enemy'):document.querySelector(`#foefigs .ufoe[data-foe="${i}"]`);if(fig)fig.classList.add('aside');
  if(!f.kinds){f.kinds=[...new Set(foeActs(f))]}
  const deckAll=[...(f.fdeck||[]),...(f.fdisc||[]),...(f.hand||[])],cnt=n=>deckAll.filter(x=>x===n).length;
  const m=$('#modal');m.hidden=false;m.classList.add('side');
  const used=(f.used||[]).slice(-8).reverse();
  m.innerHTML=`<div class="panel fpanel"><div class="maphead"><div><div class="psub">${({normal:'일반',elite:'정예',boss:'보스'})[f.tier]||''} · Lv ${f.lv}</div><div class="ptitle">${f.name}</div></div><button class="btn-ghost" id="mClose">닫기</button></div>
    <div class="fp-grid"><div data-st="hp"><span>체력</span><b>${Math.max(0,f.hp)} / ${f.maxHp}</b></div><div data-st="block"><span>방어도</span><b>${f.block||0}</b></div>
      ${f.noAct?'':`<div data-st="c"><span>코스트</span><b>${f.c??0} / ${f.cMax??0}</b></div><div data-st="ap"><span>행동 포인트</span><b>${f.ap??0} / ${f.apMax??0}</b></div>`}
      <div data-st="atk"><span>공격레벨</span><b>${f.atk}</b></div><div data-st="def"><span>방어레벨</span><b>${f.def}</b></div>
      <div data-st="acc"><span>명중률</span><b>${f.acc}%</b></div><div data-st="eva"><span>회피</span><b>${f.eva+(f.evaB||0)}%</b></div>
      <div data-st="hit" class="wide"><span>내 적중률</span><b>${hitChance(pAcc(),f.eva+(f.evaB||0))}%</b></div></div>
    ${f.noAct?'':`<div class="fp-hand" data-st="hand"><span>패</span><div>${(f.hand||[]).map(n=>`<button class="fh" data-n="${n}" style="background:${FK_COL[actType(n)]}"><i>${actCost(n)}</i>${n}</button>`).join('')||'<em>없음</em>'}</div></div>`}
    ${f.ultArmed?`<div class="ult-prev"><small>궁극기 준비</small><b>${f.ultArmed}</b><span>코스트 ${actCost(f.ultArmed)} · ${actText(f.ultArmed)}</span></div>`:''}
    <div class="plist">${(d.passives||[]).map(([n,t])=>`<div data-pas="${n}"><b>${n}</b>${t}</div>`).join('')}${(f.traits||[]).map(t=>`<div><b>특성 · ${t}</b>${TRAITS[t]?TRAITS[t].text:''}</div>`).join('')}</div>
    <div class="fks">${f.kinds.map(n=>{const sn=!!FOE_SEEN[n];return`<button class="fk${sn?' on':''}${ACT[n]&&ACT[n].ult?' ult':''}" data-n="${n}" style="${sn?`background:${FK_COL[actType(n)]}`:''}" aria-label="${sn?n:'아직 보지 못한 카드'}">${sn?'':'?'}<span class="fl">×${sn?cnt(n):'?'}</span><span class="fr">${sn?actCost(n):'?'}</span><small>${sn?n:'?'}</small></button>`}).join('')}</div>
    <div class="fp-eff" id="fpEff"></div>
    <div class="fp-log">${used.length?used.map(u=>`<div>${u.t}턴 · ${u.n}</div>`).join(''):'<div class="hint">아직 쓴 카드가 없다</div>'}</div></div>`;
  m.querySelectorAll('.fk,.fh').forEach(b=>b.onclick=e=>{e.stopPropagation();const n=b.dataset.n;$('#fpEff').textContent=FOE_SEEN[n]?`${n} — ${actText(n)}`:'아직 보지 못한 카드'});
  $('#mClose').onclick=closeModal;tbEv('foePanel')}
/* 내 상태창 — 내 캐릭터(왼쪽 아래)를 누르면 열림, 공격레벨·방어레벨·명중률·회피는 여기서 봄 */
function openMePanel(){const C=S.C,r=S.run;if(!C||drag)return;
  const m=$('#modal');m.hidden=false;m.classList.add('side');const W=r.mode==='human'&&WEAPON[r.weapon];
  m.innerHTML=`<div class="panel fpanel mepanel"><div class="maphead"><div><div class="psub">${r.mode==='dain'?'Lv 1 고정':`Lv ${r.lvl}`}</div><div class="ptitle">${r.mode==='dain'?'다인슬레이프':r.mode==='thor'?'묠니르 (토르)':r.mode==='odin'?'궁니르 (오딘)':'일반인'}</div></div><button class="btn-ghost" id="mClose">닫기</button></div>
    <div class="fp-grid"><div data-st="hp"><span>체력</span><b>${Math.max(0,r.hp)} / ${r.maxHp}</b></div><div data-st="block"><span>방어도</span><b>${C.block||0}</b></div>
      <div data-st="atk"><span>공격레벨</span><b>${pAtk()}</b></div><div data-st="def"><span>방어레벨</span><b>${pDef()}</b></div>
      <div data-st="acc"><span>명중률</span><b>${pAcc()}%</b></div><div data-st="eva"><span>회피</span><b>${pEva()+(C.evaB||0)}%</b></div></div>
    ${W?`<div class="plist"><div data-pas="weapon"><b>${W.n}</b>${W.t}</div></div>`:''}</div>`;
  $('#mClose').onclick=closeModal;tbEv('mePanel')}

function openEnemyInfo(){
  const C=S.C;if(!C||drag)return;const E=C.E,d=ENEMY[E.key],r=S.run;
  const m=$('#modal');m.hidden=false;
  const acts=d.order?[...d.order,...(d.order2||[])]:E.boss?['미스틸테인','백색의 불꽃','은빛 소환','공양의 칼','안 아프게 빨리','노동']:Object.keys(d.acts);
  m.innerHTML=`<div class="panel" style="width:min(820px,100%)"><div class="maphead"><div><div class="psub">${({normal:'일반',elite:'정예',boss:'보스'})[E.tier]}</div><div class="ptitle">${E.name}${E.sub?` <span class="psub">(${E.sub})</span>`:''}</div></div><button class="btn-ghost" id="mClose">닫기</button></div>
    <div style="display:flex;gap:34px;flex-wrap:wrap">
    <div class="stattable"><span>레벨</span><span>${E.lv}</span><span>체력</span><span>${Math.max(0,E.hp)} / ${E.maxHp}</span><span>공격레벨</span><span>${E.atk}</span><span>방어레벨</span><span>${E.def}</span><span>명중률</span><span>${enemyAcc()}%</span><span>회피</span><span>${E.eva}%</span>
      <span>내 적중률</span><span>${hitChance(pAcc(),E.eva+E.evaB)}%</span><span>적의 적중률</span><span>${hitChance(enemyAcc(),pEva())}%</span></div>
    <div class="plist" style="flex:1;min-width:0">
      ${(d.passives||[]).map(([n,t])=>`<div><b>${n}</b>${t}</div>`).join('')}
      ${E.traits.map(t=>`<div><b>특성 · ${t}</b>${TRAITS[t].text}</div>`).join('')}
      <div><b>행동</b>${acts.map(n=>{const a=ACT[n];return`${n}${a.d?` (${a.d.map(x=>`${DIE_NAME[x.t]} ${x.a===x.b?x.a:`${x.a}~${x.b}`}`).join(', ')})`:''}`}).join(' · ')}</div></div></div></div>`;
  $('#mClose').onclick=closeModal;
}
$('#enemy').addEventListener('click',()=>{if(S.C)openFoePanel(S.C.E)});
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal'&&!S.modalLock)closeModal()});
addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('#modal').hidden){if(!S.modalLock)closeModal();return}
  if((e.key==='e'||e.key==='E')&&$('#modal').hidden){if(S.screen==='combat')endTurn()}
});

