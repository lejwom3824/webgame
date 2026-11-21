"use strict";
/* ================= fx ================= */
function fxAt(who,txt,cls){
  const o=L[S.orient];let x,y;
  if(who==='enemy'){x=o.ex+(rnd()-.5)*90;y=o.efeet-o.eh*.55+(rnd()-.5)*50}
  else{if(S.orient==='land'){x=170+(rnd()-.5)*60;y=630+(rnd()-.5)*20}else{x=450+(rnd()-.5)*160;y=790}}
  const el=document.createElement('div');el.className='fnum '+(cls||'');el.textContent=txt;el.style.left=x+'px';el.style.top=y+'px';
  $('#fx').appendChild(el);setTimeout(()=>el.remove(),1150);
}
function hitEnemyAnim(big){const en=$('#enemy');en.classList.remove('hit');void en.offsetWidth;en.classList.add('hit');if(big)shake()}
function flashHurt(big){const v=$('#vignette');v.classList.add('on');setTimeout(()=>v.classList.remove('on'),big?140:70);
  const pp=$('#ppanel');if(pp){pp.classList.remove('jolt');void pp.offsetWidth;pp.classList.add('jolt')}
  sfx('hurt',big?1.3:.8);if(big)shake(.9)}
function shake(k=1){if(REDUCED||!SET.shake)return;stage.style.setProperty('--sh',k);stage.classList.remove('shake');void stage.offsetWidth;stage.classList.add('shake')}
/* ================= 타격감 ================= */
function fxEl(cls,x,y,vars,life){const el=document.createElement('div');el.className=cls;el.style.left=x+'px';el.style.top=y+'px';
  for(const k in vars)el.style.setProperty(k,vars[k]);$('#fx').appendChild(el);setTimeout(()=>el.remove(),life||600);return el}
function slashFx(x,y,tier,sc=1){if(REDUCED)return;const n=1;
  for(let i=0;i<n;i++){const a=(i?135:-25)+(rnd()-.5)*30;fxEl('slash',x+(rnd()-.5)*30,y+(rnd()-.5)*30,{'--a':a+'deg','--w':(260+tier*90)*sc+'px','--h':(4+tier*2.5)*sc+'px'},400)}}
function sparks(x,y,n,col,tier=1,sc=1){if(REDUCED)return;for(let i=0;i<n;i++){const r=rnd()*360;
  fxEl('spark',x,y,{'--r':r+'deg','--d':(60+rnd()*90*(1+tier*.35))*sc+'px','--l':(8+rnd()*12)*sc+'px','--t':(.32+rnd()*.25)+'s',...(col?{'--c':col}:{})},650)}}
function ringFx(x,y,tier){if(REDUCED)return;fxEl('shock',x,y,{'--rs':tier>=3?5:3.5},450)}
/* 효과음 — 브라우저에서 직접 합성 (파일 없음) */
let AC=null;
function sfx(kind,amt=1){
  if(!SET.sound)return;let a;try{a=AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(a.state==='suspended')a.resume()}catch(e){return}
  const t=a.currentTime,out=a.destination,v=Math.min(1.5,amt);
  if(!sfx.nb){const b=a.createBuffer(1,a.sampleRate*.4|0,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=rnd()*2-1;sfx.nb=b}
  const noise=(dur,f,q,vol,type='bandpass')=>{const s=a.createBufferSource();s.buffer=sfx.nb;
    const fl=a.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=a.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl).connect(g).connect(out);s.start(t);s.stop(t+dur+.02)};
  const tone=(f0,f1,dur,vol,type='sine',dl=0)=>{const o=a.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t+dl);o.frequency.exponentialRampToValueAtTime(f1,t+dl+dur);
    const g=a.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.setValueAtTime(vol,t+dl);g.gain.exponentialRampToValueAtTime(.0001,t+dl+dur);o.connect(g).connect(out);o.start(t);o.stop(t+dl+dur+.02)};
  if(kind==='hit'){noise(.09,2600,.9,.35*v);noise(.16,500,.7,.35*v,'lowpass');tone(170,48,.16,.55*v)}
  else if(kind==='big'){noise(.12,2200,.7,.5*v);noise(.35,380,.6,.55*v,'lowpass');tone(120,32,.38,.8*v,'triangle');tone(60,28,.45,.5*v,'sine',.02)}
  else if(kind==='block'){tone(2300,1500,.14,.08,'square');tone(1250,900,.2,.08,'triangle');noise(.07,5200,3,.22)}
  else if(kind==='miss'){noise(.2,1200,1.4,.18,'bandpass')}
  else if(kind==='hurt'){tone(95,38,.28,.7*v,'triangle');noise(.18,700,.7,.4*v,'lowpass')}
  else if(kind==='gore'){/* 파육음: 젖은 살이 찢기는 소리 — 짧은 잡음 덩어리를 겹치고 낮게 꺼지는 울림 */
    const at=(dl,dur,f,q,vol,type)=>{const s2=a.createBufferSource();s2.buffer=sfx.nb;s2.playbackRate.value=.55+rnd()*.5;const fl=a.createBiquadFilter();fl.type=type||'bandpass';
      fl.frequency.setValueAtTime(f,t+dl);fl.frequency.exponentialRampToValueAtTime(Math.max(60,f*.35),t+dl+dur);fl.Q.value=q;const g=a.createGain();g.gain.setValueAtTime(.0001,t+dl);g.gain.linearRampToValueAtTime(vol,t+dl+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dl+dur);s2.connect(fl).connect(g).connect(out);s2.start(t+dl);s2.stop(t+dl+dur+.05)};
    [0,.09,.15,.27,.36,.52,.6].forEach((dl,i)=>at(dl,.16+rnd()*.14,900+rnd()*1400,2+rnd()*3,.55-.04*i));
    at(.05,.7,420,.8,.6,'lowpass');at(.4,.9,260,.7,.5,'lowpass');
    tone(70,26,.9,.9,'sine',.02);tone(140,40,.35,.35,'triangle',.3)}
  else if(kind==='slashEx'){noise(.12,2600+amt*300,1.4,.32,'bandpass');tone(1800+amt*120,500,.12,.05,'sawtooth');noise(.05,6000,4,.12,'highpass')}
  else if(kind==='cleave'){noise(.35,1500,.7,.6,'bandpass');noise(.8,260,.5,.75,'lowpass');tone(160,40,.9,.8,'sawtooth');tone(60,22,1.2,.7,'sine',.04)}
  else if(kind==='clank'){tone(420,380,.25,.18,'triangle');tone(1260,1180,.18,.06,'square');noise(.12,900,1.5,.25,'bandpass');tone(70,40,.3,.35,'sine')}
  else if(kind==='chime'){const f=[220,261.63,293.66,329.63,392][Math.max(0,Math.min(4,Math.round(amt)-1))];noise(.02,5200,3,.08,'highpass');tone(f,f*.995,.55,.1,'sine');tone(f*2.76,f*2.74,.32,.035,'triangle');tone(f*5.4,f*5.3,.14,.015,'sine')}
  else if(kind==='chord'){[220,261.63,329.63,440].forEach((f,i)=>{tone(f,f*.996,1.3,.075,'sine',i*.05);tone(f*2.76,f*2.74,.4,.02,'triangle',i*.05)});tone(110,109.5,1.5,.08,'triangle')}
  else if(kind==='lock'){tone(1900,1300,.05,.12,'square');noise(.05,4200,4,.28);tone(640,640,.12,.08,'triangle',.04)}
  else if(kind==='rise'){tone(70,300,.32,.22,'sawtooth');noise(.32,700,.8,.22)}
  else if(kind==='ultHit'){noise(.2,1900,.6,.65);noise(.7,320,.5,.75,'lowpass');tone(92,24,.85,.95,'triangle');tone(46,20,1.1,.6,'sine',.03);[523.25,783.99,1046.5].forEach(f=>tone(f,f*.5,.45,.06,'sawtooth'))}
  else if(kind==='shatter'){for(let i=0;i<6;i++)tone(2400+rnd()*2600,1800+rnd()*900,.25+rnd()*.3,.045,'triangle',i*.035);noise(.4,5200,1.2,.45,'highpass');noise(.5,380,.6,.5,'lowpass');tone(70,30,.6,.6,'sine')}
}
/* ================= 카드로 베기 · 카드별 모션과 소리 (V2.30.52.14) =================
   공격 카드는 눕혀져 칼날처럼 적을 베고 지나감. 검 카드는 한 장씩, 공방 카드는 공방별 움직임 × 타격 순서·위력.
   소리는 휘두르는 소리 + 맞는 소리 두 박자, 전부 합성음. 한 타격의 연출은 0.4초 안, AUTO 중에는 눕는 동작 생략. */
const CUT_SWORD={slash:'clumsy',ms_slash:'cut',f_pi:'pi',ms_split:'split',f_ryeo:'ryeo',ms_flash:'flash',f_dae:'dae',ms_kendo:'kendo',ms_kendo2:'kendo2'};
const CUT={
  clumsy:{p:[[-150,90],[130,-60]],dur:150,w:.7,col:'#f1e6d0',wob:1},
  cut:{p:[[-190,140],[190,-140]],dur:110,w:.8,col:'#fff3d6'},
  pi:{p:[[30,-300],[-10,170]],dur:150,w:1.9,col:'#ffe2a8',stop:50,pre:120,fix:1},
  split:{p:[[0,-270],[0,190]],dur:130,w:1.1,col:'#fff3d6',open:1,fix:1},
  ryeo:{p:[[-170,-40],[-60,130],[110,110],[170,-50]],dur:230,w:1,col:'#ffe9c4'},
  flash:{p:[[-620,10],[620,-10]],dur:60,w:.6,col:'#ffffff',late:90,noflat:1},
  dae:{p:[[-560,210],[560,-210]],dur:150,w:2.6,col:'#ffd98f',stop:80,pre:200,shake:1,fix:1},
  kendo:{p:[[0,-280],[0,150]],dur:110,w:.9,col:'#fff3d6',fix:1,ret:1},
  kendo2:{p:[[-160,-110],[160,110]],dur:90,w:.7,col:'#fff3d6'},
  stein:{p:[[0,-320],[0,60]],dur:120,w:1.5,col:'#ffb469',stop:30,fix:1,steam:1},
  kriv:{p:[[-420,150],[420,120]],dur:150,w:.7,col:'#bfe9ff',frost:1},
  ash:{p:[[-190,60],[-40,-120],[90,60],[200,-90]],dur:220,w:1.2,col:'#e8a0c8',paint:1},
  remi:{p:[[40,-200],[10,40]],dur:70,w:.8,col:'#f0e6d2',fix:1,jit:1},
  krim:{p:[[-560,260],[0,0]],dur:170,w:.8,col:'#d9b6ff',spin:1,end:1}
};
const cutKind=id=>CUT_SWORD[id]||(CARDS[id]&&CARDS[id].ws2&&CUT[CARDS[id].ws2]?CARDS[id].ws2:'cut');
function sndKit(pr=1){
  if(!SET.sound)return null;let a;try{a=AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(a.state==='suspended')a.resume()}catch(e){return null}
  if(!sfx.nb){const b=a.createBuffer(1,a.sampleRate*.4|0,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=rnd()*2-1;sfx.nb=b}
  const t=a.currentTime,out=a.destination;
  const N=(dl,dur,f0,f1,q,vol,type='bandpass',atk)=>{const s=a.createBufferSource();s.buffer=sfx.nb;s.loop=true;const fl=a.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f0*pr,t+dl);fl.frequency.exponentialRampToValueAtTime(Math.max(40,f1*pr),t+dl+dur);fl.Q.value=q;
    const g=a.createGain();g.gain.setValueAtTime(.0001,t+dl);g.gain.linearRampToValueAtTime(vol,t+dl+(atk||Math.min(.012,dur*.3)));g.gain.exponentialRampToValueAtTime(.0001,t+dl+dur);s.connect(fl).connect(g).connect(out);s.start(t+dl,rnd()*.2);s.stop(t+dl+dur+.03)};
  const W=(dl,dur,f0,f1,vol,q=1.2,type='bandpass')=>N(dl,dur,f0,f1,q,vol,type,dur*.5);
  const T=(dl,f0,f1,dur,vol,type='sine')=>{const o=a.createOscillator();o.type=type;o.frequency.setValueAtTime(f0*pr,t+dl);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1*pr),t+dl+dur);
    const g=a.createGain();g.gain.setValueAtTime(.0001,t);g.gain.setValueAtTime(vol,t+dl);g.gain.exponentialRampToValueAtTime(.0001,t+dl+dur);o.connect(g).connect(out);o.start(t+dl);o.stop(t+dl+dur+.03)};
  /* 갈라지는 소리: 아주 짧은 잡음 조각을 불규칙하게 흩뿌림 */
  const CR=(dl,n,span,f,vol)=>{for(let i=0;i<n;i++)N(dl+span*i/n+rnd()*span/n*.6,.016+rnd()*.03,f*(.6+rnd()*.9),f*(.35+rnd()*.4),3+rnd()*5,vol*(.6+rnd()*.5))};
  return{N,W,T,CR}}
function cutSwingSfx(kind){const k=sndKit();if(!k)return;const{W,T}=k;
  if(kind==='clumsy')W(0,.1,1500,2600,.16);
  else if(kind==='pi'){W(0,.3,180,520,.42,.8);T(0,95,58,.3,.32)}
  else if(kind==='split')W(0,.2,1200,2600,.18,1.5);
  else if(kind==='ryeo')W(0,.3,700,2800,.18,1.6);
  else if(kind==='flash'){T(.02,3300,3100,.12,.06,'triangle');T(.02,4750,4600,.1,.04)}
  else if(kind==='dae'){W(0,.42,140,760,.45,.7);T(0,55,150,.42,.42)}
  else if(kind==='stein'){T(0,900,1100,.03,.05,'square');T(.04,1000,1250,.03,.05,'square');W(.03,.1,600,1400,.15,1)}
  else if(kind==='kriv')W(0,.16,5000,7500,.08,3,'highpass');
  else if(kind==='ash')W(0,.2,900,1700,.14,.8);
  else if(kind==='remi'){T(0,2400,2900,.03,.03,'triangle');W(0,.05,3500,5000,.08,2)}
  else if(kind==='krim'){for(let i=0;i<4;i++)W(i*.04,.035,1400+i*300,2200+i*300,.1,3)}
  else W(0,.08,3200,5600,.14,2)}
function cutHitSfx(kind,tier,n,id){const C=S.C,re=(C&&C.fxRe)||0;const k=sndKit((1+((n%3)-1)*.07)*(tier>=3?.88:1));if(!k)return;const{N,T,CR}=k,v=Math.min(1.4,.7+tier*.22);
  if(kind==='clumsy'){N(0,.09,320,160,.7,.4*v,'lowpass');T(0,150,70,.1,.4*v)}
  else if(kind==='pi'){T(0,120,40,.2,.6*v,'triangle');CR(.01,7,.24,2600,.42*v);N(.02,.28,1400,300,.8,.25*v)}
  else if(kind==='split'){N(0,.3,1100,180,1.2,.4*v);CR(.03,5,.26,1500,.3*v);T(0,160,50,.18,.4*v)}
  else if(kind==='ryeo'){N(0,.07,2600,1600,2.5,.35*v);N(.11,.08,2200,1300,2.5,.35*v);T(0,170,80,.07,.3*v);T(.11,150,70,.07,.3*v)}
  else if(kind==='flash'){N(0,.24,4200,700,.9,.42*v,'highpass');T(0,300,60,.12,.4*v)}
  else if(kind==='dae'){T(0,110,28,.5,.9*v,'triangle');T(.02,55,24,.7,.6*v);N(0,.4,500,120,.6,.6*v,'lowpass');CR(.08,12,.5,2000,.4*v)}
  else if(kind==='kendo'){N(0,.03,2000,1200,1.5,.3*v);T(0,280,150,.05,.4*v);T(.06,1900,1850,.25,.05);T(.06,2850,2800,.2,.03)}
  else if(kind==='kendo2'){N(0,.03,2000,1200,1.5,.3*v);T(0,280,150,.05,.4*v);const f=440*Math.pow(2,Math.min(8,re)*2/12);T(.01,f,f,.1,.07,'triangle')}
  else if(kind==='stein'){T(0,820,760,.16,.12*v,'square');T(0,1370,1300,.2,.08*v,'triangle');T(0,150,50,.12,.5*v);N(.08,.4,6500,4500,.7,.14,'highpass')}
  else if(kind==='kriv'){T(0,2600,2500,.09,.06);T(0,3900,3700,.07,.05);CR(.02,5,.16,5200,.25*v);T(0,200,80,.07,.3*v)}
  else if(kind==='ash'){N(0,.17,700,180,.7,.5*v,'lowpass');T(.01,320,90,.09,.25*v);N(.03,.05,2500,1200,2,.12*v)}
  else if(kind==='remi'){T(0,340,170,.045,.4*v,'triangle');N(0,.03,1900,1200,2,.3*v)}
  else if(kind==='krim'){T(0,115,45,.16,.6*v);N(0,.1,420,160,.7,.45*v,'lowpass');T(0,900,300,.03,.08)}
  else{N(0,.035,4500,3000,1.5,.3*v,'highpass');T(0,240,70,.08,.45*v)}
  const tx=(CARDS[id]&&CARDS[id].text)||'';
  if(tx.includes('전격'))for(let i=0;i<3;i++)T(.05+i*.03,1800+rnd()*1500,300,.03,.05,'sawtooth');
  if(tx.includes('증기')&&kind!=='stein')N(.06,.3,6000,4200,.7,.1,'highpass')}
/* 카드가 눕혀져 적을 베고 지나감 — 적을 지나는 순간에 돌아와 타격이 들어감 */
async function cardCut(hit){
  const C=S.C;if(!C||!C.fxCard||S.screen!=='combat')return null;
  const id=C.fxCard,kind=cutKind(id),K=CUT[kind],n=C.fxN||0;C.fxN=n+1;
  const o=L[S.orient],cx=o.ex,cy=o.efeet-o.eh*.55,sc=S.orient==='port'?.82:1;
  let P=K.p.map(q=>[q[0]*sc,q[1]*sc]);
  if(!K.fix){if(n%2===1)P=P.map(q=>[-q[0],q[1]]);if(n%3===2)P=P.map(q=>[q[0],q[1]*.25])}
  if(K.jit){const j=(rnd()-.5)*120;P=P.map(q=>[q[0]+j,q[1]])}
  const dirx=Math.sign(P[P.length-1][0]-P[0][0])||1,res={kind,K,n,id,dirx};
  if(REDUCED){cutSwingSfx(kind);return res}
  const ang=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;
  const el=document.createElement('div');el.className='cblade';el.style.left=cx+'px';el.style.top=cy+'px';el.style.setProperty('--bc',K.col);$('#fx').appendChild(el);
  const a0=ang(P[0],P[1]),flat=K.noflat?.16:.22,T0=(x,y,r,sx,o2=1)=>({transform:`translate(${x}px,${y}px) rotate(${r+90}deg) scaleX(${sx})`,opacity:o2});
  const lay=n===0&&!K.noflat&&!SET.auto?100:0,pre=n===0&&!SET.auto?(K.pre||0):0;
  cutSwingSfx(kind);
  if(lay||pre){const bx=-Math.cos(a0*Math.PI/180)*(pre?46:0),by=-Math.sin(a0*Math.PI/180)*(pre?46:0);
    el.animate([T0(P[0][0],P[0][1],-90+(K.wob?8:0),1,0),T0(P[0][0],P[0][1],-90,1,1),T0(P[0][0]+bx,P[0][1]+by,a0,flat)],{duration:lay+pre,easing:'ease-out',fill:'forwards'});await wait(lay+pre)}
  const kf=P.map((q,i)=>T0(q[0],q[1],(K.spin?i*720:0)+ang(P[Math.max(0,i-1)],P[Math.min(P.length-1,i===0?1:i)])+(K.wob?(i%2?7:-7):0),flat));
  const last=P[P.length-1],ex=K.end?last:[last[0]+(last[0]-P[P.length-2][0])*.5,last[1]+(last[1]-P[P.length-2][1])*.5];
  if(!K.end)kf.push(T0(ex[0],ex[1],ang(P[P.length-2],last),flat,0));
  el.animate(kf,{duration:K.dur+(K.end?0:70),easing:'cubic-bezier(.3,0,.2,1)',fill:'forwards'});
  const trail=()=>{for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
      const mk=(ox,cls)=>fxEl('cuttrail'+(hit?'':' miss')+(cls||''),cx+(a[0]+b[0])/2+ox,cy+(a[1]+b[1])/2,{'--a':ang(a,b)+'deg','--w':len*1.08+'px','--h':(5+4*K.w)+'px','--bc':K.paint?pick(['#e8a0c8','#8fd0e8','#f0d070']):K.col,'--dl':(i*K.dur/(P.length-1))+'ms'},520);
      if(K.open){mk(-6,' openL');mk(6,' openR')}else mk(0)}};
  if(K.late){await wait(K.dur);setTimeout(()=>el.remove(),120);await wait(K.late);trail()}
  else{trail();await wait(K.end?K.dur:K.dur*.5);setTimeout(()=>el.remove(),K.end?260:K.dur*.5+90)}
  if(hit){if(K.steam)sparks(cx,cy+40*sc,5,'#e8eef2',1);if(K.frost)sparks(cx,cy,5,'#bfe9ff',1);if(K.shake)shake(1.2);
    if(K.ret)setTimeout(()=>castFx('def'),120)}
  else{const en=$('#enemy');en.style.setProperty('--kx',-dirx);en.classList.remove('dodge');void en.offsetWidth;en.classList.add('dodge');setTimeout(()=>en.classList.remove('dodge'),260)}
  return res}
/* 방어 카드는 내 앞에 세워졌다가 방패 고리로, 기술 카드는 떠올라 빛으로 흩어짐 */
function castFx(type){if(REDUCED||S.screen!=='combat')return;const land=S.orient==='land',x=land?250:450,y=land?600:780;
  const el=document.createElement('div');el.className='cblade cast';el.style.left=x+'px';el.style.top=y+'px';el.style.setProperty('--bc',type==='def'?'#74c2d8':'#dba054');$('#fx').appendChild(el);
  if(type==='def'){el.animate([{transform:'translate(0,30px) scale(.6)',opacity:0},{transform:'translate(0,0) scale(1)',opacity:1,offset:.5},{transform:'translate(0,0) scale(1.15)',opacity:0}],{duration:260,fill:'forwards'});
    setTimeout(()=>fxEl('shock guard',x,y,{'--rs':3.2},450),120)}
  else{el.animate([{transform:'translate(0,20px) scale(.7)',opacity:0},{transform:'translate(0,-20px) scale(.9)',opacity:1,offset:.4},{transform:'translate(0,-90px) scale(.5)',opacity:0}],{duration:300,fill:'forwards'});
    setTimeout(()=>sparks(x,y-60,5,'#f3d9a0',1,.8),150)}
  setTimeout(()=>el.remove(),340)}
function guardFx(){if(REDUCED)return;const land=S.orient==='land';fxEl('shock guard',land?250:450,land?600:780,{'--rs':3.6},450)}
function swayFx(){if(REDUCED)return;const sc=$('#scene');sc.classList.remove('sway');void sc.offsetWidth;sc.classList.add('sway');setTimeout(()=>sc.classList.remove('sway'),260)}
/* 체력 막대: 깎인 양을 밝게 먼저 보여 주고 뒤따라 줄어듦 */
function hpLag(prev,now){if(REDUCED||!(prev>now))return;setTimeout(()=>{const b=document.querySelector('#eplate .ebar');if(!b)return;const u=document.createElement('u');u.className='hplag';u.style.left=Math.max(0,now*100)+'%';u.style.width=(prev-Math.max(0,now))*100+'%';b.appendChild(u);
  u.animate([{transform:'scaleX(1)',opacity:1},{transform:'scaleX(1)',opacity:1,offset:.35},{transform:'scaleX(0)',opacity:.6}],{duration:520,fill:'forwards'});setTimeout(()=>u.remove(),540)},20)}
/* 적에게 준 피해 연출 — 피해량에 따라 3단계 */
function impactEnemy(loss,bl,CK){
  const C=S.C,E=C&&C.E;if(!E)return 0;const o=L[S.orient],x=o.ex,y=o.efeet-o.eh*.55;
  if(loss<=0){if(bl){sparks(x,y,7,'#cfe6ff');sfx('block')}return 0}
  const fr=loss/Math.max(1,E.maxHp),tier=(fr>=.12||loss>=60)?3:(fr>=.05||loss>=25)?2:1;
  if(!CK)slashFx(x,y,tier);sparks(x,y,3+tier*2,CK?CK.K.col:null,tier);if(tier>=3)ringFx(x,y,tier);
  if(CK){cutHitSfx(CK.kind,tier,CK.n,CK.id);$('#enemy').style.setProperty('--kx',CK.dirx)}else sfx(tier>=3?'big':'hit',.8+tier*.25);if(tier>=3)shake(.9);
  return tier;
}
/* ===== 결정적인 순간 연출 (V2.35.71.19) — 표식 종소리 · 내 궁극기 1인칭 돌진 · 보스 제압 ===== */
/* 표식이 오를 때마다 종소리가 한 음씩 높아지고, Ⅴ에서 화음이 완성되며 표식이 금빛으로 잠김 */
function markChime(lv){try{sfx('chime',lv)}catch(e){}if(lv<5||REDUCED)return;
  setTimeout(()=>{try{sfx('lock');sfx('chord')}catch(e){}const en=$('#enemy');if(en){en.classList.remove('mk5');void en.offsetWidth;en.classList.add('mk5');setTimeout(()=>en.classList.remove('mk5'),1500)}
    const o=L[S.orient];fxEl('mk5ring',o.ex,o.efeet-o.eh*.55,{},1300);fxAt('enemy','표식Ⅴ','info')},260)}
/* 패의 궁극기 카드가 쓸 수 있게 되면 금빛으로 숨 쉼 */
function ultReadyMark(){const C=S.C;if(!C)return;for(const el of handEls.values()){const c=el._uids&&C.hand.find(x=>x.uid===el._uids[0]);el.classList.toggle('ultok',!!(c&&CARDS[c.id]&&CARDS[c.id].rar==='ult'&&!canPlay(c)))}}
/* 내 궁극기 — 흑백으로 멈추고 카드 이름, 표식(처단은 칼날 셋)이 빨려 든 뒤 적에게 돌진 */
let ULT_ON=false;
async function ultDash(id){if(REDUCED)return;const C=S.C,E=C.E,o=L[S.orient],x=o.ex,y=o.efeet-o.eh*.55,W=o.W,H=o.H;ULT_ON=true;
  stage.classList.add('ultme');const nm=document.createElement('div');nm.className='ultname';nm.textContent=CARDS[id].name;$('#fx').appendChild(nm);
  const cx=W/2,cy=H*.42;
  if(id==='u_exec'){const n=Math.max(1,Math.min(5,(E&&E.pmk&&E.pmk.lv)||5));for(let i=1;i<=n;i++){setTimeout(()=>{const g=fxEl('ultmk',x+(i-3)*34,y-40,{'--tx':(cx-x-(i-3)*34)+'px','--ty':(cy-y+40)+'px'},900);g.textContent=ROMAN[i];try{sfx('chime',i)}catch(e){}},120+i*110)}await wait(260+n*110+420)}
  else{for(let i=0;i<3;i++)setTimeout(()=>{const g=fxEl('ultblade',cx+(i-1)*90,cy+160,{'--r':((i-1)*18)+'deg'},900);try{sfx('chime',3+i)}catch(e){}},150+i*140);await wait(900)}
  try{sfx('rise')}catch(e){}
  for(const el of[$('#scene'),$('#bg')]){el.style.transformOrigin=`${x/W*100}% ${y/H*100}%`;el.animate([{transform:'scale(1)'},{transform:'scale(1.5)'}],{duration:230,easing:'cubic-bezier(.65,0,.95,.45)',fill:'forwards'})}
  await wait(220);fxEl('ultline',W/2,y,{},700);try{sfx('ultHit')}catch(e){}shake(1.5);nm.classList.add('out');setTimeout(()=>nm.remove(),600)}
async function ultBack(){if(!ULT_ON)return;ULT_ON=false;const els=[$('#scene'),$('#bg')];
  const an=els.map(el=>el.animate([{transform:'scale(1.5)'},{transform:'scale(.95)',offset:.65},{transform:'scale(1)'}],{duration:440,easing:'ease-out',fill:'forwards'}));
  await wait(450);ultReset()}
/* 궁극기 돌진의 확대를 완전히 걷어 냄 — 앞으로 당긴 확대(fill forwards)까지 지워야 화면이 원래대로 돌아옴 */
function ultReset(){ULT_ON=false;for(const el of[$('#scene'),$('#bg')]){if(!el)continue;el.getAnimations().forEach(a=>{if(!(window.CSSAnimation&&a instanceof CSSAnimation)&&!(window.CSSTransition&&a instanceof CSSTransition))a.cancel()});el.style.transformOrigin=''}stage.classList.remove('ultme');document.querySelectorAll('#fx .ultname').forEach(x=>x.remove())}
/* 보스 제압 — 마지막 일격 뒤 멈춤, 하얗게 번쩍, 무릎 꿇음, 화면 틀이 깨졌다가 맞춰지고 글자 */
async function bossFinish(){if(REDUCED)return;const o=L[S.orient],x=o.ex,y=o.efeet-o.eh*.55,W=o.W,H=o.H;let skip=false;const sk=()=>{skip=true};
  const w2=ms=>skip?Promise.resolve():wait(ms);setTimeout(()=>stage.addEventListener('pointerdown',sk,{once:true}),300);
  const en=$('#enemy');stage.classList.add('finning');en.classList.remove('dead');en.classList.add('hstop');const fl=document.createElement('div');fl.className='finflash';stage.appendChild(fl);try{sfx('ultHit')}catch(e){}
  await w2(650);en.classList.remove('hstop');en.classList.add('kneel');await w2(500);
  const sh=document.createElement('div');sh.className='finshatter';const R=Math.hypot(W,H);let p='';
  for(let i=0;i<11;i++){const a=i/11*Math.PI*2+rnd()*.35;let px=x,py=y,d='M'+x+' '+y;for(let k=1;k<=5;k++){const rr=R*k/5,aa=a+(rnd()-.5)*.28;px=x+Math.cos(aa)*rr;py=y+Math.sin(aa)*rr;d+=' L'+px.toFixed(0)+' '+py.toFixed(0)}p+=`<path d="${d}"/>`}
  for(let k=1;k<=3;k++){const rr=60*k+rnd()*30;let d='';for(let i=0;i<=12;i++){const a=i/12*Math.PI*2,q=rr*(.8+rnd()*.4);d+=(i?' L':'M')+(x+Math.cos(a)*q).toFixed(0)+' '+(y+Math.sin(a)*q).toFixed(0)}p+=`<path d="${d}Z" class="ring"/>`}
  sh.innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${p}</svg>`;stage.appendChild(sh);try{sfx('shatter')}catch(e){}shake(1.8);stage.classList.add('fincrack');
  await w2(900);sh.classList.add('mend');stage.classList.remove('fincrack');
  const t=document.createElement('div');t.className='finword';t.textContent=((S.run&&S.run.act)||1)===1?'제압':'처치';stage.appendChild(t);try{sfx('chord')}catch(e){}
  await w2(1500);[fl,sh,t].forEach(e=>e.remove());en.classList.add('dead');en.classList.remove('kneel');stage.classList.remove('fincrack','finning');stage.removeEventListener('pointerdown',sk)}
/* ===== 적 궁극기 연출 (V2.35.74.20) — 카드가 떠올라 뒤집힌 뒤, 처형 집행은 표식 수만큼 베고 가로로 베기, 처단은 상단 자세 → 내려 베기 → 검을 꽂은 자세 ===== */
const EXEC_CUTS=[[[-1,.8],[.3,.5],[.6,-1]],[[.7,-.8],null,[-.7,.9]],[[0,-1],null,[0,1]],[[-1,.06],null,[1,-.06]],[[-.9,-.5],null,[.9,.55]]];
function stXY(el){const o=stage.getBoundingClientRect(),a=el.getBoundingClientRect(),sc=S.scale||1;return{x:(a.left-o.left+a.width/2)/sc,y:(a.top-o.top+a.height/2)/sc}}
/* 칼날 궤적 — 가운데가 두껍고 양 끝이 가는 초승달, 휘두르는 방향으로 훑고 지나간 뒤 상처로 남음 */
function bladeArc(x,y,len,th,ang,bend,dur,kind=''){const d=document.createElement('div');d.className='fublade '+kind;const L=len,k=th*2.4*bend,h=Math.abs(k)+th*2;
  d.style.cssText=`left:${x}px;top:${y}px;width:${L}px;height:${h}px;margin:${-h/2}px 0 0 ${-L/2}px;transform:rotate(${ang}deg);--dur:${dur}ms`;
  const m=h/2+k/2,id='fb'+(UID++);
  d.innerHTML=`<svg viewBox="0 0 ${L} ${h}" preserveAspectRatio="none"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-opacity="0"/><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-opacity="0"/></linearGradient></defs><path class="glow" d="M0 ${m} Q${L/2} ${m-k} ${L} ${m} Q${L/2} ${m-k+th*bend*2} 0 ${m}Z"/><path class="core" fill="url(#${id})" d="M0 ${m} Q${L/2} ${m-k} ${L} ${m} Q${L/2} ${m-k+th*bend*.9} 0 ${m}Z"/><path class="scar" d="M${L*.06} ${m} Q${L/2} ${m-k+th*bend*.35} ${L*.94} ${m}"/></svg>`;
  $('#fx').appendChild(d);requestAnimationFrame(()=>d.classList.add('go'));setTimeout(()=>d.classList.add('rest'),dur+60);setTimeout(()=>d.remove(),6000);return d}
function sparks(x,y,ang,n,spread=0,kind=''){const a0=ang*Math.PI/180;for(let i=0;i<n;i++){const t=(rnd()-.5)*2,px=x+Math.cos(a0)*t*(spread||120),py=y+Math.sin(a0)*t*(spread||120),side=rnd()<.5?1:-1,dir=a0+side*(Math.PI/2)+(rnd()-.5)*.9,dist=40+rnd()*120;
  fxEl('fuspark '+kind,px,py,{'--x':(Math.cos(dir)*dist).toFixed(0)+'px','--y':(Math.sin(dir)*dist).toFixed(0)+'px','--r':(dir*180/Math.PI).toFixed(0)+'deg','--t':(260+rnd()*260|0)+'ms'},700)}}
async function foeUltFx(E,name){const C=S.C;if(REDUCED||!C)return;const o=L[S.orient],W=o.W,H=o.H,ex=o.ex,ey=o.efeet-o.eh*.6;let fast=false;const sk=()=>{fast=true};stage.addEventListener('pointerdown',sk);
  const w2=ms=>wait(fast?ms*.3:ms);const done=()=>stage.removeEventListener('pointerdown',sk);
  const fx=C.ultFx={name,hitDone:false,impact:async()=>{}};
  /* 카드가 떠올라 가운데로 와서 뒤집힘 */
  const cd=document.createElement('div');cd.className='fucard';cd.style.left=ex+'px';cd.style.top=ey+'px';
  cd.innerHTML=`<div class="fu-in"><div class="fu-f fu-back"></div><div class="fu-f fu-front">${name.includes('-')?`<small>${name.split('-')[0]}</small><b>${name.split('-').slice(1).join('-')}</b>`:`<b>${name}</b>`}<em>궁극기</em><i>${actText(name).replace(' · 궁극기','')}</i></div></div>`;$('#fx').appendChild(cd);
  try{sfx('ult')}catch(e){}
  cd.animate([{transform:'translate(0,0) scale(.25)',opacity:0},{transform:'translate(0,-20px) scale(.45)',opacity:1,offset:.25},{transform:`translate(${W/2-ex}px,${H*.4-ey}px) scale(1)`,opacity:1}],{duration:fast?200:620,easing:'cubic-bezier(.3,.8,.3,1)',fill:'forwards'});
  await w2(560);cd.classList.add('flip');try{sfx('lock')}catch(e){}await w2(820);
  cd.animate([{opacity:1},{opacity:0,transform:`translate(${W/2-ex}px,${H*.4-ey}px) scale(1.25)`,filter:'blur(6px)'}],{duration:260,fill:'forwards'});setTimeout(()=>cd.remove(),300);await w2(200);
  if(name==='행동-처형 집행'){const n=Math.max(1,Math.min(5,(C.mk&&C.mk.lv)||1)),cx=W/2,cy=H*.44,R=Math.min(W,H);
    const pp=$('#ppanel'),pc=pp?stXY(pp):{x:W*.2,y:H*.8},scars=[];fx.scars=scars;
    /* 표식 수만큼 베기 — 매번 각도가 달라지고, 갈수록 빨라짐 */
    let prev=rnd()<.5?1:-1;
    for(let i=0;i<n;i++){prev=-prev;const ang=prev*(18+rnd()*52)+(rnd()<.25?90:0),ox=(rnd()-.5)*R*.22,oy=(rnd()-.5)*R*.18;
      const sl=bladeArc(cx+ox,cy+oy,R*(.62+rnd()*.25),R*(.035+i*.004),ang,prev,fast?60:120);scars.push(sl);
      sparks(cx+ox,cy+oy,ang,7+i*2);try{sfx('slashEx',i)}catch(e){}shake(.55+i*.14);fxEl('cutflash',0,0,{},240);
      const g=fxEl('mkbreak',pc.x+(i-(n-1)/2)*30,pc.y-60,{},900);g.textContent=ROMAN[i+1];
      await w2(Math.max(90,250-i*38))}
    await w2(240);
    fx.impact=async()=>{stage.classList.add('fuhush');await wait(fast?60:240);stage.classList.remove('fuhush');
      const y=cy+R*.04*(rnd()-.5);scars.push(bladeArc(cx,y,W*1.25,R*.075,(rnd()-.5)*4,1,fast?70:150,'big'));try{sfx('cleave')}catch(e){}
      const seam=fxEl('fuseam',0,y,{},1100);sparks(cx,y,0,26,W*.5);await wait(80);stage.classList.add('usplit');shake(2);await wait(fast?140:320);stage.classList.remove('usplit');
      for(const sc of scars)sc.classList.add('burst')}}
  else if(name==='명령 이행-처단'){const en=$('#enemy'),scars=fx.scars=[];en.classList.add('inq-raise');try{sfx('rise')}catch(e){}await w2(720);
    fx.impact=async()=>{en.classList.remove('inq-raise');en.classList.add('inq-cut');await wait(70);
      /* 머리 위에서 발밑까지 한 번에 내려 베는 궤적, 땅을 치는 충격 */
      const R=Math.min(W,H),x0=o.ex-R*.05;scars.push(bladeArc(x0,H*.47,H*.95,R*.09,86,-1,fast?70:130,'gold'));try{sfx('ultHit')}catch(e){}
      await wait(90);fxEl('fuquake',W/2,H*.86,{},900);sparks(W/2,H*.86,0,22,W*.35,'gold');stage.classList.add('udrop');shake(1.9);await wait(fast?120:300);stage.classList.remove('udrop')}}
  done()}
async function foeUltEnd(E,name){const C=S.C;if(!C)return;const fx=C.ultFx;C.ultFx=null;E.ulting=false;const en=$('#enemy');
  if(name==='명령 이행-처단'&&en&&en.classList.contains('inq-cut')){await wait(250);en.classList.remove('inq-cut');setTimeout(()=>{try{sfx('clank')}catch(e){}},420);await wait(650)}
  if(en)en.classList.remove('inq-raise','inq-cut');if(fx&&fx.scars)for(const sc of fx.scars){sc.classList.add('gone');setTimeout(()=>sc.remove(),900)}ultCheck()}
async function hitStop(tier,ex=0){if((tier<2&&!ex)||REDUCED)return;const en=$('#enemy');en.classList.add('hstop');await wait((tier>=3?60:tier>=2?30:0)+ex);en.classList.remove('hstop')}
function toast(title,msg){
  const t=$('#toast');const el=document.createElement('div');el.className='tmsg';el.innerHTML=(title?`<b>${title}</b>`:'')+(msg||'');
  t.appendChild(el);while(t.children.length>3)t.firstChild.remove();setTimeout(()=>el.remove(),2300);
}
let speechT=0;
function say(line){
  if(!line)return;{const fk=LINE_FACE.get(line);if(fk)setFace(fk,Math.max(2800,line.length*85))}const sp=$('#speech');sp.hidden=false;sp.style.opacity=1;sp.textContent=line;
  clearTimeout(speechT);speechT=setTimeout(hideSpeech,Math.max(2800,line.length*85));
}
function hideSpeech(){$('#speech').hidden=true;clearTimeout(speechT)}

/* ================= 화면 전환 팁 (웹게임 문서: 게임 팁 · 세계관 한 줄) ================= */
const TIPS=['카드를 한 번 누르면 뒤집혀서 자세한 설명을 볼 수 있습니다.',
  '적중률은 내 명중에서 상대 회피를 뺀 만큼 정해집니다. 회피가 높은 적에게는 공격이 자주 빗나갑니다.',
  '노르드교 단원은 체력이 절반 아래로 떨어지면 도망칩니다. 도망치면 보상을 얻을 수 없습니다.',
  '순수유물주의자 앞에서 특수무기를 휘두르면, 그녀는 그것을 용서하지 않습니다.'];
const WORLD=['세계수는 꼭대기부터 촛불처럼 타들어 가고 있다.','미드가르드에는 이제 막이 없다. 이곳에서 결핍은 자연스러운 것이다.',
  '니다벨리르는 스스로 세계수와의 연결을 도려냈다.','은빛 기사들은 미드가르드 식량의 7할을 만든다. 그들에게는 자아가 없다.',
  '노르드교에는 고정된 위계가 없다. 뜻이 같다면 적도 형제다.','미미르의 샘은 대가를 후불로 받는다.','1단화는 미드가르드에서 석 달을 살 수 있는 돈이다.',
  '신들은 모두 이름에 마침표를 찍었다.','레바테인은 마침표가 찍힌 자들의 무기를 흉내 낸다.','다인슬레이프는 주인의 신념에 영향 받는다.','막은 세계수에서 열린 과피다','지역은 세계수에 매달린 열매다.',
  '멸망과 리셋. 어울리지 않는 두 단어가 붙어 있었다.','모든 존재는 자신이 무엇을 박탈당했는지도 모른 채, 결핍에 조종당했다.','신들의 이름에, 하나둘 마침표가 찍혔다.','수르트의 검은 신들의 무기 모습을 흉내 냈다.','라그나로크는 끝나야 했다. 세계수가 불타는 것 말고는, 아무것도 끝나지 않았다.','— 드워프님들은 언제 돌아오시냐고.',
  '헬헤임은 유일하게 세계수에서 떨어져 나온 열매다.','하늘에서 떨어지는 마실 수 있는 액체는 \'비\'다.','니다벨리르에서 돈이 없다며 약한 소리를 하면, 아랫지형으로 보내 버리라는 농담이 있다.'];
/* 다인을 골랐을 때만 로딩 화면에 확률적으로 (V31.17.5) */
const DAIN_WORLD=['세상에서 가장 많이 거인을 죽인 자는, 끝내 스스로를 먹어치웠다.'];
let veilT=0;
let veilTok=0;
function transition(fn){
  if(!SET.tips||REDUCED){fn();return}
  const dn=(S.run&&S.run.mode==='dain'&&!['title','modes'].includes(S.screen)),dw=dn&&rnd()<.25,isW=dw||rnd()<.3;
  const v=$('#veil'),line=dw?pick(DAIN_WORLD):isW?pick(WORLD):pick(TIPS),tok=++veilTok;
  v.querySelector('.vlbl').textContent=isW?'':'팁';v.querySelector('.vtip').textContent=line;v.classList.toggle('world',isW);
  v.hidden=false;v.classList.remove('in');void v.offsetWidth;v.classList.add('in');
  let ran=false,done=false;clearTimeout(veilT);
  const finish=()=>{if(done||!ran||tok!==veilTok)return;done=true;clearTimeout(veilT);v.classList.remove('in');setTimeout(()=>{if(tok===veilTok)v.hidden=true},320)};
  setTimeout(()=>{if(tok!==veilTok){fn();return}ran=true;fn();veilT=setTimeout(finish,Math.min(2400,Math.max(1100,line.length*30)))},280);
  v.onclick=finish;
}
function confirmBox(title,text,okLabel,onOk){
  const m=$('#modal');m.hidden=false;
  m.innerHTML=`<div class="panel" style="width:min(560px,100%);text-align:center;align-items:center"><div class="ptitle">${title}</div><div class="ptext" style="text-align:center">${text}</div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><button class="btn-ghost" id="cfNo">취소</button><button class="btn-main" id="cfOk">${okLabel}</button></div></div>`;
  $('#cfNo').onclick=closeModal;$('#cfOk').onclick=()=>{closeModal();onOk()};
}

function cardName(id,inst){const rd=inst&&S.C&&S.screen==='combat'&&S.C.redef&&S.C.redef[inst.uid];return (rd&&rd.name||(inst&&inst.nick)||CARDS[id].name)}

/* 신화 빌드 덱 (문서 장수) */
const MYTH_DECK={odin:[['o_mark',3],['o_pierce',3],['o_mimir',2],['o_recall',1],['o_shatter',1]],thor:[['t_swing',3],['t_throw',1],['t_hunt',3],['t_bolt',2],['t_thunder',1]],surt:[['s_ignite',2],['s_burn',2],['s_chase',2],['s_strike',2],['s_ragnarok',1]]};
