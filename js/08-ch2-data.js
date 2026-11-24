"use strict";
/* ================= V19 · 2장 니다벨리르 — 데이터 (웹게임 문서: 2장 니다벨리르 · 공방 카드 · 공방 장비 · 보유 효과 장비 · 니다벨리르 사건) ================= */
/* 공방 카드 (니다벨리르) — 희귀(고급)·영웅(희귀) 등급. ws: 어느 공방의 카드인지 (계약 파기 전투에서 사용 금지 판정) */
Object.assign(CARDS,{
  s2_vent:{name:'압력 배출',cost:1,type:'skill',rar:'uncommon',ws2:'stein',text:'자신의 증기를 전부 없애고, 없앤 증기 1당 방어 20',flavor:''},
  s2_over:{name:'과열 가동',cost:0,type:'skill',rar:'uncommon',ws2:'stein',draw:1,text:'자신에게 증기 10, 드로우 1',flavor:''},
  s2_valve:{name:'냉각수 밸브',cost:1,type:'skill',rar:'rare',ws2:'stein',text:'대상에게 냉매 3, 자신의 증기 -10, 코스트 +1',flavor:''},
  s2_piston:{name:'수동 피스톤',cost:2,type:'atk',rar:'rare',ws2:'stein',d:[A(45,65),A(45,65),A(45,65)],text:'공격 45~65 × 3, 자신에게 열기가 있으면 × 5',flavor:''},
  k2_spray:{name:'냉기 분사',cost:1,type:'skill',rar:'uncommon',ws2:'kriv',draw:1,text:'대상에게 냉매 3, 드로우 1',flavor:''},
  k2_warm:{name:'온기 주머니',cost:0,type:'skill',rar:'uncommon',ws2:'kriv',draw:2,exhaust:true,text:'자신의 냉매·냉동을 모두 없앰, 드로우 2, 코스트 +1, 소멸',flavor:''},
  k2_keep:{name:'체온 유지',cost:1,type:'power',rar:'rare',ws2:'kriv',text:'지속\n매 턴 시작 시 자신의 냉매 -1, 방어 35~50',flavor:''},
  k2_break:{name:'얼음 깨기',cost:2,type:'atk',rar:'rare',ws2:'kriv',d:[A(140,190)],text:'공격 140~190, 대상이 냉동이면 깨짐 +2단계',flavor:''},
  a2_stand:{name:'진열대',cost:0,type:'skill',rar:'uncommon',ws2:'ash',draw:2,exhaust:true,text:'예술적 감각 +1, 드로우 2, 소멸',flavor:''},
  a2_talk:{name:'해설',cost:1,type:'skill',rar:'uncommon',ws2:'ash',draw:2,text:'다음 카드 2장 코스트 -1, 드로우 2',flavor:''},
  a2_cert:{name:'감정서',cost:0,type:'skill',rar:'rare',ws2:'ash',exhaust:true,text:'작품-준비가 있으면 턴마다 50% 확률로 패에 들어옴, 50% 확률로 작품-준비를 작품-완성으로 만듦, 소멸',flavor:''},
  a2_copy:{name:'유물 모사화',cost:2,type:'skill',rar:'rare',ws2:'ash',exhaust:true,text:'덱의 특수무기 카드 1장 효과를 그대로 발동, 소멸',flavor:''},
  r2_soup:{name:'고기 수프',cost:1,type:'skill',rar:'uncommon',ws2:'remi',food:2,heal:25,exhaust:true,text:'음식\n체력 25 회복, 먹기 +2, 소멸',flavor:''},
  r2_tea:{name:'진한 차',cost:0,type:'skill',rar:'uncommon',ws2:'remi',food:1,exhaust:true,text:'음식\n코스트 +2, 먹기 +1, 소멸',flavor:''},
  r2_ration:{name:'보존식',cost:1,type:'skill',rar:'rare',ws2:'remi',food:3,heal:15,keep:true,text:'음식 · 보존\n체력 15 회복, 먹기 +3',flavor:''},
  r2_meal:{name:'레미 정식',cost:2,type:'skill',rar:'rare',ws2:'remi',food:5,exhaust:true,text:'음식\n먹기 +5, 이번 전투 동안 공격레벨 +15, 방어레벨 +15, 소멸',flavor:''},
  m2_bolt:{name:'조잡한 전격',cost:1,type:'skill',rar:'uncommon',ws2:'krim',text:'상대에게 전격 1 부여',flavor:''},
  m2_burn:{name:'조잡한 화염',cost:1,type:'skill',rar:'uncommon',ws2:'krim',text:'상대에게 소각 5 부여',flavor:''},
  m2_proto:{name:'시제품 덩어리',cost:1,type:'skill',rar:'rare',ws2:'krim',text:'대상에게 무작위 부정적 키워드 3개',flavor:''},
  m2_sure:{name:'완벽에 가까운 모작품',cost:2,type:'atk',rar:'rare',ws2:'krim',acc:99,d:[A(120,170)],text:'공격 120~170, 명중 + 99%',flavor:''},
  /* 아쉬부티 고유 키워드로 생기는 카드 (전투 안에서만) */
  persuade:{name:'설득하기',cost:0,type:'skill',rar:'common',gen:true,exhaust:true,text:'견습생의 작품 제작 +5~8%, 소멸',flavor:'',fx(){cadetWork(ri(5,8),'설득하기')}},
  opinion:{name:'의견제시',cost:0,type:'skill',rar:'common',gen:true,exhaust:true,text:'견습생의 작품 제작 +10~20%, 소멸',flavor:'',fx(){cadetWork(ri(10,20),'의견제시')}},
  art_wip:{name:'작품-준비',type:'skill',rar:'common',unplayable:true,gen:true,keep:true,text:'사용 불가 · 보존\n턴이 지나도 유지, 턴마다 5~20% 확률로 소멸하고 작품-완성 카드를 패에 추가, 전투 종료 시 소멸',flavor:''},
  art_done:{name:'작품-완성',type:'skill',rar:'common',unplayable:true,gen:true,keep:true,text:'사용 불가 · 보존\n패에 있으면 공격 위력 +200%, 공격 위력 최대치, 드로우 3, 코스트 +2\n예술적 감각이 다시 쌓이거나 전투 종료 시 소멸',flavor:''},
});
CARDS.hardtack.food=1;CARDS.hardtack.ws2='remi';CARDS.steam.ws2='stein';CARDS.ornament.ws2='ash';CARDS.mimic.ws2='krim';
const WS2={stein:{n:'스타인러 공방',dir:'E',cards:['steam','s2_vent','s2_over','s2_valve','s2_piston']},
  kriv:{n:'크리뷔스 공방',dir:'N',cards:['k2_spray','k2_warm','k2_keep','k2_break']},
  ash:{n:'아쉬부티 공방',dir:'S',cards:['ornament','a2_stand','a2_talk','a2_cert','a2_copy']},
  remi:{n:'레미 공방',dir:'W',cards:['r2_soup','r2_tea','r2_ration','r2_meal']},/* 건빵은 일반 등급이라 니다벨리르에 나오지 않음 */
  krim:{n:'크리밀라 공방',dir:'C',cards:['mimic','m2_bolt','m2_burn','m2_proto','m2_sure']}};
/* 니다벨리르 상점 카드 가격 (공방 카드 · 기존 공방 카드의 니다벨리르 가격) */
const CARD_PRICE2={ornament:25000,steam:26000,mimic:38000,
  s2_vent:30000,s2_over:35000,s2_valve:120000,s2_piston:150000,k2_warm:25000,k2_spray:30000,k2_keep:120000,k2_break:150000,
  a2_talk:35000,a2_stand:40000,a2_cert:180000,a2_copy:300000,r2_soup:30000,r2_tea:35000,r2_ration:120000,r2_meal:150000,
  m2_bolt:35000,m2_burn:40000,m2_proto:120000,m2_sure:150000};

/* 공방 추가 카드 60종 — 문서 일반덱(카드) · 공방 추가 카드 */
const WC=(ws,name,cost,rar,o)=>({name,cost,rar,ws2:ws,type:o.type||(o.d&&o.d.some(x=>x.t==='atk')?'atk':o.d&&o.d.some(x=>x.t==='def')?'def':'skill'),flavor:'',...o});
const selfSteam=n=>a2Give('steam',n),lessSteam=n=>{const C=S.C;C.pSteam=Math.max(0,(C.pSteam||0)-n)},lessCool=n=>{const C=S.C;C.pCool=Math.max(0,(C.pCool||0)-n)},artUp=n=>{S.C.artOn=true;artAdd(n)};
const WCARDS={
 w_s1:WC('stein','어설픈 망치질',1,'uncommon',{d:[A(60,85)],text:'공격 60~85, 자신에게 증기 3',fx(){selfSteam(3)}}),
 w_s2:WC('stein','증기 밸브 잠금',1,'uncommon',{d:[D(35,50)],text:'방어 35~50, 자신에게 증기 2',fx(){selfSteam(2)}}),
 w_s3:WC('stein','압력계 확인',1,'uncommon',{type:'skill',gainE:1,text:'코스트 회복 1, 자신의 증기가 10 이상일시 해당 증기를 즉시 열기 1로 바꿈',fx(){const C=S.C;if((C.pSteam||0)>=10){C.pSteam-=10;C.heat=Math.min(heatCap(true),(C.heat||0)+1);fxAt('player','증기 10 → 열기 +1','info');clog('압력계 확인: 증기 10 → 열기 +1')}}}),
 w_s4:WC('stein','증기 장막',1,'uncommon',{type:'def',text:'자신의 증기를 전부 소모해 1당 방어 10',fx(){const C=S.C,n=C.pSteam||0;C.pSteam=0;if(n)gainBlock(n*10,0,'증기 장막');else clog('증기 장막: 증기가 없다')}}),
 w_s5:WC('stein','임시 과열',1,'uncommon',{text:'체력 10% 소모, 증기 20을 소모해 열기 3 획득',fx(){const C=S.C,r=S.run;r.hp=Math.max(1,r.hp-Math.round(r.maxHp*.1));C.pSteam=Math.max(0,(C.pSteam||0)-20);C.heat=Math.min(heatCap(true),(C.heat||0)+3);fxAt('player','열기 +3','info')}}),
 w_s6:WC('stein','증기 분사',1,'uncommon',{d:[A(10,50)],text:'대상에게 증기 5 데미지 10~50',fx(){a2Hit('steam',5)}}),
 w_s7:WC('stein','증기 섭취',0,'uncommon',{gainE:1,text:'코스트 +1, 자신에게 증기 3',fx(){selfSteam(3)}}),
 w_s8:WC('stein','매연 뿜기',0,'uncommon',{draw:1,text:'자신의 증기 -5, 드로우 1',fx(){lessSteam(5)}}),
 w_s9:WC('stein','뚝딱',2,'rare',{d:[A(150,190)],flatFn:C=>(C.heat||0)*30,text:'공격 150~190, 열기 1당 피해 +30'}),
 w_s10:WC('stein','망치질은 이렇게',3,'rare',{d:[A(260,340)],flatFn:C=>(C.heat||0)*50,text:'공격 260~340, 열기를 전부 소모해 1당 피해 +50',fx(){S.C.heat=0}}),
 w_s11:WC('stein','증기 갑주',2,'rare',{type:'power',text:'지속\n턴이 끝날 때 증기 5당 방어 20',fx(){S.C.steamArmor=(S.C.steamArmor||0)+1}}),
 w_s12:WC('stein','연막 배출',1,'rare',{type:'def',d:[V(20,26)],text:'회피 20~26, 자신의 증기 -5',fx(){lessSteam(5)}}),
 w_s13:WC('stein','장인의 휴식',1,'rare',{heal:25,exhaust:true,text:'체력 25 회복, 자신에게 증기 3, 소멸',fx(){selfSteam(3)}}),
 w_s14:WC('stein','엘더의 조언',1,'rare',{draw:3,exhaust:true,text:'드로우 3, 자신에게 증기 3, 소멸',fx(){selfSteam(3)}}),
 w_s15:WC('stein','장인의 고집',2,'rare',{type:'power',text:'지속\n열기 최대치 +2, 열기가 턴마다 줄지 않음',fx(){const C=S.C;C.heatHold=1;C.heatCapAdd=(C.heatCapAdd||0)+2}}),
 w_k1:WC('kriv','고드름 던지기',1,'uncommon',{d:[A(65,90)],xFn:(C,E)=>(E.frozen||E.frozeSkip)?2:1,text:'공격 65~90, 대상이 냉동이면 피해 2배'}),
 w_k2:WC('kriv','눈벽 쌓기',1,'uncommon',{d:[D(35,50)],text:'방어 35~50, 대상에게 냉매 1',fx(){a2Hit('cool',1)}}),
 w_k3:WC('kriv','냉각관 연결',1,'uncommon',{d:[D(20,30)],text:'방어 20~30, 대상에게 냉매 2',fx(){a2Hit('cool',2)}}),
 w_k4:WC('kriv','눈보라 속으로',1,'uncommon',{type:'def',d:[V(12,18)],text:'회피 12~18, 대상에게 냉매 1',fx(){a2Hit('cool',1)}}),
 w_k5:WC('kriv','얼음 찜질',1,'uncommon',{heal:12,text:'체력 12 회복, 자신의 냉매 -1',fx(){lessCool(1)}}),
 w_k7:WC('kriv','연차 수당',0,'uncommon',{text:'3턴째부터 코스트 +1, 드로우 1',fx(){const C=S.C;if(C.turn>=3){C.energy+=1;drawN(1)}}}),
 w_k8:WC('kriv','따뜻한 한마디',0,'uncommon',{heal:5,text:'자신의 냉매 -2, 체력 5 회복',fx(){lessCool(2)}}),
 w_k9:WC('kriv','화가 난 고참',2,'rare',{d:[A(150,190)],xFn:(C,E)=>1+(E.cool||0)*.1,text:'공격 150~190, 대상의 냉매 1당 피해 +10%'}),
 w_k10:WC('kriv','눈사태',3,'rare',{d:[A(240,320)],xFn:(C,E)=>1+.5*(E.crack||0),text:'공격 240~320, 대상의 깨짐을 전부 소모해 단계당 피해 +50%',fx(){if(S.C.E)S.C.E.crack=0}}),
 w_k11:WC('kriv','얼음판',1,'rare',{type:'def',d:[V(20,26)],text:'회피 20~26, 대상의 다음 공격 명중 -20',fx(){S.C.E.frost=true}}),
 w_k12:WC('kriv','뜨거운 국물',1,'rare',{heal:25,exhaust:true,text:'체력 25 회복, 자신의 냉매를 전부 없앰, 소멸',fx(){S.C.pCool=0}}),
 w_k13:WC('kriv','고참의 경고',1,'rare',{text:'대상 깨짐 +1단계, 대상의 다음 공격 명중 -20',fx(){const C=S.C,E=C.E;E.crack=Math.min(3,(E.crack||0)+1);E.crackT=C.turn;E.frost=true}}),
 w_k14:WC('kriv','끊이지 않는 추위',2,'rare',{type:'power',text:'지속\n매 턴 시작 시 대상에게 냉매 1',fx(){S.C.coldAuto=(S.C.coldAuto||0)+1}}),
 w_k15:WC('kriv','살아남기',2,'rare',{type:'power',text:'지속\n이번 전투 턴 수 1당 공격 카드 피해 +5',fx(){S.C.lateDmg=(S.C.lateDmg||0)+1}}),
 w_a1:WC('ash','납치 권유',1,'uncommon',{d:[A(50,70)],text:'공격 50~70, 대상의 다음 공격 명중 -20',fx(){S.C.E.frost=true}}),
 w_a3:WC('ash','돌려 막기',1,'uncommon',{d:[D(35,50)],defFn:(C,v)=>C.lastKind==='def'?v*2:v,text:'방어 35~50, 직전 카드와 같은 종류면 방어 2배'}),
 w_a4:WC('ash','특색 있는 의상',1,'uncommon',{type:'def',d:[V(12,18),D(15,25)],text:'회피 12~18, 방어 15~25'}),
 w_a5:WC('ash','치유의 실',1,'uncommon',{text:'자신의 예술적 감각당 체력 25 회복, 작품-완성이나 작품-준비가 있으면 대신 체력 100 회복',fx(){const C=S.C,w=C.hand.some(x=>x.id==='art_wip'||x.id==='art_done');const n=w?100:(C.art||0)*25;if(n)heal(n);else clog('치유의 실: 예술적 감각이 없다')}}),
 w_a6:WC('ash','곡해 주입',1,'uncommon',{text:'대상의 행동 포인트 +3, 대상의 코스트 -1',fx(){const E=S.C.E;E.ap+=3;E.c=Math.max(0,(E.c||0)-1);fxAt('enemy','행동 포인트 +3 · 코스트 -1','info')}}),
 w_a7:WC('ash','억지 해석',0,'uncommon',{text:'예술적 감각 +1, 패 1장 버림',async fx(){artUp(1);await pickToss(1,'억지 해석')}}),
 w_a8:WC('ash','실 한 가닥',0,'uncommon',{draw:1,text:'드로우 1, 패에 다른 실 한 가닥이 있으면 드로우 1',fx(c){if(S.C.hand.some(x=>x.id===c.id&&x.uid!==c.uid))drawN(1)}}),
 w_a9:WC('ash','고증 완료',2,'rare',{d:[A(150,190)],xFn:(C)=>((C.useN&&C.useN.w_a9)||0)===2?2:1,text:'공격 150~190, 이번 전투 세 번째 사용시 피해 2배'}),
 w_a10:WC('ash','실 타기',1,'rare',{type:'def',d:[V(20,20)],draw:1,text:'회피 20, 드로우 1'}),
 w_a11:WC('ash','실 엮기',0,'rare',{heal:25,text:'체력 25 회복, 실 카드 1장 드로우',fx(c){const C=S.C,isT=x=>x.uid!==c.uid&&CARDS[x.id].name.includes('실');let pool=C.draw.filter(isT),from=C.draw;if(!pool.length){pool=C.disc.filter(isT);from=C.disc}if(!pool.length){clog('실 엮기: 뽑을 실 카드가 없다');return}const t=pick(pool);from.splice(from.indexOf(t),1);C.hand.push(t);clog(`실 엮기: 「${CARDS[t.id].name}」 드로우`);settleHand()}}),
 w_a12:WC('ash','전시 개막',2,'rare',{type:'atk',text:'작품-준비가 있으면 50% 확률로 모든 적에게 데미지 170, 작품-완성이 있으면 50% 확률로 모든 적에게 데미지 240, 그 턴 동안 받는 피해 +50%',fx(){const C=S.C,h=C.hand;let n=0;if(h.some(x=>x.id==='art_done')&&rnd()<.5)n=240;else if(h.some(x=>x.id==='art_wip')&&rnd()<.5)n=170;C.showT=C.turn;if(n){const E0=C.E;for(const f of liveFoes()){C.E=f;fixedDmg(n,'전시 개막')}if(alive(E0))C.E=E0;else{const lf=liveFoes();if(lf.length)C.E=lf[0]}}else clog('전시 개막: 아무 일도 없었다');fxAt('player','이번 턴 받는 피해 +50%','info')}}),
 w_a13:WC('ash','강제 강의',1,'rare',{vuln:2,text:'대상의 행동 포인트 +3, 취약 2',fx(){S.C.E.ap+=3}}),
 w_a14:WC('ash','선택받은 실',1,'rare',{type:'power',text:'지속\n매 턴 드로우 1, 코스트 +1',fx(){S.C.threadDraw=(S.C.threadDraw||0)+1}}),
 w_a15:WC('ash','깨끗한 팔레트',1,'rare',{text:'자신의 부정적 키워드를 전부 없앰',fx(){const C=S.C;Object.assign(C,{pWeak:0,pVuln:0,pSteam:0,pCool:0,pEl:0,pBurn:0,pCrack:0})}}),
 w_r1:WC('remi','국자 들기',1,'uncommon',{d:[A(60,85)],flatFn:C=>(C.food||0)*10,text:'공격 60~85, 먹기 1당 피해 +10'}),
 w_r2:WC('remi','식감 찍어내기',1,'uncommon',{d:[D(35,50)],text:'방어 35~50, 먹기 +1',fx(){foodGain(null,1,true)}}),
 w_r3:WC('remi','미끄러운 기름',1,'uncommon',{type:'def',d:[V(12,18)],text:'회피 12~18, 먹기 +1',fx(){foodGain(null,1,true)}}),
 w_r4:WC('remi','퇴비 수프',1,'uncommon',{food:3,heal:15,exhaust:true,text:'음식\n체력 15 회복, 먹기 +3, 소멸'}),
 w_r5:WC('remi','진흙 경단',0,'uncommon',{food:1,heal:3,exhaust:true,text:'음식\n체력 3 회복, 먹기 +1, 소멸'}),
 w_r6:WC('remi','불량 식품',0,'uncommon',{food:3,exhaust:true,text:'음식\n먹기 +3, 다음 턴 코스트 -1, 소멸',fx(){S.C.nextEnergy-=1}}),
 w_r8:WC('remi','야간 교대',1,'uncommon',{draw:2,text:'드로우 2, 체력 5 소모',fx(){const r=S.run;r.hp=Math.max(1,r.hp-5)}}),
 w_r9:WC('remi','공방 없는 노동',3,'rare',{d:[A(70,95),A(70,95),A(70,95)],moreHits:C=>C.sat||0,text:'공격 70~95 × 3, 포화 1당 타격 +1'}),
 w_r10:WC('remi','무쇠 솥',2,'rare',{d:[D(100,130)],defFn:(C,v)=>v+(C.food||0)*10,text:'방어 100~130, 먹기 1당 방어 +10'}),
 w_r11:WC('remi','몸 낮춘 노동',1,'rare',{type:'def',d:[V(20,26)],heal:8,text:'회피 20~26, 체력 8 회복'}),
 w_r12:WC('remi','경험 찍어내기',1,'rare',{food:3,heal:10,draw:1,exhaust:true,text:'음식\n체력 10 회복, 먹기 +3, 드로우 1, 소멸'}),
 w_r14:WC('remi','과식',1,'rare',{exhaust:true,text:'먹기 +10, 체력 10% 소모, 소멸',fx(){const r=S.run;foodGain(null,10,true);r.hp=Math.max(1,r.hp-Math.round(r.maxHp*.1))}}),
 w_r15:WC('remi','쉬지 않는 노동',2,'rare',{type:'power',text:'지속\n매 턴 먹기 +1',fx(){S.C.foodAuto=(S.C.foodAuto||0)+1}}),
};
Object.assign(CARDS,WCARDS);
for(const k in WCARDS){const d=WCARDS[k];WS2[d.ws2].cards.push(k);CARD_PRICE2[k]=d.rar==='rare'?120000:30000}
/* 공방 장비 24종 · 소유 효과 장비 4종 */
/* 공방 장비 (영웅 고정) — 막이 정해진 장비 */

/* 보유 효과 장비 — 보관함에 넣어 두기만 해도 적용, 착용 칸 없음, 같은 것은 하나만 (이미 가진 것은 상점·탈취에 다시 나오지 않음)
   공방 장비 중 이름·부위가 없는 앞 두 개씩은 칸이 없어 보유 효과로 둠 (이름은 임시) */
const HE=(n,ws,p,t)=>({n,ws2:ws,g:'hero',p,t,held:1});

/* 이전 공방 장비(V15, 두 효과가 한 장비)와 새로 나눈 보유 장비 — 둘 중 하나라도 있으면 그 효과 */
const eqW=k=>({st_a:eq('w_stein')||eq('h_st1'),st_b:eq('w_stein')||eq('h_st2'),kr_a:eq('w_kriv')||eq('h_kr1'),kr_b:eq('w_kriv')||eq('h_kr2'),as_a:eq('w_ash')||eq('h_as1'),as_b:eq('w_ash')||eq('h_as2'),
  re_a:eq('w_remi')||eq('h_re1'),re_b:eq('w_remi')||eq('h_re2'),km_a:eq('w_krim')||eq('h_km1'),km_b:eq('w_krim')||eq('h_km2')})[k];

/* ================= 2장 적 (웹게임 문서: 적(등반) · 2장 니다벨리르) =================
   ab: 1레벨 기준 공방렙 보정 (레벨 + ab = 공격·방어레벨) · 행동 순서를 차례로 반복 · 행동은 2종류 */
Object.assign(ACT,{
  '습작 휘두르기':{k:'atk',d:[A(10,16)]},
  '덧칠':{k:'def',d:[D(10,14)]},
  '증기 분사':{k:'atk',d:[A(8,12)],fx:hit=>{if(hit)a2Give('steam',3)},tag:'증기 3'},
  '압력 렌치':{k:'atk',d:[A(12,18)],fx:()=>a2Self('heat',1),tag:'자신 열기 +1'},
  '냉매 투척':{k:'atk',d:[A(6,10)],fx:hit=>{if(hit)a2Give('cool',2)},tag:'냉매 2'},
  '냉각통 내려놓기':{k:'def',d:[D(10,14)],fx:()=>a2Give('cool',1),tag:'냉매 1'},
  '시식':{k:'def',d:[D(10,14)],fx:()=>a2Self('food',3),tag:'자신 먹기 +3'},
  '국자 내려치기':{k:'atk',d:[A(12,18)]},
  '시제품 시험':{k:'atk',d:[A(8,12)],fx:hit=>{if(hit)a2RandNeg()},tag:'무작위 부정적 키워드 1개'},
  '실패작 던지기':{k:'atk',d:[A(14,22)],fx:hit=>{if(hit)a2RandNeg(true)},tag:'직전과 다른 부정적 키워드 1개'},
  '주먹질':{k:'atk',d:[A(8,12)]},
  '움츠리기':{k:'def',d:[D(12,18)]},
  '승강기 레버':{k:'atk',gim:'guard',d:[A(20,30)],fx:()=>{S.C.E.charged=true;fxAt('enemy','송출 대기','info');clog('송출 대기: 다음 행동 위력 +50%','e')},tag:'송출 대기'},
  '빚 독촉':{k:'atk',d:[A(14,20)],tag:'실링 100000 미만이면 피해 2배'},
  '반려 서류':{k:'atk',gim:'read',d:[A(16,24)],fx:hit=>{if(hit)a2SealRandom(2)},tag:'적중 시 패 1장 2턴 봉인'},
  '등록':{k:'def',d:[],fx:()=>{const C=S.C,E=C.E,n=Object.keys(C.patent||{}).filter(k=>C.patent[k]>=2).length;let s=0;for(let i=0;i<n;i++)s+=rollDie(D(10,14));if(s){E.block+=s;fxAt('enemy',`+${s} 방어도`,'block')}clog(`등록: 특허 걸린 카드 ${n}장 × 방어 10~14 → 방어도 +${s}`,'e')},tag:'특허 걸린 카드 1장당 방어 10~14'},
  '과열 망치':{k:'atk',gim:'stagger',d:[A(18,26)]},
  '증기 배출':{k:'def',d:[],fx:()=>{const E=S.C.E,n=E.steam||0;E.steam=0;const b=n*5;E.block+=b;if(b)fxAt('enemy',`+${b} 방어도`,'block');clog(`증기 배출: 증기 ${n} 제거 → 방어도 +${b}`,'e')},tag:'자신의 증기 1당 방어 5'},
  '냉매 살포':{k:'def',d:[D(10,14)],fx:()=>a2Give('cool',3),tag:'냉매 3'},
  '얼음 깨기':{k:'atk',gim:'read',d:[A(22,32)],tag:'냉동이면 깨짐 +2'},
  '해설':{k:'def',d:[D(14,20)],fx:()=>{S.C.drawMinus=(S.C.drawMinus||0)+1;fxAt('player','다음 턴 드로우 -1','info')},tag:'다음 턴 드로우 -1'},
  '전시 지팡이':{k:'atk',gim:'stagger',d:[A(16,24)]},
  /* 아쉬부티 방직파 직조공 (V28) */
  '실 걸기':{k:'def',d:[D(10,16)],tag:'짜임새'},
  '북 던지기':{k:'atk',d:[A(12,18)]},
  '견해 묻기':{k:'debuff',desc:'견해를 묻는다',fx:()=>askView(S.C.E)},
  /* 아쉬부티 곡해파 전시가 (V28) — 곡해: 쓸 때마다 반응이 무작위 */
  '곡해':{k:'debuff',desc:'무작위 반응',fx:()=>{const C=S.C,E=C.E,k=ri(0,3);
    if(k===0){C.pWeak=(C.pWeak||0)+1;fxAt('player','허약 1','info');badFx();clog('곡해: 플레이어 허약 1','e')}
    else if(k===1){const v=ri(10,16);E.block+=v;fxAt('enemy',`+${v} 방어도`,'block');clog(`곡해: 방어도 +${v}`,'e')}
    else if(k===2){C.drawMinus=(C.drawMinus||0)+1;fxAt('player','다음 턴 드로우 -1','info');clog('곡해: 다음 턴 드로우 -1','e')}
    else{E.art=(E.art||0)+1;fxAt('enemy',`예술적 감각 ${E.art}`,'info');clog(`곡해: 예술적 감각 ${E.art}`,'e');if(E.art>=3&&E.wipT==null&&!E.done){E.art=0;E.wipT=2;toast('작품 준비',`${E.name}이(가) 작품을 만들기 시작했다`)}}}},
  '액자 휘두르기':{k:'atk',d:[A(13,19)]},
  /* 아쉬부티 보존파 고증가 (V28) */
  '원전 대조':{k:'def',d:[D(12,18)],tag:'고증'},
  '복원 망치':{k:'atk',d:[A(14,20)]},
  '시식 ':{k:'def',d:[],fx:()=>{const E=S.C.E;a2Self('food',4);const h=Math.min(E.maxHp-E.hp,Math.round(E.maxHp*.1));if(h>0){E.hp+=h;fxAt('enemy',`+${h}`,'heal')}clog(`시식: 먹기 +4, 체력 +${h}`,'e')},tag:'자신 먹기 +4, 체력 10% 회복'},
  '무쇠 팬':{k:'atk',gim:'guard',d:[A(18,28)],tag:'포화 1당 플레이어 최대 체력 2% 추가'},
  '진압봉':{k:'atk',gim:'guard',d:[A(22,30)]},
  '정의 집행':{k:'def',d:[D(20,28)],fx:()=>{S.C.redefMore=(S.C.redefMore||0)+2;clog('정의 집행: 다음 턴 재정의되는 카드 +2장','e')},tag:'다음 턴 재정의 +2장'},
  '서류 정리':{k:'atk',d:[A(14,20),A(14,20)]},
  '기입':{k:'def',d:[D(24,36)]},
  '정정':{k:'debuff',desc:'직전에 쓴 카드를 그대로 따라 씀',fx:async()=>{const C=S.C,id=C.lastCardId;if(!id||!CARDS[id]||!(CARDS[id].d||[]).length){clog('정정: 따라 쓸 카드가 없다','e');return}toast('정정',`「${CARDS[id].name}」을(를) 따라 썼다`);await enemyUseCard(id)}},
  '삭제':{k:'atk',gim:'guard',d:[A(40,60)]},
  /* 약화된 수르트 (레바테인 사건 · 임시 행동) */
  '레바테인-타격':{k:'atk',d:[A(16,24)],fx:hit=>{if(hit)a2Give('burn',5)},tag:'소각 5'},
  '점화':{k:'debuff',desc:'소각 10',fx:()=>a2Give('burn',10)},
});
const W2=(o)=>({tier:'normal',act2:1,lv:[40,50],...o});
Object.assign(ENEMY,{
  mech:W2({name:'스타인러 공방 정비공',hp1:160,ab:44,acc:70,eva:40,apMax:5,order:['증기 분사','압력 렌치'],art:'w_stein',ws:'stein',
    passives:[['정비','드워프의 손길이 남은 수동 장치를 다룸, 플레이어에게 증기를 쌓고 자신은 열기로 공격이 세짐']]}),
  porter:W2({name:'크리뷔스 공방 운반부',hp1:150,ab:39,acc:70,eva:45,apMax:5,order:['냉매 투척','냉각통 내려놓기'],art:'w_kriv',ws:'kriv',
    passives:[['운반','냉매제를 나르는 사람, 플레이어에게 냉매를 부여해 코스트를 깎고, 냉동을 부여해 1턴 동안 행동 불가로 만듦']]}),
  server:W2({name:'레미 공방 배식꾼',hp1:200,ab:39,acc:65,eva:35,apMax:6,order:['시식','국자 내려치기'],art:'w_remi',ws:'remi',
    passives:[['배식','음식으로 먹기를 쌓아 최대 체력을 키움, 오래 끌수록 단단해짐']]}),
  weaver:W2({name:'아쉬부티 공방 방직파 직조공',hp1:170,ab:44,acc:70,eva:45,apMax:5,order:['실 걸기','북 던지기','실 걸기','견해 묻기'],art:'w_ash',ws:'ash',
    passives:[['짜임새','앞과 다른 행동을 이을 때마다 예술적 감각 +1, 3이 되면 작품 준비, 턴이 지날 때마다 5~20% 확률로 작품 완성 (이후 공격 위력 +200%)'],['견해 묻기','전투에 한 번, 이방인에게 작품에 대한 견해를 묻는다']]}),
  interp:W2({name:'아쉬부티 공방 곡해파 전시가',hp1:150,ab:44,acc:70,eva:50,apMax:5,order:['곡해','액자 휘두르기'],art:'w_ash',ws:'ash',
    passives:[['곡해','곡해할 때마다 반응이 무작위 — 약화 · 방어도 · 드로우 감소 · 예술적 감각 중 하나'],['첫 만남','처음 만나면 전투 전에 신화 원전에 대한 견해를 묻는다']]}),
  keeper:W2({name:'아쉬부티 공방 보존파 고증가',hp1:180,ab:44,acc:75,eva:40,apMax:5,order:['원전 대조','원전 대조','복원 망치','견해 묻기'],art:'w_ash',ws:'ash',
    passives:[['고증','같은 행동을 연달아 이을 때마다 예술적 감각 +1, 3이 되면 작품 준비, 턴이 지날 때마다 5~20% 확률로 작품 완성 (이후 공격 위력 +200%)'],['견해 묻기','전투에 한 번, 유물의 대가에 대해 묻는다 — 쓰겠다고 하면 단죄']]}),
  cadet:W2({name:'아쉬부티 공방 견습생',hp1:130,ab:44,acc:70,eva:50,apMax:5,order:['습작 휘두르기','덧칠'],art:'w_ash',ws:'ash',
    passives:[['아카데미 생도','자신의 분파가 어느 곳에서도 맞지 않아 아직 작품을 완성하지 못함, 체력이 70% 이하가 되면 패에 설득하기(예술적 감각이 있으면 의견제시)가 생김, 작품 제작이 100%가 되면 처치 없이 끝나고 동료가 됨']]}),
  appr:W2({name:'크리밀라 공방 견습생',hp1:110,ab:49,acc:75,eva:55,apMax:4,order:['시제품 시험','실패작 던지기'],art:'w_krim',ws:'krim',
    passives:[['견습','독립 공방을 꿈꾸는 초짜, 매 행동마다 다른 부정적 키워드를 무작위로 부여함']]}),
  poor:W2({name:'빈곤 시민',names:['빈곤 시민','퇴거 직전 시민'],hp1:100,ab:39,acc:65,eva:50,apMax:5,order:['주먹질','움츠리기'],art:'poor',
    passives:[['발악','턴 종료 시 체력이 50% 이하라면 도망침, 이후 같은 노드에서 따라잡기 선택 가능. 이기면 실링을 적게 줌']]}),
  sender:{name:'아랫지형 송출관',tier:'elite',act2:1,lv:52,hp1:300,ab:44,acc:75,eva:40,apMax:6,order:['승강기 레버','빚 독촉'],art:'e_sender',
    passives:[['강등','전투 시작 시 플레이어 덱에서 가장 높은 등급의 카드 1장을 한 등급 낮은 카드로 바꿈 (이번 전투 동안)']]},
  examiner:{name:'특허 심사관',tier:'elite',act2:1,lv:54,hp1:280,ab:49,acc:80,eva:45,apMax:6,order:['반려 서류','반려 서류','등록'],art:'e_exam',
    passives:[['특허','플레이어가 같은 카드를 2번 쓰면 그 카드에 특허가 걸려, 이후 사용할 때마다 10000실링을 냄 (실링이 모자라면 그 카드를 쓸 수 없음)']]},
  craftsman:{name:'스타인러 공방 장인',sub:'계약 공방의 사람',tier:'elite',act2:1,lv:56,hp1:320,ab:49,acc:75,eva:45,apMax:6,order:['과열 망치','과열 망치','증기 배출'],art:'w_stein',ws:'stein',heatMax:4,
    passives:[['장인의 방식','턴 시작 시 자신에게 증기 +4, 열기 최대치 4']]},
  collab:{name:'크리뷔스 공방 협업 책임자',sub:'계약 공방의 사람',tier:'elite',act2:1,lv:56,hp1:320,ab:49,acc:75,eva:45,apMax:6,order:['냉매 살포','얼음 깨기'],art:'w_kriv',ws:'kriv',
    passives:[['협업','플레이어가 냉동 상태일 때 자신의 공격은 반드시 적중']]},
  docent:{name:'아쉬부티 공방 수석 해설사',sub:'계약 공방의 사람',tier:'elite',act2:1,lv:56,hp1:320,ab:49,acc:75,eva:45,apMax:6,order:['해설','해설','해설','전시 지팡이'],art:'w_ash',ws:'ash',
    passives:[['해설의 정석','같은 행동 3연속마다 예술적 감각 +1, 3이 되면 작품 준비, 턴이 지날 때마다 5~20% 확률로 작품 완성 (이후 전투가 끝날 때까지 공격 위력 +200%)']]},
  chef:{name:'레미 공방 총주방장',sub:'계약 공방의 사람',tier:'elite',act2:1,lv:56,hp1:320,ab:49,acc:75,eva:45,apMax:6,order:['시식 ','시식 ','시식 ','무쇠 팬'],art:'w_remi',ws:'remi',
    passives:[['시식의 정석','먹기·배부름·포화 키워드를 플레이어와 같은 규칙으로 씀']]},
  guard:{name:'중앙정부의 경비원',tier:'elite',act2:1,lv:58,hp1:350,ab:49,acc:85,eva:40,apMax:7,order:['진압봉','진압봉','정의 집행'],art:'e_guard',
    passives:[['재정의','매 턴 시작 시 플레이어 패의 카드 2장을 무작위로 재정의함 (이름·코스트·공격↔방어 중 1~2가지), 바뀐 카드는 그 턴이 끝나면 원래대로 돌아옴']]},
  clerk:{name:'기록하는 공무원',tier:'boss',act2:1,lv:30,hp1:500,hpBonus1:721,atkFix:109,acc:80,eva:40,apMax:10,order:['서류 정리','기입'],order2:['서류 정리','삭제'],art:'clerk',
    passives:[['자명종','한 턴에 같은 카드를 2번째 쓰면 카드가 검게 변함. 3번째 쓰면 그 사용은 효과도 피해도 없이 자물쇠로 묶임 (2턴이 지나야 풀림). 그 턴에 가장 많이 쓴 카드는 다음 1턴 동안 잠김'],
      ['기입','카드를 3장 쓸 때마다 자물쇠로 묶인 카드 하나에 도장을 찍음. 도장이 찍힌 카드는 이 전투가 끝날 때까지 쓸 수 없음. 묶인 카드가 없으면 도장은 버려짐'],
      ['마감','체력이 1 이하가 되면 그 자리에서 턴이 끝나고, 다음 턴에 체력을 전부 회복함 (1회)']]},
  surtW:{name:'약화된 수르트',sub:'레바테인 사건',tier:'boss',lv:130,hp1:300,atkFix:100,acc:70,eva:50,apMax:10,order:['레바테인-타격','점화','레바테인-타격'],art:'surt'},
});
const A2_NORMAL=['mech','porter','server','appr','poor','weaver','interp','keeper'];
const SHOP_STAFF={stein:'mech',kriv:'porter',remi:'server',krim:'appr',ash:'weaver'};

const NG=(n,s,ws,t,fx)=>({...GR(n,s,'hero',150000,t,fx),ws2:ws,nw:1});


const CONTRACT_P={stein:'craftsman',kriv:'collab',ash:'docent',remi:'chef'};
/* 경비원 재정의 — 바뀌는 이름 (문서 예시 + 그 외 카드는 같은 뜻의 다른 말로 임시) */
const REDEF_NAME={slash:'잘라버리기',guard:'가로막기',stab:'서시기',double:'토막 내기',smash:'짓찧기',shield:'벽 세우기',breath:'한숨 돌리기',
  gap:'틈 찌르기',prayer:'빌기',hook:'갈퀴질',hardtack:'마른 빵',tidy:'치우기',duck:'웅크리기',parry:'받아 베기'};

/* ================= 니다벨리르 사건 (웹게임 문서: 이벤트 · 니다벨리르 사건) — zone: E 동 · N 북 · S 남 · W 서 · C 공통 ================= */
const NV=(zone,title,text,choices)=>({place:'nidavellir',zone,title,text,choices});
const S10=10000,S50=50000,S100=100000;
Object.assign(GEV,{
  /* 기존 사건 구역: 스타인러의 장인(동), 크리뷔스의 냉동 창고(북), 아쉬부티 전시실(남), 크리밀라 시연회·후긴과 무닌의 자명종·아랫지형으로 가는 승강기·비가 내린다(공통) */
  n_artisan:NV('E','스타인러의 장인','노인이 맨손으로 증기 장치를 고친다. 아직 드워프의 손길이 남아 있는 곳이다.',[
    {b:'수리를 돕는다',chk:{s:'atk',d:'normal'},ok:{s:'스타인러 공방의 증기 장치 획득',fx:[['card','steam',1]]},ng:{s:'증기에 데어 체력 -12',fx:[['hp',-12]]}},
    {b:'장치를 산다',cost:S10,s:'실링 -10000, 스타인러 공방의 증기 장치 획득',fx:[['gold',-S10],['card','steam',1]]}]),
  n_coldstore:NV('N','크리뷔스의 냉동 창고','문틈으로 하얀 냉기가 새어 나온다. 가장 힘들게 만들어지고 가장 빨리 소모되는 것들이 쌓여 있다.',[
    {b:'문을 연다',chk:{s:'def',d:'hard'},ok:{s:'크리뷔스 공방의 냉매 주머니 2장',fx:[['card','frost',2]]},ng:{s:'다음 전투 동안 코스트 -1',fx:[['next','cost',-1]]}},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]),
  n_gallery:NV('S','아쉬부티 전시실','유물의 파편이 예술품이 되어 유리 안에 걸려 있다. 해설사가 교육 과정을 권한다.',[
    {b:'파편을 만진다',chk:{s:'acc',d:'hard'},ok:{s:'아쉬부티 공방의 파편 장식 획득',fx:[['card','ornament',1]]},ng:{s:'경비에게 잡혀 실링 -10000',fx:[['gold',-S10]]}},
    {b:'해설을 듣는다',s:'아무 일도 없다',fx:[]}]),
  n_demo:NV('C','크리밀라 시연회','인간의 기술로 신의 능력을 흉내 낸 무구를 시연한다. 표적이 되어 줄 자원자를 찾는다.',[
    {b:'표적이 된다',chk:{s:'def',d:'normal'},ok:{s:'크리밀라 공방의 모조 무구 획득',fx:[['card','mimic',1]]},ng:{s:'체력 -25%',fx:[['hpPct',-25]]}},
    {b:'관객석에 남는다',s:'아무 일도 없다',fx:[]}]),
  n_clock:NV('C','후긴과 무닌의 자명종','흑백 까마귀가 튀어나와 무언가를 정의한다. 맞든 틀리든, 그때부터 그것은 그렇게 불린다.',[
    {b:'까마귀에게 내 이름을 묻는다',s:'특성 1개가 무작위 특성으로 바뀜',fx:[['traitSwap']]},
    {b:'자명종을 멈춘다',chk:{s:'acc',d:'hard'},ok:{s:'실링 +50000',fx:[['gold',S50]]},ng:{s:'이번 장 동안 상점 가격 +25%',fx:[['act','shopUp',.25]]}}]),
  n_rain:NV('C','비가 내린다','하늘이라 불리는 철제형 돔 위쪽에서 묽고 투명한 액체가 떨어진다. 곧 방송이 들리고 그것을 비라고 설명한다.',[
    {b:'맞는다',s:'체력 +10%',fx:[['hpPct',10]]},
    {b:'이것은 샘물이라고 내가 지칭한다',s:'사람들이 그 샘물을 사 갔다, 실링 +10000',fx:[['gold',S10]]}]),
  /* 공통 사건 */
  n_naming:NV('C','이름을 정의받는 날','창구 앞에 갓난아이를 안은 부모들이 줄 서 있다. 아이의 이름은 부모가 아니라 창구가 정한다.',[
    {b:'대신 서류를 써 준다',chk:{s:'acc',d:'normal'},ok:{s:'실링 +10000',fx:[['gold',S10]]},ng:{s:'실링 -10000',fx:[['gold',-S10]]}},
    {b:'아이의 이름을 묻는다',s:'덱의 카드 1장 이름이 바뀜',fx:[['rename']]},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]),
  n_patent:NV('C','특허 출원 창구','사람들이 사소한 손동작 하나에도 특허를 낸다.',[
    {b:'내 기술을 등록한다',s:'덱의 카드 1장 선택, 이번 장 동안 그 카드에는 특허가 걸리지 않음',fx:[['patentFree']]},
    {b:'남의 특허를 베낀다',chk:{s:'acc',d:'hard'},ok:{s:'무작위 공방 카드 1장',fx:[['wsCard']]},ng:{s:'실링 -50000',fx:[['gold',-S50]]}}]),
  n_sky:NV('C','하늘을 올려다보지 않는 사람들','모두가 하늘이라 부르는 철제 돔이 머리 위를 덮고 있다. 아무도 위를 올려다보지 않는다.',[
    {b:'오래 올려다본다',s:'아무 일도 없다',fx:[]},
    {b:'고개를 숙이고 걷는다',s:'아무 일도 없다',fx:[]}]),
  n_distance:NV('C','닿지 않는 거리','사람들은 팔 하나 거리를 두고 걷는다. 부딪히면 둘 다 사과하고 서둘러 멀어진다.',[
    {b:'일부러 부딪힌다',chk:{s:'def',d:'normal'},ok:{s:'상대가 떨어뜨린 지갑을 줍는다, 실링 +10000',fx:[['gold',S10]]},ng:{s:'아무 일도 없다',fx:[]}},
    {b:'거리를 지킨다',s:'아무 일도 없다',fx:[]}]),
  n_brother:NV('C','서로 모르는 형제','낯선 사람이 암호 같은 말을 건넨다. 노르드교는 여기에도 있다. 서로의 정체는 모른다.',[
    {b:'암호를 받아 준다',s:'이번 장 동안 공방 상점이 경계해 가격 +10%',fx:[['act','shopUp',.1]]},
    {b:'신고한다',s:'실링 +50000',fx:[['gold',S50]]}]),
  n_sales:NV('C','영업부서의 사람','명찰을 건 영업 사원이 웃으며 다가온다.',[
    {b:'계약서에 서명한다',cost:S50,s:'실링 -50000, 다음 상점 1회 물건 가격 -30%',fx:[['gold',-S50],['act','nextShop30',1]]},
    {b:'무시한다',s:'아무 일도 없다',fx:[]}]),
  n_hand:NV('C','하층에서 올라온 손','난간 아래에서 누군가 기어오르고 있다. 한 손에 동전 주머니를 쥐고 있다.',[
    {b:'끌어올린다',cost:S10,s:'실링 -10000, 최대 체력 +30',fx:[['gold',-S10],['maxHp',30]]},
    {b:'주머니를 빼앗고 다시 밀어낸다',s:'실링 +10000',fx:[['gold',S10]]}]),
  /* 동 · 스타인러 */
  n_pipe:NV('E','터진 배관','골목 배관에서 하얀 증기가 뿜어진다.',[
    {b:'밸브를 잠근다',chk:{s:'def',d:'normal'},ok:{s:'아무 일도 없다',fx:[]},ng:{s:'다음 전투 시작 시 증기 5',fx:[['next','steam',5]]}},
    {b:'돌아간다',s:'아무 일도 없다',fx:[]}]),
  n_crank:NV('E','손잡이 승강기','손잡이를 돌려야만 움직이는 승강기 앞에 노인이 서 있다.',[
    {b:'대신 돌려 준다',s:'체력 -10%, 노인이 고맙다며 작은 장치를 건네준다, 스타인러 공방의 증기 장치 획득',fx:[['hpPct',-10],['card','steam',1]]},
    {b:'계단으로 간다',s:'아무 일도 없다',fx:[]}]),
  n_exam:NV('E','견습 시험','장인이 견습생에게 손으로만 부품을 깎게 한다. 견습생의 손이 떨린다.',[
    {b:'대신 깎는다',chk:{s:'atk',d:'normal'},ok:{s:'아무 일도 없다',fx:[]},ng:{s:'체력 -15%',fx:[['hpPct',-15]]}},
    {b:'지켜본다',s:'아무 일도 없다',fx:[]}]),
  n_dark:NV('E','불 꺼진 작업장','기계음이 멈춘 작업장. 문이 반쯤 열려 있다.',[
    {b:'뒤진다',chk:{s:'acc',d:'hard'},ok:{s:'스타인러 공방 장비 1개 무작위',fx:[['wsGear','stein']]},ng:{s:'실링 -50000',fx:[['gold',-S50]]}},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]),
  n_bread:NV('E','증기관 위의 빵','노동자들이 증기관 위에 빵을 올려 데워 먹는다.',[
    {b:'함께 먹는다',s:'체력 +15%, 레미 공방의 건빵 1장',fx:[['hpPct',15],['card','hardtack',1]]},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]),
  n_arm:NV('E','멈춘 의수','노동자의 의수가 움직이지 않는다. 고칠 돈은 없다고 한다.',[
    {b:'고쳐 준다',chk:{s:'atk',d:'normal'},ok:{s:'실링 +50000',fx:[['gold',S50]]},ng:{s:'체력 -10%',fx:[['hpPct',-10]]}},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]),
  n_blueprint:NV('E','손으로 쓴 설계도','바닥에 설계도가 떨어져 있다. 수식 대신 손때 묻은 메모가 빼곡하다.',[
    {b:'가져간다',s:'이번 장 동안 스타인러 공방 정비공 공격레벨 +5',fx:[['act','mechAtk',5]]},
    {b:'돌려준다',s:'실링 +10000',fx:[['gold',S10]]}]),
  n_needle:NV('E','붉은 칸의 바늘','압력계 바늘이 붉은 칸을 넘었다. 주변에 아무도 없다.',[
    {b:'압력을 뺀다',chk:{s:'def',d:'hard'},ok:{s:'다음 전투 첫 턴 열기 +2',fx:[['next','heat',2]]},ng:{s:'체력 -20%',fx:[['hpPct',-20]]}},
    {b:'그대로 둔다',s:'아무 일도 없다',fx:[]}]),
  /* 북 · 크리뷔스 */
  n_convoy:NV('N','운반 행렬','등에 통을 진 운반부들이 줄지어 지나간다.',[
    {b:'통 하나를 대신 진다',s:'체력 -15%, 크리뷔스 공방의 냉매 주머니 1장',fx:[['hpPct',-15],['card','frost',1]]},
    {b:'길을 비켜 준다',s:'아무 일도 없다',fx:[]}]),
  n_finger:NV('N','하얗게 변한 손가락','장갑 없이 일한 노동자의 손가락이 하얗게 굳어 있다.',[
    {b:'장갑을 준다',s:'착용 중인 팔 장비 1개를 잃음, 최대 체력 +30',fx:[['loseArm'],['maxHp',30]]},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]),
  n_papers:NV('N','천장까지 쌓인 계약서','다른 공방들과 맺은 협업 계약서가 천장까지 쌓여 있다.',[
    {b:'훑어본다',chk:{s:'acc',d:'normal'},ok:{s:'다음 상점 새로고침 1회 무료',fx:[['act','freeRer',1]]},ng:{s:'실링 -10000',fx:[['gold',-S10]]}},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]),
  n_frostfloor:NV('N','서리 낀 바닥','냉매관에서 새어 나온 냉기가 바닥을 하얗게 덮었다.',[
    {b:'관을 막는다',chk:{s:'def',d:'normal'},ok:{s:'실링 +50000',fx:[['gold',S50]]},ng:{s:'다음 전투 시작 시 냉매 2',fx:[['next','cool',2]]}},
    {b:'돌아간다',s:'아무 일도 없다',fx:[]}]),
  n_ledger:NV('N','소모 일지','오늘 쓴 냉매가 어제 만든 양보다 많다. 기록하던 사람이 펜을 멈춘다.',[
    {b:'숫자를 고쳐 준다',s:'실링 +50000',fx:[['gold',S50]]},
    {b:'덮어 둔다',s:'아무 일도 없다',fx:[]}]),
  n_ice:NV('N','얼음 속의 것','얼음 덩어리 안에 무언가 갇혀 있다.',[
    {b:'깨서 꺼낸다',chk:{s:'atk',d:'hard'},ok:{s:'희귀 기본 장비 1개',fx:[['gear','rare']]},ng:{s:'체력 -20%',fx:[['hpPct',-20]]}},
    {b:'그대로 둔다',s:'아무 일도 없다',fx:[]}]),
  n_shift:NV('N','교대 없는 교대','밤새 일한 운반부가 교대 없이 다시 불려 들어간다.',[
    {b:'한 시간 대신 일한다',s:'실링 +10000, 체력 -10%',fx:[['gold',S10],['hpPct',-10]]},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]),
  n_tower:NV('N','냉각탑 아래','탑에서 차가운 바람이 내려온다. 운반부들이 잠시 숨을 돌리는 곳이다.',[
    {b:'쉬어 간다',s:'체력 +15%',fx:[['hpPct',15]]},
    {b:'바람을 병에 담는다',s:'크리뷔스 공방의 냉매 주머니 1장, 체력 -5%',fx:[['card','frost',1],['hpPct',-5]]}]),
  n_frozen:NV('N','얼어 쓰러진 사람','창고 문 앞에 누군가 얼어서 쓰러져 있다.',[
    {b:'녹여 준다',s:'체력 -10%',fx:[['hpPct',-10]]},
    {b:'신고한다',s:'실링 +10000',fx:[['gold',S10]]}]),
  /* 남 · 아쉬부티 */
  n_school:NV('S','입학 권유','해설사가 교육 과정 안내서를 내민다. 수강료는 비싸다.',[
    {b:'등록한다',cost:S100,s:'실링 -100000',fx:[['gold',-S100]]},
    {b:'거절한다',s:'아무 일도 없다',fx:[]}]),
  n_appraiser:NV('S','감정사','유물을 보는 눈을 가졌다는 감정사가 물건을 보여 달라고 한다.',[
    {b:'장비를 맡긴다',s:'장비 1개를 원래 가격 100%로 판매',fx:[['sellFull']]},
    {b:'거절한다',s:'아무 일도 없다',fx:[]}]),
  n_carver:NV('S','파편을 깎는 사람','조각가가 유물 파편을 깎아 장식품을 만든다.',[
    {b:'지켜본다',s:'아무 일도 없다',fx:[]},
    {b:'조각을 산다',cost:S50,s:'실링 -50000, 아쉬부티 공방의 파편 장식 1장',fx:[['gold',-S50],['card','ornament',1]]}]),
  n_fake:NV('S','진품이라는 모작','상인은 이것이 진품이라고 우긴다.',[
    {b:'산다',chk:{s:'acc',d:'normal'},ok:{s:'무작위 희귀 카드 1장',fx:[['rareCard']]},ng:{s:'실링 -50000',fx:[['gold',-S50]]}},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]),
  n_empty:NV('S','관람객 없는 미술관','불은 켜져 있지만 아무도 없다.',[
    {b:'혼자 오래 본다',s:'다음 전투 시작 시 예술적 감각 +1',fx:[['next','art',1]]},
    {b:'나온다',s:'아무 일도 없다',fx:[]}]),
  n_lecture:NV('S','개념 강의','유물이 가진 개념에 대한 강의가 열린다. 앞자리는 비어 있다.',[
    {b:'끝까지 듣는다',s:'아무 일도 없다',fx:[]},
    {b:'졸다 나온다',s:'아무 일도 없다',fx:[]}]),
  n_wings:NV('S','박제의 날갯짓','박제된 나비가 예전에 어떻게 날갯짓했는지 계산해 그린 그림이 걸려 있다.',[
    {b:'수식을 읽는다',chk:{s:'acc',d:'normal'},ok:{s:'아무 일도 없다',fx:[]},ng:{s:'아무 일도 없다',fx:[]}},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]),
  n_model:NV('S','졸업 작품의 모델','학생이 작품 모델이 되어 줄 사람을 찾는다.',[
    {b:'서 준다',s:'체력 -10%, 실링 +10000, 다음 전투 시작 시 예술적 감각 +1',fx:[['hpPct',-10],['gold',S10],['next','art',1]]},
    {b:'거절한다',s:'아무 일도 없다',fx:[]}]),
  /* 서 · 레미 */
  n_cargo:NV('W','배급 화물','레미 공방의 화물이 식품업체로 실려 간다.',[
    {b:'짐을 내려 준다',s:'레미 공방의 건빵 2장',fx:[['card','hardtack',2]]},
    {b:'한 상자 챙긴다',chk:{s:'acc',d:'normal'},ok:{s:'레미 공방의 건빵 4장',fx:[['card','hardtack',4]]},ng:{s:'실링 -50000',fx:[['gold',-S50]]}}]),
  n_tasting:NV('W','시식대','새 메뉴를 내놓은 시식대에 사람이 몰려 있다.',[
    {b:'먹어 본다',s:'체력 +10%, 다음 전투 시작 시 먹기 +3',fx:[['hpPct',10],['next','food',3]]},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]),
  n_waste:NV('W','폐기 더미','기한이 지난 음식이 쌓여 있다. 곧 아랫지형으로 내려보낸다.',[
    {b:'주워 먹는다',chk:{s:'def',d:'normal'},ok:{s:'체력 +20%',fx:[['hpPct',20]]},ng:{s:'체력 -10%',fx:[['hpPct',-10]]}},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]),
  n_queue:NV('W','납품 줄','식품업체 사람들이 물자를 받으려고 줄을 섰다.',[
    {b:'대신 줄을 선다',s:'실링 +10000',fx:[['gold',S10]]},
    {b:'새치기한다',chk:{s:'atk',d:'normal'},ok:{s:'실링 +50000',fx:[['gold',S50]]},ng:{s:'체력 -10%',fx:[['hpPct',-10]]}}]),
  n_dinner:NV('W','가장 비싼 한 끼','니다벨리르에서 가장 비싸다는 식당이다.',[
    {b:'사 먹는다',cost:S100,s:'실링 -100000, 최대 체력 +50',fx:[['gold',-S100],['maxHp',50]]},
    {b:'냄새만 맡는다',s:'아무 일도 없다',fx:[]}]),
  n_leftover:NV('W','남은 음식','식당 뒷문에서 남은 음식을 버린다. 빈곤 시민이 그걸 바라보고 있다.',[
    {b:'나눠 준다',s:'아무 일도 없다',fx:[]},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]),
  n_inspect:NV('W','검수실','검수원이 쌓인 식자재를 혼자 확인하고 있다.',[
    {b:'검수를 돕는다',chk:{s:'acc',d:'normal'},ok:{s:'레미 공방의 건빵 2장',fx:[['card','hardtack',2]]},ng:{s:'체력 -10%',fx:[['hpPct',-10]]}},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]),
  n_knife:NV('W','칼 가는 보조 요리사','주방 뒤편에서 보조 요리사가 칼을 간다.',[
    {b:'칼을 빌린다',s:'아무 일도 없다',fx:[]},
    {b:'숫돌을 산다',cost:S10,s:'실링 -10000, 이번 장 동안 공격 카드 피해 +2',fx:[['gold',-S10],['act','atkFlat',2]]}]),
  n_table:NV('W','배부른 사람들의 식탁','배불리 먹은 사람들이 웃고 있다. 빈자리는 없다.',[
    {b:'끼어 앉는다',s:'체력 +15%',fx:[['hpPct',15]]},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]),
  n_rat:NV('W','창고의 쥐','식자재 창고에 쥐가 들끓는다. 잡으면 돈을 준다고 한다.',[
    {b:'잡는다',chk:{s:'atk',d:'normal'},ok:{s:'실링 +50000',fx:[['gold',S50]]},ng:{s:'체력 -10%',fx:[['hpPct',-10]]}},
    {b:'지나친다',s:'아무 일도 없다',fx:[]}]),
});
/* '막을 통과하다'는 2장이 돔 위에 떨어진 채로 시작해 글이 맞지 않아 아직 넣지 않음 (문서에서 처리 미정) */

const curPlace=()=>S.run&&S.run.act===2?'nidavellir':'midgard';
const EV_KEEP=new Set(['막을 통과하다','스타인러의 장인','크리뷔스의 냉동 창고','아쉬부티 전시실','크리밀라 시연회','후긴과 무닌의 자명종','아랫지형으로 가는 승강기','비가 내린다']);
for(const k of Object.keys(GEV))if(!EV_KEEP.has(GEV[k].title))delete GEV[k];
/* 공방 사건 40개 — 문서 이벤트 · 공방 사건 */
Object.assign(GEV,{
  w0:NV("E","실기 시험","꼬마 드워프가 망치를 들고 실기 상대를 찾는다. 멋진 망치질을 보여 주면 호칭이 바뀐다고 한다.",[{"b": "상대가 되어 준다", "s": "이벤트 전투(정비공), 승리 시 스타인러 카드 1장, 친호도 +10", "fx": [["evFight", "mech", [["wsCardOf", "stein"], ["fav", "stein", 10]]]]}, {"b": "지나친다", "s": "아무 일도 없다", "fx": []}]),
  w1:NV("E","엘더의 평가","엘더가 말없이 망치를 내민다. 한 번 내려쳐 보라는 뜻이다.",[{"b": "내려친다", "chk": {"s": "atk", "d": "normal"}, "ok": {"s": "친호도 +20", "fx": [["fav", "stein", 20]]}, "ng": {"s": "체력 -10%", "fx": [["hpPct", -10]]}}, {"b": "정중히 사양한다", "s": "고지식하게 고개를 끄덕인다, 친호도 +5", "fx": [["fav", "stein", 5]]}]),
  w2:NV("E","새는 밸브","밸브가 새며 골목에 증기가 찬다.",[{"b": "맨손으로 잠근다", "chk": {"s": "def", "d": "normal"}, "ok": {"s": "친호도 +15", "fx": [["fav", "stein", 15]]}, "ng": {"s": "체력 -10%", "fx": [["hpPct", -10]]}}, {"b": "장인을 부른다", "s": "친호도 +5", "fx": [["fav", "stein", 5]]}]),
  w3:NV("E","망치 소리","골목에 망치 소리가 일정하게 울린다.",[{"b": "박자에 맞춰 돕는다", "s": "체력 -5%, 친호도 +10", "fx": [["hpPct", -5], ["fav", "stein", 10]]}, {"b": "앉아서 듣는다", "s": "체력 +5%", "fx": [["hpPct", 5]]}]),
  w4:NV("E","견습의 실패작","꼬마 드워프가 실패한 부품을 등 뒤로 숨긴다.",[{"b": "함께 고친다", "chk": {"s": "atk", "d": "normal"}, "ok": {"s": "친호도 +15", "fx": [["fav", "stein", 15]]}, "ng": {"s": "실링 -10000 (10단화)", "fx": [["goldRaw", -10000]]}}, {"b": "모른 척한다", "s": "아무 일도 없다", "fx": []}]),
  w5:NV("E","마스터의 호칭","두 장인이 호칭 하나를 두고 다툰다.",[{"b": "실력으로 정하자고 한다", "s": "이벤트 전투(정비공), 승리 시 스타인러 카드 1장, 친호도 +15", "fx": [["evFight", "mech", [["wsCardOf", "stein"], ["fav", "stein", 15]]]]}, {"b": "자리를 피한다", "s": "아무 일도 없다", "fx": []}]),
  w6:NV("E","수동 승강기","손으로 돌리는 승강기가 멈춰 있다.",[{"b": "크랭크를 돌린다", "s": "체력 -5%, 친호도 +10", "fx": [["hpPct", -5], ["fav", "stein", 10]]}, {"b": "계단으로 간다", "s": "아무 일도 없다", "fx": []}]),
  w7:NV("E","증기 목욕탕","일을 마친 장인들이 증기 속에 말없이 앉아 있다.",[{"b": "함께 앉는다", "s": "체력 +15%, 다음 전투 시작 시 자신에게 증기 5", "fx": [["hpPct", 15], ["next", "steam", 5]]}, {"b": "물을 나른다", "s": "친호도 +10", "fx": [["fav", "stein", 10]]}]),
  w8:NV("E","낡은 도면","바닥에서 드워프의 손글씨가 남은 도면을 주웠다.",[{"b": "장인에게 돌려준다", "s": "친호도 +15", "fx": [["fav", "stein", 15]]}, {"b": "판다", "s": "실링 +50000 (50단화)", "fx": [["gold", 50000]]}]),
  w9:NV("E","마이티의 식탁","마이티가 말없이 옆자리를 가리킨다.",[{"b": "예의를 지키고 앉는다", "s": "친호도 +10", "fx": [["fav", "stein", 10]]}, {"b": "망치질을 묻는다", "s": "수동 크랭크 1장", "fx": [["cardN", "수동 크랭크"]]}]),
  w10:NV("N","교대 시간","고참이 냉각기 앞을 막아선다. 말은 없지만 비키라는 뜻은 분명하다.",[{"b": "말없이 물러선다", "s": "친호도 +10", "fx": [["fav", "kriv", 10]]}, {"b": "지나가겠다고 한다", "s": "이벤트 전투(운반부), 승리 시 크리뷔스 카드 1장", "fx": [["evFight", "porter", [["wsCardOf", "kriv"]]]]}]),
  w11:NV("N","한 번의 교대 근무","얼어 가는 작업자가 후임을 찾고 있다. 다음 사람이 올 때까지만 자리를 맡아 달라고 한다.",[{"b": "대신 선다", "s": "최대 체력 -5%, 크리뷔스 카드 1장, 친호도 +20", "fx": [["maxPct", -5], ["wsCardOf", "kriv"], ["fav", "kriv", 20]]}, {"b": "따뜻한 것을 건넨다", "s": "실링 -10000 (10단화), 체력 +15%", "fx": [["goldRaw", -10000], ["hpPct", 15]], "cost": 10000}]),
  w12:NV("N","눈 치우기","공방 문이 밤새 내린 눈에 묻혔다.",[{"b": "삽을 든다", "s": "체력 -5%, 친호도 +10", "fx": [["hpPct", -5], ["fav", "kriv", 10]]}, {"b": "돌아간다", "s": "아무 일도 없다", "fx": []}]),
  w13:NV("N","전임자의 장갑","못에 낡은 장갑이 걸려 있다. 주인은 더 이상 오지 않는다.",[{"b": "낀다", "s": "따뜻한 한마디 1장, 친호도 +10", "fx": [["cardN", "따뜻한 한마디"], ["fav", "kriv", 10]]}, {"b": "그대로 둔다", "s": "친호도 +5", "fx": [["fav", "kriv", 5]]}]),
  w14:NV("N","연차 순서","고참이 신입을 몰아세운다.",[{"b": "신입을 감싼다", "s": "이벤트 전투(운반부), 승리 시 친호도 +15", "fx": [["evFight", "porter", [["fav", "kriv", 15]]]]}, {"b": "지켜본다", "s": "아무 일도 없다", "fx": []}]),
  w15:NV("N","냉각기 경보","배관 하나가 터지려 한다.",[{"b": "배관을 붙든다", "chk": {"s": "def", "d": "hard"}, "ok": {"s": "친호도 +20", "fx": [["fav", "kriv", 20]]}, "ng": {"s": "다음 전투 동안 코스트 -1", "fx": [["next", "cost", -1]]}}, {"b": "대피한다", "s": "아무 일도 없다", "fx": []}]),
  w16:NV("N","말없는 식사","맞은편 사람이 말없이 국그릇을 밀어 준다.",[{"b": "먹는다", "s": "체력 +15%, 친호도 +5", "fx": [["hpPct", 15], ["fav", "kriv", 5]]}, {"b": "도로 밀어 준다", "s": "아무 일도 없다", "fx": []}]),
  w17:NV("N","화가 난 고참","창고 규칙을 어겼다. 고참은 말 대신 다가온다.",[{"b": "사과한다", "s": "친호도 +10", "fx": [["fav", "kriv", 10]]}, {"b": "맞선다", "s": "이벤트 전투(운반부), 승리 시 실링 +50000 (50단화)", "fx": [["evFight", "porter", [["gold", 50000]]]]}]),
  w18:NV("N","넘겨받은 일","쓰러진 작업자의 일이 아직 절반 남아 있다.",[{"b": "이어받는다", "s": "최대 체력 -5%, 친호도 +15", "fx": [["maxPct", -5], ["fav", "kriv", 15]]}, {"b": "잠시 멈춰 선다", "s": "친호도 +5", "fx": [["fav", "kriv", 5]]}]),
  w19:NV("N","협업 납품","다른 공방으로 갈 냉매제가 일손이 없어 쌓여 있다.",[{"b": "나른다", "chk": {"s": "atk", "d": "normal"}, "ok": {"s": "실링 +50000 (50단화), 친호도 +10", "fx": [["gold", 50000], ["fav", "kriv", 10]]}, "ng": {"s": "체력 -15%", "fx": [["hpPct", -15]]}}, {"b": "거절한다", "s": "아무 일도 없다", "fx": []}]),
  w20:NV("S","납치","정중한 질문을 거절하자 눈앞이 어두워졌다. 눈을 뜨니 작품 앞이고, 전시가가 설명을 시작한다.",[{"b": "끝까지 듣는다", "s": "체력 -10%, 아쉬부티 카드 1장, 친호도 +10", "fx": [["hpPct", -10], ["wsCardOf", "ash"], ["fav", "ash", 10]]}, {"b": "빠져나간다", "s": "이벤트 전투(곡해파 전시가), 승리 시 실링 +50000 (50단화)", "fx": [["evFight", "interp", [["gold", 50000]]]]}]),
  w22:NV("S","아카데미 입구","확인되지 않은 신원은 들어갈 수 없다고 한다.",[{"b": "증명한다", "chk": {"s": "acc", "d": "hard"}, "ok": {"s": "아카데미 교재 1장, 친호도 +15", "fx": [["cardN", "아카데미 교재"], ["fav", "ash", 15]]}, "ng": {"s": "실링 -10000 (10단화)", "fx": [["goldRaw", -10000]]}}, {"b": "돌아간다", "s": "아무 일도 없다", "fx": []}]),
  w23:NV("S","걸린 실","손에 든 물건에 가느다란 실이 걸렸다. 실은 어딘가로 이어져 있다.",[{"b": "실을 따라간다", "s": "실 한 가닥 1장, 친호도 +15", "fx": [["cardN", "실 한 가닥"], ["fav", "ash", 15]]}, {"b": "끊고 간다", "s": "아무 일도 없다", "fx": []}]),
  w24:NV("S","특색 있는 패션","곡해파 사람이 옷 한 벌을 들이민다.",[{"b": "입어 본다", "s": "특색 있는 의상 1장, 친호도 +10", "fx": [["cardN", "특색 있는 의상"], ["fav", "ash", 10]]}, {"b": "거절한다", "s": "이벤트 전투(곡해파 전시가), 승리 시 실링 +50000 (50단화)", "fx": [["evFight", "interp", [["gold", 50000]]]]}]),
  w25:NV("S","피할 수 없는 해설","해설사와 눈이 마주쳤다.",[{"b": "듣는다", "s": "다음 전투 첫 턴 드로우 -1, 친호도 +10", "fx": [["next", "draw0", -1], ["fav", "ash", 10]]}, {"b": "달아난다", "chk": {"s": "acc", "d": "normal"}, "ok": {"s": "아무 일도 없다", "fx": []}, "ng": {"s": "체력 -10%", "fx": [["hpPct", -10]]}}]),
  w26:NV("S","자수 세기","검은 옷의 금색 자수가 길수록 높은 사람이라고 한다.",[{"b": "가장 긴 자수에게 인사한다", "s": "친호도 +10", "fx": [["fav", "ash", 10]]}, {"b": "가장 짧은 자수에게 말을 건다", "s": "실링 +10000 (10단화)", "fx": [["gold", 10000]]}]),
  w27:NV("S","틀린 고증","전시품 설명에 틀린 부분이 보인다.",[{"b": "지적한다", "s": "이벤트 전투(보존파 고증가), 승리 시 친호도 +15", "fx": [["evFight", "keeper", [["fav", "ash", 15]]]]}, {"b": "입을 다문다", "s": "아무 일도 없다", "fx": []}]),
  w28:NV("S","실로 된 세상","방직파가 세상 모든 것이 실로 이루어져 있다며 실을 판다.",[{"b": "산다", "s": "실링 -10000 (10단화), 치유의 실 1장, 친호도 +15", "fx": [["goldRaw", -10000], ["cardN", "치유의 실"], ["fav", "ash", 15]], "cost": 10000}, {"b": "지나친다", "s": "아무 일도 없다", "fx": []}]),
  w29:NV("S","괴짜의 첫 작품","학생이 알 수 없는 무언가를 내밀며 평을 기다린다.",[{"b": "칭찬한다", "s": "친호도 +10", "fx": [["fav", "ash", 10]]}, {"b": "솔직히 말한다", "s": "다음 전투 시작 시 예술적 감각 +1", "fx": [["next", "art", 1]]}]),
  w30:NV("W","퇴비 집하장","길을 잘못 들자 노동자들이 고개를 든다. 더 이상 역할을 못 하는 것들을 옮기던 손이 이쪽을 향한다.",[{"b": "일하러 왔다고 한다", "s": "다음 전투 시작 시 먹기 +5, 친호도 +10", "fx": [["next", "food", 5], ["fav", "remi", 10]]}, {"b": "나는 퇴비가 아니라고 한다", "s": "이벤트 전투(배식꾼), 승리 시 레미 카드 1장", "fx": [["evFight", "server", [["wsCardOf", "remi"]]]]}]),
  w31:NV("W","이곳의 식사","비타민 덩어리 한 알을 입에 넣자 입안에 고기 맛이 번진다.",[{"b": "삼킨다", "s": "체력 +20%, 친호도 +15", "fx": [["hpPct", 20], ["fav", "remi", 15]]}, {"b": "재료를 묻는다", "s": "아무도 대답하지 않는다, 레미 공방 주가 +10%", "fx": [["stock", "remi", 10]]}]),
  w32:NV("W","불량 식품 노점","영양분은 없고 맛만 있는 것을 몰래 판다.",[{"b": "사 먹는다", "s": "실링 -10000 (10단화), 불량 식품 1장", "fx": [["goldRaw", -10000], ["cardN", "불량 식품"]], "cost": 10000}, {"b": "공방에 알린다", "s": "친호도 +10", "fx": [["fav", "remi", 10]]}]),
  w33:NV("W","진흙의 맛","노동자가 진흙을 씹으며 맛있다고 한다.",[{"b": "함께 씹는다", "s": "체력 +10%, 친호도 +10", "fx": [["hpPct", 10], ["fav", "remi", 10]]}, {"b": "뱉는다", "s": "아무 일도 없다", "fx": []}]),
  w34:NV("W","야간 교대","일손이 모자란 작업장에 불이 꺼지지 않는다.",[{"b": "일손을 보탠다", "s": "체력 -10%, 친호도 +15", "fx": [["hpPct", -10], ["fav", "remi", 15]]}, {"b": "지나친다", "s": "아무 일도 없다", "fx": []}]),
  w35:NV("W","모양과 질감","퇴비를 빵 모양으로 찍어 내는 틀이 비어 있다.",[{"b": "찍어 본다", "chk": {"s": "acc", "d": "normal"}, "ok": {"s": "식감 찍어내기 1장, 친호도 +15", "fx": [["cardN", "식감 찍어내기"], ["fav", "remi", 15]]}, "ng": {"s": "실링 -10000 (10단화)", "fx": [["goldRaw", -10000]]}}, {"b": "구경만 한다", "s": "아무 일도 없다", "fx": []}]),
  w36:NV("W","멈춘 추출기","철에서 영양분을 뽑는 기계가 멈춰 있다.",[{"b": "고친다", "chk": {"s": "atk", "d": "normal"}, "ok": {"s": "친호도 +15", "fx": [["fav", "remi", 15]]}, "ng": {"s": "체력 -10%", "fx": [["hpPct", -10]]}}, {"b": "지나친다", "s": "아무 일도 없다", "fx": []}]),
  w37:NV("W","끝이 온 것들","더 이상 역할을 할 수 없게 된 무언가들이 실려 온다.",[{"b": "함께 나른다", "s": "친호도 +10", "fx": [["fav", "remi", 10]]}, {"b": "눈을 돌린다", "s": "아무 일도 없다", "fx": []}]),
  w38:NV("W","배식 줄 다툼","줄 앞쪽에서 주먹이 오간다.",[{"b": "말린다", "s": "이벤트 전투(배식꾼), 승리 시 친호도 +15", "fx": [["evFight", "server", [["fav", "remi", 15]]]]}, {"b": "줄을 지킨다", "s": "체력 +10%", "fx": [["hpPct", 10]]}]),
  w39:NV("W","책임자 없는 공방","책임자를 찾았지만 노동하는 사람뿐이다.",[{"b": "밀린 일을 정리한다", "s": "실링 +10000 (10단화), 친호도 +10", "fx": [["gold", 10000], ["fav", "remi", 10]]}, {"b": "돌아간다", "s": "아무 일도 없다", "fx": []}])
});
function pickEvent(reg){const r=S.run,all=Object.keys(GEV).filter(k=>GEV[k].place===curPlace()&&(!reg||!GEV[k].zone||GEV[k].zone==='C'||GEV[k].zone===reg));let left=all.filter(k=>!r.flags.events.includes(k));if(!left.length)left=all;return pick(left)}
const myth=()=>S.run.mode!=='human';
function hpFloor(){const r=S.run;return r.mode==='dain'?Math.ceil(r.maxHp*.01):1}
/* 이벤트 결과 적용 — 순서대로, 화면이 필요한 것(전투 등)은 끝나면 다음으로 */
function runFx(list,done,notes=[]){
  const r=S.run;if(!list.length){if(notes.length)toast('사건',notes.join(' · '));return done()}
  const[op,a,b]=list[0],next=()=>runFx(list.slice(1),done,notes);
  const deckFixed=()=>{if(!notes.includes('신화덱은 고정되어 있어 카드가 바뀌지 않는다'))notes.push('신화덱은 고정되어 있어 카드가 바뀌지 않는다')};
  switch(op){
    case'goldRaw':r.gold=Math.max(0,r.gold+a);return next();
    case'gold':{let v=a;if(v>0){if(eq('u_badge'))v=Math.round(v*1.5);v=Math.round(v*diffGm())}r.gold=Math.max(0,r.gold+v);return next()}
    case'card':if(myth()){deckFixed();return next()}for(let i=0;i<(b||1);i++)addToDeck(a);return next();
    case'hp':r.hp=Math.max(hpFloor(),Math.min(r.maxHp,r.hp+a));return next();
    case'hpPct':r.hp=Math.max(hpFloor(),Math.min(r.maxHp,r.hp+Math.round(r.maxHp*a/100)));return next();
    case'maxHp':r.maxHp=Math.max(1,r.maxHp+a);r.hp=clamp(r.hp,hpFloor(),r.maxHp);return next();
    case'removeId':{if(myth()){deckFixed();return next()}const c=r.deck.find(x=>x.id===a);if(c){r.deck.splice(r.deck.indexOf(c),1);notes.push(`「${CARDS[a].name}」 제거`)}else notes.push(`덱에 ${CARDS[a].name}이(가) 없다`);return next()}
    case'gear':{if(!gearOf(a).length)return next();const k=pick(gearOf(a));notes.push(`장비 「${GEAR[k].n}」 (${GRADE[a]})`);return gainGear(k,next)}
    case'mimirCost':{if(r.mode==='human'){const k=1+a/100;r.base1=r.base1*k;r.maxHp=Math.max(1,Math.round(r.maxHp*k))}else r.maxHp=Math.max(1,r.maxHp+b);r.hp=clamp(r.hp,hpFloor(),r.maxHp);return next()}
    case'traitSwap':{if(!r.traits||!r.traits.length){notes.push('바뀔 특성이 없다');return next()}const i=Math.floor(rnd()*r.traits.length),old=r.traits[i];
      const pool=Object.keys(PTRAIT).filter(k=>!PTRAIT[k].hide&&!r.traits.includes(k)&&!PT_CONFLICT.some(p=>p.includes(k)&&p.some(q=>q!==k&&r.traits.includes(q)&&q!==old)));
      if(pool.length){const nk=pick(pool);r.traits[i]=nk;if(old==='hpUp'||old==='hpDown'||nk==='hpUp'||nk==='hpDown'){const m0=hpMulOf(r.traits.map(k=>k===nk?old:k)),m1=hpMulOf(r.traits);r.base1=r.base1/m0*m1;r.maxHp=Math.max(1,Math.round(r.maxHp/m0*m1));r.hp=clamp(r.hp,1,r.maxHp)}
        notes.push(`특성 「${PTRAIT[old].n}」 → 「${PTRAIT[nk].n}」`)}return next()}
    case'next':r.next=r.next||{};r.next[a]=(r.next[a]||0)+b;return next();
    case'act':{const F=r.act===2?(r.flags.actF=r.flags.actF||{}):r.flags;F[a]=(F[a]||0)+b;return next()}
    case'rename':{if(myth()){deckFixed();return next()}return pickFromDeck('이름이 바뀔 카드를 고른다 (효과는 그대로)',c=>{const sc=openScreen('',{dim:true});
      sc.innerHTML=`<div class="panel" style="width:min(640px,100%)"><div class="ptitle">아이의 이름</div><div class="psub">「${cardName(c.id,c)}」의 새 이름</div><input id="nmIn" maxlength="12" value="${pick(['이름 없는 것','정의된 것','창구의 이름','새로 불린 것'])}" style="font:inherit;font-size:22px;padding:10px;border-radius:8px;border:1px solid #ffffff40;background:#0d0e10;color:var(--bone)"><div class="choices"><button class="btn-main" id="nmOk">이 이름으로</button></div></div>`;
      $('#nmOk').onclick=()=>{const v=($('#nmIn').value||'').trim();if(v)c.nick=v;notes.push(`「${CARDS[c.id].name}」 → 「${c.nick||CARDS[c.id].name}」`);save();next()}},next)}
    case'patentFree':{if(myth()){return next()}return pickFromDeck('특허가 걸리지 않을 카드를 고른다 (이번 장 동안)',c=>{r.flags.patentFree=c.uid;notes.push(`「${CARDS[c.id].name}」 특허 면제`);save();next()},next)}
    case'wsCard':{if(myth()){deckFixed();return next()}const id=pick(Object.keys(CARD_PRICE2));addToDeck(id);notes.push(`「${CARDS[id].name}」`);return next()}
    case'wsGear':{const k=pick(Object.keys(GEAR).filter(x=>GEAR[x].ws2===a));notes.push(`장비 「${GEAR[k].n}」`);return gainGear(k,next)}
    case'rareCard':{if(myth()){deckFixed();return next()}const id=pick([...POOL.uncommon.filter(x=>!CARDS[x].tmp),...Object.keys(CARD_PRICE2).filter(x=>CARDS[x].rar==='uncommon')]);addToDeck(id);notes.push(`「${CARDS[id].name}」`);return next()}
    case'loseArm':{ensureGear(r);const sl=r.gear.rh.map((k,i)=>k?i:-1).filter(i=>i>=0);if(!sl.length){notes.push('착용 중인 팔 장비가 없다');return next()}const i=pick(sl),old=takeOff(r,'rh',i);notes.push(`「${GEAR[old].n}」을(를) 건넸다`);return next()}
    case'sellFull':{ensureGear(r);const list=[...GSLOT_ORDER.flatMap(s=>r.gear[s].map((k,i)=>k?{k,s,i}:null).filter(Boolean)),...r.bag.map((k,j)=>({k,j}))];if(!list.length){notes.push('맡길 장비가 없다');return next()}
      const sc=openScreen('',{dim:true});sc.innerHTML=`<div class="panel" style="width:min(980px,100%)"><div class="ptitle">감정사</div><div class="psub">장비 1개를 원래 가격 100%로 판다</div><div class="eqgrid">${list.map((x,n)=>gearCardHTML(x.k,`<div class="eqact"><button class="plate-btn" data-sl="${n}">판다 · ${money(GEAR[x.k].p)}</button></div>`)).join('')}</div><button class="btn-ghost" id="slNo">그만둔다</button></div>`;
      sc.querySelectorAll('[data-sl]').forEach(b=>b.onclick=()=>{const x=list[+b.dataset.sl];if(x.s)takeOff(r,x.s,x.i);else r.bag.splice(r.bag.indexOf(x.k),1);r.gold+=GEAR[x.k].p;notes.push(`「${GEAR[x.k].n}」 +${money(GEAR[x.k].p)}`);save();next()});$('#slNo').onclick=next;return}
    case'fav':favAdd(a,b,notes);return next();
    case'wsCardOf':{if(myth()){deckFixed();return next()}const id=pick(WS2[a].cards.filter(x=>CARD_PRICE2[x]));addToDeck(id);notes.push(`「${CARDS[id].name}」 — 카드 보관함으로`);return next()}
    case'cardN':{if(myth()){deckFixed();return next()}const id=Object.keys(CARDS).find(x=>CARDS[x].name===a);if(id){addToDeck(id);notes.push(`「${a}」 — 카드 보관함으로`)}return next()}
    case'maxPct':{r.maxHp=Math.max(1,r.maxHp+Math.round(r.maxHp*a/100));r.hp=clamp(r.hp,hpFloor(),r.maxHp);return next()}
    case'stock':{const st=ensureStock(r);st.p[a]=Math.round(st.p[a]*(1+b/100));notes.push('주가가 올랐다');return next()}
    case'evFight':{const E=makeEnemy(a);r.at={kind:'combat',enemy:E,evb:b||[]};save();if(notes.length)toast('사건',notes.join(' · '));return transition(resumeAt)}
    case'fight':{const E=makeEnemy(a);if(b&&b.noFlee)E.noFlee=true;r.at={kind:'combat',enemy:E};save();if(notes.length)toast('사건',notes.join(' · '));return transition(resumeAt)}
  }
  next();
}
function showEventKey(k){
  const r=S.run;if(!GEV[k]){k=pickEvent();if(!k)return showMap();r.at={kind:'event',ev:k};save()}
  S.screen='event';renderTop();viewFor('map');const ev=GEV[k];ev._rr=0;setTimeout(()=>palEv('event'),350);
  const sc=openScreen('',{dim:true});
  sc.innerHTML=`<div class="panel evpanel" style="width:min(800px,100%)"><div><div class="psub">사건 · ${PLACE[ev.place]}${ev.zone?` · ${ev.zone==='C'?'공통':DIR2[ev.zone].n}`:''}</div><div class="ptitle">${ev.title}</div></div>
    <div class="ptext">${ev.text}</div><div class="choices">${ev.choices.map((c,i)=>{const L=c.chk&&luck(c.chk),poor=c.cost&&r.gold<c.cost;
      return`<button class="choice" data-i="${i}" ${poor?'disabled':''}><b>${c.b}</b>${c.chk?`<i class="chk${L.auto?' auto':L.pct<35?' low':''}">${chkLabel(c.chk,L)}</i><span>성공: ${c.ok.s}<br>실패: ${c.ng.s}${poor?' — 실링이 모자라다':''}</span>`:`<span>${c.s}${poor?' — 실링이 모자라다':''}</span>`}</button>`}).join('')}</div></div>`;
  sc.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{const c=ev.choices[+b.dataset.i];r.flags.events.push(k);jmAct();
    if(!c.chk)return runFx(c.fx,showMap);rollLuck(ev,c)});
}
/* 운 주사위를 굴리는 화면 */
function rollLuck(ev,c){
  const L=luck(c.chk),roll=L.auto?null:ri(L.M,36),ok=L.auto||roll>=L.need,res=ok?c.ok:c.ng;
  const sc=openScreen('',{dim:true});
  sc.innerHTML=`<div class="panel evpanel" style="width:min(640px,100%);align-items:center;text-align:center"><div><div class="psub">${ev.title} · ${c.b}</div><div class="ptitle">운 주사위</div></div>
    <div class="dwrap" id="dw">${d36SVG(L.auto?'—':L.M,'rolling')}</div>
    <div class="lines" style="min-width:min(420px,100%)"><div><span>최소값 M</span><b>${L.M}</b></div><div><span>목표값 T</span><b>${L.auto?`${L.need} (M 이하 · 무조건 통과)`:`${L.need} 이상`}</b></div></div>
    <div class="dres" id="dres" hidden></div><button class="btn-main" id="dGo" hidden>계속</button></div>`;
  const fin=()=>{const dw=$('#dw');if(!dw)return;dw.innerHTML=d36SVG(L.auto?'✓':roll,ok?'ok':'ng');sfx(ok?'block':'hurt',.6);
    const dr=$('#dres');dr.hidden=false;dr.className='dres '+(ok?'ok':'ng');dr.innerHTML=`<b>${L.auto?'판정 없이 통과':ok?'성공':'실패'}</b><span>${res.s}</span>`;
    const go=$('#dGo');go.hidden=false;go.onclick=()=>runFx(res.fx,ev.back||showMap);go.focus({preventScroll:true});
    if(!ok&&eq('u_cert')&&!ev._rr){ev._rr=1;const b2=document.createElement('button');b2.className='btn-ghost';b2.textContent='교육 수료증 — 다시 굴린다';b2.onclick=()=>rollLuck(ev,c);go.after(b2)}};
  if(L.auto||REDUCED)return fin();
  let n=0;const tick=()=>{const dw=$('#dw');if(!dw)return;if(n++>=16)return fin();dw.innerHTML=d36SVG(ri(L.M,36),'rolling');sfx('miss',.3);setTimeout(tick,40+n*6)};tick();
}
/* 신화 빌드로 바뀔 때 (V30.14.5) — 공격레벨·방어레벨·최대 체력은 그 신의 기준 수치와 지금 주인공의 수치(장비 제외) 중 높은 쪽. 신화를 얻고 약해지지 않게 */
function mythCarry(r,atk0,def0,hp0){const g=gs('hp');return{atk:Math.max(atk0,r.atk),def:Math.max(def0,r.def),maxHp:Math.max(hp0,(r.maxHp||0)-g)+g}}
/* 사건으로 죽었을 때 — 기본 게임 오버 화면 */
function eventDeath(text){
  const r=S.run;clearSave();S.screen='over';renderTop();
  const sc=openScreen('',{dim:true});
  sc.innerHTML=`<div class="panel" style="align-items:center;text-align:center"><div class="psub">세계수 등반</div><div class="ptitle">쓰러졌다</div><div class="ptext">${text}</div>
    <div class="lines" style="min-width:min(420px,100%)"><div><span>도달한 막</span><b>${r.floor} / ${ROWS}</b></div><div><span>처치</span><b>${r.kills}</b></div><div><span>레벨</span><b>${r.lvl}</b></div></div>
    <button class="btn-main" id="goT">처음으로</button></div>`;
  $('#goT').onclick=()=>showTitle({menu:true});
}
function eventPanel(title,sub,text,choices){
  const sc=openScreen('',{dim:true});
  sc.innerHTML=`<div class="panel" style="width:min(760px,100%)"><div><div class="psub">${sub}</div><div class="ptitle">${title}</div></div>
    <div class="ptext">${text}</div><div class="choices">${choices.map((c,i)=>`<button class="choice" data-i="${i}"><b>${c.b}</b><span>${c.s}</span></button>`).join('')}</div></div>`;
  sc.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{jmAct();choices[+b.dataset.i].f()});
}
function pickFromDeck(title,onPick,onBack,list){
  const r=S.run,sc=openScreen('',{dim:true});
  const cards=[...(list||r.deck)].sort(deckSort);
  sc.innerHTML=`<div class="panel" style="width:min(1300px,100%);height:100%"><div class="maphead"><div class="ptitle">${title}</div><button class="btn-ghost" id="pkBack">돌아가기</button></div>
    <div class="cardgrid">${cards.length?cards.map(c=>`<div class="cardpick">${staticCard(c.id,false,c)}<button class="plate-btn" data-uid="${c.uid}">고르기</button></div>`).join(''):'<div class="hint">고를 수 있는 카드가 없습니다</div>'}</div></div>`;
  bindStatic(sc);
  sc.querySelectorAll('[data-uid]').forEach(b=>b.onclick=()=>onPick(r.deck.find(c=>c.uid===+b.dataset.uid)));
  $('#pkBack').onclick=onBack;
}
const RAR_ORDER={ult:-2,mastery:-1,special:0,start:1,common:2,uncommon:3,combo:4,fusion:5,rare:6,curse:7};
const deckSort=(a,b)=>(RAR_ORDER[CARDS[a.id].rar]-RAR_ORDER[CARDS[b.id].rar])||CARDS[a.id].name.localeCompare(CARDS[b.id].name,'ko');

