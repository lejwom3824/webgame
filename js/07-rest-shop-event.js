"use strict";
/* ================= rest / shop / event ================= */
function showRest(){
  S.screen='rest';renderTop();viewFor('rest');
  /* 휴식 (웹게임 문서): 최대 체력의 25% 회복 */
  const r=S.run;
  const mul=(pt('healDown')?.75:1)*(eqW('re_b')?1.25:1)*(1+(gs('restPct')+(eq('own_re')?10:0))/100);
  const amt=Math.round(r.maxHp*TUNE.restHeal*mul);
  const dain=r.mode==='dain';
  const sc=openScreen('',{dim:true});
  const fem=rnd()<.5;
  sc.innerHTML=`<div class="panel restpanel" style="width:min(720px,100%)">
    <div class="ptitle">휴식</div><div class="psub">재가 덜 날리는 뿌리 아래, 모닥불가에 앉는다</div>
    ${restScene(fem)}${r.pal&&!r.pal.away?'<div class="restpal">'+PAL_FIG+'<span>주인공 뒤에 한 사람이 더 서 있다</span></div>':''}
    <div class="restchat" id="rChat" hidden></div>
    <div class="choices" id="rChoices">
      <button class="choice" id="rHeal"><b>쉰다</b><span>체력 ${amt} 회복 (최대 체력의 25%)</span></button>
    </div>
</div>`;
  $('#rHeal').onclick=()=>{r.hp=Math.min(r.maxHp,r.hp+amt);showMap()};
  tutShow();
  palEv('rest',true);
}
/* V32 휴식 화면: 모닥불가에 먼저 앉아 있던 사람(남자 또는 여자 무작위)과 이제 막 앉은 주인공 */
function restScene(fem){
  const hair=fem?'<path d="M-15 -78 Q-22 -50 -18 -30 L-10 -34 Q-12 -56 -6 -70 Z M15 -78 Q22 -50 18 -30 L10 -34 Q12 -56 6 -70 Z"/>':'';
  const sit=`<g class="rs-sit">${hair}<circle cx="0" cy="-74" r="13"/><path d="M-16 -60 Q-22 -30 -20 -6 L22 -6 Q24 -30 16 -60 Q0 -66 -16 -60 Z"/><path d="M-20 -8 Q10 -14 34 -4 L36 6 L-22 6 Z"/></g>`;
  const stand=`<g class="rs-stand">${hair}<circle cx="0" cy="-118" r="13"/><path d="M-15 -104 Q-20 -70 -17 -40 L17 -40 Q20 -70 15 -104 Q0 -110 -15 -104 Z"/><path d="M-12 -42 L-14 6 L-4 6 L0 -30 L4 6 L14 6 L12 -42 Z"/></g>`;
  return `<svg class="restscene" id="rScene" viewBox="0 0 640 210" role="img" aria-label="모닥불가에 앉은 두 사람">
    <defs><radialGradient id="rsGlow" cx="50%" cy="70%" r="55%"><stop offset="0" stop-color="#e48a46" stop-opacity=".55"/><stop offset="1" stop-color="#e48a46" stop-opacity="0"/></radialGradient></defs>
    <rect x="0" y="0" width="640" height="210" fill="#0d0f12"/><rect class="rs-glow" x="0" y="0" width="640" height="210" fill="url(#rsGlow)"/>
    <path d="M0 176 Q160 166 320 172 T640 170 L640 210 L0 210 Z" fill="#1a1612"/>
    <g class="rs-fire" transform="translate(320 176)"><path class="f1" d="M-22 0 Q-18 -30 -4 -52 Q0 -30 6 -44 Q16 -24 22 0 Z" fill="#e48a46"/><path class="f2" d="M-12 0 Q-8 -20 0 -34 Q8 -20 12 0 Z" fill="#ffd98f"/></g>
    <g class="rs-smoke" transform="translate(320 170)"><path d="M0 0 Q-10 -30 4 -60 Q16 -90 0 -120" fill="none" stroke="#8a8378" stroke-width="6" stroke-linecap="round"/></g>
    <path d="M296 178 L344 170 M298 170 L342 179" stroke="#2b2118" stroke-width="7" stroke-linecap="round"/>
    <g class="rs-other" fill="#060708" transform="translate(206 176)">${sit}${stand}</g>
    <g class="rs-me" fill="#060708" transform="translate(452 176) scale(-1 1)"><circle cx="0" cy="-70" r="13"/><path d="M-17 -56 Q-24 -28 -22 -6 L22 -6 Q24 -28 17 -56 Q0 -62 -17 -56 Z"/><path d="M-20 -8 Q8 -12 30 -2 L32 6 L-22 6 Z"/></g>
  </svg>`;
}
/* 상점 (웹게임 문서: 상점 · 상점 종류 · 카드•장비 탭)
   카드 구매 · 장비 구매 · 새로고침 — 상점 등급 이하만 진열
   미드가르드: 노점(일반) · 조잡한 공방(희귀) · 대장간(희귀), 상점 종류는 무작위 */
const SHOPS={stall:{n:'노점',g:'common'},crude:{n:'조잡한 공방',g:'rare'},smithy:{n:'대장간',g:'rare'}};
const SHOP_BY_PLACE={midgard:['stall','crude','smithy']};

/* ================= 더미 데이터 (웹게임 문서에 있고 아직 게임에 쓰이지 않음 — 미리 저장만 함) =================
   2장 이후·추후 작성 항목이라 지금 런에는 등장하지 않음 */
/* 상점 종류 — 니다벨리르: 공방(영웅) 4곳, 특수 대장장이(전설, 이벤트로만 등장) · 아스가르드: 상점 없음 */
Object.assign(SHOPS,{
  w_kriv:{n:'크리뷔스 공방',g:'hero',ws:'w_kriv'},
  w_stein:{n:'스타인러 공방',g:'hero',ws:'w_stein'},
  w_ash:{n:'아쉬부티 공방',g:'hero',ws:'w_ash'},
  w_krim:{n:'크리밀라 공방',g:'hero',ws:'w_krim'}
});
Object.assign(SHOP_BY_PLACE,{nidavellir:['w_kriv','w_stein','w_ash','w_krim'],asgard:[]});
/* 기본 무기 (일반, 보류) — 무기 칸은 장비 칸과 따로, 한손·양손 무기는 추후 작성 */
const WEAPON_DUMMY={
  w_twig:{n:'나뭇가지',g:'common',p:10,t:'공격레벨 +1',fx:{atk:1}},
  w_club:{n:'나무 몽둥이',g:'common',p:40,t:'공격레벨 +3',fx:{atk:3}},
  w_dullsword:{n:'무뎌진 철제 검',g:'common',p:90,t:'공격레벨 +5',fx:{atk:5}}
};
/* 고유 키워드 — 스타인러 공방 (증기·열기) */
const KW_UNIQUE_DUMMY={
  steamKw:{n:'증기',neg:true,t:'증기 1당 받는 피해 +10%, 최대 200%, 턴이 끝날 때 증기가 10 이상이면 증기 10을 소모하고 열기 +1'},
  heatKw:{n:'열기',t:'열기 1당 공격 주사위 +1, 최대 2, 턴마다 1 소모'}
};
/* 특수무기 사건 — 다인슬레이프만 지금 등장, 나머지는 장소(2장 이후)가 아직 없어 저장만 함 */
const SPECIAL_EV_DUMMY={
  dropBolt:{place:'asgard',only:'mjolnir',title:'번개를 버리다',text:'번개가 닿지 않는 전장, 망치 하나만 쥔 채 서 있다',choices:[
    {b:'번개를 버린다',s:'이번 회차 동안 전격 부여 불가, 덱의 전격·천둥 카드 삭제, 모든 공격 피해 2배, 가중치 +2, 적중률 +30%'},
    {b:'번개를 쥔다',s:'이전보다 타격이 잘 들어가는 것 같다, 공격레벨 +2'}]},
  getMjolnir:{place:'nidavellir',title:'묠니르',trigger:'어느 공방이든 1% 확률로 발동',text:'',choices:[]},
  getGungnir:{place:'nidavellir',title:'궁니르',trigger:'솜씨 좋은 대장장이(특수 대장장이)를 만났을 때 확정 발동',text:'',choices:[]},
  getLaevateinn:{place:'yggdrasil',title:'레바테인',trigger:'보스를 처치한 뒤, 가지를 타고 다른 지역으로 이동할 때(지역 이동 로딩) 1% 확률로 발동',
    text:'세계수 안쪽이 열리며 뜨거운 열기가 머릿결을 스쳐 간다. 눈앞에 보이는 것은 세계수를 태우고 있는 수르트의 무구, 레바테인이다.',choices:[
    {b:'멸망이 된다',s:'레바테인 획득, 해제 불가, 수르트모드'},
    {b:'처분한다',s:'약화된 수르트와 전투, 승리 시 최종 보스 수르트가 약해짐'}]}
};
/* 장 구성 — 1장 미드가르드(튜토리얼), 2장 니다벨리르, 3장 미드가르드, 4장 아스가르드, 최종 보스 수르트 (장소 추가 예정으로 확정 아님) · 2장부터 재화 단위가 훨씬 높아짐 */
const ACTS_DUMMY=[{place:'midgard',tut:true,boss:'bishop'},{place:'nidavellir'},{place:'midgard'},{place:'asgard',finalBoss:'surtr'}];
/* 카드 등급: 일반덱 탭의 일반 → 일반, 고급 → 희귀, 희귀 → 영웅 */
const CARD_GRADE={start:'common',common:'common',uncommon:'rare',rare:'hero'};
const cardGrade=id=>CARD_GRADE[CARDS[id].rar]||null;
const CARD_PRICE={ms_slash:85,f_pi:300,slash:40,guard:40,breath:30,hardtack:20,stab:60,prayer:65,double:70,gap:75,shield:80,smash:90,ornament:220,steam:260,hook:320,mimic:380,temper:450};
const TMP_PRICE={common:70,rare:300};/* 임시 카드 가격 — 문서에 없음 */
const cardPrice=id=>CARD_PRICE[id]!=null?CARD_PRICE[id]:CARDS[id].tmp&&cardGrade(id)?TMP_PRICE[cardGrade(id)]:null;
const UPG_COST={common:70,rare:840,hero:10080};
const shopMul=()=>1+((S.run.flags&&S.run.flags.shopUp)||0);
function shopStock(type){
  const g=GRADE_RANK[SHOPS[type].g],m=shopMul();
  const pool=shuffle(Object.keys(CARDS).filter(id=>{const cg=cardGrade(id);return cg&&GRADE_RANK[cg]<=g&&cardPrice(id)!=null}));
  const ids=curPlace()==='midgard'?[...pool.filter(wpnOk).slice(0,4),...pool.filter(id=>!wpnOk(id)).slice(0,1)]:pool.slice(0,5);
  const cards=ids.map(id=>({id,price:Math.round(cardPrice(id)*m)}));
  const gear=shuffle(GEAR_KEYS.filter(k=>GRADE_RANK[GEAR[k].g]<=g)).slice(0,5).map(k=>({k,price:Math.round(GEAR[k].p*m)}));
  return{cards,gear};
}
function genShop(){
  const r=S.run;ensureGear(r);
  if(r.shop&&r.shop.at===r.floor&&r.shop.cards)return;
  r.shopN=(r.shopN||0)+1;const type=pick(SHOP_BY_PLACE[curPlace()]);
  r.shop={at:r.floor,type,...shopStock(type),rer:0};
}
function showShop(){
  S.screen='shop';viewFor('shop');setTimeout(()=>palEv('shop'),350);
  const r=S.run;genShop();renderTop();
  const sh=r.shop,T=SHOPS[sh.type],dain=myth(),rerCost=30*(sh.rer+1);
  if(sh.free){for(const it of[...(sh.cards||[]),...(sh.gear||[])])it.price=0}
  const sc=openScreen('',{dim:true});
  sc.innerHTML=`<div class="panel shoppanel" style="width:min(1320px,100%)">
    <div class="maphead"><div><div class="psub">상점 · ${GRADE[T.g]} 등급 이하${(r.flags.shopUp||0)?' · 가격 +25%':''}</div><div class="ptitle">${T.n}</div></div><div class="purse">보유 <b>${money(r.gold)}</b></div></div>
    <div class="shoplay"><div class="shopmain"><div class="ap-h">카드</div>
    ${dain?'<div class="hint">신화덱은 고정되어 있어 카드를 사지 않는다</div>':`<div class="cardrow shoprow">${sh.cards.map((it,i)=>`<div class="cardpick${wpnOk(it.id)?'':' off'}">${staticCard(it.id,false)}<span class="eqtag">${GRADE[cardGrade(it.id)]}</span>${it.sold?'<span class="hint">판매됨</span>':`<button class="plate-btn" data-bc="${i}" ${r.gold<it.price?'disabled':''}>구매 <span class="price">${it.price}</span></button>`}</div>`).join('')}</div>`}
    </div><div class="shopside">
      <div class="ap-h">상점</div>
      <button class="svc" id="sRer" ${r.gold<rerCost||sh.free?'disabled':''} title="카드"><b>새로고침</b><span class="price">${sh.free?'주인이 없음':money(rerCost)}</span></button>
      <button class="svc main" id="sLeave"><b>떠난다</b></button></div></div></div>`;
  bindStatic(sc);eqToggle(sc);
  sc.querySelectorAll('[data-bc]').forEach(b=>b.onclick=()=>{const it=sh.cards[+b.dataset.bc];if(r.gold<it.price||it.sold)return;
    const buy=()=>{r.gold-=it.price;it.sold=true;addToDeck(it.id);toast('카드',`「${CARDS[it.id].name}」 — 카드 보관함으로`);save();showShop()};
    if(wpnOk(it.id))return buy();
    const m=$('#modal');m.hidden=false;m.innerHTML=`<div class="panel" style="width:min(460px,100%)"><div class="ptext">지금 무기로는 쓸 수 없다</div><div class="choices" style="flex-direction:row;justify-content:center"><button class="plate-btn" id="wBuy">산다</button><button class="plate-btn" id="wNo">그만둔다</button></div></div>`;
    $('#wBuy').onclick=()=>{closeModal();buy()};$('#wNo').onclick=closeModal});
  sc.querySelectorAll('[data-bg]').forEach(b=>b.onclick=()=>{const it=sh.gear[+b.dataset.bg];if(r.gold<it.price||it.sold)return;r.gold-=it.price;it.sold=true;save();gainGear(it.k,showShop)});
  $('#sRer').onclick=()=>{if(r.gold<rerCost||sh.free)return;r.gold-=rerCost;sh.rer++;Object.assign(sh,shopStock(sh.type));save();showShop()};
  $('#sLeave').onclick=showMap;
  tutShow();
}
/* 전투 중 카드 고르기 창 (공방 · 안드바리의 액자 · 판자) */
function pickCardModal(title,sub,cards,skip='고르지 않는다'){
  return new Promise(res=>{const m=$('#modal');m.hidden=false;
    m.innerHTML=`<div class="panel" style="width:min(1300px,100%);height:100%"><div class="maphead"><div><div class="ptitle">${title}</div><div class="psub">${sub}</div></div><button class="btn-ghost" id="pkSkip">${skip}</button></div>
      <div class="cardgrid">${cards.map(c=>`<div class="cardpick">${staticCard(c.id,false,c)}<button class="plate-btn" data-pk="${c.uid}">고르기</button></div>`).join('')}</div></div>`;
    bindStatic(m);
    m.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>{closeModal();res(cards.find(c=>c.uid===+b.dataset.pk)||null)});
    $('#pkSkip').onclick=()=>{closeModal();res(null)}});
}
/* 장비 창 — 전투 중이면 사용형 장비를 여기서 씀 */
function openEquip(){
  const r=S.run,C=S.screen==='combat'?S.C:null,live=C&&!C.over&&C.phase==='player'&&!S.busy&&!C.select;
  const keys=[...(r.equip||[])];if(C&&C.tempEq&&!keys.includes(C.tempEq))keys.push(C.tempEq);
  const act=k=>{if(!C)return'';const u=C.eqUsed||{};
    if(k==='spindle')return u.spindle?'<span class="eqst">이번 전투에 사용함</span>':`<button class="plate-btn" data-eq="spindle" ${live?'':'disabled'}>사용 — 다음 카드의 주사위</button>`;
    if(k==='flask')return u.flask?'<span class="eqst">이번 전투에 사용함</span>':`<button class="plate-btn" data-eq="flask" ${live?'':'disabled'}>사용 — 다음 카드 무료</button>`;
    if(k==='frame')return u.frame?'<span class="eqst">이번 전투에 사용함</span>':`<button class="plate-btn" data-eq="frame" ${live&&C.disc.length?'':'disabled'}>버린 카드 가져오기</button>`;
    if(k==='plank')return C.plank?`<span class="eqst">수납: ${cardName(C.plank.id,C.plank)}</span><button class="plate-btn" data-eq="plankOut" ${live?'':'disabled'}>꺼내기</button>`:`<button class="plate-btn" data-eq="plankIn" ${live&&C.hand.length?'':'disabled'}>패의 카드 수납</button>`;
    if(k==='dome')return`<span class="eqst">저장한 피해 ${r.dome||0} / 30</span>`;
    return''};
  const st=k=>{if(!C)return k==='dome'?`<span class="eqst">저장한 피해 ${r.dome||0} / 30</span>`:'';
    const on=(k==='spindle'&&C.spinArm)||(k==='flask'&&C.flaskArm);return(on?'<span class="eqst">준비됨</span>':'')+(k===C.tempEq?'<span class="eqst">크리밀라 공방 — 이번 전투만</span>':'')};
  ensureGear(r);const lock=!!C,tot=gearTotals();
  const slots=GSLOT_ORDER.flatMap(s=>r.gear[s].map((k,i)=>`<div class="gslot${k?' g-'+GEAR[k].g:' empty'}"><span class="eqtag">${GSLOT[s].n}${GSLOT[s].k>1?` ${i+1}`:''}${k?` · ${GRADE[GEAR[k].g]}`:''}</span>${k?`<b>${GEAR[k].n}</b><div class="eqt">${GEAR[k].t}</div>${lock?'':`<button class="plate-btn" data-off="${s}:${i}">벗어서 보관</button>`}`:'<i>비어 있음</i>'}</div>`)).join('')
    +`<div class="gslot empty weapon"><span class="eqtag">무기</span><i>${S.run&&S.run.weapon&&WEAPON[S.run.weapon]?WEAPON[S.run.weapon].n:'무기'}</i></div>`;
  const m=$('#modal');m.hidden=false;
  m.innerHTML=`<div class="panel" style="width:min(1180px,100%);max-height:100%;overflow:auto"><div class="maphead"><div><div class="ptitle">장비</div><div class="psub">장비 칸 8개 · 착용 ${wornGear(r).length} · 보관 ${r.bag.length}${lock?' · 전투 중에는 장비를 바꿀 수 없다':''}</div></div><button class="btn-ghost" id="mClose">닫기</button></div>
    <div class="gslots">${slots}</div>
    <div class="psub">${tot.length?'장비 합계 · '+tot.join(' · '):'착용한 장비가 없다'}</div>
    <div class="ap-h">보관함</div>
    <div class="eqgrid">${r.bag.length?r.bag.map((k,j)=>gearCardHTML(k,lock?'':gearBlocked(k)?`<div class="eqact"><span class="hint">미드가르드에서는 착용할 수 없음</span></div>`:`<div class="eqact"><button class="plate-btn" data-wear="${j}">착용</button></div>`)).join(''):'<div class="hint">보관한 장비가 없다</div>'}</div>
    ${keys.length?`<div class="ap-h">보유 장비 · 보관함에 넣어 두기만 해도 적용</div><div class="eqgrid">${keys.map(k=>eqCardHTML(k,`<div class="eqact">${st(k)}${act(k)}</div>`)).join('')}</div>`:''}</div>`;
  $('#mClose').onclick=closeModal;
  m.querySelectorAll('[data-off]').forEach(b=>b.onclick=()=>{const[s,i]=b.dataset.off.split(':');const old=takeOff(r,s,+i);if(old)r.bag.push(old);save();renderTop();openEquip()});
  m.querySelectorAll('[data-wear]').forEach(b=>b.onclick=()=>{const j=+b.dataset.wear,k=r.bag[j],e=GEAR[k],sl=r.gear[e.s],free=sl.indexOf(null);if(gearBlocked(k))return;
    const put=i=>{r.bag.splice(j,1);const old=wearAt(r,k,e.s,i);if(old)r.bag.push(old);save();renderTop();openEquip()};
    if(free>=0||sl.length===1)return put(free>=0?free:0);
    m.querySelector('.panel').innerHTML=`<div class="maphead"><div><div class="psub">${GSLOT[e.s].n} 칸이 찼다</div><div class="ptitle">「${e.n}」 착용</div></div><button class="btn-ghost" id="wBack">돌아가기</button></div>
      <div class="choices">${sl.map((o,i)=>`<button class="choice" data-at="${i}"><b>${GSLOT[e.s].n} ${i+1} · 「${GEAR[o].n}」 대신 착용</b><span>${GEAR[o].t} · 벗은 장비는 보관함으로</span></button>`).join('')}</div>`;
    $('#wBack').onclick=openEquip;m.querySelectorAll('[data-at]').forEach(x=>x.onclick=()=>put(+x.dataset.at))});
  m.querySelectorAll('[data-eq]').forEach(b=>b.onclick=async()=>{if(!C||!live)return;const w=b.dataset.eq;
    if(w==='spindle'){C.eqUsed.spindle=true;C.spinArm=true;clog('운명의 실패: 다음 카드의 주사위가 낮게 나오면 다시 굴림');closeModal();renderCombat();return}
    if(w==='flask'){C.eqUsed.flask=true;C.flaskArm=true;clog('미미르의 물병: 다음 카드를 코스트 없이 사용');closeModal();renderCombat();return}
    if(w==='frame'){closeModal();const got=await pickCardModal('안드바리의 액자','버린 카드 더미에서 패로 가져올 카드를 고른다',[...C.disc],'그만둔다');
      if(got&&C.disc.includes(got)){C.eqUsed.frame=true;C.disc.splice(C.disc.indexOf(got),1);C.hand.push(got);clog(`안드바리의 액자: 「${cardName(got.id,got)}」을(를) 패로 가져옴`);settleHand()}renderCombat();return}
    if(w==='plankIn'){closeModal();const got=await pickCardModal('스키드블라드니르의 판자','수납할 카드를 고른다 — 원하는 턴에 꺼내 쓸 수 있다',[...C.hand],'그만둔다');
      if(got&&C.hand.includes(got)){C.hand.splice(C.hand.indexOf(got),1);removeHandEl(got.uid);C.plank=got;clog(`판자: 「${cardName(got.id,got)}」 수납`)}renderCombat();return}
    if(w==='plankOut'){const c=C.plank;C.plank=null;C.hand.push(c);clog(`판자: 「${cardName(c.id,c)}」을(를) 꺼냄`);settleHand();closeModal();renderCombat();return}
  });
}
/* ================= 운 주사위 판정 (웹게임 문서: 이벤트 판정) =================
   이벤트용 판정은 운 주사위(정36면체)로 함. P: 명중률, S: 이벤트에 따라 공격레벨 또는 방어레벨
   목표값 T = 36 - P/5 + 난이도 보정 · 최소값 M = 1 + (S ÷ 10, 소수점 버림), 최대 18
   주사위는 M~36 사이에서 나오고, T 이상이면 성공 · T가 M 이하면 굴리지 않고 무조건 통과 (궁니르는 무조건 통과)
   난이도 보정: 쉬움 -6, 보통 0, 어려움 +6 */
const DIFF={easy:{n:'쉬움',v:-6},normal:{n:'보통',v:0},hard:{n:'어려움',v:6}};
const LSTAT={atk:'공격레벨',def:'방어레벨',acc:null};
function luck(chk){
  const r=S.run,P=pAcc(),Sv=chk.s==='atk'?pAtk():chk.s==='def'?pDef():0;
  const T=36-P/5+DIFF[chk.d].v,M=Math.min(18,1+Math.floor(Sv/10))+(eqW('as_a')?2:0),need=Math.ceil(T);
  const auto=T<=M,pct=auto?100:need>36?0:Math.round((36-Math.max(need,M)+1)/(36-M+1)*100);
  return{P,Sv,T,M,need,auto,pct};
}
const chkLabel=(chk,L)=>`판정 · 명중률 ${L.P}%${LSTAT[chk.s]?` + ${LSTAT[chk.s]} ${L.Sv}`:' 단독'} · ${DIFF[chk.d].n} · ${L.auto?'무조건 통과':`성공 ${L.pct}%`}`;
function d36SVG(n,state){
  return`<svg class="d36 ${state||''}" viewBox="0 0 120 120" aria-hidden="true"><polygon class="d36o" points="60,4 108,32 108,88 60,116 12,88 12,32"/>
    <polygon class="d36i" points="60,22 92,41 92,79 60,98 28,79 28,41"/><path class="d36l" d="M60,4V22M108,32L92,41M108,88L92,79M60,116V98M12,88L28,79M12,32L28,41"/>
    <text x="60" y="62">${n}</text></svg>`;
}
/* ================= 일반 이벤트 (웹게임 문서: 일반 이벤트) ================= */
const PLACE={midgard:'미드가르드',nidavellir:'니다벨리르',asgard:'아스가르드'};
const GEV={
  dole:{place:'midgard',title:'자선 배급소',text:'성직자들이 묽은 죽을 나눠 준다. 줄은 길고 그릇은 작다.',choices:[
    {b:'줄을 선다',s:'체력 +15',fx:[['hp',15]]},
    {b:'두 번 받는다',chk:{s:'acc',d:'normal'},ok:{s:'레미 공방의 건빵 2장',fx:[['card','hardtack',2]]},ng:{s:'실링 -30',fx:[['gold',-30]]}},
    {b:'배급을 돕는다',s:'아무 일도 없다',fx:[]}]},
  counsel:{place:'midgard',title:'목회 상담',text:'상담실의 성직자가 무엇이 외로운지 묻는다.',choices:[
    {b:'털어놓는다',s:'최대 체력 -3',fx:[['maxHp',-3]]},
    {b:'거짓으로 고백한다',s:'실링 +40',fx:[['gold',40]]},
    {b:'그냥 나온다',s:'아무 일도 없다',fx:[]}]},
  barracks:{place:'midgard',title:'무너진 군사 기지',text:'라그나로크 때 지어진 병영이 반쯤 무너져 있다.',choices:[
    {b:'잔해를 뒤진다',chk:{s:'def',d:'normal'},ok:{s:'희귀 기본 장비 1개',fx:[['gear','rare']]},ng:{s:'체력 -15',fx:[['hp',-15]]}},
    {b:'녹슨 표식만 챙긴다',s:'실링 +40',fx:[['gold',40]]}]},
  bread:{place:'midgard',title:'빵을 섬기는 사람들',text:'골목 안쪽에서 갓 구운 빵 앞에 모여 기도하는 무리가 있다. 모이는 날은 그들끼리만 안다. 이것도 종교다.',choices:[
    {b:'빵을 나눠 먹는다',s:'체력 +10, 최대 체력 +3',fx:[['hp',10],['maxHp',3]]},
    {b:'빵을 훔친다',chk:{s:'acc',d:'normal'},ok:{s:'레미 공방의 건빵 3장',fx:[['card','hardtack',3]]},ng:{s:'아무 일도 없다',fx:[]}},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]},
  shard:{place:'midgard',title:'떨어진 유물 조각',text:'오래전 떨어진 유물의 파편이 흙 속에서 빛난다. 미드가르드에서 유물은 유산이다.',choices:[
    {b:'성전에 바친다',s:'실링 +60',fx:[['gold',60]]},
    {b:'갈아서 무기에 덧댄다',s:'이번 장 동안 노른교 성직자 공격레벨 +5',fx:[['act','priestAtk',5]]},
    {b:'그대로 둔다',s:'아무 일도 없다',fx:[]}]},
  quarry:{place:'midgard',title:'하루 일감',text:'채석장에 일자리가 하나 났다. 기다리는 사람은 열 명이다.',choices:[
    {b:'일한다',s:'실링 +50, 체력 -10',fx:[['gold',50],['hp',-10]]},
    {b:'일자리를 빼앗는다',chk:{s:'atk',d:'normal'},ok:{s:'실링 +100',fx:[['gold',100]]},ng:{s:'체력 -20',fx:[['hp',-20]]}},
    {b:'양보한다',s:'아무 일도 없다',fx:[]}]},
  knighthunt:{place:'midgard',title:'은빛 기사의 사냥',text:'에인헤랴르가 숲으로 들어간다. 시킨 만큼만 잡을 것이다.',choices:[
    {b:'뒤를 따른다',chk:{s:'acc',d:'normal'},ok:{s:'실링 +60, 체력 +10',fx:[['gold',60],['hp',10]]},ng:{s:'체력 -15',fx:[['hp',-15]]}},
    {b:'사냥감을 가로챈다',chk:{s:'atk',d:'hard'},ok:{s:'실링 +120',fx:[['gold',120]]},ng:{s:'이단심문관과 전투',fx:[['fight','inquisitor']]}},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]},
  manifesto:{place:'midgard',title:'벽에 붙은 선언문',text:'"세계수에 공양을 멈춰라." 밤사이 누군가 붙이고 사라졌다. 노르드교의 글이다.',choices:[
    {b:'떼어서 성직자에게 가져간다',s:'실링 +40',fx:[['gold',40]]},
    {b:'끝까지 읽는다',s:'아무 일도 없다',fx:[]},
    {b:'그대로 둔다',s:'아무 일도 없다',fx:[]}]},
  bonfire:{place:'midgard',title:'모닥불가의 사람들',text:'날은 덥지만 사람들은 알 수 없는 추위에 작은 불가로 바짝 붙어 앉아 있다.',choices:[
    {b:'곁에 앉는다',s:'체력 +20',fx:[['hp',20]]},
    {b:'장작을 보탠다',s:'실링 -20, 최대 체력 +5',cost:20,fx:[['gold',-20],['maxHp',5]]},
    {b:'불씨를 훔친다',chk:{s:'acc',d:'easy'},ok:{s:'다음 전투 첫 턴 코스트 +1',fx:[['next','cost1',1]]},ng:{s:'체력 -10',fx:[['hp',-10]]}}]},
  pickpocket:{place:'midgard',title:'소매치기',text:'아이 하나가 주머니를 스치고 달아난다.',choices:[
    {b:'붙잡는다',chk:{s:'acc',d:'normal'},ok:{s:'실링 +50',fx:[['gold',50]]},ng:{s:'실링 -50',fx:[['gold',-50]]}},
    {b:'놓아준다',s:'실링 -30',cost:30,fx:[['gold',-30]]}]},
  sweep:{place:'midgard',title:'성전 청소',text:'에인헤랴르가 바닥을 닦고 있다. 제단 옆에는 헌금함이 놓여 있다.',choices:[
    {b:'청소를 돕는다',s:'노른교의 기도 획득',fx:[['card','prayer']]},
    {b:'헌금함을 터는다',chk:{s:'acc',d:'hard'},ok:{s:'실링 +120',fx:[['gold',120]]},ng:{s:'이단심문관과 전투',fx:[['fight','inquisitor']]}},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]},
  peddler:{place:'midgard',title:'떠돌이 행상',text:'낡은 물건을 짊어진 행상이 손짓한다.',choices:[
    {b:'산다',s:'실링 -50, 일반 기본 장비 1개',cost:50,fx:[['gold',-50],['gear','common']]},
    {b:'흥정한다',cost:20,chk:{s:'acc',d:'normal'},ok:{s:'실링 -20, 일반 기본 장비 1개',fx:[['gold',-20],['gear','common']]},ng:{s:'행상이 떠난다',fx:[]}},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]},
  bonefence:{place:'midgard',title:'거인의 뼈 울타리',text:'라그나로크 때 쓰러진 거인의 뼈로 마을 울타리를 세웠다.',choices:[
    {b:'뼈를 깎아 날을 만든다',chk:{s:'atk',d:'normal'},ok:{s:'아무 일도 없다',fx:[]},ng:{s:'체력 -15',fx:[['hp',-15]]}},
    {b:'뼈 사이로 지나간다',s:'아무 일도 없다',fx:[]}]},
  pyreash:{place:'midgard',title:'번제터의 재',text:'아이들이 번제터에서 재를 줍는다. 무엇에 쓰는지는 묻지 않는다.',choices:[
    {b:'함께 줍는다',s:'실링 +30',fx:[['gold',30]]},
    {b:'아이들을 쫓아낸다',s:'실링 +60',fx:[['gold',60]]},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]},
  smileless:{place:'midgard',title:'웃는 법을 잊은 사람',text:'가장 소중했던 감정을 잃었다. 무엇을 잃었는지는 그 자신도 모른다.',choices:[
    {b:'말을 건다',chk:{s:'acc',d:'easy'},ok:{s:'아무 일도 없다',fx:[]},ng:{s:'아무 일도 없다',fx:[]}},
    {b:'실링을 건넨다',s:'실링 -40, 최대 체력 +5',cost:40,fx:[['gold',-40],['maxHp',5]]},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]},
  membrane:{place:'nidavellir',title:'막을 통과하다',text:'철제 돔 위로 투명한 막이 감싸고 있다. 한 점으로 곧게 지나가면 아무 일도 없다.',choices:[
    {b:'곧게 뛰어든다',chk:{s:'acc',d:'normal'},ok:{s:'무사히 통과, 다음 전투 첫 턴 코스트 +1',fx:[['next','cost1',1]]},ng:{s:'속도가 모자라 튕겨남, 어디로 떨어질지 모른다, 체력 -20%',fx:[['hpPct',-20]]}},
    {b:'천천히 미끄러져 내려간다',s:'떨어지는 힘을 그대로 받는다, 체력 -10%',fx:[['hpPct',-10]]}]},
  steinler:{place:'nidavellir',title:'스타인러의 장인',text:'노인이 맨손으로 증기 장치를 고친다. 아직 드워프의 손길이 남아 있는 곳이다.',choices:[
    {b:'수리를 돕는다',chk:{s:'atk',d:'normal'},ok:{s:'스타인러 공방의 증기 장치 획득',fx:[['card','steam']]},ng:{s:'증기에 데어 체력 -12',fx:[['hp',-12]]}},
    {b:'장치를 산다',s:'실링 -70, 스타인러 공방의 증기 장치 획득',cost:70,fx:[['gold',-70],['card','steam']]}]},
  krivus:{place:'nidavellir',title:'크리뷔스의 냉동 창고',text:'문틈으로 하얀 냉기가 새어 나온다. 가장 힘들게 만들어지고 가장 빨리 소모되는 것들이 쌓여 있다.',choices:[
    {b:'문을 연다',chk:{s:'def',d:'hard'},ok:{s:'크리뷔스 공방의 냉매 주머니 2장',fx:[['card','frost',2]]},ng:{s:'다음 전투 동안 코스트 -1',fx:[['next','cost',-1]]}},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]},
  ashbuti:{place:'nidavellir',title:'아쉬부티 전시실',text:'유물의 파편이 예술품이 되어 유리 안에 걸려 있다. 해설사가 교육 과정을 권한다.',choices:[
    {b:'파편을 만진다',chk:{s:'acc',d:'hard'},ok:{s:'아쉬부티 공방의 파편 장식 획득',fx:[['card','ornament']]},ng:{s:'경비에게 잡혀 실링 -60',fx:[['gold',-60]]}},
    {b:'해설을 듣는다',s:'아무 일도 없다',fx:[]}]},
  krimila:{place:'nidavellir',title:'크리밀라 시연회',text:'인간의 기술로 신의 능력을 흉내 낸 무구를 시연한다. 표적이 되어 줄 자원자를 찾는다.',choices:[
    {b:'표적이 된다',chk:{s:'def',d:'normal'},ok:{s:'크리밀라 공방의 모조 무구 획득',fx:[['card','mimic']]},ng:{s:'체력 -25%',fx:[['hpPct',-25]]}},
    {b:'관객석에 남는다',s:'아무 일도 없다',fx:[]}]},
  huginn:{place:'nidavellir',title:'후긴과 무닌의 자명종',text:'흑백 까마귀가 튀어나와 무언가를 정의한다. 맞든 틀리든, 그때부터 그것은 그렇게 불린다.',choices:[
    {b:'까마귀에게 내 이름을 묻는다',s:'특성 1개가 무작위 특성으로 바뀜',fx:[['traitSwap']]},
    {b:'자명종을 멈춘다',chk:{s:'acc',d:'hard'},ok:{s:'실링 +120',fx:[['gold',120]]},ng:{s:'이번 장 동안 상점 가격 +25%',fx:[['act','shopUp',.25]]}}]},
};
