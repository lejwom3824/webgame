"use strict";
/* ================= 전투 보조 — 행동 위력, 예상 피해, 적 목록, 보상 뒤 진행 ================= */
function a2PreAct(E,name){const r=S.run;let x=1;
  if(E.charged){x*=1.5;E.charged=false;clog('송출 대기: 이번 행동 위력 +50%','e')}
  if(name==='빚 독촉'&&r.gold<100000){x*=2;clog('빚 독촉: 실링 100000 미만 — 피해 2배','e')}
  E.actX=x;E.actFlat=(name==='무쇠 팬'&&E.sat)?Math.round(r.maxHp*.02*E.sat):0}
/* 공방렙 차이: 내 공격레벨 − 상대 방어레벨이 3 남을 때마다 공격 위력 +1 (낮아도 위력은 줄지 않음) — 적이 플레이어를 공격할 때도 같음 */
const gapP=(atk,def)=>Math.max(0,Math.floor((atk-def)/3));
function pAdj(v,o,hi){const C=S.C,E=C.E;if(o&&o.nul)return 0;const base=masterOn()?hi:v;return Math.max(0,base+(C.heat||0)+gapP(o&&o.atk!=null?o.atk:pAtk(),E.def)+(C.pStr||0)-(C.pWkF||0))}
function eAdj(v){const C=S.C,E=C.E;return Math.round((v+(E.heat||0)+gapP(E.atk,pDef()))*(E.done?3:1)*(C.fleeX||1)*(E.actX||1))}
/* 적이 여럿일 때 — 위쪽에 적 목록, 누르거나 카드를 끌어 놓으면 대상이 바뀜 */
/* 여러 적 — 대상은 가운데 큰 그림(#enemy)이 그 자리로 가고, 나머지는 옆자리에 따로 섬 (V26) */
function foeArt(f){return ENEMY_IMG[f.key]?`<img alt="${f.name}" src="${ENEMY_IMG[f.key]}">`:(ENEMY_SVG[ENEMY[f.key].art]||a2SVG(ENEMY[f.key].art))}
/* 적 순서 — 쓰러진 적은 빠지고 뒤의 적이 한 칸씩 당겨짐 */
const figFoes=()=>{const C=S.C;return foes().filter(f=>alive(f)||(C&&f===C.E))};
function renderFoeFigs(){const C=S.C,bx=$('#foefigs');if(!bx)return;const o=L[S.orient];if(o.ex0==null){o.ex0=o.ex;o.ew0=o.ew;o.eh0=o.eh}
  const all=figFoes(),multi=!!(C&&!C.over&&S.screen==='combat'&&all.length>1);
  if(!multi){if(!bx.hidden||o.ex!==o.ex0){const px=bx._px;bx.hidden=true;bx.innerHTML='';o.ex=o.ex0;o.ew=o.ew0;o.eh=o.eh0;positionScene();const en=$('#enemy');if(C&&!C.over&&px&&px.has(C.E)&&en&&!REDUCED&&en.animate)en.animate({translate:[`${px.get(C.E)-o.ex}px 0`,'0 0']},{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'})}bx._px=null;return}
  const n=all.length,land=S.orient==='land',k=n>=6?(land?.5:.38):n>=4?(land?.62:.48):land?(n>=3?.8:.9):(n>=3?.62:.76),ew2=Math.round(o.ew0*k),gap=Math.min(land?(n>=3?400:460):(n>=3?290:340),Math.round((o.W-60-ew2)/Math.max(1,n-1)));
  o.ew=ew2;o.eh=Math.round(o.eh0*k);let xs=all.map((f,i)=>o.ex0+(i-(n-1)/2)*gap);
  /* 보스는 정중앙, 나머지는 오른쪽·왼쪽 번갈아 */
  const bi=all.findIndex(f=>f.boss);if(bi>=0){const side=Math.ceil((n-1)/2),g2=Math.min(gap*2,Math.round((o.W/2-70-ew2/2)/Math.max(1,side)));let j=0;xs=all.map((f,i)=>{if(i===bi)return o.ex0;j++;const st=Math.ceil(j/2);return o.ex0+(j%2?1:-1)*(st*Math.min(g2,land?400:290)+40)})}const px=bx._px||new Map();o.ex=xs[Math.max(0,all.indexOf(C.E))];positionScene();
  bx.hidden=false;
  bx.innerHTML=all.map((f,i)=>{if(f===C.E)return'';const pct=clamp(f.hp/f.maxHp*100,0,100),dead=!alive(f);
    return`<div class="ufoe${dead?' dead':''}" data-foe="${i}" role="button" tabindex="${dead?-1:0}" aria-label="${f.name} 상태창" style="left:${xs[i]-o.ew/2}px;top:${o.efeet-o.eh}px;width:${o.ew}px;height:${o.eh}px">
      <div class="uf-art">${foeArt(f)}</div>
      <div class="uf-plate"><b>${f.name}<small>Lv ${f.lv}</small></b><span class="fhp"><i style="width:${pct}%"></i><em>${dead?(f.fled?'도망침':'쓰러짐'):`${Math.max(0,f.hp)} / ${f.maxHp}`}</em></span>${dead?'':`${foeOrbs(f)}${f.block?`<small>방어도 ${f.block}</small>`:''}`}</div></div>`}).join('');
  /* 자리가 바뀐 적은 원래 자리에서 미끄러져 옴 */
  const slide=(el,dx)=>{if(!REDUCED&&dx&&Math.abs(dx)>2&&el.animate)el.animate({translate:[`${dx}px 0`,'0 0']},{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'})};
  const nx=new Map();all.forEach((f,i)=>{nx.set(f,xs[i]);if(f===C.E)return;const el=bx.querySelector(`.ufoe[data-foe="${i}"]`);if(el&&px.has(f))slide(el,px.get(f)-xs[i])});
  if(px.has(C.E)){const en=$("#enemy");if(en)slide(en,px.get(C.E)-o.ex)}
  bx._px=nx;
  bx.querySelectorAll('.ufoe:not(.dead)').forEach(el=>{const f=all[+el.dataset.foe];el.onclick=e=>{e.stopPropagation();openFoePanel(f)};el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openFoePanel(f)}}});
}
function renderFoeBar(){renderFoeFigs();const C=S.C,el=$('#foebar');if(!el)return;el.hidden=true;el.innerHTML='';return;const all=foes();if(!C||C.over||all.length<2||S.screen!=='combat'){el.hidden=true;el.innerHTML='';return}el.hidden=false;
  el.innerHTML=all.map((f,i)=>{const a=ACT[f.intent],dead=!alive(f);const pct=clamp(f.hp/f.maxHp*100,0,100);
    let iv='';if(!dead&&a){if(a.k==='atk'&&a.d&&a.d.length){const pv=C.E;C.E=f;const p=ePreview(a.d[0]);C.E=pv;iv=`${p.lo}~${p.hi}${a.d.length>1?`×${a.d.length}`:''} · ${p.ch}%`}else iv=a.k==='def'?'방어':a.k==='curse'?'저주':'기술'}
    return`<button class="foe${f===C.E?' on':''}${dead?' dead':''}" data-foe="${i}" ${dead?'disabled':''}><b>${f.name}</b><span class="fhp"><i style="width:${pct}%"></i><em>${dead?(f.fled?'도망침':'쓰러짐'):`${Math.max(0,f.hp)} / ${f.maxHp}`}</em></span>${dead?'':`<small>${f.intent||''}${iv?` · ${iv}`:''} · 행동 ${f.early?'끝':f.ap}</small>`}${f===C.E&&!dead?'<i class="tg">대상</i>':''}</button>`}).join('');
  el.querySelectorAll('[data-foe]').forEach(b=>b.onclick=e=>{e.stopPropagation();setTarget(all[+b.dataset.foe])})}
function foeAt(x,y){const all=figFoes();if(all.length>1&&S.C){const inR=el=>{const rc=el.getBoundingClientRect();return x>=rc.left&&x<=rc.right&&y>=rc.top&&y<=rc.bottom};
    for(const b of document.querySelectorAll('#foefigs .ufoe:not(.dead)'))if(inR(b)){const f=all[+b.dataset.foe];return alive(f)?f:null}
    const en=$('#enemy');if(en&&inR(en)&&alive(S.C.E))return S.C.E;return null}
  const el=$('#foebar');if(!el||el.hidden)return null;for(const b of el.querySelectorAll('[data-foe]')){const rc=b.getBoundingClientRect();if(x>=rc.left&&x<=rc.right&&y>=rc.top&&y<=rc.bottom){const f=all[+b.dataset.foe];return alive(f)?f:null}}return null}
function afterReward(){const r=S.run,at=r.at||{};
  if(at.then==='fall')return showA1End();
  if(at.then==='rush'){if(r.m2&&r.m2.inside)r.m2.inside.cur=(at.rush||0)+1;r.at=null;save();return showMap()}
  if(at.then==='laevWin'){r.flags.surtWeak=1;r.at=null;return landDome()}
  showMap()}
function startChase(){const r=S.run,at=r.at;const list=(at.chase||[]).map(f=>Object.assign(f,{fled:false,dead:false,noFlee:false,early:false}));
  r.at={kind:'combat',enemies:list,node:at.node,chased:true};save();transition(resumeAt)}

