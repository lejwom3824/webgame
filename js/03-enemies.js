"use strict";
/* ================= enemies & traits ================= */
const TRAITS={
  '의수':{g:'신체',text:'전투당 1회 약화를 무시함'},
  '튼튼함':{g:'신체',text:'체력 +20%',ap:e=>{e.maxHp=Math.round(e.maxHp*1.2)}},
  '허약함':{g:'신체',text:'체력 -20%',ap:e=>{e.maxHp=Math.round(e.maxHp*.8)}},
  '날렵함':{g:'신체',text:'회피 +15',ap:e=>{e.eva+=15}},
  '굼뜸':{g:'신체',text:'회피 -15',ap:e=>{e.eva-=15}},
  '외눈':{g:'신체',text:'명중 +15, 회피 -15',ap:e=>{e.acc+=15;e.eva-=15}},
  '두꺼운 피부':{g:'신체',text:'매 턴 시작 시 방어도 +4'},
  '상처투성이':{g:'신체',text:'체력 -10%, 취약에 걸리지 않음',ap:e=>{e.maxHp=Math.round(e.maxHp*.9)}},
  '용기':{g:'정신',text:'체력이 50% 이하일 때 공격 피해 +20%'},
  '겁쟁이':{g:'정신',text:'체력이 30% 이하가 되면 1턴 동안 행동하지 않음'},
  '광신':{g:'정신',text:'처치되기 전까지 약화에 걸리지 않음'},
  '광기':{g:'정신',text:'공격 피해 +20%, 매 턴 체력 -3'},
  '침착함':{g:'정신',text:'명중 +10, 첫 턴에 반드시 방어 행동을 함',ap:e=>{e.acc+=10}},
  '복수심':{g:'정신',text:'플레이어에게 피해를 받을 때마다 다음 공격 피해 +2, 최대 +10'},
  '무모함':{g:'정신',text:'첫 공격 피해 2배, 방어 행동을 하지 않음'},
  '숙련':{g:'소속·경험',text:'공격레벨 +5, 방어레벨 +5',ap:e=>{e.atk+=5;e.def+=5}},
  '신참':{g:'소속·경험',text:'공격레벨 -5, 방어레벨 -5',ap:e=>{e.atk-=5;e.def-=5}},
  '굶주림':{g:'소속·경험',text:'플레이어에게 피해를 줄 때마다 체력 3 회복'},
  '부유함':{g:'소속·경험',text:'처치 시 실링 +50%'},
  '빈털터리':{g:'소속·경험',text:'처치 시 실링 없음, 공격 피해 +10%'},
};
const TRAIT_CONFLICT=[['튼튼함','허약함'],['날렵함','굼뜸'],['숙련','신참'],['부유함','빈털터리'],['침착함','무모함'],['용기','겁쟁이']];

/* 적의 행동 — 주사위로 이루어짐 (웹게임 문서: 적(등반)) */
const ACT={
  '기도':{k:'def',d:[D(8,12)]},
  '지팡이':{k:'atk',d:[A(6,8)]},
  '기습':{k:'atk',d:[A(5,7),A(5,7)]},
  '불씨':{k:'atk',d:[A(3,5)]},
  '낙인':{k:'atk',d:[A(8,12)],vuln:2},
  '고해 강요':{k:'debuff',pend:'discard',desc:'다음 턴 패에서 무작위 1장 버림'},
  '처단':{k:'atk',gim:'guard',d:[A(14,22)]},
  '미스틸테인':{k:'atk',d:[A(6,10)],strip:true},
  '백색의 불꽃':{k:'debuff',pend:'burn',desc:'다음 턴 패에서 1장 소멸'},
  '은빛 소환':{k:'def',d:[D(16,24)]},
  '공양의 칼':{k:'atk',gim:'stagger',d:[A(11,17)]},
  '안 아프게 빨리':{k:'atk',mercy:true},
  '노동':{k:'atk',d:[A(16,16)]},
  /* ===== 1장 적 카드 (V2.32.58.14, 문서 카드 탭) ===== */
  '막기':{k:'def',d:[D(35,50)],cost:1},
  '말뿐인 저주':{k:'atk',d:[A(6,10)],cost:1},
  '훈계':{k:'debuff',neg:1,cost:1,desc:'약화 10',fx:async()=>{pWkAdd(10)}},
  '파문 선고':{k:'debuff',neg:1,cost:2,desc:'대상의 패에서 가장 많은 카드 뭉치에 낙인',fx:async()=>{excommunicate()}},
  '어설픈 베기':{k:'atk',d:[A(60,90)],cost:1},
  '숨 고르기':{k:'sup',cost:0,desc:'드로우 1',fx:async()=>{foeDraw(S.C.E,1)}},
  '무리한 돌격':{k:'atk',d:[A(120,180)],cost:1,acc:-30,selfVuln:3,desc:'명중률 -30%, 사용 후 자신에게 취약 3'},
  '약점 노리기':{k:'atk',d:[A(30,50)],cost:1,wkHunt:1,desc:'약점 노출 대상에게 이번 턴 카드를 쓸 때마다 추가타 15~25, 최대 3회'},
  '명령 이행-베기':{k:'atk',d:[A(100,150)],cost:1},
  '명령 이행-내려찍기':{k:'atk',d:[A(130,190)],cost:2},
  '명령 이행-처단':{k:'atk',d:[A(50,100)],cost:4,purge:1,ult:1,desc:'궁극기'},
  '명령 이행-방패 세우기':{k:'def',d:[D(90,130)],cost:2},
  '명령 이행-빈틈 노리기':{k:'atk',d:[A(50,70)],cost:1,vuln:1},
  '행동-약점 찢기':{k:'atk',d:[A(60,90)],cost:1,expo:.25,desc:'약점 노출 대상에게 데미지 +25%'},
  '행동-표식 강제 부여':{k:'atk',d:[A(30,50)],cost:1,forceMark:1,neg:1,desc:'적중 시 표식Ⅰ\n표식이 있으면 2턴 동안 유지'},
  '행동-파쇄':{k:'atk',d:[A(120,180)],cost:2,shatter:1,desc:'방어도에 2배 데미지, 체력에는 들어가지 않음'},
  '행동-처형 집행':{k:'atk',d:[A(400,600)],cost:3,exec:1,ult:1,desc:'궁극기'},
  '뼈와 살의 해체학':{k:'atk',d:[A(360,540)],cost:3,burstOnly:1,desc:'특수 카드'},
  '으스러트리기':{k:'atk',d:[A(100,150)],cost:2,frac:1,neg:1,desc:'적중 시 골절'},
  '박 살':{k:'atk',d:[A(140,210)],cost:2,fracX:.5,desc:'골절 대상에게 데미지 +50%'},
  '뜯어지는 강타':{k:'atk',d:[A(80,120)],cost:1},
  '망치 돌리기':{k:'sup',cost:0,desc:'드로우 1',fx:async()=>{foeDraw(S.C.E,1)}},
  '명령-베기':{k:'cmd',cost:3,cmd:'명령 이행-베기',desc:'살아 있는 모든 에인헤랴르가 명령 이행-베기를 실행함'},
  '명령-내려찍기':{k:'cmd',cost:3,cmd:'명령 이행-내려찍기',desc:'살아 있는 모든 에인헤랴르가 명령 이행-내려찍기를 실행함'},
  '명령-방패 세우기':{k:'cmd',cost:3,cmd:'명령 이행-방패 세우기',desc:'살아 있는 모든 에인헤랴르가 명령 이행-방패 세우기를 실행함, 방어도는 각 에인헤랴르가 얻음'},
  '명령-빈틈 노리기':{k:'cmd',cost:3,cmd:'명령 이행-빈틈 노리기',desc:'살아 있는 모든 에인헤랴르가 명령 이행-빈틈 노리기를 실행함'},
  '명령-전열 정리':{k:'cmd',cost:3,rally:1,desc:'피해를 받은 에인헤랴르가 다시 명령을 따르고, 에인헤랴르 1명을 더 부름'},
};
/* hp1 = 1레벨 체력. 같은 체력 공식으로 레벨에 따라 오름 — 문서의 체력 범위에서 거꾸로 구한 값 */
const ENEMY={
  priest:{name:'노른교 성직자',tier:'normal',lv:[7,15],hp1:75,st:{hp:[50,100],atk:[25,50],def:[25,50]},acc:80,eva:70,ap:[6,8],art:'priest',
    deck:{'막기':3,'말뿐인 저주':2,'훈계':3,'파문 선고':1},passives:[]},
  cultist:{name:'노르드교 단원',tier:'normal',lv:[10,20],hp1:85,st:{hp:[60,110],atk:[30,55],def:[25,50]},acc:85,eva:75,ap:[3,5],art:'cultist',nord:1,eager:'무리한 돌격',hasty:.33,
    deck:{'어설픈 베기':3,'무리한 돌격':2,'숨 고르기':1,'약점 노리기':2},
    passives:[['점조직','턴 종료 시 체력 50% 이하면 도망침 · 도망치면 보상 실링 없음'],['표식','노르드교 공통 패시브 — 한 턴에 대상을 공격으로 맞히면 다음 턴에 표식Ⅰ, 표식이 붙은 턴에 다시 맞히면 약점 노출, 그다음 턴에 표식 단계가 오름, 최대 Ⅴ, 표식이 붙은 턴에 한 번도 맞히지 못하면 소멸, 단계 1당 표식을 건 쪽에게 받는 데미지 +10%'],['앞선 의욕','행동 포인트로 행동할 때 무리한 돌격 먼저'],['성급함','33% 확률로 행동 포인트 1 추가 소모']]},
  inquisitor:{name:'이단심문관',sub:'에인헤랴르',tier:'elite',lv:[20,30],hp1:200,st:{hp:[150,250],atk:[40,65],def:[40,65]},acc:100,eva:0,ap:[7,9],art:'inquisitor',
    deck:{'명령 이행-베기':3,'명령 이행-내려찍기':2,'명령 이행-처단':1},
    passives:[['새겨진 본능-단죄','이단을 심문할 때만 발동 — 이단 표식이 있는 대상에게 데미지 +25%, 명중률 +10%'],['새겨진 본능-보호','순수유물주의자를 보호할 때만 발동']]},
  bishop:{name:'순수유물주의자',sub:'주교',tier:'boss',lv:45,hp1:160,acc:80,eva:45,art:'bishop',
    deck1:{'뼈와 살의 해체학':1,'으스러트리기':2,'박 살':2,'뜯어지는 강타':3,'망치 돌리기':2},
    deck2:{'명령-베기':3,'명령-내려찍기':2,'명령-방패 세우기':2,'명령-빈틈 노리기':2,'명령-전열 정리':1},
    passives:[['페이즈 1 · 정화','망치로 직접 공격. 상대의 패를 읽지 않고 정해진 순서로 냄 — 망치 돌리기 → 대상이 골절이면 박 살 → 해체학을 낼 코스트가 있으면 해체학 → 골절이 아니면 으스러트리기 → 남은 코스트로 뜯어지는 강타'],
      ['페이즈 2 · 단죄','에인헤랴르를 지휘함. 행동 포인트 3, 모든 카드 3코스트, 명령은 살아 있는 모든 에인헤랴르에게 적용'],
      ['보존','페이즈 2: 자신의 총 드로우와 총 코스트가 변경되지 않음, 턴이 지나도 영향받지 않음'],
      ['간절한 기도','페이즈 2: 자신의 행동 포인트가 전부 소모되면 즉시 자신의 코스트를 최대로 회복함'],
      ['행동 예측','페이즈 2: 상대방의 패를 읽음 — 피해를 받은 에인헤랴르가 있으면 명령-전열 정리, 상대가 낼 수 있는 공격 카드를 들고 있으면 방어도 없는 에인헤랴르가 있을 때 명령-방패 세우기 · 아니면 명령-빈틈 노리기, 그 밖에는 공격 명령'],
      ['새겨진 본능-보호','페이즈 2: 살아 있는 무작위 에인헤랴르가 보스가 받을 데미지를 50% 확률로 대신 맞거나 50% 확률로 75%만 대신 맞음, 에인헤랴르가 전부 쓰러지면 보스가 데미지를 입음']]},
  einherjar:{name:'에인헤랴르',sub:'명령-보호',tier:'elite',lv:[20,30],hp1:200,st:{hp:[150,250],atk:[40,65],def:[40,65]},acc:100,eva:0,art:'inquisitor',knight:1,deck:{},
    passives:[['새겨진 본능-보호','순수유물주의자가 받을 데미지를 대신 받음'],['명령','행동 포인트와 카드가 없음, 순수유물주의자가 명령한 카드만 에인헤랴르 본연의 스탯으로 사용'],['원호 방어','피해를 받은 턴에는 어떤 명령을 받아도 명령 이행-방패 세우기만 함'],['퇴각과 교대','턴 종료 시 체력이 50% 이하인 처음 2명은 퇴각함, 수복으로 채운 에인헤랴르도 포함, 늘어난 에인헤랴르는 처치되지 않으면 퇴각하지 않음']]},
};

const BOSS_LINES={};/* 보스 대사 없음 — 글은 문서 보류 탭 */
const angerLine=n=>BOSS_LINES['anger'+n];
/* V32 은빛 기사: 보스가 소환하는 적 캐릭터. 살아 있는 동안 보스 대신 피해를 받음 */
/* 은빛 기사 2명 — 대상 지정 불가, 명령-보호: 살아 있는 무작위 1명이 보스의 피해를 50%는 전부, 50%는 75%만 대신 맞고, 대신 맞은 기사는 다음 턴에 움직이지 않음 */
const knAlive=E=>liveFoes().filter(f=>f.knight);
const KN_MAX=7,KN_DMG=.03;/* 에인헤랴르 피해 보정은 Claude 임시 값 */
function addKnight(extra){const C=S.C;if(!C||C.over)return null;if(!C.foes)C.foes=[C.E];if(knAlive().length>=KN_MAX)return null;
  const k=makeEnemy('einherjar');k.traits=[];k.maxHp=Math.max(1,Math.round(k.maxHp*.5));k.knight=1;k.extra=!!extra;k.noAct=1;k.dmgMul=KN_DMG;k.hurtT=-1;k.c=0;k.cMax=0;k.ap=0;k.apMax=0;k.hand=[];k.used=[];
  let _hp=k.maxHp;Object.defineProperty(k,'hp',{enumerable:true,configurable:true,get(){return _hp},set(v){if(v<_hp&&S.C)k.hurtT=S.C.turn;_hp=v}});
  C.foes.push(k);clog(`에인헤랴르 소환${extra?' (늘어난 에인헤랴르)':''} · 체력 ${k.maxHp}`,'e');return k}
function summonKnights(){for(let i=0;i<2;i++)addKnight(false);fxAt('enemy','에인헤랴르 소환','info');renderCombat()}
function knightTake(d){const C=S.C,ks=knAlive();if(!ks.length||d<=0)return d;const k=pick(ks),take=rnd()<.5?d:Math.ceil(d*.75),bl=Math.min(k.block||0,take),part=Math.min(k.hp,take-bl),rest=d-bl-part;
  if(bl)k.block-=bl;k.hp=Math.max(0,k.hp-part);fxAt('enemy',`에인헤랴르 -${part}`,'info');clog(`새겨진 본능-보호: 에인헤랴르가 대신 받음 ${take}${bl?` (방어도 ${bl})`:''} · 체력 -${part} (남은 체력 ${k.hp})${rest?` · 보스 -${rest}`:''}`,'e');
  if(k.hp<=0){k.dead=true;clog('에인헤랴르가 쓰러졌다','e')}renderCombat();return rest}
/* 턴 종료: 퇴각과 교대 → 수복(2명까지) → 에인헤랴르 +1명 (최대 7명) */
function knightUpkeep(){const C=S.C;if(!C||C.over)return;let out=0;
  if(!C.foes)return;
  C.foes=C.foes.filter(f=>{if(!f.knight)return true;if(!alive(f)){out++;return false}if(!f.extra&&f.hp<=f.maxHp*.5){clog(`${f.name} 퇴각 (체력 50% 이하)`,'e');out++;return false}return true});
  if(!alive(C.E)||!C.foes.includes(C.E))C.E=C.foes.find(f=>f.boss)||liveFoes()[0];
  let n=knAlive().filter(k=>!k.extra).length;while(n<2){if(!addKnight(false))break;n++}
  addKnight(true);toast('에인헤랴르',`${knAlive().length}명`);renderCombat()}
/* V32 페이즈 전환: 체력이 1 이하로 떨어지면 턴 종료 후 특수 대사(컷신)를 보여 주고 다시 재개 */
async function bossPhaseCut(){
  const C=S.C,E=C.E,p=E.pendPhase;E.pendPhase=0;if(!p||C.over)return;
  if(E.key==='clerk'){E.phase=2;E.idx=0;E.block=0;await wait(400);E.hp=E.maxHp;fxAt('enemy',`+${E.maxHp}`,'heal');toast('페이즈 2','기입관이 서류를 새로 편다');clog('페이즈 2 — 체력 전부 회복','e');chooseIntent();renderCombat();await wait(300);return}
  if(p===2){
    E.phase=2;E.idx=0;foeRedeal(E);E.apMax=3;E.ap=3;E.cMax=3;E.c=3;
    summonKnights();await wait(600);
    E.hp=E.maxHp;fxAt('enemy',`+${E.maxHp}`,'heal');toast('페이즈 2 · 단죄','순수유물주의자가 에인헤랴르를 지휘한다');clog('페이즈 2 · 단죄 — 체력 전부 회복, 에인헤랴르 2명 소환','e');
  }
  renderCombat();await wait(300);
}
/* 은빛 기사 행동: 보호 위주 — 보스에게 방어도 80~120, 3번째 행동마다 약한 공격 30~50, 대신 맞은 기사는 다음 턴 행동 없음 */
async function knightAct(){return}/* 옛 은빛 기사 행동 — 에인헤랴르는 명령으로만 움직임 */
function knightCheck(){return;
  const E=S.C&&S.C.E;if(!E||!E.knightMax)return;
  E.knight=Math.min(E.knight,E.block);
  if(E.knight<=0){E.knightMax=0;say(BOSS_LINES.knightDead);clog('은빛 기사가 쓰러졌다','e');return}
  if(!E.knightHurt&&E.knight<=E.knightMax*.3){E.knightHurt=1;say(BOSS_LINES.knightHurt)}
}

/* 적 그림 — 에셋이 생기면 ENEMY_IMG에 이미지 주소(또는 data: URI)를 넣으면 그 그림으로 바뀜 */
const ENEMY_IMG={/* priest:'data:image/png;base64,...' */};
/* 순수유물주의자 에셋 (사용자 제공 시트) — 몸은 그대로, 얼굴(표정 모음 8종)만 바뀜 */
const BISHOP_BODY='';
/* 표정 패치: 몸 그림 얼굴 위치(146,64)~(222,128)에 겹침 */
const BISHOP_FACE={};
/* 표정 바꾸는 시점 (임시 배치):
   기본 — 페이즈 1 무표정 / 페이즈 2 광기 / 페이즈 3 광신도, 체력 30% 이하(페이즈 1·2)는 피격(중상)
   대사가 나오면 그 대사에 맞는 표정, 피해를 받으면 잠깐 피격(경미) — 최대 체력 10% 이상이면 피격(중상) */
const LINE_FACE=new Map([
  [BOSS_LINES.start,'annoyed'],[BOSS_LINES.anger1,'mad'],[BOSS_LINES.anger2,'mad'],[BOSS_LINES.anger3,'blank'],
  [BOSS_LINES.p2hp,'annoyed'],[BOSS_LINES['백색의 불꽃'],'zealot'],[BOSS_LINES['미스틸테인'],'neutral'],
  [BOSS_LINES['은빛 소환'],'mad'],[BOSS_LINES.knightHurt,'mad'],[BOSS_LINES.knightDead,'hurt2'],
  [BOSS_LINES.human,'annoyed'],[BOSS_LINES.mercy,'mad'],[BOSS_LINES['안 아프게 빨리'],'mad'],[BOSS_LINES.survived,'blank'],
]);
let faceTO=0;
const isBishop=()=>{const E=S.C&&S.C.E;return !!(E&&E.key==='bishop'&&S.screen==='combat')};
function bishopFace(){
  if(!isBishop())return;const E=S.C.E;
  let f=E.phase===2?'mad':'neutral';
  if(E.hp>0&&E.hp<=E.maxHp*.3)f='hurt2';
  if(E.faceT&&Date.now()<E.faceT.until)f=E.faceT.k;
  const img=$('#eart img.bface');if(img&&img.dataset.f!==f){img.dataset.f=f;img.src=BISHOP_FACE[f]}
}
function setFace(k,ms,soft){
  if(!isBishop())return;const E=S.C.E;
  if(soft&&E.faceT&&E.faceT.line&&Date.now()<E.faceT.until)return; // 대사 표정이 우선
  E.faceT={k,until:Date.now()+ms,line:!soft};bishopFace();clearTimeout(faceTO);faceTO=setTimeout(bishopFace,ms+30);
}
const hurtFace=loss=>{if(loss>0&&isBishop())setFace(loss>=S.C.E.maxHp*.1?'hurt2':'hurt1',1300,true)};
const ENEMY_SVG={
priest:`<svg viewBox="0 0 240 360" preserveAspectRatio="xMidYMax meet"><defs>
<linearGradient id="prR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8d1c1"/><stop offset=".5" stop-color="#9b9383"/><stop offset="1" stop-color="#47433b"/></linearGradient>
<radialGradient id="prS" cx=".42" cy=".28" r=".8"><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient></defs>
<ellipse class="pt-shadow" cx="120" cy="350" rx="96" ry="10" fill="#000" opacity=".5"/>
<g class="pt pt-body" style="transform-origin:120px 348px"><g class="pt pt-armR pt-back" style="transform-origin:160px 140px"><g class="pt pt-wpn" style="transform-origin:186px 176px"><rect x="183" y="46" width="6" height="304" rx="3" fill="#4d3c28"/><path d="M186 18c-15 6-15 27 0 32 15-5 15-26 0-32z" fill="none" stroke="#c8a56c" stroke-width="3"/><path d="M181 50q-7 34-2 66M186 52q0 38 2 70M191 50q7 34 2 62" stroke="#d4c19a" stroke-width="1.6" fill="none"/></g></g><path d="M120 28C87 28 73 62 75 97 57 131 49 212 38 348h164c-10-136-18-217-36-251 2-35-12-69-46-69z" fill="url(#prR)"/><path d="M120 28C87 28 73 62 75 97 57 131 49 212 38 348h164c-10-136-18-217-36-251 2-35-12-69-46-69z" fill="url(#prS)"/><g class="pt pt-head" style="transform-origin:120px 104px"><path d="M120 54c-21 0-28 23-26 44 4 19 48 19 52 0 2-21-5-44-26-44z" fill="#08090b"/></g><g class="pt pt-armL" style="transform-origin:120px 158px"><path d="M82 152c-15 40-10 70 14 82l24-6 24 6c24-12 29-42 14-82" fill="#7e786b"/></g><g class="pt pt-armR" style="transform-origin:160px 140px"><ellipse cx="186" cy="176" rx="11" ry="9" fill="#8a8273"/></g><g stroke="#5e4b2f" stroke-width="2.6"><path d="M108 254v58M120 248v70M132 254v58"/></g><path d="M98 240 88 348M142 240l12 108M120 262v86" stroke="#2d2b27" stroke-width="2" opacity=".5"/></g></svg>`,
cultist:`<svg viewBox="0 0 240 360" preserveAspectRatio="xMidYMax meet"><defs>
<linearGradient id="cuR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3b30"/><stop offset=".6" stop-color="#2f211d"/><stop offset="1" stop-color="#140e0c"/></linearGradient>
<radialGradient id="cuE"><stop offset="0" stop-color="#ffd08a"/><stop offset=".4" stop-color="#e4793a"/><stop offset="1" stop-color="#e4793a" stop-opacity="0"/></radialGradient>
<linearGradient id="cuB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8ecef"/><stop offset="1" stop-color="#6c747c"/></linearGradient></defs>
<ellipse class="pt-shadow" cx="120" cy="350" rx="100" ry="10" fill="#000" opacity=".5"/>
<g class="pt pt-body" style="transform-origin:120px 345px"><path d="M120 92c-28 0-40 26-38 50-24 32-42 102-54 200l14-10 12 12 14-12 14 12 12-10 14 12 12-12 14 12 12-12 14 10 14-12 14 12c-12-96-28-168-52-202 2-24-10-50-38-50z" fill="url(#cuR)"/><g class="pt pt-head" style="transform-origin:120px 124px"><path d="M120 112c-18 0-24 18-22 34 3 15 41 15 44 0 2-16-4-34-22-34z" fill="#060505"/><circle cx="111" cy="134" r="9" fill="url(#cuE)"/><circle cx="129" cy="134" r="9" fill="url(#cuE)"/></g><g class="pt pt-armL" style="transform-origin:92px 160px"><g class="pt pt-wpn pt-wpnL" style="transform-origin:65px 236px"><path d="M62 230 30 258l6 6 34-24z" fill="url(#cuB)"/><path d="M66 222l-8 20 14 4z" fill="#3a2a22"/></g></g><g class="pt pt-armR" style="transform-origin:148px 160px"><g class="pt pt-wpn pt-wpnR" style="transform-origin:171px 238px"><path d="M176 232l40 18-3 8-42-14z" fill="url(#cuB)"/><path d="M172 222l6 22-14 2z" fill="#3a2a22"/></g></g><path d="M92 196q28 18 56 0" stroke="#7a4a38" stroke-width="3" fill="none"/><path d="M150 150c18 6 26 20 30 40" stroke="#1a1210" stroke-width="3" fill="none" opacity=".7"/></g></svg>`,
inquisitor:`<svg viewBox="0 0 240 380" preserveAspectRatio="xMidYMax meet"><defs>
<linearGradient id="inS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f3f5"/><stop offset=".45" stop-color="#a7b0b9"/><stop offset="1" stop-color="#3b4249"/></linearGradient>
<linearGradient id="inT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4456"/><stop offset="1" stop-color="#1b1820"/></linearGradient></defs>
<ellipse class="pt-shadow" cx="118" cy="370" rx="92" ry="10" fill="#000" opacity=".5"/>
<g class="pt pt-body" style="transform-origin:120px 366px"><g class="pt pt-armR pt-back" style="transform-origin:181px 134px"><g class="pt pt-wpn" style="transform-origin:199px 216px"><g class="wpn inq-sword"><rect x="196" y="8" width="7" height="362" rx="3" fill="#2d2a26"/>
<path d="M199 10c22 8 30 30 24 52l-24-12zM199 10c-14 10-16 30-8 44l8-6z" fill="url(#inS)"/></g></g></g><g class="pt pt-head" style="transform-origin:120px 94px"><path d="M120 14c-22 0-30 22-28 46l2 32h52l2-32c2-24-6-46-28-46z" fill="url(#inS)"/><path d="M104 52h12M124 52h12" stroke="#0b0c0e" stroke-width="4" stroke-linecap="round"/><path d="M120 22v60" stroke="#ffffff55" stroke-width="1.5"/></g><path d="M86 96h68l10 16H76z" fill="#6f7780"/><ellipse cx="72" cy="122" rx="28" ry="20" fill="url(#inS)"/><ellipse cx="168" cy="122" rx="28" ry="20" fill="url(#inS)"/><path d="M82 112h76l-6 100H88z" fill="url(#inS)"/><path d="M92 200h56l14 120h-84z" fill="url(#inT)"/><path d="M120 226c-10 14-10 26 0 40 10-14 10-26 0-40z" fill="#eef2f6" opacity=".85"/><g class="pt pt-armL" style="transform-origin:63px 134px"><path d="M52 130l-10 90 18 4 12-90z" fill="#8a929b"/></g><g class="pt pt-armR" style="transform-origin:181px 134px"><path d="M188 130l10 86-16 6-8-88z" fill="#8a929b"/>
<rect x="186" y="208" width="20" height="16" rx="4" fill="#9aa3ac"/></g><g class="pt pt-legs" style="transform-origin:120px 320px"><path d="M94 320l-6 46h22l4-46zM126 320l2 46h22l-4-46z" fill="#5f666e"/></g></g></svg>`,
bishop:`<svg viewBox="0 0 260 400" preserveAspectRatio="xMidYMax meet"><defs>
<linearGradient id="biR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f2ee"/><stop offset=".55" stop-color="#c6c9cd"/><stop offset="1" stop-color="#6d7279"/></linearGradient>
<linearGradient id="biG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c98e"/><stop offset="1" stop-color="#8d6a37"/></linearGradient>
<radialGradient id="biF"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#dfeaf5" stop-opacity=".9"/><stop offset="1" stop-color="#bcd3ea" stop-opacity="0"/></radialGradient>
<radialGradient id="biSh" cx=".4" cy=".25" r=".85"><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient></defs>
<ellipse class="pt-shadow" cx="130" cy="390" rx="110" ry="11" fill="#000" opacity=".5"/>
<g class="pt pt-body" style="transform-origin:130px 390px"><g class="pt pt-head" style="transform-origin:130px 126px"><path d="M130 0l-26 44 2 40h48l2-40z" fill="url(#biR)"/><path d="M130 0v84" stroke="url(#biG)" stroke-width="6"/><path d="M106 70h48" stroke="url(#biG)" stroke-width="5"/><ellipse cx="130" cy="104" rx="22" ry="26" fill="#2a2c30"/><path d="M114 100q16 10 32 0" stroke="#0e0f11" stroke-width="2" fill="none"/></g><path d="M84 128c-30 40-52 140-66 262h224c-14-122-36-222-66-262-14-6-26-8-46-8s-32 2-46 8z" fill="url(#biR)"/><path d="M84 128c-30 40-52 140-66 262h224c-14-122-36-222-66-262-14-6-26-8-46-8s-32 2-46 8z" fill="url(#biSh)"/><path d="M112 124l-8 266h20l6-240 6 240h20l-8-266z" fill="url(#biG)" opacity=".9"/><g class="pt pt-armL" style="transform-origin:92px 136px"><path d="M84 132c-18 20-30 44-34 66l20 8c6-22 16-42 30-58z" fill="#d6d8db"/><ellipse cx="52" cy="214" rx="11" ry="10" fill="#cfc6b6"/><g class="pt pt-fx" style="transform-origin:50px 176px"><circle cx="50" cy="176" r="46" fill="url(#biF)"/><path d="M50 140c-14 18-18 30-10 46 4 8 16 8 20 0 6-14 2-30-10-46z" fill="#fff"/></g></g><path d="M176 132c10 30 12 70 8 110" stroke="#9aa0a7" stroke-width="2" fill="none" opacity=".6"/><g class="pt pt-armR" style="transform-origin:176px 136px"><g class="pt pt-wpn" style="transform-origin:200px 240px"><g class="hammer"><path class="hm-blade" d="M195.5 336h7l-3.5 54z" fill="#e4eaef" stroke="#8d969e" stroke-width="1"/><rect class="hm-l" x="195" y="148" width="4.5" height="190" fill="#5a4630"/><rect class="hm-r" x="199.5" y="148" width="4.5" height="190" fill="#463622"/><rect x="176" y="122" width="48" height="30" rx="4" fill="#8f9297" stroke="#55585d" stroke-width="2"/><path d="M180 128h40" stroke="#c9ccd1" stroke-width="2"/><ellipse cx="200" cy="240" rx="10" ry="9" fill="#cfc6b6"/></g></g></g></g></svg>`,
};

