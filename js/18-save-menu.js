
"use strict";
/* ================= 저장 기록 — 최대 20개 ================= */
const SLOT_MAX=20,SLOT_KEY=i=>'ash-midgard-slot-'+i;
function slotRead(i){try{const s=localStorage.getItem(SLOT_KEY(i));return s?JSON.parse(s):null}catch(e){return null}}
function slotWrite(i,kind,data,manual){try{localStorage.setItem(SLOT_KEY(i),JSON.stringify({kind,t:Date.now(),data,manual:!!manual}));return true}catch(e){toast('저장','저장 공간이 부족하다 — 기록 하나를 지운 뒤 다시 저장한다');return false}}
/* 직접 저장 (V31.19.5) — 쯔꾸르처럼 같은 이야기를 여러 칸에 저장. 직접 저장한 칸은 자동 저장이 덮어쓰지 않음 */
const newRid=()=>Date.now().toString(36)+Math.floor(rnd()*1e6).toString(36);
function autoSlotFor(o){if(!o.rid)o.rid=newRid();if(o.slot!=null){const x=slotRead(o.slot);if(x&&x.manual)o.slot=null;else if(x&&x.data&&x.data.rid&&x.data.rid!==o.rid)o.slot=null}
  if(o.slot==null){o.slot=S.pendingSlot!=null?S.pendingSlot:slotFree();S.pendingSlot=null;if(o.slot==null&&!o.noAutoWarn){o.noAutoWarn=true;toast('자동 저장','빈 칸이 없어 자동 저장을 멈췄다 — 메뉴의 저장하기로 직접 저장한다')}}return o.slot}
function manualSave(i){const o=S.run;if(!o)return false;if(!o.rid)o.rid=newRid();
  const d=JSON.parse(JSON.stringify(o));d.autoSlot=o.slot;delete d.slot;return slotWrite(i,'climb',d,true)}
function loadSlotData(x,i){const d=x.data;if(x.manual){const a=d.autoSlot;delete d.autoSlot;const ax=a!=null?slotRead(a):null;d.slot=(ax&&!ax.manual&&ax.data&&ax.data.rid===d.rid)||(a!=null&&!ax)?a:slotFree()}else d.slot=i;return d}
function slotDel(i){try{localStorage.removeItem(SLOT_KEY(i))}catch(e){}}
function slotAll(){const a=[];for(let i=0;i<SLOT_MAX;i++)a.push(slotRead(i));return a}
function slotFree(){const a=slotAll();const i=a.findIndex(x=>!x);return i<0?null:i}
function slotCount(){return slotAll().filter(Boolean).length}
/* 이전 버전의 저장 1개씩을 저장 기록으로 옮김 */
(function slotMigrate(){try{
  const c=localStorage.getItem(SAVE_KEY);if(c){const i=slotFree();if(i!=null){const d=JSON.parse(c);d.slot=i;if(slotWrite(i,'climb',d))localStorage.removeItem(SAVE_KEY)}}
  for(let i=0;i<SLOT_MAX;i++){const x=slotRead(i);if(x&&x.kind!=='climb')slotDel(i)}
}catch(e){}})();
save=function(){const r=S.run;if(!r||r.tutB||r.train)return false;if(autoSlotFor(r)==null)return false;return slotWrite(r.slot,'climb',r)};
loadSave=function(){const r=S.run;if(r&&r.slot!=null){const x=slotRead(r.slot);return x&&x.kind==='climb'?x.data:null}return null};
clearSave=function(){const r=S.run;if(r&&r.slot!=null){const x=slotRead(r.slot);if(x&&x.kind==='climb'&&!x.manual)slotDel(r.slot)}};
function slotDesc(x){const d=x.data||{};
  return{n:'세계수 등반',s:`${(CDIFF[d.diff]||CDIFF.easy).n} · ${d.act===2?`2장 니다벨리르 · ${d.floor||0}막`:`1장 · ${d.floor||0} / ${ROWS}막`} · ${d.mode==='dain'?'다인모드':`Lv ${d.lvl||1}`}`}}
function slotTime(t){if(!t)return'';const d=new Date(t),z=n=>String(n).padStart(2,'0');return`${d.getMonth()+1}/${d.getDate()} ${z(d.getHours())}:${z(d.getMinutes())}`}
/* 새로 시작할 막 고르기 — 빈 칸이 있으면 바로, 10개가 다 찼으면 덮어쓸 기록을 고름 */
function slotStart(go){S.pendingSlot=null;const i=slotFree();if(i!=null){S.pendingSlot=i;return go()}openSlots('over',null,go)}
function openSlots(mode,back,go){
  const m=$('#modal');m.hidden=false;const a=slotAll(),n=a.filter(Boolean).length;
  const over=mode==='over',sv=mode==='save',cur=sv?S.run:null;
  const tag=x=>x.manual?'직접 저장':'자동 저장';
  const row=(x,i)=>{const own=sv&&cur&&cur.slot===i&&x&&!x.manual;
    if(!x)return over?'':`<div class="slotrow empty"><span class="slotno">${i+1}</span><i>비어 있음</i>${sv?`<div class="slotbtns" style="margin-left:auto"><button class="plate-btn" data-sv="${i}">여기에 저장</button></div>`:''}</div>`;const ds=slotDesc(x);
    const btns=over?`<button class="plate-btn danger" data-ov="${i}">이 기록에 덮어쓴다</button>`:sv?(own?'<i>지금 이야기의 자동 저장</i>':`<button class="plate-btn danger" data-sv="${i}" data-full="1">덮어써서 저장</button>`):`<button class="plate-btn" data-go="${i}">이어하기</button><button class="plate-btn" data-del="${i}">지우기</button>`;
    return`<div class="slotrow"><span class="slotno">${i+1}</span><div class="slotinfo"><b>${ds.n} · ${tag(x)}</b><span>${ds.s}</span><i>${slotTime(x.t)}</i></div><div class="slotbtns">${btns}</div></div>`};
  m.innerHTML=`<div class="panel" style="width:min(820px,100%);max-height:100%"><div class="maphead"><div><div class="psub">저장 기록 ${n} / ${SLOT_MAX}</div><div class="ptitle">${over?'저장 기록이 가득 찼다':sv?'저장하기':'저장 기록'}</div></div><button class="btn-ghost" id="slBack">${over?'취소':'닫기'}</button></div>
    ${over?`<div class="hint">저장 기록은 최대 ${SLOT_MAX}개까지 남는다. 새로 시작하려면 지울 기록 하나를 고른다.</div>`:sv?'<div class="hint">지금 상태를 고른 칸에 저장한다. 같은 이야기를 여러 칸에 저장해 두고 원하는 시점부터 다시 할 수 있다 · 직접 저장한 칸은 자동 저장이 덮어쓰지 않는다 · 전투 중이면 그 전투를 시작한 시점으로 저장된다</div>':'<div class="hint">진행할 때마다 자동 저장 칸에 저장된다. 메뉴의 저장하기로 원하는 칸에 직접 저장할 수 있다.</div>'}
    <div class="slotlist">${a.map(row).join('')}</div></div>`;
  $('#slBack').onclick=()=>{closeModal();if(back)back()};
  m.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const i=+b.dataset.go,x=slotRead(i);if(!x)return;closeModal();
    const d=loadSlotData(x,i);const sl=d.slot;S.run=migrateRun(d);S.run.slot=sl;syncUID();transition(resumeAt)});
  m.querySelectorAll('[data-sv]').forEach(b=>{let armd=false;b.onclick=()=>{if(b.dataset.full&&!armd){armd=true;b.textContent='한 번 더 누르면 덮어씀';return}
    const i=+b.dataset.sv;if(manualSave(i)){toast('저장',`${i+1}번 칸에 저장했다`);if(cur&&cur.slot===i)cur.slot=null;openSlots(mode,back,go)}}});
  m.querySelectorAll('[data-del]').forEach(b=>{let armd=false;b.onclick=()=>{if(!armd){armd=true;b.textContent='한 번 더 누르면 지움';return}slotDel(+b.dataset.del);openSlots(mode,back,go);if(S.screen==='title'&&S.titleMenu)refreshTitleCont()}});
  m.querySelectorAll('[data-ov]').forEach(b=>{let armd=false;b.onclick=()=>{if(!armd){armd=true;b.textContent='한 번 더 누르면 지우고 시작';return}const i=+b.dataset.ov;slotDel(i);closeModal();S.pendingSlot=i;go&&go()}});
}
function refreshTitleCont(){const b=$('#mCont'),n=slotCount();if(!b)return;if(!n){b.remove();return}b.querySelector('small').textContent=`저장 기록 ${n} / ${SLOT_MAX}`}
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
      <button class="choice" id="gmQuit"><b>중단하기</b><span>이번 등반을 그만두고 자동 저장 기록을 지운다 · 직접 저장한 칸은 남는다</span></button>
    </div></div>`;
  $('#gmCont').onclick=closeModal;
  $('#gmSet').onclick=()=>{S.setBack=openGameMenu;openSettings()};$('#gmVault').onclick=()=>openVault(openGameMenu);
  $('#gmSv').onclick=()=>{save();openSlots('save',openGameMenu)};
  $('#gmSave').onclick=()=>{if(save()){toast('저장','저장 기록에 저장했다');leaveToTitle()}};
  const q=$('#gmQuit');let armd=false;q.onclick=()=>{if(!armd){armd=true;q.querySelector('b').textContent='한 번 더 누르면 중단';q.querySelector('span').textContent='자동 저장 기록이 지워지고 되돌릴 수 없다 (직접 저장한 칸은 남음)';return}
    clearSave();leaveToTitle()};
}
addEventListener('keydown',e=>{if(e.key!=='Escape'||!inGame())return;const m=$('#modal');if(m.hidden){e.preventDefault();openGameMenu()}});

