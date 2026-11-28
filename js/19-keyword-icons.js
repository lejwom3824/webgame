"use strict";
/* ================= 키워드 아이콘 (V2.37.80.22) =================
   문서 키워드 목록만 · 24×24 · 선은 currentColor, 키워드마다 색
   체력 밑 키워드 칸 = 아이콘 + 숫자, 이름과 세부는 누르면 뜨는 설명창
   카드 글 = 키워드 앞에 작은 아이콘, 단어는 그대로
   표식 = 단계만큼 검이 늘어남(Ⅰ 한 자루 → Ⅴ 다섯 자루), Ⅴ는 빨강 */
const KW_SVG={
 block:'<path d="M12 2.5l8 3V11c0 5-3.4 8.6-8 10.5C7.4 19.6 4 16 4 11V5.5z"/><path d="M12 6v12"/>',
 str:'<path d="M2.5 13C4 9.5 7 7 10 7.5c2.5.4 3.8 2 4.2 3.5l.3-2.5C13 8 12.5 5.5 13.5 4c1-1.5 4.5-2 6.3-.4 1.4 1.2 1.2 3.4.2 4.6l.8 7.3c.2 3-1.8 5.5-5.3 5.5H2.5"/><path d="M15.6 5.6h3M8.8 15q3.2 2 6.8.6M6 5.6 4.8 3.8M9.4 4.6V2.4"/>',
 weak:'<path d="M2.5 15.5c3.5 0 6.5 1.6 10.1.1L13 9.2c-1-.4-1.2-2.4-.4-3.2.8-1 3.2-1 4 .2.6.8.4 2-.2 2.8l.4 7.4c0 2-1.4 3.2-3.3 3.2H2.5"/><path d="M4.8 19.6q2.6 3.4 5.4 0"/><path d="M7.8 7.6c.8 1.1 1.3 1.7 1.3 2.3a1.3 1.3 0 0 1-2.6 0c0-.6.5-1.2 1.3-2.3z"/>',
 frail:'<path d="M12 22v-3M8 19h8M10 19v-6.5l2-1.5 2 1.5V19"/><path d="M10.4 9 12 2.5 13.6 9l-1.6-1z"/>',
 vuln:'<path d="M12 20.5S3.5 15.4 3.5 9.3A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8.5 2.3c0 6.1-8.5 11.2-8.5 11.2z"/><path d="M12 7l-1.4 4 2.6 2-1.8 3.6"/>',
 exhaust:'<path d="M5 11.5V4.5C5 3.7 5.7 3 6.5 3h8c.8 0 1.5.7 1.5 1.5v7"/><path class="f" d="M5.2 13.2h2.2v2.2H5.2zM9.6 13.6h2v2h-2zM13.8 13.2h2.2v2.2h-2.2zM7.4 17.2h1.8V19H7.4zM12 17.6h1.7v1.7H12zM16.4 16.8h1.5v1.5h-1.5zM9.8 20.4h1.4v1.4H9.8z"/>',
 persist:'<path d="M12 12c-2-2.6-3.6-4-5.4-4a4 4 0 0 0 0 8c1.8 0 3.4-1.4 5.4-4zm0 0c2 2.6 3.6 4 5.4 4a4 4 0 0 0 0-8c-1.8 0-3.4 1.4-5.4 4z"/>',
 seal:'<rect x="5" y="3" width="11" height="15" rx="1.6"/><path d="M15.5 13.5l1.3 1.6 2-.4.4 2 1.8 1-1 1.8.6 1.9-2 .5-.9 1.8-1.8-.9-1.8.9-.9-1.8-2-.5.6-1.9-1-1.8 1.8-1 .4-2 2 .4z"/>',
 brand:'<path d="M3.5 20.5 11.2 12.8"/><path d="M15 4.5l4.5 4.5-4.5 4.5L10.5 9z"/><path d="M13.4 9h3.2M15 7.4v3.2"/>',
 play:'<path d="M5 4.5h14V11c0 5-3.2 9-7 9s-7-4-7-9z"/><path d="M7.8 10.2q1.6-2.2 3.2 0M13 10.2q1.6-2.2 3.2 0M8.6 13.8q3.4 3.6 6.8 0"/>',
 weight:'<circle class="f" cx="5" cy="12" r="2.3"/><path d="M7.3 12h4.2M11.5 12l5-5.2M11.5 12h5M11.5 12l5 5.2"/><circle cx="18.6" cy="5.4" r="1.9"/><circle cx="18.8" cy="12" r="1.9"/><circle cx="18.6" cy="18.6" r="1.9"/>',
 trueDmg:'<path d="M12 4.5l5 7.5-5 7.5-5-7.5z"/><path class="f" d="M12 8.4l2.6 3.6L12 15.6 9.4 12z"/><path d="M12 1.5v1.6M12 20.9v1.6M2.5 12h2M19.5 12h2"/>',
 pierce:'<path d="M10 3.5l6 2.2V10c0 3.6-2.4 6.4-6 7.8C6.4 16.4 4 13.6 4 10V5.7z" stroke-dasharray="2.4 2"/><path d="M2 11h19.5M18.5 8l3 3-3 3"/>',
 bound:'<ellipse cx="9" cy="8.5" rx="6.2" ry="4.4"/><ellipse cx="9" cy="8.5" rx="3" ry="1.9"/><ellipse cx="15.2" cy="15" rx="1.6" ry="2.4" transform="rotate(-40 15.2 15)"/><ellipse cx="18.3" cy="18.4" rx="1.6" ry="2.4" transform="rotate(-40 18.3 18.4)"/><path d="M19 21.5h3"/>',
 discard:'<rect x="3.5" y="3" width="10" height="14" rx="1.6" transform="rotate(-12 8.5 10)"/><path d="M14.5 13.5q5 0 5.5 6"/><path d="M17.6 17.6l2.4 2.4 2.2-2.6"/>',
 unique:'<rect x="6" y="3" width="12" height="18" rx="1.8"/><path class="f" d="M12 8.2l2.8 3.8-2.8 3.8-2.8-3.8z"/>',
 member:'<path d="M12 2.5c-3.6 0-6 3.2-6 7.5 0 2.3.9 4 2.2 5.1-3 1.1-4.7 3.3-4.7 6.4h17c0-3.1-1.7-5.3-4.7-6.4 1.3-1.1 2.2-2.8 2.2-5.1 0-4.3-2.4-7.5-6-7.5z"/><path class="f" d="M9.5 10.6a2.5 2.8 0 0 1 5 0v1.6a2.5 2.2 0 0 1-5 0z"/>',
 lock:'<rect x="5" y="10.5" width="14" height="10.5" rx="1.8"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v3"/>',
 shock:'<path class="f" d="M13.5 2 5 13.2h6L9.5 22 19 10.2h-6z"/>',
 numb:'<path d="M13 2.5 7.5 12.5H12L10.5 21.5 17 10.5h-4.6z"/><path d="M3 8.5l2.6 1.4M3 12.5l2.6-1.4M21 11.5l-2.6 1.4M21 15.5l-2.6-1.4"/>',
 burn:'<path d="M12 2c1.4 4 6 6.4 6 12a6 6 0 0 1-12 0c0-3.6 2.6-5.3 3-8.6 1.4 1.5 2 2.6 2.4 3.6.7-2 1.2-4.2.6-7z"/><path d="M12 20a2.6 2.6 0 0 1-2.6-2.6c0-1.8 2-2.8 2.6-4.8.9 2 2.6 2.9 2.6 4.8A2.6 2.6 0 0 1 12 20z"/>',
 steam:'<path d="M3.5 21h17M7 18v3M17 18v3M5 18h14"/><path d="M8 15c-1.6-1.6 1.6-3.2 0-4.8S9.6 7 8 5.4M12 15c-1.6-1.6 1.6-3.2 0-4.8s1.6-3.2 0-4.8M16 15c-1.6-1.6 1.6-3.2 0-4.8s1.6-3.2 0-4.8"/>',
 convert:'<path d="M4 17c-1.5-1.6 1.5-3.2 0-4.8s1.5-3.2 0-4.8M7.5 17c-1.5-1.6 1.5-3.2 0-4.8s1.5-3.2 0-4.8"/><path d="M9.8 12h3.8M12 10l2 2-2 2"/><path d="M18.2 6c.9 2.4 3.4 3.8 3.4 7a3.4 3.4 0 0 1-6.8 0c0-2 1.4-3 1.7-4.9.8.8 1.1 1.4 1.3 2 .4-1.1.6-2.4.4-4.1z"/>',
 heat:'<path d="M4.2 17.5a8.5 8.5 0 1 1 15.6 0z"/><path d="M12 15.5 16.6 9.2"/><circle class="f" cx="12" cy="15.5" r="1.4"/><path d="M6.6 14.5h1.6M12 6.8v1.6M8.3 8.8l1.1 1.1M15.7 8.8l-1.1 1.1M17.4 14.5h-1.6M4 20.5h16"/>',
 art:'<path d="M20 3 10.6 12.4"/><path d="M9 11.2l3.6 3.6"/><path d="M10.4 13.8c-2.4-.8-5 .8-5.2 3.6-.1 1.4-1.1 2.4-2.2 3.1 3.5.6 7.6-.6 8.3-3.9z"/>',
 workPrep:'<path d="M5 4h14v11H5zM12 2v2M8.5 15 6 22M15.5 15 18 22M12 15v5"/>',
 work:'<path d="M3 5h18v14H3z"/><path d="M6 8h12v8H6z"/><path d="M6 16l4-4.6 3 3 2-2 3 3.6"/><circle class="f" cx="14.8" cy="10" r="1.1"/>',
 cool:'<path d="M12 2.5c4 5.6 6 8.6 6 12a6 6 0 0 1-12 0c0-3.4 2-6.4 6-12z"/><path d="M12 11.5v6M9.4 13l5.2 3M14.6 13l-5.2 3"/>',
 freeze:'<path d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17"/><path d="M9.6 3.8 12 6l2.4-2.2M9.6 20.2 12 18l2.4 2.2M3.6 10.4l3.1-1 .6-3.2M20.4 13.6l-3.1 1-.6 3.2M20.4 10.4l-3.1-1-.6-3.2M3.6 13.6l3.1 1 .6 3.2"/>',
 fracture:'<circle cx="4.6" cy="9.4" r="2.2"/><circle cx="4.6" cy="14.6" r="2.2"/><circle cx="19.4" cy="9.4" r="2.2"/><circle cx="19.4" cy="14.6" r="2.2"/><path d="M6.6 10.4h4l1 1.6-1 1.6h-4M17.4 10.4h-3.9l1 1.6-1 1.6h3.9"/>',
 crack:'<path d="M4 4h16v16H4z"/><path d="M12.5 4 10.5 9l4 3-3.2 4 1.7 4M14.5 12l5.5-1.4M10.5 9 4 8"/>',
 expose:'<circle cx="12" cy="12" r="7"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle class="f" cx="12" cy="12" r="1.6"/>',
};
const KW_NAME={block:'방어도',str:'힘',weak:'약화',frail:'허약',vuln:'취약',exhaust:'소멸',persist:'지속',seal:'봉인',brand:'낙인',play:'유희',weight:'가중치',trueDmg:'트루 데미지',pierce:'방어도 무시',bound:'귀속',discard:'버림',unique:'유일',member:'단원',lock:'잠금',shock:'전격',numb:'마비',burn:'소각',steam:'증기',convert:'증기 변환',heat:'열기',art:'예술적 감각',workPrep:'작품 준비',work:'작품-완성',cool:'냉매',freeze:'냉동',fracture:'골절',crack:'깨짐',mark:'표식',expose:'약점 노출'};
const KW_COL={block:'#9fb8d2',str:'#f0a35e',weak:'#a993d8',frail:'#a993d8',vuln:'#e2736b',exhaust:'#b3aca0',persist:'#e6c36a',seal:'#a993d8',brand:'#e2605a',play:'#e6c36a',weight:'#e8dcc4',trueDmg:'#f4f1ea',pierce:'#9fb8d2',bound:'#d9d4c8',discard:'#b3aca0',unique:'#e6c36a',member:'#d9d4c8',lock:'#d9d4c8',shock:'#a9cdff',numb:'#a9cdff',burn:'#ff9a4d',steam:'#c9d3da',convert:'#ff9a4d',heat:'#ff7a45',art:'#e6c36a',workPrep:'#e6c36a',work:'#e6c36a',cool:'#8fe3ff',freeze:'#8fe3ff',fracture:'#e8dcc4',crack:'#b9d9ea',mark:'#d9d4c8',expose:'#e2736b'};
const KW_ORDER=["block", "str", "weak", "frail", "vuln", "exhaust", "persist", "seal", "brand", "play", "weight", "trueDmg", "pierce", "bound", "discard", "unique", "member", "lock", "shock", "numb", "burn", "steam", "convert", "heat", "art", "workPrep", "work", "cool", "freeze", "fracture", "crack", "mark", "expose"];
const KW_KEY=Object.fromEntries(Object.entries(KW_NAME).map(([k,n])=>[n,k]));
const kwSvg=(k,body,col,cls='')=>`<svg class="kwi${cls}" viewBox="0 0 24 24" style="color:${col}" aria-hidden="true">${body}</svg>`;
function kwIcon(k){return KW_SVG[k]?kwSvg(k,KW_SVG[k],KW_COL[k]):''}
const kwEsc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
/* 키워드 칸 하나 — full은 설명창과 규칙 찾기에 쓰는 원래 글 */
function kwChip(k,num,full){return`<span class="chip kw" data-full="${kwEsc(full)}" title="${kwEsc(full)}">${kwIcon(k)}${num!=null&&num!==''?`<b>${num}</b>`:''}</span>`}
/* 표식 — 검 위치: 가운데를 기준으로 나란히, 조금씩 벌어짐 */
const KW_MARK_SW='<path d="M12 3l.9 1.7V15.5M12 3l-.9 1.7V15.5M10.3 15.5h3.4M12 15.5v4"/>';
const kwMarkPos=(i,n)=>{const k=i-(n-1)/2;return[k*4.1,k*7]};
const KW_MARK_SEEN={};
function kwMark(side,lv,full){lv=Math.max(1,Math.min(5,lv|0));const was=KW_MARK_SEEN[side]||0;KW_MARK_SEEN[side]=lv;const grow=!REDUCED&&was&&lv>was;
  let g='';for(let i=0;i<lv;i++){const[x1,r1]=kwMarkPos(i,lv),neu=grow&&i===lv-1,[x0,r0]=grow&&!neu?kwMarkPos(i,lv-1):[x1,r1];
    g+=`<g class="${grow?(neu?'kwsw new':'kwsw'):''}" style="--x0:${x0}px;--r0:${r0}deg;--x1:${x1}px;--r1:${r1}deg;transform:translateX(${x1}px) rotate(${r1}deg);transform-origin:12px 19.5px">${KW_MARK_SW}</g>`}
  return`<span class="chip kw mk${lv>=5?' mk5':''}" data-full="${kwEsc(full)}" title="${kwEsc(full)}">${kwSvg('mark',g,lv>=5?'#ff4b3e':KW_COL.mark,' mkw')}</span>`}
function kwMarkReset(){for(const k in KW_MARK_SEEN)delete KW_MARK_SEEN[k]}
/* 카드 글 — 키워드 앞에 아이콘, 단어는 그대로 */
const KW_RE=new RegExp('(^|[^가-힣])('+Object.values(KW_NAME).sort((a,b)=>b.length-a.length).map(s=>s.replace(/[-]/g,'\\-')).join('|')+')','g');
function kwDeco(html){return String(html).split(/(<[^>]*>)/).map(p=>p.startsWith('<')?p:p.replace(KW_RE,(m,a,n)=>`${a}<span class="kwt">${kwIcon(KW_KEY[n])}</span>${n}`)).join('')}
const chipText=c=>c.dataset.full||c.textContent.trim();
