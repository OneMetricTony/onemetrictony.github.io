/* Tony Physics — shared banner, affirmation popup, and Help-Tony alarm.
   Include on every page:  <script src="/tony.js" defer></script>            */
(function () {
  var TONY_PHONE = "+16476066942"; // 647 606 6942

  /* ---------- reassuring quotes (rotate at the top of every page) ------- */
  var QUOTES = [
    "You are not a number on a test.",
    "Effort compounds. Keep going.",
    "You are capable of beautiful, difficult things.",
    "A hard day is not a verdict on your future.",
    "Understanding takes time — you are right on schedule.",
    "Mistakes are proof that you are trying.",
    "Be proud of how far you have come.",
    "Progress, not perfection.",
    "Showing up today already matters.",
    "Even in a hard world, we keep moving forward.",
    "You are stronger than this problem set."
  ];

  /* ---------- the serious 1/1 self-check (reassuring answers) ----------- */
  var QUESTIONS = [
    { q: "Are you beautiful?", affirm: "YES" },
    { q: "Did you waste Tony's time?", affirm: "NO" },
    { q: "Does this course's performance represent you as a person?", affirm: "NO" },
    { q: "Are you a hard worker?", affirm: "YES" },
    { q: "Are you allowed to be proud of yourself?", affirm: "YES" },
    { q: "Is one tough grade the end of the world?", affirm: "NO" },
    { q: "Are you capable of difficult things?", affirm: "YES" },
    { q: "Do you deserve kindness — especially from yourself?", affirm: "YES" }
  ];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function enc(s) { return encodeURIComponent(s); }

  /* ---------- popup cooldown: never re-fire while she's using the site -----
     The "Welcome back, Lucy" popup is gated by ONE persistent timestamp in
     localStorage, so the browser Back button, scrolling/navigating back and
     forth, bfcache restores, and extra tabs all stay quiet — it cannot show
     again until she's been away for POPUP_GAP_MS. When it does fire it
     advances the question index so each appearance is fresh and never repeats
     the previous one. (The top banner quote is independent — it rotates freely.) */
  var POPUP_GAP_MS = 6 * 60 * 60 * 1000;   // ~6h — a whole study session won't re-trigger it
  function lsGet(k){ try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v){ try { localStorage.setItem(k, v); } catch (e) {} }
  function storedIndex(key, len){
    var n = parseInt(lsGet(key) || "0", 10);
    if (isNaN(n) || n < 0) n = 0;
    return n % len;
  }
  // Eligible only if we've never shown it, or the cooldown has fully elapsed.
  function popupEligible(){
    var at = parseInt(lsGet("tphys_popup_at") || "0", 10);
    return !at || (Date.now() - at >= POPUP_GAP_MS);
  }
  // Stamp the time and advance the question index so the next one differs.
  function openPopupWindow(){
    lsSet("tphys_popup_at", String(Date.now()));
    lsSet("tphys_pi", String(parseInt(lsGet("tphys_pi") || "-1", 10) + 1));
  }

  /* ---------- inject styles -------------------------------------------- */
  var css = `
  .tphys-banner{font-family:"EB Garamond",Georgia,serif;background:#0d0d0d;color:#f3f1ea;
    border-bottom:3px double #f3f1ea;padding:14px 16px;text-align:center;position:relative;z-index:5}
  .tphys-banner .lab{font-family:"Oswald",Arial,sans-serif;font-size:10px;letter-spacing:.42em;
    text-transform:uppercase;opacity:.65;margin-bottom:5px}
  .tphys-quote{font-size:1.06rem;font-style:italic;min-height:1.5em;transition:opacity .6s;line-height:1.4}
  .tphys-quote::before,.tphys-quote::after{content:"";display:inline-block;width:5px;height:5px;
    background:#f3f1ea;transform:rotate(45deg);vertical-align:middle;margin:0 12px;opacity:.7}

  .tphys-help{position:fixed;right:16px;bottom:16px;z-index:40;display:flex;align-items:center;gap:8px;
    background:#0d0d0d;color:#f3f1ea;border:2px solid #0d0d0d;text-decoration:none;
    font-family:"Oswald",Arial,sans-serif;font-size:13px;letter-spacing:.12em;text-transform:uppercase;
    padding:12px 16px;border-radius:0;box-shadow:0 3px 12px rgba(0,0,0,.35);cursor:pointer}
  .tphys-help:active{transform:scale(.96)}
  .tphys-help .pulse{width:9px;height:9px;border-radius:50%;background:#fff;
    box-shadow:0 0 0 0 rgba(255,255,255,.7);animation:tphysPulse 1.8s infinite}
  @keyframes tphysPulse{0%{box-shadow:0 0 0 0 rgba(255,255,255,.6)}70%{box-shadow:0 0 0 9px rgba(255,255,255,0)}100%{box-shadow:0 0 0 0 rgba(255,255,255,0)}}

  .tphys-ovl{position:fixed;inset:0;z-index:100;background:rgba(8,8,8,.86);
    display:flex;align-items:center;justify-content:center;padding:22px;
    backdrop-filter:blur(2px);animation:tphysFade .4s ease}
  @keyframes tphysFade{from{opacity:0}to{opacity:1}}
  .tphys-box{font-family:"EB Garamond",Georgia,serif;background:#f3f1ea;color:#0d0d0d;
    max-width:430px;width:100%;border:2px solid #0d0d0d;box-shadow:0 0 0 4px #f3f1ea,0 0 0 6px #0d0d0d;
    padding:26px 24px 22px;position:relative}
  .tphys-box::before{content:"";position:absolute;top:8px;left:8px;right:8px;bottom:8px;
    border:1px solid rgba(13,13,13,.25);pointer-events:none}
  .tphys-sys{font-family:"Oswald",Arial,sans-serif;font-size:10px;letter-spacing:.4em;
    text-transform:uppercase;text-align:center;opacity:.7;margin-bottom:4px}
  .tphys-welcome{text-align:center;font-size:1.45rem;font-style:italic;margin:8px 0 2px}
  .tphys-idx{font-family:"Oswald",Arial,sans-serif;text-align:center;font-size:12px;letter-spacing:.3em;
    margin-bottom:18px}
  .tphys-q{font-size:1.5rem;line-height:1.35;text-align:center;margin:6px 6px 22px;font-style:italic}
  .tphys-ans{display:flex;gap:12px}
  .tphys-ans button{flex:1;font-family:"Oswald",Arial,sans-serif;font-size:16px;letter-spacing:.18em;
    padding:14px 0;background:#f3f1ea;color:#0d0d0d;border:2px solid #0d0d0d;cursor:pointer;text-transform:uppercase}
  .tphys-ans button:active{transform:scale(.97)}
  .tphys-ans button:hover{background:#0d0d0d;color:#f3f1ea}
  .tphys-msg{text-align:center;min-height:1.2em;margin-top:14px;font-size:1.05rem;font-style:italic}
  .tphys-shake{animation:tphysShake .4s}
  @keyframes tphysShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}
  .tphys-cont{display:block;margin:16px auto 0;font-family:"Oswald",Arial,sans-serif;letter-spacing:.18em;
    text-transform:uppercase;font-size:13px;background:#0d0d0d;color:#f3f1ea;border:2px solid #0d0d0d;
    padding:11px 26px;cursor:pointer}
  `;
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* ---------- quote banner --------------------------------------------- */
  function mountBanner() {
    var b = document.createElement("div");
    b.className = "tphys-banner";
    b.innerHTML = '<div class="lab">Tony Physics</div><div class="tphys-quote"></div>';
    document.body.insertBefore(b, document.body.firstChild);
    var qEl = b.querySelector(".tphys-quote");
    // Banner is decorative, not a nag — fresh random quote each page load,
    // then rotates every 8.5s. Independent of the popup cooldown.
    var i = Math.floor(Math.random() * QUOTES.length);
    qEl.textContent = QUOTES[i];
    setInterval(function () {
      qEl.style.opacity = "0";
      setTimeout(function () {
        i = (i + 1) % QUOTES.length;
        qEl.textContent = QUOTES[i];
        qEl.style.opacity = "1";
      }, 600);
    }, 8500);
  }

  /* ---------- help alarm (opens Messages to Tony) ---------------------- */
  function mountHelp() {
    var body = "Hey Tony, I'm stuck and could use a hand! Let me know when you're free ~";
    var a = document.createElement("a");
    a.className = "tphys-help";
    a.href = "sms:" + TONY_PHONE + "?&body=" + enc(body);
    a.innerHTML = '<span class="pulse"></span> Help · Text Tony';
    document.body.appendChild(a);
  }

  /* ---------- affirmation popup (every visit) -------------------------- */
  function mountPopup() {
    var item = QUESTIONS[storedIndex("tphys_pi", QUESTIONS.length)];
    var ovl = document.createElement("div");
    ovl.className = "tphys-ovl";
    ovl.innerHTML =
      '<div class="tphys-box" role="dialog" aria-modal="true">' +
        '<div class="tphys-sys">System Check · Mandatory</div>' +
        '<div class="tphys-welcome">Welcome back, Lucy</div>' +
        '<div class="tphys-idx">1 / 1</div>' +
        '<div class="tphys-q">' + item.q + '</div>' +
        '<div class="tphys-ans"><button data-v="YES">Yes</button><button data-v="NO">No</button></div>' +
        '<div class="tphys-msg"></div>' +
      '</div>';
    document.body.appendChild(ovl);
    var box = ovl.querySelector(".tphys-box");
    var msg = ovl.querySelector(".tphys-msg");
    var ans = ovl.querySelector(".tphys-ans");
    ans.addEventListener("click", function (e) {
      var btn = e.target.closest("button"); if (!btn) return;
      if (btn.getAttribute("data-v") === item.affirm) {
        ans.style.display = "none";
        msg.innerHTML = "Correct. Don't forget it. &#9829;";
        var cont = document.createElement("button");
        cont.className = "tphys-cont"; cont.textContent = "Begin";
        cont.addEventListener("click", function () { ovl.remove(); });
        box.appendChild(cont);
      } else {
        box.classList.remove("tphys-shake"); void box.offsetWidth; box.classList.add("tphys-shake");
        msg.textContent = "Incorrect. Try again — and be honest with yourself.";
      }
    });
  }

  function init() {
    // Pages can opt out of the "Welcome back, Lucy" popup (e.g. the neutral
    // course directory) via <body data-no-popup> or window.TPHYS_NO_POPUP.
    var skip = window.TPHYS_NO_POPUP ||
      (document.body && document.body.hasAttribute("data-no-popup"));
    // Show only when the cooldown has elapsed — never on back/forth navigation.
    var showPopup = !skip && popupEligible();
    if (showPopup) openPopupWindow();   // stamp + advance indices BEFORE rendering
    mountBanner(); mountHelp();
    if (showPopup) mountPopup();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
