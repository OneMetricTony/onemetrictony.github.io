/* tr-fbd.js — Free-Body Diagram Builder for CPCS110 Physics Arcade
   Plain browser JS (ES2017 max), IIFE, no modules.
   Drag force-arrow tiles onto a dot, live ΣFx/ΣFy equations update.
   Spec §5 pointer-event drag pattern, §7 API bridge. */
(function(){
'use strict';

var ID='fbd';

/* ===================================================================
   CSS — injected once, all selectors prefixed .tr-fbd- or #trfbd*
   =================================================================== */
function injectCSS(){
  if(document.getElementById('tr-style-'+ID)) return;
  var s=document.createElement('style'); s.id='tr-style-'+ID;
  s.textContent=[
  /* root / layout */
  '.tr-fbd-wrap{max-width:560px;margin:0 auto;color:var(--ink,#d7e6ff);display:flex;flex-direction:column;gap:10px;padding:4px 2px 18px;}',
  '.tr-fbd-meta{display:flex;justify-content:space-between;align-items:center;gap:8px;font-family:"Press Start 2P",monospace;font-size:9px;color:var(--dim,#a9b5d9);}',
  '.tr-fbd-meta b{color:var(--cyan,#21e6ff);font-weight:normal;}',
  /* scenario picker */
  '.tr-fbd-scenelabel{font-family:"Press Start 2P",monospace;font-size:10px;color:var(--cyan,#21e6ff);margin:2px 0 0;}',
  '.tr-fbd-scenes{display:grid;grid-template-columns:1fr 1fr;gap:8px;}',
  '.tr-fbd-scard{background:linear-gradient(160deg,#12122b,#0c0c1e);border:2px solid #2a2a55;border-radius:14px;padding:10px 8px;cursor:pointer;text-align:center;transition:border-color .18s,box-shadow .18s;min-height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;}',
  '.tr-fbd-scard:hover,.tr-fbd-scard:focus{border-color:var(--cyan,#21e6ff);box-shadow:0 0 10px rgba(33,230,255,.2);outline:none;}',
  '.tr-fbd-scard.tr-fbd-active{border-color:var(--yellow,#ffe14d);box-shadow:0 0 12px rgba(255,225,77,.25);}',
  '.tr-fbd-scard-ic{font-size:22px;line-height:1;}',
  '.tr-fbd-scard-tt{font-family:"Press Start 2P",monospace;font-size:8px;color:var(--cyan,#21e6ff);line-height:1.4;}',
  '.tr-fbd-scard-ds{font-size:11px;color:var(--dim,#a9b5d9);line-height:1.4;}',
  /* diagram area */
  '.tr-fbd-diagarea{background:linear-gradient(160deg,#0b0b1e,#080814);border:2px solid #2a2a55;border-radius:14px;position:relative;overflow:visible;touch-action:none;user-select:none;-webkit-user-select:none;}',
  '.tr-fbd-diagarea svg{display:block;width:100%;height:auto;touch-action:none;}',
  /* force palette */
  '.tr-fbd-pallabel{font-family:"Press Start 2P",monospace;font-size:9px;color:var(--dim,#a9b5d9);margin:2px 0 0;}',
  '.tr-fbd-palette{display:flex;flex-wrap:wrap;gap:7px;}',
  '.tr-fbd-tile{background:var(--panel2,#13132b);border:1.5px solid #2a2a55;border-radius:11px;padding:7px 8px 6px;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:60px;min-height:50px;justify-content:center;transition:opacity .15s,border-color .15s;}',
  '.tr-fbd-tile:hover{border-color:var(--cyan,#21e6ff);}',
  '.tr-fbd-tile.tr-fbd-placed{opacity:.3;cursor:default;pointer-events:none;}',
  '.tr-fbd-tile.tr-fbd-bogus{border-color:rgba(255,84,112,.45);}',
  '.tr-fbd-tile.tr-fbd-bogus:hover{border-color:var(--red,#ff5470);}',
  '.tr-fbd-tile-arrow{font-size:16px;line-height:1;}',
  '.tr-fbd-tile-name{font-size:10px;font-family:"Press Start 2P",monospace;color:var(--cyan,#21e6ff);text-align:center;line-height:1.3;}',
  '.tr-fbd-tile-sym{font-size:11px;font-family:"Cambria Math","Times New Roman",serif;color:var(--dim,#a9b5d9);}',
  /* equations */
  '.tr-fbd-eqlabel{font-family:"Press Start 2P",monospace;font-size:9px;color:var(--dim,#a9b5d9);margin:2px 0 0;}',
  '.tr-fbd-eqbox{background:linear-gradient(160deg,#0d0d22,#090918);border:1.5px solid #2a2a55;border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:6px;}',
  '.tr-fbd-eqrow{min-height:22px;font-size:15px;font-family:"Cambria Math","Times New Roman",serif;}',
  /* feedback / info */
  '.tr-fbd-fb{display:none;border-radius:10px;padding:9px 11px;font-size:13px;line-height:1.5;border:1px solid transparent;margin-top:2px;}',
  '.tr-fbd-fb.tr-fbd-good{display:block;color:var(--green,#39ff88);border-color:rgba(57,255,136,.4);background:rgba(57,255,136,.07);}',
  '.tr-fbd-fb.tr-fbd-bad{display:block;color:var(--red,#ff5470);border-color:rgba(255,84,112,.4);background:rgba(255,84,112,.07);}',
  '.tr-fbd-fb.tr-fbd-info{display:block;color:var(--yellow,#ffe14d);border-color:rgba(255,225,77,.35);background:rgba(255,225,77,.06);}',
  /* bogus-snap explanation */
  '.tr-fbd-bogus-msg{display:none;background:rgba(255,84,112,.08);border:1px dashed var(--red,#ff5470);color:var(--red,#ff5470);border-radius:10px;padding:8px 11px;font-size:12.5px;line-height:1.5;}',
  '.tr-fbd-bogus-msg.tr-fbd-on{display:block;}',
  /* buttons */
  '.tr-fbd-btns{display:flex;gap:8px;}',
  '.tr-fbd-btn{flex:1;min-height:48px;border:0;border-radius:12px;cursor:pointer;font-family:"Press Start 2P",monospace;font-size:10px;background:var(--cyan,#21e6ff);color:#02131a;padding:10px;}',
  '.tr-fbd-btn:disabled{opacity:.45;cursor:default;}',
  '.tr-fbd-btn.tr-fbd-go{background:var(--green,#39ff88);}',
  '.tr-fbd-btn.tr-fbd-reset{background:var(--panel2,#13132b);color:var(--dim,#a9b5d9);border:1.5px solid #2a2a55;}',
  '.tr-fbd-btn:active:not(:disabled){transform:translateY(1px);}',
  /* ghost */
  '.tr-fbd-ghost{position:fixed;z-index:9999;pointer-events:none;background:#0e0e1c;border:1.5px solid var(--cyan,#21e6ff);color:var(--cyan,#21e6ff);font-family:"Press Start 2P",monospace;font-size:9px;padding:5px 8px;border-radius:9px;transform:translate(-50%,-135%);white-space:nowrap;box-shadow:0 0 10px rgba(33,230,255,.3);}',
  /* shake for bogus */
  '.tr-fbd-shake{animation:trfbdShake .38s;}',
  '@keyframes trfbdShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}',
  /* placed arrow pop */
  '.tr-fbd-popin{animation:trfbdPop .22s ease-out;}',
  '@keyframes trfbdPop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}',
  /* gallery (collapsible) */
  '.tr-fbd-gal{border:1.5px solid #2a2a55;border-radius:12px;overflow:hidden;}',
  '.tr-fbd-gal-hdr{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;cursor:pointer;background:#0e0e1c;font-family:"Press Start 2P",monospace;font-size:9px;color:var(--dim,#a9b5d9);}',
  '.tr-fbd-gal-hdr:hover{color:var(--cyan,#21e6ff);}',
  '.tr-fbd-gal-body{display:none;padding:10px 12px;flex-direction:column;gap:8px;}',
  '.tr-fbd-gal-body.tr-fbd-open{display:flex;}',
  '.tr-fbd-gal-row{display:flex;gap:8px;align-items:flex-start;font-size:12.5px;line-height:1.55;border-bottom:1px solid #1a1a38;padding-bottom:7px;}',
  '.tr-fbd-gal-row:last-child{border-bottom:none;padding-bottom:0;}',
  '.tr-fbd-gal-ic{font-size:18px;min-width:26px;text-align:center;line-height:1;}',
  '.tr-fbd-gal-text b{color:var(--cyan,#21e6ff);font-family:"Cambria Math","Times New Roman",serif;font-size:14px;}',
  '.tr-fbd-gal-text small{color:var(--dim,#a9b5d9);font-size:11.5px;}',
  /* reduced motion */
  '@media(prefers-reduced-motion:reduce){.tr-fbd-shake{animation:none;}.tr-fbd-popin{animation:none;}}'
  ].join('');
  document.head.appendChild(s);
}

/* ===================================================================
   SCENARIO DATA
   Each scenario defines:
     forces[]: which force IDs are CORRECT for this scenario
     bogus: IDs are already in FORCE_DEFS as bogus tiles
     eqFn(placed): returns {x: texString, y: texString, solved: bool}
     solvedMsg: string shown on completion
     solveEq: latex string of the final equation
   =================================================================== */
var SCENARIOS=[
  {
    id:'rest-flat',
    icon:'📦',
    title:'BLOCK AT REST',
    desc:'Flat table, a=0',
    scene:'📦 on ─────',
    what:'Block sits still on a flat table. Net force = 0.',
    /* axes: +x right, +y up */
    forces:['gravity','normal-up'],
    palette:['gravity','normal-up','tension-up','f-kinetic-left','air-drag','bogus-motion','bogus-centrifugal'],
    eqFn:function(placed){
      var hasN=placed.indexOf('normal-up')>=0;
      var hasG=placed.indexOf('gravity')>=0;
      var yTerms=[];
      if(hasN) yTerms.push('+N');
      if(hasG) yTerms.push('-mg');
      var solved=(hasN&&hasG&&placed.length===2);
      return {
        x:'\\Sigma F_x = 0',
        y:'\\Sigma F_y = '+(yTerms.length?yTerms.join('')+(solved?'= 0':'= ?'):'?'),
        note:solved?'\\Rightarrow N = mg':'',
        solved:solved
      };
    },
    solvedMsg:'Correct FBD! N exactly cancels gravity — no net force, so a = 0. (Note: N = mg is only true here because nothing else pushes vertically.)',
    solveEq:'N = mg'
  },
  {
    id:'drag-constant',
    icon:'➡️',
    title:'DRAGGED AT CONST v',
    desc:'Kinetic friction present',
    scene:'→ 📦 on ─────',
    what:'Block dragged right at constant velocity. a = 0, so ΣF = 0.',
    forces:['gravity','normal-up','f-applied-right','f-kinetic-left'],
    palette:['gravity','normal-up','f-applied-right','f-kinetic-left','tension-up','air-drag','bogus-motion','bogus-centrifugal'],
    eqFn:function(placed){
      var hasN=placed.indexOf('normal-up')>=0;
      var hasG=placed.indexOf('gravity')>=0;
      var hasF=placed.indexOf('f-applied-right')>=0;
      var hasK=placed.indexOf('f-kinetic-left')>=0;
      var xTerms=[], yTerms=[];
      if(hasF) xTerms.push('+F_{app}');
      if(hasK) xTerms.push('-f_k');
      if(hasN) yTerms.push('+N');
      if(hasG) yTerms.push('-mg');
      var solved=(hasN&&hasG&&hasF&&hasK&&placed.length===4);
      return {
        x:'\\Sigma F_x = '+(xTerms.length?xTerms.join('')+(solved?'= 0':'= ?'):'?'),
        y:'\\Sigma F_y = '+(yTerms.length?yTerms.join('')+(solved?'= 0':'= ?'):'?'),
        note:solved?'\\Rightarrow F_{app}=f_k=\\mu_k N,\\quad N=mg':'',
        solved:solved
      };
    },
    solvedMsg:'Correct FBD! Constant velocity means a = 0: applied force exactly balances kinetic friction. Friction opposes the direction of sliding — not the direction of motion.',
    solveEq:'F_{app}=f_k=\\mu_k N,\\quad N=mg'
  },
  {
    id:'incline-static',
    icon:'⛰️',
    title:'BLOCK ON INCLINE',
    desc:'Static friction, at rest',
    scene:'📦 on /───',
    what:'Block at rest on a slope (θ from horizontal). Static friction prevents sliding.',
    forces:['gravity','normal-incline','f-static-up-slope'],
    palette:['gravity','normal-incline','f-static-up-slope','f-kinetic-left','normal-up','tension-up','bogus-motion','bogus-centrifugal'],
    eqFn:function(placed){
      var hasN=placed.indexOf('normal-incline')>=0;
      var hasG=placed.indexOf('gravity')>=0;
      var hasFs=placed.indexOf('f-static-up-slope')>=0;
      var xTerms=[], yTerms=[];
      /* For incline (axes rotated: x along slope, y perpendicular) */
      if(hasFs) xTerms.push('+f_s');
      if(hasG)  xTerms.push('-mg\\sin\\theta');
      if(hasN)  yTerms.push('+N');
      if(hasG)  yTerms.push('-mg\\cos\\theta');
      var solved=(hasN&&hasG&&hasFs&&placed.length===3);
      return {
        x:'\\Sigma F_{\\parallel} = '+(xTerms.length?xTerms.join('')+(solved?'= 0':'= ?'):'?'),
        y:'\\Sigma F_{\\perp} = '+(yTerms.length?yTerms.join('')+(solved?'= 0':'= ?'):'?'),
        note:solved?'\\Rightarrow N=mg\\cos\\theta,\\quad f_s=mg\\sin\\theta':'',
        solved:solved
      };
    },
    solvedMsg:'Correct FBD! On the incline: N is perpendicular to the surface (not vertical!), and static friction acts up the slope opposing potential sliding. f_s ≤ μ_s N — it only equals mg sinθ here because the block is in equilibrium.',
    solveEq:'N=mg\\cos\\theta,\\quad f_s=mg\\sin\\theta\\leq\\mu_s N'
  },
  {
    id:'hanging-mass',
    icon:'⚓',
    title:'HANGING MASS',
    desc:'Single string, equilibrium',
    scene:'─────┬─\n      │\n     📦',
    what:'Mass hangs motionless from a string. Tension pulls up, gravity pulls down.',
    forces:['gravity','tension-up'],
    palette:['gravity','tension-up','normal-up','f-static-up-slope','air-drag','bogus-motion','bogus-centrifugal'],
    eqFn:function(placed){
      var hasT=placed.indexOf('tension-up')>=0;
      var hasG=placed.indexOf('gravity')>=0;
      var yTerms=[];
      if(hasT) yTerms.push('+T');
      if(hasG) yTerms.push('-mg');
      var solved=(hasT&&hasG&&placed.length===2);
      return {
        x:'\\Sigma F_x = 0',
        y:'\\Sigma F_y = '+(yTerms.length?yTerms.join('')+(solved?'= 0':'= ?'):'?'),
        note:solved?'\\Rightarrow T = mg':'',
        solved:solved
      };
    },
    solvedMsg:'Correct! Tension always pulls along the string toward the attachment point. Equilibrium gives T = mg. (No normal force — the mass is not touching a surface.)',
    solveEq:'T = mg'
  },
  {
    id:'elevator-up',
    icon:'🛗',
    title:'ELEVATOR ACCEL UP',
    desc:'a upward, v upward',
    scene:'↑ 🛗 (speeding up)',
    what:'Elevator accelerates upward. Net force points UP — cable tension > weight.',
    forces:['gravity','tension-up'],
    palette:['gravity','tension-up','normal-up','f-applied-right','air-drag','bogus-motion','bogus-centrifugal'],
    eqFn:function(placed){
      var hasT=placed.indexOf('tension-up')>=0;
      var hasG=placed.indexOf('gravity')>=0;
      var yTerms=[];
      if(hasT) yTerms.push('+T');
      if(hasG) yTerms.push('-mg');
      var solved=(hasT&&hasG&&placed.length===2);
      return {
        x:'\\Sigma F_x = 0',
        y:'\\Sigma F_y = '+(yTerms.length?yTerms.join('')+(solved?'= ma':'= ?'):'?'),
        note:solved?'\\Rightarrow T - mg = ma \\Rightarrow T = m(g+a)':'',
        solved:solved
      };
    },
    solvedMsg:'Correct! T > mg because ΣFy = ma > 0 (accelerating upward). Classic trap: students confuse direction of v⃗ with direction of a⃗. F⃗_net must match a⃗, NOT v⃗.',
    solveEq:'T - mg = ma \\Rightarrow T = m(g+a)'
  }
];

/* ===================================================================
   FORCE DEFINITIONS
   Each force: id, name, symbol, arrowDir (degrees, 0=right, 90=up),
   color, bogus (bool), bogusMsg (if bogus)
   =================================================================== */
var FORCE_DEFS=[
  {id:'gravity',        name:'Gravity',       sym:'mg↓',    dir:270, color:'#ff5470', bogus:false},
  {id:'normal-up',      name:'Normal (↑)',     sym:'N',      dir:90,  color:'#21e6ff', bogus:false},
  {id:'normal-incline', name:'Normal (⊥ slope)',sym:'N',    dir:120, color:'#21e6ff', bogus:false},
  {id:'tension-up',     name:'Tension',        sym:'T↑',    dir:90,  color:'#ffe14d', bogus:false},
  {id:'f-applied-right',name:'Applied F',      sym:'F_app→',dir:0,   color:'#39ff88', bogus:false},
  {id:'f-kinetic-left', name:'Kinetic Friction',sym:'f_k←', dir:180, color:'#ff3df0', bogus:false},
  {id:'f-static-up-slope',name:'Static Friction',sym:'f_s↗',dir:60, color:'#ff3df0', bogus:false},
  {id:'air-drag',       name:'Air Drag',       sym:'F_drag', dir:180, color:'#a9b5d9', bogus:false},
  {id:'bogus-motion',   name:'Force of Motion',sym:'F_?',   dir:0,   color:'#ff5470', bogus:true,
   bogusMsg:'"Force of motion" doesn\'t exist! Objects move because of inertia (Momentum Principle), not because a "force" keeps pushing them. Once the real forces are removed, p⃗ stays constant — no mystery force needed.'},
  {id:'bogus-centrifugal',name:'Centrifugal F',sym:'F_cf',  dir:0,   color:'#ff5470', bogus:true,
   bogusMsg:'"Centrifugal force" is a fictitious force — it only appears in a rotating (non-inertial) reference frame. In an inertial frame, the real force is centripetal (tension, normal, etc.) pointing inward. FBDs are always drawn in inertial frames.'}
];

/* Quick lookup by id */
var FORCE_MAP={};
FORCE_DEFS.forEach(function(f){ FORCE_MAP[f.id]=f; });

/* ===================================================================
   FORCE GALLERY DATA
   =================================================================== */
var GALLERY=[
  {ic:'⬇️', name:'Gravity (F_grav)',         formula:'F_grav = mg',      dir:'Always straight down (toward Earth center)', when:'Every object with mass near Earth'},
  {ic:'⬆️', name:'Normal Force (N)',          formula:'N = mg cosθ (incline)', dir:'Perpendicular to the contact surface — NOT necessarily vertical', when:'Object touching a surface (compression only)'},
  {ic:'🔗', name:'Tension (T)',               formula:'T = F along string', dir:'Along the string, toward the attachment point', when:'Object connected to a string/cable/rope'},
  {ic:'➡️', name:'Applied Force (F_app)',      formula:'Given',            dir:'Direction of the push/pull', when:'An external agent directly pushes or pulls'},
  {ic:'⬅️', name:'Kinetic Friction (f_k)',     formula:'f_k = μ_k N',      dir:'Tangent to surface, opposing the direction of sliding', when:'Two surfaces sliding relative to each other (μ_k < μ_s)'},
  {ic:'↗️', name:'Static Friction (f_s)',      formula:'f_s ≤ μ_s N',      dir:'Tangent to surface, opposing tendency to slide', when:'Surfaces in contact but not sliding — takes whatever value balances the other tangential forces, up to max'},
  {ic:'🌬️', name:'Air Drag (F_drag)',          formula:'F_drag ∝ v² (high speed)', dir:'Opposite to velocity', when:'Object moving through air at significant speed'},
  {ic:'🌀', name:'Spring Force (F_sp)',        formula:'F_sp = −k_s s',    dir:'Along spring, restoring: toward natural length', when:'Compressed or stretched spring attached to object'}
];

/* ===================================================================
   SVG DIAGRAM — draws the dot and placed force arrows
   viewBox 200×200, center at (100,100)
   =================================================================== */
var SVG_W=200, SVG_H=200, CX=100, CY=100, ARROW_LEN=54;
var SVGNS='http://www.w3.org/2000/svg';

function svgEl(tag,attrs,parent){
  var n=document.createElementNS(SVGNS,tag);
  if(attrs) Object.keys(attrs).forEach(function(k){ n.setAttribute(k,attrs[k]); });
  if(parent) parent.appendChild(n);
  return n;
}

/* Draw a labeled arrow from (cx,cy) at angle deg (0=right, 90=up in math coords).
   SVG y is flipped so +y-screen = -y-math. */
function drawArrow(parent, angleDeg, color, label, length){
  length=length||ARROW_LEN;
  var rad=angleDeg*Math.PI/180;
  var dx=Math.cos(rad)*length;
  var dy=-Math.sin(rad)*length; /* flip for SVG */
  var x1=CX, y1=CY, x2=CX+dx, y2=CY+dy;
  /* shorten start by dot radius */
  var dotR=9;
  var L=Math.sqrt(dx*dx+dy*dy)||1;
  x1=CX+(dx/L)*dotR; y1=CY+(dy/L)*dotR;

  var g=svgEl('g',{class:'tr-fbd-popin'},parent);
  /* shaft */
  var ux=dx/L, uy=dy/L, hl=11, hw=5.5;
  var bx=x2-ux*hl, by=y2-uy*hl;
  svgEl('line',{x1:x1,y1:y1,x2:bx,y2:by,stroke:color,'stroke-width':'2.5','stroke-linecap':'round'},g);
  /* arrowhead */
  svgEl('polygon',{
    points:x2+','+y2+' '+(bx-uy*hw)+','+(by+ux*hw)+' '+(bx+uy*hw)+','+(by-ux*hw),
    fill:color
  },g);
  /* label — offset perpendicular, nudge away from center */
  var lx=CX+dx*0.65-uy*13, ly=CY+dy*0.65+ux*13;
  lx=Math.max(8,Math.min(SVG_W-8,lx)); ly=Math.max(10,Math.min(SVG_H-4,ly));
  svgEl('text',{x:lx,y:ly,'font-size':'12','font-family':"'Cambria Math','Times New Roman',serif",fill:color,
    'paint-order':'stroke',stroke:'#07071a','stroke-width':'3','text-anchor':'middle'},g)
    .textContent=label;
  return g;
}

function buildDiagram(svgEl2, placedIds){
  /* clear */
  while(svgEl2.firstChild) svgEl2.removeChild(svgEl2.firstChild);
  /* axis lines */
  svgEl('line',{x1:CX-70,y1:CY,x2:CX+70,y2:CY,stroke:'#1e1e44','stroke-width':'1'},svgEl2);
  svgEl('line',{x1:CX,y1:CY-70,x2:CX,y2:CY+70,stroke:'#1e1e44','stroke-width':'1'},svgEl2);
  /* axis labels */
  svgEl('text',{x:CX+73,y:CY+4,'font-size':'10',fill:'#2a2a66','font-family':'sans-serif'},svgEl2).textContent='+x';
  svgEl('text',{x:CX+3,y:CY-73,'font-size':'10',fill:'#2a2a66','font-family':'sans-serif'},svgEl2).textContent='+y';
  /* placed arrows */
  placedIds.forEach(function(fid){
    var fd=FORCE_MAP[fid];
    if(!fd) return;
    drawArrow(svgEl2, fd.dir, fd.color, fd.sym, ARROW_LEN);
  });
  /* central dot (drawn last = on top) */
  svgEl('circle',{cx:CX,cy:CY,r:'9',fill:'var(--yellow,#ffe14d)',stroke:'#06060d','stroke-width':'2'},svgEl2);
  svgEl('text',{x:CX,y:CY+4,'font-size':'8',fill:'#06060d','font-family':'sans-serif','text-anchor':'middle'},svgEl2).textContent='m';
}

/* ===================================================================
   HTML BUILDER HELPERS
   =================================================================== */
function hel(tag,cls,parent,txt){
  var n=document.createElement(tag);
  if(cls) n.className=cls;
  if(txt!==undefined) n.textContent=txt;
  if(parent) parent.appendChild(n);
  return n;
}

/* ===================================================================
   MODULE STATE
   =================================================================== */
var ST=null;

/* ===================================================================
   MOUNT
   =================================================================== */
function mount(host, api){
  api=api||{};
  injectCSS();

  ST={
    api:api,
    scenarioId:null,
    placed:[],       /* array of force IDs currently on the diagram */
    ghost:null,
    dragId:null,
    dragTile:null,
    dragFid:null,
    tileEls:{},
    solved:false,
    raf:0,
    timers:[],
    listeners:[]     /* {el, type, fn} for cleanup */
  };

  var root=hel('div','tr-fbd-wrap',host);
  ST.root=root;

  /* header */
  var meta=hel('div','tr-fbd-meta',root);
  ST.metaL=hel('span','',meta); ST.metaL.innerHTML='<b>FREE-BODY DIAGRAM</b> BUILDER';
  ST.metaR=hel('span','',meta,'Ch 4');

  /* ── SCENARIO PICKER ── */
  hel('div','tr-fbd-scenelabel',root,'CHOOSE A SCENARIO:');
  var scGrid=hel('div','tr-fbd-scenes',root);
  ST.sceneCards=[];
  SCENARIOS.forEach(function(sc){
    var card=hel('button','tr-fbd-scard',scGrid);
    card.setAttribute('tabindex','0');
    hel('div','tr-fbd-scard-ic',card,sc.icon);
    hel('div','tr-fbd-scard-tt',card,sc.title);
    hel('div','tr-fbd-scard-ds',card,sc.what);
    ST.sceneCards.push(card);
    var fn=function(){ selectScenario(sc.id); };
    card.addEventListener('click',fn);
    ST.listeners.push({el:card,type:'click',fn:fn});
  });

  /* ── DIAGRAM AREA (hidden until scenario picked) ── */
  ST.diagSection=hel('div','',root);
  ST.diagSection.style.display='none';

  /* scenario title */
  ST.scTitle=hel('div','tr-fbd-scenelabel',ST.diagSection,'');

  /* SVG diagram */
  var diagArea=hel('div','tr-fbd-diagarea',ST.diagSection);
  ST.svg=document.createElementNS(SVGNS,'svg');
  ST.svg.setAttribute('viewBox','0 0 '+SVG_W+' '+SVG_H);
  ST.svg.setAttribute('role','img');
  ST.svg.setAttribute('aria-label','Free-body diagram');
  diagArea.appendChild(ST.svg);
  buildDiagram(ST.svg,[]);

  /* drop zone: diagArea acts as drop target */
  ST.diagArea=diagArea;
  var dropFn=function(e){ handleDiagramDrop(e); };
  diagArea.addEventListener('pointerup',dropFn);
  ST.listeners.push({el:diagArea,type:'pointerup',fn:dropFn});

  /* palette */
  hel('div','tr-fbd-pallabel',ST.diagSection,'FORCE PALETTE — drag onto the dot:');
  ST.palette=hel('div','tr-fbd-palette',ST.diagSection);

  /* equation box */
  hel('div','tr-fbd-eqlabel',ST.diagSection,'LIVE EQUATIONS:');
  var eqBox=hel('div','tr-fbd-eqbox',ST.diagSection);
  ST.eqX=hel('div','tr-fbd-eqrow',eqBox);
  ST.eqY=hel('div','tr-fbd-eqrow',eqBox);
  ST.eqNote=hel('div','tr-fbd-eqrow',eqBox);
  ST.eqX.textContent='ΣFx = ?';
  ST.eqY.textContent='ΣFy = ?';

  /* bogus explanation */
  ST.bogusMsg=hel('div','tr-fbd-bogus-msg',ST.diagSection,'');

  /* feedback */
  ST.fb=hel('div','tr-fbd-fb',ST.diagSection,'');

  /* buttons */
  var btns=hel('div','tr-fbd-btns',ST.diagSection);
  ST.checkBtn=hel('button','tr-fbd-btn',btns,'CHECK FBD ▶');
  ST.resetBtn=hel('button','tr-fbd-btn tr-fbd-reset',btns,'RESET ↺');

  var checkFn=function(){ checkFBD(); };
  var resetFn=function(){ resetDiagram(); };
  ST.checkBtn.addEventListener('click',checkFn);
  ST.resetBtn.addEventListener('click',resetFn);
  ST.listeners.push({el:ST.checkBtn,type:'click',fn:checkFn});
  ST.listeners.push({el:ST.resetBtn,type:'click',fn:resetFn});

  /* ── FORCE GALLERY (collapsible) ── */
  var gal=hel('div','tr-fbd-gal',root);
  var galHdr=hel('div','tr-fbd-gal-hdr',gal);
  galHdr.innerHTML='📖 FORCE REFERENCE GALLERY <span>▼</span>';
  ST.galBody=hel('div','tr-fbd-gal-body',gal);
  GALLERY.forEach(function(g){
    var row=hel('div','tr-fbd-gal-row',ST.galBody);
    hel('div','tr-fbd-gal-ic',row,g.ic);
    var txt=hel('div','tr-fbd-gal-text',row);
    txt.innerHTML='<b>'+g.name+'</b> — <em>'+g.formula+'</em><br><small>Direction: '+g.dir+'</small><br><small>When: '+g.when+'</small>';
  });
  var galFn=function(){
    var open=ST.galBody.classList.contains('tr-fbd-open');
    ST.galBody.classList.toggle('tr-fbd-open',!open);
    galHdr.querySelector('span').textContent=open?'▼':'▲';
  };
  galHdr.addEventListener('click',galFn);
  ST.listeners.push({el:galHdr,type:'click',fn:galFn});

  if(api.announce) api.announce('Free-Body Diagram Builder loaded. Choose a scenario to begin.');
}

/* ===================================================================
   SCENARIO SELECTION
   =================================================================== */
function selectScenario(id){
  if(!ST) return;
  var sc=null;
  SCENARIOS.forEach(function(s){ if(s.id===id) sc=s; });
  if(!sc) return;

  ST.scenarioId=id;
  ST.placed=[];
  ST.solved=false;

  /* highlight selected card */
  ST.sceneCards.forEach(function(c,i){
    var isThis=(SCENARIOS[i].id===id);
    c.classList.toggle('tr-fbd-active',isThis);
  });

  /* show diagram section */
  ST.diagSection.style.display='';
  ST.scTitle.textContent=sc.icon+' '+sc.title+' — '+sc.what;

  /* rebuild palette */
  buildPalette(sc);

  /* clear diagram & equations */
  buildDiagram(ST.svg,[]);
  updateEquations(sc);

  /* clear feedback & bogus msg */
  ST.fb.className='tr-fbd-fb';
  ST.fb.textContent='';
  ST.bogusMsg.className='tr-fbd-bogus-msg';
  ST.bogusMsg.textContent='';
  ST.checkBtn.disabled=false;
  ST.checkBtn.textContent='CHECK FBD ▶';

  if(ST.api.announce) ST.api.announce(sc.title+' selected. '+sc.what+' Drag forces onto the diagram.');
}

/* ===================================================================
   PALETTE BUILD
   =================================================================== */
function buildPalette(sc){
  var pal=ST.palette;
  /* remove old tile listeners */
  while(pal.firstChild) pal.removeChild(pal.firstChild);
  ST.tileEls={};

  sc.palette.forEach(function(fid){
    var fd=FORCE_MAP[fid];
    if(!fd) return;
    var tile=hel('div','tr-fbd-tile'+(fd.bogus?' tr-fbd-bogus':''),pal);
    tile.setAttribute('tabindex','0');
    tile.dataset.fid=fid;
    var arrowIcon=angleToArrowChar(fd.dir);
    hel('div','tr-fbd-tile-arrow',tile,arrowIcon);
    hel('div','tr-fbd-tile-name',tile,fd.name);
    hel('div','tr-fbd-tile-sym',tile,fd.sym);
    tile.style.borderColor=fd.color+'66';

    attachTileDrag(tile, fid, fd);
    ST.tileEls[fid]=tile;
  });
}

function angleToArrowChar(deg){
  /* 0=→ 45=↗ 90=↑ 135=↖ 180=← 225=↙ 270=↓ 315=↘ */
  var norm=((deg%360)+360)%360;
  var chars=['→','↗','↑','↖','←','↙','↓','↘'];
  var idx=Math.round(norm/45)%8;
  return chars[idx];
}

/* ===================================================================
   DRAG & DROP — pointer events + setPointerCapture + floating ghost
   (SPEC §5 pattern)
   =================================================================== */
function attachTileDrag(tile, fid, fd){
  var pdFn=function(e){
    if(ST.solved) return;
    if(tile.classList.contains('tr-fbd-placed')) return;
    e.preventDefault();
    ST.dragId=e.pointerId;
    ST.dragTile=tile;
    ST.dragFid=fid;
    try{ tile.setPointerCapture(e.pointerId); }catch(err){}
    makeGhost(e, fd);
  };
  var pmFn=function(e){
    if(ST.dragId!==e.pointerId) return;
    if(ST.ghost){
      ST.ghost.style.left=e.clientX+'px';
      ST.ghost.style.top=e.clientY+'px';
    }
    /* highlight drop zone if over diagram */
    var over=isOverDiagram(e.clientX,e.clientY);
    ST.diagArea.style.borderColor=over?fd.color:'';
  };
  var puFn=function(e){
    if(ST.dragId!==e.pointerId) return;
    var wasDragging=!!ST.ghost;
    ST.diagArea.style.borderColor='';
    if(wasDragging){
      var over=isOverDiagram(e.clientX,e.clientY);
      if(over) dropForce(fid, fd);
      else cancelDrag();
    }
    ST.dragId=null; ST.dragTile=null; ST.dragFid=null;
    removeGhost();
  };
  var pcFn=function(e){
    if(ST.dragId!==e.pointerId) return;
    ST.diagArea.style.borderColor='';
    ST.dragId=null; ST.dragTile=null; ST.dragFid=null;
    removeGhost();
  };
  tile.addEventListener('pointerdown',pdFn);
  tile.addEventListener('pointermove',pmFn);
  tile.addEventListener('pointerup',puFn);
  tile.addEventListener('pointercancel',pcFn);
  /* store for cleanup */
  ST.listeners.push({el:tile,type:'pointerdown',fn:pdFn});
  ST.listeners.push({el:tile,type:'pointermove',fn:pmFn});
  ST.listeners.push({el:tile,type:'pointerup',fn:puFn});
  ST.listeners.push({el:tile,type:'pointercancel',fn:pcFn});

  /* keyboard drop support */
  var keyFn=function(e){
    if(e.key===' '||e.key==='Enter'){
      e.preventDefault();
      if(!tile.classList.contains('tr-fbd-placed')&&!ST.solved) dropForce(fid,fd);
    }
  };
  tile.addEventListener('keydown',keyFn);
  ST.listeners.push({el:tile,type:'keydown',fn:keyFn});
}

function isOverDiagram(cx,cy){
  var r=ST.diagArea.getBoundingClientRect();
  var slop=20;
  return cx>=r.left-slop&&cx<=r.right+slop&&cy>=r.top-slop&&cy<=r.bottom+slop;
}

function handleDiagramDrop(e){
  /* Called when pointer goes up on the diagArea.
     Actual drop handled by pointerup on the tile (via setPointerCapture).
     This is a fallback for cases where capture isn't set. */
  if(ST.dragFid&&ST.dragTile&&!ST.solved){
    var fd=FORCE_MAP[ST.dragFid];
    if(fd) dropForce(ST.dragFid,fd);
    ST.dragId=null; ST.dragTile=null; ST.dragFid=null;
    removeGhost();
    ST.diagArea.style.borderColor='';
  }
}

function dropForce(fid, fd){
  if(!ST) return;
  var sc=getScenario(ST.scenarioId);
  if(!sc) return;

  /* already placed? */
  if(ST.placed.indexOf(fid)>=0) return;

  if(fd.bogus){
    /* snap back with shake + explanation */
    var tile=ST.tileEls[fid];
    if(tile&&!reducedMotion()){
      tile.classList.remove('tr-fbd-shake');
      void tile.offsetWidth;
      tile.classList.add('tr-fbd-shake');
      var t=setTimeout(function(){ if(tile) tile.classList.remove('tr-fbd-shake'); },400);
      ST.timers.push(t);
    }
    ST.bogusMsg.textContent=fd.name+': '+fd.bogusMsg;
    ST.bogusMsg.className='tr-fbd-bogus-msg tr-fbd-on';
    if(ST.api.toast) ST.api.toast('Not a real force!','bad');
    if(ST.api.announce) ST.api.announce(fd.name+' snapped back. '+fd.bogusMsg);
    return;
  }

  /* place the force */
  ST.placed.push(fid);
  var tile=ST.tileEls[fid];
  if(tile) tile.classList.add('tr-fbd-placed');

  /* rebuild diagram */
  buildDiagram(ST.svg, ST.placed);
  updateEquations(sc);

  /* clear old feedback */
  ST.fb.className='tr-fbd-fb';
  ST.bogusMsg.className='tr-fbd-bogus-msg';

  if(ST.api.announce) ST.api.announce(fd.name+' added to diagram.');
}

function cancelDrag(){
  /* nothing extra needed — ghost already removed */
}

/* ===================================================================
   EQUATIONS — live update using api.latex
   =================================================================== */
function updateEquations(sc){
  if(!ST||!sc) return;
  var result=sc.eqFn(ST.placed);
  /* eqFn returns full LaTeX strings like "\\Sigma F_x = +N-mg = 0" — render directly */
  renderEqRow(ST.eqX, result.x);
  renderEqRow(ST.eqY, result.y);

  if(result.note&&ST.placed.length>0){
    renderEqRow(ST.eqNote, result.note);
    ST.eqNote.style.display='';
  } else {
    ST.eqNote.textContent='';
    ST.eqNote.style.display='none';
  }
}

function renderEqRow(el2, tex){
  if(ST&&ST.api&&ST.api.latex){
    ST.api.latex(el2, tex);
  } else {
    el2.textContent=tex;
  }
}

/* ===================================================================
   CHECK FBD
   =================================================================== */
function checkFBD(){
  if(!ST||ST.solved) return;
  var sc=getScenario(ST.scenarioId);
  if(!sc) return;

  var correct=sc.forces.slice().sort();
  var current=ST.placed.slice().sort();
  var ok=(correct.length===current.length)&&correct.every(function(f,i){ return f===current[i]; });

  if(ok){
    onCorrect(sc);
  } else {
    onWrong(sc, correct, current);
  }
}

function onCorrect(sc){
  ST.solved=true;
  ST.fb.className='tr-fbd-fb tr-fbd-good';
  ST.fb.textContent='✓ '+sc.solvedMsg;
  /* append solved equation via latex */
  if(ST.api.latex){
    var eqEl=document.createElement('div');
    eqEl.style.marginTop='6px';
    ST.fb.appendChild(eqEl);
    ST.api.latex(eqEl, sc.solveEq);
  }
  ST.checkBtn.textContent='✓ SOLVED';
  ST.checkBtn.disabled=true;
  /* disable palette tiles */
  Object.keys(ST.tileEls).forEach(function(fid){
    ST.tileEls[fid].style.pointerEvents='none';
    ST.tileEls[fid].style.opacity='0.4';
  });
  if(ST.api.xp)       ST.api.xp(10,'fbd:scenario');
  if(ST.api.toast)    ST.api.toast('✓ Correct FBD!','ok');
  if(ST.api.confetti) ST.api.confetti(ST.diagArea);
  if(ST.api.announce) ST.api.announce('Correct FBD! '+sc.solvedMsg);
}

function onWrong(sc, correct, current){
  /* figure out what's missing / extra */
  var missing=correct.filter(function(f){ return current.indexOf(f)<0; });
  var extra=current.filter(function(f){ return correct.indexOf(f)<0; });
  var msgs=[];
  if(missing.length){
    var mnames=missing.map(function(f){ return FORCE_MAP[f]?FORCE_MAP[f].name:f; });
    msgs.push('Missing: '+mnames.join(', ')+'.');
  }
  if(extra.length){
    var enames=extra.map(function(f){ return FORCE_MAP[f]?FORCE_MAP[f].name:f; });
    msgs.push('Shouldn\'t be here: '+enames.join(', ')+'. Remove them by resetting.');
  }
  if(!msgs.length) msgs.push('Check directions or count — something\'s off.');

  ST.fb.className='tr-fbd-fb tr-fbd-bad';
  ST.fb.textContent=msgs.join(' ');
  if(ST.api.toast) ST.api.toast('Check the force count and directions.','bad');

  if(!reducedMotion()){
    ST.diagArea.classList.remove('tr-fbd-shake');
    void ST.diagArea.offsetWidth;
    ST.diagArea.classList.add('tr-fbd-shake');
    var t=setTimeout(function(){ if(ST) ST.diagArea.classList.remove('tr-fbd-shake'); },400);
    ST.timers.push(t);
  }
}

/* ===================================================================
   RESET
   =================================================================== */
function resetDiagram(){
  if(!ST) return;
  var sc=getScenario(ST.scenarioId);
  if(!sc) return;
  ST.placed=[];
  ST.solved=false;
  /* re-enable palette tiles */
  sc.palette.forEach(function(fid){
    var tile=ST.tileEls[fid];
    if(tile){
      tile.classList.remove('tr-fbd-placed');
      tile.style.pointerEvents='';
      tile.style.opacity='';
    }
  });
  buildDiagram(ST.svg,[]);
  updateEquations(sc);
  ST.fb.className='tr-fbd-fb';
  ST.fb.textContent='';
  ST.bogusMsg.className='tr-fbd-bogus-msg';
  ST.bogusMsg.textContent='';
  ST.checkBtn.disabled=false;
  ST.checkBtn.textContent='CHECK FBD ▶';
  if(ST.api.announce) ST.api.announce('Diagram reset. Try again.');
}

/* ===================================================================
   GHOST
   =================================================================== */
function makeGhost(e, fd){
  removeGhost();
  var g=document.createElement('div');
  g.className='tr-fbd-ghost';
  g.textContent=angleToArrowChar(fd.dir)+' '+fd.name;
  g.style.left=e.clientX+'px';
  g.style.top=e.clientY+'px';
  var layer=document.getElementById('vz-floatLayer')||document.body;
  layer.appendChild(g);
  ST.ghost=g;
}

function removeGhost(){
  if(ST&&ST.ghost&&ST.ghost.parentNode) ST.ghost.parentNode.removeChild(ST.ghost);
  if(ST) ST.ghost=null;
}

/* ===================================================================
   HELPERS
   =================================================================== */
function getScenario(id){
  var found=null;
  SCENARIOS.forEach(function(s){ if(s.id===id) found=s; });
  return found;
}

function reducedMotion(){
  var api=ST&&ST.api;
  if(api&&api.reducedMotion) return api.reducedMotion();
  try{ return window.matchMedia('(prefers-reduced-motion:reduce)').matches; }catch(e){ return false; }
}

/* ===================================================================
   UNMOUNT — removes all listeners, cancels timers, removes ghost
   =================================================================== */
function unmount(){
  if(!ST) return;
  cancelAnimationFrame(ST.raf);
  ST.timers.forEach(function(t){ clearTimeout(t); });
  removeGhost();
  ST.listeners.forEach(function(l){
    try{ l.el.removeEventListener(l.type,l.fn); }catch(e){}
  });
  if(ST.root&&ST.root.parentNode) ST.root.parentNode.removeChild(ST.root);
  ST=null;
}

/* ===================================================================
   REGISTER
   =================================================================== */
(window.TRAINING_MODULES=window.TRAINING_MODULES||[]).push({
  id:ID,
  title:'Free-Body Diagram Builder',
  icon:'⚖️',
  chapter:'Ch 4',
  blurb:'Drag force arrows onto a dot — live ΣFx/ΣFy equations update as you build',
  desc:'build FBDs for 5 classic scenarios',
  mount:mount,
  unmount:unmount
});

})();
