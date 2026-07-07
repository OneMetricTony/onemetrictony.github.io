# KAVOSH Leaderboard — deploy notes

Two static pages on GitHub Pages, one shared Drive-backed backend.

## Sites (after `git push`)
- **Display:** https://onemetrictony.github.io/kavosh/leaderboard/ — public scoreboard, top 3 (toggle 3/4), auto-refreshes every 15s.
- **Data entry:** https://onemetrictony.github.io/kavosh/leaderboard/admin.html — add / edit / remove players, rename board. Writes to Drive.

Both work immediately in **local mode** (localStorage, per-browser) with no backend. To make the two sites share one source of truth, deploy the backend below and paste its URL into `config.js`.

## Backend (persists to Drive) — one-time setup
1. Go to https://script.google.com (Calabi Yau account, same one that hosts the gossip backend).
2. **New project** → name it `KAVOSH Leaderboard Backend`.
3. Replace `Code.gs` contents with this folder's `Code.gs`. Save.
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Authorize when prompted. Copy the **/exec** URL.
6. Paste it into `config.js`:
   ```js
   window.LB_BACKEND = "https://script.google.com/macros/s/…/exec";
   ```
7. `git add` + `commit` + `push`.

State lives in `kavosh_leaderboard.json` on Drive. Shape:
```json
{ "title": "Leaderboard", "subtitle": "Season Standings",
  "players": [ { "id": "abc1234", "name": "Nadia Okonkwo", "score": 2840, "change": 120 } ] }
```

Redeploys: after editing `Code.gs`, use **Deploy → Manage deployments → edit → new version** so the `/exec` URL stays the same.
