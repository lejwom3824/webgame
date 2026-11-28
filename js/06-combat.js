"use strict";
/* ================= combat setup ================= */
function has(E,t){return E.traits.includes(t)}
function makeEnemy(key){
  const d=ENEMY[key];const lv=Array.isArray(d.lv)?ri(d.lv[0],d.lv[1]):d.lv;const HPR2={mech:[750,952],porter:[727,923],server:[840,1067],appr:[637,807],poor:[615,778]},HPF2={sender:1418,examiner:1422,craftsman:1619,collab:1619,docent:1619,chef:1619,guard:1794,clerk:4300};
  if(!d.hpR&&HPR2[key])d.hpR=HPR2[key];
  /* 문서에 체력 범위가 따로 적힌 적은 그 범위를 레벨에 맞춰 나눔 (이단심문관 308~422) */
  let maxHp=HPF2[key]||(d.hpR?Math.round(d.hpR[0]+(d.hpR[1]-d.hpR[0])*(lv-d.lv[0])/(d.lv[1]-d.lv[0])):hpAt(d.st?ri(d.st.hp[0],d.st.hp[1]):d.hp1,lv));
  const E={key,name:d.names?pick(d.names):d.name,sub:d.sub||'',tier:d.tier,lv,maxHp,hp:0,atk:d.st?ri(d.st.atk[0],d.st.atk[1])+lvAB(lv):d.atkFix||lvAB(lv)+(d.ab||0),def:d.st?ri(d.st.def[0],d.st.def[1])+lvAB(lv):d.atkFix||lvAB(lv)+(d.ab||0),acc:d.acc,eva:d.eva,nord:!!d.nord,block:0,evaB:0,weak:0,vuln:0,el:0,burn:0,traits:[],
    frost:false,revenge:0,firstAtk:true,turn:0,prosth:false,coward:false,fled:false,intent:null,idx:0,last:[],boss:key==='bishop',steam:0,heat:0,cool:0,crack:0,food:0};
  const nT=d.tier==='normal'?ri(0,1):d.tier==='elite'?ri(1,2):0;
  const names=Object.keys(TRAITS);
  while(E.traits.length<nT){const t=pick(names);if(E.traits.includes(t))continue;
    if(TRAIT_CONFLICT.some(p=>p.includes(t)&&p.some(q=>q!==t&&E.traits.includes(q))))continue;E.traits.push(t)}
  E.traits.forEach(t=>TRAITS[t].ap&&TRAITS[t].ap(E));
  if(key==='priest'&&S.run&&S.run.flags&&S.run.flags.priestAtk)E.atk+=S.run.flags.priestAtk;
  if(key==='mech'&&S.run&&S.run.flags&&S.run.flags.actF&&S.run.flags.actF.mechAtk)E.atk+=S.run.flags.actF.mechAtk;
  /* 난이도: 적 1레벨 기준 체력·공방렙 보정 (정예·보스 포함, 그 런 동안) */
  {const em=diffEm();if(em!==1){E.maxHp=Math.round(E.maxHp*em);E.atk=Math.round(E.atk*em);E.def=Math.round(E.def*em)}}
  /* 행동 포인트 — 주인공이 카드 1장을 쓸 때마다 1 소모, 0이 되면 곧바로 행동 (시작 평균 5, 보스 10) */
  E.apMax=d.apMax||(d.tier==='boss'?10:d.tier==='elite'?6:5);E.ap=E.apMax;
  {const tb=TUNE.cb,a=(S.run&&S.run.act)||1,t=E.tier||'normal',fl=(S.run&&S.run.floor)||0,rp=a===1&&tb.ramp?Math.min(1,Math.max(0,fl-1)/tb.ramp):1,mk=v=>1+((v||1)-1)*rp;
    E.maxHp=Math.round(E.maxHp*mk((tb.hp[a]||{})[t]));E.dmgMul=Math.round(((a===1?(tb.dmg[a]||{})[t]:mk((tb.dmg[a]||{})[t]))||1)*1000)/1000}
  /* 기입관: 페이즈당 체력은 난이도별 고정값 (V2.29.49.12) */
  if(key==='clerk')E.maxHp=CLERK_HP[(S.run&&S.run.diff)||'easy']||CLERK_HP.easy;
  E.hp=E.maxHp;
  if(E.boss){Object.assign(E,{phase:1,anger:0,human:0,p2turns:0,mercyCD:-1,wfSkip:false,said:{},baseAcc:E.acc,kn:null,pendPhase:0});
  }
  return E;
}
/* 은빛 기사가 살아 있으면 보스가 받는 피해를 기사가 대신 받음 (전투 시작 때 적을 복사하므로 여기서 연결) */
function bossGuard(E){let _hp=E.hp;Object.defineProperty(E,'hp',{enumerable:true,configurable:true,get(){return _hp},set(v){if(v<_hp&&knAlive(E).length){_hp-=knightTake(_hp-v);return}_hp=v}})}
function startCombat(E0){try{ultReset()}catch(e){}
  const r=S.run;heavySync(r);
  const draw=shuffle(r.deck.map(c=>({uid:c.uid,id:c.id})));
  const foeList=Array.isArray(E0)?E0:[typeof E0==='string'?makeEnemy(E0):E0];
  const C={E:foeList[0],foes:foeList,draw,hand:[],disc:[],exh:[],powers:[],
    energy:0,maxE:3,drawN:5,nextEnergy:0,block:0,evaB:0,pWeak:0,pVuln:0,pEl:0,pBurn:0,temper:0,discount:false,
    pend:[],eat:0,healAcc:0,seal:{},brand:[],turn:0,mk:{lv:0,setT:-9,expT:-9,hitT:-9,lock:-9},fracS:-9,fracEnd:-9,pWkF:0,phase:'player',over:false,select:null,recoil:0,hold:false,ashBonus:0,
    blockDebt:pt('blockDebt')?5:0,yu:0,yuT:0,freshN:0,sameN:0,noHurtN:0,lastCid:null,hurtR:false,bashPend:0,bashNow:0,hitsTurn:0,log:[],
    evaMod:(r.next&&r.next.eva)||0,costMod:(r.next&&r.next.cost)||0,cost1:(r.next&&r.next.cost1)||0};
  if(C.E.tut){C.E.intent=null}
  for(const f of C.foes){if(f.apMax==null){f.apMax=f.boss?10:f.tier==='elite'?6:5}f.ap=f.apMax;f.early=false}
  C.atInfo={rush:r.at&&r.at.rush!=null?r.at.rush:null,laev:!!(r.at&&r.at.laev),node:r.at?r.at.node:null,evb:r.at&&r.at.evb?r.at.evb:null,spar:(r.at&&r.at.spar)||null,shopFight:!!(r.at&&r.at.shopFight)};C.rush=C.atInfo.rush;C.noFlee=!!(r.at&&r.at.noFlee);if(C.E&&C.E.riftHp){C.E.maxHp=C.E.hp=C.E.riftHp;C.E.riftHp=0}palStart();C.noWs=C.rush===2&&r.rushWs?r.rushWs:null;
  C.eqUsed={};C.wsUse={};
  if(eqW('km_b')){const pool=EQ_ALL.filter(k=>!EQUIP[k].ws&&!EQUIP[k].held&&!(r.equip||[]).includes(k));if(pool.length)C.tempEq=pick(pool)}
  S.C=C;S.screen='combat';viewFor('combat');
  if(C.tempEq)clog(`크리밀라 공방: 이번 전투 동안 「${EQUIP[C.tempEq].n}」 효과를 얻음`,'h');
  
  const sc=$('#screen');sc.hidden=true;sc.innerHTML='';sc.style.top='';
  $('#hand').innerHTML='';handEls.clear();
  showCombatUI();
  const E=C.E;
  for(const f of C.foes)clog(`전투 시작 · ${f.name} Lv ${f.lv} · 체력 ${f.maxHp} · 공격레벨 ${f.atk} · 방어레벨 ${f.def} · 명중 ${f.acc} · 회피 ${f.eva}`,'h');
  if(C.noWs)toast('계약 파기 전투',`이 전투에서는 ${WS2[C.noWs].n} 카드를 쓸 수 없다`);
  if(E.boss){say(BOSS_LINES.start)}
  if(r.next){const t=[];if(r.next.eva)t.push(`회피 ${r.next.eva}`);if(r.next.cost)t.push(`코스트 ${r.next.cost}`);if(r.next.cost1)t.push(`첫 턴 코스트 +${r.next.cost1}`);if(t.length){toast('사건의 여파',t.join(' · '));clog('사건의 여파: '+t.join(' · '))}}
  a2CombatStart(C);
  for(const f of C.foes)if(f.boss)bossGuard(f);
  for(const f of C.foes){C.E=f;chooseIntent()}C.E=C.foes[0];
  startPlayerTurn();sitCheck();
}

/* ================= combat math (웹게임 문서: 전투 스탯 · 최종 데미지) ================= */
const hitChance=(acc,eva)=>clamp(Math.round(acc-(eva-50)),5,100);
/* 최종 데미지 = (카드 데미지 + 고정 추가 피해) × (1 + 0.04 × 공격레벨 + 특성 합) × (1 − 0.004 × 상대 방어레벨), 감소 최대 80% */
function formula(die,flat,atk,traits,def,o={}){
  const ts=traits.reduce((s,x)=>s+x.v,0);
  const mult=Math.max(0,1+.04*atk+ts),red=o.ignoreDef?0:Math.min(.8,.004*Math.max(0,def));
  const raw=(die+flat)*mult*(1-red)*(o.x||1),fin=Math.max(0,Math.round(raw));
  const tt=traits.map(x=>`${x.v<0?' − ':' + '}${+Math.abs(x.v).toFixed(2)} ${x.n}`).join('');
  const text=`(${die} + ${flat}) × (1 + 0.04×${atk}${tt}) × (1 − ${o.ignoreDef?'0 [방어 관통]':`0.004×${def}${red>=.8?' [상한 80%]':''}`})${o.x&&o.x!==1?` × ${o.x}`:''} = ${+raw.toFixed(2)} → ${fin}`;
  return{fin,raw,text};
}
const pt=k=>!!(S.run&&S.run.traits&&S.run.traits.includes(k));
/* V2.37.78.22: 특성의 % 효과는 최종 결과에 곱함 */
const leechOn=()=>pt('leech')&&S.run.hp<=S.run.maxHp*.5;
const trMul=()=>(pt('smite')?1.25:1)*(pt('dmgDown')?.8:1)*(pt('pacifist')?.5:1)*(leechOn()?1.1:1);
/* 특성으로 오르는 공격 위력 — 새로운/똑같은 카드 중첩, 아픈건 싫어서, 선택과 집중, 실드로 패기 */
const trPow=()=>{const C=S.C;if(!C)return 0;return((C.freshN||0)+(C.sameN||0)+(C.noHurtN||0))*2+(C.focusT===C.turn?(C.focusP||0):0)+(C.bashNow||0)};
const berserk=()=>S.run.mode==='dain'&&S.run.hp<=S.run.maxHp*.25;
/* 다인 육참골단: 방어레벨(장비 포함)이 전부 공격레벨로 */
/* V2.33.65.16: 무기 — 노르드교 조잡한 단검 (모든 데미지 흡혈 +5% · 공격레벨 +2 · 무기 특수 효과 표식 · 노르드교 전용 카드) */
const WEAPON={n_dagger:{n:'노르드교 조잡한 단검',t:'검 계열 · 모든 데미지 흡혈 +5% · 공격레벨 +2 · 무기 특수 효과 표식 · 노르드교 전용 카드를 쓸 수 있음'}};
/* 카드마다 쓸 수 있는 무기: 물리적으로 불가능한 동작인 카드만 그 무기에서 막음, 목록에 없는 카드는 검·창·둔기 모두 */
const WCLS={n_dagger:'검'},NORD_W=new Set(['n_dagger']);
const CARD_WPN={slash:['검','창'],ms_slash:['검','창'],double:['검','창'],parry:['검','창'],f_pi:['검','창'],stab:['검','창'],n_tear:['검','창']};
const MS_IDS=new Set(['ms_slash','ms_split','ms_flash','ms_kendo','ms_kendo2','f_pi','f_ryeo','f_dae']),NORD_IDS=new Set(['n_weak','n_tear','n_force','u_exec']);
function wpnOk(id){const r=S.run;if(!r||r.mode!=='human'||r.tutB||!CARDS[id])return true;const w=r.weapon,cls=WCLS[w];if(!cls)return true;
  if(MS_IDS.has(id)&&w!=='n_dagger')return false;if(NORD_IDS.has(id)&&!NORD_W.has(w))return false;const a=CARD_WPN[id];return!a||a.includes(cls)}
const dagger=()=>!!(S.run&&S.run.mode==='human'&&S.run.weapon==='n_dagger');
const pAtk=()=>S.run.atk+gs('atk')+(dagger()?2:0)+(S.run.mode==='dain'?S.run.def+gs('def'):0),pDef=()=>S.run.mode==='dain'?0:S.run.def+gs('def');
const pAcc=()=>S.run.acc+(pt('accUp')?10:0)-(pt('accDown')?10:0)+gs('acc');
const pEva=()=>S.run.eva+(pt('evaUp')?10:0)-(pt('evaDown')?10:0)+gs('eva')+(S.C&&S.screen==='combat'?S.C.evaB+(S.C.evaMod||0)-(S.C.evaMinus||0):0);
function rollDie(d,player){
  if(S.run&&S.run.tutB)return Math.round((d.a+d.b)/2);
  let a=d.a,b=d.b;
  if(player&&d.t==='atk'){if(gs('dieWild')){a=Math.max(1,Math.round(a/2));b*=2}}
  let v=ri(a,b);if(player&&d.t==='atk'&&pt('badRoll'))v=Math.min(v,ri(a,b));
  if(S.C&&S.C.spinNow&&S.C.phase==='player'&&v<(a+b)/2){const v2=ri(a,b);clog(`운명의 실패: 주사위 ${v} → ${v2} (다시 굴림)`);v=v2}
  return v;
}
function pDieRange(d){let a=d.a,b=d.b;if(d.t==='atk'){if(gs('dieWild')){a=Math.max(1,Math.round(a/2));b*=2}}return[a,b]}
const atkScale=()=>(pt('atkUp')?1.2:1)*(pt('atkDown')?.8:1);
function pTraits(o={}){
  const C=S.C,E=C.E,t=[];
  if(C.pWeak>0)t.push({n:`허약 ${Math.min(10,C.pWeak)}`,v:+(-.1*Math.min(10,C.pWeak)).toFixed(2)});
  if(E.vuln>0&&true)t.push({n:`취약 ${Math.min(10,E.vuln)}`,v:+(.1*Math.min(10,E.vuln)).toFixed(2)});
  if(E.steam)t.push({n:`증기 ${E.steam}`,v:+Math.min(2,.1*E.steam).toFixed(2)});
  if(E.crack)t.push({n:`깨짐 ${E.crack}단계`,v:.5*E.crack});
  if(o.wb)t.push({n:`가중치 ${o.wb}`,v:+(.1*o.wb).toFixed(2)});
  if(berserk())t.push({n:'광전사-강화',v:.5});
  if(C.yu)t.push({n:'유희',v:+(.2*C.yu).toFixed(2)});
  if(o.giant)t.push({n:'거인 베기',v:.5});
  return t;
}
function eTraits(){
  const C=S.C,E=C.E,t=[];
  if(E.weak>0&&true)t.push({n:`허약 ${Math.min(10,E.weak)}`,v:+(-.1*Math.min(10,E.weak)).toFixed(2)});
  if(C.pVuln>0)t.push({n:`취약 ${Math.min(10,C.pVuln)}`,v:+(.1*Math.min(10,C.pVuln)).toFixed(2)});
  if(C.showT===C.turn)t.push({n:'전시 개막',v:.5});
  if(C.pSteam&&!gs('steamImm'))t.push({n:`증기 ${C.pSteam}`,v:+Math.min(2,.1*C.pSteam).toFixed(2)});
  if(C.pCrack)t.push({n:`깨짐 ${C.pCrack}단계`,v:.5*C.pCrack});
  if(has(E,'용기')&&E.hp<=E.maxHp*.5)t.push({n:'용기',v:.2});
  if(has(E,'광기'))t.push({n:'광기',v:.2});
  if(has(E,'빈털터리'))t.push({n:'빈털터리',v:.1});
  return t;
}
function enemyAcc(){const E=S.C.E;if(E.key==='collab'&&S.C.pFrozen)return 999;return E.acc+(E.key==='inquisitor'&&S.run.flags&&S.run.flags.heresy?10:0)-(E.boss?E.human*5:0)-(E.frost?20:0)-(E.para?10:0)}
/* 예상 피해 범위 (카드·의도 표시용) */
function pPreview(c,d){
  const C=S.C,E=C.E,r=S.run,o=cardStrikeOpts(c);
  const[a,b]=pDieRange(d),sc=atkScale()*(o.scale||1);
  const nul=nulled(c),ms=masterOn()?3:1,oo={...o,nul};
  const lo=formula(Math.round(pAdj(a,oo,b)*sc*ms),o.flat,o.atk,pTraits(o),E.def,{ignoreDef:pt('pierceDef')||!!CARDS[c.id].pierce,x:(o.x||1)*trMul()}).fin;
  const hi=formula(Math.round(pAdj(b,oo,b)*sc*ms),o.flat,o.atk,pTraits(o),E.def,{ignoreDef:pt('pierceDef')||!!CARDS[c.id].pierce,x:(o.x||1)*trMul()}).fin;
  return{lo,hi,ch:CARDS[c.id].sure?100:hitChance(pAcc()+(CARDS[c.id].acc||0),E.eva+E.evaB)};
}
function ePreview(d){
  const C=S.C,E=C.E,r=S.run,x=has(E,'무모함')&&E.firstAtk?2:1;
  const g=gimOf(E),gmx=g?(g==='read'?(GIM.read.ok()?0:1.5):GIM[g].m()):1,m=(E.dmgMul||1)*gmx;return{lo:Math.round(formula(eAdj(d.a),E.revenge,E.atk,eTraits(),pDef(),{x}).fin*m),hi:Math.round(formula(eAdj(d.b),E.revenge,E.atk,eTraits(),pDef(),{x}).fin*m),ch:g==='read'?(GIM.read.ok()?0:100):hitChance(enemyAcc(),pEva())};
}
function applyEnemyStatus(k,n){
  const E=S.C.E;
  if(k==='weak'){
    if(has(E,'광신')){fxAt('enemy','광신 — 약화 무시','info');return}
    if(has(E,'의수')&&!E.prosth){E.prosth=true;fxAt('enemy','의수 — 약화 무시','info');return}
    E.weak=Math.min(10,E.weak+n);clog(`허약 ${n} 부여`)}
  if(k==='vuln'){if(has(E,'상처투성이')){fxAt('enemy','상처투성이 — 취약 무시','info');return}E.vuln+=n;clog(`취약 ${n} 부여`)}
}
/* 계산 로그 */
function clog(t,cls){const C=S.C;if(!C||!C.log)return;C.log.push([cls||'',t]);if(C.log.length>400)C.log.shift()}

/* ================= player turn ================= */
async function startPlayerTurn(){
  const C=S.C,r=S.run;if(C.over)return;
  C.tossTurn=0;
  if(pt('noHurt')&&C.turn>=1){if(!C.hurtR&&(C.noHurtN||0)<10){C.noHurtN=(C.noHurtN||0)+1;clog(`${PTRAIT.noHurt.n}: 공격 위력 +${C.noHurtN*2}`)}}C.hurtR=false;
  C.bashNow=0;C.bashPend=0;if(pt('bash')){const b=Math.floor((C.block||0)*.5);if(b>0){C.bashPend=b;clog(`${PTRAIT.bash.n}: 이번 턴 첫 공격 카드 공격 위력 +${b}`)}}
  C.turn++;C.phase='player';C.block=C.hold?C.block:Math.floor(C.block/2);C.hold=false;C.blockGot=false;C.recoil=0;C.freeAP=0;C.discount=false;C.evaB=C.evaNext||0;C.evaNext=0;C.hitsTurn=0;C.atkRow=0;
  /* 코스트·드로우 증가는 전투 안에서만 — 전투가 끝나면 기본값으로 */
  r.turns=(r.turns||0)+1;const gr=growth(C.turn);C.maxE=gr.e;C.drawN=gr.d;if(pt('light')&&r.deck.length<=10)C.drawN++;if(r.mode==='odin'){C.maxE+=2;C.drawN+=3}/* 올파더 */
  clog(`${C.turn}턴 · 코스트 ${C.maxE} · 드로우 ${C.drawN}`,'h');markTick();pMarkTick();C.parryN=0;
  C.ultDark=null;for(const f of liveFoes()){f.ultArmed=null;foeRefill(f);if(!f.noAct)clog(`${f.name} · 코스트 ${f.c} / ${f.cMax} · 행동 포인트 ${f.apMax}`,'h')}
  a2TurnStart();
  if(pt('selfVuln')){C.pVuln=Math.min(10,C.pVuln+1);clog(`${PTRAIT.selfVuln.n}: 자신에게 취약 1`)}
  if(pt('selfWeak')){C.pWeak=Math.min(10,C.pWeak+1);clog(`${PTRAIT.selfWeak.n}: 자신에게 약화 1`)}
  if(pt('burnBack')){C.pBurn=Math.min(100,C.pBurn+5);clog(`${PTRAIT.burnBack.n}: 자신에게 소각 5`)}
  if(pt('elBack')&&r.mode!=='thor'){C.pEl+=3;clog(`${PTRAIT.elBack.n}: 자신에게 전격 3`)}
  if(r.mode==='dain'){const loss=Math.floor(r.hp*.1);if(loss>0){r.hp-=loss;fxAt('player',`허기 -${loss}`,'self');clog(`허기: 체력 10% 소모 -${loss}`)}}
  if(C.yu){C.yuT++;if(C.yuT>=2){C.yuT=0;C.yu--}}
  {const gb=gs('blockTurn')+(C.turn===1?gs('block0')+gs('blockFirst'):0);if(gb>0){C.block+=gb;clog(`장비 방어도 +${gb} (현재 ${C.block})`);fxAt('player',`+${gb} 방어도`,'block')}}
  if(C.lockDisc&&C.lockDisc.length){C.disc.push(...C.lockDisc.filter(x=>x.t<=C.turn).map(x=>x.c));C.lockDisc=C.lockDisc.filter(x=>x.t>C.turn)}
  C.energy=Math.max(0,C.maxE+C.nextEnergy+(C.costMod||0)+(C.turn===1?(C.cost1||0)+gs('cost1'):0)+a2EnergyMod());C.nextEnergy=0;
  if(C.turn>C.fracS&&C.turn<=C.fracEnd&&C.energy>0){C.energy--;fxAt('player','골절 · 코스트 -1','info');clog('골절: 턴 시작 코스트 -1')}
  if(C.flaskDebt){const p=Math.min(C.energy,C.flaskDebt);C.energy-=p;clog(`미미르의 물병: 코스트 ${C.flaskDebt} 지불${p<C.flaskDebt?` (남은 코스트가 모자라 ${p}만 지불)`:''}`);C.flaskDebt=0}
  if(C.flaskHp){r.hp=Math.max(1,r.hp-C.flaskHp);fxAt('player',`물병 -${C.flaskHp}`,'self');clog(`미미르의 물병: 체력 ${C.flaskHp} 지불`);C.flaskHp=0}
  if(C.steinBlock){gainBlock(C.steinBlock,0,'스타인러 공방');C.steinBlock=0}
  if(C.drawN0&&C.turn===1)C.drawN+=C.drawN0;drawTurn();if(C.nextDraw){drawN(C.nextDraw);C.nextDraw=0}a2AfterDraw();if(C.turn>1)setTimeout(()=>palEv('turn'),300);
  /* 튜토리얼 둘째 턴: 합성·소멸·버림을 해 볼 수 있게 패를 정해 줌 (이 전투에만 있는 카드, 덱에는 들어가지 않음) */
  tbTurn();tbEv('turn');
  if(pt('penDraw')&&C.turn>1&&C.hand.length){const c=pick(C.hand);C.hand.splice(C.hand.indexOf(c),1);C.disc.push(c);toast('패널티 드로우',`「${CARDS[c.id].name}」을(를) 버렸다`)}
  renderCombat();tutShow();
  if(r.hp<=0)return gameOver();
  if(C.pend.length){await wait(350);await resolvePending();}
  renderCombat();
}
/* 패 최대 12장 — 넘으면 플레이어가 골라서 버림 (settleHand) */
function drawOne(){
  const C=S.C;
  if(!C.draw.length){if(!C.disc.length)return null;C.draw=shuffle(C.disc);C.disc=[];}
  const c=C.draw.pop();C.hand.push(c);return c;
}
function drawTurn(){const C=S.C;let got=0,guard=0;while(got<(C.drawN||5)&&guard++<40){if(!drawOne())break;got++}}
function drawN(n){n=Math.max(0,n);for(let i=0;i<n;i++)drawOne()}
function settleHand(){const C=S.C;if(!C||C.over||C.phase!=='player')return;const fz=fusionOpen()?handStacks().filter(x=>x.fuse).length*2:0;if(!C.select&&C.hand.length-fz>MAX_HAND)C.select={type:'discard'}}
async function resolvePending(){
  const C=S.C,E=C.E,pend=C.pend;C.pend=[];
  for(const p of pend){
    if(p==='discard'&&C.hand.length){const c=pick(C.hand);C.hand.splice(C.hand.indexOf(c),1);C.disc.push(c);toast('고해 강요',`「${CARDS[c.id].name}」을(를) 버렸다`)}
    if(p==='burn'&&C.hand.length){const c=pick(C.hand);C.hand.splice(C.hand.indexOf(c),1);C.exh.push(c);toast('백색의 불꽃',`「${CARDS[c.id].name}」이(가) 타 버렸다`)}
    if(p==='steal'){
      const pool=C.hand.filter(c=>!CARDS[c.id].unplayable);
      if(pool.length){const cost=c=>CARDS[c.id].cost??Math.round((CARDS[c.id].hpCost||0)/5);
        pool.sort((a,b)=>cost(b)-cost(a));const c=pool[0];C.hand.splice(C.hand.indexOf(c),1);C.stolen=(C.stolen||[]);C.stolen.push(c);
        toast('검날 떼어내기',`「${CARDS[c.id].name}」을(를) 빼앗아 휘둘렀다`);renderCombat();await wait(300);await enemyUseCard(c.id);}
    }
    renderCombat();await wait(250);
    if(S.run.hp<=0)return gameOver();
  }
}
async function enemyUseCard(id){
  const d=CARDS[id],C=S.C,E=C.E;
  for(const x of d.d||[]){
    if(x.t==='def'){const v=rollDie(x);E.block+=v;fxAt('enemy',`+${v} 방어도`,'block');clog(`${E.name} 방어 주사위 ${v} → 방어도 +${v}`,'e')}
    else if(x.t==='eva'){const v=rollDie(x);E.evaB+=v;clog(`${E.name} 회피 주사위 ${v} → 회피 +${v}`,'e')}
    else{await enemyStrike(x);if(S.run.hp<=0)return}
  }
}

/* card cost */
function costOf(c){
  const d=cdef(c),C=S.C,r=S.run;
  if(d.unplayable)return{none:true};
  if(d.unplayable)return{hp:0,pct:0};
  const lt=0,up=pt('costUp')?1:0;
  if(r.mode==='dain'){
    let pct=d.hpCost!=null?d.hpCost:(d.cost||0)*TUNE.humanHpCostPerCost;
    pct=Math.max(0,pct-lt*TUNE.humanHpCostPerCost)+up*TUNE.humanHpCostPerCost;
    if(C&&C.discount)pct=Math.max(0,pct-TUNE.humanHpCostPerCost);
    if(r.hp<=r.maxHp*.05&&pct>0)pct=1;
    return{hp:Math.ceil(r.maxHp*pct/100),pct,down:C&&C.discount};
  }
  let e=Math.max(0,(d.cost||0)-lt)+up;if(C&&C.discount)e=Math.max(0,e-1);if(C&&C.talkDisc)e=Math.max(0,e-1);if(c.free)e=0;
  return{e,down:(C&&C.discount&&d.cost>0)||lt>0};
}
function canPlay(c){
  const d=CARDS[c.id],C=S.C,r=S.run;
  if(d.unplayable)return'사용할 수 없는 카드입니다';
  if(C.seal[c.uid]>0)return'봉인된 카드입니다';
  {const jw=jcDeny(c);if(jw)return jw}
  if(C.pFrozen&&C.turn>=C.pFrozenTurn)return'냉동 — 이번 턴에는 행동할 수 없습니다';
  if(C.noWs&&CARDS[c.id].ws2===C.noWs)return'계약 파기 전투 — 계약한 공방의 카드는 사용할 수 없습니다';
  const trF=!!(r&&r.train&&r.tFree);
  if(!trF){
  if(d.nord&&!dagger())return'노르드교 무기가 있어야 쓸 수 있습니다';
  if(c.id==='u_exec'&&!(C.E&&C.E.pmk&&C.E.pmk.lv>=5))return'대상의 표식이 Ⅴ일 때만 사용할 수 있습니다';
  if(c.id==='u_purge'&&(C.pPurge||0)<3)return`아직 쓸 수 없다 · ${Math.min(3,C.pPurge||0)}/3`;
  if(c.id==='t_recall'&&!C.thrown)return'묠니르를 던진 뒤에만 쓸 수 있습니다';
  if(c.id==='d_crumble'&&r.hp>r.maxHp*.25)return'체력이 25% 이하일 때만 사용할 수 있습니다';
  if(c.id==='w_s5'&&(C.pSteam||0)<20)return'증기가 20 미만이면 사용할 수 없습니다';
  }
  const k=costOf(c);
  if(k.hp!=null){const brand=C.brand.includes(c.uid)?3:0;if(r.hp<=k.hp+brand)return'체력이 부족합니다';}
  else if(k.e>C.energy&&!C.flaskArm&&!(r.train&&r.tInf))return'코스트가 부족합니다';
  return null;
}
function removeHandEl(uid){const el=stackOf(uid);if(!el)return;el._uids=el._uids.filter(x=>x!==uid);if(!el._uids.length){el.classList.add('gone');setTimeout(()=>el.remove(),220);for(const[k,v]of handEls)if(v===el)handEls.delete(k)}}
/* 카드 한 장의 공격 주사위에 공통으로 붙는 값 */
function cardStrikeOpts(c){
  const C=S.C,E=C.E,r=S.run,d=CARDS[c.id];
  const flat=C.temper*25+(d.type==='atk'?(C.ashBonus||0):0)+(d.flatFn?d.flatFn(C,E):0)+(d.type==='atk'&&C.lateDmg?C.lateDmg*5*C.turn:0)
    +(c.id==='d_cannibal'?Math.floor(Math.max(0,E.hp)*.1):0)+(c.id==='d_hungry'?C.eat*5:0)+(d.type==='atk'?gs('flat')+((r.flags.actF&&r.flags.actF.atkFlat)||0):0)+(C.sat?Math.round(E.maxHp*.02*C.sat):0);
  return{flat,atk:pAtk(),pierce:!!d.pierce||r.mode==='odin',leech:false,x:((c.id==='hook'&&C.blockGot)?2:1)*(d.xFn?d.xFn(C,E):1)*(gs('dmg2')?2:1),giant:c.id==='d_giant'&&E.hp>r.hp,scale:1};
}
/* 카드 사용 중 오류가 나도 조작이 멈추지 않게 (S.busy가 남아 드로우·턴 종료가 막히는 것 방지) */
async function playCard(uid){const c0=S.C&&S.C.hand.find(x=>x.uid===uid);if(S.tb&&c0){const st=tbStep();if(st&&st.m==='play')S.tb.lock=true}try{return await playCardRaw(uid)}catch(e){console.error(e);clog('오류: '+e.message,'e');toast('오류',e.message)}finally{S.busy=false;if(S.C&&!S.C.over)renderCombat();if(c0&&S.C&&!S.C.hand.includes(c0))setTimeout(()=>tbEv('played',c0.id),60)}}
async function playCardRaw(uid,o={}){
  const C=S.C,r=S.run,E=C.E;
  const c=C.hand.find(x=>x.uid===uid);if(!c)return;
  const why=canPlay(c);if(why){toast('',why);layoutHand();return}
  S.busy=true;
  const d=cdef(c),k=costOf(c),ctx={killed:false},U=!o.reuse;/* U: 사용시 효과는 카드를 낼 때 한 번만, 재사용은 타격시 효과만 */
  if(C.flaskArm&&!c.free&&((k.hp!=null&&k.hp>0)||(k.hp==null&&k.e>0))){C.flaskArm=false;
    if(k.hp!=null){C.flaskHp=(C.flaskHp||0)+k.hp*2;clog(`미미르의 물병: 체력 소모 없이 사용 — 다음 턴 체력 ${k.hp*2} 지불`)}
    else{C.flaskDebt=(C.flaskDebt||0)+k.e*2;clog(`미미르의 물병: 코스트 없이 사용 — 다음 턴 코스트 ${k.e*2} 지불`)}fxAt('player','미미르의 물병','info')}
  else if(k.hp!=null){if(!c.free){r.hp-=k.hp;if(k.hp)fxAt('player',`-${k.hp}`,'self')}}else if(!c.free&&!(r.train&&r.tInf))C.energy-=k.e;
  if(U&&C.talkDisc&&c.id!=='a2_talk')C.talkDisc--;
  if(U&&C.patent&&C.patent[c.id]>=2&&C.patentFree!==c.uid&&liveFoes().some(f=>f.key==='examiner')&&!c.free){palBark('patent','방금 돈이 나갔어요! 왜요?');if(r.gold>=10000){r.gold-=10000;fxAt('player','특허 -10000실링','self');clog('특허: 10000실링 지불')}else{const l=Math.max(1,Math.round(r.maxHp*.04));r.hp=Math.max(1,r.hp-l);fxAt('player',`특허 -${l}`,'self');clog(`특허: 실링이 모자라 체력 ${l} (최대 체력 4%) 지불`)}}
  if(U&&C.spinArm){C.spinArm=false;C.spinNow=true}
  if(U&&c.id!=='ornament')C.discount=false;
  if(U&&C.brand.includes(c.uid)){r.hp-=3;fxAt('player','낙인 -3','self')}
  if(U&&pt('brand')){r.hp-=3;fxAt('player','낙인 -3','self')}
  if(U&&pt('hpCost')){const l=Math.ceil(r.maxHp*.02);r.hp-=l;fxAt('player',`${PTRAIT.hpCost.n} -${l}`,'self')}
  C.hand.splice(C.hand.indexOf(c),1);removeHandEl(uid);
  if(U){const pid=C.lastCid;if(pid!=null){if(pt('fresh'))C.freshN=pid!==c.id?Math.min(10,(C.freshN||0)+1):0;if(pt('same'))C.sameN=pid===c.id?Math.min(10,(C.sameN||0)+1):0}C.lastCid=c.id}
  if(U&&d.type==='atk'&&C.bashPend>0){C.bashNow=C.bashPend;C.bashPend=0}
  const dblOn=U&&pt('dbl')&&d.type==='def'&&liveFoes().some(f=>!f.noAct&&f.ap===1);if(dblOn)clog(`${PTRAIT.dbl.n}: 방어도 2배`);
  C.fxCard=d.type==='atk'||(d.d||[]).some(x=>x.t==='atk')?c.id:null;if(o.reuse)C.fxRe=(C.fxRe||0)+1;else{C.fxN=0;C.fxRe=0}if(!C.fxCard&&(d.type==='def'||d.type==='skill'||d.type==='power'))castFx(d.type==='def'?'def':'skill');
  clog(`▸ ${cardName(c.id,c)}${k.hp!=null?` (체력 ${k.hp})`:` (코스트 ${k.e})`}`,'h');C.curSpecial=d.rar==='special';
  renderCombat();
  /* 기입관: 한 턴에 같은 카드 3번째 사용 — 효과도 피해도 없이 자물쇠 */
  if(U&&jcPlay(c)){if(!c.temp&&!c.fusedTmp)C.disc.push(c);jcAfter();renderCombat();if(!o.noTick&&!C.over&&r.hp>0)await apTick(1);return}
  const so=cardStrikeOpts(c);if(d.type==='atk'){C.ashBonus=0}
  // 주사위 순서: 카드에 적힌 순서 → 연타 복제 → 주인공 특성 추가 주사위
  const seq=[];for(const x of d.d||[])seq.push([{...x,lb:DIE_NAME[x.t]}]);
  let dice=seq.flat();const first=(d.d||[]).find(x=>x.t==='atk');
  if(c.id==='s2_piston'&&(C.heat||0)>0){dice=[...dice,{...dice[0]},{...dice[0]}];clog('수동 피스톤: 열기가 있어 × 5')}
  if(d.moreHits){const n=d.moreHits(C);for(let i=0;i<n;i++)dice.push({...dice[0]})}
  const nul=nulled(c);if(nul){C.nullCount=(C.nullCount||0)+1;clog('기록: 무효로 정의된 카드 — 주사위 값 0','e')}
  if(c.id==='c_whirl'){const n=await pickToss(3,'잿빛 회오리');const x=dice[0];for(let i=0;i<n;i++)dice.push({...x,lb:'재사용'})}
  let hadAtk=false,hitAny=false,gained=0;C.cardDmg=0;
  const ultFx=U&&d.rar==='ult'&&!nul;if(ultFx)await ultDash(c.id);
  /* 일섬 치명타: 명중 확률의 50% — 미리 굴려 두고, 적중했을 때만 발동(데미지 +50%, 드로우 +1) */
  const crit=c.id==='ms_flash'&&!nul&&rnd()<.5;
  const onHit=c.id==='d_glutton'?(l=>heal(l*.3)):c.id==='d_cannibal'?(()=>{C.eat++;fxAt('enemy','섭취','info')}):null;
  for(const x of dice){
    if(C.over)break;
    if(x.t==='atk'){hadAtk=true;const W=weightTargets(c);for(const f of W.tg){if(C.over)break;if(!alive(f))continue;const prev=C.E;C.E=f;
        const oh=l=>{if(onHit)onHit(l);if(r.mode==='thor'&&c.id!=='t_recall'&&alive(f))f.el+=c.id==='t_throw'?2:1;if(c.id==='o_mark'&&alive(f)){f.mark=Math.min(10,(f.mark||0)+1);fxAt('enemy',`궁니르-명중 ${f.mark}`,'info')}};
        if(await pStrike(x,{...so,scale:(so.scale||1)*(x.sc||1)*(crit?1.5:1),label:x.lb,onHit:oh,wb:W.wb,nul,sure:!!d.sure||!!(d.sureFn&&d.sureFn(C,f)),accAdd:d.acc||0}))hitAny=true;
        if(f.dead||f.hp<=0){ctx.killed=true;if(gs('killEat')&&!C.over)foodGain(null,gs('killEat'),true);if(r.mode==='thor'){C.yu=Math.min(5,C.yu+1);toast('전투 중독','유희 +1')}}
        if(!C.over&&alive(prev))C.E=prev}}
    else if(x.t==='def')gained+=gainBlock((nul?0:(d.defFn?d.defFn(C,rollDie(x)):rollDie(x)))*(dblOn?2:1),0,'방어 주사위');
    else{const v=nul?0:rollDie(x),add=Math.min(v,Math.max(0,EVA_DICE_CAP-C.evaB));C.evaB+=add;
      clog(`회피 주사위 ${v} → 회피 +${add}${add<v?' (한 턴 최대 +30)':''} · 적의 적중률 ${hitChance(enemyAcc(),pEva())}%`);fxAt('player',`회피 +${add}`,'info');renderCombat()}
  }
  C.spinNow=false;if(ultFx)await ultBack();
  const silent=false;
  if(!C.over&&!silent){
    const ok=!hadAtk||hitAny;
    const st=[['weak',d.weak],['vuln',d.vuln]].filter(x=>x[1]);
    if(ok)st.forEach(([k,n])=>applyEnemyStatus(k,n));else if(st.length)clog('공격 주사위가 모두 빗나가 적중 시 효과가 발동하지 않음');
    if(U)if(d.hold)C.hold=true;
    if(U)if(d.heal)heal(d.heal*((d.ws2==='remi'&&eqW('kr_b'))?2:1)*((c.id==='hardtack'&&gs('lunch'))?2:1));
    if(c.id==='k2_break'&&hitAny&&!C.over){const T=C.E;if(T.frozen||T.frozeSkip||T.crack){T.crack=Math.min(3,(T.crack||0)+2);T.crackT=C.turn}}
    if(!(o.reuse>2)){if(d.draw)drawN(Math.max(0,d.draw-(pt('drawDown')?1:0)));if(d.gainE)C.energy+=d.gainE}
    if(crit&&hitAny){drawN(1);fxAt('enemy','치명타','info');clog('치명타: 데미지 +50%, 드로우 +1')}
    if(c.id==='f_ryeo'&&C.cardDmg>=300){C.energy+=2;fxAt('player','코스트 +2','info');clog(`도려내기: 데미지 ${C.cardDmg} — 코스트 +2`)}
    if(c.id==='f_dae'){const n=Math.min(2,Math.floor(C.cardDmg/1000));if(n){C.nextEnergy+=n;C.nextDraw=(C.nextDraw||0)+n;clog(`대절단: 데미지 ${C.cardDmg} — 다음 턴 코스트 +${n}, 드로우 +${n}`)}}
    if(U)switch(c.id){
      case'steam':C.nextEnergy+=2;break;
      case'mimic':if(!hitAny)gainBlock(100,0,'어딘가의 무구');break;
      case'ornament':C.discount=true;break;
      case'temper':C.temper++;break;
      case'tidy':{const n=await pickToss(3,'정리');if(n)drawN(n);tutEvent('toss');break}
      case'parry':{C.evaB+=10;C.parryN=(C.parryN||0)+1;fxAt('player','회피 +10','info');clog('흘려 베기: 이번 턴 회피 +10 · 회피에 성공하면 반격');break}
      case'c_est':if(hitAny){C.pStr=(C.pStr||0)+20;fxAt('player','힘 +20','info');clog(`견적 내기: 힘 +20 (최종 위력 +${C.pStr})`)}break;
      case'c_stance':C.pStr=(C.pStr||0)+20;fxAt('player','힘 +20','info');clog(`자세잡기: 힘 +20 (최종 위력 +${C.pStr})`);break;
      case'n_weak':if(C.E){C.E.pwkT=C.turn;C.E.pwkN=3}break;
      case'n_force':if(hitAny&&C.E&&alive(C.E))pForceMark(C.E);break;
      case'u_exec':if(C.E&&C.E.pmk){C.E.pmk.lv=0;C.E.pmk.lock=-9;clog('처형 집행: 표식을 전부 소모')}break;
      case'u_purge':C.pPurge=0;clog('처단: 적중 수가 0으로 돌아감');break;
      default:break;
    }
    if(U)await a2CardFx(c,ctx);
    if(U)switch(c.id){
    }
  }
  /* 카드가 가는 곳: 지속 → 지속 더미 / 소멸 → 소멸 더미 / 그 외 → 버린 카드 더미 */
  C.bashNow=0;
  const exhaust=d.exhaust||c.temp||pt('exhAll');
  if(d.type==='power')C.powers.push(c);
  else if(exhaust){C.exh.push(c);clog(`「${CARDS[c.id].name}」 소멸`);tutEvent('exh');}
  else{C.disc.push(c);if(pt('seal')){C.seal[c.uid]=2}}
  // 유산의 수호
  if(!C.over&&E.boss&&d.rar==='special'){
    E.anger++;
    if(E.anger===1)say(angerLine(1));
    if(E.anger===2)say(angerLine(2));
    if(E.anger>=3&&!E.raged){E.raged=1;say(angerLine(3));E.atk+=15;E.acc-=15;clog('분노 3 — 이성을 잃음: 공격레벨 +15, 명중 -15','e')}
  }
  if(U){a2AfterPlay(c,d);C.lastKind=cardKind(d)||d.type;C.useN=C.useN||{};C.useN[c.id]=(C.useN[c.id]||0)+1}
  S.busy=false;
  if(d.type==='atk'||(d.d||[]).some(x=>x.t==='atk'))tutEvent('atk');
  if((d.d||[]).some(x=>x.t==='def'))tutEvent('def');
  {const ty=(d.d||[]).map(x=>x.t);if(!ty.includes('atk')){if(ty.includes('eva'))palEv('eva');else if(ty.includes('def'))palEv('def')}}
  if(!C.over){renderCombat();if(r.hp<=0)gameOver()}
  if(U&&hadAtk&&!C.over&&!C.dead&&r.hp>0)await palHit();
  {const T=C.E;if(U&&c.id!=='n_weak'&&T&&alive(T)&&T.pwkT===C.turn&&T.pwkN>0&&pExpo(T)&&!C.over&&r.hp>0){T.pwkN--;clog(`약점 노리기: 추가타 (남은 ${T.pwkN}회)`);await pStrike(A(15,25),{atk:pAtk(),label:'약점 노리기 추가타'})}}
  if(U&&d.sword&&!C.over&&!C.dead&&r.hp>0)await masteryUse();
  /* 검도-변화: 같은 카드가 패에 있으면 행동 포인트 없이 재사용, 재사용 코스트·드로우는 최대 2 */
  if(c.id==='ms_kendo2'&&!o.reuse){for(let n=1;;n++){if(C.over||C.dead||r.hp<=0)break;const dup=C.hand.find(x=>x.id==='ms_kendo2'&&!canPlay(x));if(!dup)break;clog('발도술 재사용','h');await playCardRaw(dup.uid,{noTick:true,reuse:n})}}
  if(!o.reuse)tutEvent('play');
  if(U&&!C.over)jcAfter();
  if(!o.noTick&&!C.over&&!C.dead&&r.hp>0){if(C.freeAP>0&&c.id!=='quick'){C.freeAP--;clog('속사: 행동 포인트 소모 없음')}else await apTick(1)}
  if(U&&!C.over&&!C.dead&&r.hp>0&&C.E&&C.E.pendPhase&&C.phase==='player'){S.busy=false;await endTurn()}/* 순수유물주의자: 체력 0이면 즉시 턴 종료 후 회복 */
}
/* 숙련도: 레벨 1일 때만, 검 계열 사용 횟수를 합쳐서 셈 — 단계마다 별도의 공방렙 +1, 체력 값 +1% (히든 보너스, 알림 없음) */
const MS_STEP=[10,20,30,40,50];
const STANCE=[{id:'ms_kendo2',k:'발도술',q:'목덜미를 세워 턱을 아래로 당겨 검을 뽑아낸다'},{id:'ms_kendo',k:'검도',q:'검을 비스듬히 하여 몸을 보호하게 검을 잡는다'},{id:'ms_flash',k:'일섬',q:'자세를 당장이라도 뛰쳐나갈수있게 다리에 힘을 준상태로 검을 역수로 쥔다'},{id:'ms_split',k:'갈라내기',q:'팔을 강하게 핀상태로 손잡이가 으스러질정도로 검을 강하게 잡는다'}];
const msOf=r=>r.ms||(r.ms={uses:0,step:0,got:[],stance:null});
async function masteryUse(){const r=S.run;if(r.mode!=='human'||r.lvl!==1)return;if(r.tutB||r.train)return;const m=msOf(r);m.uses++;
  while(m.step<5&&m.uses>=MS_STEP[m.step]){m.step++;r.atk++;r.def++;const a=Math.round(r.base1*.01);r.maxHp+=a;r.hp+=a;save();
    if(m.step<=4)await stanceWindow(m.step);else await fuseOpenWindow();if(S.C&&!S.C.over)renderCombat()}}
/* V2.32.64.15: 자세를 고르면 그 자세 카드 3장이 덱에 새로 추가되고, 이전 자세 카드는 덱에 그대로 남음 */
function swapStance(id){const r=S.run,m=msOf(r),C=S.C;
  for(let i=0;i<3;i++){const c={uid:UID++,id};r.deck.push(c);if(C&&!C.over)C.disc.push({uid:c.uid,id})}
  m.stance=id;if(!m.got.includes(id))m.got.push(id);save();palEv('stance',true)}
function stanceWindow(step){const r=S.run,m=msOf(r),box=$('#modal');return new Promise(res=>{box.hidden=false;S.modalLock=true;$('#tut').hidden=true;
  const tag=o=>m.stance===o.id?'사용 중':m.got.includes(o.id)?'이전에 선택함':'';
  const done=()=>{S.modalLock=false;closeModal();tutEvent('stance');res()};
  box.innerHTML=`<div class="panel stance"><div class="st-h"><div class="psub">숙련도 ${step}단계</div><div class="ptitle">뭔가 새로운 자세가 떠올랐다...</div>${step===1?'<div class="psub">검 카드를 총 10, 20, 30, 40, 50회 쓰면 한 단계씩 오릅니다. 단계가 오르면 네 자세 중 하나를 고릅니다. 고른 자세의 카드 3장이 덱에 새로 들어오고, 쓰던 카드는 그대로 남습니다. 한 번 고른 자세는 다시 고를 수 없습니다. 숙련도 카드는 주황색으로 빛납니다.</div>':''}</div>
    <div class="st-cross">${STANCE.map(o=>{const t=tag(o),c=CARDS[o.id];return`<button class="st-opt" data-st="${o.id}" ${t?'disabled':''}><b>${o.k}</b><span class="st-q">${o.q}</span><span class="st-c">코스트 ${c.cost} · ${c.text.replace('\n',', ')}</span>${t?`<em>${t}</em>`:''}</button>`}).join('')}<div class="st-hub">${step}단계</div></div></div>`;
  box.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{swapStance(b.dataset.st);done()})})}
function fuseOpenWindow(){const box=$('#modal');return new Promise(res=>{box.hidden=false;S.modalLock=true;
  box.innerHTML=`<div class="panel stance"><div class="st-h"><div class="psub">숙련도 5단계</div><div class="ptitle">합성</div></div><div class="ptext">같은 카드 3장이 패에 모이면 합성할 수 있어요. 갈라내기×3은 도려내기, 일섬×3은 대절단이 돼요.<br>합성 카드는 패에서 1장으로 쳐요. 패 자리는 아끼고 한 방은 커져요. 합성에 쓴 3장은 함께 사라지지만 슬퍼하지 마세요. 카드는 울지 않아요.</div><div class="choices" style="flex-direction:row;justify-content:center"><button class="btn-main" id="fzOk">확인</button></div></div>`;
  $('#fzOk').onclick=()=>{S.modalLock=false;closeModal();res()}})}
/* 일반 몹이 쓰는 같은 카드를 10번 보면 그 카드를 훔침 — 정예·보스 제외, 공격·방어 행동만 */

/* 카드 1장 사용 → 적 행동 포인트 -1. 0이 되면 곧바로 행동하고 다시 채워져 횟수 제한 없이 계속 행동. 턴 종료 시 1 이상이면 0으로 만들고 다음 행동 1회 후 초기화 */
async function apTick(n=1){
  const C=S.C,r=S.run;if(!C||C.over||C.dead||C.phase!=='player')return;
  if(pt('offbeat')&&C.offT!==C.turn){C.offT=C.turn;clog(`${PTRAIT.offbeat.n}: 이번 카드는 적 행동 포인트를 깎지 않음`);renderCombat();return}
  const ready=[];for(const E of liveFoes()){if(E.noAct)continue;const hs=ENEMY[E.key]&&ENEMY[E.key].hasty;let m=n;if(hs&&Math.random()<hs){m++;fxAt('enemy','성급함','info');clog(`${E.name} · 성급함: 행동 포인트 1 추가 소모`,'e')}E.ap-=m;while(E.ap<=0){ready.push(E);E.ap+=Math.max(1,E.apMax)}}
  renderCombat();if(!ready.length)return;
  S.busy=true;C.phase='enemy';
  if(S.tb){const k=ready.map(E=>E.ap);ready.forEach(E=>E.ap=0);renderCombat();await tbHold('ap0');ready.forEach((E,i)=>E.ap=k[i]);renderCombat()}
  for(const E of ready){if(C.over||C.dead||r.hp<=0)break;if(!alive(E))continue;clog(`${E.name}의 행동 포인트가 0이 되었다 — 남은 코스트로 카드를 낸다`,'h');
    if(E.key==='bishop'&&E.phase>=2){E.c=E.cMax;clog('간절한 기도: 행동 포인트를 전부 소모 — 코스트를 최대로 회복','e')}
    await wait(300);C.apBurst=true;try{await withFoe(E,()=>foeBurst())}finally{C.apBurst=false}
    if(E.apRecT!==C.turn){E.apRecT=C.turn;E.apRec=Math.floor((E.apMax||0)/3)}}
  if(C.over||C.dead||r.hp<=0){S.busy=false;return}
  C.phase='player';if(C.pend.length){await wait(250);await resolvePending()}
  S.busy=false;renderCombat();
}
/* 공격 주사위 하나: 굴림 → 명중 판정 → 최종 데미지 공식 → 방어도 */
/* 주사위 연출 (V26) — 주사위가 굴러간 뒤 위력과 피해를 가운데에 크게 보여 주고 나서 공격이 들어감 · 누르면 빨리 넘김 · 설정에서 끔 */
let DF_T=0,DF_SKIP=false;
async function diceFocus(o){
  if(REDUCED||SET.dfocus===false||S.screen!=='combat')return;
  const now=performance.now(),tbS=!!(S.run&&S.run.tutB),fast=!tbS&&now-DF_T<1400,K=tbS?2.3:1;DF_SKIP=false;const w=ms=>DF_SKIP?Promise.resolve():wait(ms);
  let el=$('#dfocus');if(!el){el=document.createElement('div');el.id='dfocus';stage.appendChild(el);el.addEventListener('pointerdown',()=>{DF_SKIP=true})}
  el.hidden=false;el.className='dfocus '+(o.foe?'foe':'me');
  el.innerHTML=`<div class="df-lb">${o.lb}</div><div class="df-row"><div class="df-die">${d36SVG(o.a,'rolling')}</div><div class="df-info"><div class="df-pow"></div><div class="df-res"></div></div></div>`;
  const die=el.querySelector('.df-die');
  for(let i=0,n=fast?3:7;i<n;i++){die.innerHTML=d36SVG(ri(o.a,o.b),'rolling');if(i%2===0)sfx('miss',.2);await w(fast?40:50)}
  die.innerHTML=d36SVG(o.r0,o.hit?'ok':'ng');
  el.querySelector('.df-pow').innerHTML=`<span>주사위 ${o.r0}${o.a!==o.b?` <small>(${o.a}~${o.b})</small>`:''}</span><span>위력 <b>${o.pow}</b></span>`;
  await w((fast?150:280)*K);
  const res=el.querySelector('.df-res');res.className='df-res '+(o.hit?(o.dmg>0?'hit':'blk'):'miss');
  res.innerHTML=o.hit?`<em>적중률 ${o.ch}%</em><b>${o.dmg>0?o.dmg:`막힘 ${o.bl}`}</b><em>${o.dmg>0?(o.bl?`피해 · 방어도 ${o.bl} 흡수`:'피해'):'방어도가 모두 막음'}</em>`:`<em>적중률 ${o.ch}%</em><b>빗나감</b>`;
  sfx(o.hit?(o.dmg>0?'hit':'block'):'miss',.5);
  await w((fast?280:520)*K);
  el.classList.add('out');DF_T=performance.now();await wait(120);el.hidden=true;el.classList.remove('out');
}
async function pStrike(die,o={}){
  const C=S.C,E=C.E,r=S.run;if(C.over)return false;
  const tf=tutForce(),ms=masterOn(),r0=ms?pDieRange(die)[1]:rollDie(die,true),ht=C.heat||0,gp=gapP(o.atk!=null?o.atk:pAtk(),E.def),sw=(C.pStr||0)-(C.pWkF||0)+trPow(),v0=o.nul?0:Math.max(0,r0+ht+gp+sw),v=Math.round(v0*atkScale()*(o.scale||1)*(ms?3:1));
  const vs=(o.nul?`${r0}→0 [무효]`:`${r0}${ht?` + 열기 ${ht}`:''}${gp?` + 공방렙 차이 ${gp}`:''}${C.pStr?` + 힘 ${C.pStr}`:''}${C.pWkF?` − 약화 ${C.pWkF}`:''}${trPow()?` + 특성 ${trPow()}`:''}${ms?' [작품-완성 최대치 ×3]':''}`)+(v!==v0&&!o.nul?` → ${v}`:'');
  const ch=o.sure?100:hitChance(pAcc()+(o.accAdd||0),E.eva+E.evaB),roll=ri(1,100),lb=o.label||'공격';
  const lz=leechOn(),hit=tf?tf.hit:r.tutB?true:roll<=ch,f=hit?formula(v,o.flat||0,o.atk!=null?o.atk:pAtk(),pTraits(o),E.def,{ignoreDef:pt('pierceDef'),x:(o.x||1)*pMarkMul(E)*trMul()}):null,bl=hit?(o.pierce?0:Math.min(E.block,f.fin)):0,loss=hit?f.fin-bl:0;
  {const rg=pDieRange(die);await diceFocus({lb:`${lb} 주사위 → ${E.name}`,a:rg[0],b:rg[1],r0,pow:v,hit,ch,dmg:loss,bl})}
  if(C.over)return false;
  const CK=await cardCut(hit),hp0=E.hp/Math.max(1,E.maxHp);if(C.over)return false;
  if(!hit){fxAt('enemy','빗나감','miss');sfx('miss');clog(`${lb} 주사위 ${vs} · 적중률 ${ch}% · 판정 ${roll} → 빗나감`,'miss');palEv('miss');renderCombat();await wait(170);return false}
  E.block-=bl;E.hp-=loss;E.dmgTurn=(E.dmgTurn||0)+loss;C.cardDmg=(C.cardDmg||0)+loss;hurtFace(loss);if(bl)knightCheck();
  clog(`${lb} 주사위 ${vs}: ${f.text} · 적중률 ${ch}% · 판정 ${roll} → 적중${o.pierce?' · 관통':''}${bl?` · 방어도 ${bl} 흡수`:''} · 피해 ${loss}`);
  palEv(loss>=E.maxHp*.2?'big':'hit');const tier=impactEnemy(loss,bl,CK);hpLag(hp0,E.hp/Math.max(1,E.maxHp));
  fxAt('enemy',bl&&!loss?`막힘 ${bl}`:String(loss),bl&&!loss?'block':(tier>=2?'t'+tier:''));
  await hitStop(tier,CK&&loss>0?(CK.K.stop||0):0);hitEnemyAnim(false);C.hitsTurn++;
  if(loss>0&&has(E,'복수심'))E.revenge=Math.min(10,E.revenge+2);
  if(o.leech&&loss>0)heal(loss*.2);
  if(dagger()){if(loss>0)heal(loss*.05);pMarkHit(E)}
  if(loss>0)C.pPurge=(C.pPurge||0)+1;
  if(lz&&loss>0){const ex=Math.round(f.fin-f.fin/1.1),h=Math.min(ex,loss);if(h>0){heal(h);clog(`${PTRAIT.leech.n}: 추가 피해 ${h} 회복`)}}
  if(gs('leech10')&&loss>0)heal(loss*.1);
  if(gs('coolHit'))a2Hit('cool',1);
  if(gs('drawHit')&&rnd()<.25)drawN(1);
  if(gs('frostCrack')&&(E.frozen||E.frozeSkip)){E.crack=Math.min(3,(E.crack||0)+1);E.crackT=C.turn}
  if(r.mode==='dain'&&f.fin>0)heal(f.fin*.25);
  if(o.onHit)o.onHit(loss);
  if(pt('elOn')){E.el+=3}
  if(E.frozen||E.frozeSkip){E.crack=Math.min(3,(E.crack||0)+2);E.crackT=C.turn;fxAt('enemy',`깨짐 ${E.crack}단계`,'info')}
  if(gs('frostHit')&&rnd()<.5)a2Hit('cool',1);
  if(pt('burnOn')){E.burn=Math.min(100,E.burn+5)}
  if(pt('vulnOn'))applyEnemyStatus('vuln',1);
  renderCombat();
  if(checkEnemy())return true;
  await wait(150);return true;
}
function gainBlock(v,add,label){
  const C=S.C;let b=v;if(pt('defUp'))b=Math.round(b*1.25);if(pt('defDown'))b=Math.round(b*.75);if(gs('blockPct'))b=Math.round(b*(1+gs('blockPct')/100));b+=add||0;
  let debt='';if(C.blockDebt>0){const k=Math.min(C.blockDebt,b);C.blockDebt-=k;b-=k;debt=` (방어도 감소 -${k})`}
  C.block+=b;if(b>0)C.blockGot=true;clog(`${label} ${v}${b!==v?` → ${b}`:''}${debt} · 방어도 +${b} (현재 ${C.block})`);
  if(b>0)fxAt('player',`+${b} 방어도`,'block');renderCombat();return b;
}
/* 고정 피해: 공식·명중을 건너뛰지만 방어도에 막힘 / 트루 데미지: 방어도도 무시 */
function fixedDmg(n,label,trueD){
  const C=S.C,E=C.E;if(C.over||n<=0)return;
  let b=0;if(!trueD){b=Math.min(E.block,n);E.block-=b}const l=n-b;E.hp-=l;if(E.hp<=0)E.dotKill=true;if(dagger()&&l>0)heal(l*.05);hurtFace(l);if(b)knightCheck();
  clog(`${label} ${n} (${trueD?'트루 데미지':'고정 피해'} · 공식 없음)${b?` · 방어도 ${b} 흡수`:''} → 피해 ${l}`);
  fxAt('enemy',`${label} ${l}`,'info');if(l>0){const o=L[S.orient];sparks(o.ex,o.efeet-o.eh*.55,8);sfx('hit',.7)}hitEnemyAnim(false);renderCombat();checkEnemy();
}
function heal(n){
  const r=S.run,C=S.C;if(C&&C.foes&&r.maxHp<1)return;let a=Math.round(n*(berserk()?1.5:1)*(pt('healDown')?.75:1)*(1+gs('healPct')/100));
  const act=Math.min(r.maxHp-r.hp,a);if(act<=0)return;
  r.hp+=act;fxAt('player',`+${act}`,'heal');
  if(r.mode==='dain'&&C){C.healAcc+=act;const step=r.maxHp*.1;let d=0;while(C.healAcc>=step){C.healAcc-=step;d++}if(d){drawN(d);fxAt('player',`포식 드로우 +${d}`,'info')}}
}
function checkEnemy(){
  const C=S.C,E=C.E;if(C.over)return true;
  if(E.boss&&E.phase===1&&E.hp<=0){E.hp=1;if(!E.pendPhase){E.pendPhase=E.phase+1;clog('체력 0 — 즉시 턴 종료, 페이즈 2','e')}renderCombat();return false}
  if(E.key==='clerk'&&E.phase!==2&&E.hp<=0){E.hp=1;if(!E.pendPhase){E.pendPhase=2;clog('체력 0 — 즉시 턴 종료, 페이즈 2','e')}renderCombat();return false}
  if(E.hp<=0){E.hp=0;if(liveFoes().length)palEv('kill');return foeDown(E)}
  return false;
}
async function endTurn(){
  const C=S.C,r=S.run;if(!C||C.phase!=='player'||S.busy||C.over||C.select||tutLocked('end'))return;
  C.phase='enemy';S.busy=true;C.ultDark=null;ultCheck();
  const E=C.E;
  clog('턴 종료','h');tutEvent('end');
  if(E&&(E.boss||E.key==='clerk')&&E.pendPhase)await bossPhaseCut();
  if(eqW('st_b')&&C.energy>0&&r.mode!=='dain'){C.steinBlock=C.energy*3;clog(`스타인러 공방: 남은 코스트 ${C.energy} → 다음 턴 방어 ${C.steinBlock}`)}
  if(pt('empty')&&!C.hand.length){C.nextEnergy+=1;clog(`${PTRAIT.empty.n}: 다음 턴 코스트 +1`)}
  const keepF=x=>!!CARDS[x.id].keep;
  const kept=C.hand.filter(keepF);C.disc.push(...C.hand.filter(x=>!keepF(x)));C.hand=kept;
  buffBreak('player');C.pWeak=0;C.pVuln=0;C.pStr=0;C.pWkF=0;
  for(const k in C.seal){C.seal[k]--;if(C.seal[k]<=0)delete C.seal[k]}
  C.yuGot=false;
  renderCombat();
  // 전격·소각: 턴이 종료될 때 수치만큼 고정 피해
  for(const f of liveFoes()){if(C.over)break;C.E=f;if(f.el>0){const n=f.el;f.el=0;fixedDmg(n,'전격')}if(!C.over&&alive(f)&&f.burn>0){const n=f.burn;f.burn=Math.max(0,f.burn-5);fixedDmg(n,'소각')}}
  if(!C.over&&!alive(C.E))C.E=liveFoes()[0]||C.E;
  if(C.over){S.busy=false;return}
  for(const[k,lb]of[['pEl','전격'],['pBurn','소각']]){const n0=C[k];if(!n0)continue;
    let n=eqW('kr_a')?Math.round(n0*.7):n0;if(k==='pEl'&&r.mode==='thor')n=0;if(eq('shell')&&n<5){clog(`막의 껍질: ${lb} ${n} 튕겨냄`);n=0}
    const b=Math.min(C.block,n);C.block-=b;r.hp-=n-b;fxAt('player',`${lb} -${n-b}`,'self');clog(`자신의 ${lb} ${n} (고정 피해)${b?` · 방어도 ${b} 흡수`:''} → 피해 ${n-b}`);
    C[k]=k==='pEl'?0:Math.max(0,n-5)}
  renderCombat();
  if(r.hp<=0){S.busy=false;return gameOver()}
  if(await a2EndTurn()){S.busy=false;return}
  if(fleeResolve())return;
  await wait(380);
  for(const f of liveFoes()){if(C.over||r.hp<=0)break;if(f.noAct)continue;await withFoe(f,()=>enemyTurn())}
  C.fleeX=0;
  S.busy=false;
  if(!C.over&&r.hp>0)startPlayerTurn();
}


/* ================= 적 카드 (V2.31.55.14) — 적도 플레이어와 같은 규칙: 덱·5장 드로우·코스트 3(3턴마다 +1)·턴이 넘어가야 다시 참
   행동 포인트(속도)는 몹마다 범위 안에서 턴마다 무작위, 카드 1장마다 -1, 0이 되면 남은 코스트로 몰아서 냄
   고르는 순서: 부정적 키워드를 거는 카드 → (코스트가 넉넉하면) 자신에게 이로운 카드 → 공격 → 방어는 맨 마지막 */
const FOE_FIN=new Set(['처단','삭제','승강기 레버']);
const FOE_NEG=new Set(['고해 강요','백색의 불꽃','미스틸테인','증기 분사','냉매 투척','냉각통 내려놓기','시제품 시험','실패작 던지기','반려 서류','냉매 살포','해설','곡해','레바테인-타격','점화','정의 집행','낙인']);
function actCost(n){const a=ACT[n];if(!a)return 1;if(a.cost!=null)return a.cost;if(FOE_FIN.has(n))return 3;if(a.gim)return 2;return 1}
function actType(n){const a=ACT[n];if(!a)return'atk';if(a.k==='cmd')return a.rally?'sup':ACT[a.cmd]&&ACT[a.cmd].k==='def'?'def':'atk';if(a.neg)return'atk';if(a.k==='def')return'def';if(a.k==='atk'||FOE_NEG.has(n)||n==='정정')return'atk';return'sup'}
function actNeg(n){const a=ACT[n];return!!(a&&(a.vuln||a.pend||a.strip||a.neg||FOE_NEG.has(n)))}
function actReady(E,n){const a=ACT[n];if(!a)return true;if(a.burstOnly&&!S.C.apBurst)return false;if(a.ult&&!E._burstArmed)return false;/* 궁극기는 예고(조건 충족 연출)가 먼저 나와야 씀 */
  if(a.exec)return S.C.mk.lv>=5;if(a.purge)return(E.purgeHits||0)>=3;return true}
/* ===== 궁극기 조건과 예고 (V2.32.64.15) ===== */
/* 궁극기 예고의 눈빛 — 오른쪽 눈 하나만, 캐릭터의 퍼스널 컬러 (이단심문관: 채도를 낮춘 황금빛 아이보리 · 노르드교: 채도를 낮춘 검붉은 색) */
const ULT_EYES={cultist:[240,360,[[111,134],[129,134]],'#a8564e'],inquisitor:[240,380,[[110,52],[130,52]],'#d6c9a4']};
function ultCond(E){const C=S.C;if(!C||!E||!alive(E)||!E.hand)return null;const hv=n=>E.hand.includes(n);
  if(hv('행동-처형 집행')&&C.mk&&C.mk.lv>=5)return'행동-처형 집행';
  if(hv('명령 이행-처단')&&(E.purgeHits||0)>=3)return'명령 이행-처단';
  return null}
function ultCheck(){const C=S.C;if(!C||C.over)return;let any=false;
  for(const E of liveFoes()){const u=ultCond(E);
    if(u&&!E.ultArmed&&C.phase==='player'){E.ultArmed=u;C.ultDark=C.turn;clog(`${E.name}: 궁극기 「${u}」 준비`,'e');try{sfx('ult')}catch(e){}}
    else if(!u&&E.ultArmed)E.ultArmed=null;if(E.ultArmed)any=true}
  const E=C.E,el=$('#enemy'),dark=any&&C.ultDark===C.turn;
  $('#ultShade').classList.toggle('on',dark);el.classList.toggle('ult',!!(E&&(E.ultArmed||E.ulting)));el.classList.toggle('ultdark',dark&&!!(E&&E.ultArmed));$('#hand').classList.toggle('ult-burn',any);
  const art=E&&ENEMY[E.key]&&ENEMY_SVG[ENEMY[E.key].art]?ENEMY[E.key].art:null,ey=art&&ULT_EYES[art];
  el.querySelectorAll('.ult-eye').forEach((x,i)=>{if(!ey||!(E.ultArmed||E.ulting)||i>0){x.hidden=true;return}x.style.setProperty('--ec',ey[3]);const a=$('#eart'),W=a.offsetWidth,H=a.offsetHeight,sc=Math.min(W/ey[0],H/ey[1]),ox=(W-ey[0]*sc)/2,oy=H-ey[1]*sc,pt=ey[2][i];x.hidden=false;x.style.left=(ox+pt[0]*sc)+'px';x.style.top=(oy+pt[1]*sc)+'px'})}
function actText(n){const a=ACT[n];if(!a)return'';const p=[];if(a.d&&a.d.length)p.push(a.d.map(x=>`${DIE_NAME[x.t]} ${x.a===x.b?x.a:`${x.a}~${x.b}`}`).join(', '));
  if(a.vuln)p.push(`적중 시 취약 ${a.vuln}`);if(a.strip)p.push('방어도와 지속 효과 제거');if(a.gim&&GIM[a.gim])p.push(`${GIM[a.gim].n}: ${GIM[a.gim].t}`);if(a.tag)p.push(a.tag);if(a.desc)p.push(a.desc);if(a.mercy)p.push('남은 체력만큼');return p.join(' · ')}
const FOE_SEEN_K='midgard_foeSeen';let FOE_SEEN={};try{FOE_SEEN=JSON.parse(localStorage.getItem(FOE_SEEN_K)||'{}')||{}}catch(e){FOE_SEEN={}}
function foeSee(n){if(FOE_SEEN[n])return;FOE_SEEN[n]=1;try{localStorage.setItem(FOE_SEEN_K,JSON.stringify(FOE_SEEN))}catch(e){}}
const deckList=o=>{const out=[];for(const k in o)for(let i=0;i<o[k];i++)out.push(k);return out};
function foeActs(E){const d=ENEMY[E.key],r=S.run;
  if(E.tbDeck)return E.tbDeck.slice();
  if(E.key==='bishop')return deckList(E.phase>=2?d.deck2:d.deck1);
  if(d.deck)return deckList(d.deck);
  if(d.order){let o=(E.phase===2&&d.order2?d.order2:d.order).slice();if(E.key==='priest'&&r&&r.flags&&r.flags.noTithe)o=o.filter(a=>a!=='공양 요구');if(has(E,'무모함')){const o2=o.filter(a=>ACT[a].k!=='def');if(o2.length)o=o2}return o}
  const pool={...d.acts};if(E.key==='priest'&&r&&r.flags&&r.flags.noTithe)delete pool['공양 요구'];if(has(E,'무모함'))for(const k in pool)if(ACT[k].k==='def'&&Object.keys(pool).length>1)delete pool[k];
  const tot=Object.values(pool).reduce((a,b)=>a+b,0)||1,out=[];for(const k in pool){const n=Math.max(1,Math.round(pool[k]/tot*8));for(let i=0;i<n;i++)out.push(k)}return out}
function foeBuildDeck(E){const src=foeActs(E);let deck=[];if(ENEMY[E.key].deck||E.key==='bishop'||E.tut)deck=src.slice();else if(ENEMY[E.key].order){while(deck.length<8)deck.push(...src,...src)}else deck=src.slice();
  E.fdeck=E.tbDeck?deck.slice().reverse():shuffle(deck);E.fdisc=[];E.hand=[];E.deckPh=E.phase||1;E.kinds=[...new Set(deck)]}
function foeDraw(E,n){for(let i=0;i<n;i++){if(!E.fdeck.length){if(!E.fdisc.length)break;E.fdeck=shuffle(E.fdisc);E.fdisc=[]}{const x=E.fdeck.pop();E.hand.push(x);if(S.C)foeSee(x)}}}
function foeRedeal(E){const n=Math.max(1,(E.hand||[]).length);foeBuildDeck(E);foeDraw(E,n)}
function foeRefill(E){const C=S.C;if(E.noAct){E.c=0;E.cMax=0;E.ap=0;E.apMax=0;E.used=E.used||[];return}if(!E.fdeck||(E.deckPh||1)!==(E.phase||1))foeBuildDeck(E);
  E.fdisc.push(...(E.hand||[]));E.hand=[];
  const gr=growth(C.turn),keep=E.key==='bishop'&&E.phase>=2;/* 보존: 총 드로우·총 코스트 고정 */
  E.cMax=E.tut?E.tbCost||3:keep?3:gr.e;E.c=Math.max(0,E.cMax-(E.cool||0));foeDraw(E,E.tut?E.tbDraw||5:keep?5:gr.d);
  if(E.apBase==null)E.apBase=E.apMax||(E.boss?10:E.tier==='elite'?6:5);const lo=Math.max(2,E.apBase-1),hi=E.apBase+1,dA=ENEMY[E.key].ap;
  E.apMax=E.tut?E.apBase:E.key==='bishop'?(E.phase>=2?3:5):dA?ri(dA[0],dA[1]):ri(lo,hi);E.ap=E.apMax+(C.turn===1&&eq('bind')?2:0);E.early=false;E.dmgTurn=0;E.used=E.used||[]}
/* V2.32.64.15 버그 수정: 뽑을 카드가 하나도 없을 때 드로우 카드(숨 고르기·망치 돌리기)를 내면 자기 자신을 다시 뽑아 끝없이 반복하며 적 턴이 멈추던 문제 */
const FOE_DRAW=new Set(['숨 고르기','망치 돌리기']);const foeDrawOk=(E,n)=>!FOE_DRAW.has(n)||(E.fdeck||[]).length+(E.fdisc||[]).length>0;
function foePick(E){if(E.key==='bishop')return bishopPick(E);const h=E.hand,c=E.c,isU=n=>!!(ACT[n]&&ACT[n].ult),ok=i=>(actCost(h[i])<=c||isU(h[i])&&c>0&&c>=Math.min(actCost(h[i]),E.cMax||0))&&actReady(E,h[i])&&foeDrawOk(E,h[i]);const idx=h.map((_,i)=>i).filter(ok);if(!idx.length)return-1;
  /* V2.35.74.20 카드 내는 순서: 예고한 궁극기 → 나에게 거는 카드 → 이로운 카드(낸 뒤 공격 한 장 낼 코스트가 남을 때) → 공격 → 방어, 같은 종류는 코스트 큰 것부터, 같으면 패 왼쪽부터 */
  {const u=idx.find(i=>isU(h[i]));if(u!=null)return u}
  {const eg=ENEMY[E.key]&&ENEMY[E.key].eager;if(eg&&S.C&&S.C.apBurst){const j=idx.find(i=>h[i]===eg);if(j!=null)return j}}
  const T=i=>actType(h[i]),big=a=>a.sort((x,y)=>actCost(h[y])-actCost(h[x])||x-y);
  if(has(E,'침착함')&&E.turn<=1){const d=big(idx.filter(i=>T(i)==='def'))[0];if(d!=null)return d}
  const neg=big(idx.filter(i=>T(i)!=='def'&&actNeg(h[i])));if(neg.length)return neg[0];
  const atkAll=h.map((_,i)=>i).filter(i=>T(i)==='atk'&&!actNeg(h[i])&&actReady(E,h[i])&&!isU(h[i]));
  for(const i of big(idx.filter(i=>T(i)==='sup'))){const rest=atkAll.map(j=>actCost(h[j]));if(!rest.length||c-actCost(h[i])>=Math.min(...rest))return i}
  const atk=big(idx.filter(i=>T(i)==='atk'));if(atk.length)return atk[0];
  const def=big(idx.filter(i=>T(i)==='def'));return def.length?def[0]:-1}
async function foeBurst(){const C=S.C,E=C.E,r=S.run;if(!E.hand)foeRefill(E);
  if((E.deckPh||1)!==(E.phase||1))foeRedeal(E);
  E._burstArmed=!!E.ultArmed&&!!ultCond(E);
  if(E.frozen||E.frozeSkip){toast('냉동',`${E.name}이(가) 얼어 카드를 낼 수 없다`);clog(`${E.name}: 냉동 — 이번 턴 카드를 낼 수 없음`,'e');return}
  let n=0;
  for(;;){if(C.over||r.hp<=0||!alive(E))return;if(n>=40){clog(`${E.name}: 한 번에 낼 수 있는 카드 수를 넘음`,'e');break}
    let k=foePick(E);if(k<0)break;const name=E.hand.splice(k,1)[0];
    if(name==='견해 묻기'&&E.asked){E.fdisc.push(name);continue}
    E.c=Math.max(0,E.c-actCost(name));E.fdisc.push(name);E.intent=name;n++;foeSee(name);E.used.push({t:C.turn,n:name});renderCombat();
    if(E.stun){E.stun=false;toast('…!',`${E.name}이(가) 말문이 막혀 「${name}」 취소`);clog(`말문이 막힘: 「${name}」 취소`,'e');continue}
    const isUlt=!!(ACT[name]&&ACT[name].ult);if(isUlt){E.ulting=true;try{await foeUltFx(E,name)}catch(e){console.error(e)}E.ultArmed=null;E._burstArmed=false;ultCheck()}
    if(name==='뼈와 살의 해체학'&&!REDUCED){const en=$('#enemy');en.classList.add('hmopen');setTimeout(()=>en.classList.remove('hmopen'),1900);await wait(650)}
    try{await execAct(name)}finally{if(isUlt)await foeUltEnd(E,name)}if(isUlt&&name==='명령 이행-처단')E.purgeHits=0;if(C.over||r.hp<=0)return;if(isUlt)ultGain(name);if(r.tutB)await wait(1100)}
  if(!n)clog(`${E.name}: 남은 코스트로 낼 수 있는 카드가 없다`,'e');
  renderCombat()}

/* ===== 1장 키워드 (V2.32.58.14) — 표식·약점 노출·골절·약화·낙인 ===== */
const ROMAN=['','Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ'];
const expoOn=()=>{const C=S.C;return!!(C&&C.mk&&C.mk.lv>0&&C.mk.expT===C.turn)};
const fracOn=()=>{const C=S.C;return!!(C&&C.fracEnd!=null&&C.turn<=C.fracEnd)};
function markHit(){const C=S.C,m=C.mk;if(m.lv>0&&m.expT!==C.turn){m.expT=C.turn;fxAt('player','약점 노출','info');clog('표식이 붙은 턴에 다시 맞음 → 약점 노출','e')}m.hitT=C.turn}
function forceMark(){const C=S.C,m=C.mk;if(m.lv<=0){m.lv=1;m.setT=C.turn;fxAt('player','표식Ⅰ','info');clog('표식 강제 부여: 이번 턴부터 표식Ⅰ','e')}else{m.lock=C.turn+2;clog(`표식 강제 부여: 그 뒤 2턴 동안 맞지 않아도 표식 유지`,'e')}}
function markTick(){const C=S.C,m=C.mk,P=C.turn-1;if(!m)return;
  if(m.lv<=0){if(m.hitT===P&&liveFoes().some(f=>f.nord)){m.lv=1;m.setT=C.turn;clog('표식Ⅰ이 붙었다','e')}return}
  if(m.expT===P||m.lock>=P||m.setT===P&&m.lock>=C.turn){m.lv=Math.min(5,m.lv+1);clog(`표식 단계 상승 → 표식${ROMAN[m.lv]}`,'e')}
  else{m.lv=0;m.lock=-9;clog('표식이 붙은 턴에 맞지 않아 표식이 사라졌다','e')}}
/* V2.33.65.16: 플레이어의 표식 (노르드교 조잡한 단검의 무기 특수 효과) — 적마다 따로 */
const pmkOf=E=>E.pmk||(E.pmk={lv:0,setT:-9,expT:-9,hitT:-9,lock:-9});
const pExpo=E=>{const C=S.C;return!!(C&&E&&E.pmk&&E.pmk.lv>0&&E.pmk.expT===C.turn)};
const pMarkMul=E=>E&&E.pmk&&E.pmk.lv?1+.1*E.pmk.lv:1;
function pMarkHit(E){const C=S.C;if(!E||C.phase!=='player')return;const m=pmkOf(E);if(m.lv>0&&m.expT!==C.turn){m.expT=C.turn;fxAt('enemy','약점 노출','info');clog(`${E.name}: 표식이 붙은 턴에 다시 맞음 → 약점 노출`)}m.hitT=C.turn}
function pForceMark(E){const C=S.C,m=pmkOf(E);if(m.lv<=0){m.lv=1;m.setT=C.turn;markChime(1);fxAt('enemy','표식Ⅰ','info');clog(`표식 강제 부여: ${E.name}에게 이번 턴부터 표식Ⅰ`)}else{m.lock=C.turn+2;clog('표식 강제 부여: 그 뒤 2턴 동안 맞지 않아도 표식 유지')}}
function pMarkTick(){const C=S.C,P=C.turn-1;if(!dagger())return;let up=0;for(const E of liveFoes()){const m=pmkOf(E);
  if(m.lv<=0){if(m.hitT===P){m.lv=1;m.setT=C.turn;up=Math.max(up,1);clog(`${E.name}에게 표식Ⅰ이 붙었다`)}continue}
  if(m.expT===P||m.lock>=P||m.setT===P&&m.lock>=C.turn){const o=m.lv;m.lv=Math.min(5,m.lv+1);if(m.lv>o)up=Math.max(up,m.lv);clog(`${E.name}: 표식 단계 상승 → 표식${ROMAN[m.lv]}`)}
  else{m.lv=0;m.lock=-9;clog(`${E.name}: 표식이 붙은 턴에 맞지 않아 표식이 사라졌다`)}}if(up)setTimeout(()=>markChime(up),350)}
/* V2.33.65.16: 궁극기 획득 — 적이 쓴 궁극기를 맞고 버티면(회피·방어로 버텨도) 1장, 같은 궁극기는 1장만 */
const ULT_GET={'행동-처형 집행':'u_exec','명령 이행-처단':'u_purge'};
function ultGain(name){const r=S.run,id=ULT_GET[name];if(!id||!r||r.mode!=='human')return;r.ults=r.ults||[];if(r.ults.includes(id))return;r.ults.push(id);addToDeck(id);clog(`궁극기 「${name}」을(를) 버텼다 → 「${CARDS[id].name}」 획득`,'h');toast('궁극기',`「${CARDS[id].name}」 — 맞고 버텨 얻었다 · 카드 보관함으로`);save()}
function badFx(){if(REDUCED)return;let v=$('#badfx');if(!v){v=document.createElement('div');v.id='badfx';stage.appendChild(v)}v.className='';void v.offsetWidth;v.className='on';try{sfx('hurt',.7)}catch(e){}setTimeout(()=>{const ch=[...document.querySelectorAll('#ppanel .chip.bad')].pop();if(ch){ch.classList.remove('slam');void ch.offsetWidth;ch.classList.add('slam')}},40)}
function buffBreak(who){const C=S.C;if(!C||REDUCED)return;const box=who==='player'?$('#ppanel .chips'):$('#echips');if(!box)return;const o=stage.getBoundingClientRect(),sc=S.scale||1;
  box.querySelectorAll('.chip').forEach(ch=>{if(!/^(힘|약화|허약|취약)/.test(ch.textContent.trim()))return;const a=ch.getBoundingClientRect(),g=ch.cloneNode(true);g.classList.add('chipbreak');g.style.left=(a.left-o.left)/sc+'px';g.style.top=(a.top-o.top)/sc+'px';stage.appendChild(g);setTimeout(()=>g.remove(),760)})}
function pWkAdd(n){const C=S.C;C.pWkF=(C.pWkF||0)+n;fxAt('player',`약화 ${n}`,'info');badFx();clog(`훈계: 약화 ${n} (최종 위력 -${C.pWkF})`,'e')}
function excommunicate(){const C=S.C,cnt={},src=C.hand.length?C.hand:C.draw.length?C.draw:C.disc;for(const c of src){if(!CARDS[c.id])continue;(cnt[c.id]=cnt[c.id]||[]).push(c)}
  const ids=shuffle(Object.keys(cnt)).sort((a,b)=>cnt[b].length-cnt[a].length).filter(id=>cnt[id].some(c=>!C.brand.includes(c.uid)));
  if(!ids.length){clog('파문 선고: 낙인을 찍을 카드가 없다','e');return}
  const id=ids[0];cnt[id].forEach(c=>{if(!C.brand.includes(c.uid))C.brand.push(c.uid)});toast('파문 선고',`「${CARDS[id].name}」 ${cnt[id].length}장에 낙인`);clog(`파문 선고: 「${CARDS[id].name}」 ${cnt[id].length}장에 낙인 (사용할 때마다 체력 -3)`,'e')}
/* 명령 — 살아 있는 모든 에인헤랴르가 명령 이행 카드를 실행, 피해를 받은 턴의 에인헤랴르는 원호 방어(명령 이행-방패 세우기)만 */
async function doCommand(B,name,a){const C=S.C,r=S.run,ks=knAlive();
  if(a.rally){knRally();renderCombat();return}
  if(!ks.length){clog(`${name}: 명령을 받을 에인헤랴르가 없다`,'e');return}
  for(const k of ks){if(C.over||r.hp<=0)return;if(!alive(k))continue;const act=k.hurtT===C.turn?'명령 이행-방패 세우기':a.cmd;
    await withFoe(k,()=>execAct(act));if(C.over||r.hp<=0)return}}
/* 보스 카드 고르기 — 1페이즈는 정해진 순서, 2페이즈는 행동 예측(상대 패를 읽음) */
function bishopPick(E){const C=S.C,h=E.hand,c=E.c,idx=h.map((_,i)=>i).filter(i=>actCost(h[i])<=c&&foeDrawOk(E,h[i])&&(h[i]!=='뼈와 살의 해체학'||C.apBurst));if(!idx.length)return-1;const f=n=>{const i=idx.find(j=>h[j]===n);return i==null?-1:i};let i;
  if((E.phase||1)<2){
    if((i=f('망치 돌리기'))>=0)return i;if(fracOn()&&(i=f('박 살'))>=0)return i;if((i=f('뼈와 살의 해체학'))>=0)return i;
    if(!fracOn()&&(i=f('으스러트리기'))>=0)return i;if((i=f('뜯어지는 강타'))>=0)return i;return idx[0]}
  const ks=knAlive();
  const pE=C.phase==='player'?C.energy:C.maxE,aff=x=>{const o=costOf(x);return o&&!o.none&&(o.e==null||o.e<=pE)};
  const canAtk=C.hand.some(x=>CARDS[x.id]&&CARDS[x.id].type==='atk'&&aff(x));
  if(canAtk){const pref=ks.some(k=>!k.block)?['명령-방패 세우기','명령-빈틈 노리기']:['명령-빈틈 노리기','명령-방패 세우기'];for(const n of pref)if((i=f(n))>=0)return i}
  for(const n of['명령-내려찍기','명령-베기','명령-빈틈 노리기','명령-방패 세우기'])if((i=f(n))>=0)return i;
  return idx[0]}

/* ================= enemy turn ================= */
async function enemyTurn(){
  const C=S.C,E=C.E,r=S.run;
  clog(`${E.name}의 턴`,'h');
  E.block=Math.floor(E.block/2);E.evaB=0;E.knightMax=0;a2EnemyTurnStart(E);
  if(has(E,'두꺼운 피부')){E.block+=4;fxAt('enemy','+4 방어도','block');clog('두꺼운 피부: 방어도 +4','e')}
  if(has(E,'광기')){E.hp-=3;fxAt('enemy','광기 -3','self');renderCombat();if(checkEnemy())return}
  if(E.boss&&E.phase>=2)for(const k of knAlive())k.block=Math.floor(k.block/2);
  E.turn++;
  if(E.apRec){const g=Math.min(E.apRec,Math.max(0,(E.cMax||0)-(E.c||0)));E.apRec=0;if(g>0){E.c+=g;clog(`${E.name}: 행동 포인트를 다 써서 코스트 +${g}`,'e');renderCombat()}}
  let acted=true;
  if(E.frozeSkip){E.frozeSkip=false;toast('냉동',`${E.name}이(가) 얼어 움직이지 못한다`);clog(`${E.name}: 냉동 — 이번 턴 카드를 낼 수 없음`,'e');acted=false}
  else if(has(E,'겁쟁이')&&!E.coward&&E.hp<=E.maxHp*.3){E.coward=true;toast('겁쟁이','겁에 질려 행동하지 않는다');acted=false}
  if(acted){await foeBurst();if(C.over||r.hp<=0)return}
  if(C.over)return;
  buffBreak('enemy');E.weak=0;E.vuln=0;
  if(E.boss&&E.phase>=2&&!C.over)knightUpkeep();
  a2EnemyTurnEnd(E);
  if(E.hand){E.fdisc.push(...E.hand);E.hand=[]}
  renderCombat();
  await wait(200);
}
/* 기믹 (V27) — 정예·보스의 일부 공격에 붙는 조건. 의도에 표시되고, 지금 상태에 따라 예상 피해가 바로 바뀜
   대비: 방어도가 있으면 피해 -80%, 없으면 +100%
   간파: 이번 턴 회피 주사위로 회피를 올려 두었으면 반드시 빗나감, 아니면 반드시 적중하고 피해 +50%
   기세 꺾기: 이번 턴 그 적에게 최대 체력 15% 이상 피해를 주었으면 피해 -70%, 못 미치면 +50% */
const GIM={
  guard:{n:'대비',t:'방어도로 막으면 피해 -80% · 못 막으면 +100%',m:()=>S.C.block>0?.2:2,ok:()=>S.C.block>0},
  read:{n:'간파',t:'회피를 올려 두면 반드시 빗나감 · 아니면 반드시 적중, 피해 +50%',m:()=>S.C.evaB>0?0:1.5,ok:()=>S.C.evaB>0},
  stagger:{n:'기세 꺾기',t:'이번 턴 이 적에게 최대 체력 15% 이상 피해를 주면 피해 -70% · 아니면 +50%',m:()=>{const E=S.C.E;return(E.dmgTurn||0)>=E.maxHp*.15?.3:1.5},ok:()=>{const E=S.C.E;return(E.dmgTurn||0)>=E.maxHp*.15}},
};
const gimOf=E=>{const a=E&&ACT[E.intent];return a&&a.gim&&GIM[a.gim]?a.gim:null};
async function execAct(name){
  const C=S.C,E=C.E,r=S.run,a=ACT[name];
  toast(name,'');clog(`${E.name} · ${name}`,'e');
  if(E.boss&&BOSS_LINES[name]&&(!E.said[name]||ACT[name].mercy)){E.said[name]=1;say(BOSS_LINES[name])}
  await wait(260);
  if(a.strip){C.block=0;C.temper=0;fxAt('player','방어도·지속 효과 제거','info');clog('미스틸테인: 방어도와 지속 효과를 떼어냄','e')}
  if(E.wkT===C.turn&&E.wkN>0&&name!=='약점 노리기'&&expoOn()){E.wkN--;clog(`약점 노리기: 추가타 (남은 ${E.wkN}회)`,'e');await enemyStrike(A(15,25),{});if(r.hp<=0||C.over)return}
  if(a.k==='cmd'){await doCommand(E,name,a);E.last.push(name);if(E.last.length>2)E.last.shift();renderCombat();await wait(200);return}
  a2PreAct(E,name);let hit=false;
  if(a.k==='atk'){
    if(a.mercy){if(await enemyStrike(null,{mercy:true}))hit=true;if(r.hp>0&&!C.over){say(BOSS_LINES.survived)}}
    else for(const x of a.d){if(await enemyStrike(x,{gim:a.gim,purge:a.purge,expo:a.expo,shatter:a.shatter,exec:a.exec,fracX:a.fracX,accAdd:a.acc||0})!==false)hit=true;if(r.hp<=0||C.over){E.actX=1;return}}
    if(a.exec){C.mk.lv=0;C.mk.lock=-9;clog('처형 집행: 표식을 전부 소모','e')}
    if(a.frac&&hit){C.fracS=C.turn;C.fracEnd=C.turn+2;fxAt('player','골절','info');clog('골절: 2턴 동안 턴 시작 코스트 -1','e')}
    if(a.forceMark&&hit)forceMark();
    if(a.wkHunt){E.wkT=C.turn;E.wkN=3}
    if(a.selfVuln){applyEnemyStatus('vuln',a.selfVuln);fxAt('enemy',`취약 ${a.selfVuln}`,'info')}
    E.firstAtk=false;E.revenge=0;E.frost=false;
    if(a.vuln){if(hit){C.pVuln=Math.min(10,C.pVuln+a.vuln);fxAt('player',`취약 ${a.vuln}`,'info');badFx();clog(`적중 · 취약 ${a.vuln}`,'e')}else clog('빗나가 취약이 붙지 않음','e')}
  }
  if(name==='은빛 소환'&&E.boss){if(!knAlive(E).length)summonKnights();else{knAlive(E).forEach(k=>k.hp=k.max);fxAt('enemy','은빛 기사 회복','info')}}
  else if(a.k==='def'){for(const x of a.d){const v=rollDie(x);E.block+=v;fxAt('enemy',`+${v} 방어도`,'block');clog(`방어 주사위 ${v} → 방어도 +${v} (현재 ${E.block})`,'e')}}
  if(a.fx&&!C.over&&r.hp>0)await a.fx(hit);
  E.actX=1;E.actFlat=0;a2AfterAct(E,name);
  if(a.pend)C.pend.push(a.pend);
  if(ENEMY[E.key].order||E.boss)E.idx++;
  E.last.push(name);if(E.last.length>2)E.last.shift();
  renderCombat();await wait(260);
}
/* 기입관의 공격은 주사위 하나당 내 최대 체력(전투 시작 때)의 정해진 범위 안으로 맞춤 — 대비(막으면 -80% · 못 막으면 +100%)는 그 뒤에 곱함
   서류 정리(주사위 2개): 하나당 [하한, 상한] · 삭제: [하한, 상한] */
const CLERK_HP={veasy:4000,easy:5000,normal:6000,hard:8000,vhard:10000};
const CLERK_DMG={veasy:{a:[.08,.15],b:[.20,.30]},easy:{a:[.08,.15],b:[.20,.35]},normal:{a:[.08,.20],b:[.25,.40]},hard:{a:[.10,.24],b:[.25,.45]},vhard:{a:[.10,.27],b:[.25,.50]}};
function clerkClamp(v,E){if(!E||E.key!=='clerk')return v;const C=S.C,r=S.run,T=CLERK_DMG[r.diff||'easy']||CLERK_DMG.easy,m=(C&&C.baseMax)||r.maxHp,R=E.intent==='삭제'?T.b:T.a;return Math.min(m*R[1],Math.max(m*R[0],v))}
/* 적의 공격 주사위 하나 — 같은 최종 데미지 공식과 명중 판정 */
async function enemyStrike(die,o={}){
  const C=S.C,E=C.E,r=S.run;
  if(C.palShield){C.palShield=false;await wait(500);fxAt('player','대신 맞음','info');clog('부상당한 노르드교 단원이 대신 맞고 쓰러졌다','e');return 0}
  if(palUp()&&!o.mercy&&rnd()<.25)return palHurt(die);
  if(E.key!=='bishop'&&!REDUCED&&!C.ultFx){const en=$('#enemy');en.classList.remove('lunge');void en.offsetWidth;en.classList.add('lunge');await wait(150);setTimeout(()=>en.classList.remove('lunge'),200)}
  const gm=o.gim&&GIM[o.gim];let ch=hitChance(enemyAcc()+(o.accAdd||0),pEva());const roll=E.tut?1:ri(1,100);
  if(gm&&o.gim==='read')ch=gm.ok()?0:100;
  const her=!!(S.run.flags&&S.run.flags.heresy);if(o.exec||(o.purge&&her))ch=100;
  const r0=o.mercy?0:rollDie(die),v=o.mercy?0:eAdj(r0);
  let dmg=0,txt='';
  if(o.mercy){dmg=r.hp;txt=`남은 체력만큼 ${dmg}`}
  else{const f=formula(v,E.revenge+(E.actFlat||0),E.atk,eTraits(),pDef(),{x:has(E,'무모함')&&E.firstAtk?2:1});const gx=gm&&o.gim!=='read'?gm.m():gm?1.5:1;dmg=Math.round(clerkClamp(f.fin*(E.dmgMul||1),E)*gx);txt=`${gm?`[${gm.n} ${gm.ok()?'성공':'실패'} ×${gx}] `:''}${E.dmgMul&&E.dmgMul!==1?`[전투 보정 ×${E.dmgMul}] `:''}공격 주사위 ${v}: ${f.text}`}
  if(!o.mercy&&gs('lateGuard')&&C.turn>=3)dmg=Math.round(dmg*.8);
  if(!o.mercy){let M=1;const tg=[];
    if(E.nord&&C.mk.lv){M*=1+.1*C.mk.lv;tg.push(`표식${ROMAN[C.mk.lv]} +${C.mk.lv*10}%`)}
    if(o.expo&&expoOn()){M*=1+o.expo;tg.push(`약점 노출 +${o.expo*100}%`)}
    if(o.fracX&&fracOn()){M*=1+o.fracX;tg.push(`골절 +${o.fracX*100}%`)}
    if(o.purge&&her){const m2=C.block>0?4.1:5;M*=m2;tg.push(`처단 ×${m2}`)}
    if(E.key==='inquisitor'&&her){M*=1.25;tg.push('새겨진 본능-단죄 +25%')}
    if(M!==1){dmg=Math.round(dmg*M);txt=`[${tg.join(' · ')}] `+txt}}
  {const hit=roll<=ch,bb=Math.min(C.block,dmg);await diceFocus({foe:true,lb:o.mercy?`${E.name} · 안 아프게 빨리`:`${E.name} · 공격 주사위${gm?` · ${gm.n} ${gm.ok()?'성공':'실패'}`:''}`,a:o.mercy?0:die.a,b:o.mercy?0:die.b,r0:o.mercy?'—':r0,pow:o.mercy?'남은 체력':v,hit,ch,dmg:hit?dmg-bb:0,bl:hit?bb:0})}
  if(C.ultFx&&!C.ultFx.hitDone){C.ultFx.hitDone=true;try{await C.ultFx.impact()}catch(e){}}
  if(roll>ch){if(pt('dodgeE')&&!o.mercy&&C.dodgeFor!==C.turn+1){C.dodgeFor=C.turn+1;C.nextEnergy=(C.nextEnergy||0)+1;clog(`${PTRAIT.dodgeE.n}: 다음 턴 코스트 +1`)}fxAt('player','빗나감','miss');sfx('miss');swayFx();clog(`${o.mercy?'안 아프게 빨리':`공격 주사위 ${v}`} · 적중률 ${ch}% · 판정 ${roll} → 빗나감`,'miss e');palEv('dodge');await wait(240);if(C.parryN>0&&!C.over&&alive(E)){C.parryN--;clog('흘려 베기: 회피 성공 → 반격');C.fxCard='parry';await pStrike(A(90,120),{atk:pAtk(),label:'흘려 베기 반격'})}return false}
  if(!o.mercy&&dmg>0&&dmg<5&&eq('shell')){clog(`${txt} · 적중 → 막의 껍질이 튕겨냄 (5 미만)`,'e');fxAt('player','튕겨냄','block');await wait(200);return 0}
  if(E.nord)markHit();
  if(o.shatter&&C.block>0){const d2=dmg*2,b2=Math.min(C.block,d2);C.block-=b2;clog(`${txt} · 적중 → 파쇄: 방어도에만 2배 데미지 ${d2} · 방어도 ${b2} 깎임 (체력 피해 없음)`,'e');fxAt('player',`방어도 -${b2}`,'block');sfx('block');guardFx();renderCombat();await wait(260);return 0}
  const b=Math.min(C.block,dmg);C.block-=b;const loss=dmg-b;r.hp-=loss;if(loss>0&&E.hand!==undefined&&(E.kinds||[]).includes('명령 이행-처단')){E.purgeHits=(E.purgeHits||0)+1;clog(`${E.name}: 적중 ${Math.min(3,E.purgeHits)}/3`,'e')}palEv(loss>0?(r.hp<r.maxHp*.3?'low':'hurt'):'block');
  if(loss>0&&r.hp>0){if(gs('hitSteam'))a2Give('steam',gs('hitSteam'));if(gs('hitEva'))C.evaNext=gs('hitEva');if(gs('hitHeal'))heal(r.maxHp*gs('hitHeal')/100)}
  clog(`${txt} · 적중률 ${ch}% · 판정 ${roll} → 적중${b?` · 방어도 ${b} 흡수`:''} · 피해 ${loss}`,'e');
  if(loss>0){const big=loss>=Math.max(20,r.maxHp*.12);fxAt('player',`-${loss}`,'self'+(big?' t2':''));flashHurt(big)}else{fxAt('player',`막음 ${b}`,'block');sfx('block');guardFx()}
  if(loss>0&&has(E,'굶주림')){const h=Math.min(3,E.maxHp-E.hp);if(h>0){E.hp+=h;fxAt('enemy',`+${h}`,'heal')}}
  if(C.pFrozen){C.pCrack=Math.min(3,(C.pCrack||0)+2);C.pCrackT=C.turn;fxAt('player',`깨짐 ${C.pCrack}단계`,'info')}
  renderCombat();
  if(r.hp<=0){r.hp=0;await wait(400);gameOver();return loss}
  if(C.recoil>0&&!C.over)fixedDmg(C.recoil,'반동');
  if(loss>0&&eq('dome')&&!C.over){r.dome=(r.dome||0)+loss;if(r.dome>=30){const n=r.dome;r.dome=0;clog(`열돔 주머니: 저장한 피해 ${n} 방출`);fixedDmg(n,'열돔 주머니')}}
  await wait(260);return loss;
}
function chooseIntent(){
  const C=S.C,E=C.E,d=ENEMY[E.key];
  if(E.boss)return bossIntent();
  /* V2.32.64.15 버그 수정: 덱으로 싸우는 적(1장 적)은 예전 행동 목록이 없음 — 침착함 특성이 붙으면 전투 시작 때 멈추던 문제 */
  if(d.deck||!d.acts&&!d.order){E.intent=null;return}
  if(d.order){
    let ord=(E.phase===2&&d.order2?d.order2:d.order).slice();
    if(E.key==='priest'&&S.run&&S.run.flags&&S.run.flags.noTithe)ord=ord.filter(a=>a!=='공양 요구');
    if(has(E,'무모함'))ord=ord.filter(a=>ACT[a].k!=='def');
    if(E.asked)ord=ord.filter(a=>a!=='견해 묻기');
    if(E.turn===0&&has(E,'침착함')){const df=ord.find(a=>ACT[a].k==='def');if(df){E.intent=df;E.idx=ord.indexOf(df);return}}
    E.intent=ord[((E.idx%ord.length)+ord.length)%ord.length];return}
  let pool={...d.acts};
  if(E.key==='priest'&&S.run&&S.run.flags&&S.run.flags.noTithe)delete pool['공양 요구'];
  if(has(E,'무모함'))for(const k in pool)if(ACT[k].k==='def')delete pool[k];
  if(E.turn===0&&has(E,'침착함')){const df=Object.keys(d.acts).find(k=>ACT[k].k==='def');if(df){E.intent=df;return}}
  if(E.last.length===2&&E.last[0]===E.last[1]&&Object.keys(pool).length>1)delete pool[E.last[0]];
  E.intent=wpick(pool);
}
function bossIntent(){
  const C=S.C,E=C.E,r=S.run;
  if(E.mercyCD===0&&r.hp<=r.maxHp*.25){E.intent='안 아프게 빨리';E.mercyCD=4;say(BOSS_LINES.mercy);E.idx--;return}
  if(E.phase===1){
    const ord=['미스틸테인','백색의 불꽃','공양의 칼'];
    let a=ord[((E.idx%3)+3)%3];
    if(a==='백색의 불꽃'&&E.noSpecial){E.wfSkip=!E.wfSkip;if(E.wfSkip){E.idx++;a=ord[E.idx%3]}}
    E.intent=a;return;
  }
  const ord=['공양의 칼','공양의 칼','은빛 소환','미스틸테인'];E.intent=ord[((E.idx%4)+4)%4];
}
function enterPhase2(why,silent){
  const C=S.C,E=C.E;if(E.phase>=2)return;
  E.phase=2;E.atk+=15;E.acc-=15;E.idx=0;
  const all=[...C.hand,...C.draw,...C.disc];
  all.forEach(c=>{if(CARDS[c.id].rar==='special'&&!C.brand.includes(c.uid))C.brand.push(c.uid)});
  clog('페이즈 2 · 단죄 — 공격레벨 +15, 명중 -15','e');
  if(!silent){toast('페이즈 2 · 단죄',C.brand.length?'특수무기 카드 전부에 낙인':'');if(why==='hp')say(BOSS_LINES.p2hp)}
  if(C.turn>0&&E.intent!=='안 아프게 빨리')bossIntent();
}

/* ================= combat end ================= */
function winCombat(res){const C=S.C,r=S.run;if(C.over)return;
  const back=ULT_ON?ultBack():Promise.resolve();
  if(!r.tutB&&foes().some(f=>f.tier==='boss')&&!REDUCED){C.over=true;C.phase='over';S.busy=true;back.then(bossFinish).then(()=>{S.busy=false;r.train?trEnd():winCombatGo(res)});return}
  if(r.train){C.over=true;C.phase='over';back.then(()=>setTimeout(trEnd,REDUCED?100:700));$('#enemy').classList.add('dead');return}
  winCombatGo(res)}
function winCombatGo(res){
  const C=S.C,r=S.run;C.over=true;C.phase='over';
  if(r.tutB){S.busy=false;$('#enemy').classList.add('dead');setTimeout(()=>{hideCombatUI();tbAfterWin()},REDUCED?100:1100);return}
  S.busy=false;a2CombatEnd(C);setTimeout(()=>palEv('win'),500);
  const lines=[];r.next=null;
  $('#enemy').classList.add('dead');$('#foebar').hidden=true;
  if(C.select){C.select=null;$('#prompt').hidden=true}
  const all=foes(),killed=all.filter(f=>(f.dead||f.hp<=0)&&!f.fled),fled=all.filter(f=>f.fled&&!f.spared),spared=all.filter(f=>f.spared);
  const top=all.find(f=>f.tier==='boss')||all.find(f=>f.tier==='elite')||all[0];
  if(r.act===2&&killed.length&&!(C.atInfo&&(C.atInfo.evb||C.atInfo.spar)))r.flags.a2Felled=1;
  if((r.act||1)===1&&killed.some(f=>f.key==='priest'&&!f.tut)&&!r.flags.heresy){r.flags.heresy=1;lines.push(['이단 표식','노른교 신자를 무력화했다'])}
  for(const E of killed){
    r.kills++;if(E.key==='cadet')r.flags.cadetGone=1;
    if(r.mode==='dain'){
      /* 섭취: 체력·공방렙 1/3 (V30.15.5 상한 없음) */
      const h=Math.round(E.maxHp/3),over=0;
      const a=Math.round(E.atk/3)+Math.floor(over/10),d=Math.round(E.def/3)+Math.floor(over/10);
      const na=r.atk+a+d,nd=0;r.eatHp=(r.eatHp||0)+h;/* 육참골단: 섭취한 방어레벨도 공격레벨로 */
      lines.push([`섭취 · ${E.name}`,`최대 체력 +${h}${over?` (상한 · 초과 ${over})`:''}, 공격레벨 +${na-r.atk}, 방어레벨 +${nd-r.def}`]);r.maxHp+=h;r.hp+=h;r.atk=na;r.def=nd;}
    if(pt('killHeal')){const h=Math.min(r.maxHp-r.hp,Math.round(r.maxHp*.05));if(h>0){r.hp+=h;lines.push([PTRAIT.killHeal.n,`체력 +${h}`])}}
  }
  if(killed.length&&eqW('re_a')&&r.hp>0){const h=Math.min(3,r.maxHp-r.hp);if(h>0){r.hp+=h;lines.push(['레미 공방',`체력 +${h}`])}}
  if(killed.length&&top.tier==='elite'&&eq('u_basket')){const h=Math.min(r.maxHp-r.hp,Math.round(r.maxHp*.2));if(h>0){r.hp+=h;lines.push(['야식 바구니',`체력 +${h}`])}}
  /* 전투 보상: 1장 일반 100~300 · 정예 500~1500 · 보스 3000 / 2장 일반 2000~5000 · 정예 10000~50000 · 보스 30~100단화(임시 해석) */
  let gold=0;
  if(spared.length)lines.push(['견해',`${spared.map(f=>f.name).join(', ')} — 처치하지 않고 끝남 · 실링만 받음 (경험치 없음)`]);
  if(killed.length||spared.length){const a2=r.act===2,T=a2?TUNE.gold2:TUNE.gold,tr=top.tier==='boss'?'boss':top.tier==='elite'?'elite':'normal';
    gold=Array.isArray(T[tr])?ri(...T[tr]):T[tr];
    const gk=killed.length?killed:spared;
    if(gk.every(f=>f.key==='poor')&&a2)gold=Math.round(gold*.5);
    if(gk.every(f=>has(f,'빈털터리')))gold=0;
    if(gk.some(f=>has(f,'부유함')))gold=Math.round(gold*1.5);
    const gp=gs('goldPct');if(gp)gold=Math.round(gold*(1+gp/100));
    if(tr!=='normal'&&eq('u_bounty'))gold=Math.round(gold*1.5);
    gold=Math.round(gold*diffGm())}
  if(fled.length&&!killed.length)lines.unshift(['도망','도망쳤다 — 보상 실링 없음']);
  else if(fled.length)lines.push(['도망',`${fled.map(f=>f.name).join(', ')} — 도망친 몫은 보상 없음`]);
  const evb=C.atInfo&&C.atInfo.evb;if(evb){gold=0;lines.push(['이벤트 전투','적대로 이어지지 않는다'])}
  const spar=C.atInfo&&C.atInfo.spar;if(spar){gold=spar.elite?ri(3000,5000):ri(500,1000);lines.push(['대련','누구도 다치지 않았다']);if(spar.elite){r.flags.sparWon=r.flags.sparWon||{};r.flags.sparWon[spar.ws]=1}}
  r.gold+=gold;
  let killEx=0;if(!evb&&!spar&&r.act===2&&r.mode==='human'){const dir=killed.filter(E=>!E.dotKill);killEx=dir.reduce((s,E)=>s+expFor(E.lv,r.lvl),0)}
  const loot=[];
  const info=C.atInfo||{};let then=null;
  if(top.key==='bishop')then='fall';else if(top.key==='clerk')then='win2';else if(info.rush!=null)then='rush';else if(info.laev)then='laevWin';
  if(r.act===2&&info.node!=null&&r.m2){const n=r.m2.nodes[info.node];if(n)n.cleared=true}
  const chase=fled.length&&r.mode!=='dain'?JSON.parse(JSON.stringify(fled)):null;
  setTimeout(()=>{
    hideCombatUI();
    if(then==='win2')return showAct2Victory(gold,lines,loot[0]);
    if(evb)runFx(evb,()=>{});r.at={kind:'reward',gold,lines,loot,then,fledAll:!killed.length&&fled.length>0,rush:info.rush,chase,node:info.node,killEx,cards:evb?[]:spar?sparCards(spar.ws,spar.elite):rewardCards()};save();
    showReward(gold,lines,loot);
  },REDUCED?100:900);
}
function rewardCards(){const pool=Object.keys(CARDS).filter(id=>{const g=cardGrade(id);return g&&cardPrice(id)!=null&&GRADE_RANK[g]<=GRADE_RANK.rare});return shuffle(pool).slice(0,3)}
function sparCards(ws,elite){const W=WS2[ws];if(!W)return[];let pool=W.cards.slice();if(elite){pool.sort((a,b)=>(CARD_PRICE2[b]||0)-(CARD_PRICE2[a]||0));pool=pool.slice(0,6)}return shuffle(pool).slice(0,3)}
function showReward(gold,lines,loot){
  S.screen='reward';renderTop();viewFor('map');
  const loots=(Array.isArray(loot)?loot:[loot]).filter(k=>typeof k==='string'&&GEAR[k]);/* V15 저장(카드 보상)은 무시 */
  const lt=loots.length>0,at=S.run.at||{};
  const sc=openScreen('',{dim:true});
  sc.innerHTML=`<div class="panel" style="align-items:center">
    <div class="ptitle">승리</div>
    <div class="lines" style="min-width:min(520px,100%)">${gold?`<div><span>실링</span><b>+${gold.toLocaleString()}</b></div>`:at.fledAll?'<div class="nogold"><span>실링</span><b></b></div>':''}${lines.map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}</div>
    ${at.cards&&at.cards.length&&!at.picked?`<div class="psub">카드 보상 — 하나를 골라 카드 보관함으로</div><div class="cardrow shoprow">${at.cards.map((id,i)=>`<div class="cardpick">${staticCard(id,false)}<button class="plate-btn" data-rw="${i}">고른다</button></div>`).join('')}</div>`:''}
    ${at.killEx&&!at.killDone?`<div class="psub">상대를 어떻게 할까</div><div class="choices" style="flex-direction:row;justify-content:center"><button class="plate-btn" id="rwSub">제압한다</button><button class="plate-btn" id="rwKill">살해한다</button></div>`:''}
    <div class="choices" style="flex-direction:row;justify-content:center"><button class="btn-main" id="goR">${lt?'가져간다':at.then==='fall'?'세계수 아래로':at.then==='rush'?'다음 상대':'계속'}</button>${at.chase?`<button class="plate-btn" id="goChase">따라잡기 — 도망친 ${at.chase.map(f=>f.name).join(', ')}</button>`:''}</div></div>`;
  sc.querySelectorAll('[data-rw]').forEach(b=>b.onclick=()=>{const id=at.cards[+b.dataset.rw];S.run.store=S.run.store||[];S.run.store.push({uid:UID++,id});at.picked=true;toast('카드',`「${CARDS[id].name}」 — 카드 보관함으로`);tutEvent('rwcard');save();showReward(gold,lines,loot)});bindStatic(sc);
  if($('#rwSub'))$('#rwSub').onclick=()=>{at.killDone=true;save();showReward(gold,lines,loot)};
  if($('#rwKill'))$('#rwKill').onclick=()=>{const ls=[];gainExp(at.killEx,ls);at.killDone=true;lines.push(...ls);lines.push(['살해','시체로 남는다']);S.run.flags.slain=true;save();showReward(gold,lines,loot)};
  const chain=(ks,fin)=>ks.length?gainGear(ks[0],()=>chain(ks.slice(1),fin)):fin();
  $('#goR').onclick=()=>chain(loots,afterReward);
  if($('#goChase'))$('#goChase').onclick=()=>chain(loots,startChase);
  tutShow();
}

