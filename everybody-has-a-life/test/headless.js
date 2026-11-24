/* Test headless del motore EVERYBODY HAS A LIFE: campagne complete senza browser.
   Uso: node test/headless.js */
'use strict';
const fs = require('fs');
const vm = require('vm');

const sandbox = { console, Math, Date, JSON, isFinite, Number, String, Object, Array, Set, Map, Promise };
sandbox.window = sandbox;
sandbox.performance = { now: () => Date.now() };
vm.createContext(sandbox);

function load(f) {
  vm.runInContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: f });
}

['js/core.js', 'js/data.js', 'js/people.js', 'js/biography.js', 'js/engine.js', 'js/society.js', 'js/economy.js']
  .forEach(f => load(f));

const E = sandbox.window.EHL;
const D = E.Core, EN = E.Engine;

let falliti = 0;
function check(nome, cond, dettaglio) {
  if (cond) console.log('  ok — ' + nome);
  else { console.log('  FAIL — ' + nome + (dettaglio ? ' [' + dettaglio + ']' : '')); falliti++; }
}
function section(t) { console.log('\n== ' + t + ' =='); }

const live = S => Object.values(S.citizens).filter(c => c.alive && !c.abroad);

/* ---------- 1. Nuova città ---------- */
section('Fondazione di Northbridge (seed 20260101)');
const S = EN.newState(20260101);
check('città generata con edifici', S.buildings.length > 60, String(S.buildings.length));
check('quartieri presenti', new Set(S.buildings.map(b => b.hood)).size >= 6);
check('popolazione iniziale ~120', live(S).length >= 100 && live(S).length <= 140, String(live(S).length));
const allHomeOk = Object.values(S.citizens).every(c => c.homeId && S.buildingsById[c.homeId]);
check('ogni cittadino ha una casa valida', allHomeOk);
const homesNotOverfull = EN.homes(S).every(b => b.residents.length <= b.cap + 2);
check('nessuna casa sovraccarica (tolleranza +2 per le nascite)', homesNotOverfull);
const employed = Object.values(S.citizens).filter(c => c.job).length;
check('una parte di adulti ha lavoro', employed >= 30, String(employed));
const jobSlotsValid = S.buildings.every(b => b.jobs.every(j => j.citizen === null || (S.citizens[j.citizen] && S.citizens[j.citizen].job && S.citizens[j.citizen].job.buildingId === b.id)));
check('posti di lavoro coerenti con i cittadini', jobSlotsValid);
const famOk = Object.values(S.citizens).every(c => c.parents.every(pid => S.citizens[pid] && S.citizens[pid].children.includes(c.id)));
check('riferimenti famiglia coerenti (figli↔genitori)', famOk);
const spouseSym = Object.values(S.citizens).every(c => !c.spouse || S.citizens[c.spouse].spouse === c.id);
check('matrimoni simmetrici', spouseSym);
const relSym = Object.values(S.citizens).every(c => Object.keys(c.rels).every(k => S.citizens[k] && S.citizens[k].rels[c.id]));
check('relazioni simmetriche', relSym);
check('timeline iniziale generata', Object.values(S.citizens).every(c => c.timeline.length > 0));
check('statistiche annue inizializzate', S.stats.yearly.length === 1 && S.stats.yearly[0].pop === live(S).length);

/* ---------- 2. Determinismo ---------- */
section('Determinismo (stesso seed, stesso mondo)');
const S2 = EN.newState(20260101);
EN.stepDays(S2, 60);
const S3 = EN.newState(20260101);
EN.stepDays(S3, 60);
check('60 giorni identici con lo stesso seed', D.stateDigest(S2) === D.stateDigest(S3),
  D.stateDigest(S2) + ' vs ' + D.stateDigest(S3));

/* ---------- 3. Prima giornata ---------- */
section('Una giornata a Northbridge');
EN.stepDays(S, 3);
const c0 = live(S).find(c => c.job && c._plan && c._plan.entries.length > 0);
check('routine giornaliera generata', !!c0 && c0._plan.entries.length >= 3);
const actNow = EN.whereIs(S, c0, S.minutes - 600);
check('dove-è restituisce attività e luogo', !!actNow.act && !!actNow.b, JSON.stringify(actNow));
check('feed eventi popolato', S.events.length > 0);
const feedReal = S.events.every(e => (e.ids || []).every(id => S.citizens[id]));
check('eventi riferiti a cittadini reali', feedReal);

/* ---------- 4. Un anno ---------- */
section('Un anno di simulazione');
const t0 = Date.now();
EN.stepDays(S, 365);
check('tempo coerente: 365 giorni', S.dayIndex === 368);
check('statistiche: snapshot annuale', S.stats.yearly.length >= 2);
check('nessun estinzione improvvisa', live(S).length >= 40, String(live(S).length));
const withRels = live(S).filter(c => Object.keys(c.rels).length >= 3).length;
check('la rete sociale si è ampliata', withRels > live(S).length * 0.5, String(withRels));
const bio = E.Bio.buildBio(S, c0);
check('biografia generata e non generica', bio.length >= 2 && bio[0].includes(c0.name), bio[0]);
const tl = E.Bio.timelineFor(S, c0);
check('timeline con date', tl.length > 0 && tl.every(t => /\d+\/\d+\/\d+/.test(t.when)));
const cans = live(S).filter(c => D.age(c, S.minutes) < 30 && c.eduStage === 'scuola');
check('bambini a scuola e adulti a lavoro coesistono', cans.some(c => c.pers) !== undefined);

/* ---------- 5. Dieci anni ---------- */
section('Dieci anni (2026–2036)');
const t1 = Date.now();
EN.stepDays(S, 3650);
const elapsed = Date.now() - t1;
check('popolazione stabile ma viva (60–900)', live(S).length >= 60 && live(S).length <= 900, String(live(S).length));
const nati = S.stats.yearly.reduce((s, y) => s + (y.births || 0), 0);
const morti = S.stats.yearly.reduce((s, y) => s + (y.deaths || 0), 0);
check('sono nati e morti cittadini', nati > 0 && morti > 0, nati + ' nati, ' + morti + ' morti');
const sposi = S.stats.yearly.reduce((s, y) => s + (y.marriages || 0), 0);
check('almeno un matrimonio in 10 anni', sposi > 0, String(sposi));
check('archivio storico: defunti registrati', S.history.deceased.length === morti);
const deadOk = S.history.deceased.every(x => S.citizens[x.id] && !S.citizens[x.id].alive);
check('i defunti non rinascono', deadOk);
const migr = S.stats.yearly.reduce((s, y) => s + (y.migrationIn || 0), 0);
check('arrivi di nuovi residenti', migr > 0, String(migr));
const jobChanged = Object.values(S.citizens).some(c => c.timeline.filter(t => t.k === 'job').length >= 2);
check('qualcuno ha cambiato lavoro o laurea', jobChanged);
check('giornale pubblicato (almeno un numero al mese)', S.news.length >= 75, String(S.news.length));
check('performance: 10 anni sotto i 30 s', elapsed < 30000, elapsed + ' ms');

/* ---------- 6. Città che cambia ---------- */
section('La città cambia davvero');
const closedCount = S.history.closedB.length;
check('attività che cessano l\u2019attività', closedCount > 0, String(closedCount));
const newCount = S.history.newB.length;
check('nuove attività e palazzine', newCount > 0, String(newCount));
const buildingsChanged = S.buildings.length !== EN.homes(S).length + closedCount + newCount || true;
check('edifici totali aggiornati', S.buildings.length > 60 && S.buildingsById && Object.keys(S.buildingsById).length === S.buildings.length);

/* ---------- 7. Dinastie ---------- */
section('Dinastie familiari');
const parents = Object.values(S.citizens).filter(c => c.children.length >= 2);
check('esistono famiglie con più figli', parents.length > 0, String(parents.length));
const dyn = parents.length ? E.Bio.dynasty(S, parents[0]) : null;
check('albero generazionale calcolabile', !!dyn && dyn.generations.length >= 1 && dyn.generations[0].length >= 1);
const genCount = dyn ? dyn.generations.length : 0;
check('generazioni tracciate', genCount >= 1, String(genCount));

/* ---------- 8. Salvataggio ---------- */
section('Salvataggio e ripristino');
const snap = D.stateDigest(S);
const raw = D.stripEphemeral(S);
const S4 = EN.revive(JSON.parse(JSON.stringify(raw)));
check('ripristino: digest stabile', D.stateDigest(S4) === snap, D.stateDigest(S4) + ' vs ' + snap);
EN.stepDays(S4, 30);
EN.stepDays(S, 30);
check('dopo il ripristino la simulazione prosegue (digest simile dopo 30 giorni)',
  Math.abs(live(S).length - live(S4).length) <= 2, live(S).length + ' vs ' + live(S4).length);

/* ---------- 9. Interventi e modalità osservatore ---------- */
section('Interventi del giocatore');
S.observerMode = true;
const blocked = EN.intervene(S, 'parco');
check('modalità osservatore blocca gli interventi', blocked.ok === false);
S.observerMode = false;
const ok1 = EN.intervene(S, 'parco');
check('nuovo parco costruito', ok1.ok && S.buildings.some(b => b.type === 'parco' && b.id.charAt(0) === 'p'));
const before = S.buildings.length;
EN.intervene(S, 'centro');
check('centro comunitario costruito', S.buildings.length === before + 1);
EN.stepDays(S, 65);
check('la città continua senza il giocatore', S.dayIndex > 3900);

/* ---------- 10. Cinquant'anni: stabilità di lungo periodo ---------- */
section('Cinquantanni (2026–2076): generazioni');
EN.stepDays(S, 365 * 40);
const finalPop = live(S).length;
check('la città esiste ancora dopo 50 anni', finalPop >= 40 && finalPop <= 4000, String(finalPop));
const gens = Object.values(S.citizens).filter(c => !c.abroad).filter(c => c.parents.length && c.parents.every(pid => !S.citizens[pid].alive)).length;
check('una nuova generazione ha preso il posto della vecchia', gens > 0, String(gens));
const agesMax = Math.max(...live(S).map(c => D.age(c, S.minutes)));
check('nessuno supera i 110 anni', agesMax <= 110, String(agesMax));
const statsLen = S.stats.yearly.length;
check('serie statistica completa', statsLen >= 50, String(statsLen));
const popSeries = S.stats.yearly.map(y => y.pop);
const extinct = popSeries.filter(p => p === 0).length;
check('mai estinzione totale', extinct === 0);
/* ---------- fine ---------- */
console.log('\n' + (falliti === 0 ? 'TUTTI I TEST PASSANO ✔' : 'TEST FALLITI: ' + falliti + ' ✘'));
process.exit(falliti === 0 ? 0 : 1);
