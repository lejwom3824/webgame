"use strict";
/* ================= layout ================= */
const L={
  land:{W:1600,H:900,cfs:11.5,dropY:600,ex:800,efeet:560,ew:290,eh:380,horizon:470},
  port:{W:900,H:1600,cfs:12.5,dropY:1040,ex:450,efeet:700,ew:330,eh:440,horizon:560},
};
const S={orient:'land',scale:1,screen:'title',run:null,C:null,H:null,busy:false,bg:'tree',titleMenu:false,ap:null};
const stage=$('#stage'),box=$('#box');

function fit(){
  const w=$('#wrap');const cs=getComputedStyle(w);
  const aw=w.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  const ah=w.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
  const o=aw>=ah?'land':'port';
  const {W,H}=L[o];const s=Math.min(aw/W,ah/H);
  box.style.width=Math.floor(W*s)+'px';box.style.height=Math.floor(H*s)+'px';
  stage.style.transform=`scale(${s})`;S.scale=s;
  if(o!==S.orient){S.orient=o;stage.className=o;paintBG();rerender();}
}
function stageXY(e){const r=box.getBoundingClientRect();return{x:(e.clientX-r.left)/S.scale,y:(e.clientY-r.top)/S.scale}}

/* ================= background (미드가르드) ================= */
let staticBG=null,ash=[];
function paintBG(){
  const o=S.orient,{W,H,horizon:hz}=L[o];
  const cv=$('#bg');cv.width=W;cv.height=H;
  const off=document.createElement('canvas');off.width=W;off.height=H;const g=off.getContext('2d');
  const r=mulberry(11);
  let sky=g.createLinearGradient(0,0,0,hz);
  sky.addColorStop(0,'#1f252c');sky.addColorStop(.5,'#3c434b');sky.addColorStop(.85,'#6c6962');sky.addColorStop(1,'#8b8072');
  g.fillStyle=sky;g.fillRect(0,0,W,hz+2);
  const sx=W*.64,sy=hz-H*.16;
  let sun=g.createRadialGradient(sx,sy,0,sx,sy,W*.28);sun.addColorStop(0,'rgba(236,214,180,.55)');sun.addColorStop(.15,'rgba(220,196,160,.25)');sun.addColorStop(1,'rgba(220,196,160,0)');
  g.fillStyle=sun;g.fillRect(0,0,W,hz);
  g.fillStyle='rgba(240,226,200,.7)';g.beginPath();g.arc(sx,sy,W*.022,0,7);g.fill();
  // ash clouds
  for(let i=0;i<14;i++){const cx=r()*W,cy=r()*hz*.6,rw=W*(.15+r()*.25);let cg=g.createRadialGradient(cx,cy,0,cx,cy,rw);cg.addColorStop(0,'rgba(20,22,26,.35)');cg.addColorStop(1,'rgba(20,22,26,0)');g.fillStyle=cg;g.fillRect(0,0,W,hz)}
  // far range
  g.fillStyle='#4d4f53';g.beginPath();g.moveTo(0,hz);let y=hz-H*.08;
  for(let x=0;x<=W;x+=W/40){y=clamp(y+(r()-.5)*H*.03,hz-H*.12,hz-H*.03);g.lineTo(x,y)}g.lineTo(W,hz);g.fill();
  // ruined city + cathedral of the Norns
  g.fillStyle='#34373c';
  for(let x=0;x<W;){const bw=W*(.012+r()*.03),bh=H*(.02+r()*.07);if(r()>.25){g.fillRect(x,hz-bh,bw,bh);if(r()>.6){g.beginPath();g.moveTo(x,hz-bh);g.lineTo(x+bw/2,hz-bh-H*.04*r());g.lineTo(x+bw,hz-bh);g.fill()}}x+=bw+W*.004}
  const cx0=W*(o==='land'?.36:.6);g.fillStyle='#2a2c31';
  [[-.035,.17],[0,.24],[.035,.17]].forEach(([dx,hh])=>{const bx=cx0+dx*W,bw=W*.018;g.fillRect(bx-bw/2,hz-H*hh*.7,bw,H*hh*.7);g.beginPath();g.moveTo(bx-bw/2-4,hz-H*hh*.7);g.lineTo(bx,hz-H*hh);g.lineTo(bx+bw/2+4,hz-H*hh*.7);g.fill()});
  g.fillRect(cx0-W*.05,hz-H*.09,W*.1,H*.09);
  // haze over horizon
  let hzg=g.createLinearGradient(0,hz-H*.12,0,hz+H*.06);hzg.addColorStop(0,'rgba(140,130,118,0)');hzg.addColorStop(.6,'rgba(140,130,118,.45)');hzg.addColorStop(1,'rgba(60,56,50,0)');
  g.fillStyle=hzg;g.fillRect(0,hz-H*.12,W,H*.18);
  // ground
  let gr=g.createLinearGradient(0,hz,0,H);gr.addColorStop(0,'#4a453e');gr.addColorStop(.35,'#2b2823');gr.addColorStop(1,'#110f0c');
  g.fillStyle=gr;g.fillRect(0,hz,W,H-hz);
  // ash-covered road toward the vanishing point
  const vx=W/2;g.fillStyle='rgba(150,142,128,.16)';g.beginPath();g.moveTo(vx-W*.01,hz);g.lineTo(vx+W*.01,hz);g.lineTo(vx+W*.42,H);g.lineTo(vx-W*.42,H);g.fill();
  g.strokeStyle='rgba(20,18,14,.35)';g.lineWidth=3;
  for(const k of[-.18,.18]){g.beginPath();g.moveTo(vx+k*W*.02,hz);g.lineTo(vx+k*W*1.6,H);g.stroke()}
  for(let i=0;i<260;i++){const t=r(),yy=hz+(H-hz)*t*t,xx=r()*W;g.fillStyle=`rgba(${r()>.5?210:30},${r()>.5?200:28},190,${.05+r()*.08})`;g.fillRect(xx,yy,2+t*8,1+t*3)}
  // world tree trunk (Yggdrasil) at the edge
  const tx=o==='land'?W*.03:-W*.06,tw=o==='land'?W*.17:W*.3;
  let tg=g.createLinearGradient(tx,0,tx+tw,0);tg.addColorStop(0,'#0f0d0b');tg.addColorStop(.55,'#2a231d');tg.addColorStop(.8,'#3a3027');tg.addColorStop(1,'#1a1612');
  g.fillStyle=tg;g.beginPath();g.moveTo(tx-20,H);g.bezierCurveTo(tx+tw*.1,hz,tx+tw*.05,hz*.4,tx+tw*.15,-10);g.lineTo(tx+tw*.95,-10);g.bezierCurveTo(tx+tw*.85,hz*.4,tx+tw*.9,hz,tx+tw*1.5,H);g.fill();
  g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=2;
  for(let i=0;i<34;i++){const bx=tx+tw*(.2+r()*.7);g.beginPath();g.moveTo(bx,-10);g.bezierCurveTo(bx+(r()-.5)*30,hz*.5,bx+(r()-.5)*40,hz,bx+(bx-tx-tw*.5)*.8,H);g.stroke()}
  g.strokeStyle='rgba(120,100,80,.18)';g.lineWidth=1.5;
  for(let i=0;i<20;i++){const bx=tx+tw*(.3+r()*.6);g.beginPath();g.moveTo(bx,-10);g.bezierCurveTo(bx+(r()-.5)*20,hz*.5,bx,hz,bx+30,H);g.stroke()}
  // roots: tapered strokes spreading from the trunk
  g.lineCap='round';
  for(let i=0;i<6;i++){const sy2=hz+(H-hz)*(.18+i*.15),len=W*(.12+r()*.22),x0=tx+tw*(.75+r()*.2);
    const pts=[[x0,sy2-30],[x0+len*.35,sy2-24+r()*20],[x0+len*.7,sy2+r()*24],[x0+len,sy2+10+r()*20]];
    for(let k=0;k<3;k++){const w=(1-k/3)*(10+i*3);g.strokeStyle=k?'#15120f':'#1d1915';g.lineWidth=w;
      g.beginPath();g.moveTo(pts[k][0],pts[k][1]);g.quadraticCurveTo((pts[k][0]+pts[k+1][0])/2,pts[k][1]-6,pts[k+1][0],pts[k+1][1]);g.stroke()}}
  // vignette
  let vg=g.createRadialGradient(W/2,H*.45,Math.min(W,H)*.3,W/2,H*.5,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.7)');
  g.fillStyle=vg;g.fillRect(0,0,W,H);
  staticBG=off;
  const n=o==='land'?90:110;ash=[];
  for(let i=0;i<n;i++)ash.push({x:rnd()*W,y:rnd()*H,v:.25+rnd()*.7,d:(rnd()-.5)*.4,s:1+rnd()*2.6,a:.25+rnd()*.5,ph:rnd()*6,em:rnd()<.06});
  buildTree();drawBG(performance.now());
}
function drawBG(t){
  const cv=$('#bg'),g=cv.getContext('2d');g.setTransform(1,0,0,1,0,0);
  if(S.bg==='view')return drawView(g,t);
  if(S.bg==='tree')return drawTree(t);
  if(S.bg==='black'){g.fillStyle='#000';g.fillRect(0,0,cv.width,cv.height);return}
  if(S.bg==='nida')return drawNida(g,t);
  if(S.bg==='scene'&&drawScene(g,t))return;
  if(!staticBG)return;
  g.drawImage(staticBG,0,0);drawAsh(g,t);
}
function drawAsh(g,t){
  const cv=g.canvas;
  for(const p of ash){
    if(!REDUCED){p.y+=p.v;p.x+=p.d+Math.sin(t/1400+p.ph)*.35;if(p.y>cv.height+5){p.y=-5;p.x=rnd()*cv.width}}
    g.fillStyle=p.em?`rgba(228,138,70,${p.a})`:`rgba(205,198,186,${p.a})`;
    g.fillRect(p.x,p.y,p.s,p.s*.8);
  }
}

/* ================= title scene: looking up at Yggdrasil, fire creeping down ================= */
const TREE={tall:0,cam:0,from:0,to:0,t0:0,dur:0,pos:'top',layer:null,mask:null,fire:null,start:performance.now(),embers:[]};
function taper(p,x0,y0,qx,qy,x1,y1,w0,w1){
  const N=18,A=[],B=[];
  for(let i=0;i<=N;i++){const t=i/N,mt=1-t;
    const x=mt*mt*x0+2*mt*t*qx+t*t*x1,y=mt*mt*y0+2*mt*t*qy+t*t*y1;
    const dx=2*mt*(qx-x0)+2*t*(x1-qx),dy=2*mt*(qy-y0)+2*t*(y1-qy),len=Math.hypot(dx,dy)||1,w=(w0+(w1-w0)*t)/2;
    A.push([x-dy/len*w,y+dx/len*w]);B.push([x+dy/len*w,y-dx/len*w]);}
  p.moveTo(A[0][0],A[0][1]);A.forEach(q=>p.lineTo(q[0],q[1]));B.reverse().forEach(q=>p.lineTo(q[0],q[1]));p.closePath();
}
function buildTree(){
  const o=S.orient,{W,H}=L[o],TH=Math.round(H*1.45);TREE.tall=TH;
  const lay=document.createElement('canvas');lay.width=W;lay.height=TH;const g=lay.getContext('2d');
  const r=mulberry(23);
  let sky=g.createLinearGradient(0,0,0,TH);
  sky.addColorStop(0,'#1f110b');sky.addColorStop(.25,'#2b211c');sky.addColorStop(.6,'#3b3a37');sky.addColorStop(.86,'#6d675d');sky.addColorStop(1,'#3a352d');
  g.fillStyle=sky;g.fillRect(0,0,W,TH);
  for(let i=0;i<18;i++){const cx=r()*W,cy=r()*TH*.7,rw=W*(.15+r()*.3);const cg=g.createRadialGradient(cx,cy,0,cx,cy,rw);cg.addColorStop(0,'rgba(12,10,9,.42)');cg.addColorStop(1,'rgba(12,10,9,0)');g.fillStyle=cg;g.fillRect(0,0,W,TH)}
  const gy=TH*.9;
  g.fillStyle='#4a4741';for(let x=0;x<W;){const bw=W*(.01+r()*.03),bh=TH*(.005+r()*.02);if(r()>.3)g.fillRect(x,gy-bh,bw,bh);x+=bw+W*.006}
  let gr=g.createLinearGradient(0,gy,0,TH);gr.addColorStop(0,'#3e3a33');gr.addColorStop(1,'#0f0d0b');g.fillStyle=gr;g.fillRect(0,gy,W,TH-gy);
  const cx=W/2,land=o==='land',bw=land?W*.5:W*.8,tw=land?W*.09:W*.17;
  const tree=new Path2D();
  tree.moveTo(cx-bw*.62,TH+5);
  tree.bezierCurveTo(cx-bw*.5,gy,cx-bw*.28,gy-TH*.05,cx-tw*1.1,TH*.58);
  tree.bezierCurveTo(cx-tw*.75,TH*.4,cx-tw*.6,TH*.22,cx-tw*.5,-20);
  tree.lineTo(cx+tw*.5,-20);
  tree.bezierCurveTo(cx+tw*.6,TH*.22,cx+tw*.75,TH*.4,cx+tw*1.1,TH*.58);
  tree.bezierCurveTo(cx+bw*.28,gy-TH*.05,cx+bw*.5,gy,cx+bw*.62,TH+5);tree.closePath();
  const br=new Path2D();
  const BR=[[-1,.05,1.15,-.05,.9],[1,.07,1.2,-.04,1],[-1,.16,1.25,.02,.85],[1,.2,1.3,.06,.8],[-1,.3,1.3,.16,.7],[1,.34,1.25,.22,.65],[-1,.02,.6,-.08,.6],[1,0,.7,-.1,.55]];
  for(const[s0,y0,reach,y1,wf]of BR){const x0=cx+s0*tw*.4,yy0=TH*y0;taper(br,x0,yy0+tw*.3,cx+s0*W*.3*reach,yy0+TH*.045,cx+s0*W*.5*reach,TH*(y1-.07),tw*.55*wf,5)}
  for(let i=0;i<26;i++){const s0=r()<.5?-1:1,y0=TH*(r()*.32),x0=cx+s0*W*(.12+r()*.32),x1=x0+s0*W*(.06+r()*.14),y1=y0-TH*(.02+r()*.06);taper(br,x0,y0,(x0+x1)/2,y0+TH*.012,x1,y1-TH*.02,8+r()*10,2)}
  const rt=new Path2D();for(let i=0;i<7;i++){const s0=i%2?1:-1,x0=cx+s0*bw*(.25+r()*.25),y0=gy+TH*(.01+r()*.05),x1=cx+s0*W*(.45+r()*.25),y1=gy+TH*(.04+r()*.07);taper(rt,x0,y0,(x0+x1)/2,y0-TH*.01,x1,y1,26+r()*20,4)}
  const bark=g.createLinearGradient(cx-bw/2,0,cx+bw/2,0);bark.addColorStop(0,'#090807');bark.addColorStop(.35,'#1d1814');bark.addColorStop(.6,'#2e2620');bark.addColorStop(1,'#0c0a08');
  g.fillStyle='#120f0c';g.fill(br);g.fill(rt);g.fillStyle=bark;g.fill(tree);
  g.save();g.clip(tree);g.lineWidth=2;
  for(let i=0;i<60;i++){const u=r(),bx=cx+(u-.5)*bw*1.1;g.strokeStyle=`rgba(0,0,0,${.25+r()*.3})`;g.beginPath();g.moveTo(bx,TH);g.bezierCurveTo(bx+(r()-.5)*30,TH*.7,cx+(u-.5)*tw*2,TH*.35,cx+(u-.5)*tw,-20);g.stroke()}
  for(let i=0;i<30;i++){const u=r(),bx=cx+(u-.5)*bw;g.strokeStyle='rgba(150,120,90,.08)';g.beginPath();g.moveTo(bx,TH);g.bezierCurveTo(bx,TH*.7,cx+(u-.5)*tw*2,TH*.35,cx+(u-.5)*tw,-20);g.stroke()}
  g.restore();
  let vg=g.createLinearGradient(0,0,W,0);vg.addColorStop(0,'rgba(0,0,0,.55)');vg.addColorStop(.25,'rgba(0,0,0,0)');vg.addColorStop(.75,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=vg;g.fillRect(0,0,W,TH);
  const mk=document.createElement('canvas');mk.width=Math.ceil(W/2);mk.height=Math.ceil(TH/2);const m=mk.getContext('2d');m.scale(.5,.5);m.fillStyle='#fff';m.fill(tree);m.fill(br);
  const fc=document.createElement('canvas');fc.width=mk.width;fc.height=mk.height;
  TREE.layer=lay;TREE.mask=mk;TREE.fire=fc;TREE.dur=0;TREE.cam=TREE.pos==='bottom'?TH-H:0;
  TREE.embers=[...Array(36)].map(()=>({x:W*.3+rnd()*W*.4,y:rnd()*H,v:.4+rnd()*1.1,ph:rnd()*6,s:1+rnd()*2.2}));
}
function panTo(pos,animate){
  TREE.pos=pos;const to=pos==='top'?0:TREE.tall-L[S.orient].H;
  if(animate&&!REDUCED){TREE.from=TREE.cam;TREE.to=to;TREE.t0=performance.now();TREE.dur=2400}else{TREE.cam=to;TREE.dur=0}
  if(REDUCED)drawBG(performance.now());
}
function setBG(m){S.bg=m;if(REDUCED)drawBG(performance.now())}
/* 1장 막별 배경 — 1~11막 마을 길 · 12~13막 탑 입구 앞 광장 · 14막 탑 꼭대기 테라스 · 15막 탑 안 회랑 */
const SCENE_IMG={road:'img/bg/road.webp',plaza:'img/bg/plaza.webp',terrace:'img/bg/terrace.webp',inside:'img/bg/inside.webp'};
const SCENE_ASH={road:1,plaza:1,terrace:1,inside:0};
const SCI={};for(const k in SCENE_IMG){const im=new Image();im.onload=()=>{if(S.bg==='scene')drawBG(performance.now())};im.src=SCENE_IMG[k];SCI[k]=im}
const sceneKey=()=>{const f=(S.run&&S.run.floor)||0;return f>=15?'inside':f===14?'terrace':f>=12?'plaza':'road'};
function drawScene(g,t){const im=SCI[sceneKey()];if(!im||!im.complete||!im.naturalWidth)return false;
  const{W,H,efeet}=L[S.orient],port=S.orient==='port',iw=im.naturalWidth,ih=im.naturalHeight;
  /* 적 발끝이 그림 높이의 62% 바닥에 오도록 — 세로 모드는 위쪽만 채움 */
  const Hs=port?Math.round(efeet/.62):H,sc=Math.max(W/iw,Hs/ih),dw=iw*sc,dh=ih*sc;
  g.fillStyle='#0b0a09';g.fillRect(0,0,W,H);g.drawImage(im,(W-dw)/2,Hs-dh,dw,dh);
  if(port){const fg=g.createLinearGradient(0,Hs-H*.12,0,Hs);fg.addColorStop(0,'rgba(11,10,9,0)');fg.addColorStop(1,'rgba(11,10,9,1)');g.fillStyle=fg;g.fillRect(0,Hs-H*.12,W,H*.12)}
  else{const fg=g.createLinearGradient(0,H*.62,0,H);fg.addColorStop(0,'rgba(8,7,6,0)');fg.addColorStop(1,'rgba(8,7,6,.78)');g.fillStyle=fg;g.fillRect(0,H*.62,W,H*.38)}
  const vg=g.createRadialGradient(W/2,Hs*.45,Math.min(W,Hs)*.35,W/2,Hs*.5,Math.max(W,Hs)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=vg;g.fillRect(0,0,W,Hs);
  if(SCENE_ASH[sceneKey()])drawAsh(g,t);return true}
/* ================= 그림 배경 — 다가갈수록 안쪽이 보임 (막이 오를수록 확대) ================= */
const BGI={};for(const k in BGIMG){const im=new Image();im.onload=()=>{if(S.bg==='view')drawBG(performance.now())};im.src=BGIMG[k];BGI[k]=im}
/* fx, fy: 다가가는 곳(소실점) · ash: 재 · glow: 세계수 꼭대기 불빛 위치 */
const VKEY={road1:{fx:.5,fy:.66,ash:1,glow:[.5,.12]},road2:{fx:.5,fy:.68,ash:1,glow:[.5,.14]},road3:{fx:.5,fy:.66,ash:1,glow:[.5,.12]},road4:{fx:.5,fy:.69,ash:1,glow:[.5,.14]},
  front:{fx:.5,fy:.66,ash:1,glow:[.5,.12],dim:.28,gy:.765},inside:{fx:.5,fy:.66,ash:0,flame:[.5,.63],dim:.12,gy:.765},rest:{fx:.55,fy:.78,ash:.6,fire:[.55,.8]},shop:{fx:.45,fy:.62,ash:.4}};
const VIEW={key:null,z:1,from:1,to:1,t0:0,dur:0,prev:null,pz:1,f0:0,fdur:0,loop:false,intro:null};
function setView(key,zoom=1,o={}){
  const now=performance.now();
  if(S.bg!=='view'||VIEW.key!==key){VIEW.prev=S.bg==='view'?VIEW.key:null;VIEW.pz=VIEW.z;VIEW.popt=VIEW.opt;VIEW.f0=now;VIEW.fdur=o.fade??(VIEW.prev?700:0);VIEW.key=key;VIEW.z=o.from??zoom;}
  VIEW.from=VIEW.z;VIEW.to=zoom;VIEW.t0=now;VIEW.dur=o.dur??1100;VIEW.loop=!!o.loop;VIEW.opt=o.region?{Hs:o.region,lift:o.lift||0}:{lift:o.lift||0};
  S.bg='view';if(REDUCED){VIEW.z=zoom;VIEW.dur=0;VIEW.fdur=0;drawBG(now)}
}
const ease=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
/* 그림 배치 — Hs: 그림이 차지하는 위쪽 높이(세로 모드 전투는 위쪽만), lift: 바닥선을 위로 올리는 양 */
function coverXf(key,z,W,H,o={}){
  const im=BGI[key],v=VKEY[key];if(!im||!im.naturalWidth)return null;
  const Hs=o.Hs||H,iw=im.naturalWidth,ih=im.naturalHeight,s0=Math.max(W/iw,Hs/ih),s=s0*z;
  const px=(W-iw*s0)/2+v.fx*iw*s0,py=(Hs-ih*s0)/2+v.fy*ih*s0;
  let x=px-v.fx*iw*s,y=py-v.fy*ih*s-(o.lift||0);x=clamp(x,W-iw*s,0);y=clamp(y,Hs-ih*s,0);
  return{x,y,s,iw,ih,Hs};
}
function coverDraw(g,key,z,W,H,alpha,o={}){
  const im=BGI[key];if(!im||!im.complete||!im.naturalWidth)return false;
  const m=coverXf(key,z,W,H,o);if(!m)return false;
  g.save();if(m.Hs<H){g.beginPath();g.rect(0,0,W,m.Hs);g.clip()}
  g.globalAlpha=alpha;g.drawImage(im,m.x,m.y,m.iw*m.s,m.ih*m.s);g.globalAlpha=1;g.restore();
  return m;
}
/* 전투 배경의 바닥선 — 적의 발이 놓이는 높이 */
function sceneGround(){
  const{W,H}=L[S.orient],v=VKEY[VIEW.key];if(!v||!v.gy)return null;
  const m=coverXf(VIEW.key,VIEW.to,W,H,VIEW.opt||{});if(!m)return null;
  return Math.round(m.y+v.gy*m.ih*m.s);
}
function drawView(g,t){
  const{W,H}=L[S.orient];g.fillStyle='#08090a';g.fillRect(0,0,W,H);
  if(VIEW.intro)return drawIntro(g,t,W,H);
  if(VIEW.dur){const k=clamp((t-VIEW.t0)/VIEW.dur,0,1);VIEW.z=VIEW.from+(VIEW.to-VIEW.from)*ease(k);if(k>=1)VIEW.dur=0}
  let z=VIEW.z;if(VIEW.loop&&!REDUCED)z*=1+.012*Math.sin(t/4200);
  const fa=VIEW.fdur?clamp((t-VIEW.f0)/VIEW.fdur,0,1):1;
  const op=VIEW.opt||{};
  if(VIEW.prev&&fa<1)coverDraw(g,VIEW.prev,VIEW.pz,W,H,1,VIEW.popt||{});
  const m=coverDraw(g,VIEW.key,z,W,H,fa,op);if(fa>=1){VIEW.prev=null;VIEW.popt=op}
  viewFx(g,t,VIEW.key,m,W,H,VIEW.loop);
  if(op.Hs&&op.Hs<H){/* 세로 모드: 그림 아래는 어둡게 이어 붙임 */const gg=g.createLinearGradient(0,op.Hs-140,0,op.Hs+40);gg.addColorStop(0,'rgba(9,10,12,0)');gg.addColorStop(1,'rgba(9,10,12,1)');g.fillStyle=gg;g.fillRect(0,op.Hs-140,W,180);g.fillStyle='#090a0c';g.fillRect(0,op.Hs+40,W,H)}
}
/* 반복 애니메이션: 세계수 불빛이 일렁이고, 안개가 흐르고, 불티가 오르고, 재가 내림 */
function viewFx(g,t,key,m,W,H,loop){
  const v=VKEY[key];if(!m)return;
  const at=(fx,fy)=>[m.x+fx*m.iw*m.s,m.y+fy*m.ih*m.s];
  if(v.glow&&!REDUCED){const[gx,gy]=at(...v.glow),f=.55+.25*Math.sin(t/700)+.12*Math.sin(t/233+1.7);
    g.globalCompositeOperation='lighter';const rg=g.createRadialGradient(gx,gy,0,gx,gy,W*.32);rg.addColorStop(0,`rgba(230,110,40,${.16*f})`);rg.addColorStop(1,'rgba(230,110,40,0)');g.fillStyle=rg;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';
    if(loop)emberFx(g,t,gx,gy,W,H)}
  if(v.flame&&!REDUCED){const[gx,gy]=at(...v.flame),f=.6+.3*Math.sin(t/380)+.1*Math.sin(t/97);
    g.globalCompositeOperation='lighter';const rg=g.createRadialGradient(gx,gy,0,gx,gy,W*.18);rg.addColorStop(0,`rgba(255,255,255,${.22*f})`);rg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=rg;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over'}
  if(v.fire&&!REDUCED){const[gx,gy]=at(...v.fire),f=.6+.3*Math.sin(t/160)+.15*Math.sin(t/61);
    g.globalCompositeOperation='lighter';const rg=g.createRadialGradient(gx,gy,0,gx,gy,W*.22);rg.addColorStop(0,`rgba(255,150,60,${.2*f})`);rg.addColorStop(1,'rgba(255,150,60,0)');g.fillStyle=rg;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';emberFx(g,t,gx,gy-H*.04,W,H,.5)}
  if(loop&&!REDUCED){/* 흐르는 안개 */
    for(let i=0;i<2;i++){const ox=((t*(.012+i*.007))%(W*2))-W*.5,yy=H*(.5+i*.08);const fg=g.createRadialGradient(ox,yy,0,ox,yy,W*.5);fg.addColorStop(0,'rgba(170,165,158,.09)');fg.addColorStop(1,'rgba(170,165,158,0)');g.fillStyle=fg;g.fillRect(0,0,W,H)}}
  if(v.dim){g.fillStyle=`rgba(6,7,9,${v.dim})`;g.fillRect(0,0,W,H)}
  if(v.ash){g.globalAlpha=v.ash;drawAsh(g,t);g.globalAlpha=1}
  const vb=m.Hs||H,vg=g.createLinearGradient(0,vb*.62,0,vb);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=vg;g.fillRect(0,vb*.62,W,vb*.38);
}
const EMB=[...Array(40)].map(()=>({u:rnd(),p:rnd(),v:.5+rnd(),s:1+rnd()*2.2,ph:rnd()*6}));
function emberFx(g,t,cx,cy,W,H,k=1){
  for(const e of EMB){const life=((t/1000*e.v*.18)+e.p)%1,x=cx+(e.u-.5)*W*.42*k+Math.sin(t/600+e.ph)*14,y=cy+H*.22*k-life*H*.5*k;
    const a=Math.sin(life*Math.PI)*.75;g.fillStyle=`rgba(255,${150+((e.ph*40)|0)%70},70,${a})`;g.fillRect(x,y,e.s,e.s)}
}
/* 인트로: 마을 길 4장을 차례로 다가가며 보여 주고, 마지막 장이 타이틀 반복 화면이 됨 */
const INTRO_SEQ=['road1','road2','road4','road3'],INTRO_SEG=3200,INTRO_FADE=1100;
/* V32 인트로 영상 — 세상은 멸망했다 … 푸른 세상이 보고 싶다 (웹게임 문서 '인트로 (우선)') */
function introFilm(cv, done, titleLoop) {

  const g = cv.getContext('2d');
  const W = 1600, H = 900;
  const REDUCED = false;

  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = k => k <= 0 ? 0 : k >= 1 ? 1 : k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const sm = k => { k = clamp(k); return k * k * (3 - 2 * k); };
  const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  // 시간표(초)와 대사
  const T = { s1: [0, 6.6], end: 6.6 };

  // 테이퍼 가지
  function taper(p, x0, y0, qx, qy, x1, y1, w0, w1) {
    const N = 18, A = [], B = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, mt = 1 - t;
      const x = mt * mt * x0 + 2 * mt * t * qx + t * t * x1, y = mt * mt * y0 + 2 * mt * t * qy + t * t * y1;
      const dx = 2 * mt * (qx - x0) + 2 * t * (x1 - qx), dy = 2 * mt * (qy - y0) + 2 * t * (y1 - qy), len = Math.hypot(dx, dy) || 1, w = (w0 + (w1 - w0) * t) / 2;
      A.push([x - dy / len * w, y + dx / len * w]); B.push([x + dy / len * w, y - dx / len * w]);
    }
    p.moveTo(A[0][0], A[0][1]); A.forEach(q => p.lineTo(q[0], q[1])); B.reverse().forEach(q => p.lineTo(q[0], q[1])); p.closePath();
  }
  function clouds(c, r, n, h, a) {
    for (let i = 0; i < n; i++) {
      const cx = r() * W, cy = r() * h, rw = W * (.15 + r() * .3);
      const cg = c.createRadialGradient(cx, cy, 0, cx, cy, rw);
      cg.addColorStop(0, `rgba(12,10,9,${a})`); cg.addColorStop(1, 'rgba(12,10,9,0)');
      c.fillStyle = cg; c.fillRect(0, 0, W, h);
    }
  }
  function glow(c, x, y, rad, col, a) {
    c.save(); c.globalCompositeOperation = 'lighter';
    const rg = c.createRadialGradient(x, y, 0, x, y, rad);
    rg.addColorStop(0, `rgba(${col},${a})`); rg.addColorStop(1, `rgba(${col},0)`);
    c.fillStyle = rg; c.fillRect(0, 0, W, H); c.restore();
  }
  function vignette(c, a = .7) {
    const vg = c.createRadialGradient(W / 2, H * .45, H * .3, W / 2, H * .5, W * .75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${a})`);
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
  }

  // 재와 불티
  const R = mulberry(5);
  const ASH = [...Array(110)].map(() => ({ x: R() * W, y: R() * H, v: .25 + R() * .7, d: (R() - .5) * .4, s: 1 + R() * 2.6, a: .2 + R() * .45, ph: R() * 6, em: R() < .07 }));
  const EMB = [...Array(46)].map(() => ({ u: R(), p: R(), v: .5 + R(), s: 1 + R() * 2.2, ph: R() * 6 }));
  function drawAsh(t, k = 1) {
    for (const p of ASH) {
      if (!REDUCED) { p.y += p.v; p.x += p.d + Math.sin(t / 1.4 + p.ph) * .35; if (p.y > H + 5) { p.y = -5; p.x = R() * W; } }
      g.fillStyle = p.em ? `rgba(228,138,70,${p.a * k})` : `rgba(205,198,186,${p.a * k})`;
      g.fillRect(p.x, p.y, p.s, p.s * .8);
    }
  }
  function embers(t, cx, cy, spread, rise, k = 1) {
    for (const e of EMB) {
      const life = ((t * e.v * .18) + e.p) % 1;
      const x = cx + (e.u - .5) * spread + Math.sin(t * 1.6 + e.ph) * 14, y = cy - life * rise;
      const a = Math.sin(life * Math.PI) * .75 * k;
      g.fillStyle = `rgba(255,${150 + ((e.ph * 40) | 0) % 70},70,${a})`; g.fillRect(x, y, e.s, e.s);
    }
  }

  /* ============ 1. 하이앵글: 위에서 내려다본 세계수 줄기, 불이 위에서 아래로 번짐 ============ */
  const S1 = (() => {
    const r = mulberry(31), c = mk(), x = c.getContext('2d');
    const bg = x.createRadialGradient(W / 2, H * 1.1, 0, W / 2, H * 1.1, W * .8);
    bg.addColorStop(0, '#3a2014'); bg.addColorStop(.45, '#1a1412'); bg.addColorStop(1, '#07080a');
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    clouds(x, r, 12, H, .4);
    // 아득한 아래쪽 안개와 미드가르드 불빛
    const fog = x.createLinearGradient(0, H * .55, 0, H);
    fog.addColorStop(0, 'rgba(110,100,90,0)'); fog.addColorStop(1, 'rgba(110,96,84,.28)');
    x.fillStyle = fog; x.fillRect(0, H * .55, W, H * .45);
    // 줄기: 가까운 위쪽은 넓고, 아래로 갈수록 소실점으로 좁아짐
    const trunk = new Path2D();
    trunk.moveTo(W * .2, -20);
    trunk.bezierCurveTo(W * .3, H * .35, W * .42, H * .7, W * .465, H + 20);
    trunk.lineTo(W * .545, H + 20);
    trunk.bezierCurveTo(W * .6, H * .7, W * .72, H * .35, W * .82, -20);
    trunk.closePath();
    // 아래로 뻗어 내려가는 가지들
    const br = new Path2D();
    [[.3, .12, -1, .9], [.74, .18, 1, .85], [.37, .38, -1, .6], [.64, .44, 1, .55], [.43, .62, -1, .38], [.58, .66, 1, .34]].forEach(([u, v, s, k]) => {
      const x0 = W * u, y0 = H * v;
      taper(br, x0, y0, x0 + s * W * .16 * k, y0 + H * .08 * k, x0 + s * W * .34 * k, y0 + H * .3 * k, 70 * k, 6);
    });
    x.fillStyle = '#120f0c'; x.fill(br);
    const bark = x.createLinearGradient(W * .2, 0, W * .82, 0);
    bark.addColorStop(0, '#090807'); bark.addColorStop(.35, '#1d1814'); bark.addColorStop(.6, '#2e2620'); bark.addColorStop(1, '#0c0a08');
    x.fillStyle = bark; x.fill(trunk);
    x.save(); x.clip(trunk); x.lineWidth = 2;
    const grooves = [];
    for (let i = 0; i < 64; i++) {
      const u = r(), x0 = lerp(W * .2, W * .82, u), x1 = lerp(W * .465, W * .545, u), mx = lerp(x0, x1, .45) + (r() - .5) * 40;
      x.strokeStyle = `rgba(0,0,0,${.25 + r() * .3})`;
      x.beginPath(); x.moveTo(x0, -20); x.quadraticCurveTo(mx, H * .5, x1, H + 20); x.stroke();
      grooves.push({ x0, mx, x1, d: r() * .4, w: 1.2 + r() * 1.8, burn: r() < .42 });
    }
    for (let i = 0; i < 26; i++) {
      const u = r(), x0 = lerp(W * .2, W * .82, u), x1 = lerp(W * .465, W * .545, u);
      x.strokeStyle = 'rgba(150,120,90,.08)'; x.beginPath(); x.moveTo(x0, -20); x.quadraticCurveTo(lerp(x0, x1, .5), H * .5, x1, H + 20); x.stroke();
    }
    x.restore();
    // 줄기가 아래 어둠 속으로 사라짐
    const fade = x.createLinearGradient(0, H * .62, 0, H);
    fade.addColorStop(0, 'rgba(14,11,9,0)'); fade.addColorStop(1, 'rgba(14,11,9,.85)');
    x.fillStyle = fade; x.fillRect(0, H * .62, W, H * .38);
    return { c, trunk, grooves };
  })();
  function smoke(cx, cy, rad, t, a) {
    // 열기에 말려 오르는 연기 (스케치의 소용돌이를 흐리게)
    g.save();
    g.filter = 'blur(14px)';
    g.translate(cx, cy); g.rotate(t * .12);
    g.strokeStyle = `rgba(140,58,30,${a * .16})`; g.lineWidth = 26; g.lineCap = 'round';
    g.beginPath();
    for (let i = 0; i <= 60; i++) {
      const an = i / 60 * Math.PI * 3.4, rr = rad * (1 - i / 60 * .75);
      const px = Math.cos(an) * rr, py = Math.sin(an) * rr * 1.3 - i * .8;
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.stroke();
    g.restore();
  }
  function scene1(t, a) {
    const p = (t - T.s1[0]) / (T.s1[1] - T.s1[0]);
    g.save(); g.globalAlpha = a;
    const z = lerp(1, 1.07, ease(p));
    g.translate(W / 2, H * .4); g.scale(z, z); g.translate(-W / 2, -H * .4);
    g.drawImage(S1.c, 0, 0);
    // 균열을 따라 내려오는 불
    const fy = lerp(-H * .05, H * .78, ease(clamp(p * 1.1)));
    g.save(); g.clip(S1.trunk); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    for (const gv of S1.grooves) {
      if (!gv.burn) continue;
      const end = clamp((fy / H) - gv.d * .6, 0, 1);
      if (end <= 0) continue;
      const N = 28, n = Math.floor(N * end);
      const pt = i => { const u = i / N, mu = 1 - u; return [mu * mu * gv.x0 + 2 * mu * u * gv.mx + u * u * gv.x1, -20 + u * (H + 40)]; };
      for (const [lw, col] of [[gv.w * 4, 'rgba(176,60,20,.1)'], [gv.w * 1.4, 'rgba(230,110,40,.3)'], [gv.w * .5, 'rgba(255,214,140,.55)']]) {
        g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
        for (let i = 0; i <= n; i++) { const q = pt(i); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }
        g.stroke();
      }
    }
    // 불이 지나간 위쪽은 붉게 그을림
    const sc = g.createLinearGradient(0, -20, 0, fy);
    sc.addColorStop(0, 'rgba(150,40,12,.32)'); sc.addColorStop(.85, 'rgba(110,28,10,.12)'); sc.addColorStop(1, 'rgba(238,128,48,.22)');
    g.fillStyle = sc; g.fillRect(0, -20, W, fy + 20);
    g.restore();
    glow(g, W / 2, fy, W * .35, '220,110,40', .22);
    glow(g, W / 2, -H * .1, W * .5, '230,110,40', .18 + .05 * Math.sin(t * 1.4));
    smoke(W * .13, H * .3, 90, t, 1); smoke(W * .88, H * .38, 100, -t * .9, 1);
    g.restore();
    g.save(); g.globalAlpha = a; embers(t, W / 2, fy + 40, W * .5, H * .7); drawAsh(t); vignette(g, .75); g.restore();
  }

  // 장면 사이 페이드아웃
  function alphaOf(t, [a, b], fi = .9, fo = 1) {
    if (t < a - .001 || t > b) return 0;
    return Math.min(sm((t - a) / fi), sm((b - t) / fo));
  }

  let start = performance.now(), stop = false, raf = 0, held = false;
  function frame(now) {
    if (stop) return;
    let t = (now - start) / 1000;
    if (titleLoop) { if (t >= 5.6) { if (held) return; held = true; t = 5.6; } }
    else if (t >= T.end) { finish(); return; }
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#08090a'; g.fillRect(0, 0, W, H);
    const a1 = titleLoop ? 1 : (t < .9 ? sm(t / .9) * alphaOf(t, T.s1, .01) : alphaOf(t, T.s1, .01));
    if (a1) scene1(t, a1);
    raf = requestAnimationFrame(frame);
  }
  function finish() { if (stop) return; stop = true; cancelAnimationFrame(raf); done && done(); }
  raf = requestAnimationFrame(t0 => { start = t0; frame(t0); });
  return finish;
}
let titleStop=null;
function startTitleScene(){if($('#introFilm'))return;const st=$('#stage'),ov=document.createElement('div');ov.id='introFilm';ov.className='tscene';ov.style.pointerEvents='none';
  ov.innerHTML='<canvas width="1600" height="900" aria-label="세계수의 가지를 내려다보는 시작 화면"></canvas>';st.appendChild(ov);viewFor('title');titleStop=introFilm(ov.querySelector('canvas'),null,true)}
function endTitleScene(){if(titleStop){titleStop();titleStop=null}const o=$('#introFilm');if(o)o.remove()}
function drawIntro(g,t,W,H){
  const I=VIEW.intro,el=t-I.t0,n=INTRO_SEQ.length,total=n*INTRO_SEG;
  if(el>=total){endIntro();return drawView(g,t)}
  const i=Math.floor(el/INTRO_SEG),k=(el-i*INTRO_SEG)/INTRO_SEG;
  const zOf=(j,kk)=>j===n-1?1+.05*kk:1+.14*kk;
  if(i>0&&el-i*INTRO_SEG<INTRO_FADE)coverDraw(g,INTRO_SEQ[i-1],zOf(i-1,1+(el-i*INTRO_SEG)/INTRO_SEG),W,H,1);
  const fa=i===0?clamp(el/1400,0,1):clamp((el-i*INTRO_SEG)/INTRO_FADE,0,1);
  const m=coverDraw(g,INTRO_SEQ[i],zOf(i,k),W,H,fa);
  if(m)viewFx(g,t,INTRO_SEQ[i],m,W,H,false);
  if(i===0&&el<1400){g.fillStyle=`rgba(8,9,10,${1-el/1400})`;g.fillRect(0,0,W,H)}
}
function endIntro(){const I=VIEW.intro;if(!I)return;VIEW.intro=null;VIEW.key='road3';VIEW.prev=null;VIEW.z=1.05;VIEW.dur=0;VIEW.fdur=0;VIEW.loop=true;S.bg='view';I.done()}
/* 등반 중 배경 — 1~19막 동안 점점 다가감 */
const climbZ=(lo,hi)=>{const f=S.run?clamp((S.run.floor||0)/29,0,1):0;return lo+(hi-lo)*f};
function viewFor(kind){
  if(kind==='title'){setBG('tree');return}
  if(S.run&&S.run.act===2){S.bg='nida';if(REDUCED)drawBG(performance.now());return}
  setBG(S.run?'scene':'midgard');return;
  if(kind==='combat'){const E=S.C&&S.C.E,port=S.orient==='port',o=port?{region:860}:{lift:999};/* 가로: 그림 아랫단을 화면 아랫단에 맞춰 바닥선을 패 위로 올림 */
    if(E&&E.boss)return setView('inside',port?1.06:1.26,{from:port?1.14:1.34,dur:1600,...o});return setView('front',port?climbZ(1.02,1.24):climbZ(1.25,1.42),o)}
  if(kind==='rest')return setView('rest',1.04,{from:1,dur:2400});
  if(kind==='shop')return setView('shop',1.03,{from:1,dur:2400});
}

function drawTree(t){
  const g=$('#bg').getContext('2d'),{W,H}=L[S.orient],TH=TREE.tall;if(!TREE.layer)return;
  if(TREE.dur){const k=clamp((t-TREE.t0)/TREE.dur,0,1),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;TREE.cam=TREE.from+(TREE.to-TREE.from)*e;if(k>=1)TREE.dur=0}
  const cam=TREE.cam,yf=TH*(.36+Math.min(.26,(t-TREE.start)/1000*.0012));
  g.drawImage(TREE.layer,0,cam,W,H,0,0,W,H);
  const top=cam,bot=Math.min(yf+80,cam+H);
  if(bot>top){
    const f=TREE.fire,fg=f.getContext('2d');
    fg.setTransform(1,0,0,1,0,0);fg.globalCompositeOperation='source-over';fg.clearRect(0,0,f.width,f.height);fg.setTransform(.5,0,0,.5,0,0);
    const gr=fg.createLinearGradient(0,yf-TH*.22,0,yf+14);
    gr.addColorStop(0,'rgba(40,8,4,.92)');gr.addColorStop(.55,'rgba(150,40,12,.92)');gr.addColorStop(.86,'rgba(238,128,48,.95)');gr.addColorStop(.97,'rgba(255,214,140,.95)');gr.addColorStop(1,'rgba(255,214,140,0)');
    const wave=x=>26*Math.sin(x*.006+1.3+t*.00015)+14*Math.sin(x*.017-t*.0003);
    fg.fillStyle=gr;fg.beginPath();fg.moveTo(0,top);fg.lineTo(W,top);for(let x=W;x>=-20;x-=20)fg.lineTo(x,Math.min(bot+40,yf+wave(x)));fg.closePath();fg.fill();
    for(let i=0;i<40;i++){const x=(Math.sin(i*91.7)*.5+.5)*W,y=yf-((i*37)%100)/100*TH*.34,a=.25+.25*Math.sin(t/300+i);if(y<top||y>bot)continue;fg.fillStyle=`rgba(255,${120+((i*13)%60)},40,${a})`;fg.fillRect(x,y,4,2)}
    for(let x=-10;x<W+10;x+=12){const h=24+18*Math.sin(x*.045+t*.004)+12*Math.sin(x*.13-t*.009)+8*Math.sin(t*.02+x);
      fg.fillStyle=`rgba(255,${170+Math.round(40*Math.sin(x+t*.01))},80,.85)`;const b=yf+wave(x);fg.beginPath();fg.moveTo(x-9,b+8);fg.quadraticCurveTo(x-4,b-h*.5,x+3*Math.sin(t*.01+x),b-h);fg.quadraticCurveTo(x+4,b-h*.45,x+9,b+8);fg.fill()}
    fg.setTransform(1,0,0,1,0,0);fg.globalCompositeOperation='destination-in';fg.drawImage(TREE.mask,0,0);
    g.drawImage(f,0,cam/2,W/2,H/2,0,0,W,H);
  }
  const gy=yf-cam;
  if(gy>-H*.5&&gy<H*1.3){g.globalCompositeOperation='lighter';const rg=g.createRadialGradient(W/2,gy,0,W/2,gy,Math.max(W,H)*.45);rg.addColorStop(0,'rgba(220,110,40,.24)');rg.addColorStop(1,'rgba(220,110,40,0)');g.fillStyle=rg;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over'}
  for(const p of TREE.embers){if(!REDUCED){p.y-=p.v;p.x+=Math.sin(t/500+p.ph)*.6;if(p.y<-5){p.y=clamp(gy,20,H)+rnd()*60;p.x=W*.3+rnd()*W*.4}}g.fillStyle=`rgba(255,170,80,${.35+.3*Math.sin(t/200+p.ph)})`;g.fillRect(p.x,p.y,p.s,p.s)}
  drawAsh(g,t);
}
function loop(t){drawBG(t);if(!REDUCED)requestAnimationFrame(loop)}

/* 등반 주인공 특성 (웹게임 문서: 등반 주인공 · 특성) — c = 재능 */
/* 문서에 없는 특성(전격·소각 부여, 공격 약화, 피해 감소, 낙인, 가중치 감소, 방어도 감소, 패널티 드로우)은 숨김 */
const PTRAIT={
  atkUp:{n:'폭력',t:'공격 주사위 피해량 +20%',c:3},
  smite:{n:'파괴력',t:'최종 피해량 +25%',c:4},
  accUp:{n:'명중',t:'명중률 +10%p',c:2},
  evaUp:{n:'왜 못 맞추겠어?',t:'회피 +10%p',c:3},
  defUp:{n:'방패기사',t:'방어도 획득량 +25%',c:2},
  pierceDef:{n:'심장 노리기',t:'상대 방어레벨에 의한 피해 감소 무시',c:4},
  leech:{n:'광전사',t:'체력 50% 이하일 때 최종 피해량 +10%, 추가 피해 중 체력에 들어간 만큼 회복',c:2},
  vulnOn:{n:'취약 부여 효과',t:'공격 적중 시 대상에게 취약 1 부여',c:2},
  elOn:{n:'전격 부여',t:'공격 적중 시 대상에게 전격 3 부여',c:4,hide:1},
  burnOn:{n:'소각 부여',t:'공격 적중 시 대상에게 소각 5 부여',c:3,hide:1},
  wUp:{n:'가중치 증가 효과',t:'가중치 +2',c:1},
  killHeal:{n:'섭취',t:'적 처치 시 체력 5% 회복',c:1},
  fresh:{n:'새로운 카드는 언제나 환영이야',t:'직전 카드와 다른 카드를 낼 때마다 공격 위력 +2, 최대 10중첩, 같은 카드를 내면 0',c:2},
  same:{n:'똑같은 카드는 언제나 환영이야',t:'직전 카드와 같은 카드를 낼 때마다 공격 위력 +2, 최대 10중첩, 다른 카드를 내면 0',c:3},
  noHurt:{n:'아픈건 싫어서',t:'체력이 줄지 않은 턴마다 공격 위력 +2, 최대 10중첩, 체력이 줄면 0',c:1},
  offbeat:{n:'엇박타기',t:'턴의 첫 카드는 적 행동 포인트를 깎지 않음',c:2},
  dbl:{n:'묻고 더블로',t:'적 행동 포인트가 1일 때 낸 방어 카드의 방어도 2배',c:2},
  bash:{n:'실드로 패기',t:'턴 시작 시 남은 방어도의 50%만큼 이번 턴 첫 공격 카드의 공격 위력 증가',c:2},
  dodgeE:{n:'피했죠?',t:'회피 성공 시 다음 턴 코스트 +1, 최대 +1',c:3},
  light:{n:'라이트급',t:'덱이 10장 이하면 턴 시작 드로우 +1',c:2},
  heavy:{n:'헤비급',t:'카드 보관함 10장당 최대 체력 +5%, 최대 +25%',c:1},
  empty:{n:'아무것도',t:'턴 종료 시 패가 0장이면 다음 턴 코스트 +1',c:1},
  focus:{n:'선택과 집중',t:'카드를 버릴 때마다 이번 턴 공격 위력 +5',c:1},
  atkDown:{n:'공격 약화',t:'공격 주사위 피해량 -20%',c:-3,hide:1},
  dmgDown:{n:'피해 감소',t:'최종 피해량 -20%',c:-3,hide:1},
  accDown:{n:'난시',t:'명중률 -10%p',c:-2},
  evaDown:{n:'따라오지 못하는 몸',t:'회피 -10%p',c:-3},
  defDown:{n:'병약',t:'방어도 획득량 -25%',c:-1},
  selfVuln:{n:'자책',t:'매턴 자신에게 취약 1 부여',c:-2},
  selfWeak:{n:'자기 혐오',t:'매턴 자신에게 약화 1 부여',c:-2},
  hpCost:{n:'자해',t:'카드 사용 시 최대 체력의 2% 소모',c:-3},
  costUp:{n:'멍청이',t:'카드 사용 코스트 +1',c:-7},
  drawDown:{n:'바보',t:'드로우 카드의 드로우 -1',c:-1},
  seal:{n:'스스로와의 약속',t:'카드 사용 후 1턴 동안 해당 카드 봉인',c:-2},
  brand:{n:'낙인',t:'카드를 사용할 때마다 체력 3 감소',c:-3,hide:1},
  burnBack:{n:'3도화상',t:'매턴 자신에게 소각 5 부여',c:-3},
  elBack:{n:'감전',t:'매턴 자신에게 전격 3 부여',c:-3},
  wDown:{n:'가중치 감소',t:'가중치 -2',c:-3,hide:1},
  badRoll:{n:'불운',t:'공격 주사위 결과를 불리하게 변경',c:-1},
  exhAll:{n:'최악의 질병 5위',t:'사용 후 이번 전투 동안 덱에서 제외',c:-4},
  blockDebt:{n:'방어도 감소',t:'전투 시작 시 방어도 -5',c:-2,hide:1},
  hpDown:{n:'낙상 사고',t:'최대 체력 -10%',c:-2},
  healDown:{n:'혈우병',t:'회복 효과 -25%',c:-1},
  penDraw:{n:'패널티 드로우',t:'턴 종료 시 패에서 카드 1장 추가로 버림',c:-3,hide:1},
  pacifist:{n:'평화주의자',t:'최종 피해량 -50%',c:-10},
};
/* V2.37.78.22: 특성끼리 함께 고르는 제한 없음 */
const PT_CONFLICT=[];
/* 1레벨 기준: 체력 50~100, 공격·방어레벨 25~50, 명중 80, 회피 70, 재능 10~20 */
/* 난이도 (세계수 등반만) — 기본 재능: 쉬움 10~20, 보통 5~10, 어려움 0, 매우 어려움 0. 어려움부터 특성이 무작위로 고정됨(고를 수 없음) */
const CDIFF={veasy:{n:'매우 쉬움',tal:[30,30],em:.75,gm:1.15},easy:{n:'쉬움',tal:[10,20],em:1,gm:1},normal:{n:'보통',tal:[5,10],em:1.1,gm:.85},hard:{n:'어려움',tal:[0,0],em:1.15,gm:.7},vhard:{n:'매우 어려움',tal:[0,0],em:1.3,gm:.55}};
/* 특성은 난이도와 따로 고름 — 직접 정하는 운명(재능을 소모해 직접 고름) · 운명 개척(완전 무작위, 아예 없을 수도 있음) */
const FATE_KEY='ash-midgard-fate';
function lastFate(){try{return localStorage.getItem(FATE_KEY)==='random'?'random':'pick'}catch(e){return'pick'}}
const DIFF_KEY='ash-midgard-diff';
function lastDiff(){try{const v=localStorage.getItem(DIFF_KEY);return CDIFF[v]?v:'easy'}catch(e){return'easy'}}
function forcedTraits(h){
  /* 운에 맡김: 특성 2~4개를 무작위로 붙이고, 재능이 0 아래면 부정적인 특성을 더 붙여 맞춤 */
  const keys=Object.keys(PTRAIT).filter(k=>!PTRAIT[k].hide),ok=k=>!h.traits.includes(k)&&!PT_CONFLICT.some(p=>p.includes(k)&&p.some(q=>q!==k&&h.traits.includes(q)));
  /* 문서: 특성이 존재하지 않을 수 있고, 부정적인 특성만 지닐 수도, 반대일 수도 있음 — 재능이 모자라도 시작 */
  h.traits=[];const roll=rnd(),kind=roll<.2?'none':roll<.45?'neg':roll<.65?'pos':'mix';if(kind==='none')return;
  const pool=keys.filter(x=>kind==='neg'?PTRAIT[x].c<0:kind==='pos'?PTRAIT[x].c>0:true),n=ri(1,4);let g=0;
  while(h.traits.length<n&&g++<200){const k=pick(pool);if(ok(k))h.traits.push(k)}
}
/* 시작 덱 고르기 — 일반 카드를 지정해 10장, 덱을 여러 개 저장해 둠 */
const DECK_SIZE=10,DECK_MIN=5,DECKS_MAX=10,DECKS_KEY='ash-midgard-decks-v1',DECK_PICK_KEY='ash-midgard-deck-pick';
const DECK_POOL=['slash','guard','breath',...POOL.common];
const DEFAULT_DECK={id:'base',name:'기본 덱',cards:START_DECK.map(x=>x.slice()),fixed:true};
function loadDecks(){try{const a=JSON.parse(localStorage.getItem(DECKS_KEY)||'[]');return Array.isArray(a)?a.map(d=>{if(d&&Array.isArray(d.cards))d.cards=d.cards.filter(x=>x&&CARDS[x[0]]);return d}).filter(d=>d&&d.cards&&deckCount(d.cards)>=DECK_MIN&&deckCount(d.cards)<=DECK_SIZE).slice(0,DECKS_MAX):[]}catch(e){return[]}}
function saveDecks(a){try{localStorage.setItem(DECKS_KEY,JSON.stringify(a))}catch(e){toast('저장 실패','이 브라우저에서는 덱을 저장할 수 없습니다')}}
const deckCount=cards=>cards.reduce((t,[,n])=>t+n,0);
const allDecks=()=>[DEFAULT_DECK,...loadDecks()];
function pickedDeck(){let id='base';try{id=localStorage.getItem(DECK_PICK_KEY)||'base'}catch(e){}return allDecks().find(d=>d.id===id)||DEFAULT_DECK}
function setPickedDeck(id){try{localStorage.setItem(DECK_PICK_KEY,id)}catch(e){}}
function openDeckEditor(deck,onDone){
  const ed={id:deck&&!deck.fixed?deck.id:'d'+Date.now().toString(36),name:deck&&!deck.fixed?deck.name:`내 덱 ${loadDecks().length+1}`,cnt:{}};
  (deck?deck.cards:[]).forEach(([id,n])=>{if(DECK_POOL.includes(id))ed.cnt[id]=n});
  const m=$('#modal');
  const draw=()=>{const tot=Object.values(ed.cnt).reduce((a,b)=>a+b,0);
    m.hidden=false;m.innerHTML=`<div class="panel deckpanel" style="width:min(1100px,100%)"><div class="maphead"><div><div class="psub">시작 덱 만들기 · 일반 카드 최대 ${DECK_SIZE}장</div><div class="ptitle">덱 고르기</div></div><button class="btn-ghost" id="dkClose">닫기</button></div>
      <label class="dkname"><span>덱 이름</span><input id="dkName" maxlength="16" value="${ed.name.replace(/"/g,'&quot;')}"></label>
      <div class="dkgrid">${DECK_POOL.map(id=>{const n=ed.cnt[id]||0;return`<div class="dkrow${n?' on':''}"><button class="dkcard" data-see="${id}"><b>${CARDS[id].name}</b><span>${CARDS[id].cost??''}코스트 · ${CARDS[id].text.split('\n')[0]}</span></button>
        <div class="dkn"><button class="plate-btn" data-dec="${id}" ${n?'':'disabled'} aria-label="${CARDS[id].name} 한 장 빼기">−</button><b>${n}</b><button class="plate-btn" data-inc="${id}" ${tot>=DECK_SIZE?'disabled':''} aria-label="${CARDS[id].name} 한 장 넣기">+</button></div></div>`}).join('')}</div>
      <div class="ap-bottom"><div class="psub">${tot} / ${DECK_SIZE}장${tot<DECK_MIN?` — 최소 ${DECK_MIN}장`:''}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">${deck&&!deck.fixed?'<button class="btn-ghost" id="dkDel">이 덱 지우기</button>':''}<button class="btn-main" id="dkSave" ${tot>=DECK_MIN&&tot<=DECK_SIZE?'':'disabled'}>저장하고 고르기</button></div></div></div>`;
    const nm=$('#dkName');nm.oninput=()=>{ed.name=nm.value};
    m.querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>{ed.cnt[b.dataset.inc]=(ed.cnt[b.dataset.inc]||0)+1;draw()});
    m.querySelectorAll('[data-dec]').forEach(b=>b.onclick=()=>{const k=b.dataset.dec;ed.cnt[k]=Math.max(0,(ed.cnt[k]||0)-1);if(!ed.cnt[k])delete ed.cnt[k];draw()});
    m.querySelectorAll('[data-see]').forEach(b=>b.onclick=()=>{const keep=m.innerHTML;openCard(b.dataset.see);$('#mClose').onclick=draw});
    $('#dkClose').onclick=()=>{closeModal();onDone&&onDone()};
    if($('#dkDel'))$('#dkDel').onclick=()=>{const b=$('#dkDel');if(!b.dataset.arm){b.dataset.arm=1;b.textContent='한 번 더 누르면 지웁니다';return}saveDecks(loadDecks().filter(d=>d.id!==ed.id));setPickedDeck('base');closeModal();onDone&&onDone()};
    $('#dkSave').onclick=()=>{const cards=DECK_POOL.filter(id=>ed.cnt[id]).map(id=>[id,ed.cnt[id]]);const dc=deckCount(cards);if(dc<DECK_MIN||dc>DECK_SIZE)return;
      const name=(ed.name||'').trim()||'이름 없는 덱',list=loadDecks(),i=list.findIndex(d=>d.id===ed.id),rec={id:ed.id,name,cards};
      if(i>=0)list[i]=rec;else{if(list.length>=DECKS_MAX){toast('덱 목록이 가득 찼다',`덱은 최대 ${DECKS_MAX}개까지 저장할 수 있습니다`);return}list.push(rec)}saveDecks(list);setPickedDeck(ed.id);closeModal();onDone&&onDone()};
  };
  draw();
}
function rollHero(diff){diff=CDIFF[diff]?diff:'easy';const D=CDIFF[diff];
  const h={diff,fate:lastFate(),base1:ri(50,100),atk:ri(25,50),def:ri(25,50),acc:80,eva:70,talent:ri(D.tal[0],D.tal[1]),traits:[]};
  if(h.fate==='random')forcedTraits(h);return h}
const heroTalentLeft=h=>h.talent-h.traits.reduce((s,k)=>s+PTRAIT[k].c,0);
const hpMulOf=tr=>tr.includes('hpDown')?.9:1;

