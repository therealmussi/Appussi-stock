'use strict';
window.EHL = window.EHL || {};
(function (E) {
  const CORE = E.Core = {};

  CORE.START_YEAR = 2026;
  CORE.DPM = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  CORE.MPD = 1440;

  /* ---- RNG deterministico (mulberry32) ---- */
  function mulberry32(s) {
    let t = s >>> 0;
    return function () {
      t = (t + 0x6D2B79F5) >>> 0;
      let r = Math.imul(t ^ (t >>> 15), t | 1);
      r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
  function RNG(seed) { this.f = mulberry32(seed); this.seed = seed >>> 0; }
  RNG.prototype.next = function () { return this.f(); };
  RNG.prototype.int = function (a, b) { return a + Math.floor(this.next() * (b - a + 1)); };
  RNG.prototype.float = function (a, b) { return a + this.next() * (b - a); };
  RNG.prototype.pick = function (arr) { return arr[Math.floor(this.next() * arr.length)]; };
  RNG.prototype.chance = function (p) { return this.next() < p; };
  RNG.prototype.gauss = function (mean, sd) {
    const u = Math.max(this.next(), 1e-9);
    const v = this.next();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  RNG.prototype.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  };
  CORE.RNG = RNG;

  CORE.clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  CORE.lerp = function (a, b, t) { return a + (b - a) * CORE.clamp(t, 0, 1); };

  /* ---- Tempo simulato (minuti dal 1/1/2026 00:00; anni di 365 giorni) ---- */
  CORE.dateFromMinutes = function (min) {
    const dayIndex = Math.floor(min / CORE.MPD);
    const y = CORE.START_YEAR + Math.floor(dayIndex / 365);
    let doy = dayIndex % 365;
    let m = 0;
    while (doy >= CORE.DPM[m]) { doy -= CORE.DPM[m]; m++; }
    return {
      year: y, month: m + 1, day: doy + 1,
      hour: Math.floor((min % 1440) / 60),
      minute: Math.floor(min % 60),
      weekday: dayIndex % 7,
      season: CORE.seasonOf(m + 1),
      dayIndex
    };
  };
  CORE.seasonOf = function (month) {
    if (month >= 3 && month <= 5) return 'Primavera';
    if (month >= 6 && month <= 8) return 'Estate';
    if (month >= 9 && month <= 11) return 'Autunno';
    return 'Inverno';
  };

  CORE.dayOfDate = function (year, month, day) {
    let idx = (year - CORE.START_YEAR) * 365;
    for (let m = 0; m < month - 1; m++) idx += CORE.DPM[m];
    return idx + (day - 1);
  };
  CORE.fmtDate = function (d) {
    const G = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
    const M = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
    return G[d.weekday] + ' ' + d.day + ' ' + M[d.month - 1] + ' ' + d.year;
  };
  CORE.fmtTime = function (h, mi) { return String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0'); };

  CORE.age = function (c, minutes) {
    return Math.floor((Math.floor(minutes / CORE.MPD) - c.birthIdx) / 365);
  };

  CORE.digest = function (obj) {
    const json = JSON.stringify(obj);
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < json.length; i++) {
      const ch = json.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  };

  CORE.stateDigest = function (S) {
    const cs = Object.values(S.citizens).map(c => ({
      i: c.id, a: CORE.age(c, S.minutes), home: c.homeId, sp: c.spouse,
      job: c.job ? c.job.title + '@' + c.job.buildingId : null, al: c.alive, ab: c.abroad,
      nr: Object.keys(c.rels).length
    }));
    return CORE.digest({ m: S.minutes, cs, ev: S.events.length });
  };

  /* ---- Storage ---- */
  CORE.save = function (key, obj) {
    try {
      const raw = JSON.stringify(obj);
      if (raw.length > 4.5 * 1024 * 1024) return 'too-big';
      localStorage.setItem(key, raw);
      return 'ok';
    } catch (e) { return 'error'; }
  };
  CORE.load = function (key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  };
  CORE.remove = function (key) {
    try { localStorage.removeItem(key); } catch (e) { /* blob */ }
  };
  CORE.stripEphemeral = function (obj) {
    return JSON.parse(JSON.stringify(obj, (k, v) => (k.charAt(0) === '_') ? undefined : v));
  };
})(window.EHL);
