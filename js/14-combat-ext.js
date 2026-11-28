"use strict";
/* ================= V19 · 여러 적 전투 (2장 일반 전투는 1~3명) ================= */
const foes=()=>{const C=S.C;if(!C)return[];return C.foes||(C.E?[C.E]:[])};
const alive=f=>f&&f.hp>0&&!f.fled&&!f.dead;
const liveFoes=()=>foes().filter(alive);
async function withFoe(f,fn){const C=S.C,prev=C.E;C.E=f;renderCombat();
  try{return await fn()}finally{if(S.C===C&&!C.over){C.E=alive(prev)?prev:(liveFoes()[0]||prev);renderCombat()}}}
function setTarget(f){const C=S.C;if(!C||C.over||!alive(f))return;C.E=f;renderCombat()}
/* 가중치: 고른 대상 외에 가장 가까운 인원부터 그 수만큼 함께 공격, 모자라면 남는 가중치 1당 +10% */
function cardWeight(c){const id=c.id;let w=id==='t_thunder'?Math.max(0,liveFoes().reduce((a,f)=>a+(f.el||0),0)):0;if(pt('wUp'))w+=2;if(pt('wDown'))w=Math.max(0,w-2);return w}
function weightTargets(c){const C=S.C,w=cardWeight(c);if(!w)return{tg:[C.E],wb:0};
  const others=liveFoes().filter(f=>f!==C.E),tg=[C.E,...others.slice(0,w)];return{tg,wb:Math.max(0,w-others.length)}}
/* 적 그림 — 2장 공방 사람 · 경비원 · 공무원 (임시 실루엣) */
function a2SVG(art){
  const col={w_stein:'#b9703f',w_kriv:'#7fb0d6',w_remi:'#c9a35c',w_krim:'#a57fc9',w_ash:'#d6c27a',poor:'#7a746a',e_exam:'#b8b0a0',e_guard:'#5d7389',clerk:'#9a8a6a',surt:'#e0582c'}[art]||'#888';
  if(art==='clerk')return`<svg viewBox="0 0 240 360" preserveAspectRatio="xMidYMax meet"><ellipse class="pt-shadow" cx="120" cy="350" rx="100" ry="10" fill="#000" opacity=".5"/>
    <g class="pt pt-body" style="transform-origin:120px 348px"><g class="pt pt-armL" style="transform-origin:70px 120px"><path d="M70 120C40 110 20 70 30 40" stroke="#8a6a3a" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="30" cy="38" r="12" fill="#a07a44"/></g><g class="pt pt-armR" style="transform-origin:170px 120px"><path d="M170 120c30-10 50-50 40-80" stroke="#8a6a3a" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="210" cy="38" r="12" fill="#a07a44"/></g><path d="M120 40c-26 0-36 24-34 52-20 30-26 120-34 256h136c-8-136-14-226-34-256 2-28-8-52-34-52z" fill="${col}"/><g class="pt pt-head" style="transform-origin:120px 100px"><path d="M120 60c-17 0-23 18-21 36 3 15 39 15 42 0 2-18-4-36-21-36z" fill="#0b0b0d"/></g><g class="pt pt-item" style="transform-origin:120px 180px"><rect x="96" y="150" width="48" height="60" rx="4" fill="#e8dfca" opacity=".8"/><path d="M104 165h32M104 178h32M104 191h24" stroke="#5b4f3a" stroke-width="3"/></g></g></svg>`;
  const hat=art==='e_guard'?'<path d="M82 52h76l-8-20H90z" fill="#2b3644"/>':art==='e_exam'?'<rect x="92" y="34" width="56" height="14" rx="3" fill="#3e3a33"/>':art.startsWith('w_')?'<path d="M86 60c4-24 64-24 68 0z" fill="#3a3530"/>':'';
  return`<svg viewBox="0 0 240 360" preserveAspectRatio="xMidYMax meet"><ellipse class="pt-shadow" cx="120" cy="350" rx="90" ry="10" fill="#000" opacity=".5"/>
    <g class="pt pt-body" style="transform-origin:120px 348px"><path d="M120 36c-28 0-38 26-36 56-22 34-30 122-40 256h152c-10-134-18-222-40-256 2-30-8-56-36-56z" fill="${col}"/><path d="M120 36c-28 0-38 26-36 56-22 34-30 122-40 256h152c-10-134-18-222-40-256 2-30-8-56-36-56z" fill="#000" opacity=".28"/><g class="pt pt-head" style="transform-origin:120px 100px"><path d="M120 58c-18 0-24 20-22 38 3 16 41 16 44 0 2-18-4-38-22-38z" fill="#0b0b0d"/>${hat}</g><g class="pt pt-arms" style="transform-origin:120px 160px"><path d="M84 150c-14 40-8 72 16 82l20-6 20 6c24-10 30-42 16-82" fill="#000" opacity=".2"/></g></g></svg>`;
}
/* ================= 니다벨리르 공방 고유 키워드 (증기·열기·냉매·냉동·깨짐·예술적 감각·작품·먹기·배부름·포화) =================
   플레이어 쪽 값은 S.C(p…), 적 쪽 값은 적 객체에 둠 */
const NEGS=[['weak','약화',1],['vuln','취약',1],['el','전격',3],['burn','소각',10],['cool','냉매',1],['steam','증기',3]];/* 무작위 부정적 키워드 — 수치는 임시 */
function heatCap(isP){return isP?2+(gs('heatMax')||0)+(S.C.heatCapAdd||0):(S.C.E&&ENEMY[S.C.E.key].heatMax)||2}
/* 플레이어에게 부여 */
function a2Give(k,n){const C=S.C,r=S.run;if(!C||n<=0)return;
  if(k==='steam'){n*=gs('steam2')?2:1;C.pSteam=(C.pSteam||0)+n;fxAt('player',`증기 +${n}`,'info');clog(`플레이어에게 증기 ${n} (현재 ${C.pSteam})`,'e');return}
  if(k==='cool'){if(gs('coolImm')){fxAt('player','보온 장갑 — 냉매 무시','block');return}
    if(C.pBurn>0){const neu=Math.min(n,Math.ceil(C.pBurn/10));C.pBurn=Math.max(0,C.pBurn-neu*10);n-=neu;clog(`냉매 ${neu} — 자신의 소각 중화`,'e');if(n<=0)return}
    C.pCool=(C.pCool||0)+n;fxAt('player',`냉매 +${n}`,'info');clog(`플레이어에게 냉매 ${n} (현재 ${C.pCool})`,'e');
    if(C.pCool>=3&&!C.pFrozen){C.pFrozen=true;C.pFrozenTurn=C.turn+1;toast('냉동','다음 턴 동안 행동할 수 없다');clog('냉매 3 이상 — 냉동 (다음 내 턴 행동 불가)','e')}return}
  if(k==='burn'){if(gs('burnImm')){fxAt('player','단열 외투 — 소각 무효','block');return}if(C.pCool>0){const neu=Math.min(C.pCool,Math.ceil(n/10));C.pCool-=neu;n=Math.max(0,n-neu*10);clog(`자신의 냉매 ${neu}가 소각을 중화`,'e');if(n<=0)return}
    C.pBurn=Math.min(100,(C.pBurn||0)+n);fxAt('player',`소각 +${n}`,'info');return}
  if(k==='el'){if(r.mode==='thor'){fxAt('player','천둥의 신 — 전격 무시','block');return}C.pEl=(C.pEl||0)+n;fxAt('player',`전격 +${n}`,'info');return}
  if(k==='weak'){C.pWeak=Math.min(10,C.pWeak+n);fxAt('player',`허약 ${n}`,'info');badFx();return}
  if(k==='vuln'){C.pVuln=Math.min(10,C.pVuln+n);fxAt('player',`취약 ${n}`,'info');badFx();return}
}
/* 적 자신에게 */
function a2Self(k,n){const C=S.C,E=C.E;
  if(k==='heat'){const cap=heatCap(false),v=Math.min(cap,(E.heat||0)+n);E.heatGain=(E.heatGain||0)+(v-(E.heat||0));E.heat=v;fxAt('enemy',`열기 ${E.heat}`,'info');return}
  if(k==='steam'){E.steam=(E.steam||0)+n;return}
  if(k==='food'){foodGain(E,n,false);return}
}
/* 적에게 부여 (플레이어 카드·장비) */
function a2Hit(k,n,E=S.C.E){const C=S.C;if(!E||n<=0)return;
  if(k==='cool'){if(E.burn>0){const neu=Math.min(n,Math.ceil(E.burn/10));E.burn=Math.max(0,E.burn-neu*10);n-=neu;clog(`냉매 ${neu} — 대상의 소각 중화`);if(n<=0)return}
    E.cool=(E.cool||0)+n;clog(`냉매 ${n} 부여 (현재 ${E.cool})`);if(E.cool>=3&&!E.frozen){E.frozen=true;fxAt('enemy','냉동','info');clog('냉매 3 이상 — 대상 냉동 (다음 행동 불가)')}return}
  if(k==='steam'){E.steam=(E.steam||0)+n;clog(`증기 ${n} 부여 (현재 ${E.steam})`);return}
  if(k==='el'){E.el+=n;clog(`전격 ${n} 부여`);return}
  if(k==='burn'){if(E.cool>0){const neu=Math.min(E.cool,Math.ceil(n/10));E.cool-=neu;n=Math.max(0,n-neu*10);clog(`대상의 냉매 ${neu}가 소각을 중화`);if(n<=0)return}E.burn=Math.min(100,E.burn+n);clog(`소각 ${n} 부여`);return}
  if(k==='weak'||k==='vuln'){const pv=S.C.E;S.C.E=E;applyEnemyStatus(k,n);S.C.E=pv;return}
}
function a2RandNeg(diff){const E=S.C.E;let pool=NEGS;if(diff&&E.lastNeg)pool=NEGS.filter(x=>x[0]!==E.lastNeg);const[k,n,v]=(()=>{const p=pick(pool);return[p[0],p[1],p[2]]})();E.lastNeg=k;clog(`무작위 부정적 키워드: ${n} ${v}`,'e');a2Give(k,v)}
function a2SealRandom(t){const C=S.C,pool=C.hand.filter(c=>!CARDS[c.id].unplayable&&!C.seal[c.uid]);if(!pool.length)return;const c=pick(pool);C.seal[c.uid]=t;toast('반려 서류',`「${cardName(c.id,c)}」 ${t}턴 봉인`);clog(`반려 서류: 「${CARDS[c.id].name}」 ${t}턴 봉인`,'e')}
/* 먹기 — 1당 최대 체력 +5% (최대 10), 10이면 배부름 +50%, 배부름 3턴 뒤부터 턴마다 포화 +1 (최대 5) */
function foodMaxOf(base,f,full){return Math.round(base*(.05*f+(full?.5:0)))}
function foodSync(who,isP){const r=S.run;
  if(isP){const C=S.C;const want=foodMaxOf(C.baseMax||r.maxHp,C.food||0,C.full)*(gs('foodHp2')?2:1);const d=want-(C.foodAdd||0);if(!d)return;C.foodAdd=want;r.maxHp+=d;if(d>0)r.hp+=d;r.hp=Math.min(r.hp,r.maxHp);return}
  const E=who;E.baseMax=E.baseMax||E.maxHp;const want=foodMaxOf(E.baseMax,E.food||0,E.full);const d=want-(E.foodAdd||0);if(!d)return;E.foodAdd=want;E.maxHp+=d;if(d>0)E.hp+=d;E.hp=Math.min(E.hp,E.maxHp)}
function foodGain(who,n,isP){const C=S.C,o=isP?C:who;if(!isP)who.baseMax=who.baseMax||who.maxHp;else C.baseMax=C.baseMax||S.run.maxHp-(C.foodAdd||0);
  o.food=Math.min(10,(o.food||0)+n);o.foodTurn=C.turn;if(o.food>=10&&!o.full){o.full=true;o.fullT=0;if(isP)toast('배부름','최대 체력 +50%');else fxAt('enemy','배부름','info')}
  foodSync(who,isP);if(isP)fxAt('player',`먹기 +${n}`,'info');else fxAt('enemy',`먹기 +${n}`,'info')}
function foodTurn(who,isP){const C=S.C,o=isP?C:who;if(!o.food)return;
  if(o.full){o.fullT=(o.fullT||0)+1;if(o.fullT>3)o.sat=Math.min(5,(o.sat||0)+1)}
  const noDecay=isP&&gs('noEatDecay');if(!noDecay&&o.foodTurn!==C.turn-1&&o.foodTurn!==C.turn){o.food=Math.max(0,o.food-1)}
  if(o.food<10&&o.full){o.full=false;o.fullT=0;o.sat=0}foodSync(who,isP)}
/* 예술적 감각 — 같은 카드 3회 연속 또는 다른 카드 3회 연속 발동 시 1 획득 (턴당 최대 1, 최대 3), 1당 드로우 +1·코스트 +1, 3이면 전부 소모하고 작품 준비 */
function artOn(){const C=S.C;return!!(C&&C.artOn)}
function artTrack(id){const C=S.C;if(!artOn())return;const a=C.artSeq||(C.artSeq={last:null,same:0,diff:0});
  if(a.last===id){a.same++;a.diff=1}else{a.diff++;a.same=1}a.last=id;
  if((a.same>=3||a.diff>=3)&&C.artGotT!==C.turn){a.same=0;a.diff=0;C.artGotT=C.turn;artAdd(1)}}
function artAdd(n){const C=S.C;C.art=Math.min(3,(C.art||0)+n);
  if(C.master){C.master=false;for(const a of[C.hand,C.draw,C.disc])for(let i=a.length-1;i>=0;i--)if(a[i].id==='art_done')a.splice(i,1);clog('예술적 감각이 다시 쌓여 작품-완성이 사라짐')}
  fxAt('player',`예술적 감각 ${C.art}`,'info');clog(`예술적 감각 +${n} (현재 ${C.art})`);
  if(C.art>=3){C.art=0;C.hand.push({uid:UID++,id:'art_wip',temp:true});toast('작품 준비','작품 준비 카드가 생겼다');settleHand()}}
/* 패에 작품-완성이 있는지 */
const masterOn=()=>{const C=S.C;return!!(C&&C.hand&&C.hand.some(c=>c.id==='art_done'))};
/* ================= 경비원 재정의 · 공무원 기록 ================= */
function cdef(c){const C=S.C,d=CARDS[c.id];const rd=C&&S.screen==='combat'&&C.redef&&C.redef[c.uid];if(!rd)return d;
  const o={...d,name:rd.name||d.name};if(rd.dc)o.cost=Math.max(0,(d.cost||0)+rd.dc);
  if(rd.swap&&d.d){o.d=d.d.map(x=>x.t==='atk'?{...x,t:'def'}:x.t==='def'?{...x,t:'atk'}:x);o.type=d.type==='atk'?'def':d.type==='def'?'atk':d.type}return o}
function redefine(n){const C=S.C;C.redef={};const pool=shuffle(C.hand.filter(c=>!CARDS[c.id].unplayable));
  for(const c of pool.slice(0,n)){const d=CARDS[c.id],ops=shuffle(['name','cost',...(d.d&&d.d.some(x=>x.t!=='eva')&&(d.type==='atk'||d.type==='def')?['swap']:[])]).slice(0,ri(1,2)),rd={};
    for(const o of ops){if(o==='name')rd.name=REDEF_NAME[c.id]||`재정의된 ${d.name}`;if(o==='cost')rd.dc=pick([-1,1]);if(o==='swap')rd.swap=true}
    if(!rd.name&&(rd.dc||rd.swap))rd.name=REDEF_NAME[c.id]||d.name;C.redef[c.uid]=rd;
    clog(`재정의: 「${d.name}」 → 「${rd.name}」${rd.dc?` · 코스트 ${rd.dc>0?'+1':'-1'}`:''}${rd.swap?' · 공격↔방어':''}`,'e')}
  if(n)toast('재정의',`패의 카드 ${Math.min(n,pool.length)}장이 재정의되었다`)}
const cardKind=d=>{const t=(d.d||[]).map(x=>x.t);return t.includes('atk')?'atk':t.includes('def')?'def':t.includes('eva')?'eva':null};
const KIND_N={atk:'공격',def:'방어',eva:'회피'};
function nulled(c){const C=S.C;if(!C||!C.nullKinds||!C.nullKinds.length)return false;const k=cardKind(cdef(c));return!!k&&C.nullKinds.includes(k)}
/* ================= 전투 시작·턴 훅 ================= */
function a2CombatStart(C){
  const r=S.run;C.baseMax=r.maxHp;
  if(r.fSteam){const v=r.fSteam;r.fSteam=0;a2Give('steam',v);clog(`열기 필드: 쌓인 증기 ${v}`,'h')}
  setTimeout(()=>palEv('start'),650);
  C.artOn=r.deck.some(c=>CARDS[c.id].ws2==='ash')||!!(r.next&&r.next.art);
  if(eq('own_st'))a2Give('steam',5);if(eq('own_as')){C.artOn=true;artAdd(1)}if(r.next&&r.next.draw0)C.drawN0=r.next.draw0;
  if(r.next){if(r.next.steam)a2Give('steam',r.next.steam);if(r.next.cool)a2Give('cool',r.next.cool);if(r.next.heat){C.heat=Math.min(heatCap(true),r.next.heat);C.heatGain=C.heat}
    if(r.next.art){C.artOn=true;artAdd(r.next.art)}if(r.next.food)foodGain(null,r.next.food,true)}
  if(gs('lunch')){for(let i=0;i<2;i++)C.hand.push({uid:UID++,id:'hardtack',temp:true});clog('도시락 통: 패에 레미 공방의 건빵 2장')}
  if(gs('beltNeg')){for(const E of liveFoes())for(let i=0;i<gs('beltNeg');i++){const[k,nm,v]=pick(NEGS);a2Hit(k,v,E);clog(`견습생의 공구띠: ${E.name}에게 ${nm} ${v}`)}}
  /* 특허 · 계약 파기 */
  C.patent={};C.patentFree=r.flags.patentFree||null;
}
function a2EnergyMod(){const C=S.C;let e=C.threadDraw||0;if(C.pCool)e-=C.pCool;if(C.art)e+=C.art;if(masterOn())e+=2;if(C.turn===1&&eq('u_boiler'))e+=2;return e}
function a2AfterDraw(){const C=S.C,r=S.run;
  {const cd=liveFoes().find(f=>f.key==='cadet');if(cd&&cd.hp<=cd.maxHp*.7&&!C.hand.some(c=>c.id==='persuade'||c.id==='opinion')){const id=(C.art||0)>0?'opinion':'persuade';C.hand.push({uid:UID++,id,temp:true});clog(`견습생이 흔들린다 — 패에 ${CARDS[id].name}`,'h')}}
  let more=(C.threadDraw||0)+(C.art||0)+(masterOn()?3:0)+(C.turn===1&&eq('u_memo')?2:0);if(more)drawN(more);
  if(C.drawMinus){const n=Math.min(C.drawMinus,C.hand.length);for(let i=0;i<n;i++){const c=C.hand.pop();if(c)C.draw.push(c)}clog(`해설: 드로우 -${n}`);C.drawMinus=0}
  if(C.pFrozen&&C.turn>=C.pFrozenTurn){toast('냉동','이번 턴에는 행동할 수 없다 — 턴을 끝낸다');clog('냉동: 이번 턴 행동 불가')}
  /* 체온 유지 (지속) */
  for(let i=0;i<(C.keepWarm||0);i++){if(C.pCool>0)C.pCool--;gainBlock(rollDie(D(35,50)),0,'체온 유지')}
  /* 냉각 코일 */
  if(gs('coil')&&(C.pSteam||0)>=10){C.pSteam-=10;a2Hit('cool',2);clog('냉각 코일: 증기 -10, 대상에게 냉매 2')}
  if(liveFoes().some(f=>f.key==='guard'))redefine(2+(C.redefMore||0)),C.redefMore=0;
}
/* 턴 시작 (코스트 계산 전) — 냉매 감소, 열기 감소 */
function a2TurnStart(){const C=S.C;if(C.coldAuto&&alive(C.E))a2Hit('cool',C.coldAuto);if(C.foodAuto)foodGain(null,C.foodAuto,true);if(eq('own_kr')&&C.turn>=3)gainBlock(15,0,'오래된 근속 배지');if(C.pCool>0)C.pCool--;foodTurn(null,true);if(C.pCrack&&C.turn>(C.pCrackT||0)+1)C.pCrack=0}
/* 턴 종료 — 증기→열기, 작품 준비, 도망(적), 기록 */
async function a2EndTurn(){const C=S.C,r=S.run;
  /* 플레이어: 열기 감소 → 증기 10 이상이면 열기 +1 */
  if(C.steamArmor&&C.pSteam>=5)gainBlock(Math.floor(C.pSteam/5)*20*C.steamArmor,0,'증기 갑주');
  if(C.heat&&!gs('heatKeep')&&!C.heatHold){const keep=C.heatGain||0;C.heat=Math.max(Math.min(C.heat,keep),C.heat-1)}C.heatGain=0;
  if((C.pSteam||0)>=10){C.pSteam-=10;C.heat=Math.min(heatCap(true),(C.heat||0)+1);C.heatGain=1;fxAt('player','증기 10 → 열기 +1','info');clog('증기 10 소모 → 열기 +1')}
  /* 감정서: 패에 작품-준비가 있으면 턴마다 50% 확률로 패에 들어옴 */
  if(C.hand.some(c=>c.id==='art_wip')&&!C.hand.some(c=>c.id==='a2_cert')&&rnd()<.5){C.hand.push({uid:UID++,id:'a2_cert',temp:true});clog('감정서가 패에 들어왔다')}
  /* 작품 준비 → 작품-완성 */
  const wips=[...C.hand,...C.draw,...C.disc].filter(c=>c.id==='art_wip');
  for(const w of wips){if(rnd()<.05+rnd()*.15){for(const a of[C.hand,C.draw,C.disc]){const i=a.indexOf(w);if(i>=0)a.splice(i,1)}C.exh.push(w);C.hand.push({uid:UID++,id:'art_done',temp:true});C.master=true;toast('작품-완성','공격 위력 +200% · 드로우 +3 · 코스트 +2');clog('작품 준비 → 작품-완성')}}
  if(C.pFrozen&&C.turn>=C.pFrozenTurn){C.pFrozen=false;clog('냉동이 풀렸다')}
  C.redef={};
  /* 기입관: 그 턴에 가장 많이 쓴 카드 → 다음 1턴 잠김 */
  jcEndTurn();
  C.kindUse={};C.nullKinds=null;
  /* 적: 도망 (턴 종료 시 체력 50% 이하) */
  for(const E of liveFoes()){if((E.key==='cultist'||E.key==='poor')&&!E.noFlee&&E.hp<=E.maxHp*.5){
    if(E.key==='cultist'&&S.run.sit&&!sitSeen('flee')){sitMark('flee');await sitFlee(E)}
    E.fled=true;C.fledAny=true;clog(`${E.name} 도망침`,'e');await fleeAnim(E);toast(E.key==='poor'?'발악':'점조직',`${E.name}이(가) 도망쳤다`)}}
  if(!liveFoes().length){winCombat({fled:true});return true}
  if(!alive(C.E))C.E=liveFoes()[0];
  return false;
}
/* 적의 턴 시작·끝 (그 적이 C.E일 때) */
function a2EnemyTurnStart(E){
  if(E.key==='craftsman'){E.steam=(E.steam||0)+4;clog('장인의 방식: 증기 +4','e')}
  if(E.frozen){E.frozen=false;E.frozeSkip=true}
}
function a2EnemyTurnEnd(E){const C=S.C;
  if(E.heat){const keep=E.heatGain||0;E.heat=Math.max(Math.min(E.heat,keep),E.heat-1)}E.heatGain=0;
  if((E.steam||0)>=10){E.steam-=10;const cap=heatCap(false);E.heat=Math.min(cap,(E.heat||0)+1);E.heatGain=1;clog(`${E.name}: 증기 10 소모 → 열기 +1`,'e')}
  if(E.cool>0)E.cool--;
  if(E.crack&&C.turn>(E.crackT||0))E.crack=0;
  foodTurn(E,false);
  if(E.wipT!=null){if(rnd()<.05+rnd()*.15){E.wipT=null;E.done=true;toast('작품 완성',`${E.name}의 공격 위력 +200%`);clog('작품 완성: 이후 공격 위력 +200%','e')}}
}
/* 적의 행동 기록 (수석 해설사: 같은 행동 3연속마다 예술적 감각 +1) */
function a2AfterAct(E,name){
  if(E.key==='weaver'||E.key==='keeper'){const pv=E.prevAct;E.prevAct=name;if(pv&&(E.key==='keeper'?pv===name:pv!==name)&&name!=='견해 묻기'&&E.wipT==null&&!E.done){E.art=(E.art||0)+1;const pn=E.key==='keeper'?'고증':'짜임새';fxAt('enemy',`${pn} · 예술적 감각 ${E.art}`,'info');clog(`${pn}: 예술적 감각 ${E.art}`,'e');
    if(E.art>=3){E.art=0;E.wipT=2;toast('작품 준비',`${E.name}이(가) 작품을 짜기 시작했다`)}}return}
  if(E.key!=='docent')return;E.seq=E.seq||{last:null,n:0};if(E.seq.last===name)E.seq.n++;else{E.seq.last=name;E.seq.n=1}
  if(E.seq.n>=3){E.seq.n=0;E.art=(E.art||0)+1;fxAt('enemy',`예술적 감각 ${E.art}`,'info');if(E.art>=3&&E.wipT==null&&!E.done){E.art=0;E.wipT=2;toast('작품 준비',`${E.name}이(가) 작품을 만들기 시작했다`)}}}
/* 견해 묻기 (V28) — 방직파 직조공이 전투에 한 번 묻는 선택지
   1 뿔: 전투 지속 / 2 평평한 곳: 예술적 감각 3 이상이거나 작품(작품 준비 · 작품-완성 카드, 또는 상대의 작품)이 있으면 처치 없이 전투 종료(실링만, 경험치 · 장비 탈취 없음)
   3 질문: 상대가 예술적 감각을 전부 소모해 분노 — 소모한 1당 공격 위력 +30% (0이어도 +30%) */
const VIEW_Q={
  weaver:{q:'이 실을 어디에다가 연결하는 게 좋을까요? 이방인인 당신에게는, 이 작품을 어디에 연결하는 것이 가장 아름다울까요?',
    c:[{b:'뿔처럼 보이는 곳을 가리킨다',r:'…나쁘지 않네요.',fx:'go'},
       {b:'평평한 곳에 줄을 박아 넣으라 지시한다',need:'art',r:'해-를리그, 당신도 그렇게 생각하는군요.',rf:'…글쎄요. 그건 아직 모르겠네요.',fx:'spare'},
       {b:'예술가이면서 남의 시선에 의존하는 거냐며 질문한다',r:'포르네르멜세, 이방인이 뭘 알겠어요.',fx:'rage'}]},
  keeper:{q:'자네에게 엄청나게 강한 유물을 얻을 기회가 있다면, 대가를 치르더라도 사용하겠나?',
    c:[{b:'사용한다',r:'대가는 그대의 목숨이라네.',fx:'doom'},
       {b:'사용하지 않겠다고 한다',r:'유물을 얻을 수 있는데 그 귀한 기회를 걷어차다니, 어리석군.',fx:'go'},
       {b:'얻기만 하고 사용하지 않겠다',need:'block50',hide:true,r:'…!',fx:'stun'}]}};
const viewArtOk=E=>{const C=S.C;return(C.art||0)>=3||C.hand.some(c=>c.id==='art_wip'||c.id==='art_done')||masterOn()||E.wipT!=null||!!E.done};
function askView(E){const C=S.C,V=VIEW_Q[E.key];if(!V||E.asked)return;E.asked=true;
  return new Promise(res=>{const m=$('#modal'),ok=viewArtOk(E),okB=(C.block||0)>=50,need=o=>o.need==='block50'?okB:ok;m.hidden=false;S.modalLock=true;
    m.innerHTML=`<div class="panel viewask"><div class="ptitle">견해 묻기</div><div class="psub">${E.name}</div><p class="vq">「${V.q}」</p>
      <div class="vopts">${V.c.map((o,i)=>o.hide&&!need(o)?'':`<button class="plate-btn vopt" data-view="${i}">${o.b}${o.need==='art'?`<span class="vneed ${ok?'ok':'ng'}">예술적 감각 3 이상 또는 작품 · ${ok?'충족':'미충족'}</span>`:''}</button>`).join('')}</div></div>`;
    m.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{const o=V.c[+b.dataset.view];closeModal();
      if(o.fx==='stun'){say(o.r);clog(`견해 — ${o.b}: 「${o.r}」`,'e');E.stun=true;fxAt('enemy','말문이 막힘 · 다음 행동 취소','info');toast('…!',`${E.name}이(가) 말문이 막혀 다음 행동을 하지 못한다`);renderCombat();return res()}
      if(o.fx==='spare'&&!ok){say(o.rf);clog(`견해 — ${o.b}: 「${o.rf}」 (조건 미충족, 전투 지속)`,'e');return res()}
      say(o.r);clog(`견해 — ${o.b}: 「${o.r}」`,'e');
      if(o.fx==='spare'){E.fled=true;E.spared=true;toast('견해',`${E.name}이(가) 붓을 거두었다 — 처치하지 않고 끝남`);
        if(!liveFoes().length)winCombat({});else{C.E=liveFoes()[0];renderCombat()}}
      if(o.fx==='doom'){const r=S.run,n=Math.round(r.maxHp*.3);r.hp-=n;fxAt('player',`단죄 -${n}`,'self t2');flashHurt(true);toast('단죄',`대가 — 체력 -${n} (최대 체력 30%, 방어도 무시)`);clog(`단죄: 최대 체력 30% 트루 데미지 -${n}`,'e');renderCombat();if(r.hp<=0){r.hp=0;setTimeout(gameOver,400)}}
      if(o.fx==="rage"){const n=E.art||0;E.art=0;E.prevAct=null;const k=1+.3*Math.max(1,n);E.rage=(E.rage||1)*k;E.dmgMul=Math.round((E.dmgMul||1)*k*100)/100;
        fxAt('enemy',`분노 · 위력 +${Math.round((k-1)*100)}%`,'info');toast('분노',`${E.name}이(가) 예술적 감각 ${n}을(를) 모두 태워 분노했다 — 공격 위력 +${Math.round((k-1)*100)}%`);renderCombat()}
      res()})})}
/* 적이 쓰러질 때 — 남은 적이 있으면 대상만 바꿈 */
function foeDown(E){const C=S.C;if(E.dead)return false;if(E.dummy&&S.run&&S.run.train){E.hp=E.maxHp;E.block=0;fxAt('enemy','복구','heal');renderCombat();return false}E.dead=true;$('#enemy').classList.add('dead');
  if(E.boss&&C.foes&&C.foes.some(f=>f.knight)){C.foes=C.foes.filter(f=>!f.knight);clog('에인헤랴르가 물러난다','e')}
  const left=liveFoes();if(!left.length){winCombat({});return true}
  clog(`${E.name} 쓰러짐`,'h');toast('처치',`${E.name}`);
  setTimeout(()=>{if(S.C===C&&!C.over){$('#enemy').classList.remove('dead');C.E=alive(C.E)?C.E:liveFoes()[0];renderCombat()}},REDUCED?60:420);return true}
/* 공무원 '정의' (체력 50% 이하) */
function clerkCheck(E){return;/* V2.29.48.12: 정의(특성 바꾸기) 삭제 */
  const C=S.C,r=S.run;if(E.key!=='clerk'||E.defined||E.hp>E.maxHp*.5||E.hp<=0)return;E.defined=true;E.phase=2;E.idx=0;
  const negs=Object.keys(PTRAIT).filter(k=>PTRAIT[k].c<0&&!PTRAIT[k].hide&&!r.traits.includes(k));const nk=pick(negs);
  if(r.traits.length){const i=Math.floor(rnd()*r.traits.length);C.defOrig={i,k:r.traits[i]};r.traits[i]=nk;toast('정의',`자명종이 다시 정의했다 — 「${PTRAIT[C.defOrig.k].n}」 → 「${PTRAIT[nk].n}」 (이번 전투)`)}
  else{C.defAdd=nk;r.traits.push(nk);toast('정의',`자명종이 다시 정의했다 — 「${PTRAIT[nk].n}」 (이번 전투)`)}
  clog('정의: 페이즈 2 — 정정 → 삭제','e');E.intent='정정';foeRedeal(E);E.hand.unshift('정정')}
function a2CombatEnd(C){const r=S.run;if(!C||C.endDone)return;C.endDone=true;
  if(C.foodAdd){r.maxHp-=C.foodAdd;r.hp=Math.min(r.hp,r.maxHp);C.foodAdd=0}
  if(C.defOrig){r.traits[C.defOrig.i]=C.defOrig.k}if(C.defAdd){const i=r.traits.indexOf(C.defAdd);if(i>=0)r.traits.splice(i,1)}
  if(C.mealAtk){r.atk-=C.mealAtk;r.def-=C.mealAtk;C.mealAtk=0}
}
/* 카드를 쓴 뒤 (특허·예술적 감각·기록·음식) */
function a2AfterPlay(c,d){const C=S.C,r=S.run;C.lastCardId=c.id;
  if(liveFoes().some(f=>f.key==='examiner')&&C.patentFree!==c.uid){C.patent[c.id]=(C.patent[c.id]||0)+1;if(C.patent[c.id]===2){toast('특허',`「${d.name}」에 특허가 걸렸다 — 이후 사용할 때마다 10000실링`);clog(`특허: 「${d.name}」`,'e')}}
  artTrack(c.id);
  const k=cardKind(d);if(k){C.kindUse=C.kindUse||{};C.kindUse[k]=(C.kindUse[k]||0)+1}
}
/* 카드 효과 (2장 공방 카드 · 토르 카드) — playCardRaw의 switch에서 부름 */
async function a2CardFx(c,ctx){const C=S.C,r=S.run,E=C.E;
  if(CARDS[c.id].fx)await CARDS[c.id].fx(c,ctx);
  switch(c.id){
    case's2_vent':{const n=C.pSteam||0;C.pSteam=0;if(n)gainBlock(n*20,0,`압력 배출 (증기 ${n} × 20)`);break}
    case's2_over':a2Give('steam',10);break;
    case's2_valve':a2Hit('cool',3);C.pSteam=Math.max(0,(C.pSteam||0)-10);C.energy+=1;break;
    case'k2_spray':a2Hit('cool',3);break;
    case'k2_warm':C.pCool=0;C.pFrozen=false;C.energy+=1;break;
    case'k2_keep':C.keepWarm=(C.keepWarm||0)+1;break;
    case'a2_stand':C.artOn=true;artAdd(1);break;
    case'a2_talk':C.talkDisc=(C.talkDisc||0)+2;break;
    case'a2_cert':{const w=C.hand.find(x=>x.id==='art_wip');if(!w){clog('감정서: 패에 작품-준비가 없다 — 변화 없음');break}
      if(rnd()<.5){C.hand.splice(C.hand.indexOf(w),1);C.exh.push(w);C.hand.push({uid:UID++,id:'art_done',temp:true});C.master=true;toast('감정서','작품-준비 → 작품-완성');clog('감정서: 작품-준비 → 작품-완성')}else{toast('감정서','실패 — 변화 없음');clog('감정서: 실패, 변화 없음')}break}
    case'a2_copy':{const sp=[...C.draw,...C.disc].filter(x=>CARDS[x.id].rar==='special'&&!CARDS[x.id].unplayable);if(!sp.length){clog('유물 모사화: 덱에 특수무기 카드가 없다');toast('유물 모사화','덱에 특수무기 카드가 없다');break}
      const s=pick(sp),t={uid:UID++,id:s.id,mods:[],temp:true,free:true};C.hand.push(t);clog(`유물 모사화: 「${CARDS[s.id].name}」의 효과를 그대로 발동`);await playCardRaw(t.uid,{noTick:true});break}
    case'r2_tea':C.energy+=2;break;
    case'r2_meal':r.atk+=15;r.def+=15;C.mealAtk=(C.mealAtk||0)+15;fxAt('player','공·방 +15','info');break;
    case'm2_bolt':a2Hit('el',1);break;
    case'm2_burn':a2Hit('burn',5);break;
    case'm2_proto':for(let i=0;i<3;i++){const[k,nm,v]=pick(NEGS);a2Hit(k,v);fxAt('enemy',`${nm} ${v}`,'info')}break;
    /* 토르 (묠니르) — 등반 신화 빌드 */
    case't_swing':C.energy+=1;break;
    case't_fist':drawN(1);break;
    case't_throw':C.thrown=true;thorSwap();C.hand.push({uid:UID++,id:'t_recall',temp:true});break;
    case't_recall':C.thrown=false;thorSwap();drawN(1);break;
    case't_hunt':if(ctx.killed){C.yu=Math.min(5,C.yu+1);C.energy+=1;toast('사냥','유희 +1, 코스트 1 반환')}break;
    case't_bolt':{/* 즉시 전격을 발동(소모)시키고 전격 1당 최대 체력의 10%(최대 100%, 보스 5%·50%) — 명중률 무시, 마비 50% */
      const W=weightTargets(c);for(const f of W.tg){if(C.over||!alive(f))continue;const n=f.el;if(!n){fxAt('enemy','전격 없음','miss');continue}f.el=0;const bt=f.tier==='boss',per=bt?.05:.1,cap=bt?.5:1;const dmg=Math.round(f.maxHp*Math.min(cap,n*per));
        const pv=C.E;C.E=f;fixedDmg(dmg,'전격',true);if(!C.over&&alive(f)&&rnd()<.5){f.para=1;fxAt('enemy','마비','info')}if(!C.over&&alive(pv))C.E=pv}
      drawN(1);C.energy+=1;break}
    /* V32 오딘 (궁니르) — 등반 신화 빌드 */
    case'o_mimir':drawN(4);C.energy+=2;C.evaB=(C.evaB||0)-999;fxAt('player','이번 턴 회피 불가','info');break;
    case'o_shard':{const nx=C.hand.find(x=>x.id==='o_shard'&&x.uid!==c.uid);
      if(nx){clog('파편: 패에 파편이 있어 재사용');if(!C.over)await playCardRaw(nx.uid,{noTick:true})}
      else{let n=0;for(const x of r.deck)if(x.id==='o_shard'){x.id=pick(['o_mark','o_pierce']);n++}for(const a of[C.draw,C.disc])for(const x of a)if(x.id==='o_shard')x.id=pick(['o_mark','o_pierce']);if(n){clog(`파편: 패에 파편이 없어 덱의 파편 ${n}장이 무작위 투척 카드로 바뀜`);toast('파편','파편이 투척 카드로 돌아왔다')}}break}
    case'o_recall':{const f=C.E;if(alive(f)&&f.mark){const m=f.mark,bt=f.tier==='boss',per=bt?.025:.05,cap=bt?.25:.5;fixedDmg(Math.round(f.maxHp*Math.min(cap,m*per)),'궁니르-회수',true);f.mark=0;
        let back=0;for(let i=0;i<m;i++){let x=C.disc.find(y=>y.id==='o_mark'),from=C.disc;if(!x){x=C.draw.find(y=>y.id==='o_mark');from=C.draw}if(!x)break;from.splice(from.indexOf(x),1);C.hand.push(x);back++}
        if(back)toast('궁니르-회수',`투척-명중 ${back}장을 돌려받았다`)}break}
    case'o_shatter':{const f=C.E;const m=alive(f)?(f.mark||0):0;if(m){const per=Math.round(m*15/5);for(let i=0;i<5&&!C.over&&alive(f);i++)fixedDmg(per,'궁니르-파쇄',true);f.mark=0}else fxAt('enemy','궁니르-명중 없음','miss');
      const isT=x=>x.id==='o_mark'||x.id==='o_pierce';if(r.deck.some(isT)){r.deck=r.deck.filter(x=>!isT(x));for(const a of[C.hand,C.draw,C.disc]){for(let i=a.length-1;i>=0;i--)if(isT(a[i]))a.splice(i,1)}for(let i=0;i<5;i++){const n=addToDeck('o_shard');C.disc.push({uid:n.uid,id:n.id})}toast('궁니르-파쇄','투척 카드가 파편 5장이 되었다')}break}
  }
  if(d2food(c)){foodGain(null,d2food(c),true);if(gs('foodBlock'))gainBlock(gs('foodBlock'),0,'배식 국자')}
}
const d2food=c=>CARDS[c.id].food||0;
function thorSwap(){const C=S.C;for(const a of[C.hand,C.draw,C.disc])for(const c of a){if(C.thrown&&c.id==='t_swing')c.id='t_fist';else if(!C.thrown&&c.id==='t_fist'&&!c.temp)c.id='t_swing'}}

/* ================= 도망치기 (플레이어) — 1턴 소모 후 판정, 성공하면 보상 없이 도망 (노드는 미개척), 실패하면 그 턴만 상대 카드 값 2배 · 정예·보스는 불가 =================
   성공률 = 100 − ((상대 명중 − 20) − ((내 회피 + 20) − 50)) — 두 값을 합치는 식은 문서에 없어 적중률 공식을 뒤집어 씀 (임시), 5~95% */
function fleeChance(){const C=S.C;const acc=Math.max(...liveFoes().map(f=>{const pv=C.E;C.E=f;const a=enemyAcc();C.E=pv;return a}));
  return clamp(Math.round(100-((acc-20)-((pEva()+20)-50))),5,95)}
function canFlee(){const C=S.C;if(S.run&&S.run.train)return false;if(C&&C.atInfo&&C.atInfo.spar)return!C.over;return!!(C&&!C.over&&!C.noFlee&&!(C.E&&C.E.rift)&&liveFoes().every(f=>f.tier==='normal')&&!C.rush&&!S.tb&&!S.run.tutB)}
function fleeTry(){const C=S.C;if(!canFlee()||C.phase!=='player'||S.busy||C.select)return;
  if(C.atInfo&&C.atInfo.spar)return confirmBox('대련을 그만둘까요?','보상 없이 대련장을 나간다. 깎인 체력은 그대로 남는다.','그만둔다',sparLeave);
  confirmBox('도망칠까요?',`이번 턴을 쓰고 주사위를 굴린다. 성공 ${fleeChance()}% — 성공하면 보상 없이 도망치고 이 막은 미개척으로 남는다. 실패하면 이번 턴 상대 카드 값이 2배가 된다.`,'도망친다',()=>{C.fleeTry=true;endTurn()})}
function fleeResolve(){const C=S.C;if(!C.fleeTry)return false;C.fleeTry=false;const ch=fleeChance(),roll=ri(1,100),ok=roll<=ch;
  clog(`도망치기 · 성공률 ${ch}% · 판정 ${roll} → ${ok?'성공':'실패'}`,'h');
  if(!ok){C.fleeX=2;toast('도망 실패','이번 턴 상대 카드 값 2배');return false}
  toast('도망쳤다','보상 없이 빠져나왔다');C.over=true;C.phase='over';S.busy=false;a2CombatEnd(C);const r=S.run;
  setTimeout(()=>{hideCombatUI();r.next=null;
    if(r.act===2){r.at=null;save();showMap()}
    else{const M=r.map,u=r.mapUndo;if(u){M.row=u.row;M.path.pop();M.opts=u.opts;M.shops=u.shops;r.floor=u.floor}r.at=null;save();showMap()}},REDUCED?60:500);return true}

/* ================= 난이도 (문서: 난이도) — 적 1레벨 기준 체력·공방렙 보정, 얻는 돈 ================= */
const diffEm=()=>{const D=CDIFF[(S.run&&S.run.diff)||'easy'];return D?D.em:1};
const diffGm=()=>{const D=CDIFF[(S.run&&S.run.diff)||'easy'];return D?D.gm:1};

