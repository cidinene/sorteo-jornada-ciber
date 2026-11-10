/**
 * Jornada de Ciberseguridad · Sorteo del décimo
 * Backend en Google Apps Script. Guarda los registros en esta hoja de cálculo.
 *
 * 1. Cambia ADMIN_KEY por una clave tuya.
 * 2. Implementar > Nueva implementación > Aplicación web
 *    Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario
 * 3. Copia la URL que termina en /exec y pégala en config.js
 */
const ADMIN_KEY = 'cambia-esta-clave';
const N_GANADORES = 10;

const SHEET = 'Registros';
const HEAD = ['id', 'fecha', 'nombre', 'email', 'consentimiento', 'abrioCondiciones', 'leyoHastaElFinal',
  'segundosEnAceptar', 'ip', 'sistema', 'modelo', 'navegador', 'userAgent', 'dispositivoJSON', 'ganador'];

// ---------- entrada ----------
function doGet(e) { return handle(e.parameter || {}, null); }
function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents || '{}'); } catch (_) {}
  return handle(e.parameter || {}, body);
}
function out(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function handle(q, body) {
  try {
    const a = q.action || (body && body.action);
    if (a === 'register') return out(register(body || {}));
    if (a === 'state') return out(getState());
    if (a === 'me') return out(me(q.id));
    // admin
    const key = q.key || (body && body.key);
    if (String(a || '').indexOf('admin_') === 0) {
      if (key !== ADMIN_KEY) return out({ error: 'clave incorrecta', status: 403 });
      if (a === 'admin_data') return out(adminData());
      if (a === 'admin_reveal') { setProp('revealed', q.off ? '' : '1'); clearCache(); return out({ ok: true }); }
      if (a === 'admin_draw') return out(draw());
      if (a === 'admin_wipe') return out(wipe());
      if (a === 'admin_reset') return out(reset());
    }
    return out({ error: 'acción desconocida' });
  } catch (err) {
    return out({ error: String(err) });
  }
}

// ---------- almacenamiento ----------
function sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) { sh = ss.insertSheet(SHEET); sh.appendRow(HEAD); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold'); }
  return sh;
}
function rows() {
  const sh = sheet(), n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, HEAD.length).getValues().map((r, i) => {
    const o = { _row: i + 2 }; HEAD.forEach((h, j) => o[h] = r[j]); return o;
  });
}
const props = () => PropertiesService.getScriptProperties();
function getProp(k) { return props().getProperty(k) || ''; }
function setProp(k, v) { props().setProperty(k, v); }
function clearCache() { CacheService.getScriptCache().remove('state'); }

function clean(s, max) { return String(s || '').replace(/[<>=]/g, '').replace(/^[+\-@]/, '').trim().slice(0, max || 80); }
function shortName(n) { const p = String(n).split(/\s+/).filter(Boolean); return p.length > 1 ? p[0] + ' ' + p[1][0].toUpperCase() + '.' : (p[0] || 'Anónimo'); }

// ---------- acciones ----------
function register(b) {
  const name = clean(b.name, 60), email = clean(b.email, 100).toLowerCase();
  if (name.length < 2) return { error: 'Indica tu nombre' };
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const all = rows();
    const ex = all.find(r => (b.pid && r.id === b.pid) || (email && r.email === email));
    if (ex) return { id: ex.id, already: true };
    const consent = b.consent === 'all' ? 'all' : 'necessary';
    const full = consent === 'all';
    const s = full ? (b.summary || {}) : {};
    let dev = full && b.device ? JSON.stringify(b.device) : '';
    if (dev.length > 8000) dev = '';
    const id = Utilities.getUuid().replace(/-/g, '').slice(0, 12);
    sheet().appendRow([id, new Date(), name, email, consent, !!b.openedTerms, !!b.reader,
      Math.round(Number(b.secondsToAccept) || 0), full ? clean(b.ip, 60) : '', clean(s.os), clean(s.model), clean(s.browser),
      full ? clean(b.ua, 400) : '', dev.replace(/[<>]/g, ''), '']);
    clearCache();
    return { id: id };
  } finally { lock.releaseLock(); }
}

function getState() {
  const c = CacheService.getScriptCache(), hit = c.get('state');
  if (hit) return JSON.parse(hit);
  const all = rows();
  const st = {
    revealed: getProp('revealed') === '1',
    count: all.length,
    winners: all.filter(r => r.ganador).map(r => ({ id: r.id, name: shortName(r.nombre) })),
  };
  c.put('state', JSON.stringify(st), 60);
  return st;
}

function me(id) {
  const r = rows().find(x => x.id === id);
  if (!r) return { error: 'no encontrado' };
  if (getProp('revealed') !== '1') return { id: r.id, name: r.nombre, revealed: false };
  let device = null; try { device = r.dispositivoJSON ? JSON.parse(r.dispositivoJSON) : null; } catch (_) {}
  return { revealed: true, id: r.id, name: r.nombre, email: r.email, consent: r.consentimiento, openedTerms: r.abrioCondiciones,
    secondsToAccept: r.segundosEnAceptar, ip: r.ip, ua: r.userAgent, summary: { os: r.sistema, model: r.modelo, browser: r.navegador }, device };
}

function adminData() {
  const all = rows();
  return {
    revealed: getProp('revealed') === '1',
    winners: all.filter(r => r.ganador).sort((a, b) => a.ganador - b.ganador).map(r => r.id),
    participants: all.map(r => {
      const full = r.consentimiento === 'all';
      let device = null; try { device = full && r.dispositivoJSON ? JSON.parse(r.dispositivoJSON) : null; } catch (_) {}
      return { id: r.id, name: shortName(r.nombre), consent: r.consentimiento, openedTerms: r.abrioCondiciones === true,
        reader: r.leyoHastaElFinal === true, secondsToAccept: Number(r.segundosEnAceptar) || 0,
        summary: full ? { os: r.sistema, model: r.modelo, browser: r.navegador } : null, device: device,
        ipMasked: full && r.ip ? String(r.ip).replace(/(\d+)\.(\d+)$/, 'x.x').replace(/:[0-9a-f]*:[0-9a-f]*$/i, ':…') : null };
    }),
  };
}

function draw() {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const all = rows(), sh = sheet(), col = HEAD.indexOf('ganador') + 1;
    if (all.length) sh.getRange(2, col, all.length, 1).clearContent();
    const pool = all.slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    const win = pool.slice(0, N_GANADORES);
    win.forEach((r, i) => sh.getRange(r._row, col).setValue(i + 1));
    clearCache();
    return { winners: win.map(r => r.id) };
  } finally { lock.releaseLock(); }
}

function wipe() {
  // Borra los datos técnicos y conserva nombre, correo y ganadores
  const all = rows(), sh = sheet();
  ['ip', 'sistema', 'modelo', 'navegador', 'userAgent', 'dispositivoJSON'].forEach(h => {
    if (all.length) sh.getRange(2, HEAD.indexOf(h) + 1, all.length, 1).clearContent();
  });
  return { ok: true };
}

function reset() {
  const sh = sheet(), n = sh.getLastRow();
  if (n > 1) sh.deleteRows(2, n - 1);
  setProp('revealed', ''); clearCache();
  return { ok: true };
}
