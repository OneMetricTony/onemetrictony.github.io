/* Shared flash-card engine for the CPCS110 assignment practice pages.
   A page sets up MathJax, links /flashcards.css, then:

     <script src="/flashcards.js"></script>          // defines window.F + initFlashcards (NOT deferred)
     <script>
       const F = window.F;
       initFlashcards({
         store: "lucy_assignments_v1",                // shared store; marks keyed by unique q.id
         questions: [ { id:"A4Q1", asgn:"A4", ... }, ... ]
       });
     </script>

   Progress is scoped to the page's own question ids, so several single-assignment
   pages can safely share one localStorage store. */
(function () {

  /* ---- formula sheet shorthand (referenced by q.hint) -------------------- */
  window.F = {
    unitVec:    {nm:"Unit vector",          t:"$\\hat r = \\dfrac{\\vec r}{|\\vec r|}$"},
    dirCos:     {nm:"Direction cosines",    t:"$\\hat r = \\langle \\cos\\theta_x,\\ \\cos\\theta_y,\\ \\cos\\theta_z\\rangle$"},
    posUpdate:  {nm:"Position update",      t:"$\\vec r_f = \\vec r_i + \\vec v_{avg}\\,\\Delta t$"},
    pmv:        {nm:"Momentum (low v)",     t:"$\\vec p = m\\vec v$"},
    pgmv:       {nm:"Relativistic momentum",t:"$\\vec p = \\gamma m\\vec v$"},
    gamma:      {nm:"Gamma factor",         t:"$\\gamma = \\dfrac{1}{\\sqrt{1-(|\\vec v|/c)^{2}}}$"},
    vFromP:     {nm:"v from p",             t:"$\\vec v = \\dfrac{\\vec p/m}{\\sqrt{1+(|\\vec p|/(mc))^{2}}}$"},
    Fma:        {nm:"Newton's 2nd",         t:"$\\sum\\vec F = m\\vec a$"},
    impulse:    {nm:"Momentum principle",   t:"$\\Delta\\vec p = \\vec F_{net}\\,\\Delta t$"},
    grav:       {nm:"Universal gravity",    t:"$\\vec F_{grav} = -G\\,\\dfrac{m_1 m_2}{|\\vec r|^{2}}\\,\\hat r$"},
    spring:     {nm:"Spring force",         t:"$\\vec F = -k_s\\,s\\,\\hat L$"},
    fg:         {nm:"Surface gravity force",t:"$F_g \\approx mg$"},
    gSurface:   {nm:"Surface g",            t:"$g = G\\dfrac{M}{R^{2}}$"},
    coulomb:    {nm:"Coulomb's law",        t:"$\\vec F_{elec} = \\dfrac{1}{4\\pi\\varepsilon_0}\\,\\dfrac{q_1 q_2}{|\\vec r|^{2}}\\,\\hat r$"},
    magnitude:  {nm:"Vector magnitude",     t:"$|\\vec A| = \\sqrt{A_x^{2}+A_y^{2}+A_z^{2}}$"},
    delta:      {nm:"Displacement",         t:"$\\Delta\\vec r = \\vec r_f - \\vec r_i$"},
    vavg:       {nm:"Average velocity",     t:"$\\vec v_{avg} = \\dfrac{\\Delta\\vec r}{\\Delta t}$"},
    dp:         {nm:"Change in momentum",   t:"$\\Delta\\vec p = m(\\vec v_f - \\vec v_i)$"},
    consP:      {nm:"Conservation of p",    t:"$\\vec p_{tot,\\,i} = \\vec p_{tot,\\,f}$"},
    N3:         {nm:"Newton's 3rd law",     t:"$\\vec F_{A\\to B} = -\\vec F_{B\\to A}$"},
    stretch:    {nm:"Spring stretch",       t:"$s = |\\vec L| - L_0$"},
    /* --- Assignment 4: friction & oscillations --- */
    normal:     {nm:"Normal force (flat)",  t:"$N = mg$"},
    friction:   {nm:"Friction force",       t:"$f_{s,\\max}=\\mu_s N,\\quad f_k=\\mu_k N$"},
    period:     {nm:"Spring period",        t:"$T = 2\\pi\\sqrt{m/k}$"},
    omega:      {nm:"Angular frequency",    t:"$\\omega = \\sqrt{k/m}$"},
    shm:        {nm:"SHM (rest at max)",    t:"$x(t) = A\\cos(\\omega t)$"}
  };

  window.initFlashcards = function (cfg) {
    cfg = cfg || {};
    const Q = cfg.questions || [];
    const STORE = cfg.store || "lucy_assignments_v1";
    const PAGE_IDS = new Set(Q.map(q => q.id));

    const list = document.getElementById("list");
    const statsEl = document.getElementById("stats");
    const filtersEl = document.getElementById("filters");
    const tagBar = document.getElementById("tagBar");
    const tagBarText = document.getElementById("tagBarText");

    let filter = "all";
    let activeTag = null;

    function loadState(){
      try {
        const raw = localStorage.getItem(STORE);
        if (!raw) return {marks:{},hints:{}};
        const s = JSON.parse(raw);
        if (!s || typeof s !== "object") return {marks:{},hints:{}};
        s.marks = s.marks || {}; s.hints = s.hints || {};
        return s;
      } catch(e){ return {marks:{},hints:{}}; }
    }
    function saveState(s){ try { localStorage.setItem(STORE, JSON.stringify(s)); } catch(e){} }
    let state = loadState();

    function typeset(scope){
      if (window.MathJax && window.MathJax.typesetPromise){
        window.MathJax.typesetPromise([scope]).catch(()=>{});
      }
    }
    // MathJax loads async; if the list rendered first, catch up once it's ready.
    function ensureInitialTypeset(){
      if (window.MathJax && window.MathJax.typesetPromise){ typeset(list); return; }
      let tries = 0;
      const iv = setInterval(function(){
        if (window.MathJax && window.MathJax.typesetPromise){ clearInterval(iv); typeset(list); }
        else if (++tries > 150){ clearInterval(iv); }
      }, 100);
    }

    /* ---- filters: auto-built from the assignments present on this page ---- */
    function buildFilters(){
      const asgns = [...new Set(Q.map(q => q.asgn))];
      let html = `<button class="filter active" data-f="all">All <strong>${Q.length}</strong></button>`;
      if (asgns.length > 1){
        asgns.forEach(a => {
          const c = Q.filter(q => q.asgn === a).length;
          html += `<button class="filter ${a.toLowerCase()}" data-f="${a}">${a} <strong>${c}</strong></button>`;
        });
      }
      html += `<button class="filter" data-f="todo">Unreviewed</button>`;
      filtersEl.innerHTML = html;
      filtersEl.querySelectorAll(".filter").forEach(f => {
        f.onclick = () => {
          filter = f.dataset.f;
          filtersEl.querySelectorAll(".filter").forEach(x => x.classList.toggle("active", x === f));
          renderList();
        };
      });
    }

    function renderStats(){
      const total = Q.length;
      const got = Q.filter(q => state.marks[q.id] === "got").length;
      const review = Q.filter(q => state.marks[q.id] === "review").length;
      statsEl.innerHTML = `
        <div class="stat">Reviewed <strong>${got + review}</strong>/${total}</div>
        <div class="stat got">Got it <strong>${got}</strong></div>
        <div class="stat review">Review <strong>${review}</strong></div>
      `;
    }

    function shouldShow(q){
      if (activeTag && !(q.tags || []).includes(activeTag)) return false;
      if (filter === "all") return true;
      if (filter === "todo") return !state.marks[q.id];
      return q.asgn === filter;
    }

    function setTagFilter(tag){
      activeTag = tag;
      if (tag){ tagBar.classList.add("show"); tagBarText.textContent = tag; }
      else { tagBar.classList.remove("show"); }
      renderList();
      window.scrollTo({top:0, behavior:"smooth"});
    }
    if (tagBar){
      document.getElementById("tagClear").onclick = () => { activeTag = null; tagBar.classList.remove("show"); renderList(); };
    }

    function renderList(){
      list.innerHTML = "";
      let count = 0;
      Q.forEach(q => {
        if (!shouldShow(q)) return;
        count++;
        const mark = state.marks[q.id];
        const hintOpen = !!state.hints[q.id];
        const cls = mark === "got" ? "got" : (mark === "review" ? "review" : "");
        const card = document.createElement("div");
        card.className = `card ${cls}`;
        card.dataset.id = q.id;
        const tagsHtml = (q.tags || []).map(t => `<button class="tag${t===activeTag?' hot':''}" data-tag="${t}">${t}</button>`).join("");
        const hint = (q.hint || []).map(h => (typeof h === "string" ? window.F[h] : h)).filter(Boolean);
        const hintHtml = hint.length ? `
          <div class="hint-box ${hintOpen?'show':''}">
            <span class="lbl">Formula sheet — relevant entries</span>
            ${hint.map(h => `<div class="formula-line"><span class="nm">${h.nm}</span>${h.t}</div>`).join("")}
          </div>` : "";
        card.innerHTML = `
          <div class="meta">
            <span class="asgn ${q.asgn.toLowerCase()}">${q.asgn}</span>
            <span>${q.topic}</span>
          </div>
          <h3 class="title">${q.title}</h3>
          <div class="tags">${tagsHtml}</div>
          <div class="stem">${q.stem}</div>
          ${hintHtml}
          <div class="actions">
            ${hint.length ? `<button class="hint-btn ${hintOpen?'open':''}">💡 ${hintOpen?'Hide':'Formula'}</button>` : ""}
            <button class="reveal-btn">Reveal solution</button>
          </div>
          <div class="solution">
            ${q.ans.map(a => `<div class="ans-block"><span class="lbl">${a.l}</span>${a.v}</div>`).join("")}
            ${q.fm ? `<div class="formula"><span class="lbl">Method</span>${q.fm}</div>` : ""}
            <div class="mark-row">
              <button class="mark got ${mark==='got'?'active':''}" data-mark="got">✓ Got it</button>
              <button class="mark review ${mark==='review'?'active':''}" data-mark="review">⚠ Review</button>
              <button class="mark reset" data-mark="reset">⟲</button>
            </div>
          </div>
        `;
        if (mark) card.classList.add("opened");
        list.appendChild(card);

        card.querySelectorAll(".tag").forEach(tg => {
          tg.onclick = (ev) => { ev.stopPropagation(); setTagFilter(tg.dataset.tag); };
        });
        const hintBtn = card.querySelector(".hint-btn");
        if (hintBtn){
          hintBtn.onclick = (ev) => {
            ev.stopPropagation();
            const box = card.querySelector(".hint-box");
            const willOpen = !box.classList.contains("show");
            box.classList.toggle("show");
            hintBtn.classList.toggle("open");
            hintBtn.innerHTML = willOpen ? "💡 Hide" : "💡 Formula";
            state.hints[q.id] = willOpen;
            saveState(state);
            if (willOpen) typeset(box);
          };
        }
        const revealBtn = card.querySelector(".reveal-btn");
        if (revealBtn){
          revealBtn.onclick = () => { card.classList.add("opened"); typeset(card); };
        }
        card.querySelectorAll(".mark").forEach(btn => {
          btn.onclick = (ev) => {
            ev.stopPropagation();
            const action = btn.dataset.mark;
            if (action === "reset"){ delete state.marks[q.id]; }
            else { state.marks[q.id] = action; }
            saveState(state);
            renderStats();
            renderList();
          };
        });
      });
      if (count === 0){
        list.innerHTML = `<div class="empty">No questions match the current filter${activeTag ? ` (tag ${activeTag})`:""}.</div>`;
      }
      typeset(list);
    }

    buildFilters();
    renderStats();
    renderList();
    ensureInitialTypeset();
  };
})();
