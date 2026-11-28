"use strict";
/* ================= title / end screens ================= */
const SET=(()=>{try{return Object.assign({shake:true,tips:true,sound:true},JSON.parse(localStorage.getItem('ash-midgard-settings')||'{}'))}catch(e){return{shake:true,tips:true,sound:true}}})();
function saveSet(){try{localStorage.setItem('ash-midgard-settings',JSON.stringify(SET))}catch(e){}}
/* UI 크기 — 작게(기본) · 크게 · 매우 크게. 패널 · 버튼 · 패 카드가 함께 커짐 */
const UI_SIZE={s:{n:'작게',z:1,cl:1,cp:1,m:1},l:{n:'크게',z:1.2,cl:1.15,cp:1.1,m:1.2},x:{n:'매우 크게',z:1.4,cl:1.3,cp:1.2,m:1.3}},UI_NEXT={s:'l',l:'x',x:'s'};
const CFS0={land:L.land.cfs,port:L.port.cfs},DROP0={land:L.land.dropY,port:L.port.dropY};let UIZ=1;
function applyUI(){const u=UI_SIZE[SET.ui]||UI_SIZE.s;UIZ=u.z;stage.style.setProperty('--uiz',u.z);stage.style.setProperty('--uic',u.cl);stage.style.setProperty('--uip',u.cp);stage.style.setProperty('--uim',u.m);if(u.z>1)stage.dataset.ui=SET.ui;else delete stage.dataset.ui;
  L.land.cfs=CFS0.land*u.cl;L.port.cfs=CFS0.port*u.cp;
  L.land.dropY=DROP0.land-23.6*CFS0.land*(u.cl-1)*.92;L.port.dropY=handPortY()-32;
  if(S.C&&S.screen==='combat'){positionScene();renderCombat();layoutHand()}}
function handPortY(){return 1523-156*UIZ-23.6*L.port.cfs}
function openScreen(html,o={}){const sc=$('#screen');sc.hidden=false;sc.className=o.dim?'dim':'';sc.style.top=o.full?'0':'';sc.innerHTML=html;return sc}

/* 1. 타이틀 */
function showTitle(o={}){setTimeout(guideShow,0);
  S.screen='title';S.run=null;S.C=null;hideCombatUI();renderTop();closeModal();
  $('#redout').className='';
  const menu=!!o.menu;S.titleMenu=menu;const cs=loadSave();
  viewFor('title');startTitleScene();
  const sc=openScreen(`<div class="ttl${menu?' menu':''}" id="ttl" ${menu?'':'tabindex="0" role="button" aria-label="시작"'}>
    ${menu?`<div class="ttl-menu" style="${o.animate&&!REDUCED?'animation-delay:.25s':''}">
      ${slotCount()?`<button class="mbtn" id="mCont">이어하기<small>세계선 ${slotCount()} / ${SLOT_MAX}</small></button>`:''}
      ${false&&cs?`<button class="mbtn" id="mContC">이어하기 · 세계수 등반<small>${(CDIFF[cs.diff]||CDIFF.easy).n} · ${cs.act===2?`2장 니다벨리르 · ${cs.floor||0}막`:`${cs.floor} / ${ROWS}막`} · ${cs.mode==='dain'?'다인모드':`Lv ${cs.lvl}`}</small></button>`:''}
      <button class="mbtn" id="mClimb">세계수 등반<small>일반인으로 시작해 세계수를 오른다</small></button>
      <button class="mbtn" id="mTrain">훈련장<small>모든 카드를 써 볼 수 있다 · 본 게임과 별개</small></button>
      <button class="mbtn" id="mVault">보관함<small>${memoSeen().length?`${memoSeen().length}장`:'아직 모은 것이 없다...'}</small></button>
      <button class="mbtn" id="mSet">설정<small>${PATCH[0][0]} · 패치 내역은 설정에서</small></button></div>`:`<div class="ttl-tap" id="ttlTap">게임 시작</div>`}</div>`,{full:true});
  if(!menu){
    const el=$('#ttl');el.focus({preventScroll:true});
    const go=()=>{if(S.screen!=='title')return;showTitle({menu:true,animate:true})};
    el.addEventListener('click',go);
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
  }else{
    $('#mClimb').onclick=()=>{endTitleScene();tbAsk()};$('#mTrain').onclick=()=>{endTitleScene();openTrain()};$('#mSet').onclick=openSettings;$('#mVault').onclick=()=>openVault();
    if($('#mCont'))$('#mCont').onclick=()=>{endTitleScene();openSlots('load')};
    if(false)$('#mContC').onclick=()=>{S.run=migrateRun(cs);syncUID();transition(resumeAt)};
  }
}
