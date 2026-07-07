// Shared data layer for the leaderboard display + entry sites.
// Backend = Google Apps Script web app that reads/writes kavosh_leaderboard.json
// on Drive. Falls back to localStorage when no backend is configured.
(function (global) {
  "use strict";

  var LS_KEY = "kavosh.leaderboard.v3";

  function uid() { return Math.random().toString(36).slice(2, 9); }

  // metric.lowerIsBetter: true for things like time (fastest wins);
  // false for points/weight (highest wins). unit is a free label ("s", "kg", "pts").
  var SAMPLE = {
    title: "Leaderboard",
    subtitle: "KAVOSH Challenge",
    metric: { label: "Score", unit: "pts", lowerIsBetter: false },
    players: [
      { id: uid(), name: "Team 1 Nova",           value: 0, change: 0 },
      { id: uid(), name: "Team 2 Titan",          value: 0, change: 0 },
      { id: uid(), name: "Team 3 Challenge",      value: 0, change: 0 },
      { id: uid(), name: "Team 4 Bright",         value: 0, change: 0 },
      { id: uid(), name: "Team 5 Global Mission", value: 0, change: 0 },
      { id: uid(), name: "Team 6 Smart",          value: 0, change: 0 }
    ]
  };

  // Avatar initials — skip a leading "Team <n>" so the badge shows the real name.
  function initials(name) {
    var toks = String(name).trim().split(/\s+/)
      .filter(function (w) { return /[a-z]/i.test(w) && w.toLowerCase() !== "team"; });
    if (!toks.length) toks = String(name).trim().split(/\s+/);
    if (toks.length === 1) return toks[0].slice(0, 2).toUpperCase();
    return (toks[0][0] + toks[1][0]).toUpperCase();
  }

  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }

  // Safe arithmetic evaluator (no eval): + - * / ( ) and decimals, so a
  // score cell can be "12+8+5" to add across challenges. Returns NaN if invalid.
  function evalExpr(input) {
    if (typeof input === "number") return input;
    var s = String(input == null ? "" : input);
    if (!/^[\d+\-*/().,\s]*$/.test(s)) return NaN;
    s = s.replace(/,/g, "");
    if (!s.trim()) return NaN;
    var i = 0;
    function ws() { while (i < s.length && s[i] === " ") i++; }
    function expr() {
      var v = term(); ws();
      while (s[i] === "+" || s[i] === "-") { var op = s[i++]; var r = term(); v = op === "+" ? v + r : v - r; ws(); }
      return v;
    }
    function term() {
      var v = factor(); ws();
      while (s[i] === "*" || s[i] === "/") { var op = s[i++]; var r = factor(); v = op === "*" ? v * r : v / r; ws(); }
      return v;
    }
    function factor() {
      ws();
      if (s[i] === "+") { i++; return factor(); }
      if (s[i] === "-") { i++; return -factor(); }
      if (s[i] === "(") { i++; var v = expr(); ws(); if (s[i] === ")") i++; return v; }
      return number();
    }
    function number() {
      ws();
      var m = /^\d*\.?\d+/.exec(s.slice(i));
      if (!m) return NaN;
      i += m[0].length;
      return parseFloat(m[0]);
    }
    var res = expr(); ws();
    if (i < s.length) return NaN;
    return isFinite(res) ? res : NaN;
  }

  function normalize(state) {
    if (!state || typeof state !== "object") state = {};
    var m = state.metric || {};
    state.metric = {
      label: String(m.label || "Score").slice(0, 24),
      unit: String(m.unit || "").slice(0, 12),
      lowerIsBetter: !!m.lowerIsBetter
    };
    if (!Array.isArray(state.players)) state.players = [];
    state.title = String(state.title || "Leaderboard").slice(0, 60);
    state.subtitle = String(state.subtitle || "Season Standings").slice(0, 60);
    state.players = state.players.map(function (p, i) {
      var formula = (p.formula != null && String(p.formula).trim() !== "") ? String(p.formula).slice(0, 120) : "";
      var stored = num(p.value != null ? p.value : p.score);
      var value = stored;
      if (formula) { var e = evalExpr(formula); if (isFinite(e)) value = e; }
      return {
        id: p.id || uid(),
        name: String(p.name || "").slice(0, 60),
        value: num(value),
        formula: formula,               // raw expression, kept for re-editing
        change: num(p.change),
        // manual tiebreak order (lower = ranked higher when values are equal)
        order: p.order != null ? num(p.order) : i
      };
    });
    return state;
  }

  // Sort players best-first: metric decides, manual order breaks ties.
  function rankSort(players, metric) {
    var lower = metric && metric.lowerIsBetter;
    return players.slice().sort(function (a, b) {
      var d = lower ? (a.value - b.value) : (b.value - a.value);
      if (d !== 0) return d;
      return (a.order || 0) - (b.order || 0);
    });
  }

  // Format a value with its unit, keeping up to 2 decimals when needed.
  function fmt(value, metric) {
    var v = num(value);
    var s = (Math.round(v * 100) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 });
    var u = metric && metric.unit ? " " + metric.unit : "";
    return s + u;
  }

  function readLocal() {
    try {
      var d = JSON.parse(localStorage.getItem(LS_KEY));
      if (d) return normalize(d);
    } catch (e) {}
    return normalize(JSON.parse(JSON.stringify(SAMPLE)));
  }

  function writeLocal(state) { localStorage.setItem(LS_KEY, JSON.stringify(state)); }

  function load() {
    var backend = global.LB_BACKEND;
    if (!backend) return Promise.resolve(readLocal());
    return fetch(backend, { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) { var s = normalize(d); writeLocal(s); return s; })
      .catch(function () { return readLocal(); });
  }

  function save(state) {
    state = normalize(state);
    writeLocal(state);
    var backend = global.LB_BACKEND;
    if (!backend) return Promise.resolve({ ok: true, local: true });
    // text/plain avoids a CORS preflight that Apps Script cannot answer
    return fetch(backend, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(state)
    }).then(function (r) { return r.json(); });
  }

  global.LBStore = {
    load: load, save: save, uid: uid,
    rankSort: rankSort, fmt: fmt, num: num, initials: initials,
    hasBackend: function () { return !!global.LB_BACKEND; }
  };
})(window);
