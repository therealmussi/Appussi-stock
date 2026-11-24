/* PARALLEL — pannelli: economia, popolazione, trasporti, ambiente, politica, timeline, analisi, parallele, sistema */
(function () {
  'use strict';
  const PAR = (window.PAR = window.PAR || {});
  const el = id => document.getElementById(id);
  const F = PAR.fmt;
  const U = PAR.UI;
  const H = PAR.UIU;

  const NOMI_STAKEHOLDER = {
    sindacati: 'Sindacati', industria: 'Grande industria', commercianti: 'Commercianti',
    ambientaliste: 'Ambientalisti', residenti: 'Comitati dei residenti', governo: 'Governo e Regione'
  };

  // ————— ECONOMIA —————
  U.vista_economia = function (root) {
    const S = U.S, v = PAR.Engine.derived(S), ec = S.systems.economia, h = S.history;
    const prev = h.length > 1 ? h[h.length - 2] : h[0];
    const FIN = S.finanza || {};
    root.innerHTML = `<h2 class="pan-titolo">Economia e finanze comunali</h2>
      <div class="cards">
      ${H.card('PIL della città', F.num(Math.round(v.pil)) + ' Mld L',
        'crescita ' + (ec.crescitaPil >= 0 ? '+' : '') + (ec.crescitaPil || 0).toFixed(1) + '% — funzione di: ciclo nazionale, accessibilità, congestione, diversificazione, debito')}
      ${H.card('occupati', F.pop(v.occupati), 'disoccupazione ' + F.pct(v.disoccupazione))}
      ${H.card('redditività', 'indice ' + (ec.redditoIndice || 1).toFixed(2), '1.00 = base 1962, in termini reali')}
      ${H.card('diversificazione', Math.round(ec.diversificazione * 100) + '/100', 'capacità dell\u2019economia locale di reggere senza la grande industria')}
      </div>
      <div class="dueCol">
        <div class="blocco"><h4>Composizione dell\u2019occupazione</h4>
        ${H.barreMini([
          ['industria', ec.quotaIndustria * 100, Math.round(ec.quotaIndustria * 100) + '%'],
          ['terziario', ec.quotaTerziario * 100, Math.round(ec.quotaTerziario * 100) + '%'],
          ['altre attività', (1 - ec.quotaIndustria - ec.quotaTerziario) * 100, Math.round((1 - ec.quotaIndustria - ec.quotaTerziario) * 100) + '%']
        ])}
        <h4>Finanza comunale dell\u2019anno ${S.year}</h4>
        <table class="tabella"><tbody>
        ${H.riga('entrate tributarie e tariffe', F.money(FIN.ricavi || 0))}
        ${H.riga('spese correnti di base', F.money(FIN.speseBase || 0))}
        ${H.riga('sussidi di disoccupazione', F.money(FIN.welfare || 0))}
        ${H.riga('manutenzione delle opere', F.money(FIN.mantenimenti || 0))}
        ${H.riga('versamenti dei cantieri', F.money(FIN.speseProgetti || 0))}
        ${H.riga('interessi sul debito', F.money(FIN.interessi || 0))}
        ${H.riga('saldo', F.money(FIN.saldo || 0))}
        ${H.riga('cassa', F.money(S.treasury))}
        ${H.riga('debito', F.money(S.debt))}
        </tbody></table></div>
        <div class="blocco"><h4>PIL nel tempo <span class="unit">— linea piena: la tua Torino; tratteggiata: storia reale (stima)</span></h4>
        <canvas class="grafico alto" id="ch-pil"></canvas>
        <h4>Disoccupazione</h4><canvas class="grafico alto" id="ch-disocc"></canvas></div>
      </div>`;
    PAR.Charts.line(el('ch-pil'), {
      series: [
        { label: 'la tua Torino', color: '#b06a41', data: H.ultimaSerie(h, 'pil'), fill: true, dot: true },
        { label: 'storia reale', color: '#7d5a8c', data: H.serieBase(PAR.Engine.scenario, 'pil', h[0].year, h[h.length - 1].year), dash: true, width: 1.5 }
      ], zeroBase: false, yearMark: S.year, legend: true
    });
    PAR.Charts.line(el('ch-disocc'), {
      series: [
        { label: 'disoccupazione', color: '#b0503f', data: H.ultimaSerie(h, 'disoccupazione', x => x * 100), fill: true, dot: true },
        { label: 'storia reale', color: '#7d5a8c', data: H.serieBase(PAR.Engine.scenario, 'disoccupazione', h[0].year, h[h.length - 1].year), dash: true, width: 1.5 }
      ], yMin: 0, yMax: Math.max(14, v.disoccupazione * 100 + 3), yearMark: S.year, legend: true
    });
  };

  // ————— POPOLAZIONE —————
  U.vista_popolazione = function (root) {
    const S = U.S, v = PAR.Engine.derived(S), D = S.systems.demografia, EC = S.systems.economia, h = S.history;
    root.innerHTML = `<h2 class="pan-titolo">Popolazione e migrazione</h2>
      <div class="cards">
      ${H.card('popolazione del comune', F.pop(v.popolazione), 'dimensione media del nucleo familiare: ' + D.dimensioneHH.toFixed(1) + ' persone')}
      ${H.card('area metropolitana', F.pop(v.areaMetropolitana), (D.integrazioneMetro || 0) > 0.2 ? 'legami forti con i comuni: la ferrovia suburbana lavora' : 'rapporti tradizionali con i comuni intorno')}
      ${H.card('saldo migratorio', (D.saldoMigratorio * 100).toFixed(1) + '‰/anno', 'segue il mercato del lavoro, le case, l\u2019inquinamento e il traffico')}
      ${H.card('invecchiamento', Math.round(D.fasce.anziani * 100) + '% over 65', 'giovani ' + Math.round(D.fasce.giovani * 100) + '% · in età lavorativa ' + Math.round(D.fasce.lavoratori * 100) + '%')}
      </div>
      <div class="dueCol">
        <div class="blocco"><h4>Popolazione residente <span class="unit">(tratteggiata: storia reale, stima)</span></h4>
        <canvas class="grafico alto" id="ch-pop"></canvas>
        <h4>Area metropolitana</h4><canvas class="grafico" id="ch-am"></canvas></div>
        <div class="blocco"><h4>Motore demografico</h4>
        <table class="tabella"><tbody>
        ${H.riga('natalità', (D.natalita * 1000).toFixed(1) + '‰')}
        ${H.riga('mortalità', (D.mortalita * 1000).toFixed(1) + '‰')}
        ${H.riga('saldo migratorio', (D.saldoMigratorio * 100).toFixed(1) + '‰/anno')}
        ${H.riga('forza lavoro', F.num(Math.round(D.popolazione * EC.forzaLavoro)))}
        ${H.riga('partecipazione al lavoro', Math.round(EC.forzaLavoro * 100) + '% della popolazione in forza di lavoro')}
        ${H.riga('abitazioni esistenti', F.num(Math.round(S.territorio.distretti.reduce((a, d) => a + d.abitazioni, 0))))}
        ${H.riga('disponibilità abitativa', Math.round(SOC(S).abitazioniAdeguate * 100) + '/100')}
        </tbody></table>
        <p class="nota">La migrazione segue l\u2019occupazione e la casa; il calo della natalità è una corrente storica profonda che nessun assessore ferma da solo.</p></div>
      </div>`;
    PAR.Charts.line(el('ch-pop'), {
      series: [
        { label: 'la tua Torino', color: '#5f8763', data: H.ultimaSerie(h, 'popolazione', x => x / 1000), fill: true, dot: true },
        { label: 'storia reale', color: '#7d5a8c', data: H.serieBase(PAR.Engine.scenario, 'popolazione', h[0].year, h[h.length - 1].year), dash: true, width: 1.5 }
      ], zeroBase: false, yearMark: S.year, legend: true
    });
    PAR.Charts.line(el('ch-am'), {
      series: [{ label: 'area metropolitana', color: '#4a5d6b', data: H.ultimaSerie(h, 'areaMetropolitana', x => x / 1000), fill: true, dot: true }],
      zeroBase: false, yearMark: S.year, legend: true
    });
  };
  function SOC(S) { return S.systems.sociale; }

  // ————— TRASPORTI —————
  U.vista_trasporti = function (root) {
    const S = U.S, T = S.systems.trasporti, h = S.history;
    root.innerHTML = `<h2 class="pan-titolo">Mobilità e reti</h2>
      <div class="cards">
      ${H.card('Rete del trasporto pubblico', Math.round(T.tramKm) + ' km tranvia', 'metropolitana: ' + (Math.round(T.metroKm * 10) / 10) + ' km · ferrovie: ' + Math.round(T.railKm) + ' km')}
      ${H.card('auto ogni 1.000 ab.', Math.round(T.autoMille), 'il livello di motorizzazione si decide qui')}
      ${H.card('modal share', Math.round(T.shareAuto * 100) + '% auto', 'trasporto pubblico ' + Math.round(T.shareTpubb * 100) + '% · spostamenti attivi ' + Math.round(T.shareAttivo * 100) + '%')}
      ${H.card('tempo medio di spostamento', Math.round(T.tempiMin) + ' min', T.congestione > 0.8 ? 'congestione critica: ' + Math.round(T.congestione * 100) + '/100' : 'congestione ' + Math.round(T.congestione * 100) + '/100')}
      </div>
      <div class="dueCol">
        <div class="blocco"><h4>Quota del trasporto pubblico <span class="unit">(tratteggiata: storia reale, stima)</span></h4>
        <canvas class="grafico alto" id="ch-shpt"></canvas>
        <h4>Motorizzazione <span class="unit">(auto per 1.000 abitanti)</span></h4><canvas class="grafico alto" id="ch-auto"></canvas></div>
        <div class="blocco"><h4>Stato della rete</h4>
        ${H.barreMini([
          ['qualità dell\u2019offerta pubblica', T.qualita * 100, Math.round(T.qualita * 100) + ''],
          ['accessibilità', T.accessibilita * 100, Math.round(T.accessibilita * 100) + ''],
          ['congestione stradale', T.congestione * 100, Math.round(T.congestione * 100) + '']
        ])}
        <h4>Capacità e pressione</h4>
        <table class="tabella"><tbody>
        ${H.riga('capacità trasporto pubblico', F.pop(T.capacitaPubblico) + ' viaggi/giorno')}
        ${H.riga('viaggi in auto (stima)', F.pop(Math.round(S.systems.demografia.popolazione * 2.45 * T.shareAuto)) + ' viaggi/giorno')}
        ${H.riga('viaggi tpubb (stima)', F.pop(Math.round(S.systems.demografia.popolazione * 2.45 * T.shareTpubb)) + ' viaggi/giorno')}
        </tbody></table>
        <h4>Meccanica dello share</h4>
        <p class="pan-nota">La quota del trasporto pubblico segue la qualità costruita (metro, tranvia, ferrovia, corsie) e la congestione. L\u2019auto ha una sua spirale: più auto, più congestione, più attrito per i mezzi, e così via.</p></div>
      </div>`;
    PAR.Charts.line(el('ch-shpt'), {
      series: [
        { label: 'quota tpubb', color: '#2e5e88', data: H.ultimaSerie(h, 'shareTpubb', x => x * 100), fill: true, dot: true },
        { label: 'storia reale', color: '#7d5a8c', data: H.serieBase(PAR.Engine.scenario, 'shareTpubb', h[0].year, h[h.length - 1].year), dash: true, width: 1.5 }
      ], yMin: 0, yMax: 62, yearMark: S.year, legend: true
    });
    PAR.Charts.line(el('ch-auto'), {
      series: [
        { label: 'auto/1.000 ab.', color: '#c2853f', data: H.ultimaSerie(h, 'autoMille'), fill: true, dot: true },
        { label: 'storia reale', color: '#7d5a8c', data: H.serieBase(PAR.Engine.scenario, 'autoMille', h[0].year, h[h.length - 1].year), dash: true, width: 1.5 }
      ], zeroBase: false, yearMark: S.year, legend: true
    });
  };

  // ————— AMBIENTE —————
  U.vista_ambiente = function (root) {
    const S = U.S, v = PAR.Engine.derived(S), ENV = S.systems.ambiente, h = S.history;
    root.innerHTML = `<h2 class="pan-titolo">Ambiente e suolo</h2>
      <div class="cards">
      ${H.card('qualità dell\u2019aria', Math.round(100 - v.inquinamento) + '/100', 'indice di inquinamento: ' + Math.round(v.inquinamento) + (v.inquinamento > 72 ? ' — soglia di allarme' : ''))}
      ${H.card('verde pubblico', v.verdePerCapita.toFixed(1) + ' m²/ab.', 'totale ' + F.num(Math.round(ENV.verdeHa)) + ' ettari')}
      ${H.card('suolo consumato', F.num(Math.round(v.consumoSuolo)) + ' ha', 'nuova terra cementata per l\u2019espansione dal 1962')}
      ${H.card('energia', 'indice ' + ENV.energia.toFixed(2), 'emissioni complessive: ' + ENV.emissioni.toFixed(2))}
      </div>
      <div class="dueCol">
        <div class="blocco"><h4>Aria <span class="unit">(su 100; tratteggiata: storia reale, stima)</span></h4><canvas class="grafico alto" id="ch-air"></canvas>
        <h4>Verde per abitante</h4><canvas class="grafico alto" id="ch-verde"></canvas></div>
        <div class="blocco"><h4>Perché cambia</h4>
        <p class="pan-nota">L\u2019aria reagisce al traffico (auto per 1.000 ab., quota auto) e all\u2019industria; la tecnologia migliora da sola dopo il 1985. Il verde cresce lentamente senza grandi parchi. Le decisioni prese decenni prima si vedono qui, talvolta rovesciate: più strade oggi può voler dire più congestione domani.</p></div>
      </div>`;
    PAR.Charts.line(el('ch-air'), {
      series: [
        { label: 'inquinamento', color: '#b0503f', data: H.ultimaSerie(h, 'inquinamento'), fill: true, dot: true },
        { label: 'storia reale', color: '#7d5a8c', data: H.serieBase(PAR.Engine.scenario, 'inquinamento', h[0].year, h[h.length - 1].year), dash: true, width: 1.5 }
      ], zeroBase: false, yearMark: S.year, legend: true
    });
    PAR.Charts.line(el('ch-verde'), {
      series: [
        { label: 'm² per abitante', color: '#5f8763', data: H.ultimaSerie(h, 'verdePerCapita'), fill: true, dot: true },
        { label: 'storia reale', color: '#7d5a8c', data: H.serieBase(PAR.Engine.scenario, 'verdePerCapita', h[0].year, h[h.length - 1].year), dash: true, width: 1.5 }
      ], zeroBase: false, yearMark: S.year, legend: true
    });
  };

  // ————— POLITICA —————
  U.vista_politica = function (root) {
    const S = U.S, P = S.systems.politica, SOC = S.systems.sociale;
    const pair = Object.keys(P.stakeholders).map(k => [NOMI_STAKEHOLDER[k] || k, (P.stakeholders[k] + 100) / 2, (P.stakeholders[k] > 0 ? '+' : '') + Math.round(P.stakeholders[k])]);
    const mods = S.mods.filter(m => Object.keys(m.effetti).length);
    const LEGGI = {
      autoFattore: 'crescita dell\u2019automobile ×' + m2(m, 'autoFattore'),
      espansionePeriurbana: 'pressione verso l\u2019espansione periferica',
      accessibilita: 'accessibilità +' + (m && m.effetti.accessibilita ? (m.effetti.accessibilita * 100).toFixed(0) : ''),
      qolPerAnno: 'qualità della vita ' + segno(m.effetti.qolPerAnno) + ' per anno',
      disuguaglianzaPerAnno: 'disuguaglianza ' + segno(m.effetti.disuguaglianzaPerAnno) + ' per anno',
      industriaTasso: 'tenuta dell\u2019occupazione industriale',
      diversificazionePerAnno: 'diversificazione ' + segno(m.effetti.diversificazionePerAnno) + ' per anno',
      terziarioPerAnno: 'terziario in crescita progressiva',
      inquinamentoFattore: 'inquinamento ×' + m2(m, 'inquinamentoFattore'),
      verdeFattore: 'verde ×' + m2(m, 'verdeFattore'),
      energiaPerAnno: 'energia ' + segno(m.effetti.energiaPerAnno) + ' per anno',
      shareAttivoPerAnno: 'mobilità attiva + per anno',
      popFattore: 'attrattività migratoria ×' + m2(m, 'popFattore'),
      speseFattore: 'spese correnti ×' + m2(m, 'speseFattore'),
      congestioneFattore: 'congestione ×' + m2(m, 'congestioneFattore'),
      densificaCorridoio: 'densità sui corridoi pubblici',
      disoccupazioneBonus: 'disoccupazione +' + m.effetti.disoccupazioneBonus,
      alluvioneFattore: 'danno alluvionale ×' + m2(m, 'alluvioneFattore')
    };
    function m2(mod, k) { return mod.effetti[k]; }
    function segno(x) { return x >= 0 ? '+' + String(x) : String(x); }

    let modsHtml;
    if (mods.length) {
      modsHtml = '<ul class="mods-list">' + mods.map(m => {
        const desc = Object.keys(m.effetti).map(k => LEGGI[k] || (k + ' ' + m.effetti[k])).join(' · ');
        return `<li><strong>${m.id}</strong> dal ${m.year}${m.scadenza ? ' al ' + m.scadenza : ''}<span class="mod-note">${desc}</span></li>`;
      }).join('') + '</ul>';
    } else {
      modsHtml = '<p class="pan-nota">Nessun effetto duraturo ancora: nasceranno dalle decisioni e dai progetti.</p>';
    }
    root.innerHTML = `<h2 class="pan-titolo">Politica e società</h2>
      <div class="dueCol">
        <div class="blocco"><h4>Approvazione pubblica</h4>
        <div class="big-gauge"><span class="big-num">${Math.round(P.approvazione)}</span>${H.gauge(P.approvazione, H.colorePer(P.approvazione))}</div>
        <h4>Qualità sociale</h4>
        ${H.barreMini([
          ['qualità della vita', SOC.qol, Math.round(SOC.qol) + ''],
          ['soddisfazione', SOC.soddisfazione * 100, Math.round(SOC.soddisfazione * 100) + ''],
          ['disuguaglianza', SOC.disuguaglianza, Math.round(SOC.disuguaglianza) + ''],
          ['servizi pubblici', SOC.servizi * 100, Math.round(SOC.servizi * 100) + '']
        ])}
        </div>
        <div class="blocco"><h4>Gruppi di interesse (da −100 a +100)</h4>${H.barreMini(pair)}
        <h4>Conseguenze durature attive</h4>${modsHtml}</div>
      </div>`;
  };

  // ————— TIMELINE —————
  U.vista_timeline = function (root) {
    const S = U.S;
    const icone = { storico: '◆', ipotesi: '◈', conseguenza: '↯', progetto: '⚒', decisione: '✦', evento: '⚠', inizio: '▶', divergenza: '◈', nota: '·' };
    const item = S.timeline.slice().reverse().map(t =>
      `<div class="tl-item tag-${t.tag.toLowerCase()}">
        <span class="tl-anno">${t.year}</span>
        <span class="tl-icona">${icone[t.kind] || '·'}</span>
        <span class="tl-chip">${t.tag}</span>
        <div class="tl-corpo"><strong>${H.esc(t.titolo)}</strong><p>${H.esc(t.testo)}</p></div>
      </div>`).join('');
    root.innerHTML = `<h2 class="pan-titolo">Timeline</h2>
      <p class="pan-nota">Eventi della storia reale <span class="chip chip-st">STORICO</span>,
      scelte controfattuali <span class="chip chip-ip">IPOTESI</span>,
      esiti della simulazione <span class="chip chip-si">SIMULATO</span>.
      Tenere separate le tre voci è la regola d\u2019oro di PARALLEL.</p>
      <div class="tl-list">${item}</div>`;
  };

  // ————— ANALISI —————
  U.vista_analisi = function (root) {
    const S = U.S, h = S.history, sc = PAR.Engine.scenario, last = h[h.length - 1], first = h[0];
    const prev = h.length > 1 ? h[h.length - 2] : h[0];
    const grafici = [
      ['popolazione', 'Popolazione', x => x / 1000, 'migliaia'],
      ['pil', 'PIL', x => x, 'Mld L'],
      ['disoccupazione', 'Disoccupazione', x => x * 100, '%'],
      ['autoMille', 'Motorizzazione', x => x, 'auto/1k'],
      ['shareTpubb', 'Quota trasporto pubblico', x => x * 100, '%'],
      ['congestione', 'Congestione', x => x * 100, 'idx'],
      ['tempiMin', 'Tempo di spostamento', x => x, 'min'],
      ['inquinamento', 'Inquinamento', x => x, 'idx'],
      ['verdePerCapita', 'Verde per abitante', x => x, 'm²'],
      ['abitazioniAdeguate', 'Disponibilità abitativa', x => x * 100, 'idx'],
      ['disuguaglianza', 'Disuguaglianza', x => x, 'idx'],
      ['qol', 'Qualità della vita', x => x, 'idx'],
      ['approvazione', 'Approvazione', x => x, 'idx'],
      ['cassa', 'Cassa comunale', x => x, 'Mld L'],
      ['debito', 'Debito', x => x, 'Mld L'],
      ['diverseEC', 'Diversificazione economica', x => x * 100, 'idx']
    ];
    let gridOn = '<div class="anal-grid">';
    grafici.forEach((g, i) => {
      gridOn += `<div class="anal-card"><h4>${g[1]} <span class="unit">${g[3]}</span></h4><canvas class="grafico mini" id="anal-${i}"></canvas></div>`;
    });
    gridOn += '</div>';

    const formattatori = {
      popolazione: F.pop, pil: x => F.num(Math.round(x)) + ' Mld L', occupati: F.pop,
      disoccupazione: x => F.pct(x), shareTpubb: x => F.pct(x), congestione: x => Math.round(x * 100),
      tempiMin: x => Math.round(x) + ' min', inquinamento: x => Math.round(x),
      verdePerCapita: x => x.toFixed(1) + ' m²', abitazioniAdeguate: x => Math.round(x * 100) + '/100',
      disuguaglianza: x => Math.round(x), qol: x => Math.round(x), approvazione: x => Math.round(x),
      cassa: F.money, debito: F.money
    };
    let righe = '';
    const chiavi = ['popolazione', 'pil', 'occupati', 'disoccupazione', 'autoMille', 'shareTpubb', 'congestione',
      'tempiMin', 'inquinamento', 'verdePerCapita', 'abitazioniAdeguate', 'disuguaglianza', 'qol', 'approvazione', 'cassa', 'debito'];
    chiavi.forEach(k => {
      const f = formattatori[k] || (x => String(Math.round(x * 100) / 100));
      righe += `<tr><td>${k}</td><td><strong>${f(last[k])}</strong></td><td>${f(prev[k])}</td><td>${f(first[k])}</td></tr>`;
    });
    root.innerHTML = `<h2 class="pan-titolo">Analisi</h2>${gridOn}
      <h3 class="cat-titolo">Confronto puntuale</h3>
      <table class="tabella"><thead><tr><th>indicatore</th><th>anno corrente</th><th>anno precedente</th><th>inizio (${first.year})</th></tr></thead><tbody>${righe}</tbody></table>`;
    grafici.forEach((g, i) => {
      const cv = el('anal-' + i);
      if (!cv) return;
      const serie = [];
      if (sc.baseline[g[0]]) {
        serie.push({ label: 'storia reale', color: '#7d5a8c', data: H.serieBase(sc, g[0], h[0].year, h[h.length - 1].year), dash: true, width: 1.5 });
      }
      serie.push({ label: 'la tua Torino', color: '#b06a41', data: h.map(x => [x.year, g[2](x[g[0]])]), dot: true });
      PAR.Charts.line(cv, { series: serie, zeroBase: false, yearMark: S.year });
    });
  };

  // ————— TIMELINE PARALLELE —————
  U.vista_parallele = function (root) {
    const S = U.S, sc = PAR.Engine.scenario, h = S.history, last = h[h.length - 1];
    const divergenze = S.timeline.filter(t => t.tag === 'IPOTESI');
    const confronti = [
      ['popolazione', 'Popolazione', x => x / 1000, x => PAR.fmt.pop(x)],
      ['pil', 'PIL', x => x, x => F.num(Math.round(x)) + ' Mld L'],
      ['autoMille', 'Auto ogni 1.000 ab.', x => x, x => String(Math.round(x))],
      ['shareTpubb', 'Quota trasporto pubblico', x => x * 100, x => x.toFixed(0) + '%'],
      ['tempiMin', 'Tempo di spostamento', x => x, x => x.toFixed(0) + ' min'],
      ['inquinamento', 'Inquinamento', x => x, x => String(Math.round(x))],
      ['verdePerCapita', 'Verde per abitante', x => x, x => x.toFixed(1) + ' m²'],
      ['disoccupazione', 'Disoccupazione', x => x * 100, x => x.toFixed(1) + '%']
    ];
    let charts = '<div class="anal-grid">';
    confronti.forEach((c, i) => { charts += `<div class="anal-card"><h4>${c[1]}</h4><canvas class="grafico mini" id="par-${i}"></canvas></div>`; });
    charts += '</div>';

    let table = `<table class="tabella"><thead><tr><th>indicatore al ${last.year}</th><th>la tua timeline</th><th>storia reale (stima)</th><th>differenza</th></tr></thead><tbody>`;
    confronti.forEach(c => {
      const valGiocatore = last[c[0]];
      const valBase = PAR.baseValue(sc.baseline[c[0]], last.year);
      const gg = c[2](valGiocatore), bb = c[2](valBase);
      const diff = Math.round((gg - bb) * 10) / 10;
      table += `<tr><td>${c[1]}</td><td><strong>${c[3](gg)}</strong></td><td>${c[3](bb)}</td>
        <td class="${diff >= 0 ? 'pos' : 'neg'}">${diff >= 0 ? '+' : ''}${diff}</td></tr>`;
    });
    table += '</tbody></table>';

    root.innerHTML = `<h2 class="pan-titolo">Timeline Parallele</h2>
      <p class="pan-nota"><strong>La tua Torino</strong> contro la Torino reale. Le serie storiche sono stime
      illustrative ricostruite per dare un termine di confronto, non misurazioni puntuali: la simulazione
      non pretende di prevedere che cosa «sarebbe successo comunque», mostra solo un ramo possibile dipendente dalle tue scelte.</p>
      ${charts}
      <h3 class="cat-titolo">Sintesi al ${last.year}</h3>${table}
      <h3 class="cat-titolo">Punti di divergenza (${divergenze.length})</h3>
      ${divergenze.length
        ? '<div class="tl-list">' + divergenze.slice().reverse().map(t =>
            `<div class="tl-item tag-ipotesi"><span class="tl-anno">${t.year}</span><div class="tl-corpo"><strong>${H.esc(t.titolo)}</strong><p>${H.esc(t.testo)}</p></div></div>`).join('') + '</div>'
        : '<p class="pan-nota">Ancora nessuna divergenza dichiarata: finché le scelte restano nel perimetro della tecnica, la timeline resta vicina alla storia reale.</p>'}`;
    confronti.forEach((c, i) => {
      const cv = el('par-' + i);
      if (!cv) return;
      PAR.Charts.line(cv, {
        series: [
          { label: 'la tua timeline', color: '#b06a41', data: h.map(x => [x.year, c[2](x[c[0]] === undefined ? 0 : x[c[0]])]), fill: true, dot: true },
          { label: 'storia reale', color: '#7d5a8c', data: H.serieBase(sc, c[0], h[0].year, h[h.length - 1].year), dash: true, width: 1.5 }
        ], zeroBase: false, yearMark: S.year
      });
    });
  };

  // ————— SISTEMA —————
  U.vista_sistema = function (root) {
    const S = U.S;
    const slotList = PAR.store.list();
    const slots = slotList.map(s =>
      `<div class="slot"><strong>${s.slot.replace('slot', 'Salvataggio ')}</strong>
      <span>${s.meta ? 'anno ' + s.meta.year + ' · ' + PAR.fmt.pop(s.meta.pop) : 'vuoto'}</span>
      <span class="slot-btn">
      <button class="btn btn-salva" data-slot="${s.slot}">Salva qui</button>
      ${s.meta ? `<button class="btn btn-carica" data-slot="${s.slot}">Carica</button><button class="btn btn-canc" data-slot="${s.slot}">Cancella</button>` : ''}
      </span></div>`).join('');
    root.innerHTML = `<h2 class="pan-titolo">Sistema: salvataggi e campagna</h2>
      <div class="dueCol">
        <div class="blocco"><h4>Slot di salvataggio</h4>${slots}
        <p class="nota">Il salvataggio automatico avviene a ogni anno simulato (slot «autosave»): puoi chiudere il browser e riprendere dalla schermata iniziale.</p></div>
        <div class="blocco"><h4>Esporta e importa</h4>
        <button class="btn" id="btn-export">Esporta la campagna (file JSON)</button>
        <div class="upload"><label class="nota">Importa un file di campagna</label><input type="file" id="input-import" accept=".json"></div>
        <h4>Gestione</h4>
        <button class="btn carestia" id="btn-nuova-qua">Ricomincia la campagna dal 1962</button>
        <button class="btn" id="btn-menu-qua">Torna al menu principale</button>
        </div>
      </div>`;
    root.querySelectorAll('.btn-carica').forEach(b => b.addEventListener('click', () => {
      const d = PAR.store.read(b.dataset.slot);
      if (d) {
        U.S = PAR.deserialize(d);
        el('btn-advance').disabled = false;
        U.tab = 'mappa';
        U.renderView();
      }
    }));
    root.querySelectorAll('.btn-salva').forEach(b => b.addEventListener('click', () => {
      PAR.store.write(b.dataset.slot, PAR.serialize(U.S));
      U.vista_sistema(root);
    }));
    root.querySelectorAll('.btn-canc').forEach(b => b.addEventListener('click', () => {
      PAR.store.remove(b.dataset.slot);
      U.vista_sistema(root);
    }));
    el('btn-export').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(PAR.serialize(U.S), null, 1)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'parallel-torino-' + S.year + '.json';
      a.click();
    });
    el('input-import').addEventListener('change', ev => {
      const file = ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          U.S = PAR.deserialize(JSON.parse(reader.result));
          el('btn-advance').disabled = false;
          U.tab = 'mappa';
          U.renderView();
        } catch (e) { alert('File di campagna non valido: ' + e.message); }
      };
      reader.readAsText(file);
    });
    el('btn-nuova-qua').addEventListener('click', () => {
      U.S = PAR.newState(U.S.scenario, U.S.rngSeed);
      U.tab = 'mappa'; U.renderView();
    });
    el('btn-menu-qua').addEventListener('click', () => {
      U.chiudiModal();
      U.menu();
    });
  };
})();
