/* tr-radial.js — Radial Force Builder (Chapter 5: Curving / Circular Motion)
   CPCS110 Physics Arcade training module. Plain browser JS (ES2017), IIFE, no modules.
   Lesson: dp/dt = F_net; only RADIAL (toward-center) force components turn the momentum.
   Toward center = positive. F_r = mv²/r.
   Drill: drag force arrows onto the dog going around a circle; watch the underbrace
   radial equation build live; verify balance vs mv²/r. */
(function () {
'use strict';

var ID = 'radial';

/* ── module-level state ── */
var _api = null;
var _host = null;
var _raf = null;
var _angle = 0;          // dog position angle (radians, 0 = right, CCW positive)
var _lastTs = null;
var _dragState = null;   // active pointer drag { chip, ghost }
var _misses = 0;         // wrong-drop counter per scenario
var _scenarioIdx = 0;
var _scenario = null;
var _placedRadial = [];  // force keys placed in radial zone
var _placedTan = [];     // force keys placed in tangential zone
var _solved = false;

/* DOM refs reset each buildScenario */
var _zoneRadial = null;
var _zoneTan = null;
var _eqBox = null;
var _numBox = null;
var _hintBox = null;
var _fbBox = null;
var _checkBtn = null;
var _nextBtn = null;
var _canvas = null;
var _ctx = null;

/* listener tracking for cleanup */
var _listeners = [];

var CANVAS_SIZE = 300;
var OMEGA = 0.55; // rad/s for the dog's orbit

/* =====================================================================
   CSS — injected once, all selectors prefixed .tr-radial-
   ===================================================================== */
function injectCSS() {
  if (document.getElementById('tr-style-' + ID)) return;
  var s = document.createElement('style');
  s.id = 'tr-style-' + ID;
  s.textContent = [
    '.tr-radial-wrap{max-width:560px;margin:0 auto;color:var(--ink,#d7e6ff);display:flex;flex-direction:column;gap:10px;padding:4px 2px 16px;}',
    '.tr-radial-topbar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;}',
    '.tr-radial-title{font-family:"Press Start 2P",monospace;font-size:11px;color:var(--yellow,#ffe14d);margin:0;line-height:1.5;}',
    '.tr-radial-meta{font-family:"Press Start 2P",monospace;font-size:9px;color:var(--dim,#a9b5d9);}',
    '.tr-radial-meta b{color:var(--cyan,#21e6ff);}',
    /* scenario card */
    '.tr-radial-card{background:linear-gradient(160deg,#12122b,#0c0c1e);border:2px solid #2a2a55;border-radius:14px;padding:10px 12px;font-size:13px;line-height:1.55;color:var(--dim,#a9b5d9);}',
    '.tr-radial-card strong{color:var(--ink,#d7e6ff);}',
    '.tr-radial-params{display:flex;flex-wrap:wrap;gap:5px 14px;margin-top:7px;font-size:12px;color:var(--cyan,#21e6ff);font-family:"Cambria Math","Times New Roman",serif;}',
    /* canvas arena */
    '.tr-radial-arena{background:linear-gradient(160deg,#0c0c20,#08081a);border:2px solid #2a2a55;border-radius:14px;overflow:hidden;line-height:0;}',
    '.tr-radial-arena canvas{display:block;width:100%;height:auto;touch-action:none;-webkit-user-select:none;user-select:none;}',
    /* canvas legend */
    '.tr-radial-legend{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:11.5px;color:var(--dim,#a9b5d9);padding:2px 0;}',
    /* force palette */
    '.tr-radial-palette-label{font-family:"Press Start 2P",monospace;font-size:9px;color:var(--dim,#a9b5d9);text-transform:uppercase;margin:0;}',
    '.tr-radial-palette{display:flex;flex-wrap:wrap;gap:7px;}',
    '.tr-radial-chip{background:var(--panel2,#13132b);border:1.5px solid #2a2a55;border-radius:10px;padding:8px 12px;font-family:"Cambria Math","Times New Roman",serif;font-size:13.5px;cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;min-height:44px;display:flex;align-items:center;transition:border-color .15s,box-shadow .15s,opacity .15s;}',
    '.tr-radial-chip[data-placed="1"]{opacity:.28;cursor:default;pointer-events:none;}',
    '.tr-radial-chip:not([data-placed="1"]):hover{border-color:var(--cyan,#21e6ff);box-shadow:0 0 8px rgba(33,230,255,.3);}',
    /* drop zones */
    '.tr-radial-droprow{display:flex;gap:8px;align-items:stretch;flex-wrap:wrap;}',
    '.tr-radial-zone{flex:1;min-width:120px;min-height:64px;border:2px dashed #2a2a55;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--dim,#a9b5d9);text-align:center;padding:6px 4px;transition:border-color .15s,background .15s;}',
    '.tr-radial-zone.tr-radial-hover{border-color:var(--cyan,#21e6ff);background:rgba(33,230,255,.07);}',
    '.tr-radial-zone[data-has="1"]{border-color:var(--green,#39ff88);background:rgba(57,255,136,.06);color:var(--green,#39ff88);}',
    '.tr-radial-zone.tr-radial-tan[data-has="1"]{border-color:#444466;background:rgba(169,181,217,.05);color:var(--dim,#a9b5d9);}',
    '.tr-radial-zone-inner{display:flex;flex-direction:column;align-items:center;gap:3px;width:100%;}',
    '.tr-radial-zone-label{font-family:"Press Start 2P",monospace;font-size:8px;color:var(--dim,#a9b5d9);text-align:center;line-height:1.4;}',
    '.tr-radial-zone-content{font-family:"Cambria Math","Times New Roman",serif;font-size:13px;min-height:20px;text-align:center;}',
    /* tangential note */
    '.tr-radial-tannote{font-size:11.5px;color:var(--dim,#a9b5d9);font-style:italic;text-align:center;line-height:1.45;margin:0;}',
    /* equation box */
    '.tr-radial-eqlabel{font-family:"Press Start 2P",monospace;font-size:9px;color:var(--dim,#a9b5d9);margin-bottom:4px;}',
    '.tr-radial-eqbox{background:rgba(14,14,28,.9);border:1.5px solid #2a2a55;border-radius:12px;padding:10px 12px;min-height:50px;text-align:center;font-size:15px;transition:border-color .25s,box-shadow .25s;}',
    '.tr-radial-eqbox.tr-radial-eq-good{border-color:var(--green,#39ff88);box-shadow:0 0 14px rgba(57,255,136,.22);}',
    /* numeric check */
    '.tr-radial-numcheck{font-size:12.5px;color:var(--dim,#a9b5d9);line-height:1.6;padding-top:2px;min-height:20px;}',
    '.tr-radial-numcheck .good{color:var(--green,#39ff88);}',
    '.tr-radial-numcheck .bad{color:var(--red,#ff5470);}',
    /* hint */
    '.tr-radial-hint{display:none;background:rgba(255,225,77,.07);border:1px dashed var(--yellow,#ffe14d);color:var(--yellow,#ffe14d);border-radius:10px;padding:9px 12px;font-size:12.5px;line-height:1.5;}',
    '.tr-radial-hint.on{display:block;}',
    /* feedback */
    '.tr-radial-fb{display:none;border-radius:10px;padding:9px 12px;font-size:13px;line-height:1.5;border:1px solid transparent;}',
    '.tr-radial-fb.good{display:block;color:var(--green,#39ff88);border-color:rgba(57,255,136,.45);background:rgba(57,255,136,.07);}',
    '.tr-radial-fb.bad{display:block;color:var(--red,#ff5470);border-color:rgba(255,84,112,.45);background:rgba(255,84,112,.07);}',
    /* buttons */
    '.tr-radial-btns{display:flex;gap:8px;}',
    '.tr-radial-btn{flex:1;min-height:48px;border:0;border-radius:12px;cursor:pointer;font-family:"Press Start 2P",monospace;font-size:10px;background:var(--cyan,#21e6ff);color:#02131a;padding:10px;transition:opacity .15s,transform .1s;}',
    '.tr-radial-btn:disabled{opacity:.4;cursor:default;}',
    '.tr-radial-btn.yellow{background:var(--yellow,#ffe14d);}',
    '.tr-radial-btn.green{background:var(--green,#39ff88);}',
    '.tr-radial-btn:active:not(:disabled){transform:translateY(1px);}',
    /* drag ghost */
    '.tr-radial-ghost{position:fixed;z-index:10000;pointer-events:none;background:#0d0d22;border:1.5px solid var(--cyan,#21e6ff);color:var(--cyan,#21e6ff);font-family:"Cambria Math","Times New Roman",serif;font-size:14px;padding:6px 12px;border-radius:10px;transform:translate(-50%,-130%);white-space:nowrap;box-shadow:0 0 12px rgba(33,230,255,.4);}',
    /* shake */
    '.tr-radial-shake{animation:trRadialShake .36s;}',
    '@keyframes trRadialShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}',
    '@media(prefers-reduced-motion:reduce){.tr-radial-shake{animation:none!important}}'
  ].join('');
  document.head.appendChild(s);
}

/* =====================================================================
   SCENARIO DATA
   Sign convention: toward center = positive for F_r.
   F_r = mv²/r  (net radial = centripetal requirement)

   Each scenario:
     forces[i] = {
       key:         unique string
       label:       display text in chip
       latexLabel:  LaTeX fragment for the equation term
       radial:      bool — does this force (or its named component) contribute to F_r?
       value:       numeric N contribution to radial sum (0 for non-radial)
       note:        string shown in toast when dropped in the wrong zone
     }
     radialKeys:   which keys must land in radial zone
     targetExpr:   underbrace LaTeX for the fully-solved state
     numericExpr:  numeric verification LaTeX
     explanation:  text shown in success feedback
   ===================================================================== */
var SCENARIOS = [
  /* ─── 1: DOG ON CAROUSEL (horizontal circle) ───────────────── */
  {
    sceneName: 'DOG ON CAROUSEL',
    icon: '🎠',
    desc: 'The dog stands on a flat, spinning carousel. The floor pushes up (normal force), gravity pulls down, and <strong>static friction</strong> from the carousel floor points inward toward the axis. Drag each force to the correct zone.',
    params: { m: 8, v: 3, r: 2 },
    /* mv²/r = 8·9/2 = 36 N */
    forces: [
      { key: 'gravity1',  label: 'Gravity  mg ↓',         latexLabel: 'mg',  radial: false, value: 0,
        note: 'Gravity points DOWN — perpendicular to the horizontal radial axis. Zero radial component on this flat circle.' },
      { key: 'normal1',   label: 'Normal  N ↑',            latexLabel: 'N',   radial: false, value: 0,
        note: 'Normal force points UP — also perpendicular to the horizontal radius. No radial part.' },
      { key: 'friction1', label: 'Friction  f_s → center', latexLabel: 'f_s', radial: true,  value: 36,
        note: null }
    ],
    radialKeys: ['friction1'],
    targetExpr:   '\\underbrace{f_s}_{F_r}=\\dfrac{mv^2}{r}',
    numericExpr:  '\\underbrace{36\\,\\text{N}}_{F_r}=\\dfrac{(8)(3)^2}{2}=36\\,\\text{N}\\;\\checkmark',
    explanation:  'On a horizontal circle, friction is the ONLY force with a component pointing toward the center. Gravity and normal cancel each other vertically — neither turns the momentum!'
  },

  /* ─── 2: BALL ON STRING, TOP OF VERTICAL LOOP ──────────────── */
  {
    sceneName: 'BALL ON STRING (TOP)',
    icon: '🔵',
    desc: 'A ball whirls on a string in a <strong>vertical circle</strong>. At the very TOP, tension T pulls toward the center (downward) AND gravity mg also pulls downward — both toward the center. The "hand push" is tangential: it changes speed, not direction.',
    params: { m: 0.5, v: 5, r: 1 },
    /* mv²/r = 0.5·25/1 = 12.5 N; T ≈ 7.6 N, mg = 4.9 N */
    forces: [
      { key: 'tension2',  label: 'Tension  T ↓ (inward)',      latexLabel: 'T',         radial: true,  value: 7.6,
        note: null },
      { key: 'gravity2',  label: 'Gravity  mg ↓ (inward)',     latexLabel: 'mg',         radial: true,  value: 4.9,
        note: null },
      { key: 'hand2',     label: 'Hand push (tangential)',       latexLabel: 'F_{hand}',  radial: false, value: 0,
        note: 'A tangential force is F⃗∥ — it changes speed, not direction. Zero contribution to F_r.' }
    ],
    radialKeys: ['tension2', 'gravity2'],
    targetExpr:   '\\underbrace{T+mg}_{F_r}=\\dfrac{mv^2}{r}',
    numericExpr:  '\\underbrace{7.6+4.9}_{12.5\\,\\text{N}}=\\dfrac{(0.5)(5)^2}{1}=12.5\\,\\text{N}\\;\\checkmark',
    explanation:  'At the TOP of the loop both tension and gravity point downward — toward the center. They ADD to give F_r. The tangential hand-push only speeds the ball up or down; it is F⃗∥, not F⃗⊥.'
  },

  /* ─── 3: CAR ON FLAT CURVE ──────────────────────────────────── */
  {
    sceneName: 'CAR ON FLAT CURVE',
    icon: '🚗',
    desc: 'A 1 200 kg car rounds a flat (unbanked) curve. Gravity mg pulls down, normal N pushes up, and <strong>static friction</strong> f_s from the tires points inward. Which force(s) provide the centripetal push?',
    params: { m: 1200, v: 12, r: 40 },
    /* mv²/r = 1200·144/40 = 4320 N */
    forces: [
      { key: 'gravity3',  label: 'Gravity  mg ↓',           latexLabel: 'mg',  radial: false, value: 0,
        note: 'Gravity is vertical. The radial direction for a flat curve is horizontal. Zero radial component.' },
      { key: 'normal3',   label: 'Normal  N ↑',              latexLabel: 'N',   radial: false, value: 0,
        note: 'Normal force is vertical — same argument. No radial contribution.' },
      { key: 'friction3', label: 'Friction  f_s → center',   latexLabel: 'f_s', radial: true,  value: 4320,
        note: null }
    ],
    radialKeys: ['friction3'],
    targetExpr:   '\\underbrace{f_s}_{F_r}=\\dfrac{mv^2}{r}',
    numericExpr:  '\\underbrace{4320\\,\\text{N}}_{F_r}=\\dfrac{(1200)(12)^2}{40}=4320\\,\\text{N}\\;\\checkmark',
    explanation:  'On any flat horizontal circle the only horizontal force is friction — it\'s the sole provider of centripetal acceleration. Gravity and normal are vertical and cancel out. Same physics as the carousel!'
  },

  /* ─── 4: DOG + LEASH AT AN ANGLE ───────────────────────────── */
  {
    sceneName: 'DOG + ANGLED LEASH',
    icon: '🐶',
    desc: 'The dog on the carousel has a leash pulled at θ = 30° below horizontal toward the axis. Leash tension T = 40 N. Only the horizontal (radial) component T cos θ ≈ 34.6 N counts. Friction f_s supplies the rest.',
    params: { m: 8, v: 3, r: 2 },
    /* mv²/r = 36 N; T cosθ = 40·cos30 = 34.64; friction = 36 - 34.64 = 1.36 N */
    forces: [
      { key: 'leash4',    label: 'Leash  T cos θ (radial component)', latexLabel: 'T\\cos\\theta', radial: true,  value: 34.64,
        note: null },
      { key: 'gravity4',  label: 'Gravity  mg ↓',                     latexLabel: 'mg',            radial: false, value: 0,
        note: 'Gravity is vertical on this horizontal circle — zero radial component.' },
      { key: 'friction4', label: 'Friction  f_s → center',             latexLabel: 'f_s',           radial: true,  value: 1.36,
        note: null }
    ],
    radialKeys: ['leash4', 'friction4'],
    targetExpr:   '\\underbrace{T\\cos\\theta+f_s}_{F_r}=\\dfrac{mv^2}{r}',
    numericExpr:  '\\underbrace{34.6+1.4}_{36\\,\\text{N}}=\\dfrac{(8)(3)^2}{2}=36\\,\\text{N}\\;\\checkmark',
    explanation:  'Only the component of tension along the radial axis (T cos θ) contributes to F_r. The downward component T sin θ partially offsets normal force — it has no radial role. This illustrates the key lesson: decompose every force relative to the radial direction first.'
  }
];

/* =====================================================================
   HELPER: track event listeners for clean unmount
   ===================================================================== */
function on(el, type, fn, opts) {
  el.addEventListener(type, fn, opts || false);
  _listeners.push({ el: el, type: type, fn: fn, opts: opts || false });
}

/* =====================================================================
   CANVAS — draw animated dog on circle
   ===================================================================== */
function initCanvas(container) {
  _canvas = document.createElement('canvas');
  _canvas.width = CANVAS_SIZE;
  _canvas.height = CANVAS_SIZE;
  _canvas.style.width = '100%';
  _canvas.style.height = 'auto';
  _canvas.style.display = 'block';
  container.appendChild(_canvas);
  _ctx = _canvas.getContext('2d');
}

function drawArrow(ctx, x1, y1, x2, y2, color, lineW) {
  var dx = x2 - x1, dy = y2 - y1;
  var len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return;
  var ux = dx / len, uy = dy / len;
  var headLen = 9;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineW;
  ctx.stroke();
  /* arrowhead */
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * ux + headLen * 0.45 * (-uy),
             y2 - headLen * uy + headLen * 0.45 * ux);
  ctx.lineTo(x2 - headLen * ux - headLen * 0.45 * (-uy),
             y2 - headLen * uy - headLen * 0.45 * ux);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawScene(angle) {
  if (!_ctx) return;
  var W = CANVAS_SIZE, H = CANVAS_SIZE;
  var cx = W / 2, cy = H / 2;
  var R = W * 0.31;

  _ctx.clearRect(0, 0, W, H);

  /* background */
  _ctx.fillStyle = '#08081a';
  _ctx.fillRect(0, 0, W, H);

  /* orbit circle (dashed) */
  _ctx.beginPath();
  _ctx.arc(cx, cy, R, 0, Math.PI * 2);
  _ctx.strokeStyle = 'rgba(33,230,255,0.18)';
  _ctx.lineWidth = 1.5;
  _ctx.setLineDash([4, 6]);
  _ctx.stroke();
  _ctx.setLineDash([]);

  /* center dot */
  _ctx.beginPath();
  _ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  _ctx.fillStyle = 'rgba(33,230,255,0.5)';
  _ctx.fill();

  /* dog position */
  var dx = cx + R * Math.cos(angle);
  var dy = cy + R * Math.sin(angle);

  /* leash from center to dog */
  _ctx.beginPath();
  _ctx.moveTo(cx, cy);
  _ctx.lineTo(dx, dy);
  _ctx.strokeStyle = 'rgba(255,225,77,0.3)';
  _ctx.lineWidth = 1.5;
  _ctx.stroke();

  /* ── RADIAL AXIS ARROW — the KEY teaching element ── */
  /* unit vector FROM dog TOWARD center */
  var rdx = (cx - dx) / R;
  var rdy = (cy - dy) / R;
  var arrowLen = R * 0.52;
  drawArrow(_ctx, dx, dy, dx + rdx * arrowLen, dy + rdy * arrowLen, '#21e6ff', 2.5);

  /* label "F_r +toward center" partway along arrow */
  _ctx.fillStyle = '#21e6ff';
  _ctx.font = 'bold 10px sans-serif';
  _ctx.textAlign = 'center';
  _ctx.textBaseline = 'middle';
  var midX = dx + rdx * arrowLen * 0.52;
  var midY = dy + rdy * arrowLen * 0.52;
  /* offset label perpendicular to the arrow so it doesn't overlap */
  var perpX = -rdy, perpY = rdx; /* 90-degree rotate */
  _ctx.fillText('F⃗ᵣ', midX + perpX * 12, midY + perpY * 12);

  /* ── VELOCITY ARROW (tangential, shows F_perp direction) ── */
  /* tangent for CCW orbit: (-sin, cos) */
  var tax = -Math.sin(angle);
  var tay = Math.cos(angle);
  var vLen = 28;
  drawArrow(_ctx, dx, dy, dx + tax * vLen, dy + tay * vLen, '#ff3df0', 2.0);
  _ctx.fillStyle = '#ff3df0';
  _ctx.font = '10px sans-serif';
  _ctx.fillText('v⃗', dx + tax * (vLen + 8), dy + tay * (vLen + 8));

  /* ── momentum label ── */
  _ctx.fillStyle = 'rgba(169,181,217,0.55)';
  _ctx.font = '9px sans-serif';
  _ctx.textAlign = 'left';
  _ctx.textBaseline = 'alphabetic';
  _ctx.fillText('p⃗ always tangent', 6, H - 8);

  /* ── DOG EMOJI ── */
  _ctx.font = '24px serif';
  _ctx.textAlign = 'center';
  _ctx.textBaseline = 'middle';
  _ctx.fillText('🐶', dx, dy - 1);

  /* reset */
  _ctx.textAlign = 'left';
  _ctx.textBaseline = 'alphabetic';
}

function animLoop(ts) {
  if (_lastTs === null) _lastTs = ts;
  var dt = Math.min((ts - _lastTs) / 1000, 0.1);
  _lastTs = ts;
  var rm = (_api && _api.reducedMotion) ? _api.reducedMotion() : false;
  if (!rm) _angle = (_angle + OMEGA * dt) % (Math.PI * 2);
  drawScene(_angle);
  _raf = requestAnimationFrame(animLoop);
}

function startAnim() {
  if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
  var rm = (_api && _api.reducedMotion) ? _api.reducedMotion() : false;
  if (rm) {
    /* static frame with arrows visible at a clear angle */
    drawScene(Math.PI * 0.2);
  } else {
    _lastTs = null;
    _raf = requestAnimationFrame(animLoop);
  }
}

/* =====================================================================
   EQUATION — build live LaTeX from placed radial forces
   ===================================================================== */
function buildEquationLatex() {
  var sc = _scenario;
  if (!sc) return '\\text{(no scenario)}';

  var terms = [];
  for (var i = 0; i < sc.forces.length; i++) {
    var f = sc.forces[i];
    if (_placedRadial.indexOf(f.key) !== -1) {
      terms.push(f.latexLabel);
    }
  }

  if (terms.length === 0) {
    return '\\text{Drag forces into the }\\color{#21e6ff}{\\text{radial zone}}\\text{ to build the equation}';
  }
  var inner = terms.join(' + ');
  return '\\underbrace{' + inner + '}_{F_r} = \\dfrac{mv^2}{r}';
}

function updateEquation() {
  if (!_eqBox || !_api) return;
  _api.latex(_eqBox, buildEquationLatex());
}

/* =====================================================================
   NUMERIC CHECK
   ===================================================================== */
function runNumericCheck() {
  if (!_scenario || !_numBox) return false;
  var sc = _scenario;
  var mv2r = sc.params.m * sc.params.v * sc.params.v / sc.params.r;

  var placedSum = 0;
  for (var i = 0; i < sc.forces.length; i++) {
    var f = sc.forces[i];
    if (_placedRadial.indexOf(f.key) !== -1 && f.radial) {
      placedSum += f.value;
    }
  }

  if (_placedRadial.length === 0) {
    _numBox.innerHTML = '';
    return false;
  }

  var ok = Math.abs(placedSum - mv2r) < Math.max(0.5, mv2r * 0.01);
  if (ok) {
    _numBox.innerHTML = '<span class="good">✓ Radial sum: ' + placedSum.toFixed(1) + ' N = mv²/r = ' + mv2r.toFixed(1) + ' N — balanced!</span>';
  } else {
    var dir = placedSum < mv2r ? 'too low' : 'too high';
    _numBox.innerHTML = '<span class="bad">⚠ Radial sum ' + placedSum.toFixed(1) + ' N is ' + dir + ' (need ' + mv2r.toFixed(1) + ' N). Check which forces have a radial component.</span>';
  }
  return ok;
}

/* =====================================================================
   DROP-ZONE HIT TEST
   ===================================================================== */
var SLOP = 20; /* px tolerance around zone edges */

function zoneAt(cx, cy) {
  var zones = [_zoneRadial, _zoneTan];
  for (var i = 0; i < zones.length; i++) {
    var z = zones[i];
    if (!z) continue;
    var r = z.getBoundingClientRect();
    if (cx >= r.left - SLOP && cx <= r.right + SLOP &&
        cy >= r.top - SLOP && cy <= r.bottom + SLOP) {
      return z;
    }
  }
  return null;
}

/* =====================================================================
   DRAG & DROP — pointer events + setPointerCapture (SPEC §5)
   ===================================================================== */
function attachChipDrag(chip) {
  on(chip, 'pointerdown', function (e) {
    if (chip.dataset.placed === '1') return;
    e.preventDefault();

    /* create ghost */
    var ghost = document.createElement('div');
    ghost.className = 'tr-radial-ghost';
    ghost.textContent = chip.textContent.trim();
    document.body.appendChild(ghost);
    ghost.style.left = e.clientX + 'px';
    ghost.style.top  = e.clientY + 'px';

    chip.style.opacity = '0.25';
    _dragState = { chip: chip, ghost: ghost };

    try { chip.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    clearHovers();
  });

  on(chip, 'pointermove', function (e) {
    if (!_dragState || _dragState.chip !== chip) return;
    _dragState.ghost.style.left = e.clientX + 'px';
    _dragState.ghost.style.top  = e.clientY + 'px';
    clearHovers();
    var z = zoneAt(e.clientX, e.clientY);
    if (z) z.classList.add('tr-radial-hover');
  });

  on(chip, 'pointerup', function (e) {
    if (!_dragState || _dragState.chip !== chip) return;
    endDrag(e.clientX, e.clientY);
  });

  on(chip, 'pointercancel', function () {
    if (!_dragState || _dragState.chip !== chip) return;
    endDrag(-99999, -99999);
  });
}

function clearHovers() {
  if (_zoneRadial) _zoneRadial.classList.remove('tr-radial-hover');
  if (_zoneTan)    _zoneTan.classList.remove('tr-radial-hover');
}

function endDrag(cx, cy) {
  if (!_dragState) return;
  var chip  = _dragState.chip;
  var ghost = _dragState.ghost;
  clearHovers();
  if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
  chip.style.opacity = '';
  _dragState = null;

  var zone = zoneAt(cx, cy);
  if (!zone) { shakeEl(chip); return; }

  var key = chip.dataset.key;
  var forceInfo = null;
  for (var i = 0; i < _scenario.forces.length; i++) {
    if (_scenario.forces[i].key === key) { forceInfo = _scenario.forces[i]; break; }
  }
  if (!forceInfo) return;

  var inRadial = (zone === _zoneRadial);

  if (inRadial) {
    if (!forceInfo.radial) {
      /* wrong zone */
      _misses++;
      shakeEl(chip);
      var msg = forceInfo.note || 'This force has no radial component — try the "No F_r" zone.';
      if (_api) _api.toast(msg, 'bad');
      if (_misses >= 2 && _hintBox) _hintBox.classList.add('on');
      return;
    }
    placeForce(key, 'radial');
    if (_api) _api.toast('Added to radial sum!', 'ok');
  } else {
    /* tangential zone */
    if (forceInfo.radial) {
      _misses++;
      shakeEl(chip);
      if (_api) _api.toast('This force DOES have a radial component — try the radial zone!', 'bad');
      if (_misses >= 2 && _hintBox) _hintBox.classList.add('on');
      return;
    }
    placeForce(key, 'tan');
    var tanMsg = forceInfo.note || 'No radial part — correct, goes in the tangential/no-F_r zone.';
    if (_api) _api.toast(tanMsg, 'ok');
  }

  updateEquation();
  runNumericCheck();
  checkCompletion();
}

function placeForce(key, zoneName) {
  /* mark chip placed */
  var chip = _host ? _host.querySelector('[data-key="' + key + '"]') : null;
  if (chip) chip.dataset.placed = '1';

  /* remove from both lists */
  var ri = _placedRadial.indexOf(key);
  if (ri !== -1) _placedRadial.splice(ri, 1);
  var ti = _placedTan.indexOf(key);
  if (ti !== -1) _placedTan.splice(ti, 1);

  if (zoneName === 'radial') {
    _placedRadial.push(key);
    updateZoneContent(_zoneRadial, _placedRadial);
  } else {
    _placedTan.push(key);
    updateZoneContent(_zoneTan, _placedTan);
  }
}

function updateZoneContent(zoneEl, keys) {
  if (!zoneEl || !_scenario) return;
  var inner = zoneEl.querySelector('.tr-radial-zone-content');
  if (!inner) return;
  if (keys.length === 0) {
    inner.textContent = '(drop here)';
    zoneEl.dataset.has = '0';
    return;
  }
  var labels = [];
  for (var i = 0; i < keys.length; i++) {
    for (var j = 0; j < _scenario.forces.length; j++) {
      if (_scenario.forces[j].key === keys[i]) {
        labels.push(_scenario.forces[j].label);
        break;
      }
    }
  }
  inner.textContent = labels.join(' | ');
  zoneEl.dataset.has = '1';
}

/* =====================================================================
   REVEAL SOLUTION (for stuck students)
   ===================================================================== */
function revealSolution() {
  if (_solved || !_scenario) return;
  var sc = _scenario;
  var nonRadialKeys = sc.forces.filter(function (f) { return !f.radial; }).map(function (f) { return f.key; });

  /* place radial forces */
  sc.radialKeys.forEach(function (k) {
    if (_placedRadial.indexOf(k) === -1) placeForce(k, 'radial');
  });
  /* place non-radial forces */
  nonRadialKeys.forEach(function (k) {
    if (_placedTan.indexOf(k) === -1) placeForce(k, 'tan');
  });

  /* disable all chip dragging */
  if (_host) {
    var chips = _host.querySelectorAll('.tr-radial-chip');
    chips.forEach(function (c) { c.dataset.placed = '1'; });
  }

  updateEquation();
  runNumericCheck();
  checkCompletion();
}

/* =====================================================================
   COMPLETION CHECK
   ===================================================================== */
function checkCompletion() {
  if (_solved || !_scenario) return;
  var sc = _scenario;

  var allRadialPlaced = sc.radialKeys.every(function (k) {
    return _placedRadial.indexOf(k) !== -1;
  });
  var nonRadialKeys = sc.forces.filter(function (f) { return !f.radial; }).map(function (f) { return f.key; });
  var allTanPlaced = nonRadialKeys.every(function (k) {
    return _placedTan.indexOf(k) !== -1;
  });

  if (!allRadialPlaced || !allTanPlaced) return;

  _solved = true;

  /* final equation with target underbrace */
  if (_eqBox && _api) {
    _api.latex(_eqBox, sc.targetExpr);
    _eqBox.classList.add('tr-radial-eq-good');
  }
  /* numeric confirmation */
  if (_numBox && _api) {
    _api.latex(_numBox, sc.numericExpr);
  }
  /* feedback text */
  if (_fbBox) {
    _fbBox.textContent = sc.explanation;
    _fbBox.className = 'tr-radial-fb good';
  }
  if (_checkBtn) _checkBtn.disabled = false;
  if (_nextBtn)  _nextBtn.disabled = false;

  if (_api) {
    _api.confetti(_eqBox);
    _api.xp(10, 'Radial Force Builder');
    _api.toast('All forces sorted! F_r equation complete.', 'ok');
    if (_api.announce) _api.announce('Correct! ' + sc.explanation);
  }
}

/* =====================================================================
   SHAKE ANIMATION
   ===================================================================== */
function shakeEl(el) {
  var rm = (_api && _api.reducedMotion) ? _api.reducedMotion() : false;
  if (rm) return;
  el.classList.remove('tr-radial-shake');
  void el.offsetWidth; /* force reflow */
  el.classList.add('tr-radial-shake');
  setTimeout(function () { el.classList.remove('tr-radial-shake'); }, 400);
}

/* =====================================================================
   BUILD DOM FOR ONE SCENARIO
   ===================================================================== */
function buildScenario(host, api, idx) {
  _host = host;
  _api = api;
  _scenario = SCENARIOS[idx % SCENARIOS.length];
  _placedRadial = [];
  _placedTan = [];
  _solved = false;
  _misses = 0;
  _angle = 0;
  _lastTs = null;
  _dragState = null;

  /* wipe any listeners from previous scenario */
  for (var li = 0; li < _listeners.length; li++) {
    var l = _listeners[li];
    try { l.el.removeEventListener(l.type, l.fn, l.opts); } catch (e2) { /* ignore */ }
  }
  _listeners = [];

  host.innerHTML = '';
  var sc = _scenario;
  var wrap = el('div', 'tr-radial-wrap');

  /* ── TOP BAR ── */
  var topbar = el('div', 'tr-radial-topbar');
  var titleEl = el('h3', 'tr-radial-title');
  titleEl.textContent = sc.icon + ' ' + sc.sceneName;
  var metaEl = el('div', 'tr-radial-meta');
  metaEl.innerHTML = 'Ch 5 &nbsp;·&nbsp; <b>' + (idx + 1) + '/' + SCENARIOS.length + '</b>';
  topbar.appendChild(titleEl);
  topbar.appendChild(metaEl);
  wrap.appendChild(topbar);

  /* ── SCENARIO CARD ── */
  var card = el('div', 'tr-radial-card');
  card.innerHTML = sc.desc;
  var prow = el('div', 'tr-radial-params');
  var mv2r = sc.params.m * sc.params.v * sc.params.v / sc.params.r;
  prow.innerHTML =
    '<span>m = ' + sc.params.m + ' kg</span>' +
    '<span>v = ' + sc.params.v + ' m/s</span>' +
    '<span>r = ' + sc.params.r + ' m</span>' +
    '<span>mv²/r = ' + mv2r.toFixed(1) + ' N</span>';
  card.appendChild(prow);
  wrap.appendChild(card);

  /* ── CANVAS ARENA ── */
  var arena = el('div', 'tr-radial-arena');
  initCanvas(arena);
  wrap.appendChild(arena);
  drawScene(_angle); /* first frame immediately */

  /* ── LEGEND ── */
  var legend = el('div', 'tr-radial-legend');
  legend.innerHTML =
    '<span style="color:#21e6ff">&#9472; F⃗ᵣ radial axis (toward center = +)</span>' +
    '<span style="color:#ff3df0">&#9472; v⃗ tangential (F⃗⊥ direction)</span>';
  wrap.appendChild(legend);

  /* ── PALETTE LABEL ── */
  var palLabel = el('p', 'tr-radial-palette-label');
  palLabel.textContent = 'FORCES — drag each to the correct zone:';
  wrap.appendChild(palLabel);

  /* ── CHIP PALETTE ── */
  var palette = el('div', 'tr-radial-palette');
  for (var fi = 0; fi < sc.forces.length; fi++) {
    (function (f) {
      var chip = el('div', 'tr-radial-chip');
      chip.dataset.key = f.key;
      chip.dataset.placed = '0';
      chip.setAttribute('tabindex', '0');
      chip.textContent = f.label;
      attachChipDrag(chip);
      palette.appendChild(chip);
    })(sc.forces[fi]);
  }
  wrap.appendChild(palette);

  /* ── DROP ZONES ── */
  var droprow = el('div', 'tr-radial-droprow');

  _zoneRadial = el('div', 'tr-radial-zone');
  _zoneRadial.setAttribute('aria-label', 'Radial zone');
  _zoneRadial.dataset.has = '0';
  _zoneRadial.innerHTML =
    '<div class="tr-radial-zone-inner">' +
      '<div class="tr-radial-zone-label">⬤ RADIAL (→ center) +</div>' +
      '<div class="tr-radial-zone-content">(drop here)</div>' +
    '</div>';

  _zoneTan = el('div', 'tr-radial-zone tr-radial-tan');
  _zoneTan.setAttribute('aria-label', 'Tangential / no radial component zone');
  _zoneTan.dataset.has = '0';
  _zoneTan.innerHTML =
    '<div class="tr-radial-zone-inner">' +
      '<div class="tr-radial-zone-label">↔ NO F_r (tangential)</div>' +
      '<div class="tr-radial-zone-content">(drop here)</div>' +
    '</div>';

  droprow.appendChild(_zoneRadial);
  droprow.appendChild(_zoneTan);
  wrap.appendChild(droprow);

  var tanNote = el('p', 'tr-radial-tannote');
  tanNote.textContent = 'Tangential = F⃗∥ direction — changes speed, not direction. Never contributes to F_r = mv²/r.';
  wrap.appendChild(tanNote);

  /* ── LIVE EQUATION LABEL ── */
  var eqLabel = el('div', 'tr-radial-eqlabel');
  eqLabel.textContent = 'LIVE RADIAL EQUATION (updates as you drop forces):';
  wrap.appendChild(eqLabel);

  /* ── EQUATION BOX ── */
  _eqBox = el('div', 'tr-radial-eqbox');
  _eqBox.id = 'tradial-eq-' + idx;
  wrap.appendChild(_eqBox);
  updateEquation();

  /* ── NUMERIC CHECK ── */
  _numBox = el('div', 'tr-radial-numcheck');
  _numBox.id = 'tradial-num-' + idx;
  wrap.appendChild(_numBox);

  /* ── HINT ── */
  _hintBox = el('div', 'tr-radial-hint');
  _hintBox.innerHTML =
    '<strong style="color:var(--yellow,#ffe14d)">Hint —</strong> Ask yourself: does this force (or any component of it) ' +
    'point along the line from the dog toward the center? If yes, it belongs in the <em>radial</em> zone. ' +
    'If it’s perpendicular to that line (tangential) or vertical on a flat circle, use the no-Fᵣ zone.';
  wrap.appendChild(_hintBox);

  /* ── FEEDBACK ── */
  _fbBox = el('div', 'tr-radial-fb');
  wrap.appendChild(_fbBox);

  /* ── BUTTONS ── */
  var btns = el('div', 'tr-radial-btns');

  _checkBtn = el('button', 'tr-radial-btn');
  _checkBtn.textContent = '✔ SHOW SOLUTION';
  on(_checkBtn, 'click', function () {
    if (_solved) {
      if (_api) { _api.xp(5, 'Radial review'); _api.confetti(_checkBtn); }
    } else {
      revealSolution();
    }
  });
  btns.appendChild(_checkBtn);

  _nextBtn = el('button', 'tr-radial-btn yellow');
  _nextBtn.textContent = 'NEXT →';
  _nextBtn.disabled = true;
  on(_nextBtn, 'click', function () {
    _scenarioIdx = (_scenarioIdx + 1) % SCENARIOS.length;
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
    buildScenario(_host, _api, _scenarioIdx);
    startAnim();
  });
  btns.appendChild(_nextBtn);

  wrap.appendChild(btns);
  host.appendChild(wrap);
}

/* =====================================================================
   TINY DOM HELPER
   ===================================================================== */
function el(tag, className) {
  var node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/* =====================================================================
   MODULE REGISTRATION
   ===================================================================== */
(window.TRAINING_MODULES = window.TRAINING_MODULES || []).push({
  id: 'radial',
  title: 'Radial Force Builder',
  icon: '🐶',
  desc: 'Drag forces onto the circular-motion diagram; build F_r = mv²/r live with underbrace notation.',
  chapter: 'Ch 5',

  mount: function (host, api) {
    injectCSS();
    _api = api;
    _host = host;
    _scenarioIdx = 0;
    buildScenario(host, api, _scenarioIdx);
    startAnim();
  },

  unmount: function () {
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
    for (var i = 0; i < _listeners.length; i++) {
      var l = _listeners[i];
      try { l.el.removeEventListener(l.type, l.fn, l.opts); } catch (e) { /* ignore */ }
    }
    _listeners = [];
    if (_dragState && _dragState.ghost && _dragState.ghost.parentNode) {
      _dragState.ghost.parentNode.removeChild(_dragState.ghost);
    }
    _dragState = null;
    _scenario = null;
    _zoneRadial = _zoneTan = _eqBox = _numBox = _hintBox = _fbBox = null;
    _checkBtn = _nextBtn = _canvas = _ctx = _host = _api = null;
    _placedRadial = [];
    _placedTan = [];
    _solved = false;
  }
});

}()); /* end IIFE */
