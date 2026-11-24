/* Test headless del motore PARALLEL: esegue campagne complete senza browser.
   Uso: node test/headless.js */
'use strict';
const fs = require('fs');
const vm = require('vm');

const sandbox = { console, Math, Date, JSON, isFinite, Number, String, Object, Array };
sandbox.window = sandbox;
vm.createContext(sandbox);

function load(f) {
  vm.runInContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: f });
}

['js/core.js', 'js/data-torino.js', 'js/data-torino-contenuti.js', 'js/engine.js', 'js/actions.js', 'js/map.js']
  .forEach(f => load(f));

const PAR = sandbox.PAR;
let falliti = 0;
function check(nome, cond, dettaglio) {
  if (cond) { console.log('  ok — ' + nome); }
  else { console.log('  FAIL — ' + nome + (dettaglio ? ' [' + dettaglio + ']' : '')); falliti++; }
}

function nuovoGioco(seed) {
  PAR.Engine.rebindScenario(PAR.SCENARIOS[0]);
  return PAR.newState('torino1962', seed || 84543);
}

function flush(S) {
  if (S.pendingEvents.length) {
    S.activeEvents = S.activeEvents.concat(S.pendingEvents);
    S.pendingEvents = [];
  }
  while (S.activeEvents.length) {
    PAR.Actions.resolveEvent(S, S.activeEvents[0], 0);
  }
  while (S.pendingDecisions.length) {
    PAR.Actions.resolveDecision(S, S.pendingDecisions[0].id, 0);
  }
}

function corri(S, fino, scegli) {
  while (S.year < fino) {
    PAR.Engine.simulateYear(S);
    flush(S);
    if (scegliEProgetti) scegli && scegli(S);
  }
}
let scegliEProgetti = true;

// ————————————————— TEST 1: consistenza dello stato iniziale —————————————————
console.log('\\n[1] stato iniziale');
const S1 = nuovoGioco(1);
{
  const D = S1.systems.demografia;
  const abit = S1.territorio.distretti.reduce((a, d) => a + d.abitazioni, 0);
  const occ = S1.territorio.distretti.reduce((a, d) => a + d.occupati, 0);
  check('popolazione ~1 mln', D.popolazione > 900000 && D.popolazione < 1150000, D.popolazione);
  check('abitazioni coerenti con la popolazione', Math.abs(abit - D.popolazione / D.dimensioneHH) / (D.popolazione / D.dimensioneHH) < 0.05, abit + ' vs ' + (D.popolazione / D.dimensioneHH).toFixed(0));
  check('shares di mobilità sommano a 1', Math.abs(S1.systems.trasporti.shareAuto + S1.systems.trasporti.shareTpubb + S1.systems.trasporti.shareAttivo - 1) < 0.001);
  check('occupati per distretto ~ occupati di sistema', Math.abs(occ - S1.systems.economia.occupati) / S1.systems.economia.occupati < 0.12, occ + ' vs ' + S1.systems.economia.occupati);
  check('timeline ha il punto di partenza', S1.timeline.length === 1);
}

// ————————————————— TEST 2: campagna neutra 1962→2000 —————————————————
console.log('\\n[2] 38 anni senza dirigere la città (allettativa neutra)');
const S2 = nuovoGioco(42);
corri(S2, 2000, () => {});
{
  const v = PAR.Engine.derived(S2);
  check('popolazione in un intervallo credibile', v.popolazione > 600000 && v.popolazione < 1600000, PAR.fmt.pop(v.popolazione));
  check('PIL cresciuto ma senza esplosioni', v.pil > 2200 && v.pil < 9000, Math.round(v.pil));
  check('disoccupazione mai fuori scala storica', S2.history.every(x => x.disoccupazione > 0.005 && x.disoccupazione < 0.30), v.disoccupazione.toFixed(3));
  check('shares sempre coerenti', S2.history.every(x => Math.abs(x.shareAuto + x.shareTpubb + x.shareAttivo - 1) < 0.02));
  check('congestione dentro i limiti', S2.history.every(x => x.congestione >= 0.1 && x.congestione <= 0.99), v.congestione.toFixed(2));
  check('inquinamento dentro i limiti', S2.history.every(x => x.inquinamento >= 10 && x.inquinamento <= 100), v.inquinamento.toFixed(0));
  check('qualità della vita dentro i limiti', S2.history.every(x => x.qol >= 10 && x.qol <= 95), v.qol.toFixed(0));
  check('debito residuo non esploso', S2.debt < 700, Math.round(S2.debt));
  check('la storia procede: milestone nel registro', S2.timeline.some(t => t.year === 1971 && t.tag === 'STORICO'));
  check('la metropolitana non compare da sola', PAR.Engine.derived(S2).metroKm === 0);
  check(' TIMEOUT decisivo 1962 scattato', S2.decisionsTaken.includes('question-metropolitana'));
}

// ————————————————— TEST 3: scenario METRO vs scenario AUTO —————————————————
console.log('\\n[3] due dottrine opposte: metro vs auto');
function dottrinaMetro(S) {
  PAR.Actions.approve(S, 'metro-m1');
}
function dottrinaAuto(S) {
  PAR.Actions.approve(S, 'road-sud');
  PAR.Actions.approve(S, 'road-nord');
}
const S3a = nuovoGioco(7);
const S3b = nuovoGioco(7);
{
  // prima decisione obbligata del 1962
  PAR.Engine.simulateYear(S3a); PAR.Engine.simulateYear(S3b);
  PAR.Actions.resolveDecision(S3a, 'question-metropolitana', 0);
  PAR.Actions.resolveDecision(S3b, 'question-metropolitana', 2);
}
const esitoMetro = favourite(S3a, 2000, dottrinaMetro);
const esitoAuto = favourite(S3b, 2000, dottrinaAuto);
function favourite(S, fino, builder) {
  let guard = 0;
  while (S.year < fino && guard++ < 60) {
    PAR.Engine.simulateYear(S);
    flush(S);
    builder(S);
  }
  return PAR.Engine.derived(S);
}
{
  check('metro costruita davvero', esitoMetro.metroKm >= 12, esitoMetro.metroKm + ' km');
  check('senza scelta stradale la metro attira passeggeri', esitoMetro.shareTpubb > esitoAuto.shareTpubb,
    'tpubb metro ' + esitoMetro.shareTpubb.toFixed(2) + ' vs auto ' + esitoAuto.shareTpubb.toFixed(2));
  check('la strategia auto fa più motorizzati', esitoAuto.autoMille > esitoMetro.autoMille,
    'auto auto-dott ' + esitoAuto.autoMille.toFixed(0) + ' vs metro ' + esitoMetro.autoMille.toFixed(0));
  check('la strategia auto consuma più suolo', esitoAuto.consumoSuolo > esitoMetro.consumoSuolo,
    esitoAuto.consumoSuolo.toFixed(0) + ' vs ' + esitoMetro.consumoSuolo.toFixed(0));
  check('nessuna stat fuori scala nel 2000 (metro)', esitoMetro.inquinamento >= 10 && esitoMetro.inquinamento <= 100);
  check('rapporto finale generabile', !!PAR.Engine.classificaFinale(S3a).archetipo.nome);
}

// ————————————————— TEST 4: progetti, cantieri, manutenzioni —————————————————
console.log('\\n[4] ciclo di vita di un progetto');
const S4 = nuovoGioco(11);
{
  let guard = 0;
  while (S4.year < 1978 && guard++ < 40) {
    PAR.Engine.simulateYear(S4);
    flush(S4);
    if (PAR.Actions.canApprove(S4, 'densifica').ok) break;
  }
  check('le casse tornano a permettere il cantiere entro il 1978', PAR.Actions.canApprove(S4, 'densifica').ok, S4.year + ' treasury ' + S4.treasury.toFixed(1));
  const def = PAR.Engine.progetti.find(p => p.id === 'densifica');
  check('il costo annuale è stabilito', PAR.Engine.costoAnnuale(S4, def) > 0);
  const r = PAR.Actions.approve(S4, 'densifica');
  check('approvazione accettata', r.ok, r.motivo);
  check('cantiere registrato', S4.projects.some(p => p.id === 'densifica' && !p.completato));
  for (let y = 0; y < def.durata + 1; y++) { PAR.Engine.simulateYear(S4); flush(S4); }
  check('progetto completato in tempo (' + def.durata + ' anni)', PAR.Actions.eseguiti(S4, 'densifica') === 1);
  const d1 = S4.territorio.distretti.reduce((a, d) => a + d.abitazioni, 0);
  check('gli alloggi sono aumentati', d1 > 300000, d1);
  check('manutenzione in conto spese', S4.finanza.mantenimenti > 0, S4.finanza.mantenimenti.toFixed(1));
}

// ————————————————— TEST 5: determinismo (stesso seme = stessa storia) —————————————————
console.log('\\n[5] determinismo');
const S5a = nuovoGioco(99991);
const S5b = nuovoGioco(99991);
for (let i = 0; i < 12; i++) {
  const r = PAR.Engine.simulateYear(S5a); void r;
  PAR.Engine.simulateYear(S5b);
  flush(S5a); flush(S5b);
}
const a5 = S5a.history[S5a.history.length - 1], b5 = S5b.history[S5b.history.length - 1];
check('popolazione identica al seme', a5.popolazione === b5.popolazione, a5.popolazione + ' vs ' + b5.popolazione);
check('PIL identico al seme', Math.abs(a5.pil - b5.pil) < 1e-6);

// ————————————————— TEST 6: salvataggio e ricarica —————————————————
console.log('\\n[6] salvataggio / caricamento');
const bundle = JSON.parse(JSON.stringify(PAR.serialize(S3a)));
const S6 = PAR.deserialize(bundle);
PAR.Engine.simulateYear(S6);
PAR.Engine.simulateYear(S3a);
const s6 = S6.history[S6.history.length - 1], s3 = S3a.history[S3a.history.length - 1];
check('dopo il ricaricamento la storia prosegue identica', s6.popolazione === s3.popolazione && Math.abs(s6.pil - s3.pil) < 1e-6,
  s6.popolazione + ' vs ' + s3.popolazione);

// ————————————————— TEST 7: bilancio e vincoli —————————————————
console.log('\\n[7] vincoli di bilancio');
const S7 = nuovoGioco(5);
PAR.Engine.simulateYear(S7); flush(S7);
PAR.Engine.simulateYear(S7); flush(S7);
check('cassa iniziale significativa', S7.treasury > 0 && isFinite(S7.treasury), S7.treasury.toFixed(1));
S7.treasury = 2;
S7.finanza = Object.assign({}, S7.finanza, { saldo: 0 });
const r7 = PAR.Actions.approve(S7, 'metro-m1');
check('cassa vuota: nessun cantiere', r7.ok === false, r7.motivo);
S7.treasury = 100; S7.debt = 400;
const r8 = PAR.Actions.approve(S7, 'densifica');
check('debito impostato: nessun cantiere', r8.ok === false, r8.motivo);
check('registri di finanza aggiornati', S7.finanza.ricavi > 40 && S7.finanza.spese > 40, S7.finanza.ricavi.toFixed(1) + '/' + S7.finanza.spese.toFixed(1));

// ———————— TEST 8: integrità dei dati cartografici ————————
console.log('\n[8] integrità dei dati cartografici');
{
  PAR.Engine.rebindScenario(PAR.SCENARIOS[0]);
  const m = PAR.Engine.scenario.mappa;
  const DT = PAR.Engine.scenario.territorioInit().distretti;
  const senzaPol = DT.map(d => d.id).filter(i => !m.poligoni[i]);
  check('ogni distretto ha un poligono', senzaPol.length === 0, senzaPol.join(','));
  const fuoriCasa = Object.keys(m.poligoni).filter(id =>
    m.poligoni[id].some(p => p[0] < -0.5 || p[0] > 8.5 || p[1] < -0.5 || p[1] > 8.5));
  check('poligoni dentro lo spazio celle 8×8', fuoriCasa.length === 0, fuoriCasa.join(','));
  const corridoi = PAR.Engine.progetti.filter(p => p.corridoio).reduce((a, p) => a.concat(p.corridoio), []);
  const corridoiCattivi = [...new Set(corridoi)].filter(i => !DT.some(d => d.id === i));
  check('i corridoi citano solo distretti esistenti', corridoiCattivi.length === 0, corridoiCattivi.join(','));
  const coordOk = arr => arr.every(s => s.x >= 0 && s.x <= 8 && s.y >= 0 && s.y <= 8 && s.nome);
  check('stazioni, punti e comuni entro i confini e nominati', coordOk(m.stazioni) && coordOk(m.punti) && coordOk(m.comuni));
  check('i tre fiumi sono presenti', m.fiumi.length === 3 && m.fiumi.map(f => f.nome).join('|') === 'Po|Dora Riparia|Stura di Lanzo');
  check('renderer mappa registrato', !!PAR.Map && typeof PAR.Map.render === 'function' && typeof PAR.Map.legenda === 'function');
}

// ————————————————— REPORT —————————————————
console.log('\\n——————————————');
console.log(falliti === 0 ? 'TUTTI I TEST PASSATI' : falliti + ' TEST FALLITI');
process.exit(falliti === 0 ? 0 : 1);
