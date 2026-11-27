"use strict";
/* ================= 튜토리얼 — 세계수 등반 첫 런의 첫 전투에서만 (설정에서 다시 보기) ================= */
/* ================= 튜토리얼 (V2.34.68.19) — 문서 화면과 튜토리얼 탭 =================
   기초 튜토리얼: 세계수 등반을 누를 때마다 진행할지 물음, 네를 고르면 특성·덱 없이 튜토리얼 전용 주인공·덱·적, 전투 2번
     (전투 1 내가 때리는 법과 버프, 전투 2 적이 나를 때리는 방법), 패·뽑는 순서·주사위·적의 행동 전부 고정
   상황 튜토리얼: 튜토리얼 진행에 네를 고른 판에서만, 그 상황이 처음 생길 때 한 번씩
   보여 주는 방식: 설명하는 줄은 그 자리만 반짝이고 작은 글상자, 눌러야 하는 곳은 그곳만 반짝이고 나머지는 어둡게, 지시하는 글은 쓰지 않음 */
const TB_KEY='ash-midgard-basic-v1',SIT_KEY='ash-midgard-sit-v1';
const tutDone=()=>{try{return localStorage.getItem(TB_KEY)==='1'}catch(e){return false}};
const setTutDone=v=>{try{if(v)localStorage.setItem(TB_KEY,'1');else{localStorage.removeItem(TB_KEY);localStorage.removeItem(SIT_KEY);Object.values(GUIDES).forEach(g=>localStorage.removeItem(g.key))}}catch(e){}};
const sitSeen=k=>{try{return!!JSON.parse(localStorage.getItem(SIT_KEY)||'{}')[k]}catch(e){return true}};
const sitMark=k=>{try{const o=JSON.parse(localStorage.getItem(SIT_KEY)||'{}');o[k]=1;localStorage.setItem(SIT_KEY,JSON.stringify(o))}catch(e){}};
const sitReset=()=>{try{localStorage.removeItem(SIT_KEY)}catch(e){}};
const tutOn=()=>!!S.tb;
const tbStep=()=>S.tb&&S.tb.list[S.tb.i];
const TB_MIN=1200,TB_DELAY={played:1000,turn:900,ap0:600,end:300};
/* 화면에서 짚을 곳 */
const TH={
  card:id=>{if(!S.C)return null;for(const el of handEls.values()){const c=el._uids&&S.C.hand.find(x=>x.uid===el._uids[0]);if(c&&c.id===id&&!el._fuse)return el}return null},
  q:(id,sel)=>{const el=TH.card(id);return el&&el.querySelector(sel)},
  ln:(id,re)=>{const el=TH.card(id);return el&&[...el.querySelectorAll('.face.back .ln')].find(x=>re.test(x.textContent))},
  mp:k=>document.querySelector(`#modal [data-st="${k}"]`),
  pas:k=>document.querySelector(`#modal [data-pas="${k}"]`),
  chip:re=>[...document.querySelectorAll('#ppanel .chip')].find(x=>re.test(x.textContent.trim())),
  orbs:()=>$('#ppanel .eorbs')||$('#ppanel .orb'),
};
function tbRect(el){const o=stage.getBoundingClientRect(),a=el.getBoundingClientRect(),sc=S.scale||1;return{x:(a.left-o.left)/sc,y:(a.top-o.top)/sc,w:a.width/sc,h:a.height/sc}}
const tbEls=st=>{if(!st||!st.hl)return[];let v=st.hl();if(!Array.isArray(v))v=[v];return v.filter(Boolean)};
/* 누를 곳은 황금빛 파문 — 누르기는 그 자리에서 퍼지고, 끌기는 카드에서 적으로 금빛 점이 건너가 다시 퍼짐, 지시는 글로 쓰지 않음 */
let tbRpKey='',tbRpHtml='';
function tbRipple(st,rs,pad){const R=r=>({x:r.x-pad,y:r.y-pad,w:r.w+pad*2,h:r.h+pad*2}),box=r=>`left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px`;
  const drag=stage.classList.contains('tbdrag'),act=['click','flip','play','end'].includes(st.m);let h='';
  if(!act)h=rs.map(r=>`<i class="tbmark" style="${box(R(r))}"></i>`).join('');
  else if(st.m==='play'&&rs.length>1&&!drag){const a=R(rs[0]),b=R(rs[1]),ax=a.x+a.w/2,ay=a.y+a.h/2,bx=b.x+b.w/2,by=b.y+b.h/2;
    h=`<i class="tbmark" style="${box(a)}"></i><b class="tbrp d0" style="${box(a)}"></b><s class="tbdot" style="left:${ax}px;top:${ay}px;--dx:${bx-ax}px;--dy:${by-ay}px"></s><b class="tbrp d1" style="${box(b)}"></b><em class="tbtap d1" style="left:${bx}px;top:${by}px"></em>`}
  else{const list=st.m==='play'&&drag?rs.slice(1):rs;h=list.map(r0=>{const r=R(r0);return`<i class="tbmark" style="${box(r)}"></i><b class="tbrp" style="${box(r)}"></b><b class="tbrp late" style="${box(r)}"></b><em class="tbtap" style="left:${r.x+r.w/2}px;top:${r.y+r.h/2}px"></em>`}).join('')}
  const key=st.m+(drag?1:0)+h.replace(/\d+(\.\d+)?px/g,m=>Math.round(parseFloat(m)/6)+'');if(key===tbRpKey)return tbRpHtml;tbRpKey=key;tbRpHtml=h;return h}
function tbDraw(){
  let ov=$('#tbov');let st=tbStep();const T=S.tb;
  if(!st||!T.armed||T.paused){if(ov)ov.hidden=true;return}
  if(!ov){ov=document.createElement('div');ov.id='tbov';ov.innerHTML='<svg class="tbdim" preserveAspectRatio="none"><path fill-rule="evenodd"/></svg><div class="tbrings"></div><div class="tbtx"></div>';stage.appendChild(ov)}
  ov.hidden=false;const o=L[S.orient],W=o.W,H=o.H,els=tbEls(st),rs=els.map(tbRect).filter(r=>r.w>0&&r.h>0),pad=8;
  const dim=['click','flip','play','end'].includes(st.m)&&!stage.classList.contains('tbdrag');
  const svg=ov.querySelector('svg');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.style.opacity=dim?1:0;
  svg.querySelector('path').setAttribute('d',`M0 0H${W}V${H}H0Z`+rs.map(r=>`M${r.x-pad} ${r.y-pad}h${r.w+pad*2}v${r.h+pad*2}h${-(r.w+pad*2)}Z`).join(''));
  const rg=ov.querySelector('.tbrings'),rh=tbRipple(st,rs,pad);if(rg._h!==rh){rg._h=rh;rg.innerHTML=rh}
  const tx=ov.querySelector('.tbtx');
  const rdy=st.m==='say'&&Date.now()-T.at>=TB_MIN;tx.classList.toggle('ready',rdy);tx.classList.toggle('empty',st.m==='say'&&!st.t);
  if(st.m==='say'&&!st.t&&rs.length){tx.hidden=false;tx.dataset.t='';tx.textContent='';const r=rs[0];tx.style.width='48px';tx.style.left=clamp(r.x+r.w+12,10,W-60)+'px';tx.style.top=clamp(r.y+r.h/2-20,64,H-60)+'px'}
  else if(st.t&&rs.length){tx.hidden=false;if(tx.dataset.t!==st.t){tx.dataset.t=st.t;tx.textContent=st.t}
    const host=els[0].closest&&(els[0].closest('.card.zoom')||els[0].closest('#modal .fpanel'));
    const u=rs.reduce((a,r)=>({x:Math.min(a.x,r.x),y:Math.min(a.y,r.y),x2:Math.max(a.x2,r.x+r.w),y2:Math.max(a.y2,r.y+r.h)}),{x:1e9,y:1e9,x2:-1e9,y2:-1e9}),r={x:u.x,y:u.y,w:u.x2-u.x,h:u.y2-u.y};
    let tw=Math.min(560,W-40),x,y;tx.style.width=tw+'px';let th=tx.offsetHeight||70;
    if(host){const hr=tbRect(host);tw=Math.min(440,W-40);tx.style.width=tw+'px';th=tx.offsetHeight||70;
      if(hr.x-tw-28>=16){x=hr.x-tw-28;y=r.y+r.h/2-th/2}else if(hr.x+hr.w+28+tw<=W-16){x=hr.x+hr.w+28;y=r.y+r.h/2-th/2}else{x=clamp(hr.x+hr.w/2-tw/2,20,W-tw-20);y=hr.y-th-16}}
    else{x=clamp(r.x+r.w/2-tw/2,20,W-tw-20);y=r.y+r.h/2>H*.55?r.y-pad-th-14:r.y+r.h+pad+14}
    y=clamp(y,64,H-th-12);tx.style.left=x+'px';tx.style.top=y+'px'}
  else if(st.t){tx.hidden=false;tx.textContent=st.t;tx.dataset.t=st.t;tx.style.left=(W/2-260)+'px';tx.style.top=(H*.42)+'px';tx.style.width='520px'}
  else tx.hidden=true;
}
setInterval(()=>{if(S.tb)tbDraw()},120);
/* 다음 단계로 */
async function tbNext(){const T=S.tb;if(!T)return;const cur=T.list[T.i];
  if(cur&&cur.post)try{await cur.post()}catch(e){console.error(e)}
  if(cur&&cur.release&&T.hold){const h=T.hold;T.hold=null;h()}
  T.i++;T.armed=false;T.lock=false;tbDraw();const st=T.list[T.i];
  if(!st){S.tb=null;tbDraw();if(T.end)T.end();return}
  if(st.pre)try{await st.pre()}catch(e){console.error(e)}
  if(S.tb!==T||T.list[T.i]!==st)return;
  T.armed=true;T.at=Date.now();tbDraw();
  if(st.m==='auto')setTimeout(()=>{if(tbStep()===st&&S.tb.armed)tbNext()},st.ms||1800);
  const fv=T.fired&&T.fired[st.w];if(st.w&&fv&&(!st.id||fv===1||fv===st.id)){T.fired={};T.armed=false;setTimeout(()=>{if(tbStep()===st)tbNext()},st.delay||TB_DELAY[st.w]||400)}}
function tbStart(list,o={}){S.tb={list,i:-1,fired:{},...o};tbNext()}
/* 게임에서 일어난 일을 알림 — 지금 단계가 기다리던 일이면 다음으로 */
function tbEv(ev,x){const T=S.tb;if(!T)return;const st=tbStep();
  if(st&&T.armed&&st.w===ev&&(!st.id||x===undefined||st.id===x)){T.armed=false;T.fired={};setTimeout(()=>{if(tbStep()===st)tbNext()},st.delay||TB_DELAY[ev]||400);return}
  if(st&&!T.armed)(T.fired||(T.fired={}))[ev]=x||1}
const tutEvent=ev=>tbEv(ev);
/* 행동 포인트 0 — 설명을 다 볼 때까지 적의 행동을 멈춤 */
function tbHold(g){const T=S.tb;if(!T)return Promise.resolve();const k=T.list.findIndex((x,j)=>j>=T.i&&x.w===g);if(k<0||k>T.i+1)return Promise.resolve();return new Promise(res=>{T.hold=res;tbEv(g)})}
/* 눌러도 되는 곳 */
function tbAllow(e){const T=S.tb,st=tbStep();if(!T||T.paused)return true;if(e.target.closest&&e.target.closest('#menuBtn'))return true;
  if(!st||!T.armed||T.lock)return false;if(st.m==='free')return true;if(['say','auto','wait'].includes(st.m))return false;
  return tbEls(st).some(el=>el.contains(e.target))||(st.m==='play'&&e.target.closest&&e.target.closest('#enemy'))}
function tutLocked(act,c){const T=S.tb,st=tbStep();if(!T||T.paused)return false;if(!st||!T.armed||T.lock)return true;if(st.m==='free')return false;
  if(act==='end')return st.m!=='end';if(act==='node')return true;
  if(act==='drag')return st.m!=='play';
  if(act==='card')return!(st.m==='flip'||st.m==='play')||(st.id&&c&&c.id!==st.id);return true}
for(const k of['pointerdown','click'])window.addEventListener(k,e=>{const T=S.tb;if(!T||T.paused)return;const st=tbStep();
  if(k==='pointerdown'&&st&&T.armed&&st.m==='say'&&Date.now()-T.at>=TB_MIN){e.stopPropagation();e.preventDefault();T.swallow=true;tbNext();return}
  if(k==='click'&&T.swallow){T.swallow=false;e.stopPropagation();e.preventDefault();return}
  if(!tbAllow(e)){e.stopPropagation();e.preventDefault();if(k==='pointerdown')T.swallow=true}},true);
const tutForce=()=>{const T=S.tb;return T&&T.q&&T.q.length?T.q.shift():null};
function tutShow(){if(S.tb)return tbDraw();const ov=$('#tbov');if(ov)ov.hidden=true;guideShow()}
function tutFinish(){S.tb=null;tbDraw()}
/* 카드 뒤집기·카드를 적에게 가져다 대기 */
async function tbFlip(id,on){const el=TH.card(id);if(!el)return;
  if(on){if(!el.classList.contains('flipped')){flipCard(el);await wait(450)}zoomCard(el,true);await wait(700)}
  else{if(el.classList.contains('zoom')){zoomCard(el,false);await wait(260)}if(el.classList.contains('flipped')){flipCard(el);await wait(330)}}}
async function tbAim(id){const el=TH.card(id),C=S.C;if(!el)return;const c=C.hand.find(x=>x.uid===el._uids[0]),o=L[S.orient],cw=16.8*o.cfs,ch=23.6*o.cfs,R=tbRect($('#eart')||$('#enemy'));
  el.classList.add('dragging');el.style.transition='transform .55s ease';el.style.transform=`translate(${R.x+R.w/2-cw/2}px,${R.y+R.h*.62-ch*.55}px)`;$('#enemy').classList.add('target');await wait(650);hpPreview(c,1,C.E);await wait(250)}
function tbUnaim(){document.querySelectorAll('#hand .card.dragging').forEach(el=>{el.classList.remove('dragging');el.style.transition=''});hpPreview(null);$('#enemy').classList.remove('target');layoutHand()}
const tbClose=()=>{closeModal();stSheet(null)};
/* 튜토리얼 전용 주인공·적 */
function tbHero(){const r={mode:'human',act:1,fate:'pick',diff:'easy',lvl:1,exp:0,base1:400,hp:400,maxHp:400,atk:10,def:10,talentBonus:0,acc:70,eva:50,traits:[],talent:0,
  gold:0,deck:[],store:[],map:null,pos:null,floor:0,flags:{kicked:false,events:[]},equip:[],dome:0,kills:0,turns:0,at:null,eatHp:0,weapon:'none',ults:[],tutB:true};
  for(const[id,n]of[['slash',4],['gap',2],['guard',2],['breath',1],['c_stance',1]])for(let i=0;i<n;i++)r.deck.push({uid:UID++,id});ensureGear(r);return r}
const tbDmg=(v,tr)=>formula(v,0,10,tr||[],10).fin;
function tbFoe(n){const E=makeEnemy('priest');Object.assign(E,{traits:[],lv:1,atk:10,def:10,acc:70,eva:50,tut:true,block:0,dmgMul:1,revenge:0});
  if(n===1){E.noAct=true;E.maxHp=tbDmg(75)+tbDmg(60)+tbDmg(95,[{n:'취약',v:.1}])}
  else{E.tbDeck=['훈계','말뿐인 저주','말뿐인 저주','말뿐인 저주','막기','말뿐인 저주','막기','말뿐인 저주','막기','말뿐인 저주','막기','말뿐인 저주'];E.tbCost=3;E.tbDraw=5;E.apBase=3;E.apMax=3;E.maxHp=tbDmg(75)*4}
  E.hp=E.maxHp;return E}
/* 전투 1 — 내가 때리는 법, 버프 */
const TB1=[
  {m:'say',hl:()=>TH.card('slash'),t:'이건 카드입니다.'},
  {m:'say',hl:()=>TH.q('slash','.face.front .cost'),t:'이건 카드를 내는 데 드는 코스트입니다.'},
  {m:'say',hl:TH.orbs,t:'이건 지금 남은 코스트입니다.'},
  {m:'flip',hl:()=>TH.card('slash'),w:'flip'},
  {m:'say',pre:()=>tbFlip('slash',true),hl:()=>TH.q('slash','.face.back .btext'),t:'이건 카드의 효과입니다.'},
  {m:'say',hl:()=>TH.q('slash','.face.back .rng'),t:'이건 공격 위력입니다.'},
  {m:'say',pre:async()=>{await tbFlip('slash',false);await tbAim('slash')},hl:()=>[$('#eplate .ebar'),$('#eplate .hppvt')],t:'이건 상대에게 가할 데미지입니다.',post:tbUnaim},
  {m:'click',pre:()=>wait(350),hl:()=>$('#ppanel'),w:'mePanel'},
  {m:'say',pre:()=>wait(300),hl:()=>TH.mp('atk'),t:'이건 내 공격레벨입니다. 높을수록 데미지가 커집니다.',post:tbClose},
  {m:'click',pre:()=>wait(250),hl:()=>$('#enemy'),w:'foePanel'},
  {m:'say',pre:()=>wait(300),hl:()=>TH.mp('def'),t:'이건 상대의 방어레벨입니다. 높을수록 데미지가 작아집니다.'},
  {m:'say',hl:()=>TH.mp('hit'),t:'이건 적중률입니다. 빗나가면 데미지가 들어가지 않습니다.',post:tbClose},
  {m:'play',pre:async()=>{await wait(250);S.tb.q=[{hit:true}]},hl:()=>[TH.card('slash'),$('#enemy')],id:'slash',w:'played'},
  {m:'say',pre:async()=>{await wait(300);await tbFlip('gap',true)},hl:()=>TH.ln('gap',/적중 시/),t:'이건 적중했을 때만 생기는 효과입니다.',post:()=>tbFlip('gap',false)},
  {m:'say',pre:()=>tbFlip('breath',true),hl:()=>TH.ln('breath',/드로우/),t:'이건 카드를 내기만 하면 생기는 효과입니다.',post:()=>tbFlip('breath',false)},
  {m:'play',pre:()=>{S.tb.q=[{hit:false}]},hl:()=>[TH.card('gap'),$('#enemy')],id:'gap',w:'played'},
  {m:'say',pre:()=>wait(200),hl:()=>$('#enemy'),t:'빗나가서 취약이 붙지 않았습니다.'},
  {m:'play',pre:()=>{S.tb.q=[{hit:true}]},hl:()=>[TH.card('gap'),$('#enemy')],id:'gap',w:'played'},
  {m:'say',pre:async()=>{await wait(300);await tbAim('slash')},hl:()=>[...document.querySelectorAll('#echips .chip')].find(x=>/^취약/.test(x.textContent))||$('#eplate .ebar'),post:tbUnaim},
  {m:'say',pre:()=>wait(300),hl:()=>TH.card('c_stance'),t:'이 카드를 사용하면 힘을 얻습니다.'},
  {m:'play',hl:()=>TH.card('c_stance'),id:'c_stance',w:'played'},
  {m:'click',pre:()=>wait(300),hl:()=>TH.chip(/^힘/),w:'sheet'},
  {m:'say',pre:()=>wait(150),hl:()=>$('#stsheet'),t:'힘은 위력을 높여 줍니다.'},
  {m:'say',hl:()=>$('#stsheet'),t:'위력이 높을수록 상대에게 가하는 데미지가 커집니다.'},
  {m:'say',hl:()=>$('#stsheet'),t:'턴이 끝나면 사라집니다.',post:tbClose},
  {m:'play',pre:()=>{S.tb.q=[{hit:true}]},hl:()=>[TH.card('slash'),$('#enemy')],id:'slash',w:'win'},
];
/* 전투 2 — 적이 나를 때리는 방법 */
const TB2=[
  {m:'click',pre:()=>wait(400),hl:()=>$('#enemy'),w:'foePanel'},
  {m:'say',pre:()=>wait(300),hl:()=>TH.mp('c'),t:'상대도 똑같이 코스트가 있습니다. 덱에서 카드를 뽑아 코스트를 써서 냅니다.',post:tbClose},
  {m:'say',pre:()=>wait(250),hl:()=>$('#eplate .forbs .or.a'),t:'카드를 사용할 때마다 상대의 행동 포인트가 1씩 줄어듭니다.'},
  {m:'play',hl:()=>TH.card('guard'),id:'guard',w:'played'},
  {m:'play',pre:()=>{S.tb.q=[{hit:true}]},hl:()=>[TH.card('slash'),$('#enemy')],id:'slash',w:'played'},
  {m:'play',pre:()=>{S.tb.q=[{hit:true}]},hl:()=>[TH.card('slash'),$('#enemy')],id:'slash',w:'ap0'},
  {m:'say',pre:()=>wait(350),hl:()=>$('#eplate .forbs .or.a'),t:'행동 포인트가 0이 되면 상대는 코스트가 0이 될 때까지 카드를 냅니다.',release:true},
  {m:'wait',w:'played'},
  {m:'say',pre:async()=>{await wait(300);await tbFlip('slash',true)},hl:()=>TH.q('slash','.face.back .rng'),post:()=>tbFlip('slash',false)},
  {m:'say',pre:()=>wait(200),hl:()=>$('#eplate .forbs .or.a'),t:'행동 포인트가 0이 된 뒤에 턴을 종료하면 상대는 한 번 더 행동할 수 있습니다. 행동 포인트가 1 이상일 때 턴을 종료하는 것을 추천합니다.'},
  {m:'click',hl:()=>$('#enemy'),w:'foePanel'},
  {m:'say',pre:()=>wait(300),hl:()=>TH.mp('hand'),t:'이건 적이 낼 카드입니다.'},
  {m:'say',pre:()=>{const b=document.querySelector('#modal .fh[data-n="말뿐인 저주"]'),e=$('#fpEff');if(b)b.classList.add('sel');if(e)e.textContent=`말뿐인 저주 — ${actText('말뿐인 저주')}`;return wait(150)},hl:()=>$('#fpEff'),t:'이건 적의 공격 위력입니다.',post:tbClose},
  {m:'say',pre:()=>wait(250),hl:()=>$('#ppanel .shield'),t:'이건 방어도입니다. 데미지를 먼저 막아 줍니다.'},
  {m:'say',pre:async()=>{openMePanel();await wait(300)},hl:()=>TH.mp('eva'),t:'이건 회피입니다. 높을수록 적의 공격이 빗나갑니다.',post:tbClose},
  {m:'end',pre:()=>wait(250),hl:()=>$('#endTurn'),t:'이건 턴 종료입니다. 누르면 적의 턴이 됩니다.',w:'end'},
  {m:'wait',w:'turn'},
  {m:'free',w:'win'},
];
/* 기초 튜토리얼 시작 — done: 다 끝난 뒤 할 일 */
function tbBasic(done){S.hero0=S.hero;S.run=tbHero();S.tbDone=done;tbBattle(1)}
function tbBattle(n){const r=S.run;r.hp=r.maxHp;S.tbN=n;r.at={kind:'combat',enemy:tbFoe(n)};S.tbHands=n===1?{1:['slash','slash','gap','gap','breath','c_stance']}:{1:['guard','slash','slash','slash'],2:['slash','slash']};
  transition(()=>{resumeAt();setTimeout(()=>tbStart(n===1?TB1:TB2,{kind:'basic'}),700)})}
/* 내 턴 시작 — 패를 정해진 대로 */
function tbTurn(){const C=S.C;if(!S.run||!S.run.tutB||!S.tbHands)return;const h=S.tbHands[C.turn];if(!h)return;C.draw.push(...C.hand);C.hand=h.map(id=>({uid:UID++,id,mods:[]}));C.maxE=C.energy=5}
function tbAfterWin(){const n=S.tbN;S.tb=null;tbDraw();if(n===1)return tbBattle(2);
  setTutDone(true);S.run=null;S.C=null;S.tbHands=null;S.hero=S.hero0;S.hero0=null;const f=S.tbDone;S.tbDone=null;f?f():transition(showClimbPrep)}
/* ================= 훈련장 (V2.35.71.19) — 본 게임과 별개, 모든 카드를 골라 쓰고 쓰러지지 않음 ================= */
const TR_KEY='ash-midgard-train-v1';
const TR_FOES=[['dummy','허수아비'],['priest','노른교 성직자'],['cultist','노르드교 단원'],['inquisitor','이단심문관'],['bishop','순수유물주의자']];
function trState(){if(!S.trS){let o=null;try{o=JSON.parse(localStorage.getItem(TR_KEY)||'null')}catch(e){}S.trS=Object.assign({deck:{},foe:'dummy',inf:true,free:true,f:'전체'},o||{});for(const k in S.trS.deck)if(!CARDS[k])delete S.trS.deck[k]}return S.trS}
const trSave=()=>{try{const T=trState();localStorage.setItem(TR_KEY,JSON.stringify({deck:T.deck,foe:T.foe,inf:T.inf,free:T.free}))}catch(e){}};
const trIds=()=>Object.keys(CARDS).filter(id=>{const d=CARDS[id];return d&&d.name&&!d.unplayable});
const trN=()=>Object.values(trState().deck).reduce((a,b)=>a+b,0);
function openTrain(){const T=trState(),m=$('#modal');m.hidden=false;m.classList.add('scn','scn-dark');
  const ids=trIds().filter(id=>cfPass({id},T.f)),n=trN();
  const dk=Object.entries(T.deck).filter(([,v])=>v>0);
  m.innerHTML=`<div class="panel trn" style="width:min(1300px,100%);height:100%"><div class="maphead"><div><div class="ptitle">훈련장</div><div class="psub">모든 카드를 쓸 수 있고 쓰러지지 않는다 · 카드를 누르면 뒤집힌다</div></div><button class="btn-ghost" id="trBack">처음으로</button></div>
    <div class="trrow"><span class="trlb">상대</span>${TR_FOES.map(([k,v])=>`<button class="cfb${T.foe===k?' on':''}" data-trf="${k}">${v}</button>`).join('')}</div>
    <div class="trrow"><span class="trlb">규칙</span><button class="cfb${T.inf?' on':''}" id="trInf">코스트 무한 · ${T.inf?'켬':'끔'}</button><button class="cfb${T.free?' on':''}" id="trFree">사용 조건 무시 · ${T.free?'켬':'끔'}</button></div>
    <div class="trrow trdeck"><span class="trlb">덱 ${n}장</span>${dk.length?dk.map(([id,v])=>`<button class="trchip" data-trm="${id}">${CARDS[id].name} ×${v}</button>`).join(''):'<span class="hint">아래 카드의 + 를 눌러 넣는다</span>'}</div>
    <div class="trrow">${cfBar(T.f)}<button class="cfb" id="trStart8">시작 덱</button><button class="cfb" id="trClear">비우기</button><button class="cfb" id="trFxGo">연출 보기</button><button class="plate-btn trgo" id="trGo">훈련 시작</button></div>
    <div class="cardgrid trgrid">${ids.map(id=>`<div class="trcell">${staticCard(id,false)}<div class="trctl"><button data-trm="${id}">−</button><b>${T.deck[id]||0}</b><button data-trp="${id}">+</button></div></div>`).join('')}</div></div>`;
  bindStatic(m);const re=()=>{trSave();const sc=m.querySelector('.trgrid').scrollTop;openTrain();m.querySelector('.trgrid').scrollTop=sc};
  $('#trBack').onclick=()=>{closeModal();showTitle({menu:true})};
  m.querySelectorAll('[data-trf]').forEach(b=>b.onclick=()=>{T.foe=b.dataset.trf;re()});
  $('#trInf').onclick=()=>{T.inf=!T.inf;re()};$('#trFree').onclick=()=>{T.free=!T.free;re()};
  m.querySelectorAll('[data-cf]').forEach(b=>b.onclick=()=>{T.f=b.dataset.cf;re()});
  m.querySelectorAll('[data-trp]').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.trp;T.deck[k]=(T.deck[k]||0)+1;re()});
  m.querySelectorAll('[data-trm]').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.trm;T.deck[k]=Math.max(0,(T.deck[k]||0)-1);if(!T.deck[k])delete T.deck[k];re()});
  $('#trStart8').onclick=()=>{T.deck={};for(const[k,v]of START_DECK)T.deck[k]=v;re()};$('#trClear').onclick=()=>{T.deck={};re()};
  $('#trFxGo').onclick=()=>{closeModal();trStart('inquisitor',trFxPanel)};
  $('#trGo').onclick=()=>{if(!trN())return toast('훈련장','카드를 한 장 이상 넣어야 한다');closeModal();trStart()}}
function trFoe(k){if(k==='dummy'){const E=makeEnemy('priest');Object.assign(E,{name:'허수아비',sub:'',traits:[],noAct:true,dummy:true,maxHp:5000,hp:5000,block:0});return E}const E=makeEnemy(k);E.hp=E.maxHp;return E}
function trStart(fk,then){const T=trState(),r=tbHero();delete r.tutB;r.train=true;r.tInf=T.inf;r.tFree=T.free;r.weapon='n_dagger';r.deck=[];
  for(const[id,v]of Object.entries(T.deck))for(let i=0;i<v;i++)r.deck.push({uid:UID++,id});
  let hp=r.hp;Object.defineProperty(r,'hp',{enumerable:true,configurable:true,get(){return hp},set(v){if(v<1){v=r.maxHp;setTimeout(()=>{if(S.C&&!S.C.over){fxAt('player','회복','heal');toast('훈련장','쓰러지지 않는다 · 체력 회복')}},0)}hp=v}});
  if(!r.deck.length)for(const[id,v]of START_DECK)for(let i=0;i<v;i++)r.deck.push({uid:UID++,id});
  S.run=r;const E=trFoe(fk||T.foe);r.at={kind:'combat',enemy:E};transition(()=>{startCombat(E);trFxBtn();if(then)trWhenReady(then)})}
function trEnd(){const C=S.C;if(C)C.over=true;S.busy=false;hideCombatUI();const m=$('#modal');m.hidden=false;
  m.innerHTML=`<div class="panel" style="width:min(480px,100%)"><div class="ptitle" style="text-align:center">훈련 끝</div><div class="choices"><button class="choice" id="trAgain"><b>다시</b><span>같은 덱과 상대로 한 번 더</span></button><button class="choice" id="trPick"><b>카드 고르기</b><span>훈련장으로</span></button><button class="choice" id="trOut"><b>처음으로</b><span>시작 화면으로</span></button></div></div>`;
  $('#trAgain').onclick=()=>{closeModal();trStart()};$('#trPick').onclick=()=>{closeModal();trLeave(openTrain)};$('#trOut').onclick=()=>{closeModal();trLeave()}}
function trLeave(then){S.run=null;S.C=null;S.busy=false;transition(()=>{showTitle({menu:true});if(then){endTitleScene();then()}})}
/* 훈련장 연출 보기 (V2.35.74.20) — 피해 없이 연출만 다시 본다 */
function trWhenReady(fn,k=0){const C=S.C;if(C&&C.phase==='player'&&!S.busy&&C.E&&C.E.hand&&document.querySelector('#enemy'))return setTimeout(fn,500);if(k<60)setTimeout(()=>trWhenReady(fn,k+1),200)}
function trFxBtn(){let b=$('#trFxBtn');if(!(S.run&&S.run.train)){if(b)b.remove();return}if(!b){b=document.createElement('button');b.id='trFxBtn';b.textContent='연출';stage.appendChild(b);b.onclick=e=>{e.stopPropagation();trFxPanel()}}b.hidden=false}
const TR_FX=[['chime','표식 종소리 Ⅰ→Ⅴ'],['p_exec','내 처형 집행'],['p_purge','내 처단'],['e_exec1','적 처형 집행 · 표식Ⅰ'],['e_exec2','적 처형 집행 · 표식Ⅱ'],['e_exec3','적 처형 집행 · 표식Ⅲ'],['e_exec4','적 처형 집행 · 표식Ⅳ'],['e_exec5','적 처형 집행 · 표식Ⅴ'],['e_purge','적 처단'],['fin','보스 제압']];
function trFxPanel(){if(!(S.run&&S.run.train&&S.C))return;const m=$('#modal');m.hidden=false;
  m.innerHTML=`<div class="panel" style="width:min(620px,100%)"><div class="maphead"><div><div class="psub">훈련장</div><div class="ptitle">연출 보기</div></div><button class="btn-ghost" id="trFxX">닫기</button></div><div class="trfxg">${TR_FX.map(([k,v])=>`<button class="cfb" data-fx="${k}">${v}</button>`).join('')}</div></div>`;
  $('#trFxX').onclick=closeModal;m.querySelectorAll('[data-fx]').forEach(b=>b.onclick=()=>{closeModal();trFxPlay(b.dataset.fx)})}
async function trFxPlay(k){const C=S.C;if(!C||S.busy||C.phase!=='player')return toast('연출','지금은 볼 수 없다');
  const need=k==='e_purge'?'inquisitor':k.startsWith('e_exec')?'cultist':null;
  if(need&&C.E.key!==need){C.over=true;hideCombatUI();return trStart(need,()=>trFxPlay(k))}
  S.busy=true;const E=C.E;
  try{
    if(k==='chime'){for(let i=1;i<=5;i++){markChime(i);await wait(i<5?520:1600)}}
    else if(k==='p_exec'||k==='p_purge'){const id=k==='p_exec'?'u_exec':'u_purge';if(id==='u_exec'){E.pmk=pmkOf(E);E.pmk.lv=5}await ultDash(id);await wait(500);await ultBack();if(E.pmk)E.pmk.lv=0}
    else if(k.startsWith('e_')){const name=k==='e_purge'?'명령 이행-처단':'행동-처형 집행',n=k==='e_purge'?0:+k.slice(-1),keep=C.mk.lv;C.mk.lv=n;renderCombat();
      E.ulting=true;ultCheck();await foeUltFx(E,name);if(C.ultFx)await C.ultFx.impact();await wait(450);await foeUltEnd(E,name);C.mk.lv=keep;renderCombat()}
    else if(k==='fin'){await bossFinish();$('#enemy').classList.remove('dead','kneel')}
  }finally{S.busy=false;renderCombat()}}
/* 세계수 등반을 누를 때마다 — 튜토리얼을 진행할지 물음 */
function tbAsk(){const m=$('#modal');m.hidden=false;
  m.innerHTML=`<div class="panel" style="width:min(480px,100%)"><div class="ptitle" style="text-align:center">튜토리얼을 진행하시겠습니까?</div><div class="choices" style="flex-direction:row;justify-content:center;gap:18px;margin-top:10px"><button class="plate-btn tbyn" id="tbYes">네</button><button class="plate-btn tbyn" id="tbNo">아니오</button></div></div>`;
  $('#tbYes').onclick=()=>{closeModal();sitReset();S.sitOn=true;tbBasic(()=>transition(showClimbPrep))};$('#tbNo').onclick=()=>{closeModal();S.sitOn=false;transition(showClimbPrep)}}
/* 상황 튜토리얼 — 적의 패시브 (처음 노르드교 단원과 싸울 때) */
function sitCheck(){const r=S.run,C=S.C;if(!r||!r.sit||!C||S.tb)return;
  if(!sitSeen('passive')&&liveFoes().some(f=>f.key==='cultist')){sitMark('passive');const f=liveFoes().find(x=>x.key==='cultist');
    setTimeout(()=>{if(S.C!==C||C.over||S.tb)return;tbStart([
      {m:'click',hl:()=>f===C.E?$('#enemy'):document.querySelector(`#foefigs .ufoe[data-foe="${foes().indexOf(f)}"]`),w:'foePanel'},
      {m:'say',pre:()=>wait(300),hl:()=>TH.pas('점조직'),t:'이건 패시브입니다. 적마다 가진 능력입니다.',post:tbClose}],{kind:'sit'})},900)}}
/* 도망 — 상태창의 점조직이 반짝이고 단원이 뒤돌아 화면 밖으로 */
async function sitFlee(E){openFoePanel(E);await wait(250);const el=TH.pas('점조직');if(el){el.classList.add('pasflash');await wait(1500)}closeModal()}
async function fleeAnim(E){const C=S.C,fig=E===C.E?$('#enemy'):document.querySelector(`#foefigs .ufoe[data-foe="${foes().indexOf(E)}"]`);if(!fig||REDUCED)return;fig.classList.add('flee');await wait(900)}

/* ================= V18 따로 나오는 튜토리얼 — 재능과 특성(세계수 등반 준비 화면) =================
   처음 한 번씩 나오고 건너뛸 수 있음 · 설정의 튜토리얼 다시 보기를 켜면 다시 나옴 */
const GUIDES={
  talent:{key:'ash-midgard-guide-talent-v1',n:'재능과 특성',steps:[
    {where:'climbPrep',t:'재능',hl:'talent',x:['재능은 태어날 때 생기는 특성 포인트입니다. 코스트와는 다른 자원입니다.','난이도에 따라 쉬움 10~20, 보통 5~10, 어려움과 매우 어려움은 0으로 시작합니다.','큰 숫자가 지금 남은 재능이고, 옆의 숫자가 처음 받은 재능입니다.']},
    {where:'climbPrep',t:'특성 고르기',hl:'tlist',x:['긍정적인 특성을 고르면 적힌 숫자만큼 재능을 씁니다. 부정적인 특성을 고르면 재능을 돌려받습니다.','같은 특성은 두 번 고를 수 없고, 서로 반대인 특성은 같이 고를 수 없습니다. 한 번 더 누르면 빠집니다.','남은 재능이 0 이상이어야 오를 수 있습니다.']},
    {where:'climbPrep',t:'남는 재능',hl:'stat',x:['특성을 고르고 남은 재능은 버려지지 않습니다.','남은 재능 1당 1레벨 기준 최대 체력 +5%, 공격레벨 +1, 방어레벨 +1이 붙습니다.','스탯표에는 남은 재능 보너스가 들어간 값이 보입니다.']},
    {where:'climbPrep',t:'스탯과 난이도',hl:'stat',last:1,x:['다시 굴리기를 누르면 1레벨 스탯과 재능을 새로 굴립니다.','어려움부터는 특성이 무작위로 고정되어 고를 수 없습니다. 특성이 없을 수도, 부정적인 특성만 붙을 수도 있습니다.','시작 덱 10장은 아래에서 고르거나 새로 만들 수 있습니다.']}]},
};
const gStep=g=>{try{const v=localStorage.getItem(g.key);return v==null?0:v==='done'?-1:+v||0}catch(e){return -1}};
const gSet=(g,v)=>{try{localStorage.setItem(g.key,String(v))}catch(e){}};
function guideShow(){
  const box=$('#tut');if(!box)return;if(tutOn())return;
  for(const id in GUIDES){const g=GUIDES[id];let i=gStep(g);if(i<0||i>=g.steps.length)continue;
    if(g.steps[i].where!==S.screen){const j=g.steps.findIndex((st,k)=>k>i&&st.where===S.screen);if(j<0)continue;i=j;gSet(g,i)}
    const st=g.steps[i];box.hidden=false;box.className='tut '+st.where;stage.dataset.tut=st.hl||'';
    box.innerHTML=`<div class="tut-h"><span>튜토리얼 · ${g.n} · ${i+1} / ${g.steps.length}</span><button class="tut-skip" id="tutSkip">건너뛰기</button></div>
      <div class="tut-t">${st.t}</div>${st.x.map(l=>`<p>${l}</p>`).join('')}<button class="btn-main tut-next" id="tutNext">${st.last?'튜토리얼 끝':'다음'}</button>`;
    $('#tutSkip').onclick=()=>{gSet(g,'done');guideShow()};
    $('#tutNext').onclick=()=>{gSet(g,st.last||i+1>=g.steps.length?'done':i+1);guideShow()};
    return}
  box.hidden=true;stage.removeAttribute('data-tut');
}
/* 4-1. 세계수 등반 준비 */
function showClimbPrep(){
  S.screen='climbPrep';S.run=null;S.C=null;hideCombatUI();closeModal();renderTop();viewFor('title');
  const h=S.hero=S.hero||rollHero(lastDiff());h.traits=(h.traits||[]).filter(k=>PTRAIT[k]);const D=CDIFF[h.diff||'easy'],dk=pickedDeck(),FR=h.fate==='random';
  const left=heroTalentLeft(h),tb=Math.max(0,left),hp1=Math.round(h.base1*hpMulOf(h.traits)*(1+.05*tb));
  const acc=h.acc+(h.traits.includes('accUp')?10:0)-(h.traits.includes('accDown')?10:0),eva=h.eva+(h.traits.includes('evaUp')?10:0)-(h.traits.includes('evaDown')?10:0);
  const blocked=k=>PT_CONFLICT.some(p=>p.includes(k)&&p.some(q=>q!==k&&h.traits.includes(q)));
  const chip=k=>{const t=PTRAIT[k],sel=h.traits.includes(k),dis=!sel&&blocked(k);if(FR&&!sel)return'';
    return`<button class="tchip${sel?' sel':''}${t.c<0?' neg':''}${FR?' fixed':''}" data-t="${k}" aria-pressed="${sel}" ${dis||FR?'disabled':''}><b>${t.n}</b><i>${t.c>0?'-':'+'}${Math.abs(t.c)}</i><span>${t.t}</span></button>`};
  const pos=Object.keys(PTRAIT).filter(k=>PTRAIT[k].c>0&&!PTRAIT[k].hide),neg=Object.keys(PTRAIT).filter(k=>PTRAIT[k].c<0&&!PTRAIT[k].hide);
  const sc=openScreen(`<div class="aprep cprep" id="cprep">
    <div class="ap-top"><button class="btn-ghost back" id="pBack">처음으로</button><div><div class="ptitle">세계수 등반</div><div class="psub">1장 미드가르드 · 일반인으로 시작한다</div></div>
      <div class="diffbar" role="group" aria-label="난이도">${Object.entries(CDIFF).map(([k,v])=>`<button class="dbtn${k===(h.diff||'easy')?' on':''}" data-diff="${k}" aria-pressed="${k===(h.diff||'easy')}"><b>${v.n}</b><i>재능 ${v.tal[0]===v.tal[1]?v.tal[0]:`${v.tal[0]}~${v.tal[1]}`} · 적 ${v.em===1?'±0':`${v.em>1?'+':''}${Math.round((v.em-1)*100)}%`}</i></button>`).join('')}</div></div>
    <div class="diffbar fatebar" role="group" aria-label="운명">${[['pick','직접 정하는 운명','재능을 소모해 특성을 직접 고름'],['random','운명 개척','특성이 완전 무작위로 정해짐']].map(([k,n,t])=>`<button class="dbtn${h.fate===k?' on':''}" data-fate="${k}" aria-pressed="${h.fate===k}"><b>${n}</b><i>${t}</i></button>`).join('')}</div>
    <div class="cp-cols">
      <div class="cp-stat">
        <div class="ap-h">1레벨 기준 스탯</div>
        <div class="stattable"><span>체력</span><span>${hp1}${hp1!==h.base1?` <em>(${h.base1})</em>`:''}</span><span>공격레벨</span><span>${h.atk+tb}${tb?` <em>(+${tb})</em>`:''}</span><span>방어레벨</span><span>${h.def+tb}${tb?` <em>(+${tb})</em>`:''}</span>
          <span>명중률</span><span>${acc}%</span><span>회피</span><span>${eva}%</span></div>
        <button class="plate-btn" id="pRoll">다시 굴리기</button>${FR?'<div class="hint" style="text-align:left">운명 개척은 스탯과 특성이 운에 맡겨진다. 다시 굴리면 전부 새로 뽑는다.</div>':''}
        <div class="talent${left<0&&!FR?' bad':''}"><span>재능</span><b>${left}</b><em>/ ${h.talent}</em></div>
        ${FR?'':'<div class="hint" style="text-align:left">긍정적인 특성은 재능을 쓰고, 부정적인 특성은 재능을 돌려준다. 재능이 0 이상이어야 오를 수 있다.</div>'}
        <div class="hint" style="text-align:left">남는 재능 1당 최대 체력 +5% · 공격레벨 +1 · 방어레벨 +1${tb?` (지금 +${tb})`:''}</div>
        <div class="ap-h" style="margin-top:6px">시작 덱 8장 · 무기 노르드교 조잡한 단검</div>
        <div class="clist">${START_DECK.map(([id,n])=>`<button class="cchip" data-card="${id}">${CARDS[id].name}<i>×${n}</i></button>`).join('')}</div>
      </div>
      <div class="cp-list"><div class="ap-h">긍정적인 특성${FR?' · 고정됨':''}</div><div class="tlist">${pos.map(chip).join('')||'<div class="hint" style="text-align:left">없음</div>'}</div></div>
      <div class="cp-list"><div class="ap-h">부정적인 특성${FR?' · 고정됨':''}</div><div class="tlist">${neg.map(chip).join('')||'<div class="hint" style="text-align:left">없음</div>'}</div></div>
    </div>
    <div class="ap-bottom"><div class="psub">${h.traits.length?`고른 특성 · ${h.traits.map(k=>PTRAIT[k].n).join(', ')}`:'고른 특성 없음'}</div>
      <button class="btn-main" id="pClimb" ${left<0&&!FR?'disabled':''}>${left<0&&!FR?'재능이 부족하다':'오른다'}</button></div></div>`,{full:true});
  const keepScroll=fn=>{const el=$('#cprep'),st=el?[...el.querySelectorAll('.tlist')].map(x=>x.scrollTop):[],top=el?el.scrollTop:0;fn();const n=$('#cprep');if(n){n.scrollTop=top;n.querySelectorAll('.tlist').forEach((x,i)=>x.scrollTop=st[i]||0)}};
  if(!FR)sc.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>keepScroll(()=>{const k=b.dataset.t;h.traits=h.traits.includes(k)?h.traits.filter(x=>x!==k):[...h.traits,k];showClimbPrep()}));
  sc.querySelectorAll('[data-card]').forEach(b=>b.onclick=()=>openCard(b.dataset.card));
  if($('#pRoll'))$('#pRoll').onclick=()=>keepScroll(()=>{const t=h.traits;S.hero=rollHero(h.diff);if(!FR)S.hero.traits=t;showClimbPrep()});
  sc.querySelectorAll('[data-fate]').forEach(b=>b.onclick=()=>{const k=b.dataset.fate;if(k===h.fate)return;try{localStorage.setItem(FATE_KEY,k)}catch(e){}S.hero=rollHero(h.diff);showClimbPrep()});
  sc.querySelectorAll('[data-diff]').forEach(b=>b.onclick=()=>{const k=b.dataset.diff;if(k===h.diff)return;try{localStorage.setItem(DIFF_KEY,k)}catch(e){}S.hero=rollHero(k);showClimbPrep()});
  $('#pBack').onclick=()=>{S.hero=null;transition(()=>showTitle({menu:true}))};
  const go=sit=>{sc.style.top='';h.deck=START_DECK.map(x=>x.slice());S.run=newRun(h);S.run.sit=!!sit;S.hero=null;transition(showMap)};
  setTimeout(guideShow,0);
  $('#pClimb').onclick=()=>{if(heroTalentLeft(h)<0&&!FR)return;slotStart(()=>go(S.sitOn))};
}
function openCard(id){
  const m=$('#modal');m.hidden=false;
  m.innerHTML=`<div class="panel" style="align-items:center"><div class="cardrow">${staticCard(id,false).replace('class="scard','class="scard big')}</div><div class="hint">카드를 누르면 뒤집힌다</div><button class="btn-ghost" id="mClose">닫기</button></div>`;
  bindStatic(m);$('#mClose').onclick=closeModal;
}
/* 패배 이벤트 (웹게임 문서: 패배 이벤트)
   다인슬레이프 소유 시: 착용자의 HP가 최대 HP의 1% 미만이 되면 화면이 빨갛게 물들며 파육음이 들리고 게임 오버
   일반인(플레이어): 성직자에게 죽으면 '정화되었다', '제물로 바쳐졌다' 중 하나가 무작위로 뜸, 그 외의 적에게 죽으면 기본 게임 오버 화면 */
const CLERIC_DEATH=['정화되었다','제물로 바쳐졌다'];
const dainDying=(hp,max)=>hp<max*.01;
function dainCheck(){const r=S.run,C=S.C;if(!r||!C||C.over||C.dead||r.mode!=='dain')return false;if(dainDying(r.hp,r.maxHp)){gameOver();return true}return false}
function redout(){const el=$('#redout');el.className='';void el.offsetWidth;el.className=REDUCED?'stay':'on';sfx('gore',1,true)}
function gameOver(){
  const C=S.C;if(C&&C.dead)return;
  if(C&&C.atInfo&&C.atInfo.shopFight&&!C.over){C.over=true;C.phase='over';S.busy=false;const r=S.run;r.hp=1;const lost=Math.min(r.gold,5000);r.gold-=lost;a2CombatEnd(C);hideCombatUI();toast('패배',lost>=5000?'체력 1 · 5000실링을 잃고 상점에서 쫓겨났다':'체력 1 · 가진 돈을 전부 잃고 상점에서 쫓겨났다');r.at=null;r.next=null;save();showMap();setTimeout(()=>shopBark('kick'),500);return}
  if(C&&C.atInfo&&C.atInfo.spar&&!C.over){C.over=true;C.phase='over';S.busy=false;const r=S.run;r.hp=1;a2CombatEnd(C);hideCombatUI();toast('대련','졌다 — 체력 1로 대련장을 나왔다');r.at=null;r.next=null;save();return showMap()}
  if(C&&C.atInfo&&C.atInfo.evb){C.over=true;C.phase='over';S.busy=false;const r=S.run;r.hp=1;a2CombatEnd(C);hideCombatUI();toast('패배','체력 1로 쫓겨났다');r.at=null;r.next=null;save();return showMap()}
 if(C){C.dead=true;C.over=true}S.busy=false;clearSave();
  const r=S.run,dain=r.mode==='dain',killer=C&&C.E?C.E.key:null;
  const title=dain?'쓰러졌다':killer==='priest'?pick(CLERIC_DEATH):'쓰러졌다';
  if(dain)redout();
  if(r.next)r.next=null;
  setTimeout(()=>{hideCombatUI();S.screen='over';renderTop();
    const sc=openScreen('',{dim:true});
    sc.innerHTML=`<div class="panel" style="align-items:center;text-align:center"><div class="psub">세계수 등반${dain?' · 다인모드':''}</div><div class="ptitle">${title}</div>
      <div class="lines" style="min-width:min(420px,100%)"><div><span>도달한 막</span><b>${r.act===2?`2장 · ${r.floor||0}막`:`${r.floor} / ${ROWS}`}</b></div><div><span>처치</span><b>${r.kills}</b></div><div><span>${r.mode==='dain'?'다인모드':'레벨'}</span><b>${r.mode==='dain'?`공 ${r.atk} · 방 ${r.def}`:r.lvl}</b></div></div>
      <button class="btn-main" id="goT">처음으로</button></div>`;
    $('#goT').onclick=()=>showTitle({menu:true});},REDUCED?100:dain?1900:700);
}
function showVictory(gold,lines,loot){
  S.screen='victory';renderTop();
  const r=S.run,sc=openScreen('',{dim:true});lines=lines||[];
  sc.innerHTML=`<div class="panel" style="align-items:center;text-align:center;max-width:720px"><div class="psub">1장 · 미드가르드</div><div class="ptitle">순수유물주의자를 쓰러뜨렸다</div>
    <div class="lines" style="min-width:min(420px,100%)">${gold?`<div><span>실링</span><b>+${gold.toLocaleString()} · 보유 ${money(r.gold)}</b></div>`:''}${lines.map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}${loot?`<div><span>장비 탈취</span><b>${GEAR[loot].n}</b></div>`:''}<div><span>처치</span><b>${r.kills}</b></div><div><span>남은 체력</span><b>${r.hp} / ${r.maxHp}</b></div><div><span>덱</span><b>${r.deck.length}장</b></div></div>
    <div class="hint">2장 니다벨리르로 이어집니다.</div><button class="btn-main" id="goT">처음으로</button></div>`;
  $('#goT').onclick=()=>showTitle({menu:true});
}

