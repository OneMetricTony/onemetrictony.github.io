// Halo-red circuit-board background: faint crimson traces on warm charcoal,
// glowing solder pads at the junctions, and light pulses racing along the
// lines (amber/crimson). Matches the FIRA RoboWorld HUD world.
// Respects reduced-motion (draws a static board, no pulses).
(function () {
  "use strict";
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas = document.createElement("canvas");
  canvas.id = "bgcanvas";
  (document.body || document.documentElement).appendChild(canvas);
  var ctx = canvas.getContext("2d");
  var W, H, dpr, GRID;
  var traces = [];   // each: { pts:[{x,y}...], len, segs:[{len,cum}], pulse, speed, hue }
  var glows = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function buildTraces() {
    traces = [];
    GRID = Math.round(44 * dpr);
    var cols = Math.floor(W / GRID), rows = Math.floor(H / GRID);
    if (cols < 3 || rows < 3) return;
    var count = Math.min(46, Math.floor((cols * rows) / 26) + 8);

    for (var t = 0; t < count; t++) {
      var cx = Math.floor(rand(0, cols)), cy = Math.floor(rand(0, rows));
      var horiz = Math.random() < 0.5;
      var nseg = Math.floor(rand(5, 13));
      var pts = [{ x: cx * GRID, y: cy * GRID }];
      for (var s = 0; s < nseg; s++) {
        var step = (Math.random() < 0.5 ? -1 : 1) * Math.floor(rand(1, 4));
        if (horiz) cx = Math.max(0, Math.min(cols, cx + step));
        else       cy = Math.max(0, Math.min(rows, cy + step));
        var last = pts[pts.length - 1];
        var nx = cx * GRID, ny = cy * GRID;
        if (nx !== last.x || ny !== last.y) pts.push({ x: nx, y: ny });
        horiz = !horiz;
      }
      if (pts.length < 2) continue;

      // precompute cumulative lengths for pulse travel
      var segs = [], total = 0;
      for (var i = 1; i < pts.length; i++) {
        var dx = pts[i].x - pts[i - 1].x, dy = pts[i].y - pts[i - 1].y;
        var L = Math.hypot(dx, dy);
        segs.push({ len: L, cum: total });
        total += L;
      }
      traces.push({
        pts: pts, segs: segs, len: total,
        pulse: Math.random() * total,
        speed: rand(0.4, 1.1) * dpr,
        hue: Math.random() < 0.34 ? "242,167,62" : "240,57,78" // amber vs crimson
      });
    }

    // a few soft crimson depth glows behind the board
    glows = [];
    for (var g = 0; g < 3; g++) {
      glows.push({ x: rand(0.1, 0.9), y: rand(0.1, 0.9), r: rand(0.35, 0.6),
                   dx: rand(-1, 1) * 0.00005, dy: rand(-1, 1) * 0.00005 });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = Math.floor(innerWidth * dpr);
    H = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    buildTraces();
  }
  resize();
  addEventListener("resize", resize);

  function pointAt(tr, dist) {
    var d = ((dist % tr.len) + tr.len) % tr.len;
    for (var i = 0; i < tr.segs.length; i++) {
      var sg = tr.segs[i];
      if (d <= sg.cum + sg.len) {
        var a = tr.pts[i], b = tr.pts[i + 1];
        var f = sg.len ? (d - sg.cum) / sg.len : 0;
        return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
      }
    }
    return tr.pts[tr.pts.length - 1];
  }

  function drawGlows() {
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < glows.length; i++) {
      var gl = glows[i];
      if (!reduced) {
        gl.x += gl.dx; gl.y += gl.dy;
        if (gl.x < 0.05 || gl.x > 0.95) gl.dx *= -1;
        if (gl.y < 0.05 || gl.y > 0.95) gl.dy *= -1;
      }
      var x = gl.x * W, y = gl.y * H, r = gl.r * Math.max(W, H);
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(200,16,46,0.10)");
      g.addColorStop(1, "rgba(200,16,46,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawBoard() {
    // faint traces
    ctx.globalCompositeOperation = "source-over";
    ctx.lineWidth = Math.max(1, 1.1 * dpr);
    ctx.strokeStyle = "rgba(240,57,78,0.11)";
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    for (var t = 0; t < traces.length; t++) {
      var p = traces[t].pts;
      ctx.beginPath();
      ctx.moveTo(p[0].x, p[0].y);
      for (var i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
      ctx.stroke();
    }
    // solder pads at every vertex
    ctx.fillStyle = "rgba(240,57,78,0.16)";
    for (var u = 0; u < traces.length; u++) {
      var pp = traces[u].pts;
      for (var j = 0; j < pp.length; j++) {
        ctx.beginPath();
        ctx.arc(pp[j].x, pp[j].y, 2 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawPulses() {
    ctx.globalCompositeOperation = "lighter";
    for (var t = 0; t < traces.length; t++) {
      var tr = traces[t];
      if (!reduced) tr.pulse += tr.speed;
      var pt = pointAt(tr, tr.pulse);
      // trailing streak
      var tail = pointAt(tr, tr.pulse - 10 * dpr);
      var lg = ctx.createLinearGradient(tail.x, tail.y, pt.x, pt.y);
      lg.addColorStop(0, "rgba(" + tr.hue + ",0)");
      lg.addColorStop(1, "rgba(" + tr.hue + ",0.5)");
      ctx.strokeStyle = lg;
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(pt.x, pt.y); ctx.stroke();
      // bright head
      var r = 7 * dpr;
      var rg = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);
      rg.addColorStop(0, "rgba(" + tr.hue + ",0.95)");
      rg.addColorStop(1, "rgba(" + tr.hue + ",0)");
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2); ctx.fill();
    }
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    drawGlows();
    drawBoard();
    drawPulses();
    if (!reduced) requestAnimationFrame(frame);
  }
  frame();
})();
