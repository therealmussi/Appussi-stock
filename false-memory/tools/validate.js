/* Validazione dei dati di FALSE MEMORY: eseguire con node tools/validate.js */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
global.window = {};
eval(fs.readFileSync(path.join(root, 'js/data/evidence-data.js'), 'utf8'));
eval(fs.readFileSync(path.join(root, 'js/data/case-data.js'), 'utf8'));

const errors = [], warnings = [];
const E = window.FM_EVIDENCE, CH = window.FM_CHARACTERS, Q = window.FM_QUESTIONS;
const byId = Object.fromEntries(E.map(e => [e.id, e]));
const ids = new Set(E.map(e => e.id));

/* --- struttura statica --- */
if (E.length < 25) errors.push('prove < 25: ' + E.length);
const codes = new Set();
for (const e of E) {
  if (!e.id || !e.code || !byId[e.id]) errors.push('record incompleto: ' + JSON.stringify(e).slice(0, 40));
  if (codes.has(e.code)) errors.push('codice duplicato: ' + e.code);
  codes.add(e.code);
  if (!e.title || !e.short || !e.body) errors.push(e.id + ': titolo/short/body mancanti');
  if (!['photo', 'document', 'recording', 'object'].includes(e.cat)) errors.push(e.id + ': categoria non valida ' + e.cat);
}
const cats = { photo: 0, document: 0, recording: 0, object: 0 };
E.forEach(e => cats[e.cat]++);
if (cats.photo < 5 || cats.document < 7 || cats.recording < 5 || cats.object < 5)
  warnings.push('categorie sotto quota: ' + JSON.stringify(cats));

const actionOk = (a, owner) => {
  const m = /^(\w+):(.*)$/.exec(a || '');
  if (!m) { errors.push(owner + ': azione non valida ' + a); return false; }
  const kind = m[1], rest = m[2];
  if (kind === 'ev' || kind === 'ex') { if (!ids.has(rest.split(':')[0])) { errors.push(owner + ': azione verso prova inesistente ' + a); return false; } return true; }
  if (kind === 'flag') return true;
  if (kind === 'talk') { const who = rest.split(':')[0]; if (!CH[who]) { errors.push(owner + ': talk verso personaggio inesistente ' + a); return false; } return true; }
  if (kind === 'con') { const parts = rest.split(':'); if (!CH[parts[0]]) { errors.push(owner + ': con verso personaggio inesistente ' + a); return false; } if (parts[1] && !ids.has(parts[1])) { errors.push(owner + ': con verso prova inesistente ' + a); return false; } return true; }
  errors.push(owner + ': tipo azione sconosciuto ' + a); return false;
};
for (const e of E) {
  (e.prereqs || []).forEach(p => actionOk(p, e.id));
  (e.examines || []).forEach(ex => {
    if (ex.requires) actionOk(ex.requires, e.id + '/' + ex.id);
    (ex.unlocks || []).forEach(u => { if (!ids.has(u)) errors.push(e.id + '/' + ex.id + ': sblocca prova inesistente ' + u); });
  });
}
for (const who of Object.keys(CH)) {
  const c = CH[who];
  for (const t of c.topics || []) {
    (t.unlocks || []).forEach(u => { if (!ids.has(u)) errors.push(who + '/topic' + t.n + ': sblocca prova inesistente ' + u); });
    if (t.requires) actionOk(t.requires, who + '/topic' + t.n);
  }
  for (const k of Object.keys(c.confronts || {})) if (!ids.has(k)) errors.push(who + ': confronto verso prova inesistente ' + k);
  if (who !== 'daniel' && (c.topics || []).length < 3) errors.push(who + ': meno di 3 argomenti');
  if (who !== 'daniel' && !c.statement) errors.push(who + ': manca la dichiarazione scritta');
}

/* --- simulazione della progressione --- */
const discovered = new Set(E.filter(e => e.chapter <= 1 && !(e.prereqs || []).length).map(e => e.id));
const flags = new Set(), exams = new Set(), talks = new Set(), cons = new Set();
const MAXCH = 5;

function examAvailable(e, ex) {
  if (!discovered.has(e.id)) return false;
  if (ex.requires) {
    const m = /^flag:(.*)$/.exec(ex.requires);
    if (m && !flags.has(m[1])) return false;
  }
  return true;
}
function prereqMet(p) {
  const m = /^(\w+):(.*)$/.exec(p); if (!m) return false;
  if (m[1] === 'ev') return discovered.has(m[2]);
  if (m[1] === 'ex') { const t = byId[m[2]]; if (!t) return false; return (t.examines || []).some(x => examAvailable(t, x)) && exams.has(m[2]); }
  if (m[1] === 'flag') return flags.has(m[2]);
  if (m[1] === 'talk') return talks.has(m[2]);
  if (m[1] === 'con') { const parts = m[2].split(':'); return discovered.has(parts[1]); }
  return false;
}
function tryUnlock(u) {
  if (discovered.has(u)) return;
  const t = byId[u];
  if (t && t.chapter <= MAXCH && (!(t.prereqs || []).length || (t.prereqs || []).some(prereqMet))) discovered.add(u);
}

let changed = true, guard = 0;
while (changed && guard++ < 60) {
  changed = false;
  for (const e of E) if (discovered.has(e.id)) {
    for (const ex of e.examines || []) if (examAvailable(e, ex) && (!exams.has(e.id) || exams.has(e.id))) {
      exams.add(e.id);
      if (ex.setsFlag) flags.add(ex.setsFlag);
      (ex.unlocks || []).forEach(tryUnlock);
      changed = true;
      if (exams.has(e.id) && e.examines.length > 1) break;
    }
  }
  for (const who of ['claire', 'thomas', 'victor', 'elise']) {
    for (const t of CH[who].topics || []) {
      if (t.requires && !flags.has(t.requires)) continue;
      const key = who + ':' + t.n;
      if (!talks.has(key)) { talks.add(key); changed = true; if (t.setsFlag) flags.add(t.setsFlag); (t.unlocks || []).forEach(tryUnlock); }
    }
    for (const [evId, resp] of Object.entries(CH[who].confronts || {})) {
      if (discovered.has(evId) && !cons.has(who + ':' + evId)) { cons.add(who + ':' + evId); changed = true; (resp.flags || []).forEach(f => flags.add(f)); }
    }
  }
  for (const e of E) if (!discovered.has(e.id) && e.chapter <= MAXCH && (!(e.prereqs || []).length || (e.prereqs || []).some(prereqMet))) { discovered.add(e.id); changed = true; }
}
const missing = E.filter(e => !discovered.has(e.id)).map(e => e.id);
if (missing.length) errors.push('PROVE NON RAGGIUNGIBILI: ' + missing.join(', '));

/* flag richiesti ma mai impostabili */
const settable = new Set(flags);
for (const who of Object.keys(CH)) {
  (CH[who].topics || []).forEach(t => { if (t.setsFlag) settable.add(t.setsFlag); });
  Object.values(CH[who].confronts || {}).forEach(r => (r.flags || []).forEach(f => settable.add(f)));
}
for (const who of Object.keys(CH)) {
  (CH[who].topics || []).forEach(t => { if (t.requires && t.requires.startsWith('flag:') && !settable.has(t.requires.slice(5))) errors.push(who + ': topic richiede un flag mai impostato: ' + t.requires); });
}
for (const e of E) for (const ex of e.examines || []) {
  const m = ex.requires && /^flag:(.*)$/.exec(ex.requires);
  if (m && !settable.has(m[1])) errors.push(e.id + '/' + ex.id + ': flag mai impostato ' + ex.requires);
}
for (const e of E) for (const p of e.prereqs || []) {
  const m = /^flag:(.*)$/.exec(p);
  if (m && !settable.has(m[1])) errors.push(e.id + ': prerequisito flag mai impostato ' + p);
}

/* --- verita canonica, domande, capitoli --- */
const truth = window.FM_TRUTH;
for (const q of Q) {
  if (!q.options || q.options.length < 2) errors.push(q.id + ': opzioni insufficienti');
  if (!q.multi && truth[q.id] && !q.options.some(o => o.key === truth[q.id])) errors.push(q.id + ': verita canonica assente tra le opzioni (' + truth[q.id] + ')');
}
['whatHappened', 'lastInside', 'whyLeft'].forEach(k => { if (!truth[k]) errors.push('verita canonica incompleta: ' + k); });
for (const id of truth.essential) if (!ids.has(id)) errors.push('TRUTH.essential prova inesistente: ' + id);
for (const id of truth.misleading) if (!ids.has(id)) errors.push('TRUTH.misleading prova inesistente: ' + id);
if (!window.FM_CHAPTERS || window.FM_CHAPTERS.length !== 5) errors.push('capitoli != 5');

console.log('prove totali:', E.length, JSON.stringify(cats));
console.log('scoperte in simulazione:', discovered.size, 'di', E.length);
console.log('flags alla fine:', [...flags].sort().join(', '));
if (missing.length) console.log('mancanti:', missing.join(', '));
if (warnings.length) console.log('AVVISI:\n - ' + warnings.join('\n - '));
if (errors.length) { console.error('ERRORI:\n - ' + errors.join('\n - ')); process.exit(1); }
console.log('VALIDAZIONE OK');
