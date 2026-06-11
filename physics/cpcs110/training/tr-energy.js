/* tr-energy.js — Energy Principle Interactive Bar Charts
   CPCS110 Physics Arcade Training Module
   Spec §4.1: register via window.TRAINING_MODULES.push({...})
   Spec §7:   api = { latex, typeset, xp, confetti, toast, reducedMotion, pulse, announce, engine }
   Spec §5:   drag uses pointerdown + setPointerCapture + pointermove + pointerup/cancel
   Spec §1.1: CSS vars --bg --panel --panel2 --cyan --magenta --green --yellow --red --ink --dim --slot are in :root
   Physics: g = 9.8 N/kg, G = 6.674e-11 N·m²/kg²
   ES2017 max, plain browser JS, no import/export.
*/
(function () {
  'use strict';

  // ── SCENARIOS ────────────────────────────────────────────────────────────────
  // Each scenario: bars{Ki,Ui,W,Kf,Uf} with .val (J) and .given (bool).
  // Students drag non-given bars to satisfy K_i + U_i + W = K_f + U_f.
  // negU:true → y-axis extends below zero (gravitational U = −GMm/r is negative).

  var SCENARIOS = [
    // 1 ── LIFTING A BOX ───────────────────────────────────────────────────────
    {
      id: 'lift-box',
      title: 'Lifting a Box',
      blurb: 'You lift a 2 kg box 1 m upward, starting and ending at rest. System = box + Earth.',
      bigIdea: 'External work W by you transfers into gravitational PE when ΔK = 0.',
      system: 'box + Earth',
      negU: false,
      bars: {
        Ki: { val: 0,    given: true  },  // starts at rest
        Ui: { val: 0,    given: true  },  // reference at initial height
        W:  { val: 19.6, given: true  },  // W = mgh = 2 × 9.8 × 1 = 19.6 J (you do the work)
        Kf: { val: 0,    given: false },  // ends at rest on shelf
        Uf: { val: 19.6, given: false }   // ΔU_g = mgΔy = 19.6 J
      },
      hint1: 'Box starts AND ends at rest — so K_f = 0. Where did your work go?',
      hint2: 'All W went into ΔU_grav. Set K_f = 0 and U_f = 19.6 J to balance the equation.'
    },

    // 2 ── BALL IN FREE FALL ───────────────────────────────────────────────────
    // Digest Ex. E: 100 g ball released from 7 m, find K when at 4 m (Δy = 3 m).
    // Reference at ground (y = 0). U_i = mgy_i = 0.1×9.8×7 = 6.86 J; U_f = 0.1×9.8×4 = 3.92 J.
    {
      id: 'dropped-ball',
      title: 'Ball in Free Fall',
      blurb: '100 g ball released from rest at y = 7 m. System = ball + Earth (W = 0). Find K and U when at y = 4 m.',
      bigIdea: 'With W = 0, ΔK = −ΔU. Gravity is internal — it appears as ΔU, not W.',
      system: 'ball + Earth',
      negU: false,
      bars: {
        Ki: { val: 0,    given: true  },
        Ui: { val: 6.86, given: true  },  // mgy_i = 0.1 × 9.8 × 7 = 6.86 J (y ref = ground)
        W:  { val: 0,    given: true  },  // no external work
        Kf: { val: 2.94, given: false },  // K_f = mg × 3 m = 0.1 × 9.8 × 3 = 2.94 J
        Uf: { val: 3.92, given: false }   // mgy_f = 0.1 × 9.8 × 4 = 3.92 J; note K_f + U_f = 6.86 ✓
      },
      hint1: 'W = 0 → the total energy K + U stays constant. Use K_i + U_i = K_f + U_f.',
      hint2: 'K_f = 0.1×9.8×3 = 2.94 J; U_f = 0.1×9.8×4 = 3.92 J. Check: 2.94 + 3.92 = 6.86 ✓'
    },

    // 3 ── SPRING LAUNCH ───────────────────────────────────────────────────────
    // Digest: spring k = 100 N/m, compressed 20 cm; system = ball + spring.
    {
      id: 'spring-launch',
      title: 'Spring Launch',
      blurb: 'Spring (k = 100 N/m, x = 20 cm) launches a 0.5 kg ball. System = ball + spring. Find K_f when spring fully releases.',
      bigIdea: 'Spring PE converts entirely to KE when released (W_ext = 0, no gravity in this horizontal problem).',
      system: 'ball + spring',
      negU: false,
      bars: {
        Ki: { val: 0,   given: true  },
        Ui: { val: 2.0, given: true  },  // ½kx² = ½ × 100 × 0.04 = 2.0 J
        W:  { val: 0,   given: true  },  // no external work after release
        Kf: { val: 2.0, given: false },  // all U → K
        Uf: { val: 0,   given: false }   // spring at natural length → U_spring = 0
      },
      hint1: 'Spring fully releases → U_f = 0. W = 0. Use K_i + U_i = K_f + U_f.',
      hint2: 'K_f = U_i = 2.0 J. U_f = 0 J. (Energy conserved: no external work.)'
    },

    // 4 ── TWO ASTEROIDS APPROACHING (negative U!) ────────────────────────────
    // G = 6.674e-11, m1 = m2 = 1×10^9 kg.
    // r_i = 1×10^8 m → U_i = -G m² / r_i = -6.674e-11 × 1e18 / 1e8 = -0.6674 J (≈ -0.67 J)
    // r_f = 1×10^7 m → U_f = -G m² / r_f = -6.674e-11 × 1e18 / 1e7 = -6.674 J (≈ -6.67 J)
    // ΔU = -6.67 - (-0.67) = -6.00 J → ΔK = +6.00 J (start from rest so K_i = 0)
    {
      id: 'gravity-approach',
      title: 'Two Asteroids Approaching',
      blurb: 'Two asteroids (1×10⁹ kg each) start from rest far apart. r: 1×10⁸ m → 1×10⁷ m. System = asteroid pair. W = 0.',
      bigIdea: 'Gravitational U = −Gm₁m₂/r is NEGATIVE. As r shrinks U becomes more negative, K grows. Both U bars sit below the axis!',
      system: 'asteroid pair',
      negU: true,
      bars: {
        Ki: { val: 0,     given: true  },
        Ui: { val: -0.67, given: true  },  // −G×(1e9)²/1e8 = −0.6674 J ≈ −0.67 J
        W:  { val: 0,     given: true  },
        Kf: { val: 6.0,   given: false },  // ΔK = −ΔU = 6.00 J
        Uf: { val: -6.67, given: false }   // −G×(1e9)²/1e7 = −6.674 J ≈ −6.67 J
      },
      hint1: 'U = −Gm²/r gets MORE negative as r decreases. U_f < U_i (further below zero). ΔK = −ΔU.',
      hint2: 'K_f ≈ 6.0 J; U_f ≈ −6.67 J. Note: U→0 as r→∞ is why U must be negative for attraction.'
    },

    // 5 ── BALL THROWN UPWARD ─────────────────────────────────────────────────
    // Digest drill 7: 250 g ball thrown up, rises 8 m.
    // K_i = mgh = 0.25 × 9.8 × 8 = 19.6 J (all K at launch converts to U at top).
    {
      id: 'throw-up',
      title: 'Ball Thrown Upward',
      blurb: '250 g ball thrown straight up, rises 8 m and momentarily stops. System = ball + Earth. Set K_f and U_f at the top.',
      bigIdea: 'At the highest point K = 0; all KE converts to gravitational PE. U → 0 as Δy → 0.',
      system: 'ball + Earth',
      negU: false,
      bars: {
        Ki: { val: 19.6, given: true  },  // ½mv² = mgΔy = 0.25 × 9.8 × 8 = 19.6 J
        Ui: { val: 0,    given: true  },  // reference at launch height
        W:  { val: 0,    given: true  },  // after the throw, W_ext = 0
        Kf: { val: 0,    given: false },  // ball momentarily at rest at top
        Uf: { val: 19.6, given: false }   // all K → U_grav
      },
      hint1: 'At the peak, the ball is momentarily at rest → K_f = 0.',
      hint2: 'K_f = 0, U_f = K_i = 19.6 J. Height check: Δy = U_f/(mg) = 19.6/(0.25×9.8) = 8 m ✓'
    },

    // 6 ── SPACECRAFT BOX (M&I signature example from slides) ─────────────────
    // m = 2000 kg, v_i = 0.7 m/s, F = ⟨300, 500, 0⟩ N, Δr = ⟨0.1, −0.3, 0.2⟩ m
    // W = F·Δr = 300×0.1 + 500×(−0.3) + 0 = 30 − 150 = −120 J  (NEGATIVE!)
    // K_i = ½mv² = ½ × 2000 × 0.49 = 490 J
    // K_f = K_i + W = 490 − 120 = 370 J
    {
      id: 'spacecraft-box',
      title: 'Spacecraft Box',
      blurb: 'M&I classic: m = 2000 kg box in space, v_i = 0.7 m/s. Force ⟨300,500,0⟩ N over ⟨0.1,−0.3,0.2⟩ m. System = box (no U). Find W and K_f.',
      bigIdea: 'Work CAN be negative — when the force component OPPOSES the displacement, W < 0 and K decreases.',
      system: 'box alone (no gravity)',
      negU: false,
      wCanBeNeg: true,
      bars: {
        Ki: { val: 490,  given: true  },  // ½ × 2000 × 0.7² = 490 J
        Ui: { val: 0,    given: true  },  // no gravity in this system choice
        W:  { val: -120, given: false },  // student computes F·Δr = −120 J  ← negative!
        Kf: { val: 370,  given: false },  // K_f = 490 + (−120) = 370 J
        Uf: { val: 0,    given: true  }
      },
      hint1: 'W = F·Δr = F_x Δx + F_y Δy + F_z Δz = (300)(0.1)+(500)(−0.3)+0 = −120 J. NEGATIVE.',
      hint2: 'W = −120 J; K_f = K_i + W = 490 − 120 = 370 J. Even though you push hard, the y-component of force opposes motion, draining energy.'
    },

    // 7 ── BOUND vs UNBOUND (gravitational escape) ────────────────────────────
    // Spacecraft near asteroid: K_i = 5 J, U_i = −7 J. E_total = −2 J < 0 → bound.
    // At the turning point K = 0, so U = E_total = −2 J.
    {
      id: 'bound-unbound',
      title: 'Bound vs Unbound',
      blurb: 'Spacecraft: K_i = 5 J, U_i = −7 J. System = spacecraft + asteroid, W = 0. Set K_f and U_f at the turning point where K = 0.',
      bigIdea: 'Total energy E = K + U < 0 means BOUND. K can never go negative — the turning point is where K = 0.',
      system: 'spacecraft + asteroid',
      negU: true,
      bars: {
        Ki: { val: 5.0,  given: true  },
        Ui: { val: -7.0, given: true  },  // bound: E_total = 5 − 7 = −2 J
        W:  { val: 0,    given: true  },
        Kf: { val: 0,    given: false },  // turning point: K = 0
        Uf: { val: -2.0, given: false }   // U_f = E_total = −2 J at turning point
      },
      hint1: 'E_total = K_i + U_i = 5 + (−7) = −2 J. Since E < 0, the object is BOUND. It must turn around.',
      hint2: 'At the turning point K_f = 0, so U_f = E_total = −2 J. The craft reverses direction there.'
    }
  ];

  // ── TOLERANCES ───────────────────────────────────────────────────────────────
  function inTol(student, correct) {
    if (Math.abs(correct) < 0.01) return Math.abs(student) < 0.18;
    return Math.abs(student - correct) <= Math.max(Math.abs(correct) * 0.06, 0.18);
  }

  // ── STYLE INJECTION ──────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('tr-style-energy')) return;
    var s = document.createElement('style');
    s.id = 'tr-style-energy';
    // All selectors prefixed .tren- or #tren- to prevent collisions.
    // CSS vars reuse the app's :root vars (--cyan, --magenta, --green, --yellow, --red, --ink, --dim,
    // --panel, --panel2, --slot) which are globally available per SPEC §1.1.
    s.textContent = [
      /* wrapper */
      '#tren-root{padding:4px 8px 80px;box-sizing:border-box;}',

      /* scenario header */
      '.tren-header{margin-bottom:10px;}',
      '.tren-title{',
      '  font-family:"Press Start 2P",monospace;font-size:10px;',
      '  color:var(--yellow);text-shadow:0 0 6px var(--magenta);',
      '  margin:0 0 6px;line-height:1.4;}',
      '.tren-blurb{font-size:12.5px;color:var(--ink);line-height:1.45;margin:0 0 4px;}',
      '.tren-system{font-size:11px;color:var(--dim);margin:0 0 6px;}',
      '.tren-bigidea{',
      '  font-size:11px;color:var(--cyan);',
      '  border-left:3px solid var(--cyan);',
      '  padding-left:8px;margin:6px 0 10px;line-height:1.4;}',

      /* progress pill */
      '.tren-progress{',
      '  font-family:"Press Start 2P",monospace;font-size:8px;',
      '  color:var(--dim);text-align:right;margin-bottom:8px;}',

      /* chart SVG */
      '.tren-chart{width:100%;max-width:480px;margin:0 auto;display:block;overflow:visible;}',

      /* balance meter */
      '.tren-balance-row{',
      '  display:flex;align-items:center;gap:8px;',
      '  margin:4px 0 8px;font-size:12px;color:var(--dim);}',
      '.tren-balance-bar{flex:1;height:10px;background:var(--slot);border-radius:5px;overflow:hidden;}',
      '.tren-balance-fill{height:100%;border-radius:5px;transition:width .25s,background .25s;}',
      '.tren-balance-label{',
      '  font-family:"Press Start 2P",monospace;font-size:7px;',
      '  white-space:nowrap;min-width:56px;text-align:right;}',

      /* live equation */
      '.tren-equation{',
      '  background:var(--panel2);border:1.5px solid var(--slot);',
      '  border-radius:10px;padding:9px 12px;margin-bottom:10px;',
      '  font-size:12px;color:var(--ink);line-height:1.6;text-align:center;',
      '  min-height:44px;word-break:break-all;}',
      '.tren-eq-balanced{border-color:var(--green)!important;color:var(--green);}',

      /* hint */
      '.tren-hint{',
      '  font-size:12px;color:var(--yellow);',
      '  background:rgba(255,225,77,.08);',
      '  border:1.5px solid var(--yellow);border-radius:8px;',
      '  padding:8px 10px;margin-bottom:10px;line-height:1.45;display:none;}',
      '.tren-hint.show{display:block;}',

      /* drag cursor */
      '.tren-bar-grab{cursor:ns-resize;touch-action:none;user-select:none;}',
      '.tren-bar-grab:hover{filter:brightness(1.3);}',

      /* buttons */
      '.tren-btns{display:flex;gap:10px;margin-top:10px;}',
      '.tren-btns button{',
      '  flex:1;font-family:"Press Start 2P",monospace;font-size:9px;',
      '  min-height:48px;border-radius:10px;cursor:pointer;letter-spacing:.3px;',
      '  transition:transform .1s,box-shadow .15s;touch-action:manipulation;}',
      '.tren-btns button:active{transform:scale(.97);}',
      '.tren-btn-check{background:var(--cyan);color:#000;border:none;box-shadow:0 0 10px rgba(33,230,255,.4);}',
      '.tren-btn-next{',
      '  background:transparent;color:var(--magenta);',
      '  border:2px solid var(--magenta);',
      '  box-shadow:0 0 10px rgba(255,61,240,.2);display:none;}',
      '.tren-btn-reset{background:transparent;color:var(--dim);border:2px solid var(--slot);}',

      /* solved badge */
      '.tren-solved-badge{',
      '  display:none;text-align:center;',
      '  font-family:"Press Start 2P",monospace;font-size:9px;',
      '  color:var(--green);margin-bottom:8px;',
      '  text-shadow:0 0 8px var(--green);}',
      '.tren-solved-badge.show{display:block;}',

      /* drag ghost */
      '.tren-ghost{',
      '  position:fixed;pointer-events:none;',
      '  opacity:.72;z-index:10001;border-radius:4px;}',

      /* shake on wrong answer */
      '@keyframes tren-shake{',
      '  0%,100%{transform:translateX(0);}',
      '  20%{transform:translateX(-6px);}',
      '  40%{transform:translateX(6px);}',
      '  60%{transform:translateX(-4px);}',
      '  80%{transform:translateX(4px);}',
      '}',

      /* pulse on correct answer */
      '@keyframes tren-pulse{',
      '  0%,100%{opacity:1;}50%{opacity:.5;}',
      '}',

      '@media(prefers-reduced-motion:reduce){',
      '  .tren-balance-fill{transition:none;}',
      '}',

      '@media(min-width:480px){',
      '  #tren-root{padding:8px 16px 80px;}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  // ── STATE ────────────────────────────────────────────────────────────────────
  var state = {
    scenarioIdx: 0,
    scenario: null,
    studentVals: {},
    misses: 0,
    solved: false,
    timers: [],
    rafs: [],
    pointerDrag: null  // active drag: {key, startY, startVal, pxPerJ, ghost}
  };

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  function fmt(v) {
    var abs = Math.abs(v);
    if (abs >= 100) return v.toFixed(0);
    if (abs >= 10)  return v.toFixed(1);
    return v.toFixed(2);
  }

  var BAR_LABELS = { Ki: 'Kᵢ', Ui: 'Uᵢ', W: 'W', Kf: 'Kf', Uf: 'Uf' };
  var BAR_COLORS = { Ki: '#21e6ff', Ui: '#ff3df0', W: '#ffe14d', Kf: '#21e6ff', Uf: '#ff3df0' };

  function getVal(key) {
    var sc = state.scenario;
    if (sc.bars[key].given) return sc.bars[key].val;
    return (state.studentVals[key] !== undefined) ? state.studentVals[key] : 0;
  }

  function lhsSum() { return getVal('Ki') + getVal('Ui') + getVal('W'); }
  function rhsSum() { return getVal('Kf') + getVal('Uf'); }

  function studentSolved() {
    var sc = state.scenario;
    var keys = Object.keys(sc.bars);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (!sc.bars[k].given && !inTol(getVal(k), sc.bars[k].val)) return false;
    }
    return true;
  }

  // ── SVG CHART ────────────────────────────────────────────────────────────────
  var CHART_W = 340;
  var POS_H   = 160;   // pixel height above axis for positive bars
  var NEG_H   = 80;    // pixel height below axis for negative bars
  var BAR_W   = 42;
  var AXIS_Y  = POS_H + 4;
  var SVG_H   = POS_H + NEG_H + 22;
  var KEYS    = ['Ki', 'Ui', 'W', 'Kf', 'Uf'];
  var COL_X   = [22, 86, 150, 214, 278];  // x-center per column

  function scaleMax(sc) {
    var m = 0.5;
    KEYS.forEach(function(k) { m = Math.max(m, Math.abs(sc.bars[k].val)); });
    return m;
  }

  // Map a joule value to positive screen pixels (bar height).
  // Positive values map to POS_H, negative to NEG_H.
  function valToPx(v, maxVal) {
    if (v >= 0) return (v / maxVal) * (POS_H - 14);
    return (v / maxVal) * (NEG_H - 8);  // negative → positive px in neg zone
  }

  var NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function(k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  function buildSVG(sc) {
    var svg = svgEl('svg', {
      viewBox: '0 0 ' + CHART_W + ' ' + SVG_H,
      'class': 'tren-chart',
      role: 'img',
      'aria-label': 'Energy bar chart for ' + sc.title
    });

    var maxVal = scaleMax(sc);

    // background
    svg.appendChild(svgEl('rect', {
      x: 0, y: 0, width: CHART_W, height: SVG_H,
      fill: '#0e0e1c', rx: 10
    }));

    // zero axis
    svg.appendChild(svgEl('line', {
      x1: 6, x2: CHART_W - 6,
      y1: AXIS_Y, y2: AXIS_Y,
      stroke: '#2a2a6a', 'stroke-width': 2
    }));

    // "0" label
    var zl = svgEl('text', { x: 2, y: AXIS_Y + 4, fill: '#4a4a8a', 'font-size': 10 });
    zl.textContent = '0';
    svg.appendChild(zl);

    // LHS/RHS divider
    svg.appendChild(svgEl('line', {
      x1: 183, x2: 183, y1: 4, y2: SVG_H - 4,
      stroke: '#2a2a3a', 'stroke-width': 1.5, 'stroke-dasharray': '4 3'
    }));
    var eqT = svgEl('text', {
      x: 185, y: AXIS_Y - 8, fill: '#a9b5d9',
      'font-size': 15, 'font-weight': 'bold'
    });
    eqT.textContent = '=';
    svg.appendChild(eqT);

    // bars
    KEYS.forEach(function(key, idx) {
      var cx    = COL_X[idx];
      var barDef = sc.bars[key];
      var val   = barDef.given ? barDef.val : (state.studentVals[key] || 0);
      var given = barDef.given;
      var color = BAR_COLORS[key];
      var px    = valToPx(val, maxVal);

      // bar rect
      var barAttrs = {
        id: 'tren-bar-' + key,
        rx: 3, width: BAR_W, x: cx - BAR_W / 2,
        fill: color, 'fill-opacity': given ? '0.88' : '0.60',
        stroke: color, 'stroke-width': '1.5'
      };
      if (val >= 0) {
        barAttrs.y = AXIS_Y - Math.max(px, 3);
        barAttrs.height = Math.max(px, 3);
      } else {
        barAttrs.y = AXIS_Y;
        barAttrs.height = Math.max(-px, 3);
      }
      if (!given) {
        barAttrs['class'] = 'tren-bar-grab';
        barAttrs['data-key'] = key;
        barAttrs.cursor = 'ns-resize';
      }
      svg.appendChild(svgEl('rect', barAttrs));

      // value label
      var labelY = val >= 0
        ? Math.max(AXIS_Y - Math.max(px, 3) - 3, 11)
        : AXIS_Y + Math.max(-px, 3) + 11;
      var vt = svgEl('text', {
        id: 'tren-val-' + key,
        x: cx, y: labelY,
        'text-anchor': 'middle',
        'font-size': 9, fill: given ? '#fff' : color,
        'font-weight': 'bold'
      });
      vt.textContent = fmt(val) + ' J';
      svg.appendChild(vt);

      // column key label at bottom
      var kl = svgEl('text', {
        x: cx, y: SVG_H - 2,
        'text-anchor': 'middle',
        'font-size': 11,
        fill: given ? '#a9b5d9' : color
      });
      kl.textContent = BAR_LABELS[key];
      svg.appendChild(kl);

      // drag handle triangle on non-given bars
      if (!given) {
        var ty = val >= 0
          ? AXIS_Y - Math.max(px, 3) - 3
          : AXIS_Y + Math.max(-px, 3) + 3;
        var sz = 7;
        var pts;
        if (val >= 0) {
          pts = (cx-sz)+','+ty+' '+(cx+sz)+','+ty+' '+cx+','+(ty-sz);
        } else {
          pts = (cx-sz)+','+ty+' '+(cx+sz)+','+ty+' '+cx+','+(ty+sz);
        }
        svg.appendChild(svgEl('polygon', {
          id: 'tren-handle-' + key,
          points: pts,
          fill: color,
          'class': 'tren-bar-grab',
          'data-key': key,
          cursor: 'ns-resize'
        }));
      }

      // lock icon for given bars
      if (given) {
        var lockT = svgEl('text', {
          x: cx, y: SVG_H - 13,
          'text-anchor': 'middle', 'font-size': 9, fill: '#2a2a6a'
        });
        lockT.textContent = '🔒';
        svg.appendChild(lockT);
      }
    });

    // "+" operator labels between bars within LHS and within RHS
    [[COL_X[0], COL_X[1]], [COL_X[1], COL_X[2]], [COL_X[3], COL_X[4]]].forEach(function(pair) {
      var pt = svgEl('text', {
        x: (pair[0] + pair[1]) / 2, y: AXIS_Y - 6,
        'text-anchor': 'middle', 'font-size': 13, fill: '#a9b5d9'
      });
      pt.textContent = '+';
      svg.appendChild(pt);
    });

    return svg;
  }

  // ── UPDATE BARS after drag ───────────────────────────────────────────────────
  function updateBars(svgEl) {
    var sc = state.scenario;
    var maxVal = scaleMax(sc);

    KEYS.forEach(function(key, idx) {
      var val = getVal(key);
      var px  = valToPx(val, maxVal);
      var cx  = COL_X[idx];

      var bar  = svgEl.querySelector('#tren-bar-' + key);
      var valT = svgEl.querySelector('#tren-val-' + key);
      var hndl = svgEl.querySelector('#tren-handle-' + key);

      if (!bar) return;
      if (val >= 0) {
        bar.setAttribute('y', AXIS_Y - Math.max(px, 3));
        bar.setAttribute('height', Math.max(px, 3));
      } else {
        bar.setAttribute('y', AXIS_Y);
        bar.setAttribute('height', Math.max(-px, 3));
      }

      if (valT) {
        var labelY = val >= 0
          ? Math.max(AXIS_Y - Math.max(px, 3) - 3, 11)
          : AXIS_Y + Math.max(-px, 3) + 11;
        valT.setAttribute('y', labelY);
        valT.textContent = fmt(val) + ' J';
      }

      if (hndl) {
        var ty = val >= 0
          ? AXIS_Y - Math.max(px, 3) - 3
          : AXIS_Y + Math.max(-px, 3) + 3;
        var sz = 7;
        var pts;
        if (val >= 0) {
          pts = (cx-sz)+','+ty+' '+(cx+sz)+','+ty+' '+cx+','+(ty-sz);
        } else {
          pts = (cx-sz)+','+ty+' '+(cx+sz)+','+ty+' '+cx+','+(ty+sz);
        }
        hndl.setAttribute('points', pts);
      }
    });
  }

  // ── BALANCE METER ────────────────────────────────────────────────────────────
  function updateBalanceMeter(fillEl, labelEl) {
    var diff = Math.abs(lhsSum() - rhsSum());
    var maxDiff = scaleMax(state.scenario) * 2;
    var balance = Math.max(0, 1 - diff / maxDiff);
    var pct = Math.round(balance * 100);
    fillEl.style.width = pct + '%';

    if (balance >= 0.97) {
      fillEl.style.background = 'var(--green)';
      labelEl.textContent = 'BALANCED ✓';
      labelEl.style.color = 'var(--green)';
    } else if (balance >= 0.6) {
      fillEl.style.background = 'var(--yellow)';
      labelEl.textContent = 'CLOSE…';
      labelEl.style.color = 'var(--yellow)';
    } else {
      fillEl.style.background = 'var(--red)';
      labelEl.textContent = 'OFF BALANCE';
      labelEl.style.color = 'var(--red)';
    }
  }

  // ── EQUATION LINE ────────────────────────────────────────────────────────────
  function updateEquation(eqEl) {
    var Ki = getVal('Ki'), Ui = getVal('Ui'), W = getVal('W');
    var Kf = getVal('Kf'), Uf = getVal('Uf');
    var lhs = Ki + Ui + W;
    var rhs = Kf + Uf;
    var balanced = Math.abs(lhs - rhs) < 0.18;

    // Format with sign for clarity
    function signed(v) { return (v >= 0 ? '+' : '') + fmt(v); }

    eqEl.textContent =
      'Kᵢ+Uᵢ+W = Kf+Uf   (' +
      fmt(Ki) + signed(Ui) + signed(W) + ' = ' + fmt(Kf) + signed(Uf) +
      ')   ⟹   ' + fmt(lhs) + ' J ' + (balanced ? '=' : '≠') + ' ' + fmt(rhs) + ' J';

    eqEl.className = 'tren-equation' + (balanced ? ' tren-eq-balanced' : '');
  }

  // ── POINTER DRAG ─────────────────────────────────────────────────────────────
  // Per SPEC §5: pointerdown → setPointerCapture → ghost → pointermove → pointerup.
  // Ghost goes into #vz-floatLayer if present, else document.body.

  function attachDrag(svgEl, balanceFill, balanceLbl, eqEl) {
    svgEl.addEventListener('pointerdown', function(e) {
      var target = e.target;
      var key = target.getAttribute('data-key');
      if (!key) return;
      var sc = state.scenario;
      if (sc.bars[key].given) return;
      if (state.solved) return;

      e.preventDefault();
      try { target.setPointerCapture(e.pointerId); } catch(ex) {}

      var maxVal = scaleMax(sc);
      // pxPerJ: how many screen pixels correspond to 1 J
      // positive zone uses POS_H px for maxVal J
      var pxPerJ = (POS_H - 14) / maxVal;

      var startY   = e.clientY;
      var startVal = (state.studentVals[key] !== undefined) ? state.studentVals[key] : 0;

      // ghost: clone the bar rect, place it fixed on screen
      var floatTarget = document.getElementById('vz-floatLayer') || document.body;
      var barRectEl = svgEl.querySelector('#tren-bar-' + key);
      var ghost = null;
      if (barRectEl) {
        var bcr = barRectEl.getBoundingClientRect();
        ghost = document.createElement('div');
        ghost.className = 'tren-ghost';
        ghost.style.cssText =
          'left:' + bcr.left + 'px;top:' + bcr.top + 'px;' +
          'width:' + bcr.width + 'px;height:' + bcr.height + 'px;' +
          'background:' + BAR_COLORS[key] + ';';
        floatTarget.appendChild(ghost);
      }

      state.pointerDrag = {
        key: key, startY: startY, startVal: startVal,
        pxPerJ: pxPerJ, ghost: ghost, maxVal: maxVal,
        wCanBeNeg: sc.wCanBeNeg || false, negU: sc.negU || false
      };
    });

    svgEl.addEventListener('pointermove', function(e) {
      if (!state.pointerDrag) return;
      e.preventDefault();
      var d = state.pointerDrag;

      var dy    = e.clientY - d.startY;  // positive = moved down → bar shrinks
      var delta = -dy / d.pxPerJ;
      var newVal = d.startVal + delta;

      // clamping rules
      var key = d.key;
      var canNeg = (key.charAt(0) === 'U' && d.negU) || (key === 'W' && d.wCanBeNeg);
      var lo = canNeg ? -d.maxVal * 1.25 : 0;
      var hi = d.maxVal * 1.25;
      newVal = Math.max(lo, Math.min(hi, newVal));
      newVal = Math.round(newVal * 10) / 10;  // snap to 0.1 J

      state.studentVals[key] = newVal;

      // update ghost height/position
      if (d.ghost) {
        var br2 = svgEl.querySelector('#tren-bar-' + key);
        if (br2) {
          var bcr2 = br2.getBoundingClientRect();
          d.ghost.style.top    = bcr2.top + 'px';
          d.ghost.style.height = bcr2.height + 'px';
        }
      }

      updateBars(svgEl);
      updateBalanceMeter(balanceFill, balanceLbl);
      updateEquation(eqEl);
    });

    function endDrag(e) {
      if (!state.pointerDrag) return;
      var d = state.pointerDrag;
      if (d.ghost && d.ghost.parentNode) d.ghost.parentNode.removeChild(d.ghost);
      state.pointerDrag = null;
    }
    svgEl.addEventListener('pointerup',     endDrag);
    svgEl.addEventListener('pointercancel', endDrag);
  }

  // ── SHAKE ────────────────────────────────────────────────────────────────────
  function shakeEl(el) {
    if (window.fxReducedMotion && window.fxReducedMotion()) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'tren-shake .35s ease';
    var t = setTimeout(function() { el.style.animation = ''; }, 400);
    state.timers.push(t);
  }

  // ── RENDER SCENARIO ──────────────────────────────────────────────────────────
  function renderScenario(host, api) {
    var sc = SCENARIOS[state.scenarioIdx % SCENARIOS.length];
    state.scenario = sc;
    state.studentVals = {};
    state.misses  = 0;
    state.solved  = false;
    state.pointerDrag = null;

    // initialize non-given bars to 0
    KEYS.forEach(function(k) {
      if (sc.bars[k] && !sc.bars[k].given) {
        state.studentVals[k] = 0;
      }
    });

    host.innerHTML = '';

    var root = document.createElement('div');
    root.id = 'tren-root';

    // progress
    var prog = document.createElement('div');
    prog.className = 'tren-progress';
    prog.textContent = 'SCENARIO ' + (state.scenarioIdx + 1) + ' / ' + SCENARIOS.length;
    root.appendChild(prog);

    // header card
    var hdr = document.createElement('div');
    hdr.className = 'tren-header';

    var ttl = document.createElement('div');
    ttl.className = 'tren-title';
    ttl.textContent = sc.title.toUpperCase();
    hdr.appendChild(ttl);

    var blb = document.createElement('div');
    blb.className = 'tren-blurb';
    blb.textContent = sc.blurb;
    hdr.appendChild(blb);

    var sys = document.createElement('div');
    sys.className = 'tren-system';
    sys.textContent = 'System: ' + sc.system;
    hdr.appendChild(sys);

    root.appendChild(hdr);

    // solved badge
    var badge = document.createElement('div');
    badge.className = 'tren-solved-badge';
    badge.id = 'tren-badge';
    badge.textContent = '✓ BALANCED — ENERGY CONSERVED!';
    root.appendChild(badge);

    // chart
    var chartWrap = document.createElement('div');
    var svg = buildSVG(sc);
    chartWrap.appendChild(svg);
    root.appendChild(chartWrap);

    // balance meter
    var balRow = document.createElement('div');
    balRow.className = 'tren-balance-row';
    var balLblL = document.createElement('span');
    balLblL.textContent = 'Balance:';
    var balBar = document.createElement('div');
    balBar.className = 'tren-balance-bar';
    var balFill = document.createElement('div');
    balFill.className = 'tren-balance-fill';
    balFill.style.width = '0%';
    balFill.style.background = 'var(--red)';
    balBar.appendChild(balFill);
    var balLbl = document.createElement('span');
    balLbl.className = 'tren-balance-label';
    balLbl.style.color = 'var(--red)';
    balLbl.textContent = 'OFF BALANCE';
    balRow.appendChild(balLblL);
    balRow.appendChild(balBar);
    balRow.appendChild(balLbl);
    root.appendChild(balRow);

    // equation
    var eqEl = document.createElement('div');
    eqEl.className = 'tren-equation';
    root.appendChild(eqEl);

    // big idea
    var ideaEl = document.createElement('div');
    ideaEl.className = 'tren-bigidea';
    ideaEl.textContent = sc.bigIdea;
    root.appendChild(ideaEl);

    // hint
    var hintEl = document.createElement('div');
    hintEl.className = 'tren-hint';
    hintEl.id = 'tren-hint';
    root.appendChild(hintEl);

    // buttons
    var btns = document.createElement('div');
    btns.className = 'tren-btns';

    var btnCheck = document.createElement('button');
    btnCheck.className = 'tren-btn-check';
    btnCheck.textContent = '✓ CHECK';
    btnCheck.setAttribute('aria-label', 'Check your answer');

    var btnNext = document.createElement('button');
    btnNext.className = 'tren-btn-next';
    btnNext.textContent = 'NEXT ▶';
    btnNext.setAttribute('aria-label', 'Go to next scenario');

    var btnReset = document.createElement('button');
    btnReset.className = 'tren-btn-reset';
    btnReset.textContent = '↺ RESET';
    btnReset.setAttribute('aria-label', 'Reset all draggable bars to zero');

    btns.appendChild(btnCheck);
    btns.appendChild(btnNext);
    btns.appendChild(btnReset);
    root.appendChild(btns);

    host.appendChild(root);

    // wire drag
    attachDrag(svg, balFill, balLbl, eqEl);

    // initial display
    updateBars(svg);
    updateBalanceMeter(balFill, balLbl);
    updateEquation(eqEl);

    // ── CHECK BUTTON ───────────────────────────────────────────────────────────
    btnCheck.addEventListener('click', function() {
      if (state.solved) return;

      if (studentSolved()) {
        state.solved = true;
        badge.className = 'tren-solved-badge show';
        btnNext.style.display = 'block';
        btnCheck.disabled = true;
        hintEl.className = 'tren-hint';

        // snap bars to exact answers
        KEYS.forEach(function(k) {
          if (!sc.bars[k].given) state.studentVals[k] = sc.bars[k].val;
        });
        updateBars(svg);
        updateBalanceMeter(balFill, balLbl);
        updateEquation(eqEl);

        // rewards via api (SPEC §7 names)
        if (api && api.confetti) api.confetti(btnCheck);
        if (api && api.xp)      api.xp(1, 'energy-' + sc.id);
        if (api && api.toast)   api.toast('Energy conserved! ΔE_sys = W_ext ✓', 'ok');
        if (api && api.announce) api.announce('Correct! Energy bars balanced. ' + sc.bigIdea);

        // pulse eq
        if (!window.fxReducedMotion || !window.fxReducedMotion()) {
          eqEl.style.animation = 'none';
          void eqEl.offsetWidth;
          eqEl.style.animation = 'tren-pulse .5s ease 2';
          var tp = setTimeout(function() { eqEl.style.animation = ''; }, 1100);
          state.timers.push(tp);
        }

        ideaEl.style.borderLeftColor = 'var(--green)';
        ideaEl.style.color = 'var(--green)';

      } else {
        state.misses++;
        shakeEl(svg);

        if (api && api.toast) api.toast('Not quite — drag bars until balanced!', 'bad');
        if (api && api.announce) api.announce('Incorrect. Adjust the bars and try again.');

        if (state.misses >= 1) {
          hintEl.className = 'tren-hint show';
          hintEl.textContent = (state.misses >= 2) ? sc.hint2 : sc.hint1;
        }
      }
    });

    // ── NEXT BUTTON ───────────────────────────────────────────────────────────
    btnNext.addEventListener('click', function() {
      state.scenarioIdx = (state.scenarioIdx + 1) % SCENARIOS.length;
      state.timers.forEach(function(t) { clearTimeout(t); });
      state.timers = [];
      renderScenario(host, api);
    });

    // ── RESET BUTTON ──────────────────────────────────────────────────────────
    btnReset.addEventListener('click', function() {
      KEYS.forEach(function(k) {
        if (!sc.bars[k].given) state.studentVals[k] = 0;
      });
      updateBars(svg);
      updateBalanceMeter(balFill, balLbl);
      updateEquation(eqEl);
      hintEl.className = 'tren-hint';
    });
  }

  // ── MOUNT ─────────────────────────────────────────────────────────────────────
  function mount(host, api) {
    injectStyles();
    state.scenarioIdx = 0;
    state.pointerDrag = null;
    state.timers = [];
    state.rafs   = [];
    renderScenario(host, api);
  }

  // ── UNMOUNT ───────────────────────────────────────────────────────────────────
  function unmount() {
    state.timers.forEach(function(t) { clearTimeout(t); });
    state.timers = [];
    state.rafs.forEach(function(r) { cancelAnimationFrame(r); });
    state.rafs = [];
    // clean up any leftover ghost
    var ghost = document.querySelector('.tren-ghost');
    if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
    state.pointerDrag = null;
    state.scenario    = null;
  }

  // ── REGISTER ──────────────────────────────────────────────────────────────────
  (window.TRAINING_MODULES = window.TRAINING_MODULES || []).push({
    id:      'energy',
    title:   'Energy Bar Charts',
    icon:    '⚡',
    blurb:   'Drag bars to balance ΔE_sys = W_ext — 7 scenarios inc. negative U',
    chapter: 'Ch 5–6',
    mount:   mount,
    unmount: unmount
  });

}());
