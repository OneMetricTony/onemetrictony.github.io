/* tr-units.js — Unit Cancellation Drag & Drop trainer for CPCS110 Physics Arcade.
   Plain browser JS (ES2017 max), IIFE, no modules. Registers on window.TRAINING_MODULES.
   Drag = pointer events + setPointerCapture + floating ghost (SPEC §5 vz- pattern). */
(function(){
  'use strict';

  /* ---------- conversion factor catalog (each ratio === 1; values from W1.2 slides) ---------- */
  /* tn/tu = top number / top unit pieces, bn/bu = bottom; inv = id of the flipped tile.
     Physics check: 1 km/h = 1/3.6 m/s ≈ 0.278 m/s; 1 mi = 1.609 km; 1 mi/h = 0.447 m/s;
     1 m = 3.281 ft = 100 cm = 1000 mm; 1 km = 1000 m; 1 h = 3600 s. */
  var FACTORS = {
    kmh_ms: { tn:'0.278', tu:[{t:'m/s', k:'m/s'}],  bn:'1',     bu:[{t:'km/h', k:'km/h'}], inv:'ms_kmh' },
    ms_kmh: { tn:'1',     tu:[{t:'km/h',k:'km/h'}], bn:'0.278', bu:[{t:'m/s',  k:'m/s'}],  inv:'kmh_ms' },
    mi_km:  { tn:'1',     tu:[{t:'mi',  k:'mi'}],   bn:'1.609', bu:[{t:'km',   k:'km'}],   inv:'km_mi'  },
    km_mi:  { tn:'1.609', tu:[{t:'km',  k:'km'}],   bn:'1',     bu:[{t:'mi',   k:'mi'}],   inv:'mi_km'  },
    m_km:   { tn:'1000',  tu:[{t:'m',   k:'m'}],    bn:'1',     bu:[{t:'km',   k:'km'}],   inv:'km_m'   },
    km_m:   { tn:'1',     tu:[{t:'km',  k:'km'}],   bn:'1000',  bu:[{t:'m',    k:'m'}],    inv:'m_km'   },
    cm_m:   { tn:'100',   tu:[{t:'cm',  k:'cm'}],   bn:'1',     bu:[{t:'m',    k:'m'}],    inv:'m_cm'   },
    m_cm:   { tn:'1',     tu:[{t:'m',   k:'m'}],    bn:'100',   bu:[{t:'cm',   k:'cm'}],   inv:'cm_m'   },
    m_mm:   { tn:'1',     tu:[{t:'m',   k:'m'}],    bn:'1000',  bu:[{t:'mm',   k:'mm'}],   inv:'mm_m'   },
    mm_m:   { tn:'1000',  tu:[{t:'mm',  k:'mm'}],   bn:'1',     bu:[{t:'m',    k:'m'}],    inv:'m_mm'   },
    ft_m:   { tn:'3.281', tu:[{t:'ft',  k:'ft'}],   bn:'1',     bu:[{t:'m',    k:'m'}],    inv:'m_ft'   },
    m_ft:   { tn:'1',     tu:[{t:'m',   k:'m'}],    bn:'3.281', bu:[{t:'ft',   k:'ft'}],   inv:'ft_m'   },
    s_h:    { tn:'3600',  tu:[{t:'s',   k:'s'}],    bn:'1',     bu:[{t:'h',    k:'h'}],    inv:'h_s'    },
    h_s:    { tn:'1',     tu:[{t:'h',   k:'h'}],    bn:'3600',  bu:[{t:'s',    k:'s'}],    inv:'s_h'    },
    mph_ms: { tn:'0.447', tu:[{t:'m/s', k:'m/s'}],  bn:'1',     bu:[{t:'mi/h', k:'mi/h'}], inv:'ms_mph' },
    ms_mph: { tn:'1',     tu:[{t:'mi/h',k:'mi/h'}], bn:'0.447', bu:[{t:'m/s',  k:'m/s'}],  inv:'mph_ms' }
  };

  /* ---------- problem set (teaching drills; results use exact factors, 3 sig figs) ---------- */
  /* vn/vu = starting value; steps fill slots left→right; target 'value' strikes the start
     value's unit, 'prev' strikes the surviving top unit of the previously placed tile. */
  var PROBLEMS = [
    { id:'p1', prompt:'Convert <b>3 km/h</b> to <b>m/s</b>',
      vn:'3', vu:[{t:'km/h', k:'km/h'}],
      steps:[{ f:'kmh_ms', cancel:'km/h', target:'value',
        hint:'km/h sits on TOP of the value, so pick the tile with <b>km/h on the BOTTOM</b> — it cancels and only m/s survives.' }],
      resultHtml:'0.833 m/s',
      bank:['kmh_ms','ms_kmh','m_km','s_h'] },
    { id:'p2', prompt:'Convert <b>90 km/h</b> to <b>mi/h</b>',
      vn:'90', vu:[{t:'km', k:'km'},{t:'/h', k:'h'}],
      steps:[{ f:'mi_km', cancel:'km', target:'value',
        hint:'Only the <b>km</b> has to die — the /h survives. Pick the tile with <b>km on the BOTTOM</b> and mi on top.' }],
      resultHtml:'55.9 mi/h',
      bank:['mi_km','km_mi','kmh_ms','ms_mph'] },
    { id:'p3', prompt:'Convert <b>4.7 km</b> to <b>m</b> <i>(lecture echo)</i>',
      vn:'4.7', vu:[{t:'km', k:'km'}],
      steps:[{ f:'m_km', cancel:'km', target:'value',
        hint:'You want km gone and m left over: <b>1000 m on top, 1 km on the bottom</b>.' }],
      resultHtml:'4.7 &times; 10<sup>3</sup> m',
      bank:['m_km','km_m','cm_m','h_s'] },
    { id:'p4', prompt:'Two-step chain: convert <b>0.35 km</b> to <b>cm</b>',
      vn:'0.35', vu:[{t:'km', k:'km'}],
      steps:[
        { f:'m_km', cancel:'km', target:'value',
          hint:'No km→cm tile exists, so chain it: first kill <b>km</b> with (1000 m)/(1 km).' },
        { f:'cm_m', cancel:'m', target:'prev',
          hint:'Now the leftover unit is <b>m</b> (top of the first tile). Cancel it with <b>m on the BOTTOM</b>: (100 cm)/(1 m).' }],
      resultHtml:'3.5 &times; 10<sup>4</sup> cm',
      bank:['m_km','cm_m','km_m','m_cm'] },
    { id:'p5', prompt:'Metric &rarr; imperial chain: convert <b>1620 mm</b> to <b>ft</b>',
      vn:'1620', vu:[{t:'mm', k:'mm'}],
      steps:[
        { f:'m_mm', cancel:'mm', target:'value',
          hint:'First kill <b>mm</b>: you need mm on the BOTTOM — (1 m)/(1000 mm).' },
        { f:'ft_m', cancel:'m', target:'prev',
          hint:'Now cancel the surviving <b>m</b> with (3.281 ft)/(1 m).' }],
      resultHtml:'5.32 ft',
      bank:['m_mm','ft_m','mm_m','m_ft'] },
    { id:'p6', prompt:'Convert <b>65 mi/h</b> to <b>m/s</b> (highway speed!)',
      vn:'65', vu:[{t:'mi/h', k:'mi/h'}],
      steps:[{ f:'mph_ms', cancel:'mi/h', target:'value',
        hint:'One tile does it: <b>mi/h on the BOTTOM</b>, m/s on top — (0.447 m/s)/(1 mi/h).' }],
      resultHtml:'29.1 m/s',
      bank:['mph_ms','ms_mph','mi_km','kmh_ms'] },
    { id:'p7', prompt:'Convert <b>2.5 h</b> to <b>s</b>',
      vn:'2.5', vu:[{t:'h', k:'h'}],
      steps:[{ f:'s_h', cancel:'h', target:'value',
        hint:'Hours must cancel: <b>h on the BOTTOM</b> — (3600 s)/(1 h).' }],
      resultHtml:'9.0 &times; 10<sup>3</sup> s',
      bank:['s_h','h_s','m_km','cm_m'] },
    { id:'p8', prompt:'Convert <b>100 km/h</b> to <b>m/s</b>',
      vn:'100', vu:[{t:'km/h', k:'km/h'}],
      steps:[{ f:'kmh_ms', cancel:'km/h', target:'value',
        hint:'Same trick as before: <b>km/h on the BOTTOM</b> cancels, m/s survives.' }],
      resultHtml:'27.8 m/s',
      bank:['kmh_ms','ms_kmh','mi_km','s_h'] }
  ];

  /* ---------- module state ---------- */
  var S = null; /* set in mount, nulled in unmount */

  function rm(){ return !!(S && S.api && S.api.reducedMotion && S.api.reducedMotion()); }
  function later(fn, ms){
    if(!S) return;
    if(rm()) ms = 0;
    var t = setTimeout(function(){ if(S){ S.timers = S.timers.filter(function(x){ return x !== t; }); fn(); } }, ms);
    S.timers.push(t);
  }
  function toast(msg, kind){ if(S && S.api && S.api.toast) S.api.toast(msg, kind); }
  function announce(msg){ if(S && S.api && S.api.announce) S.api.announce(msg); }

  /* ---------- CSS (injected once; every selector namespaced .tr-units-) ---------- */
  function injectCSS(){
    if(document.getElementById('tr-style-units')) return;
    var st = document.createElement('style');
    st.id = 'tr-style-units';
    st.textContent = [
      '.tr-units-wrap{ --tru-line:#2a2a55; color:var(--ink); font-size:15px; max-width:560px; margin:0 auto; padding:4px 2px 18px; }',
      '.tr-units-card{ background:var(--panel2); border:2px solid var(--tru-line); border-radius:14px; padding:12px 14px; margin-bottom:12px; }',
      '.tr-units-bt{ font-family:"Press Start 2P",monospace; font-size:9px; color:var(--cyan); letter-spacing:1px; margin-bottom:8px; }',
      '.tr-units-btext{ font-size:13px; color:var(--dim); line-height:1.5; }',
      '.tr-units-bmath{ text-align:center; margin:10px 0 6px; min-height:34px; color:var(--ink); overflow-x:auto; }',
      '.tr-units-prog{ font-family:"Press Start 2P",monospace; font-size:8px; color:var(--dim); margin:0 2px 6px; display:flex; justify-content:space-between; }',
      '.tr-units-prog b{ color:var(--yellow); font-weight:normal; }',
      '.tr-units-prompt{ font-size:14px; margin:0 2px 10px; line-height:1.45; }',
      '.tr-units-prompt b{ color:var(--cyan); }',
      '.tr-units-prompt i{ color:var(--dim); font-size:12px; }',
      /* chain row */
      '.tr-units-chain{ display:flex; flex-wrap:wrap; align-items:center; gap:8px; background:var(--panel); border:2px solid var(--tru-line); border-radius:14px; padding:14px 10px; margin-bottom:10px; font-family:"Cambria Math","Times New Roman",serif; font-size:19px; justify-content:center; }',
      '.tr-units-val{ white-space:nowrap; }',
      '.tr-units-op{ color:var(--dim); font-size:17px; }',
      '.tr-units-slot{ min-width:84px; min-height:64px; border:2px dashed #3a3a6e; border-radius:12px; background:var(--slot); display:flex; align-items:center; justify-content:center; padding:4px 6px; transition:border-color .2s, box-shadow .2s; }',
      '.tr-units-slot.tr-units-active{ border-color:var(--cyan); box-shadow:0 0 12px rgba(33,230,255,.35); }',
      '.tr-units-slot.tr-units-hover{ border-color:var(--green); box-shadow:0 0 14px rgba(57,255,136,.55); }',
      '.tr-units-slot.tr-units-filled{ border-style:solid; border-color:var(--green); box-shadow:0 0 8px rgba(57,255,136,.25); }',
      '.tr-units-slothint{ font-family:"Press Start 2P",monospace; font-size:7px; color:#3a3a6e; }',
      '.tr-units-res{ color:var(--green); white-space:nowrap; }',
      '.tr-units-res.tr-units-reveal{ text-shadow:0 0 12px rgba(57,255,136,.8); }',
      /* fractions */
      '.tr-units-frac{ display:inline-flex; flex-direction:column; align-items:center; line-height:1.3; vertical-align:middle; }',
      '.tr-units-ftop{ border-bottom:1.5px solid currentColor; padding:0 7px 2px; white-space:nowrap; }',
      '.tr-units-fbot{ padding:2px 7px 0; white-space:nowrap; }',
      /* unit pieces + cancellation fx */
      '.tr-units-u{ position:relative; display:inline-block; font-style:normal; font-weight:inherit; transition:opacity .45s ease, transform .45s ease, color .25s; }',
      '.tr-units-u.tr-units-cxl{ color:var(--yellow); text-shadow:0 0 9px rgba(255,225,77,.9); }',
      '.tr-units-u.tr-units-cxl::after{ content:""; position:absolute; left:-12%; right:-12%; top:48%; height:2px; background:var(--red); box-shadow:0 0 7px var(--red); transform:rotate(-16deg); animation:trUnitsStrike .28s ease-out; }',
      '.tr-units-u.tr-units-gone{ opacity:0; transform:translate(5px,-16px) rotate(-14deg) scale(.75); }',
      '.tr-units-u.tr-units-goneRM{ opacity:.18; }',
      '.tr-units-u.tr-units-struckv{ color:var(--dim); }',
      '.tr-units-u.tr-units-struckv::after{ content:""; position:absolute; left:-12%; right:-12%; top:48%; height:2px; background:var(--red); opacity:.85; transform:rotate(-16deg); }',
      '@keyframes trUnitsStrike{ from{ transform:rotate(-16deg) scaleX(0); } to{ transform:rotate(-16deg) scaleX(1); } }',
      /* bank tiles */
      '.tr-units-bankhead{ font-family:"Press Start 2P",monospace; font-size:8px; color:var(--magenta); margin:2px 2px 8px; }',
      '.tr-units-bank{ display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:10px; margin-bottom:12px; }',
      '.tr-units-tile{ touch-action:none; user-select:none; -webkit-user-select:none; cursor:grab; background:linear-gradient(160deg,#12122b,#0c0c1e); border:2px solid var(--tru-line); border-radius:12px; min-height:64px; display:flex; align-items:center; justify-content:center; padding:8px 6px; font-family:"Cambria Math","Times New Roman",serif; font-size:17px; color:var(--ink); transition:border-color .2s, opacity .2s; }',
      '.tr-units-tile:active{ border-color:var(--cyan); }',
      '.tr-units-tile.tr-units-placed{ visibility:hidden; }',
      '.tr-units-tile.tr-units-shake{ animation:trUnitsShake .35s; border-color:var(--red); }',
      '@keyframes trUnitsShake{ 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }',
      '.tr-units-ghost{ position:fixed; margin:0; z-index:10000; pointer-events:none; opacity:.92; border-color:var(--cyan); box-shadow:0 6px 22px rgba(33,230,255,.4); cursor:grabbing; }',
      '.tr-units-float{ position:fixed; inset:0; pointer-events:none; z-index:9999; }',
      /* hint + recap + buttons */
      '.tr-units-hint{ display:none; background:rgba(255,225,77,.07); border:1.5px dashed var(--yellow); border-radius:12px; padding:10px 12px; font-size:13px; color:var(--ink); line-height:1.5; margin-bottom:12px; }',
      '.tr-units-hint.tr-units-on{ display:block; }',
      '.tr-units-hint b{ color:var(--yellow); }',
      '.tr-units-recap{ display:none; background:var(--panel2); border:2px solid var(--green); border-radius:14px; padding:12px 10px; margin-bottom:12px; }',
      '.tr-units-recap.tr-units-on{ display:block; }',
      '.tr-units-recaphead{ font-family:"Press Start 2P",monospace; font-size:8px; color:var(--green); margin-bottom:8px; }',
      '.tr-units-recapline{ display:flex; flex-wrap:wrap; align-items:center; gap:7px; justify-content:center; font-family:"Cambria Math","Times New Roman",serif; font-size:17px; }',
      '.tr-units-next{ display:none; width:100%; min-height:52px; border-radius:14px; border:2px solid var(--cyan); background:rgba(33,230,255,.12); color:var(--cyan); font-family:"Press Start 2P",monospace; font-size:11px; cursor:pointer; }',
      '.tr-units-next.tr-units-on{ display:block; }',
      '.tr-units-next:active{ transform:scale(.98); }',
      '.tr-units-done{ text-align:center; padding:26px 10px; }',
      '.tr-units-done h3{ font-family:"Press Start 2P",monospace; font-size:13px; color:var(--green); margin:0 0 14px; }',
      '.tr-units-done p{ color:var(--dim); font-size:13px; line-height:1.6; }',
      '@media (prefers-reduced-motion: reduce){',
      '  .tr-units-u{ transition:none; }',
      '  .tr-units-u.tr-units-cxl::after{ animation:none; }',
      '  .tr-units-tile.tr-units-shake{ animation:none; }',
      '}'
    ].join('\n');
    document.head.appendChild(st);
  }

  /* ---------- small renderers ---------- */
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function unitsHTML(pieces, struck){
    struck = struck || [];
    return pieces.map(function(p){
      var isS = struck.indexOf(p.k) >= 0;
      return '<b class="tr-units-u' + (isS ? ' tr-units-struckv' : '') + '" data-k="' + esc(p.k) + '">' + esc(p.t) + '</b>';
    }).join('');
  }
  function fracHTML(fid, topStruck, botStruck){
    var f = FACTORS[fid];
    return '<span class="tr-units-frac">' +
      '<span class="tr-units-ftop">' + esc(f.tn) + '&nbsp;' + unitsHTML(f.tu, topStruck ? [topStruck] : []) + '</span>' +
      '<span class="tr-units-fbot">' + esc(f.bn) + '&nbsp;' + unitsHTML(f.bu, botStruck ? [botStruck] : []) + '</span>' +
      '</span>';
  }
  function shuffle(a){
    a = a.slice();
    for(var i = a.length - 1; i > 0; i--){
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- problem rendering ---------- */
  function renderProblem(){
    var p = PROBLEMS[S.idx];
    S.step = 0; S.misses = 0; S.busy = false; S.solved = false;
    S.els.prog.innerHTML = '<span>DRILL <b>' + (S.idx + 1) + '/' + PROBLEMS.length + '</b></span><span>SOLVED <b>' + S.solvedCount + '</b></span>';
    S.els.prompt.innerHTML = p.prompt;
    S.els.hint.className = 'tr-units-hint'; S.els.hint.innerHTML = '';
    S.els.recap.className = 'tr-units-recap'; S.els.recap.innerHTML = '';
    S.els.next.className = 'tr-units-next';

    /* chain: value × slot (× slot) = ? */
    var c = S.els.chain;
    c.innerHTML = '';
    var val = document.createElement('span');
    val.className = 'tr-units-val';
    val.innerHTML = esc(p.vn) + '&nbsp;' + unitsHTML(p.vu);
    c.appendChild(val);
    S.valueEl = val;
    S.slotEls = [];
    for(var i = 0; i < p.steps.length; i++){
      var op = document.createElement('span');
      op.className = 'tr-units-op'; op.textContent = '×';
      c.appendChild(op);
      var sl = document.createElement('div');
      sl.className = 'tr-units-slot' + (i === 0 ? ' tr-units-active' : '');
      sl.dataset.idx = String(i);
      sl.innerHTML = '<span class="tr-units-slothint">DROP</span>';
      c.appendChild(sl);
      S.slotEls.push(sl);
    }
    var eq = document.createElement('span');
    eq.className = 'tr-units-op'; eq.textContent = '=';
    c.appendChild(eq);
    var res = document.createElement('span');
    res.className = 'tr-units-res'; res.textContent = '?';
    c.appendChild(res);
    S.resEl = res;

    /* bank */
    var bank = S.els.bank;
    bank.innerHTML = '';
    shuffle(p.bank).forEach(function(fid){
      var tile = document.createElement('div');
      tile.className = 'tr-units-tile';
      tile.dataset.f = fid;
      tile.innerHTML = fracHTML(fid);
      tile.addEventListener('pointerdown', onDown);
      tile.addEventListener('pointermove', onMove);
      tile.addEventListener('pointerup', onUp);
      tile.addEventListener('pointercancel', onCancel);
      bank.appendChild(tile);
    });
    announce('Drill ' + (S.idx + 1) + ': ' + S.els.prompt.textContent);
  }

  /* ---------- drag machinery (pointer events + capture + ghost) ---------- */
  function onDown(e){
    if(!S || S.drag || S.busy || S.solved) return;
    var tile = e.currentTarget;
    if(tile.classList.contains('tr-units-placed')) return;
    e.preventDefault();
    var r = tile.getBoundingClientRect();
    var g = tile.cloneNode(true);
    g.classList.add('tr-units-ghost');
    g.style.width = r.width + 'px';
    g.style.height = r.height + 'px';
    g.style.left = r.left + 'px';
    g.style.top = r.top + 'px';
    S.float.appendChild(g);
    tile.style.opacity = '.25';
    S.drag = { tile: tile, ghost: g, offX: e.clientX - r.left, offY: e.clientY - r.top };
    try{ tile.setPointerCapture(e.pointerId); }catch(_e){}
  }
  function onMove(e){
    if(!S || !S.drag) return;
    var d = S.drag;
    d.ghost.style.left = (e.clientX - d.offX) + 'px';
    d.ghost.style.top = (e.clientY - d.offY) + 'px';
    var hit = slotAt(e.clientX, e.clientY);
    S.slotEls.forEach(function(sl){ sl.classList.toggle('tr-units-hover', sl === hit); });
  }
  function onUp(e){
    if(!S || !S.drag) return;
    var d = S.drag;
    S.drag = null;
    if(d.ghost.parentNode) d.ghost.parentNode.removeChild(d.ghost);
    d.tile.style.opacity = '';
    S.slotEls.forEach(function(sl){ sl.classList.remove('tr-units-hover'); });
    var hit = slotAt(e.clientX, e.clientY);
    if(hit) tryDrop(d.tile, hit);
  }
  function onCancel(){
    if(!S || !S.drag) return;
    var d = S.drag;
    S.drag = null;
    if(d.ghost.parentNode) d.ghost.parentNode.removeChild(d.ghost);
    d.tile.style.opacity = '';
    S.slotEls.forEach(function(sl){ sl.classList.remove('tr-units-hover'); });
  }
  function slotAt(x, y){
    for(var i = 0; i < S.slotEls.length; i++){
      var sl = S.slotEls[i];
      if(sl.classList.contains('tr-units-filled')) continue;
      var r = sl.getBoundingClientRect();
      if(x >= r.left - 12 && x <= r.right + 12 && y >= r.top - 12 && y <= r.bottom + 12) return sl;
    }
    return null;
  }

  /* ---------- drop logic ---------- */
  function tryDrop(tile, slot){
    var p = PROBLEMS[S.idx];
    var step = p.steps[S.step];
    if(+slot.dataset.idx !== S.step){
      reject(tile, 'Left to right! First cancel “' + step.cancel + '”.');
      return;
    }
    if(tile.dataset.f === step.f){
      accept(tile, slot, p, step);
    } else {
      var msg;
      if(tile.dataset.f === FACTORS[step.f].inv){
        msg = 'Flipped! “' + step.cancel + '” must be on the BOTTOM of the tile to cancel the ' + step.cancel + ' on top.';
      } else {
        msg = 'That tile doesn’t cancel “' + step.cancel + '” — look for ' + step.cancel + ' on a tile’s bottom.';
      }
      reject(tile, msg);
    }
  }

  function reject(tile, msg){
    S.misses++;
    toast(msg, 'bad');
    if(!rm()){
      tile.classList.add('tr-units-shake');
      later(function(){ tile.classList.remove('tr-units-shake'); }, 380);
    }
    if(S.misses >= 2){
      var step = PROBLEMS[S.idx].steps[S.step];
      S.els.hint.innerHTML = '💡 <b>HINT:</b> ' + step.hint;
      S.els.hint.className = 'tr-units-hint tr-units-on';
    }
    announce('Not quite. ' + msg);
  }

  function accept(tile, slot, p, step){
    S.busy = true;
    tile.classList.add('tr-units-placed');
    slot.innerHTML = fracHTML(step.f);
    slot.classList.add('tr-units-filled');
    slot.classList.remove('tr-units-active');
    S.els.hint.className = 'tr-units-hint';

    /* THE SIGNATURE MOMENT — simultaneous diagonal strike + glow + fly-away of the
       cancelling unit pair (numerator of the chain vs denominator of the new tile). */
    var srcWrap = (step.target === 'prev')
      ? S.slotEls[+slot.dataset.idx - 1].querySelector('.tr-units-ftop')
      : S.valueEl;
    var uTop = srcWrap ? srcWrap.querySelector('.tr-units-u[data-k="' + step.cancel + '"]') : null;
    var uBot = slot.querySelector('.tr-units-fbot .tr-units-u[data-k="' + step.cancel + '"]');
    var reduced = rm();
    [uTop, uBot].forEach(function(u){
      if(!u) return;
      u.classList.add('tr-units-cxl');
      if(reduced) u.classList.add('tr-units-goneRM');
    });
    toast('“' + step.cancel + '” cancels!', 'ok');
    announce('Correct: ' + step.cancel + ' cancels top against bottom.');
    if(!reduced){
      later(function(){
        [uTop, uBot].forEach(function(u){ if(u) u.classList.add('tr-units-gone'); });
      }, 650);
    }
    later(function(){
      S.step++;
      if(S.step < p.steps.length){
        S.slotEls[S.step].classList.add('tr-units-active');
        S.busy = false;
        announce('Good. Now cancel ' + p.steps[S.step].cancel + '.');
      } else {
        finishProblem(p);
      }
    }, reduced ? 80 : 1250);
  }

  function finishProblem(p){
    S.solved = true;
    S.solvedCount++;
    S.resEl.innerHTML = p.resultHtml;
    S.resEl.classList.add('tr-units-reveal');
    if(S.api.pulse) S.api.pulse(S.resEl);
    if(S.api.confetti) S.api.confetti(S.resEl);
    if(S.api.xp) S.api.xp(10, 'tr-units:' + p.id);
    toast('Solved! ' + S.resEl.textContent, 'ok');
    announce('Solved. Result ' + S.resEl.textContent);

    /* recap line: full multiplication with all cancellations marked */
    var valueStruck = [];
    p.steps.forEach(function(st){ if(st.target === 'value') valueStruck.push(st.cancel); });
    var line = '<span class="tr-units-val">' + esc(p.vn) + '&nbsp;' + unitsHTML(p.vu, valueStruck) + '</span>';
    p.steps.forEach(function(st, i){
      var nxt = p.steps[i + 1];
      var topStruck = (nxt && nxt.target === 'prev') ? nxt.cancel : null;
      line += '<span class="tr-units-op">×</span>' + fracHTML(st.f, topStruck, st.cancel);
    });
    line += '<span class="tr-units-op">=</span><span class="tr-units-res">' + p.resultHtml + '</span>';
    S.els.recap.innerHTML = '<div class="tr-units-recaphead">RECAP — FACTOR-LABEL METHOD</div>' +
      '<div class="tr-units-recapline">' + line + '</div>';
    S.els.recap.className = 'tr-units-recap tr-units-on';
    S.els.prog.innerHTML = '<span>DRILL <b>' + (S.idx + 1) + '/' + PROBLEMS.length + '</b></span><span>SOLVED <b>' + S.solvedCount + '</b></span>';
    S.els.next.textContent = (S.idx + 1 < PROBLEMS.length) ? 'NEXT DRILL ▸' : 'FINISH ▸';
    S.els.next.className = 'tr-units-next tr-units-on';
    S.busy = false;
  }

  function nextProblem(){
    if(!S || !S.solved) return;
    S.idx++;
    if(S.idx < PROBLEMS.length){
      renderProblem();
      window.scrollTo(0, 0);
    } else {
      showDone();
    }
  }

  function showDone(){
    S.els.prog.innerHTML = '';
    S.els.prompt.innerHTML = '';
    S.els.chain.innerHTML = '';
    S.els.bank.innerHTML = '';
    S.els.hint.className = 'tr-units-hint';
    S.els.recap.className = 'tr-units-recap';
    S.els.next.className = 'tr-units-next';
    S.els.chain.style.display = 'none';
    S.els.bankhead.style.display = 'none';
    var d = document.createElement('div');
    d.className = 'tr-units-done';
    d.innerHTML = '<h3>🏆 GAUNTLET CLEARED!</h3>' +
      '<p>All ' + PROBLEMS.length + ' conversions done. Remember the chant:<br>' +
      '<b>write the ratio so the unwanted unit cancels, multiply by 1, repeat.</b></p>' +
      '<button class="tr-units-next tr-units-on" id="trunitsRestart">RUN IT AGAIN ↻</button>';
    S.els.wrap.appendChild(d);
    S.doneEl = d;
    if(S.api.confetti) S.api.confetti(d);
    toast('Unit Gauntlet cleared!', 'ok');
    announce('All drills complete.');
    d.querySelector('#trunitsRestart').addEventListener('click', function(){
      if(!S) return;
      if(S.doneEl && S.doneEl.parentNode) S.doneEl.parentNode.removeChild(S.doneEl);
      S.doneEl = null;
      S.els.chain.style.display = '';
      S.els.bankhead.style.display = '';
      S.idx = 0; S.solvedCount = 0;
      renderProblem();
    });
  }

  /* ---------- mount / unmount ---------- */
  function mount(host, api){
    if(S) unmount();
    injectCSS();
    var float = document.createElement('div');
    float.className = 'tr-units-float';
    document.body.appendChild(float);

    var wrap = document.createElement('div');
    wrap.className = 'tr-units-wrap';
    wrap.innerHTML =
      '<div class="tr-units-card">' +
        '<div class="tr-units-bt">⚖️ A CONVERSION FACTOR EQUALS 1</div>' +
        '<div class="tr-units-btext">Since <b>1 km/h = 0.278 m/s</b>, divide both sides by 1 km/h:</div>' +
        '<div class="tr-units-bmath" id="trunitsBmath"></div>' +
        '<div class="tr-units-btext">Multiplying by 1 never changes a value — only its units. ' +
        'Units obey the same algebraic rules as variables: same unit on top and bottom <b>cancels</b>. ' +
        'Drag the right ratio into each slot so the unwanted unit dies.</div>' +
      '</div>' +
      '<div class="tr-units-prog" id="trunitsProg"></div>' +
      '<div class="tr-units-prompt" id="trunitsPrompt"></div>' +
      '<div class="tr-units-chain" id="trunitsChain"></div>' +
      '<div class="tr-units-hint" id="trunitsHint"></div>' +
      '<div class="tr-units-bankhead" id="trunitsBankhead">🧲 FACTOR BANK — drag a ratio into the glowing slot</div>' +
      '<div class="tr-units-bank" id="trunitsBank"></div>' +
      '<div class="tr-units-recap" id="trunitsRecap"></div>' +
      '<button class="tr-units-next" id="trunitsNext">NEXT DRILL ▸</button>';
    host.appendChild(wrap);

    S = {
      api: api || {},
      host: host,
      float: float,
      timers: [],
      drag: null,
      busy: false,
      solved: false,
      idx: 0,
      step: 0,
      misses: 0,
      solvedCount: 0,
      slotEls: [],
      valueEl: null,
      resEl: null,
      doneEl: null,
      els: {
        wrap: wrap,
        bmath: wrap.querySelector('#trunitsBmath'),
        prog: wrap.querySelector('#trunitsProg'),
        prompt: wrap.querySelector('#trunitsPrompt'),
        chain: wrap.querySelector('#trunitsChain'),
        hint: wrap.querySelector('#trunitsHint'),
        bankhead: wrap.querySelector('#trunitsBankhead'),
        bank: wrap.querySelector('#trunitsBank'),
        recap: wrap.querySelector('#trunitsRecap'),
        next: wrap.querySelector('#trunitsNext')
      }
    };
    S.els.next.addEventListener('click', nextProblem);

    /* teaching banner math: real stacked fraction via MathJax */
    if(S.api.latex){
      S.api.latex(S.els.bmath,
        '1\\,\\tfrac{\\mathrm{km}}{\\mathrm{h}} = 0.278\\,\\tfrac{\\mathrm{m}}{\\mathrm{s}}' +
        '\\;\\;\\Rightarrow\\;\\; 1 = \\dfrac{0.278\\ \\mathrm{m/s}}{1\\ \\mathrm{km/h}}');
    } else {
      S.els.bmath.innerHTML = '1 km/h = 0.278 m/s &nbsp;⇒&nbsp; 1 = ' +
        '<span class="tr-units-frac"><span class="tr-units-ftop">0.278 m/s</span><span class="tr-units-fbot">1 km/h</span></span>';
    }

    renderProblem();
  }

  function unmount(){
    if(!S) return;
    S.timers.forEach(function(t){ clearTimeout(t); });
    if(S.drag && S.drag.ghost && S.drag.ghost.parentNode) S.drag.ghost.parentNode.removeChild(S.drag.ghost);
    if(S.float && S.float.parentNode) S.float.parentNode.removeChild(S.float);
    if(S.els && S.els.wrap && S.els.wrap.parentNode) S.els.wrap.parentNode.removeChild(S.els.wrap);
    S = null;
  }

  (window.TRAINING_MODULES = window.TRAINING_MODULES || []).push({
    id: 'units',
    title: 'Unit Gauntlet',
    icon: '⚖️',
    blurb: 'Drag conversion-factor ratios so units cancel — factor-label method drills.',
    desc: 'Drag ratios, cancel units',
    chapter: 'Ch 1',
    mount: mount,
    unmount: unmount
  });
})();
