"use strict";
/* ================= card data (웹게임 문서 기준) ================= */
const ultMk=()=>{const C=S.C,E=C&&!C.over&&C.E,l=E&&E.pmk?E.pmk.lv:0;return l?ROMAN[l]:'0'},ultPurge=()=>{const C=S.C;return C&&!C.over?Math.min(3,C.pPurge||0):0};
const CARDS={
  slash:{name:'어설픈 베기',sword:1,cost:1,type:'atk',rar:'start',d:[A(60,90)],text:'공격 60~90',flavor:''},
  ms_slash:{name:'베기',sword:1,cost:1,type:'atk',rar:'common',d:[A(100,150)],text:'공격 100~150',flavor:''},
  ms_split:{name:'갈라내기',sword:1,cost:2,type:'atk',rar:'mastery',d:[A(150,200)],draw:1,text:'공격 150~200\n드로우 1',flavor:''},
  ms_flash:{name:'일섬',sword:1,cost:0,type:'atk',rar:'mastery',d:[A(75,95)],text:'공격 75~95\n치명타 시 데미지 +50%, 드로우 1',flavor:''},
  ms_kendo:{name:'검도',sword:1,cost:1,type:'atk',rar:'mastery',d:[A(100,150),D(5,50)],hold:true,text:'공격 100~150\n방어 5~50\n방어도 유지',flavor:''},
  ms_kendo2:{name:'발도술',sword:1,cost:1,type:'atk',rar:'mastery',d:[A(50,100)],text:'공격 50~100\n패에 같은 카드가 있으면 코스트 1을 소모해 재사용\n재사용은 행동 포인트 소모 없음',flavor:''},
  f_pi:{name:'피륙',sword:1,cost:3,type:'atk',rar:'uncommon',ap:2,d:[A(200,430)],text:'공격 200~430\n행동 포인트 2 소모',flavor:''},
  f_ryeo:{name:'도려내기',sword:1,cost:3,type:'atk',rar:'mastery',ap:2,draw:2,d:[A(150,450)],text:'공격 150~450\n드로우 2, 행동 포인트 2 소모\n데미지 300 이상이면 코스트 2 회복',flavor:''},
  f_dae:{name:'대절단',sword:1,cost:5,type:'atk',rar:'mastery',d:[A(500,750)],text:'공격 500~750\n재사용까지 3턴\n데미지 1000당 다음 턴 코스트 1, 드로우 1, 최대 2',flavor:''},
  guard:{name:'막기',cost:1,type:'def',rar:'start',d:[D(35,50)],text:'방어 35~50',flavor:''},
  breath:{name:'숨 고르기',cost:0,type:'skill',rar:'start',draw:1,text:'드로우 1',flavor:''},
  stab:{name:'찌르기',cost:0,type:'atk',rar:'common',d:[A(30,50)],text:'공격 30~50',flavor:''},
  double:{name:'연속 베기',cost:1,type:'atk',rar:'common',d:[A(40,55),A(40,55)],text:'공격 40~55 × 2',flavor:''},
  smash:{name:'내려찍기',cost:2,type:'atk',rar:'common',d:[A(130,190)],text:'공격 130~190',flavor:''},
  shield:{name:'방패 세우기',cost:2,type:'def',rar:'common',d:[D(90,130)],text:'방어 90~130',flavor:''},
  gap:{name:'빈틈 노리기',cost:1,type:'atk',rar:'common',d:[A(50,70)],vuln:1,text:'공격 50~70\n적중 시 취약 1',flavor:''},
  hardtack:{name:'딱딱한 건빵',cost:0,type:'skill',rar:'common',heal:14,gainE:1,text:'체력 14 회복\n코스트 1 회복',flavor:''},
  prayer:{name:'닿지 않는 기도',cost:1,type:'def',rar:'common',d:[D(30,45)],draw:1,text:'방어 30~45\n드로우 1',flavor:''},
  // 임시 카드 — 문서 일반덱에 회피 주사위 카드가 없어 시험용으로 넣음
  duck:{name:'몸 낮추기',cost:1,type:'def',rar:'common',d:[V(10,16),D(15,25)],text:'회피 10~16\n방어 15~25',flavor:''},
  parry:{name:'흘려 베기',cost:1,type:'atk',rar:'common',text:'패링\n이번 턴 회피 +10\n회피 성공 시 공격 90~120',flavor:''},
  /* V2.33.65.16: 힘을 얻는 카드 (코스트는 문서에 없어 임시 1) */
  c_est:{name:'견적 내기',cost:1,type:'atk',rar:'common',tmp:true,d:[A(30,40)],text:'공격 30~40\n적중 시 힘 +20',flavor:''},
  c_stance:{name:'자세잡기',cost:1,type:'def',rar:'common',tmp:true,d:[D(50,50)],text:'방어 50\n힘 +20',flavor:''},
  /* V2.33.65.16: 노르드교 원형 카드 — 노르드교 무기 전용 (등급·가격은 문서에 없어 임시) */
  n_weak:{name:'약점 노리기',cost:1,type:'atk',rar:'common',tmp:true,nord:1,d:[A(30,50)],text:'공격 30~50\n약점 노출 대상에게 이번 턴 카드를 쓸 때마다 추가타 15~25, 최대 3회',flavor:''},
  n_tear:{name:'약점 찢기',cost:1,type:'atk',rar:'common',tmp:true,nord:1,d:[A(60,90)],xFn:(C,E)=>pExpo(E)?1.25:1,text:'공격 60~90\n약점 노출 대상에게 데미지 +25%',flavor:''},
  n_force:{name:'표식 강제 부여',cost:1,type:'atk',rar:'common',tmp:true,nord:1,d:[A(30,50)],text:'공격 30~50\n적중 시 표식Ⅰ\n표식이 있으면 2턴 동안 유지',flavor:''},
  /* V2.33.65.16: 궁극기 — 적이 쓴 궁극기를 맞고 버티면 1장 (황금빛 테두리 · 유일) */
  u_exec:{name:'처형 집행',cost:3,type:'atk',rar:'ult',ult:1,nord:1,sure:true,d:[A(400,600)],get text(){return`유일\n표식 ${ultMk()}/Ⅴ\n표식을 전부 소모해 공격 400~600\n회피 불가`},flavor:''},
  u_purge:{name:'처단',cost:4,type:'atk',rar:'ult',ult:1,d:[A(50,100)],xFn:(C,E)=>E&&E.nord?(E.block>0?4.1:5):1,sureFn:(C,E)=>!!(E&&E.nord),get text(){return`유일\n피해 ${ultPurge()}/3\n공격 50~100\n노르드교에게 데미지 +400%\n회피 불가`},flavor:''},
  // 임시 카드 — 버리기 계열 (문서에 없음)
  tidy:{name:'정리',cost:0,type:'skill',rar:'common',tmp:true,text:'패에서 최대 3장 버림\n버린 장수만큼 드로우',flavor:''},
  // 임시 카드 — 조합 (휴식에서 두 장을 합침, 문서에 없음)
  // 임시 카드 — 뭉치 합성 (같은 카드 3장이 패에 모이면 바뀜, 문서에 없음)
  steam:{name:'어딘가의 뜨거움',cost:1,type:'skill',rar:'uncommon',text:'다음 턴 코스트 +2',flavor:''},
  mimic:{name:'어딘가의 무구',cost:2,type:'atk',rar:'uncommon',acc:-40,d:[A(140,190)],text:'명중 -40%\n공격 140~190\n적중 실패 시 방어도 100',flavor:''},
  ornament:{name:'파편 장식',cost:0,type:'skill',rar:'uncommon',text:'이번 턴 다음 카드 코스트 -1',flavor:''},
  hook:{name:'등반가의 갈고리',cost:1,type:'atk',rar:'uncommon',d:[A(70,105)],text:'공격 70~105\n이번 턴 방어 카드로 방어도를 얻었으면 데미지 2배',flavor:''},
  temper:{name:'단련',cost:1,type:'power',rar:'uncommon',text:'지속\n이번 전투 동안 공격 카드 데미지 +25',flavor:''},
  // 다인슬레이프 (특수무기)
  d_dirty:{name:'더러운 참격',type:'atk',rar:'special',hpCost:5,d:[A(110,170)],text:'공격 110~170',flavor:''},
  d_cannibal:{name:'동족 포식',type:'atk',rar:'special',hpCost:10,d:[A(80,120)],text:'공격 80~120\n대상 현재 체력의 10% 섭취',flavor:''},
  d_giant:{name:'거인 베기',type:'atk',rar:'special',hpCost:10,d:[A(140,220)],text:'공격 140~220\n대상의 현재 체력이 더 높으면 데미지 +50%',flavor:''},
  d_glutton:{name:'탐식',type:'atk',rar:'special',hpCost:15,d:[A(40,60),A(40,60),A(40,60)],text:'공격 40~60 × 3\n타격마다 입힌 데미지의 30% 회복',flavor:''},
  d_crumble:{name:'바스라지는 날',type:'atk',rar:'special',hpCost:5,d:[A(240,360)],exhaust:true,text:'체력 25% 이하일 때 사용\n공격 240~360\n소멸',flavor:''},
  d_hungry:{name:'굶주린 칼',type:'atk',rar:'special',hpCost:10,d:[A(80,120)],text:'공격 80~120\n이번 전투 섭취 횟수 × 5 추가 데미지',flavor:''},
  // 궁니르 (오딘)
  o_mark:{name:'투척-명중',cost:1,type:'atk',rar:'special',d:[A(10,30)],text:'공격 10~30\n궁니르-명중 1',flavor:''},
  o_pierce:{name:'투척-관통',cost:1,type:'atk',rar:'special',d:[A(150,250)],text:'공격 150~250\n가중치 1~10',flavor:''},
  o_mimir:{name:'미미르의 샘',cost:0,type:'skill',rar:'special',text:'드로우 4, 코스트 +2\n이번 턴 회피 불가',flavor:''},
  o_recall:{name:'궁니르-회수',cost:3,type:'atk',rar:'special',d:[A(80,120)],text:'공격 80~120\n궁니르당 최대 체력의 5% 추가, 최대 50%\n적중된 궁니르-명중마다 투척-명중 1장 회수',flavor:''},
  o_shatter:{name:'궁니르-파쇄',cost:4,type:'atk',rar:'special',text:'유일\n적중된 궁니르-명중 × 15 데미지, 5회 타격\n덱의 투척 카드를 전부 파편 5장으로 교체',flavor:''},
  o_shard:{name:'파편',cost:0,type:'atk',rar:'special',exhaust:true,d:[A(50,70)],text:'일회성\n공격 50~70\n패에 파편이 있으면 재사용\n없으면 모든 카드를 투척-명중이나 투척-관통으로 변경',flavor:''},
  // 묠니르 (토르)
  t_swing:{name:'휘두르기',cost:0,type:'atk',rar:'special',d:[A(80,120)],text:'공격 80~120\n코스트 +1\n묠니르가 없으면 주먹 휘두르기로 바뀜',flavor:''},
  t_fist:{name:'주먹 휘두르기',cost:0,type:'atk',rar:'special',d:[A(60,100)],text:'공격 60~100\n드로우 1',flavor:''},
  t_throw:{name:'던지기',cost:1,type:'atk',rar:'special',d:[A(120,180)],text:'공격 120~180\n패에 회수 추가\n부여하는 전격 2배',flavor:''},
  t_recall:{name:'회수',cost:0,type:'atk',rar:'special',d:[A(40,60)],text:'묠니르를 던졌을 때 사용\n공격 40~60\n드로우 1\n전격 없음',flavor:''},
  t_hunt:{name:'사냥',cost:1,type:'atk',rar:'special',d:[A(100,140)],text:'공격 100~140\n처치 시 유희 +1, 코스트 1 회복',flavor:''},
  t_bolt:{name:'전격',cost:2,type:'atk',rar:'special',text:'전격을 전부 소모해 1당 최대 체력의 10% 데미지, 최대 100%\n50% 확률로 마비\n명중률 무시\n드로우 1, 코스트 +1',flavor:''},
  t_thunder:{name:'천둥',cost:3,type:'atk',rar:'special',d:[A(80,120)],text:'공격 80~120 + 전격의 합\n공격 횟수와 가중치는 전격의 합',flavor:''},
  // 레바테인 (수르트)
  s_ignite:{name:'점화',cost:0,type:'skill',rar:'special',text:'드로우 1\n소각 10',flavor:''},
  s_burn:{name:'연소',cost:1,type:'atk',rar:'special',text:'코스트 +1\n대상 소각의 절반만큼 트루 데미지, 나머지 절반은 자신에게 이완',flavor:''},
  s_chase:{name:'레바테인-추격',cost:2,type:'atk',rar:'special',d:[A(80,120)],text:'공격 80~120\n가중치 2~3\n소각 5\n처치 시 코스트 +1, 턴당 최대 3',flavor:''},
  s_strike:{name:'레바테인-타격',cost:2,type:'atk',rar:'special',d:[A(160,240)],text:'공격 160~240\n소각 5\n처치 시 드로우 1, 턴당 최대 3',flavor:''},
  s_ragnarok:{name:'라그나로크',cost:3,type:'skill',rar:'special',text:'소각 30\n드로우 2',flavor:''},
};
const START_DECK=[['slash',3],['guard',3],['breath',2]];/* V2.33.65.16: 시작 덱 8장 — 어설픈 베기 3 · 막기 3 · 숨 고르기 2 */
const POOL={common:['ms_slash','stab','double','smash','shield','gap','hardtack','prayer','duck','parry','tidy','c_est','c_stance','n_weak','n_tear','n_force'],uncommon:['steam','mimic','f_pi','ornament','hook','temper']};
/* 신화 빌드 — 다인 시작 덱 10장 (문서 장수) */
const DAIN_DECK=[['d_dirty',3],['d_cannibal',2],['d_giant',2],['d_glutton',1],['d_crumble',1],['d_hungry',1]];
const TYPE_LABEL={atk:'공격',def:'방어',skill:'지원',power:'지원',curse:'저주'};/* 카드 종류: 공격 · 방어 · 지원 */
const RAR_LABEL={combo:'조합',fusion:'합성',mastery:'특수카드(숙련도)',ult:'궁극기'};
// 임시 수치 (문서에 아직 없는 값) — 한곳에 모아 둠
/* ================= 장비 (웹게임 문서: 상점 · 장비 / 공방 장비) ================= */
const EQUIP={};/* 소유 효과 물건 전부 삭제 (V2.31.54.14) */
const EQ_ALL=Object.keys(EQUIP);

/* ================= 장비 칸 (웹게임 문서: 카드•장비 · 장비) =================
   머리, 몸통, 다리×2, 발×2, 팔×2 (총 8칸) · 무기 칸은 따로 (추후) · 기본 장비 일반 25종 · 희귀 25종
   고유 장비(막의 껍질 등)와 공방 장비는 문서에서 보류 / 니다벨리르 공방 전용이라 1장 상점에는 나오지 않음 */
const GSLOT={head:{n:'머리',k:1},body:{n:'몸통',k:1},leg:{n:'다리',k:1},rh:{n:'오른손',k:1},lh:{n:'왼손',k:1},foot:{n:'발',k:1}};
const GSLOT_ORDER=['head','body','leg','rh','lh','foot'];
const GRADE={common:'일반',rare:'희귀',hero:'영웅',legend:'전설',myth:'신화'};
const GRADE_RANK={common:1,rare:2,hero:3,legend:4,myth:5};
const GR=(n,s,g,p,t,fx)=>({n,s,g,p,t,fx});
const GEAR={};/* 장비 아이템 전부 삭제 — 칸·보관함·진열 칸 틀만 남김 (V2.31.54.14) */
const GEAR_KEYS=Object.keys(GEAR);
const gearOf=g=>GEAR_KEYS.filter(k=>GEAR[k].g===g);
const climbOn=()=>!!S.run;
function ensureGear(r){if(!r)return r;if(!r.bag)r.bag=[];if(!r.gear||r.gear.arm){if(r.gear)for(const s in r.gear)for(const k of r.gear[s])if(k&&GEAR[k]&&GEAR[k].nw)r.bag.push(k);r.gear={head:[null],body:[null],leg:[null],rh:[null],lh:[null],foot:[null]}}return r}
function wornGear(r=S.run){if(!r||!r.gear)return[];const o=[];for(const s of GSLOT_ORDER)for(const k of(r.gear[s]||[]))if(k&&GEAR[k])o.push(k);return o}
function gs(stat){if(!climbOn())return 0;let v=0;for(const k of wornGear())v+=GEAR[k].fx[stat]||0;return v}
function gearHp(r,dv){if(!dv)return;r.maxHp=Math.max(1,r.maxHp+dv);if(dv>0)r.hp+=dv;r.hp=Math.min(r.hp,r.maxHp)}
function wearAt(r,k,s,i){ensureGear(r);const old=r.gear[s][i];if(old)gearHp(r,-(GEAR[old].fx.hp||0));r.gear[s][i]=k;gearHp(r,GEAR[k].fx.hp||0);return old}
function takeOff(r,s,i){const old=r.gear[s][i];if(!old)return null;r.gear[s][i]=null;gearHp(r,-(GEAR[old].fx.hp||0));return old}
const sellPrice=k=>Math.floor(GEAR[k].p*(gs('sellFull')?1:eq('u_boots')?.8:.6));
const money=n=>{n=Math.max(0,Math.round(n||0));const dh=Math.floor(n/1000),s=n%1000;return dh?`${dh}단화 ${s}실링`:`${s}실링`};
function gearCardHTML(k,extra='',note=''){const e=GEAR[k];return`<div class="eqcard g-${e.g}"><span class="eqtag">${GRADE[e.g]} · ${GSLOT[e.s].n}${note?` · ${note}`:''}</span><b>${e.n}</b><div class="eqt">${e.t}</div><div class="eqp">본래 가격 ${money(e.p)}</div>${extra}</div>`}
function gearTotals(){const keys=['atk','def','acc','eva','hp','flat','block0','blockFirst','blockTurn','blockPct','healPct','restPct','goldPct','cost1'];
  const N={atk:'공격레벨',def:'방어레벨',acc:'명중',eva:'회피',hp:'최대 체력',flat:'고정 추가 피해',block0:'전투 시작 시 방어도',blockFirst:'전투 첫 턴 방어도',blockTurn:'매 턴 시작 시 방어도',blockPct:'방어도 획득량',healPct:'회복 효과',restPct:'휴식 회복량',goldPct:'전투 승리 시 실링',cost1:'전투 첫 턴 코스트'};
  const pc=new Set(['blockPct','healPct','restPct','goldPct']);
  return keys.map(k=>{let v=0;for(const g of wornGear())v+=GEAR[g].fx[k]||0;return v?`${N[k]} ${v>0?'+':''}${v}${pc.has(k)?'%':''}`:''}).filter(Boolean)}
/* 새 장비를 얻을 때 — 빈 칸이 있으면 바로 착용, 칸이 찼으면 교체(벗은 장비는 보관) · 기존 장비를 60%로 팔고 착용 · 새 장비를 보관 */
const gearBlocked=k=>!!(S.run&&S.run.act===1&&GEAR[k]&&GRADE_RANK[GEAR[k].g]>GRADE_RANK.rare);
function gainGear(k,done){
  const r=ensureGear(S.run),e=GEAR[k];if(!e)return done&&done();
  if(e.nw){r.bag.push(k);toast('장비',`「${e.n}」 — 장비 보관함으로`);save();renderTop();return done&&done()}
  if(gearBlocked(k)){r.bag.push(k);toast('장비',`「${e.n}」 — 미드가르드에서는 ${GRADE[e.g]} 등급을 착용할 수 없어 보관함에 넣었다`);save();renderTop();return done&&done()}
  const slots=r.gear[e.s],free=slots.indexOf(null);
  if(free>=0){wearAt(r,k,e.s,free);toast('장비',`「${e.n}」 착용 · ${GSLOT[e.s].n}`);save();renderTop();return done&&done()}
  const m=$('#modal');m.hidden=false;S.modalLock=true;
  m.innerHTML=`<div class="panel" style="width:min(980px,100%)"><div><div class="psub">${GSLOT[e.s].n} 칸이 찼다</div><div class="ptitle">새 장비 · ${e.n}</div></div>
    <div class="eqgrid">${gearCardHTML(k,'','새 장비')}${slots.map(o=>gearCardHTML(o,'','착용 중')).join('')}</div>
    <div class="choices">${slots.map((o,i)=>`<button class="choice" data-sw="${i}"><b>「${GEAR[o].n}」 대신 착용</b><span>벗은 장비는 보관함으로 간다</span></button>
      <button class="choice" data-sell="${i}"><b>「${GEAR[o].n}」 팔고 착용</b><span>본래 가격의 60% · +${sellPrice(o)}실링</span></button>`).join('')}
      <button class="choice" data-keep="1"><b>보관함에 넣는다</b><span>지금 장비는 그대로 둔다</span></button></div></div>`;
  const fin=()=>{closeModal();save();renderTop();done&&done()};
  m.querySelectorAll('[data-sw]').forEach(b=>b.onclick=()=>{const old=wearAt(r,k,e.s,+b.dataset.sw);if(old)r.bag.push(old);toast('장비',`「${e.n}」 착용`);fin()});
  m.querySelectorAll('[data-sell]').forEach(b=>b.onclick=()=>{const old=wearAt(r,k,e.s,+b.dataset.sell);if(old)r.gold+=sellPrice(old);toast('장비',`「${GEAR[old].n}」 판매 +${sellPrice(old)}실링 · 「${e.n}」 착용`);fin()});
  m.querySelector('[data-keep]').onclick=()=>{r.bag.push(k);toast('장비',`「${e.n}」 보관`);fin()};
}
function eq(k){const r=S.run;return!!(r&&r.equip&&r.equip.includes(k))||!!(S.C&&!S.C.over&&S.C.tempEq===k&&S.screen==='combat')}
/* 공통 키워드 (웹게임 문서: 기본 규칙 · 공통 키워드) — 카드 이름으로 묶임 */
const KW={
  uniq:{n:'유일',t:'같은 유일 카드는 패에 1장만 보유할 수 있음',ids:['o_shatter','u_exec','u_purge']},
  member:{n:'단원',t:'단원 카드는 패에 모든 단원 카드를 포함해 1장만 소유 할 수 있음, 복제·강화·봉인·소멸·낙인 불가능, 모든 종류의 부정적·긍정적 키워드로 이 카드의 효과를 바꿀 수 없음',ids:[]},
  toss:{n:'버림',t:'카드마다 정해진 수만큼 플레이어가 패에서 골라 버림',ids:['tidy','c_whirl']}
};
const kwOf=id=>Object.keys(KW).filter(k=>KW[k].ids.includes(id));
/* 전투 보상 (웹게임 문서: 전투 보상) · 시작 실링은 마지막 번제비 6단화 */
const TUNE={startGold:6000,/* 마지막 번제비 6단화 */
  gold:{normal:[100,300],elite:[500,1500],boss:3000},
  gold2:{normal:[2000,5000],elite:[10000,50000],boss:[30000,100000]},
  restHeal:.25,humanHpCostPerCost:5,
  /* 전투 보정 (V27) — 장·등급별 적 체력 · 적 공격 피해 배율, 한 전투 경험치 상한(레벨업 필요 경험치의 배수, 0이면 없음) */
  cb:{hp:{1:{normal:4,elite:3,boss:1.3},2:{normal:1,elite:.6,boss:.3}},dmg:{1:{normal:.1,elite:.065,boss:.07},2:{normal:1,elite:.3,boss:.4}},expCap:0,ramp:4}};

