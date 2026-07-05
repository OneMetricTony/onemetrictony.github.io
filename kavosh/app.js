/* KAVOSH Volunteering — shared state + gossip sheet + schedule board.
   State is cached in localStorage and synced to a Google Apps Script
   web app (see config.js) that stores kavosh_gossip_state.json on Drive,
   so edits persist for the next person with the link. */
(function () {
  "use strict";

  const LS_KEY = "kavosh_gossip_v1";
  const state = {
    comments: {},   // key -> {kid:"", parent:""}
    volunteers: {}, // "Team|groupIdx" -> volunteer name
    schedule: {},   // "07-16" -> [{id,type,label,meta}]
    updated: null,
  };
  let dirty = false;
  let saveTimer = null;

  // ---------- persistence ----------
  const statusEl = () => document.getElementById("save-status");
  function setStatus(cls, msg) {
    const el = statusEl();
    if (el) { el.className = "save-status " + cls; el.textContent = msg; }
  }
  function markDirty() {
    dirty = true;
    setStatus("dirty", "unsaved changes…");
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveRemote, 2500); // debounce autosave
  }
  // Flat reference roster (all students) so the backend can populate a
  // fully-readable Google Sheet, not just the sparse edited fields.
  function buildRoster() {
    const out = [];
    KAVOSH_DATA.teams.forEach(t => t.students.forEach(s => {
      out.push({
        team: t.team, league: t.league, mentor: t.mentor,
        student: s.name, prefer: s.prefer || "", parent: s.parent || "",
        phone: s.phone || "", email: s.email || "", medical: s.medical || "",
        entry: s.entry || "",
      });
    }));
    return out;
  }
  async function saveRemote() {
    if (!window.KAVOSH_BACKEND) { setStatus("err", "no backend configured — local only"); return; }
    state.updated = new Date().toISOString();
    setStatus("dirty", "saving…");
    try {
      // text/plain avoids a CORS preflight that Apps Script cannot answer
      const r = await fetch(window.KAVOSH_BACKEND, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(Object.assign({}, state, { roster: buildRoster() })),
      });
      const j = await r.json();
      if (j.ok) { dirty = false; setStatus("ok", "saved " + new Date().toLocaleTimeString()); }
      else throw new Error("backend said no");
    } catch (e) {
      setStatus("err", "save failed — kept locally");
    }
  }
  async function loadRemote() {
    const local = localStorage.getItem(LS_KEY);
    if (local) { try { Object.assign(state, JSON.parse(local)); } catch (e) {} }
    if (!window.KAVOSH_BACKEND) return;
    setStatus("dirty", "loading shared data…");
    try {
      const r = await fetch(window.KAVOSH_BACKEND);
      const remote = await r.json();
      // newest blob wins
      if (remote && remote.updated && (!state.updated || remote.updated >= state.updated)) {
        Object.assign(state, remote);
        localStorage.setItem(LS_KEY, JSON.stringify(state));
      }
      setStatus("ok", "shared data loaded");
    } catch (e) {
      setStatus("err", "offline — using local copy");
    }
  }

  // ---------- helpers ----------
  const esc = s => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const telHref = p => "tel:" + String(p || "").replace(/[^\d+]/g, "");
  const cKey = (team, stu) => team + "::" + stu;

  function volOptions(selected) {
    let h = '<option value="">— assign —</option>';
    KAVOSH_DATA.volunteers.forEach(v => {
      h += '<option value="' + esc(v.name) + '"' + (v.name === selected ? " selected" : "") + ">" + esc(v.name) + "</option>";
    });
    return h;
  }

  // ---------- gossip sheet ----------
  function renderGossip() {
    const root = document.getElementById("teams");
    if (!root) return;
    let html = "";
    KAVOSH_DATA.teams.forEach(team => {
      // one volunteer per team (no splitting at 5 — a 6-kid team gets one dropdown)
      const groups = [team.students];
      html += '<section class="team-card" data-team="' + esc(team.team) + '">';
      html += '<div class="team-banner"><h2>' + esc(team.team) + "</h2>" +
        '<span class="meta"><b>' + esc(team.league) + "</b></span>" +
        '<span class="meta">mentor: <b>' + esc(team.mentor) + "</b></span>" +
        '<span class="meta">' + esc(team.affiliation) + "</span></div>";
      html += '<div class="team-body">';
      html += '<div class="vol-groups">';
      groups.forEach((g, gi) => {
        const vk = team.team + "|" + gi;
        const label = groups.length > 1 ? "Volunteer — kids " + (gi * 5 + 1) + "–" + (gi * 5 + g.length) : "Volunteer";
        html += '<div class="vol-box"><label>' + label + "</label>" +
          '<select data-volkey="' + esc(vk) + '">' + volOptions(state.volunteers[vk]) + "</select>" +
          '<div class="vol-note" data-volnote="' + esc(vk) + '"></div></div>';
      });
      html += "</div>";
      html += '<div class="stu-rows">';
      team.students.forEach(stu => {
        const key = cKey(team.team, stu.name);
        const c = state.comments[key] || {};
        const med = stu.medical && stu.medical !== "None"
          ? ' <span class="badge med">⚠ ' + esc(stu.medical) + "</span>" : "";
        html += '<div class="stu-row" data-search="' + esc((stu.name + " " + (stu.parent || "")).toLowerCase()) + '">';
        html += '<div class="cell kid"><span class="side kid">STUDENT</span><h4>' + esc(stu.name) +
          (stu.prefer && stu.prefer.toLowerCase() !== stu.name.toLowerCase()
            ? ' <span class="sub">“' + esc(stu.prefer) + "”</span>" : "") + "</h4>" +
          '<p class="facts">DOB <b>' + esc(stu.dob || "?") + "</b> · ID <b>" + esc(stu.id) + "</b>" +
          (stu.fee ? " · " + esc(stu.fee) : "") + (stu.ptag ? " · " + esc(stu.ptag) : "") + "</p>" + med +
          '<textarea class="comment" data-ckey="' + esc(key) + '" data-cside="kid" ' +
          'placeholder="notes on the student…">' + esc(c.kid) + "</textarea></div>";
        if (stu.parent) {
          const src = stu.source || "purple";
          const badge = stu.form_url
            ? '<a class="badge entry ' + src + '" href="' + esc(stu.form_url) + '" target="_blank" rel="noopener" title="open this consent-form response">form #' + stu.entry + " ↗</a>"
            : '<span class="badge entry ' + src + '">form #' + esc(stu.entry) + "</span>";
          html += '<div class="cell parent"><span class="side parent">PARENT</span><h4>' + esc(stu.parent) +
            ' ' + badge + "</h4>" +
            '<span class="phone"><a href="' + telHref(stu.phone) + '">📞 ' + esc(stu.phone) + "</a></span>" +
            '<p class="facts">' + esc(stu.email) + "</p>" +
            '<textarea class="comment" data-ckey="' + esc(key) + '" data-cside="parent" ' +
            'placeholder="notes on the parent…">' + esc(c.parent) + "</textarea></div>";
        } else {
          html += '<div class="cell parent"><span class="side parent">PARENT</span><h4><span class="badge nocon">no consent form on file</span></h4>' +
            '<p class="facts">no parent contact from the consent form — chase this one down</p>' +
            '<textarea class="comment" data-ckey="' + esc(key) + '" data-cside="parent" ' +
            'placeholder="notes…">' + esc(c.parent) + "</textarea></div>";
        }
        html += "</div>";
      });
      html += "</div></div></section>";
    });
    root.innerHTML = html;

    // unmatched consent entries (mostly EnjoyAI kids) — dedupe by student, newest wins
    const seen = {};
    KAVOSH_DATA.unmatched.slice().sort((a, b) => b.entry - a.entry).forEach(u => {
      const k = u.student.toLowerCase().replace(/\s+/g, " ").trim();
      if (!seen[k]) seen[k] = u;
    });
    const rows = Object.values(seen).sort((a, b) => a.student.localeCompare(b.student));
    const ex = document.getElementById("extras-body");
    if (ex) {
      ex.innerHTML = rows.map(u =>
        "<tr><td>" + esc(u.student) + "</td><td>" + esc(u.parent) + "</td>" +
        '<td class="ph"><a href="' + telHref(u.phone) + '">' + esc(u.phone) + "</a></td>" +
        "<td>" + esc(u.email) + "</td><td>#" + u.entry + "</td><td>" +
        (u.medical && u.medical !== "None" ? '<span class="badge med">⚠ ' + esc(u.medical) + "</span>" : "") +
        "</td></tr>").join("");
    }

    // wire inputs
    root.querySelectorAll(".comment").forEach(t => {
      t.addEventListener("input", () => {
        const k = t.dataset.ckey;
        state.comments[k] = state.comments[k] || {};
        state.comments[k][t.dataset.cside] = t.value;
        markDirty();
      });
    });
    root.querySelectorAll("select[data-volkey]").forEach(sel => {
      const note = () => {
        const v = KAVOSH_DATA.volunteers.find(x => x.name === sel.value);
        const n = root.querySelector('[data-volnote="' + CSS.escape(sel.dataset.volkey) + '"]');
        if (n) n.textContent = v ? v.note : "";
      };
      note();
      sel.addEventListener("change", () => {
        state.volunteers[sel.dataset.volkey] = sel.value;
        markDirty();
        note();
      });
    });

    // search filter
    const q = document.getElementById("search");
    if (q) q.addEventListener("input", () => {
      const needle = q.value.toLowerCase().trim();
      root.querySelectorAll(".stu-row").forEach(r => {
        r.style.display = !needle || r.dataset.search.includes(needle) ? "" : "none";
      });
      root.querySelectorAll(".team-card").forEach(card => {
        const any = !needle || card.dataset.team.toLowerCase().includes(needle) ||
          [...card.querySelectorAll(".stu-row")].some(r => r.style.display !== "none");
        card.style.display = any ? "" : "none";
      });
    });
  }

  // ---------- schedule board ----------
  const DAYS = [
    { d: "07-16", label: "Wed · Jul 16", cls: "camp", cap: "camp wrap-up / cup setup" },
    { d: "07-17", label: "Thu · Jul 17", cls: "cup", cap: "FIRA RoboWorld Cup" },
    { d: "07-18", label: "Fri · Jul 18", cls: "cup", cap: "FIRA RoboWorld Cup · EnjoyAI" },
    { d: "07-19", label: "Sat · Jul 19", cls: "cup", cap: "FIRA RoboWorld Cup · EnjoyAI" },
    { d: "07-20", label: "Sun · Jul 20", cls: "cup", cap: "FIRA RoboWorld Cup · EnjoyAI" },
    { d: "07-21", label: "Tue · Jul 21", cls: "cup", cap: "FIRA RoboWorld Cup — finals" },
  ];
  let dragPayload = null;

  function modHtml(item, inDay) {
    return '<div class="mod ' + (item.type === "vol" ? "vol" : "") + '" draggable="true" ' +
      'data-id="' + esc(item.id) + '" data-type="' + esc(item.type) + '" ' +
      'data-label="' + esc(item.label) + '" data-meta="' + esc(item.meta || "") + '">' +
      (inDay ? '<span class="x" title="remove">✕</span>' : "") +
      '<span class="t">' + esc(item.label) + "</span>" +
      (item.meta ? '<div class="m">' + esc(item.meta) + "</div>" : "") +
      (item.vol ? '<div class="v">vol: ' + esc(item.vol) + "</div>" : "") +
      "</div>";
  }

  function trayItems() {
    const teamMods = KAVOSH_DATA.teams.map(t => {
      const vols = Object.keys(state.volunteers)
        .filter(k => k.startsWith(t.team + "|") && state.volunteers[k])
        .map(k => state.volunteers[k]);
      return {
        id: "team:" + t.team, type: "team", label: t.team,
        meta: t.league + " · " + t.students.length + " kids · " + t.mentor,
        vol: vols.join(", "),
      };
    });
    const volMods = KAVOSH_DATA.volunteers.map(v => ({
      id: "vol:" + v.name, type: "vol", label: v.name, meta: v.note,
    }));
    return { teamMods, volMods };
  }

  function renderSchedule() {
    const board = document.getElementById("board");
    if (!board) return;
    const { teamMods, volMods } = trayItems();
    document.getElementById("tray-teams").innerHTML = teamMods.map(m => modHtml(m, false)).join("");
    document.getElementById("tray-vols").innerHTML = volMods.map(m => modHtml(m, false)).join("");
    board.innerHTML = DAYS.map(day => {
      const items = state.schedule[day.d] || [];
      return '<div class="day ' + day.cls + '" data-day="' + day.d + '">' +
        '<div class="hd"><span class="n">' + day.label.split("· ")[1] + "</span>" + day.label.split(" ·")[0] + "</div>" +
        '<div class="cap">' + esc(day.cap) + "</div>" +
        '<div class="drop">' + items.map(i => modHtml(i, true)).join("") + "</div></div>";
    }).join("");
    wireDnD();
  }

  function wireDnD() {
    document.querySelectorAll(".mod").forEach(m => {
      m.addEventListener("dragstart", e => {
        dragPayload = {
          id: m.dataset.id, type: m.dataset.type,
          label: m.dataset.label, meta: m.dataset.meta,
          fromDay: m.closest(".day") ? m.closest(".day").dataset.day : null,
        };
        m.classList.add("dragging");
        e.dataTransfer.setData("text/plain", m.dataset.id);
        e.dataTransfer.effectAllowed = "copyMove";
      });
      m.addEventListener("dragend", () => m.classList.remove("dragging"));
      const x = m.querySelector(".x");
      if (x) x.addEventListener("click", () => {
        const day = m.closest(".day").dataset.day;
        state.schedule[day] = (state.schedule[day] || []).filter(i => i.id !== m.dataset.id);
        markDirty();
        renderSchedule();
      });
    });
    document.querySelectorAll(".day").forEach(day => {
      day.addEventListener("dragover", e => { e.preventDefault(); day.classList.add("dragover"); });
      day.addEventListener("dragleave", () => day.classList.remove("dragover"));
      day.addEventListener("drop", e => {
        e.preventDefault();
        day.classList.remove("dragover");
        if (!dragPayload) return;
        const d = day.dataset.day;
        state.schedule[d] = state.schedule[d] || [];
        if (dragPayload.fromDay && dragPayload.fromDay !== d) {
          state.schedule[dragPayload.fromDay] =
            (state.schedule[dragPayload.fromDay] || []).filter(i => i.id !== dragPayload.id);
        }
        if (!state.schedule[d].some(i => i.id === dragPayload.id)) {
          const { teamMods, volMods } = trayItems();
          const src = teamMods.concat(volMods).find(i => i.id === dragPayload.id) || dragPayload;
          state.schedule[d].push({ id: src.id, type: src.type, label: src.label, meta: src.meta, vol: src.vol });
        }
        dragPayload = null;
        markDirty();
        renderSchedule();
      });
    });
  }

  // ---------- boot ----------
  document.addEventListener("DOMContentLoaded", async () => {
    const saveBtn = document.getElementById("save-now");
    if (saveBtn) saveBtn.addEventListener("click", saveRemote);
    await loadRemote();
    renderGossip();
    renderSchedule();
    window.addEventListener("beforeunload", e => {
      if (dirty) { e.preventDefault(); e.returnValue = ""; }
    });
  });
})();
