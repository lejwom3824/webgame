
"use strict";
/* ================= utilities ================= */
const $=(s,r=document)=>r.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=Math.random;
const ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
const pick=a=>a[Math.floor(rnd()*a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait=ms=>new Promise(r=>setTimeout(r,REDUCED?Math.min(ms,80):ms));
function wpick(o){let t=0;for(const k in o)t+=o[k];let r=rnd()*t;for(const k in o){r-=o[k];if(r<0)return k}return Object.keys(o)[0]}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let UID=1;
const SAVE_KEY='ash-midgard-climb-v3';
/* 코스트·드로우: 기본 3·5, 3턴마다 1씩 증가, 최대 10·12 */
function growth(t){const g=Math.floor((Math.max(1,t)-1)/3);return{e:Math.min(10,3+g),d:Math.min(12,5+g)}}

/* ================= 주사위 (웹게임 문서: 주사위 전투) ================= */
const A=(a,b)=>({t:'atk',a,b}),D=(a,b)=>({t:'def',a,b}),V=(a,b)=>({t:'eva',a,b});
const DIE_NAME={atk:'공격',def:'방어',eva:'회피'};
const MAX_HAND=12;          // 패 최대 12장 — 넘으면 플레이어가 골라 버림
const EVA_DICE_CAP=30;      // 회피 주사위로 얻는 회피는 한 턴에 최대 +30

