/**
 * KAVOSH Leaderboard Backend — Google Apps Script web app.
 * Persists the leaderboard as a single JSON file (kavosh_leaderboard.json)
 * on the deploying account's Google Drive.
 *
 *   GET  /exec            -> returns the current state as JSON
 *   POST /exec  (body)    -> overwrites the state with the posted JSON
 *
 * Deploy: New deployment -> Web app -> Execute as: Me,
 * Who has access: Anyone. Paste the /exec URL into config.js (window.LB_BACKEND).
 * Front end POSTs with Content-Type text/plain to avoid a CORS preflight.
 */

var FILE_NAME = 'kavosh_leaderboard.json';

function doGet() {
  return json_(readState_());
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var state = normalize_(data);
    writeState_(state);
    return json_({ ok: true, count: state.players.length });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function normalize_(data) {
  if (!data || typeof data !== 'object') data = {};
  var players = Array.isArray(data.players) ? data.players : [];
  var m = data.metric || {};
  return {
    title: String(data.title || 'Leaderboard').slice(0, 60),
    subtitle: String(data.subtitle || 'Season Standings').slice(0, 60),
    metric: {
      label: String(m.label || 'Score').slice(0, 24),
      unit: String(m.unit || '').slice(0, 12),
      lowerIsBetter: !!m.lowerIsBetter
    },
    players: players.map(function (p, i) {
      var val = (p.value != null ? p.value : p.score);
      return {
        id: p.id || Utilities.getUuid().slice(0, 8),
        name: String(p.name || '').slice(0, 60),
        value: Number(val) || 0,
        formula: (p.formula != null ? String(p.formula).slice(0, 120) : ''),
        change: Number(p.change) || 0,
        order: (p.order != null ? Number(p.order) : i)
      };
    })
  };
}

function readState_() {
  var it = DriveApp.getFilesByName(FILE_NAME);
  if (it.hasNext()) {
    try { return normalize_(JSON.parse(it.next().getBlob().getDataAsString())); }
    catch (e) {}
  }
  return { title: 'Leaderboard', subtitle: 'Season Standings',
           metric: { label: 'Score', unit: '', lowerIsBetter: false }, players: [] };
}

function writeState_(state) {
  var body = JSON.stringify(state);
  var it = DriveApp.getFilesByName(FILE_NAME);
  if (it.hasNext()) it.next().setContent(body);
  else DriveApp.createFile(FILE_NAME, body, MimeType.PLAIN_TEXT);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
