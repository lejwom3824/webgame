
"use strict";
/* ================= 저장 — 세계선 (V2.37.79.22) =================
   세계선 = 한 판의 저장 묶음, 최대 10개 · 세계선마다 맨 위 칸이 자동 저장, 그 아래 직접 저장 칸
   자동 저장은 진행할 때마다 덮어쓰고, 지도에 설 때마다(막에 들어가기 전) 되돌아갈 지점도 함께 남김
   사망하면 그 막에 들어가기 전으로 돌아감 · 중단하기로는 지우지 않음 · 세계선 삭제는 두 번 눌러야 함 */
const WL_MAX=10,WL_MAN=5,SLOT_MAX=WL_MAX;
const WL_IDX='ash-midgard-wl-v1',WL_A=id=>'ash-midgard-wl-'+id+'-a',WL_P=id=>'ash-midgard-wl-'+id+'-p',WL_M=(id,k)=>'ash-midgard-wl-'+id+'-m'+k;
const OLD_SLOT=i=>'ash-midgard-slot-'+i,OLD_SLOT_N=20;
const newRid=()=>Date.now().toString(36)+Math.floor(rnd()*1e6).toString(36);
function wlGet(k){try{const s=localStorage.getItem(k);return s?JSON.parse(s):null}catch(e){return null}}
function wlPut(k,o,quiet){try{localStorage.setItem(k,JSON.stringify(o));return true}catch(e){if(!quiet)toast('저장','저장 공간이 부족하다 — 세계선 하나를 삭제한 뒤 다시 저장한다');return false}}
function wlIds(){const a=wlGet(WL_IDX);return Array.isArray(a)?a:[]}
function wlSetIds(a){wlPut(WL_IDX,a,true)}
function wlCount(){return wlIds().length}
const slotCount=wlCount;
function wlAdd(id){const a=wlIds();if(!a.includes(id)){a.push(id);wlSetIds(a)}}
function wlDel(id){try{localStorage.removeItem(WL_A(id));localStorage.removeItem(WL_P(id));for(let k=1;k<=WL_MAN;k++)localStorage.removeItem(WL_M(id,k))}catch(e){}wlSetIds(wlIds().filter(x=>x!==id))}
const runCopy=r=>{const d=JSON.parse(JSON.stringify(r));delete d.slot;delete d.autoSlot;return d};
const atMap=r=>S.screen==='map'&&!r.at;
/* 이전 저장(저장 기록 20칸)을 세계선으로 옮김 — 같은 이야기(rid)끼리 묶고, 지우는 것 없이 전부 옮김 */
(function wlMigrate(){try{
  {const c=localStorage.getItem(SAVE_KEY);if(c){const d=JSON.parse(c);if(!d.rid)d.rid=newRid();if(wlPut(WL_A(d.rid),{t:Date.now(),data:runCopy(d)},true)){wlAdd(d.rid);localStorage.removeItem(SAVE_KEY)}}}
  const old=[];for(let i=0;i<OLD_SLOT_N;i++){const x=wlGet(OLD_SLOT(i));if(x)old.push([i,x])}
  if(!old.length)return;
  const grp={};for(const[i,x]of old){if(x.kind!=='climb'||!x.data){try{localStorage.removeItem(OLD_SLOT(i))}catch(e){}continue}if(!x.data.rid)x.data.rid=newRid();(grp[x.data.rid]=grp[x.data.rid]||[]).push([i,x])}
  for(const rid in grp){const g=grp[rid].sort((p,q)=>(q[1].t||0)-(p[1].t||0));
    let rest=g.slice();const au=g.find(([,x])=>!x.manual)||g[0];rest=rest.filter(e=>e!==au);
    const lines=[[rid,au,rest.slice(0,WL_MAN)]];for(let j=WL_MAN;j<rest.length;j+=WL_MAN+1){const ch=rest.slice(j,j+WL_MAN+1);lines.push([newRid(),ch[0],ch.slice(1)])}
    for(const[id,a,ms]of lines){const d=runCopy(a[1].data);d.rid=id;let ok=wlPut(WL_A(id),{t:a[1].t||Date.now(),data:d},true);
      ms.forEach(([,x],k)=>{const md=runCopy(x.data);md.rid=id;ok=wlPut(WL_M(id,k+1),{t:x.t||Date.now(),data:md},true)&&ok});
      if(!ok)return;wlAdd(id)}
    for(const[i]of g){try{localStorage.removeItem(OLD_SLOT(i))}catch(e){}}}
}catch(e){}})();
/* 자동 저장 — 세계선의 맨 위 칸. 지도에 서 있으면(막에 들어가기 전) 되돌아갈 지점도 덮어씀 */
save=function(){const r=S.run;if(!r||r.tutB||r.train||S.runDead===r)return false;if(!r.rid)r.rid=newRid();delete r.slot;
  const d=runCopy(r),t=Date.now();if(!wlPut(WL_A(r.rid),{t,data:d}))return false;wlAdd(r.rid);
  if(atMap(r))wlPut(WL_P(r.rid),{t,data:d},true);return true};
loadSave=function(){const r=S.run;if(!r||!r.rid)return null;const x=wlGet(WL_A(r.rid));return x?x.data:null};
clearSave=function(){};
/* 사망 — 자동 저장을 그 막에 들어가기 전으로 되돌림 (지운 것 없음) */
function deathSave(){const r=S.run;if(!r||r.tutB||r.train)return false;S.runDead=r;if(!r.rid)return false;const p=wlGet(WL_P(r.rid));
  if(!p)return false;wlPut(WL_A(r.rid),{t:Date.now(),data:p.data},true);return true}
function deathBack(){const r=S.runDead||S.run,id=r&&r.rid,p=id?wlGet(WL_P(id)):null;if(!p)return showTitle({menu:true});
  closeModal();S.runDead=null;S.C=null;S.busy=false;S.run=migrateRun(JSON.parse(JSON.stringify(p.data)));syncUID();transition(resumeAt)}
function deathBtns(){const r=S.run,ok=!!(r&&r.rid&&wlGet(WL_P(r.rid)));
  return `<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">${ok?'<button class="btn-main" id="goBack">막에 들어가기 전으로</button>':''}<button class="${ok?'btn-ghost':'btn-main'}" id="goT">처음으로</button></div>`}
function deathBind(){if($('#goBack'))$('#goBack').onclick=deathBack;$('#goT').onclick=()=>showTitle({menu:true})}
/* 직접 저장 — 지금 세계선의 칸을 골라 저장. 전투 중이면 그 전투를 시작한 시점, 함께 되돌아갈 지점도 담음 */
function manualSave(k){const r=S.run;if(!r)return false;if(!r.rid)r.rid=newRid();const d=runCopy(r);
  const p=atMap(r)?null:wlGet(WL_P(r.rid));return wlPut(WL_M(r.rid,k),{t:Date.now(),data:d,pre:p?p.data:null})}
function wlLoad(id,k){const x=k?wlGet(WL_M(id,k)):wlGet(WL_A(id));if(!x)return;closeModal();
  if(k){if(x.pre)wlPut(WL_P(id),{t:x.t,data:x.pre},true);else if(!x.data.at)wlPut(WL_P(id),{t:x.t,data:x.data},true)}
  const d=JSON.parse(JSON.stringify(x.data));d.rid=id;S.runDead=null;S.run=migrateRun(d);syncUID();transition(resumeAt)}
function slotDesc(x){const d=x.data||{};
  return{n:'세계수 등반',s:`${(CDIFF[d.diff]||CDIFF.easy).n} · ${d.act===2?`2장 니다벨리르 · ${d.floor||0}막`:`1장 · ${d.floor||0} / ${ROWS}막`} · ${d.mode==='dain'?'다인모드':`Lv ${d.lvl||1}`}`}}
function slotTime(t){if(!t)return'';const d=new Date(t),z=n=>String(n).padStart(2,'0');return`${d.getMonth()+1}/${d.getDate()} ${z(d.getHours())}:${z(d.getMinutes())}`}
/* 새로 시작 — 빈 세계선이 있으면 바로, 10개가 다 찼으면 세계선 삭제로 비운 뒤 시작 */
function slotStart(go){if(wlCount()<WL_MAX)return go();openSlots('over',null,go)}
function openSlots(mode,back,go){
  const m=$('#modal');m.hidden=false;const ids=wlIds(),n=ids.length,over=mode==='over',sv=mode==='save',cur=sv?S.run:null;
  const row=(lab,x,btn)=>x?`<div class="slotrow"><span class="slotno">${lab[0]}</span><div class="slotinfo"><b>${slotDesc(x).n} · ${lab[1]}</b><span>${slotDesc(x).s}</span><i>${slotTime(x.t)}</i></div><div class="slotbtns">${btn}</div></div>`
    :`<div class="slotrow empty"><span class="slotno">${lab[0]}</span><i>비어 있음</i>${btn?`<div class="slotbtns" style="margin-left:auto">${btn}</div>`:''}</div>`;
  const delBtn=id=>`<button class="plate-btn danger" data-wdel="${id}">세계선 삭제</button>`;
  let body='';
  if(sv){const id=cur.rid,a=wlGet(WL_A(id));
    body=`<div class="wlblk"><div class="wlhead"><b>세계선 ${ids.indexOf(id)+1}</b></div>${row(['자','자동 저장'],a,'<i>진행할 때마다 덮어씀</i>')}
      ${Array.from({length:WL_MAN},(_,j)=>{const k=j+1,x=wlGet(WL_M(id,k));return row([k,'직접 저장'],x,x?`<button class="plate-btn danger" data-sv="${k}" data-full="1">덮어써서 저장</button>`:`<button class="plate-btn" data-sv="${k}">여기에 저장</button>`)}).join('')}</div>`}
  else{const list=ids.map((id,i)=>({id,i,a:wlGet(WL_A(id))})).sort((p,q)=>((q.a&&q.a.t)||0)-((p.a&&p.a.t)||0));
    body=list.map(({id,i,a})=>{const ms=Array.from({length:WL_MAN},(_,j)=>[j+1,wlGet(WL_M(id,j+1))]).filter(([,x])=>x);
      return`<div class="wlblk"><div class="wlhead"><b>세계선 ${i+1}</b>${delBtn(id)}</div>${over?row(['자','자동 저장'],a,''):row(['자','자동 저장'],a,a?`<button class="plate-btn" data-go="${id}">이어하기</button>`:'')}
        ${over?'':ms.map(([k,x])=>row([k,'직접 저장'],x,`<button class="plate-btn" data-go="${id}" data-k="${k}">불러오기</button>`)).join('')}</div>`}).join('')||'<div class="hint">저장 기록이 없다</div>'}
  m.innerHTML=`<div class="panel" style="width:min(820px,100%);max-height:100%"><div class="maphead"><div><div class="psub">세계선 ${n} / ${WL_MAX}</div><div class="ptitle">${over?'세계선이 가득 찼다':sv?'저장하기':'저장 기록'}</div></div><button class="btn-ghost" id="slBack">${over?'취소':'닫기'}</button></div>
    <div class="hint">${over?`세계선은 최대 ${WL_MAX}개까지 남는다. 새로 시작하려면 세계선 하나를 삭제한다.`:sv?'지금 상태를 고른 칸에 저장한다 · 직접 저장한 칸은 자동 저장이 덮어쓰지 않는다 · 전투 중이면 그 전투를 시작한 시점으로 저장된다':'세계선마다 맨 위 칸이 자동 저장이다 · 다른 세계선을 불러와도 원래 세계선은 그대로 남는다 · 쓰러지면 그 막에 들어가기 전으로 돌아간다'}</div>
    <div class="slotlist">${body}</div></div>`;
  $('#slBack').onclick=()=>{closeModal();if(back)back()};
  m.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{endTitleSceneSafe();wlLoad(b.dataset.go,b.dataset.k?+b.dataset.k:0)});
  m.querySelectorAll('[data-sv]').forEach(b=>{let armd=false;b.onclick=()=>{if(b.dataset.full&&!armd){armd=true;b.textContent='한 번 더 누르면 덮어씀';return}
    const k=+b.dataset.sv;if(manualSave(k)){toast('저장',`직접 저장 ${k}번 칸에 저장했다`);openSlots(mode,back,go)}}});
  m.querySelectorAll('[data-wdel]').forEach(b=>{let armd=false;b.onclick=()=>{if(!armd){armd=true;b.textContent='진짜로 누르시겠습니까?';return}
    wlDel(b.dataset.wdel);if(over){closeModal();go&&go();return}openSlots(mode,back,go);if(S.screen==='title'&&S.titleMenu)refreshTitleCont()}});
}
function endTitleSceneSafe(){try{if(S.screen==='title')endTitleScene()}catch(e){}}
function refreshTitleCont(){const b=$('#mCont'),n=wlCount();if(!b)return;if(!n){b.remove();return}b.querySelector('small').textContent=`세계선 ${n} / ${WL_MAX}`}
/* ================= 상점 — 보관함 장비 판매 ================= */
function shopSell(back){const r=S.run;ensureGear(r);const m=$('#modal');m.hidden=false;
  const pct=Math.round(sellPrice(r.bag[0]||GEAR_KEYS[0])/Math.max(1,GEAR[r.bag[0]||GEAR_KEYS[0]].p)*100);
  m.innerHTML=`<div class="panel" style="width:min(1180px,100%);max-height:100%;overflow:auto"><div class="maphead"><div><div class="psub">보관함 ${r.bag.length}개 · 본래 가격의 ${pct}% · 보유 ${money(r.gold)}</div><div class="ptitle">보관함 장비 판매</div></div><button class="btn-ghost" id="mClose">돌아가기</button></div>
    <div class="eqgrid">${r.bag.length?r.bag.map((k,j)=>gearCardHTML(k,`<div class="eqact"><button class="plate-btn" data-sell="${j}">판매 <span class="price">+${money(sellPrice(k))}</span></button></div>`)).join(''):'<div class="hint">보관함에 장비가 없다 — 착용 중인 장비는 장비 화면에서 벗어 보관함에 넣은 뒤 팔 수 있다</div>'}</div></div>`;
  $('#mClose').onclick=()=>{closeModal();back()};
  m.querySelectorAll('[data-sell]').forEach(b=>b.onclick=()=>{const j=+b.dataset.sell,k=r.bag[j];if(!k)return;const p=sellPrice(k);r.bag.splice(j,1);r.gold+=p;toast('판매',`「${GEAR[k].n}」 +${money(p)}`);save();renderTop();shopSell(back)});
}
/* ================= 게임 중 메뉴 — 계속하기 · 설정 · 중단하기 · 저장하고 나가기 ================= */
function inGame(){return(!!S.run&&!['title','over','victory'].includes(S.screen))}
function leaveToTitle(){S.setBack=null;closeModal();
  transition(()=>{S.busy=false;if(S.C){S.C.over=true}S.C=null;showTitle({menu:true})})}
function openGameMenu(){if(!inGame())return;
  if(S.busy||(S.screen==='combat'&&S.C?.over)){toast('메뉴','행동이 끝난 뒤에 열 수 있다');return}
  if(S.run&&S.run.train){const m=$('#modal');m.hidden=false;S.setBack=null;
    m.innerHTML=`<div class="panel" style="width:min(560px,100%)"><div class="maphead"><div><div class="psub">훈련장</div><div class="ptitle">메뉴</div></div></div>
      <div class="choices"><button class="choice" id="gmCont"><b>계속하기</b><span>훈련으로 돌아간다</span></button>
      <button class="choice" id="gmAgain"><b>다시 시작</b><span>같은 덱과 상대로 처음부터</span></button>
      <button class="choice" id="gmPick"><b>카드 고르기</b><span>훈련장으로</span></button>
      <button class="choice" id="gmFx"><b>연출 보기</b><span>궁극기·제압·표식 연출을 바로 본다</span></button>
      <button class="choice" id="gmSet"><b>설정</b><span>UI 크기 · 효과음 · 화면 흔들림 · 패치 내역</span></button>
      <button class="choice" id="gmQuit"><b>처음으로</b><span>시작 화면으로</span></button></div></div>`;
    const stop=()=>{closeModal();if(S.C)S.C.over=true;hideCombatUI()};
    $('#gmCont').onclick=closeModal;$('#gmFx').onclick=()=>{closeModal();trFxPanel()};$('#gmAgain').onclick=()=>{stop();trStart()};$('#gmPick').onclick=()=>{stop();trLeave(openTrain)};
    $('#gmSet').onclick=()=>{S.setBack=openGameMenu;openSettings()};$('#gmQuit').onclick=()=>{stop();trLeave()};return}
  if(S.run&&S.run.tutB){const m=$('#modal');m.hidden=false;S.setBack=null;if(S.tb){S.tb.paused=true;tbDraw()}
    m.innerHTML=`<div class="panel" style="width:min(560px,100%)"><div class="maphead"><div><div class="psub">튜토리얼</div><div class="ptitle">메뉴</div></div></div>
      <div class="choices"><button class="choice" id="gmCont"><b>계속하기</b><span>튜토리얼로 돌아간다</span></button>
      <button class="choice" id="gmSet"><b>설정</b><span>UI 크기 · 효과음 · 화면 흔들림 · 전환 팁 · 튜토리얼 · 패치 내역</span></button>
      <button class="choice" id="gmQuit"><b>처음으로</b><span>시작 화면으로</span></button></div></div>`;
    $('#gmCont').onclick=()=>{closeModal();if(S.tb){S.tb.paused=false;tbDraw()}};
    $('#gmSet').onclick=()=>{S.setBack=openGameMenu;openSettings()};
    $('#gmQuit').onclick=()=>{S.tb=null;S.tbHands=null;tbDraw();closeModal();S.run=null;S.C=null;S.hero=S.hero0||null;transition(()=>showTitle({menu:true}))};return}
  const m=$('#modal');m.hidden=false;S.setBack=null;
  const fight=S.screen==='combat';
  m.innerHTML=`<div class="panel" style="width:min(560px,100%)"><div class="maphead"><div><div class="psub">세계수 등반</div><div class="ptitle">메뉴</div></div></div>
    <div class="choices">
      <button class="choice" id="gmCont"><b>계속하기</b><span>게임으로 돌아간다</span></button>
      <button class="choice" id="gmSet"><b>설정</b><span>UI 크기 · 효과음 · 화면 흔들림 · 전환 팁 · 튜토리얼 · 패치 내역</span></button>
      <button class="choice" id="gmVault"><b>보관함</b><span>${memoSeen().length?`${memoSeen().length}장`:'아직 모은 것이 없다...'}</span></button>
      <button class="choice" id="gmSv"><b>저장하기</b><span>원하는 칸에 지금 상태를 직접 저장 · 여러 칸에 나눠 저장할 수 있다</span></button>
      <button class="choice" id="gmSave"><b>저장하고 나가기</b><span>${fight?'지금 전투는 시작한 시점부터 다시 한다':'지금 막에서 이어 할 수 있다'} · 시작 화면으로</span></button>
      <button class="choice" id="gmQuit"><b>중단하기</b><span>시작 화면으로 나간다 · 저장은 지우지 않는다 · 마지막 자동 저장부터 이어 할 수 있다</span></button>
    </div></div>`;
  $('#gmCont').onclick=closeModal;
  $('#gmSet').onclick=()=>{S.setBack=openGameMenu;openSettings()};$('#gmVault').onclick=()=>openVault(openGameMenu);
  $('#gmSv').onclick=()=>{save();openSlots('save',openGameMenu)};
  $('#gmSave').onclick=()=>{if(save()){toast('저장','저장 기록에 저장했다');leaveToTitle()}else toast('저장 실패','저장할 수 없다')};
  $('#gmQuit').onclick=leaveToTitle;
}
addEventListener('keydown',e=>{if(e.key!=='Escape'||!inGame())return;const m=$('#modal');if(m.hidden){e.preventDefault();openGameMenu()}});

