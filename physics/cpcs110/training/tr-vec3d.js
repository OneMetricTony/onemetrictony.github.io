/* tr-vec3d.js — 3D Vector Magnitude + Gravity Training Module
   CPCS110 Physics Arcade  |  M&I notation  |  ES2017, no modules
   ---------------------------------------------------------------- */
(function () {
  'use strict';

  /* ── Problem bank: integers where |r⃗| is a whole number ───────── */
  var PROBLEMS = [
    { x:  3, y: -4, z:  12, mag: 13 },
    { x:  2, y:  3, z:   6, mag:  7 },
    { x:  1, y:  4, z:   8, mag:  9 },
    { x:  6, y:  6, z:   7, mag: 11 },
    { x:  2, y:  6, z:   9, mag: 11 },
    { x:  4, y:  4, z:   7, mag:  9 },
  ];

  /* ── Module-level state ─────────────────────────────────────────── */
  var _host = null, _api = null;
  var _prob = null, _probIdx = 0;
  var _misses = { x: 0, y: 0, z: 0 };
  var _solved = { x: false, y: false, z: false };
  var _rAF = 0;
  var _timers = [];

  /* ── Inject CSS once ─────────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('tr-style-vec3d')) return;
    var s = document.createElement('style');
    s.id = 'tr-style-vec3d';
    s.textContent = [
      '#trvec3d-root {',
      '  --tv-cyan:#21e6ff; --tv-mag:#ff3df0; --tv-yel:#ffe14d; --tv-grn:#39ff88;',
      '  --tv-red:#ff5470; --tv-bg:#06060d; --tv-panel:#0e0e1c; --tv-panel2:#13132b;',
      '  --tv-ink:#d7e6ff; --tv-dim:#a9b5d9; --tv-slot:#101030;',
      '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
      '  color:var(--tv-ink); padding:12px 4px 80px;',
      '}',
      '.trvec3d-head {',
      '  font-family:"Press Start 2P",monospace; font-size:11px;',
      '  color:var(--tv-cyan); text-shadow:0 0 8px var(--tv-cyan);',
      '  margin:0 0 4px; letter-spacing:.5px;',
      '}',
      '.trvec3d-chapter { font-size:9px; color:var(--tv-dim); margin:0 0 14px; }',
      '.trvec3d-card {',
      '  background:linear-gradient(160deg,#12122b,#0c0c1e);',
      '  border:2px solid #2a2a55; border-radius:16px;',
      '  padding:16px 14px 14px; margin-bottom:14px;',
      '}',
      '.trvec3d-vec-display {',
      '  font-family:"Cambria Math","Times New Roman",serif;',
      '  font-size:clamp(17px,4.5vw,22px); color:var(--tv-yel);',
      '  text-shadow:0 0 8px var(--tv-yel); margin:0 0 14px; line-height:1.5;',
      '}',
      '.trvec3d-formula {',
      '  display:flex; align-items:center; flex-wrap:wrap; gap:5px;',
      '  font-family:"Cambria Math","Times New Roman",serif;',
      '  font-size:clamp(14px,3.8vw,18px); color:var(--tv-ink);',
      '  margin-bottom:10px;',
      '}',
      '.trvec3d-radical {',
      '  display:inline-flex; align-items:center; gap:3px;',
      '  border-top:2px solid var(--tv-ink); padding:2px 6px 0;',
      '}',
      '.trvec3d-sqrt-sym { font-size:1.5em; line-height:.85; margin-right:2px; }',
      '.trvec3d-inp {',
      '  width:54px; padding:6px 4px; text-align:center;',
      '  background:var(--tv-slot); border:2px solid #2a2a55;',
      '  border-radius:8px; color:var(--tv-ink); font-size:16px;',
      '  font-family:"Cambria Math","Times New Roman",serif;',
      '  transition:border-color .2s, box-shadow .2s; outline:none;',
      '  -moz-appearance:textfield; touch-action:manipulation;',
      '}',
      '.trvec3d-inp::-webkit-outer-spin-button,',
      '.trvec3d-inp::-webkit-inner-spin-button { -webkit-appearance:none; }',
      '.trvec3d-inp.ok  { border-color:var(--tv-grn); box-shadow:0 0 8px var(--tv-grn); }',
      '.trvec3d-inp.bad { border-color:var(--tv-red); box-shadow:0 0 6px var(--tv-red); }',
      '.trvec3d-inp:focus { border-color:var(--tv-cyan); box-shadow:0 0 6px var(--tv-cyan); }',
      '.trvec3d-sq { font-size:.72em; vertical-align:super; }',
      '.trvec3d-plus { margin:0 2px; }',
      '.trvec3d-vis-wrap {',
      '  position:relative; width:100%; max-width:320px; margin:12px auto 4px;',
      '  border-radius:12px; overflow:hidden;',
      '  background:radial-gradient(ellipse at center,#0d0d28 60%,#06060d);',
      '  border:1.5px solid #2a2a55;',
      '}',
      '#trvec3d-canvas { display:block; width:100%; }',
      '.trvec3d-result {',
      '  min-height:38px; text-align:center; font-size:clamp(12px,3.2vw,15px);',
      '  color:var(--tv-grn); font-family:"Press Start 2P",monospace;',
      '  padding:8px 4px; text-shadow:0 0 8px var(--tv-grn); letter-spacing:.4px; line-height:1.6;',
      '}',
      '.trvec3d-feedback {',
      '  text-align:center; font-size:12px; min-height:20px;',
      '  color:var(--tv-red); margin:4px 0;',
      '}',
      '.trvec3d-hint {',
      '  background:var(--tv-panel2); border-left:3px solid var(--tv-yel);',
      '  border-radius:0 8px 8px 0; padding:8px 12px; margin:8px 0;',
      '  font-size:12px; color:var(--tv-dim); line-height:1.5; display:none;',
      '}',
      '.trvec3d-hint.show { display:block; }',
      '.trvec3d-btns { display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; }',
      '.trvec3d-btn {',
      '  flex:1 1 130px; min-height:48px; border-radius:12px;',
      '  font-family:"Press Start 2P",monospace; font-size:9px; letter-spacing:.4px;',
      '  border:2px solid var(--tv-cyan); color:var(--tv-cyan); background:transparent;',
      '  cursor:pointer; transition:transform .1s; touch-action:manipulation;',
      '}',
      '.trvec3d-btn:active { transform:scale(.96); }',
      '.trvec3d-btn.primary { background:var(--tv-cyan); color:#000; box-shadow:0 0 10px rgba(33,230,255,.4); }',
      '.trvec3d-btn.yellow  { border-color:var(--tv-yel); color:var(--tv-yel); }',
      '.trvec3d-grav-section {',
      '  background:linear-gradient(160deg,#12122b,#0c0c1e);',
      '  border:2px solid #3a2a55; border-radius:16px;',
      '  padding:14px 14px 12px; margin-bottom:14px;',
      '}',
      '.trvec3d-grav-head {',
      '  font-family:"Press Start 2P",monospace; font-size:9px;',
      '  color:var(--tv-mag); text-shadow:0 0 6px var(--tv-mag); margin:0 0 10px;',
      '}',
      '.trvec3d-grav-formula {',
      '  font-family:"Cambria Math","Times New Roman",serif;',
      '  font-size:clamp(13px,3.4vw,16px); color:var(--tv-ink);',
      '  margin-bottom:10px; line-height:1.8;',
      '}',
      '.trvec3d-grav-inp {',
      '  width:80px; padding:5px 4px; text-align:center;',
      '  background:var(--tv-slot); border:2px solid #2a2a55;',
      '  border-radius:8px; color:var(--tv-ink); font-size:14px;',
      '  font-family:"Cambria Math","Times New Roman",serif;',
      '  transition:border-color .2s; outline:none; touch-action:manipulation;',
      '}',
      '.trvec3d-grav-inp.ok  { border-color:var(--tv-grn); box-shadow:0 0 8px var(--tv-grn); }',
      '.trvec3d-grav-inp.bad { border-color:var(--tv-red); }',
      '.trvec3d-grav-inp:focus { border-color:var(--tv-mag); box-shadow:0 0 6px var(--tv-mag); }',
      '.trvec3d-positions {',
      '  font-size:12px; color:var(--tv-dim); margin-bottom:10px; line-height:1.8;',
      '  font-family:"Cambria Math","Times New Roman",serif;',
      '}',
      '.trvec3d-step {',
      '  border-left:3px solid #2a2a55; padding:8px 10px; margin:8px 0;',
      '  border-radius:0 8px 8px 0; background:var(--tv-slot);',
      '  font-size:13px; line-height:1.6;',
      '  font-family:"Cambria Math","Times New Roman",serif;',
      '}',
      '.trvec3d-step.active { border-color:var(--tv-cyan); }',
      '.trvec3d-step.done   { border-color:var(--tv-grn); opacity:.75; }',
      '@keyframes trvec3d-shake {',
      '  0%,100%{transform:translateX(0)}',
      '  20%{transform:translateX(-7px)} 40%{transform:translateX(7px)}',
      '  60%{transform:translateX(-5px)} 80%{transform:translateX(5px)}',
      '}',
      '.trvec3d-shaking { animation:trvec3d-shake .35s ease; }',
      '@media (min-width:480px) {',
      '  .trvec3d-inp { width:62px; }',
      '  .trvec3d-formula { font-size:18px; gap:8px; }',
      '}',
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ── Canvas 3D oblique-projection drawing ────────────────────────── */
  var AX = { x: '#21e6ff', y: '#ff3df0', z: '#ffe14d' };

  function proj(x3, y3, z3, cx, cy, sc) {
    /* oblique cabinet: x→right, y→up, z→lower-left at 30 deg */
    return [
      cx + sc * (x3 - z3 * 0.5 * 0.866),
      cy - sc * (y3 + z3 * 0.5 * 0.5)
    ];
  }

  function arrow(ctx, x1, y1, x2, y2, color, hl) {
    hl = hl || 9;
    var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
    if (len < 2) return;
    var ux = dx / len, uy = dy / len;
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hl * (ux + 0.4 * uy), y2 - hl * (uy - 0.4 * ux));
    ctx.lineTo(x2 - hl * (ux - 0.4 * uy), y2 - hl * (uy + 0.4 * ux));
    ctx.closePath(); ctx.fill();
  }

  function dash(ctx, x1, y1, x2, y2, color) {
    ctx.save();
    ctx.setLineDash([4, 4]); ctx.strokeStyle = color;
    ctx.lineWidth = 1.2; ctx.globalAlpha = 0.48;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.restore();
  }

  function drawScene(canvas, solv, pulseAxis, pulseFull) {
    var W = canvas.width, H = canvas.height;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    var p = _prob; if (!p) return;
    var cx = W * 0.48, cy = H * 0.55;
    var maxC = Math.max(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z), 1);
    var sc = (Math.min(W, H) * 0.27) / maxC;
    var ax = maxC * 1.35;
    var rm = _api && _api.reducedMotion && _api.reducedMotion();

    /* axes */
    function drawAxis(axis, x, y, z) {
      var glow = solv[axis] || pulseAxis === axis;
      ctx.globalAlpha = glow ? 1 : 0.5;
      if (glow && !rm) { ctx.shadowColor = AX[axis]; ctx.shadowBlur = 10; }
      var start = proj(x < 0 ? ax * 0.2 : -ax * 0.15, y < 0 ? ax * 0.2 : -ax * 0.15,
                       z < 0 ? ax * 0.2 : -ax * 0.15, cx, cy, sc);
      var end = proj(x, y, z, cx, cy, sc);
      arrow(ctx, start[0], start[1], end[0], end[1], AX[axis], 8);
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }
    drawAxis('x', ax, 0, 0);
    drawAxis('y', 0, ax, 0);
    drawAxis('z', 0, 0, ax);

    /* axis labels */
    ctx.font = 'bold 11px "Press Start 2P",monospace'; ctx.globalAlpha = 0.8;
    var Xend = proj(ax, 0, 0, cx, cy, sc);
    var Yend = proj(0, ax, 0, cx, cy, sc);
    var Zend = proj(0, 0, ax, cx, cy, sc);
    ctx.fillStyle = AX.x; ctx.fillText('x', Xend[0] + 4, Xend[1] + 4);
    ctx.fillStyle = AX.y; ctx.fillText('y', Yend[0] - 4, Yend[1] - 6);
    ctx.fillStyle = AX.z; ctx.fillText('z', Zend[0] - 14, Zend[1] + 4);
    ctx.globalAlpha = 1;

    /* projection dashes */
    var tip = proj(p.x, p.y, p.z, cx, cy, sc);
    var O = proj(0, 0, 0, cx, cy, sc);
    if (solv.x) {
      var xP = proj(p.x, 0, 0, cx, cy, sc);
      dash(ctx, tip[0], tip[1], xP[0], xP[1], AX.x);
      ctx.beginPath(); ctx.arc(xP[0], xP[1], 3, 0, 6.28);
      ctx.fillStyle = AX.x; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
    }
    if (solv.y) {
      var yP = proj(0, p.y, 0, cx, cy, sc);
      dash(ctx, tip[0], tip[1], yP[0], yP[1], AX.y);
      ctx.beginPath(); ctx.arc(yP[0], yP[1], 3, 0, 6.28);
      ctx.fillStyle = AX.y; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
    }
    if (solv.z) {
      var zP = proj(0, 0, p.z, cx, cy, sc);
      dash(ctx, tip[0], tip[1], zP[0], zP[1], AX.z);
      ctx.beginPath(); ctx.arc(zP[0], zP[1], 3, 0, 6.28);
      ctx.fillStyle = AX.z; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
    }

    /* vector arrow */
    var all = solv.x && solv.y && solv.z;
    ctx.globalAlpha = all ? 1 : (solv.x || solv.y || solv.z ? 0.55 : 0.2);
    if (pulseFull && !rm) { ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 18; }
    arrow(ctx, O[0], O[1], tip[0], tip[1], pulseFull ? '#ffffff' : '#ffe14d', 11);
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;

    /* origin dot */
    ctx.beginPath(); ctx.arc(O[0], O[1], 4, 0, 6.28);
    ctx.fillStyle = '#fff'; ctx.fill();
  }

  /* ── Pulse animation ─────────────────────────────────────────────── */
  function animatePulse(canvas) {
    if (_api && _api.reducedMotion && _api.reducedMotion()) {
      drawScene(canvas, { x: true, y: true, z: true }, null, true);
      return;
    }
    var frames = 0;
    function step() {
      if (!canvas.isConnected) return;
      frames++;
      var t = frames / 36;
      drawScene(canvas, { x: true, y: true, z: true }, null, Math.sin(t * Math.PI) > 0.3);
      if (frames < 36) _rAF = requestAnimationFrame(step);
      else drawScene(canvas, { x: true, y: true, z: true }, null, false);
    }
    _rAF = requestAnimationFrame(step);
  }

  /* ── Shake helper ────────────────────────────────────────────────── */
  function shake(el) {
    if (!el || (_api && _api.reducedMotion && _api.reducedMotion())) return;
    el.classList.remove('trvec3d-shaking');
    void el.offsetWidth;
    el.classList.add('trvec3d-shaking');
    var t = setTimeout(function () { if (el) el.classList.remove('trvec3d-shaking'); }, 400);
    _timers.push(t);
  }

  /* ── Format signed number with minus sign ─── */
  function fmt(n) { return n < 0 ? '−' + Math.abs(n) : String(n); }

  /* ── STAGE 1: vector magnitude ───────────────────────────────────── */
  function buildStage1(container) {
    _prob = PROBLEMS[_probIdx % PROBLEMS.length];
    _misses = { x: 0, y: 0, z: 0 };
    _solved = { x: false, y: false, z: false };
    var p = _prob;

    container.innerHTML = '';

    /* heading */
    var h = document.createElement('h3');
    h.className = 'trvec3d-head';
    h.textContent = 'STAGE 1 — VECTOR MAGNITUDE';
    container.appendChild(h);

    var ch = document.createElement('p');
    ch.className = 'trvec3d-chapter';
    ch.textContent = 'Ch 1 \xB7 M&I Notation \xB7 |r⃗| = √(rx\xB2 + ry\xB2 + rz\xB2)';
    container.appendChild(ch);

    /* card */
    var card = document.createElement('div');
    card.className = 'trvec3d-card';

    /* vector display */
    var vdisp = document.createElement('div');
    vdisp.className = 'trvec3d-vec-display';
    vdisp.textContent = 'r⃗ = ⟨' + fmt(p.x) + ', ' + fmt(p.y) + ', ' + fmt(p.z) + '⟩ m';
    card.appendChild(vdisp);

    /* formula */
    var frow = document.createElement('div');
    frow.className = 'trvec3d-formula';
    frow.innerHTML =
      '<span>|r⃗| =</span>' +
      '<span class="trvec3d-sqrt-sym">√</span>' +
      '<span class="trvec3d-radical">' +
        '<input id="trvec3d-inx" class="trvec3d-inp" type="number" placeholder="rx" aria-label="x component" autocomplete="off">' +
        '<span class="trvec3d-sq">2</span>' +
        '<span class="trvec3d-plus"> + </span>' +
        '<input id="trvec3d-iny" class="trvec3d-inp" type="number" placeholder="ry" aria-label="y component" autocomplete="off">' +
        '<span class="trvec3d-sq">2</span>' +
        '<span class="trvec3d-plus"> + </span>' +
        '<input id="trvec3d-inz" class="trvec3d-inp" type="number" placeholder="rz" aria-label="z component" autocomplete="off">' +
        '<span class="trvec3d-sq">2</span>' +
      '</span>';
    card.appendChild(frow);

    /* feedback */
    var fb = document.createElement('div');
    fb.className = 'trvec3d-feedback';
    fb.id = 'trvec3d-fb';
    card.appendChild(fb);

    /* hint */
    var hint = document.createElement('div');
    hint.className = 'trvec3d-hint';
    hint.id = 'trvec3d-hint';
    hint.textContent = 'Hint: the components are the three numbers inside ⟨ ⟩. Type each value including the sign if negative.';
    card.appendChild(hint);

    /* canvas */
    var wrap = document.createElement('div');
    wrap.className = 'trvec3d-vis-wrap';
    var canvas = document.createElement('canvas');
    canvas.id = 'trvec3d-canvas';
    canvas.width = 280; canvas.height = 200;
    canvas.setAttribute('aria-hidden', 'true');
    wrap.appendChild(canvas);
    card.appendChild(wrap);

    /* result */
    var result = document.createElement('div');
    result.className = 'trvec3d-result';
    result.id = 'trvec3d-result';
    card.appendChild(result);

    container.appendChild(card);

    /* buttons */
    var btns = document.createElement('div');
    btns.className = 'trvec3d-btns';

    var nextBtn = document.createElement('button');
    nextBtn.className = 'trvec3d-btn';
    nextBtn.textContent = 'NEXT VECTOR';
    btns.appendChild(nextBtn);

    var gravBtn = document.createElement('button');
    gravBtn.className = 'trvec3d-btn yellow';
    gravBtn.textContent = 'GRAVITY STAGE →';
    btns.appendChild(gravBtn);

    container.appendChild(btns);

    /* initial draw */
    drawScene(canvas, _solved, null, false);

    /* input handler */
    function onInput(axis, inEl) {
      if (_solved[axis]) return;
      var val = parseFloat(inEl.value);
      if (isNaN(val)) { inEl.className = 'trvec3d-inp'; return; }
      if (val === _prob[axis]) {
        _solved[axis] = true;
        inEl.className = 'trvec3d-inp ok';
        inEl.readOnly = true;
        drawScene(canvas, _solved, axis, false);
        var t1 = setTimeout(function () {
          if (canvas.isConnected) drawScene(canvas, _solved, null, false);
        }, 700);
        _timers.push(t1);
        if (_solved.x && _solved.y && _solved.z) onAllSolved(canvas, result);
      } else {
        _misses[axis]++;
        inEl.className = 'trvec3d-inp bad';
        shake(inEl);
        if (_misses[axis] >= 2) {
          var hEl = document.getElementById('trvec3d-hint');
          if (hEl) hEl.className = 'trvec3d-hint show';
        }
        fb.textContent = 'Not quite — check the sign and value.';
        var t2 = setTimeout(function () { if (fb.isConnected) fb.textContent = ''; }, 1600);
        _timers.push(t2);
        if (_api && _api.toast) _api.toast('Check your sign!', 'bad');
      }
    }

    var inx = card.querySelector('#trvec3d-inx');
    var iny = card.querySelector('#trvec3d-iny');
    var inz = card.querySelector('#trvec3d-inz');

    function wire(el, axis) {
      el.addEventListener('change', function () { onInput(axis, el); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter') onInput(axis, el); });
    }
    wire(inx, 'x'); wire(iny, 'y'); wire(inz, 'z');

    nextBtn.addEventListener('click', function () {
      _probIdx = (_probIdx + 1) % PROBLEMS.length;
      cancelAnimationFrame(_rAF); _rAF = 0;
      buildStage1(container);
    });

    gravBtn.addEventListener('click', function () {
      cancelAnimationFrame(_rAF); _rAF = 0;
      buildStage2(container);
    });

    if (_api && _api.typeset) _api.typeset(card);
    inx.focus();
  }

  function onAllSolved(canvas, result) {
    var p = _prob;
    var x2 = p.x * p.x, y2 = p.y * p.y, z2 = p.z * p.z;
    var sum = x2 + y2 + z2;
    /* show the intermediate steps (but NOT the final answer) */
    var steps = [
      '√(' + x2 + ' + ' + y2 + ' + ' + z2 + ')',
      '√' + sum
    ];
    var si = 0;
    result.textContent = steps[0];
    var rm = _api && _api.reducedMotion && _api.reducedMotion();
    var iv = setInterval(function () {
      si++;
      if (!result || !result.isConnected) { clearInterval(iv); return; }
      result.textContent = steps[Math.min(si, steps.length - 1)];
      if (si >= steps.length - 1) {
        clearInterval(iv);
        /* ask the student to type the final magnitude */
        revealMagInput(canvas, result, p);
      }
    }, rm ? 50 : 650);
    _timers.push(iv);
  }

  function revealMagInput(canvas, result, p) {
    /* find the card containing the result element */
    var card = result.parentNode;
    if (!card) return;

    var magRow = document.createElement('div');
    magRow.style.cssText = 'display:flex;align-items:center;gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap;';
    magRow.innerHTML = '<span style="font-family:\'Cambria Math\',serif;font-size:15px;">|r⃗| = </span>';

    var magInp = document.createElement('input');
    magInp.id = 'trvec3d-inmag';
    magInp.type = 'number';
    magInp.className = 'trvec3d-inp';
    magInp.placeholder = '?';
    magInp.setAttribute('aria-label', 'Enter the magnitude of r');
    magInp.setAttribute('step', '1');

    var magUnit = document.createElement('span');
    magUnit.textContent = ' m';
    magUnit.style.cssText = 'font-family:\'Cambria Math\',serif;font-size:15px;';

    var magFb = document.createElement('div');
    magFb.className = 'trvec3d-feedback';
    magFb.style.marginTop = '4px';

    magRow.appendChild(magInp);
    magRow.appendChild(magUnit);
    card.appendChild(magRow);
    card.appendChild(magFb);

    var magMisses = 0;

    function checkMag() {
      var val = parseFloat(magInp.value);
      if (isNaN(val)) { magInp.className = 'trvec3d-inp'; return; }
      if (val === p.mag) {
        magInp.className = 'trvec3d-inp ok';
        magInp.readOnly = true;
        result.textContent = '= ' + p.mag + ' m';
        animatePulse(canvas);
        if (_api && _api.xp) _api.xp(1, 'vec3d-magnitude');
        if (_api && _api.confetti) _api.confetti(result);
        if (_api && _api.toast) _api.toast('|r⃗| = ' + p.mag + ' m ✓', 'ok');
        if (_api && _api.announce) _api.announce('Correct! Magnitude is ' + p.mag + ' metres.');
      } else {
        magMisses++;
        magInp.className = 'trvec3d-inp bad';
        shake(magInp);
        magFb.textContent = 'Not quite — compute √' + (p.x*p.x + p.y*p.y + p.z*p.z) + ' and enter the whole number.';
        var t = setTimeout(function () { if (magFb.isConnected) magFb.textContent = ''; }, 2000);
        _timers.push(t);
        if (_api && _api.toast) _api.toast('Compute the square root!', 'bad');
      }
    }
    magInp.addEventListener('change', checkMag);
    magInp.addEventListener('keydown', function (e) { if (e.key === 'Enter') checkMag(); });
    magInp.focus();
  }

  /* ── STAGE 2: gravity problem ─────────────────────────────────────── */
  /*
     Star m1=4e30 kg at r1=<2,1,1.5>e11 m
     Planet m2=3e24 kg at r2=<3,3.5,-0.5>e11 m
     r_vec = r2-r1 = <1, 2.5, -2> e11 m
     |r| = sqrt(1+6.25+4)*1e11 = sqrt(11.25)*1e11 = 3.354e11 m
     |F| = (6.7e-11)(4e30)(3e24)/(3.354e11)^2 = 7.1e21 N
     r_hat = <0.298, 0.745, -0.596>
  */
  function buildStage2(container) {
    container.innerHTML = '';

    var h = document.createElement('h3');
    h.className = 'trvec3d-head';
    h.textContent = 'STAGE 2 — GRAVITATIONAL FORCE';
    container.appendChild(h);

    var ch = document.createElement('p');
    ch.className = 'trvec3d-chapter';
    ch.textContent = 'Ch 2 \xB7 5-Step Recipe \xB7 F⃗ = −G(m₁m₂/|r⃗|\xB2) r̂';
    container.appendChild(ch);

    /* given info */
    var given = document.createElement('div');
    given.className = 'trvec3d-grav-section';
    given.innerHTML =
      '<div class="trvec3d-grav-head">GIVEN (\xD710\xB9\xB9 m scale)</div>' +
      '<div class="trvec3d-positions">' +
        'Star (obj 1): m₁ = 4\xD710\xB3⁰ kg &nbsp; r⃗₁ = ⟨2, 1, 1.5⟩ \xD710\xB9\xB9 m<br>' +
        'Planet (obj 2): m₂ = 3\xD710\xB2⁴ kg &nbsp; r⃗₂ = ⟨3, 3.5, −0.5⟩ \xD710\xB9\xB9 m<br>' +
        '<span style="font-size:11px">G = 6.7\xD710⁻\xB9\xB9 N\xB7m\xB2/kg\xB2</span>' +
      '</div>';
    container.appendChild(given);

    /* step 1 card */
    var s1 = document.createElement('div');
    s1.className = 'trvec3d-grav-section';
    s1.innerHTML = '<div class="trvec3d-grav-head">STEP 1 — r⃗ = r⃗₂ − r⃗₁</div>' +
      '<div class="trvec3d-grav-formula">Enter components of r⃗ = r⃗₂ − r⃗₁ (\xD710\xB9\xB9 m):</div>';

    /* dr inputs */
    var drAnswers = [1, 2.5, -2];
    var drInputs = [];
    var drSolved = [false, false, false];
    var drMisses = [0, 0, 0];

    var drRow = document.createElement('div');
    drRow.style.cssText = 'display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:8px;';
    drRow.innerHTML = '<span style="font-family:\'Cambria Math\',serif;font-size:15px;">r⃗ = ⟨</span>';
    var drNames = ['rx', 'ry', 'rz'];
    drAnswers.forEach(function (ans, i) {
      var inp = document.createElement('input');
      inp.type = 'number'; inp.className = 'trvec3d-grav-inp';
      inp.placeholder = drNames[i]; inp.setAttribute('step', '0.5');
      inp.setAttribute('aria-label', 'r-vector ' + drNames[i] + ' component');
      drInputs.push(inp); drRow.appendChild(inp);
      if (i < 2) {
        var sep = document.createElement('span');
        sep.textContent = ','; sep.style.fontSize = '16px';
        drRow.appendChild(sep);
      }
    });
    var cb = document.createElement('span');
    cb.textContent = '⟩'; cb.style.cssText = 'font-family:\'Cambria Math\',serif;font-size:15px;';
    drRow.appendChild(cb);
    s1.appendChild(drRow);

    var drFb = document.createElement('div');
    drFb.className = 'trvec3d-feedback';
    s1.appendChild(drFb);

    var drHint = document.createElement('div');
    drHint.className = 'trvec3d-hint';
    drHint.textContent = 'Hint: subtract component-by-component. rx = 3−2 = 1, ry = 3.5−1 = 2.5, rz = −0.5−1.5 = −2. ALWAYS: r⃗ = r⃗₂ − r⃗₁.';
    s1.appendChild(drHint);

    var s1result = document.createElement('div');
    s1result.className = 'trvec3d-result';
    s1result.style.cssText = 'font-size:12px; min-height:28px;';
    s1.appendChild(s1result);
    container.appendChild(s1);

    /* steps 2-5 container, hidden initially */
    var steps25 = document.createElement('div');
    steps25.style.display = 'none';
    container.appendChild(steps25);

    /* back button */
    var btns = document.createElement('div');
    btns.className = 'trvec3d-btns';
    var backBtn = document.createElement('button');
    backBtn.className = 'trvec3d-btn';
    backBtn.textContent = '← BACK TO STAGE 1';
    backBtn.addEventListener('click', function () {
      cancelAnimationFrame(_rAF); _rAF = 0;
      buildStage1(container);
    });
    btns.appendChild(backBtn);
    container.appendChild(btns);

    /* wire dr inputs */
    function checkDr(i) {
      if (drSolved[i]) return;
      var val = parseFloat(drInputs[i].value);
      if (isNaN(val)) { drInputs[i].className = 'trvec3d-grav-inp'; return; }
      if (Math.abs(val - drAnswers[i]) < 0.01) {
        drSolved[i] = true;
        drInputs[i].className = 'trvec3d-grav-inp ok';
        drInputs[i].readOnly = true;
        if (drSolved[0] && drSolved[1] && drSolved[2]) {
          s1result.textContent = 'r⃗ = ⟨1, 2.5, −2⟩ \xD710\xB9\xB9 m ✓';
          s1result.style.color = '#39ff88';
          if (_api && _api.xp) _api.xp(1, 'vec3d-dr');
          if (_api && _api.toast) _api.toast('r⃗ = ⟨1, 2.5, −2⟩ ✓', 'ok');
          buildSteps25(steps25);
          steps25.style.display = 'block';
        }
      } else {
        drMisses[i]++;
        drInputs[i].className = 'trvec3d-grav-inp bad';
        shake(drInputs[i]);
        if (drMisses[i] >= 2) drHint.className = 'trvec3d-hint show';
        drFb.textContent = 'Try r⃗₂ − r⃗₁ (final minus initial).';
        var t = setTimeout(function () { if (drFb.isConnected) drFb.textContent = ''; }, 1800);
        _timers.push(t);
        if (_api && _api.toast) _api.toast('Final − initial!', 'bad');
      }
    }
    drInputs.forEach(function (inp, i) {
      inp.addEventListener('change', function () { checkDr(i); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') checkDr(i); });
    });

    drInputs[0].focus();
  }

  function buildSteps25(container) {
    container.innerHTML = '';

    /* step 2: |r⃗| */
    var s2 = document.createElement('div');
    s2.className = 'trvec3d-grav-section';
    s2.innerHTML = '<div class="trvec3d-grav-head">STEP 2 — COMPUTE |r⃗|</div>' +
      '<div class="trvec3d-grav-formula">' +
        '|r⃗| = √(1\xB2 + 2.5\xB2 + (−2)\xB2) \xD710\xB9\xB9 m' +
      '</div>';

    var magRow = document.createElement('div');
    magRow.style.cssText = 'display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:8px;';
    magRow.innerHTML = '<span style="font-family:\'Cambria Math\',serif;font-size:15px;">|r⃗| ≈ </span>';
    var magInp = document.createElement('input');
    magInp.type = 'number'; magInp.className = 'trvec3d-grav-inp';
    magInp.placeholder = '?'; magInp.setAttribute('step', '0.001');
    magInp.setAttribute('aria-label', 'magnitude of r in units of 1e11 m');
    var magUnit = document.createElement('span');
    magUnit.textContent = '\xD710\xB9\xB9 m';
    magUnit.style.cssText = 'font-family:\'Cambria Math\',serif;font-size:13px;color:var(--tv-dim);';
    magRow.appendChild(magInp); magRow.appendChild(magUnit);
    s2.appendChild(magRow);

    var magFb = document.createElement('div');
    magFb.className = 'trvec3d-feedback'; s2.appendChild(magFb);
    var magHint = document.createElement('div');
    magHint.className = 'trvec3d-hint';
    magHint.textContent = 'Hint: 1\xB2=1, 2.5\xB2=6.25, (−2)\xB2=4 → sum=11.25 → √11.25 ≈ 3.354.';
    s2.appendChild(magHint);
    var magMisses = 0;
    container.appendChild(s2);

    /* steps 3-5 revealed after step 2 */
    var steps35 = document.createElement('div');
    steps35.style.display = 'none';
    container.appendChild(steps35);

    function checkMag() {
      var val = parseFloat(magInp.value);
      if (isNaN(val)) { magInp.className = 'trvec3d-grav-inp'; return; }
      if (Math.abs(val - 3.354) < 0.03) {
        magInp.className = 'trvec3d-grav-inp ok'; magInp.readOnly = true;
        if (_api && _api.xp) _api.xp(1, 'vec3d-mag-grav');
        if (_api && _api.toast) _api.toast('|r⃗| ≈ 3.354\xD710\xB9\xB9 m ✓', 'ok');
        buildSteps35(steps35);
        steps35.style.display = 'block';
      } else {
        magMisses++;
        magInp.className = 'trvec3d-grav-inp bad'; shake(magInp);
        if (magMisses >= 2) magHint.className = 'trvec3d-hint show';
        magFb.textContent = 'Enter mantissa to 3 sig figs, e.g. 3.354.';
        var t = setTimeout(function () { if (magFb.isConnected) magFb.textContent = ''; }, 1800);
        _timers.push(t);
      }
    }
    magInp.addEventListener('change', checkMag);
    magInp.addEventListener('keydown', function (e) { if (e.key === 'Enter') checkMag(); });
    magInp.focus();
  }

  function buildSteps35(container) {
    container.innerHTML = '';

    /* step 3: |F| */
    var s3 = document.createElement('div');
    s3.className = 'trvec3d-grav-section';
    s3.innerHTML = '<div class="trvec3d-grav-head">STEP 3 — |F⃗| = G m₁m₂ / |r⃗|\xB2</div>' +
      '<div class="trvec3d-grav-formula">' +
        'G = 6.7\xD710⁻\xB9\xB9, &nbsp; m₁ = 4\xD710\xB3⁰ kg, &nbsp; m₂ = 3\xD710\xB2⁴ kg<br>' +
        '|r⃗| ≈ 3.354\xD710\xB9\xB9 m &nbsp; ⇒ &nbsp; |r⃗|\xB2 ≈ 1.125\xD710\xB2\xB3 m\xB2' +
      '</div>';

    var fRow = document.createElement('div');
    fRow.style.cssText = 'display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:8px;';
    fRow.innerHTML = '<span style="font-family:\'Cambria Math\',serif;font-size:15px;">|F⃗| ≈ </span>';
    var fInp = document.createElement('input');
    fInp.type = 'number'; fInp.className = 'trvec3d-grav-inp';
    fInp.placeholder = '?'; fInp.setAttribute('step', '0.1');
    fInp.setAttribute('aria-label', 'force magnitude mantissa times 1e21 N');
    var fUnit = document.createElement('span');
    fUnit.textContent = '\xD710\xB2\xB9 N';
    fUnit.style.cssText = 'font-family:\'Cambria Math\',serif;font-size:13px;color:var(--tv-dim);';
    fRow.appendChild(fInp); fRow.appendChild(fUnit);
    s3.appendChild(fRow);

    var fFb = document.createElement('div');
    fFb.className = 'trvec3d-feedback'; s3.appendChild(fFb);
    var fHint = document.createElement('div');
    fHint.className = 'trvec3d-hint';
    fHint.textContent = 'Hint: numerator = (6.7\xD710⁻\xB9\xB9)(4\xD710\xB3⁰)(3\xD710\xB2⁴) = 8.04\xD710⁴⁴. Divide by 1.125\xD710\xB2\xB3 ≈ 7.1\xD710\xB2\xB9 N.';
    s3.appendChild(fHint);
    var fMisses = 0;
    container.appendChild(s3);

    /* steps 4-5 */
    var steps45 = document.createElement('div');
    steps45.style.display = 'none';
    container.appendChild(steps45);

    function checkF() {
      var val = parseFloat(fInp.value);
      if (isNaN(val)) { fInp.className = 'trvec3d-grav-inp'; return; }
      if (Math.abs(val - 7.1) < 0.25) {
        fInp.className = 'trvec3d-grav-inp ok'; fInp.readOnly = true;
        if (_api && _api.xp) _api.xp(1, 'vec3d-Fmag');
        if (_api && _api.toast) _api.toast('|F⃗| ≈ 7.1\xD710\xB2\xB9 N ✓', 'ok');
        buildSteps45(steps45, container);
        steps45.style.display = 'block';
      } else {
        fMisses++;
        fInp.className = 'trvec3d-grav-inp bad'; shake(fInp);
        if (fMisses >= 2) fHint.className = 'trvec3d-hint show';
        fFb.textContent = 'Enter the mantissa (e.g. 7.1). Units \xD710\xB2\xB9 N shown.';
        var t = setTimeout(function () { if (fFb.isConnected) fFb.textContent = ''; }, 1800);
        _timers.push(t);
      }
    }
    fInp.addEventListener('change', checkF);
    fInp.addEventListener('keydown', function (e) { if (e.key === 'Enter') checkF(); });
    fInp.focus();
  }

  function buildSteps45(container, outerContainer) {
    container.innerHTML = '';

    /* step 4: unit vector */
    var s4 = document.createElement('div');
    s4.className = 'trvec3d-grav-section';
    s4.innerHTML = '<div class="trvec3d-grav-head">STEP 4 — UNIT VECTOR r̂ = r⃗/|r⃗|</div>' +
      '<div class="trvec3d-grav-formula">r⃗ = ⟨1, 2.5, −2⟩ \xD710\xB9\xB9 m &nbsp; \xF7 &nbsp; 3.354\xD710\xB9\xB9 m</div>';

    var rhatBox = document.createElement('div');
    rhatBox.className = 'trvec3d-step active';
    rhatBox.innerHTML =
      'r̂ ≈ ⟨<span style="color:var(--tv-cyan)">0.298</span>, ' +
      '<span style="color:var(--tv-mag)">0.745</span>, ' +
      '<span style="color:var(--tv-yel)">−0.596</span>⟩' +
      '<br><span style="font-size:11px;color:var(--tv-dim)">Direction from star toward planet.</span>';
    s4.appendChild(rhatBox);

    var negRhat = document.createElement('div');
    negRhat.className = 'trvec3d-step';
    negRhat.innerHTML =
      '−r̂ ≈ ⟨−0.298, −0.745, 0.596⟩' +
      '<br><span style="font-size:11px;color:var(--tv-dim)">Force on planet points TOWARD star (−r̂).</span>';
    s4.appendChild(negRhat);
    container.appendChild(s4);

    /* step 5: final force */
    var s5 = document.createElement('div');
    s5.className = 'trvec3d-grav-section';
    s5.innerHTML = '<div class="trvec3d-grav-head">STEP 5 — F⃗ = |F⃗| \xD7 (−r̂)</div>' +
      '<div class="trvec3d-grav-formula">' +
        'F⃗<sub>on planet by star</sub><br>' +
        '&nbsp; ≈ ⟨−2.13, −5.33, 4.26⟩ \xD710\xB2\xB9 N' +
        '<br><span style="font-size:12px;color:var(--tv-dim)">' +
          '3rd Law: F⃗<sub>on star by planet</sub> = ⟨2.13, 5.33, −4.26⟩ \xD710\xB2\xB9 N' +
        '</span>' +
      '</div>';
    container.appendChild(s5);

    /* key reminders */
    var reminder = document.createElement('div');
    reminder.className = 'trvec3d-step done';
    reminder.innerHTML =
      '<span style="font-family:\'Press Start 2P\',monospace;font-size:8px;color:var(--tv-yel)">KEY RULES:</span>' +
      '<br>• Magnitude is always a positive scalar.' +
      '<br>• |r⃗| = center-to-center distance.' +
      '<br>• Direction of F⃗ on 2 by 1 is −r̂ (toward obj 1).' +
      '<br>• Inverse square: 2\xD7 distance ⇒ \xBC the force.' +
      '<br>• Both masses doubled ⇒ 4\xD7 the force.';
    container.appendChild(reminder);

    /* done banner */
    var doneBanner = document.createElement('div');
    doneBanner.className = 'trvec3d-result';
    doneBanner.textContent = 'ALL 5 STEPS DONE! ✓';
    container.appendChild(doneBanner);

    /* practice again — capture root at build time; guard against unmount race */
    var _capturedRoot = outerContainer;
    var practiceBtn = document.createElement('button');
    practiceBtn.className = 'trvec3d-btn primary';
    practiceBtn.style.marginTop = '14px';
    practiceBtn.textContent = 'PRACTICE ANOTHER VECTOR';
    practiceBtn.addEventListener('click', function () {
      if (!_host || !_capturedRoot || !_capturedRoot.isConnected) return;
      _probIdx = (_probIdx + 1) % PROBLEMS.length;
      cancelAnimationFrame(_rAF); _rAF = 0;
      buildStage1(_capturedRoot);
    });
    container.appendChild(practiceBtn);

    if (_api && _api.xp) _api.xp(1, 'vec3d-gravity-complete');
    if (_api && _api.confetti) _api.confetti(doneBanner);
    if (_api && _api.announce) _api.announce('Gravity problem complete! Force magnitude 7.1 times 10 to the 21 Newtons.');
  }

  /* ── Register ────────────────────────────────────────────────────── */
  (window.TRAINING_MODULES = window.TRAINING_MODULES || []).push({
    id: 'vec3d',
    title: '3D VECTOR MAG',
    icon: '📏',
    blurb: 'Compute |r⃗| step-by-step with live 3D viz + gravity extension',
    chapter: 'Ch 1–2',

    mount: function (host, api) {
      _host = host;
      _api = api || {};
      injectCSS();
      var root = document.createElement('div');
      root.id = 'trvec3d-root';
      host.appendChild(root);
      _probIdx = Math.floor(Math.random() * PROBLEMS.length);
      buildStage1(root);
    },

    unmount: function () {
      cancelAnimationFrame(_rAF); _rAF = 0;
      _timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
      _timers = [];
      _host = null; _api = null; _prob = null;
    }
  });

}());
