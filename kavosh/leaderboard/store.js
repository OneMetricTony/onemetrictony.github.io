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
    // standalone tally: times people have nagged about ice cream / prizes
    state.annoyCount = Math.max(0, Math.round(num(state.annoyCount)));
    state.players = state.players.map(function (p, i) {
      // entries = named point sources that tally into the total
      var entries = Array.isArray(p.entries) ? p.entries.map(function (e) {
        return { label: String(e && e.label || "").slice(0, 40), points: num(e && e.points) };
      }) : [];
      var formula = (p.formula != null && String(p.formula).trim() !== "") ? String(p.formula).slice(0, 120) : "";
      var stored = num(p.value != null ? p.value : p.score);
      var value;
      if (entries.length) {
        value = entries.reduce(function (s, e) { return s + e.points; }, 0);
      } else if (formula) {
        var ev = evalExpr(formula); value = isFinite(ev) ? ev : stored;
      } else {
        value = stored;
      }
      // notes = timestamped remarks; the newest (max ts) shows on the display card
      var notes = Array.isArray(p.notes) ? p.notes.map(function (n) {
        return { text: String(n && n.text || "").slice(0, 140), ts: num(n && n.ts) };
      }).filter(function (n) { return n.text; }) : [];
      return {
        id: p.id || uid(),
        name: String(p.name || "").slice(0, 60),
        value: num(value),
        entries: entries,               // [{label, points}] — tally source
        notes: notes,                   // [{text, ts}] — newest shows on card
        formula: formula,               // legacy single-expression fallback
        change: num(p.change),
        // manual tiebreak order (lower = ranked higher when values are equal)
        order: p.order != null ? num(p.order) : i
      };
    });
    return state;
  }

  // Dense ranking on an already-sorted list: equal values share a place and
  // the next distinct value is the next integer — 1, 2, 2, 3 (no gap).
  function ranks(sortedPlayers) {
    var m = new Map(), lastVal = null, rank = 0;
    for (var i = 0; i < sortedPlayers.length; i++) {
      var p = sortedPlayers[i];
      if (i === 0 || p.value !== lastVal) rank++;
      lastVal = p.value;
      m.set(p.id, rank);
    }
    return m;
  }

  // Most recent note (by timestamp) for a player, or "" if none.
  function latestNote(p) {
    if (!p || !p.notes || !p.notes.length) return "";
    var best = p.notes[0];
    for (var i = 1; i < p.notes.length; i++) {
      if ((p.notes[i].ts || 0) > (best.ts || 0)) best = p.notes[i];
    }
    return best.text || "";
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

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // _baseline = the last server state this client is known to agree with. Every
  // commit sends {base, state}; the server 3-way-merges against the live copy so
  // two editors don't clobber each other. _queue serializes this client's writes
  // (the buffer) so rapid saves can't race one another.
  var _baseline = null;
  var _queue = Promise.resolve();

  function load() {
    var backend = global.LB_BACKEND;
    if (!backend) { var l0 = readLocal(); _baseline = clone(l0); return Promise.resolve(l0); }
    return fetch(backend, { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var remote = normalize(d);
        // First-run migration: if the backend is empty but this browser already
        // has data (e.g. scores keyed in before the backend existed), push the
        // local copy up instead of letting the empty backend wipe it.
        if (remote.players.length === 0) {
          var local = readLocal();
          if (local.players.length > 0) { _baseline = clone(remote); commit(local); return local; }
        }
        writeLocal(remote); _baseline = clone(remote);
        return remote;
      })
      .catch(function () { var l = readLocal(); _baseline = clone(l); return l; });
  }

  // Re-read the shared state (for polling). Refreshes the merge baseline.
  function pull() {
    var backend = global.LB_BACKEND;
    if (!backend) { var l = readLocal(); _baseline = clone(l); return Promise.resolve(l); }
    return fetch(backend, { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) { var remote = normalize(d); writeLocal(remote); _baseline = clone(remote); return remote; })
      .catch(function () { return readLocal(); });
  }

  // Commit local changes. Serialized through _queue; the server merges {base,state}
  // into the live copy and returns the merged result, which becomes the new baseline.
  function commit(state) {
    state = normalize(state);
    writeLocal(state);
    var backend = global.LB_BACKEND;
    if (!backend) { _baseline = clone(state); return Promise.resolve(state); }
    var base = _baseline ? clone(_baseline)
      : { title: "", subtitle: "", metric: {}, event: null, annoyCount: 0, players: [] };
    var payload = JSON.stringify({ _merge: true, base: base, state: state });
    var run = _queue.then(function () {
      return fetch(backend, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: payload
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (res && res.state) { var m = normalize(res.state); writeLocal(m); _baseline = clone(m); return m; }
        return state;
      });
    });
    _queue = run.catch(function () {});
    return run;
  }

  // Legacy whole-state overwrite (kept for the first-run seed only).
  function save(state) {
    state = normalize(state);
    writeLocal(state);
    var backend = global.LB_BACKEND;
    if (!backend) { _baseline = clone(state); return Promise.resolve({ ok: true, local: true }); }
    return fetch(backend, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(state)
    }).then(function (r) { return r.json(); });
  }

  global.LBStore = {
    load: load, pull: pull, commit: commit, save: save, uid: uid,
    rankSort: rankSort, ranks: ranks, fmt: fmt, num: num, initials: initials, evalExpr: evalExpr, latestNote: latestNote,
    hasBackend: function () { return !!global.LB_BACKEND; }
  };
})(window);
