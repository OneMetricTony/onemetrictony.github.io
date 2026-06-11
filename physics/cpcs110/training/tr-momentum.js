/* tr-momentum.js — Momentum Principle Vector Trainer
   CPCS110 Physics Arcade training module. Plain browser JS (ES2017), IIFE, no modules.
   Drill: complete p⃗_f = p⃗_i + F⃗_net Δt as a tip-to-tail vector triangle by dragging. */
(function(){
'use strict';

var ID='momentum';
var CELL=26, GW=14, GH=11, W=GW*CELL, H=GH*CELL;
var SVGNS='http://www.w3.org/2000/svg';

/* ---------- CSS (injected once) ---------- */
function injectCSS(){
  if(document.getElementById('tr-style-'+ID)) return;
  var s=document.createElement('style'); s.id='tr-style-'+ID;
  s.textContent=
  '.tr-momentum-wrap{max-width:560px;margin:0 auto;color:var(--ink,#d7e6ff);display:flex;flex-direction:column;gap:10px;padding:4px 2px 14px;}' +
  '.tr-momentum-meta{display:flex;justify-content:space-between;align-items:center;gap:8px;font-family:"Press Start 2P",monospace;font-size:9px;color:var(--dim,#a9b5d9);}' +
  '.tr-momentum-meta b{color:var(--cyan,#21e6ff);font-weight:normal;}' +
  '.tr-momentum-title{font-family:"Press Start 2P",monospace;font-size:12px;color:var(--cyan,#21e6ff);margin:2px 0 0;line-height:1.5;}' +
  '.tr-momentum-story{margin:0;color:var(--dim,#a9b5d9);font-size:13px;line-height:1.5;}' +
  '.tr-momentum-eq{text-align:center;min-height:24px;font-size:15px;}' +
  '.tr-momentum-chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;font-family:"Cambria Math","Times New Roman",serif;font-size:14.5px;}' +
  '.tr-momentum-chip{background:var(--panel2,#13132b);border:1px solid #2a2a55;border-radius:10px;padding:6px 9px;line-height:1.3;}' +
  '.tr-momentum-cpi{color:var(--cyan,#21e6ff);}' +
  '.tr-momentum-cj{color:var(--magenta,#ff3df0);}' +
  '.tr-momentum-cpf{color:var(--green,#39ff88);border-color:rgba(57,255,136,.5);}' +
  '.tr-momentum-svgbox{background:linear-gradient(160deg,#0c0c20,#090914);border:2px solid #2a2a55;border-radius:14px;padding:4px;touch-action:none;}' +
  '.tr-momentum-svgbox svg{display:block;width:100%;height:auto;touch-action:none;-webkit-user-select:none;user-select:none;}' +
  '.tr-momentum-live{font-family:"Cambria Math","Times New Roman",serif;color:var(--green,#39ff88);text-align:center;min-height:20px;font-size:15px;}' +
  '.tr-momentum-hint{display:none;background:rgba(255,225,77,.08);border:1px dashed var(--yellow,#ffe14d);color:var(--yellow,#ffe14d);border-radius:10px;padding:8px 11px;font-size:12.5px;line-height:1.45;}' +
  '.tr-momentum-hint.tr-momentum-on{display:block;}' +
  '.tr-momentum-fb{display:none;border-radius:10px;padding:8px 11px;font-size:13px;line-height:1.45;border:1px solid transparent;}' +
  '.tr-momentum-fb.tr-momentum-good{display:block;color:var(--green,#39ff88);border-color:rgba(57,255,136,.45);background:rgba(57,255,136,.07);}' +
  '.tr-momentum-fb.tr-momentum-bad{display:block;color:var(--red,#ff5470);border-color:rgba(255,84,112,.45);background:rgba(255,84,112,.07);}' +
  '.tr-momentum-btns{display:flex;gap:8px;}' +
  '.tr-momentum-btn{flex:1;min-height:48px;border:0;border-radius:12px;cursor:pointer;font-family:"Press Start 2P",monospace;font-size:10px;background:var(--cyan,#21e6ff);color:#02131a;padding:10px;}' +
  '.tr-momentum-btn:disabled{opacity:.45;cursor:default;}' +
  '.tr-momentum-btn.tr-momentum-go{background:var(--green,#39ff88);}' +
  '.tr-momentum-btn:active{transform:translateY(1px);}' +
  '.tr-momentum-ghost{position:fixed;z-index:9999;pointer-events:none;background:#0e0e1c;border:1px solid var(--green,#39ff88);color:var(--green,#39ff88);font-family:"Cambria Math","Times New Roman",serif;font-size:14px;padding:4px 9px;border-radius:8px;transform:translate(-50%,-135%);white-space:nowrap;}' +
  '.tr-momentum-shake{animation:trmomentumShake .35s;}' +
  '@keyframes trmomentumShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}' +
  '@media (prefers-reduced-motion: reduce){.tr-momentum-shake{animation:none;}}';
  document.head.appendChild(s);
}

/* ---------- rounds (slide-grounded; grid units, y up) ---------- */
/* factor/dec map grid cells -> real numbers shown in angle brackets. pf = pi + J. */
var ROUNDS=[
 { name:'HOCKEY PUCK', icon:'🏒', guided:true,
   story:'A 0.16 kg hockey puck glides along +x at 25 m/s. A stick taps it sideways (+y): 30 N for 0.10 s. (Classic M&I!)',
   scale:'1 square = 1.0 kg·m/s', factor:1, dec:1, unitP:'kg·m/s', unitJ:'N·s',
   anchor:[4,3], pi:[4,0], J:[0,3],
   lx:'\\vec p_f=\\langle 4.0,\\;3.0,\\;0\\rangle\\ \\mathrm{kg{\\cdot}m/s}',
   lesson:'The tap ADDS to p⃗ — it doesn’t replace it. p⃗_f got longer AND turned: |p⃗| went 4.0 → 5.0 kg·m/s.' },
 { name:'BALL THROWN UP', icon:'⚾', guided:true,
   story:'You toss a 0.50 kg ball straight up at 6.0 m/s. Gravity pulls down with mg = 0.50 × 9.8 = 4.9 N for the next 0.41 s (so F⃗Δt ≈ ⟨0, −2.0, 0⟩ N·s).',
   scale:'1 square = 1.0 kg·m/s', factor:1, dec:1, unitP:'kg·m/s', unitJ:'N·s',
   anchor:[7,3], pi:[0,3], J:[0,-2],
   lx:'\\vec p_f=\\langle 0,\\;1.0,\\;0\\rangle\\ \\mathrm{kg{\\cdot}m/s}',
   lesson:'Gravity SHRANK p⃗ but didn’t reverse it yet — the ball is still rising, just slower (3.0 → 1.0 kg·m/s).' },
 { name:'FAN CART', icon:'🛒', guided:true,
   story:'A 0.40 kg fan cart rolls along +x at 0.25 m/s. Its fan pushes it forward (+x) with 0.020 N for 5.0 s.',
   scale:'1 square = 0.05 kg·m/s', factor:0.05, dec:2, unitP:'kg·m/s', unitJ:'N·s',
   anchor:[4,5], pi:[2,0], J:[2,0],
   lx:'\\vec p_f=\\langle 0.20,\\;0,\\;0\\rangle\\ \\mathrm{kg{\\cdot}m/s}',
   lesson:'F⃗ parallel to p⃗: direction unchanged, magnitude grows. The cart speeds up 0.25 → 0.50 m/s.' },
 { name:'FAN CART, FLIPPED', icon:'🔄', guided:false,
   story:'The same 0.40 kg cart now rolls +x at 0.375 m/s — but the fan is flipped: 0.050 N in −x for 5.0 s. The impulse arrow is parked in the corner: slide it tip-to-tail in your head.',
   scale:'1 square = 0.05 kg·m/s', factor:0.05, dec:2, unitP:'kg·m/s', unitJ:'N·s',
   anchor:[8,5], pi:[3,0], J:[-5,0], jAnchor:[12.5,9],
   lx:'\\vec p_f=\\langle -0.10,\\;0,\\;0\\rangle\\ \\mathrm{kg{\\cdot}m/s}',
   lesson:'A big opposing impulse REVERSES p⃗. And note |Δp⃗| = 0.25 kg·m/s is larger than |p⃗_i| itself — |Δp⃗| ≠ Δ|p⃗|!' },
 { name:'BALL ON AN ARC', icon:'🥎', guided:false,
   story:'A 0.50 kg ball flies with v⃗ = ⟨3.0, 2.0, 0⟩ m/s. Gravity (4.9 N, −y) acts for 0.41 s, so F⃗Δt ≈ ⟨0, −2.0, 0⟩ N·s.',
   scale:'1 square = 0.5 kg·m/s', factor:0.5, dec:1, unitP:'kg·m/s', unitJ:'N·s',
   anchor:[4,6], pi:[3,2], J:[0,-4], jAnchor:[1.5,10],
   lx:'\\vec p_f=\\langle 1.5,\\;-1.0,\\;0\\rangle\\ \\mathrm{kg{\\cdot}m/s}',
   lesson:'Gravity is purely −y, so p_x NEVER changed; p_y flipped +1.0 → −1.0. That’s why projectile paths are symmetric arcs.' },
 { name:'SKYDIVER', icon:'🪂', guided:false,
   story:'An 80 kg skydiver falls at terminal speed, 50 m/s. Air drag exactly balances gravity: F⃗_net = ⟨0, 0, 0⟩ N for the next 2.0 s. So what does p⃗ do?',
   scale:'1 square = 1000 kg·m/s', factor:1000, dec:0, unitP:'kg·m/s', unitJ:'N·s',
   anchor:[7,9], pi:[0,-4], J:[0,0], jAnchor:[2,9],
   lx:'\\vec p_f=\\langle 0,\\;-4000,\\;0\\rangle\\ \\mathrm{kg{\\cdot}m/s}',
   lesson:'Zero net force ≠ stopping! With F⃗_netΔt = 0⃗, p⃗_f = p⃗_i exactly: she keeps falling at constant velocity.' },
 { name:'CURVING COMET', icon:'☄️', guided:false,
   story:'A 1.0×10¹⁴ kg comet cruises +x at 4.0 km/s. The Sun sits below its path, pulling 2.0×10¹³ N toward it (−y) for 5.0×10³ s.',
   scale:'1 square = 1×10¹⁷ kg·m/s', factor:1, dec:1, unitP:'×10¹⁷ kg·m/s', unitJ:'×10¹⁷ N·s',
   anchor:[4,7], pi:[4,0], J:[0,-1], jAnchor:[1.5,9.5], sun:[8,2.2],
   lx:'\\vec p_f=\\langle 4.0,\\;-1.0,\\;0\\rangle\\times10^{17}\\ \\mathrm{kg{\\cdot}m/s}',
   lesson:'F⃗ ⊥ p⃗ mostly TURNS p⃗: |p⃗| barely changed (4.0 → √17 ≈ 4.1) but the direction bent toward the Sun. Keep applying that and p⃗ curves all the way around — an orbit (Ch 5).' }
];

/* ---------- tiny helpers ---------- */
function el(tag,attrs,parent){
  var n=document.createElementNS(SVGNS,tag);
  if(attrs) for(var k in attrs) n.setAttribute(k,attrs[k]);
  if(parent) parent.appendChild(n);
  return n;
}
function hel(tag,cls,parent,txt){
  var n=document.createElement(tag);
  if(cls) n.className=cls;
  if(txt!==undefined) n.textContent=txt;
  if(parent) parent.appendChild(n);
  return n;
}
function P(x,y){ return [x*CELL, H-y*CELL]; } /* cell coords (y up) -> px */
function fmtN(v,dec){
  var s=(dec===0)?String(Math.round(v)):v.toFixed(dec);
  if(parseFloat(s)===0) s='0';
  return s.replace(/-/g,'−');
}
function vecStr(v,r){ return '⟨'+fmtN(v[0]*r.factor,r.dec)+', '+fmtN(v[1]*r.factor,r.dec)+', 0⟩'; }
function eq(a,b){ return a[0]===b[0]&&a[1]===b[1]; }

function mkArrow(parent,color,wpx,dashed){
  var g=el('g',{},parent);
  var ln=el('line',{stroke:color,'stroke-width':wpx,'stroke-linecap':'round'},g);
  if(dashed) ln.setAttribute('stroke-dasharray','6 5');
  var hd=el('polygon',{fill:color},g);
  var lb=el('text',{'font-size':'15','font-family':"'Cambria Math','Times New Roman',serif",fill:color,'paint-order':'stroke',stroke:'#06060d','stroke-width':'3'},g);
  return {
    g:g,
    set:function(x1,y1,x2,y2,label){
      var dx=x2-x1, dy=y2-y1, L=Math.sqrt(dx*dx+dy*dy);
      if(L<2){
        ln.setAttribute('x1',x1); ln.setAttribute('y1',y1);
        ln.setAttribute('x2',x1); ln.setAttribute('y2',y1);
        hd.setAttribute('points','');
        lb.textContent='';
        return;
      }
      var ux=dx/L, uy=dy/L, hl=Math.min(13,5+L*0.18), hw=hl*0.5;
      var bx=x2-ux*hl, by=y2-uy*hl;
      ln.setAttribute('x1',x1); ln.setAttribute('y1',y1);
      ln.setAttribute('x2',bx); ln.setAttribute('y2',by);
      hd.setAttribute('points',
        x2+','+y2+' '+(bx-uy*hw)+','+(by+ux*hw)+' '+(bx+uy*hw)+','+(by-ux*hw));
      if(label){
        var mx=x1+dx*0.55-uy*14, my=y1+dy*0.55+ux*14;
        mx=Math.max(12,Math.min(W-30,mx)); my=Math.max(14,Math.min(H-6,my));
        lb.setAttribute('x',mx); lb.setAttribute('y',my);
        lb.textContent=label;
      } else lb.textContent='';
    },
    show:function(v){ g.style.display=v?'':'none'; }
  };
}

/* ---------- module state ---------- */
var ST=null;

function mount(host,api){
  api=api||{};
  injectCSS();
  ST={api:api, idx:0, misses:0, solved:false, raf:0, timer:0, ghost:null, dragId:null, cand:[1,1]};

  var root=hel('div','tr-momentum-wrap',host);
  ST.root=root;

  var meta=hel('div','tr-momentum-meta',root);
  ST.metaL=hel('span','',meta); ST.metaL.innerHTML='ROUND <b>1/'+ROUNDS.length+'</b>';
  ST.metaR=hel('span','',meta,'');

  ST.title=hel('h3','tr-momentum-title',root,'');
  ST.story=hel('p','tr-momentum-story',root,'');

  var eqBox=hel('div','tr-momentum-eq',root);
  if(api.latex) api.latex(eqBox,'\\vec p_f=\\vec p_i+\\vec F_{\\rm net}\\,\\Delta t\\qquad(\\vec p\\approx m\\vec v,\\;\\Delta\\vec p=\\vec F_{\\rm net}\\Delta t)');
  else eqBox.textContent='p⃗_f = p⃗_i + F⃗_net Δt   (p⃗ ≈ mv⃗)';

  var chips=hel('div','tr-momentum-chips',root);
  ST.chipPi=hel('span','tr-momentum-chip tr-momentum-cpi',chips,'');
  ST.chipJ=hel('span','tr-momentum-chip tr-momentum-cj',chips,'');
  ST.chipPf=hel('span','tr-momentum-chip tr-momentum-cpf',chips,'');

  var box=hel('div','tr-momentum-svgbox',root);
  ST.box=box;
  var svg=el('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':'Momentum vector grid'},null);
  box.appendChild(svg);
  ST.svg=svg;

  /* static grid */
  var d='';
  for(var i=0;i<=GW;i++) d+='M'+(i*CELL)+' 0V'+H;
  for(var j=0;j<=GH;j++) d+='M0 '+(j*CELL)+'H'+W;
  el('path',{d:d,stroke:'#191938','stroke-width':'1',fill:'none'},svg);
  ST.scene=el('g',{},svg);   /* per-round content */

  ST.live=hel('div','tr-momentum-live',root,'');
  ST.hint=hel('div','tr-momentum-hint',root,'');
  ST.fb=hel('div','tr-momentum-fb',root,'');

  var btns=hel('div','tr-momentum-btns',root);
  ST.checkBtn=hel('button','tr-momentum-btn',btns,'CHECK ▶');
  ST.nextBtn=hel('button','tr-momentum-btn tr-momentum-go',btns,'NEXT ROUND ▶');
  ST.nextBtn.style.display='none';
  ST.onCheck=function(){ check(); };
  ST.onNext=function(){ nextRound(); };
  ST.checkBtn.addEventListener('click',ST.onCheck);
  ST.nextBtn.addEventListener('click',ST.onNext);

  loadRound(0);
}

function reducedMotion(){
  var api=ST&&ST.api;
  if(api&&api.reducedMotion) return api.reducedMotion();
  try{ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; }
}

/* ---------- round setup ---------- */
function loadRound(idx){
  var r=ROUNDS[idx];
  ST.idx=idx; ST.misses=0; ST.solved=false;
  cancelAnimationFrame(ST.raf); clearTimeout(ST.timer);

  ST.metaL.innerHTML='ROUND <b>'+(idx+1)+'/'+ROUNDS.length+'</b>';
  ST.metaR.textContent=r.scale;
  ST.title.textContent=r.icon+' '+r.name;
  ST.story.textContent=r.story;
  ST.chipPi.textContent='p⃗ᵢ = '+vecStr(r.pi,r)+' '+r.unitP;
  ST.chipJ.textContent='F⃗Δt = '+vecStr(r.J,r)+' '+r.unitJ;
  ST.hint.className='tr-momentum-hint';
  ST.fb.className='tr-momentum-fb'; ST.fb.textContent='';
  ST.checkBtn.disabled=false; ST.checkBtn.style.display='';
  ST.nextBtn.style.display='none';
  ST.nextBtn.textContent=(idx===ROUNDS.length-1)?'FINISH ▶':'NEXT ROUND ▶';

  /* rebuild scene */
  var sc=ST.scene;
  while(sc.firstChild) sc.removeChild(sc.firstChild);

  var a=r.anchor, ap=P(a[0],a[1]);
  ST.pf=[r.pi[0]+r.J[0], r.pi[1]+r.J[1]];
  ST.cand=eq([1,1],ST.pf)?[1,2]:[1,1];

  if(r.sun){
    var sun=el('text',{x:P(r.sun[0],r.sun[1])[0]-11,y:P(r.sun[0],r.sun[1])[1],'font-size':'22'},sc);
    sun.textContent='☀️';
  }

  /* p_i arrow (cyan) from the dot */
  var piTip=P(a[0]+r.pi[0], a[1]+r.pi[1]);
  var arPi=mkArrow(sc,'var(--cyan, #21e6ff)',4,false);
  arPi.set(ap[0],ap[1],piTip[0],piTip[1],'p⃗ᵢ');

  /* impulse arrow (magenta): guided = tip-to-tail at p_i's tip; else parked at jAnchor */
  var jLen=Math.sqrt(r.J[0]*r.J[0]+r.J[1]*r.J[1]);
  if(jLen>0){
    var ja, off=[0,0];
    if(r.guided){
      ja=[a[0]+r.pi[0], a[1]+r.pi[1]];
      /* if J is collinear with p_i, nudge its drawing sideways so both stay visible */
      if(r.pi[0]*r.J[1]-r.pi[1]*r.J[0]===0){
        var ux=r.J[0]/jLen, uy=r.J[1]/jLen;
        off=[ -uy*6, -ux*6 ]; /* px offset perpendicular (svg y is flipped) */
      }
    } else ja=r.jAnchor;
    var j1=P(ja[0],ja[1]), j2=P(ja[0]+r.J[0], ja[1]+r.J[1]);
    var arJ=mkArrow(sc,'var(--magenta, #ff3df0)',4,false);
    arJ.set(j1[0]+off[0],j1[1]+off[1],j2[0]+off[0],j2[1]+off[1],'F⃗Δt');
  } else {
    var z=P(r.jAnchor[0],r.jAnchor[1]);
    el('circle',{cx:z[0],cy:z[1],r:'5',fill:'none',stroke:'var(--magenta, #ff3df0)','stroke-width':'2'},sc);
    var zt=el('text',{x:z[0]+10,y:z[1]+5,'font-size':'15',fill:'var(--magenta, #ff3df0)','font-family':"'Cambria Math','Times New Roman',serif"},sc);
    zt.textContent='F⃗Δt = 0⃗';
  }

  /* hint arrow (dashed yellow translated J) + hint ring — hidden until needed */
  ST.hintArrow=mkArrow(sc,'var(--yellow, #ffe14d)',3,true);
  ST.hintArrow.show(false);
  var tgt=P(a[0]+ST.pf[0], a[1]+ST.pf[1]);
  ST.hintRing=el('circle',{cx:tgt[0],cy:tgt[1],r:'11',fill:'none',stroke:'var(--yellow, #ffe14d)','stroke-width':'2','stroke-dasharray':'4 4'},sc);
  ST.hintRing.style.display='none';

  /* candidate p_f arrow (green) + drag handle */
  ST.arPf=mkArrow(sc,'var(--green, #39ff88)',3.5,false);
  ST.handleG=el('g',{},sc);
  ST.handleHit=el('circle',{r:'26',fill:'rgba(57,255,136,0.001)',stroke:'none'},ST.handleG);
  ST.handleDot=el('circle',{r:'8',fill:'var(--green, #39ff88)',stroke:'#06060d','stroke-width':'2'},ST.handleG);
  ST.handleHit.style.cursor='grab';
  ST.handleHit.style.touchAction='none';

  /* the moving body (yellow dot) */
  ST.dot=el('circle',{cx:ap[0],cy:ap[1],r:'6.5',fill:'var(--yellow, #ffe14d)'},sc);
  ST.trail=[];

  attachDrag();
  redrawCand();
  if(ST.api.announce) ST.api.announce('Round '+(idx+1)+': '+r.name+'. Drag the green arrow tip so p f equals p i plus net force times delta t.');
}

function redrawCand(){
  var r=ROUNDS[ST.idx], a=r.anchor;
  var t=P(a[0]+ST.cand[0], a[1]+ST.cand[1]), ap=P(a[0],a[1]);
  ST.arPf.set(ap[0],ap[1],t[0],t[1],'p⃗f ?');
  ST.handleHit.setAttribute('cx',t[0]); ST.handleHit.setAttribute('cy',t[1]);
  ST.handleDot.setAttribute('cx',t[0]); ST.handleDot.setAttribute('cy',t[1]);
  var s=vecStr(ST.cand,r);
  ST.live.textContent='your p⃗_f = '+s+' '+r.unitP;
  ST.chipPf.textContent='p⃗_f = '+(ST.solved?s+' '+r.unitP:s+' ?');
}

/* ---------- drag (pointer events + capture + floating ghost) ---------- */
function svgXY(e){
  var rect=ST.svg.getBoundingClientRect();
  return [ (e.clientX-rect.left)*W/rect.width, (e.clientY-rect.top)*H/rect.height ];
}
function attachDrag(){
  var hit=ST.handleHit;
  hit.addEventListener('pointerdown',function(e){
    if(ST.solved) return;
    e.preventDefault();
    ST.dragId=e.pointerId;
    try{ hit.setPointerCapture(e.pointerId); }catch(err){}
    makeGhost(e);
    dragMove(e);
  });
  hit.addEventListener('pointermove',function(e){
    if(ST.dragId!==e.pointerId) return;
    dragMove(e);
  });
  var end=function(e){
    if(ST.dragId!==e.pointerId) return;
    ST.dragId=null;
    removeGhost();
  };
  hit.addEventListener('pointerup',end);
  hit.addEventListener('pointercancel',end);
}
function dragMove(e){
  var r=ROUNDS[ST.idx], a=r.anchor, p=svgXY(e);
  /* raw vector from anchor in cell coords (y up), snapped to grid intersections */
  var vx=Math.round(p[0]/CELL-a[0]);
  var vy=Math.round((H-p[1])/CELL-a[1]);
  vx=Math.max(-a[0],Math.min(GW-a[0],vx));
  vy=Math.max(-a[1],Math.min(GH-a[1],vy));
  ST.cand=[vx,vy];
  redrawCand();
  if(ST.ghost){
    ST.ghost.textContent='⟨'+fmtN(vx*r.factor,r.dec)+', '+fmtN(vy*r.factor,r.dec)+', 0⟩';
    ST.ghost.style.left=e.clientX+'px';
    ST.ghost.style.top=e.clientY+'px';
  }
}
function makeGhost(e){
  removeGhost();
  var g=document.createElement('div');
  g.className='tr-momentum-ghost';
  g.style.left=e.clientX+'px'; g.style.top=e.clientY+'px';
  var layer=document.getElementById('vz-floatLayer')||document.body;
  layer.appendChild(g);
  ST.ghost=g;
}
function removeGhost(){
  if(ST&&ST.ghost&&ST.ghost.parentNode) ST.ghost.parentNode.removeChild(ST.ghost);
  if(ST) ST.ghost=null;
}

/* ---------- checking ---------- */
function check(){
  if(ST.solved) return;
  var r=ROUNDS[ST.idx], api=ST.api;
  if(eq(ST.cand,ST.pf)){ onCorrect(); return; }

  ST.misses++;
  var msg;
  if(eq(ST.cand,[r.pi[0]-r.J[0],r.pi[1]-r.J[1]]))
    msg='You SUBTRACTED the impulse. Δp⃗ = F⃗_netΔt gets ADDED to p⃗_i (final = initial + change).';
  else if(eq(ST.cand,r.J)&&(r.J[0]||r.J[1]))
    msg='That arrow is just F⃗Δt = Δp⃗ — the CHANGE. You still need to add p⃗_i to it.';
  else if(eq(ST.cand,r.pi)&&(r.J[0]||r.J[1]))
    msg='That’s p⃗_i unchanged — but a nonzero net force always changes p⃗.';
  else
    msg=(ST.misses===1)?'Not quite. Add the vectors COMPONENT by component: x with x, y with y.':'Still off — check the hint below.';
  ST.fb.className='tr-momentum-fb tr-momentum-bad';
  ST.fb.textContent=msg;
  if(api.toast) api.toast('Try again — tip-to-tail!');
  if(!reducedMotion()){
    ST.box.classList.remove('tr-momentum-shake');
    void ST.box.offsetWidth;
    ST.box.classList.add('tr-momentum-shake');
  }
  if(ST.misses>=2) showHint();
}
function showHint(){
  var r=ROUNDS[ST.idx], a=r.anchor;
  if(r.J[0]||r.J[1]){
    var t1=P(a[0]+r.pi[0],a[1]+r.pi[1]);
    var t2=P(a[0]+r.pi[0]+r.J[0],a[1]+r.pi[1]+r.J[1]);
    ST.hintArrow.set(t1[0],t1[1],t2[0],t2[1],'');
    ST.hintArrow.show(!r.guided);
  }
  ST.hintRing.style.display='';
  ST.hint.className='tr-momentum-hint tr-momentum-on';
  ST.hint.textContent='Hint: slide F⃗Δt so its TAIL sits on the TIP of p⃗_i (tip-to-tail). p⃗_f runs from the dot straight to where F⃗Δt ends — the dashed ring marks that tip. In components: p_f,x = p_i,x + F_xΔt and p_f,y = p_i,y + F_yΔt.';
}
function onCorrect(){
  var r=ROUNDS[ST.idx], api=ST.api;
  ST.solved=true;
  ST.hintRing.style.display='none';
  ST.hintArrow.show(false);
  ST.handleHit.style.cursor='default';
  ST.checkBtn.disabled=true;
  redrawCand();
  /* show the completed triangle on unguided rounds */
  if(!r.guided&&(r.J[0]||r.J[1])){
    var a=r.anchor;
    var t1=P(a[0]+r.pi[0],a[1]+r.pi[1]);
    var t2=P(a[0]+ST.pf[0],a[1]+ST.pf[1]);
    var tri=mkArrow(ST.scene,'var(--magenta, #ff3df0)',2.5,true);
    tri.set(t1[0],t1[1],t2[0],t2[1],'F⃗Δt');
  }
  ST.fb.className='tr-momentum-fb tr-momentum-good';
  ST.fb.textContent='✓ '+r.lesson;
  if(api.latex){
    var lxEl=document.createElement('div');
    ST.fb.appendChild(document.createElement('br'));
    ST.fb.appendChild(lxEl);
    api.latex(lxEl,r.lx);
  }
  if(api.xp) api.xp(1,'Momentum Principle');
  if(api.toast) api.toast('Tip-to-tail! p⃗_f locked in.','ok');
  if(api.confetti) api.confetti(ST.box);
  animateDot();
  ST.nextBtn.style.display='';
}

/* ---------- post-solve: the dot actually moves with its new momentum ---------- */
function animateDot(){
  if(reducedMotion()){ return; }
  var r=ROUNDS[ST.idx], a=r.anchor;
  var L=Math.sqrt(ST.pf[0]*ST.pf[0]+ST.pf[1]*ST.pf[1]);
  if(L===0) return;
  var dist=Math.min(2.6,L)*CELL;
  var ux=ST.pf[0]/L, uy=-ST.pf[1]/L; /* svg y down */
  var ap=P(a[0],a[1]), dur=900, t0=null, lastTrail=0;
  var step=function(ts){
    if(!ST) return;
    if(t0===null) t0=ts;
    var k=Math.min(1,(ts-t0)/dur);
    var x=ap[0]+ux*dist*k, y=ap[1]+uy*dist*k;
    ST.dot.setAttribute('cx',x); ST.dot.setAttribute('cy',y);
    if(ts-lastTrail>120){
      lastTrail=ts;
      var tr=el('circle',{cx:x,cy:y,r:'2.5',fill:'var(--yellow, #ffe14d)',opacity:'0.35'},ST.scene);
      ST.scene.insertBefore(tr,ST.dot.previousSibling||ST.dot);
    }
    if(k<1) ST.raf=requestAnimationFrame(step);
  };
  ST.raf=requestAnimationFrame(step);
}

/* ---------- round flow ---------- */
function nextRound(){
  if(ST.idx+1<ROUNDS.length){ loadRound(ST.idx+1); return; }
  /* finale */
  cancelAnimationFrame(ST.raf);
  ST.title.textContent='🏆 TRAINING COMPLETE';
  ST.story.textContent='All '+ROUNDS.length+' rounds done! You just used the Momentum Principle the way Matter & Interactions does: p⃗_f = p⃗_i + F⃗_netΔt, always tip-to-tail, always final minus initial. Remember: forces parallel to p⃗ change its magnitude; forces perpendicular to p⃗ change its direction.';
  ST.fb.className='tr-momentum-fb tr-momentum-good';
  ST.fb.textContent='★ Run it again — speed and confidence are the goal.';
  ST.hint.className='tr-momentum-hint';
  ST.live.textContent='';
  while(ST.scene.firstChild) ST.scene.removeChild(ST.scene.firstChild);
  ST.checkBtn.style.display='none';
  ST.nextBtn.textContent='RESTART ▶';
  ST.nextBtn.onclick=null;
  var api=ST.api;
  if(api.confetti) api.confetti(ST.nextBtn);
  if(api.toast) api.toast('Momentum trainer complete!','ok');
  ST.nextBtn.removeEventListener('click',ST.onNext);
  ST.onNext=function(){ loadRound(0); rebindNext(); };
  ST.nextBtn.addEventListener('click',ST.onNext);
}
function rebindNext(){
  ST.nextBtn.removeEventListener('click',ST.onNext);
  ST.onNext=function(){ nextRound(); };
  ST.nextBtn.addEventListener('click',ST.onNext);
}

function unmount(){
  if(!ST) return;
  cancelAnimationFrame(ST.raf);
  clearTimeout(ST.timer);
  removeGhost();
  if(ST.checkBtn) ST.checkBtn.removeEventListener('click',ST.onCheck);
  if(ST.nextBtn) ST.nextBtn.removeEventListener('click',ST.onNext);
  if(ST.root&&ST.root.parentNode) ST.root.parentNode.removeChild(ST.root);
  ST=null;
}

/* ---------- register ---------- */
(window.TRAINING_MODULES=window.TRAINING_MODULES||[]).push({
  id:ID,
  title:'Momentum Vector Trainer',
  icon:'🏒',
  blurb:'Drag p⃗_f to complete p⃗_f = p⃗_i + F⃗Δt tip-to-tail',
  desc:'drag the tip-to-tail p⃗_f arrow',
  chapter:'Ch 2',
  mount:mount,
  unmount:unmount
});
})();
