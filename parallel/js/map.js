/* PARALLEL — mappa SVG stilizzata e geograficamente coerente di Torino con livelli tematici */
(function () {
  'use strict';
  const PAR = (window.PAR = window.PAR || {});

  const CELL = 64, OFF = 14;
  const px = v => OFF + v * CELL;

  const COLORE_USO = {
    centro: '#c2ac86', urbano: '#cbba95', popolare: '#b5a98c', residenziale: '#cfc7ab',
    operaio: '#a89b85', periferia: '#d6cdae', industriale: '#97928a', collina: '#8ea878'
  };

  function interpColor(c1, c2, t) {
    const p = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    const a = p(c1), b = p(c2);
    const m = a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, t))));
    return 'rgb(' + m.join(',') + ')';
  }

  PAR.Map = {
    layers: [
      { id: 'uso-suolo', nome: 'Uso del suolo' },
      { id: 'densita', nome: 'Densità abitativa' },
      { id: 'accessibilita', nome: 'Accessibilità' },
      { id: 'economia', nome: 'Attività economica' },
      { id: 'ambiente', nome: 'Qualità ambientale' },
      { id: 'espansione', nome: 'Espansione urbana' },
      { id: 'progetti', nome: 'Infrastrutture' }
    ],

    valoreDistretto(S, d, layer) {
      switch (layer) {
        case 'densita': return d.residenti / d.supHa;
        case 'accessibilita': return d.accessibilita;
        case 'economia': return d.occupati / Math.max(1, d.residenti);
        case 'ambiente': return 100 - (S.systems.ambiente.inquinamento * (1 + d.industrie / Math.max(5000, d.occupati) * 0.25) - Math.min(14, d.verdeHa / d.supHa * 14));
        case 'espansione': return (d.costruitoHa - (d.costruito0 || d.costruitoHa)) / d.supHa;
        default: return null;
      }
    },

    range(layer) {
      switch (layer) {
        case 'densita': return { min: 1, max: 9 };
        case 'accessibilita': return { min: 0.25, max: 1 };
        case 'economia': return { min: 0.15, max: 1.3 };
        case 'ambiente': return { min: 25, max: 88 };
        case 'espansione': return { min: 0, max: 0.5 };
        default: return null;
      }
    },

    palete(layer) {
      switch (layer) {
        case 'densita': return ['#e9e3cf', '#8a6b4d'];
        case 'accessibilita': return ['#ddd6c3', '#3e7186'];
        case 'economia': return ['#d8d3c4', '#c2853f'];
        case 'ambiente': return ['#b0503f', '#7f9e6f'];
        case 'espansione': return ['#ddd6c3', '#a8522e'];
        default: return null;
      }
    },

    colore(S, d, layer) {
      if (layer === 'uso-suolo' || layer === 'progetti') return COLORE_USO[d.tag] || '#ccc4a8';
      const r = this.range(layer), pal = this.palete(layer);
      const v = this.valoreDistretto(S, d, layer);
      if (v == null || !r) return '#ccc4a8';
      return interpColor(pal[0], pal[1], (v - r.min) / (r.max - r.min));
    },

    render(container, S, layer, sel, callbacks) {
      const sc = PAR.Engine.scenario;
      const mappa = sc.mappa;
      const W = 540, H = 540;
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.classList.add('mappa-svg');

      const bg = document.createElementNS(ns, 'rect');
      bg.setAttribute('x', 0); bg.setAttribute('y', 0);
      bg.setAttribute('width', W); bg.setAttribute('height', H);
      bg.setAttribute('fill', '#e7e0cd');
      svg.appendChild(bg);

      // comuni dell'area metropolitana
      mappa.comuni.forEach(c => {
        const g = document.createElementNS(ns, 'text');
        g.setAttribute('x', px(c.x)); g.setAttribute('y', px(c.y));
        g.setAttribute('class', 'comune');
        g.textContent = c.nome;
        svg.appendChild(g);
        const dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', px(c.x) - 4); dot.setAttribute('cy', px(c.y) - 12);
        dot.setAttribute('r', 2.5); dot.setAttribute('fill', '#8a7f66');
        svg.appendChild(dot);
      });

      // reticolo leggero
      for (let i = 0; i <= mappa.celle.w; i++) {
        const l = document.createElementNS(ns, 'line');
        l.setAttribute('x1', px(0)); l.setAttribute('x2', px(mappa.celle.w));
        l.setAttribute('y1', px(i)); l.setAttribute('y2', px(i));
        l.setAttribute('class', 'retico');
        svg.appendChild(l);
      }
      for (let i = 0; i <= mappa.celle.h; i++) {
        const l = document.createElementNS(ns, 'line');
        l.setAttribute('y1', px(0)); l.setAttribute('y2', px(mappa.celle.h));
        l.setAttribute('x1', px(i)); l.setAttribute('x2', px(i));
        l.setAttribute('class', 'retico');
        svg.appendChild(l);
      }

      // distretti
      S.territorio.distretti.forEach(d => {
        const r = document.createElementNS(ns, 'rect');
        r.setAttribute('x', px(d.x - 0.47)); r.setAttribute('y', px(d.y - 0.34));
        r.setAttribute('width', CELL * 0.94); r.setAttribute('height', CELL * 0.68);
        r.setAttribute('rx', 5);
        r.setAttribute('fill', PAR.Map.colore(S, d, layer));
        r.setAttribute('stroke', sel === d.id ? '#2f3e46' : '#a89e86');
        r.setAttribute('stroke-width', sel === d.id ? 2.6 : 1);
        r.setAttribute('class', 'distretto');
        const t = document.createElementNS(ns, 'title');
        t.textContent = d.nome + '\nresidenti: ' + PAR.fmt.num(Math.round(d.residenti)) +
          '\ndensità: ' + (d.residenti / d.supHa).toFixed(1) + ' ab/ha' +
          '\naccessibilità: ' + Math.round(d.accessibilita * 100);
        r.appendChild(t);
        r.addEventListener('click', () => callbacks.onSelect(d.id));
        svg.appendChild(r);
        const label = document.createElementNS(ns, 'text');
        label.setAttribute('x', px(d.x - 0.47) + 4);
        label.setAttribute('y', px(d.y - 0.34) + 12);
        label.setAttribute('class', 'etichetta');
        label.textContent = abbrevia(d.nome);
        svg.appendChild(label);
      });

      // fiumi sopra i distretti ma sotto le infrastrutture
      mappa.fiumi.forEach(f => {
        const pl = document.createElementNS(ns, 'polyline');
        pl.setAttribute('points', f.punti.map(p => px(p.x) + ',' + px(p.y)).join(' '));
        pl.setAttribute('fill', 'none');
        pl.setAttribute('stroke', f.colore);
        pl.setAttribute('stroke-width', f.larghezza);
        pl.setAttribute('stroke-linejoin', 'round');
        pl.setAttribute('stroke-linecap', 'round');
        pl.setAttribute('opacity', 0.85);
        svg.appendChild(pl);
      });

      // infrastrutture completate e in corso
      S.projects.forEach(p => {
        const def = PAR.Engine.progetti.find(x => x.id === p.id);
        if (!def || !def.corridoio) return;
        const pts = percorso(S, def);
        if (!pts.length) return;
        const pl = document.createElementNS(ns, 'polyline');
        pl.setAttribute('points', pts.map(q => q[0] + ',' + q[1]).join(' '));
        pl.setAttribute('fill', 'none');
        pl.setAttribute('stroke', lineaColore(def, p));
        pl.setAttribute('stroke-width', lineaSpessore(def));
        pl.setAttribute('stroke-linejoin', 'round');
        if (!p.completato) pl.setAttribute('stroke-dasharray', '7,5');
        if (layer !== 'progetti') pl.setAttribute('opacity', 0.82);
        const t = document.createElementNS(ns, 'title');
        t.textContent = def.nome + (p.completato ? ' (completato ' + p.annoCompletamento + ')' : ' (in corso, ' + Math.round(p.progresso) + '%)');
        pl.appendChild(t);
        pl.addEventListener('click', () => callbacks.onProject && callbacks.onProject(p.id));
        svg.appendChild(pl);
      });

      container.innerHTML = '';
      container.appendChild(svg);
    },

    legenda(S, layer) {
      const pal = this.palete(layer), r = this.range(layer);
      if (!pal || !r) return { testo: 'Classificazione per carattere delle zone', stops: null };
      return {
        testo: 'legenda',
        stops: [
          { v: PAR.fmt.idx(r.min, r.min < 1 ? 2 : 0), c: pal[0] },
          { v: PAR.fmt.idx((r.min + r.max) / 2, 1), c: interpColor(pal[0], pal[1], 0.5) },
          { v: PAR.fmt.idx(r.max, r.max < 1 ? 2 : 0), c: pal[1] }
        ]
      };
    }
  };

  function abbrevia(nome) {
    return nome.replace('–', ' ').split(' ').map(w => w.length > 9 ? w.slice(0, 9) : w).join(' ');
  }

  function percorso(S, def) {
    const DT = S.territorio.distretti;
    const pts = [];
    def.corridoio.forEach(id => {
      const d = DT.find(x => x.id === id);
      if (d) pts.push([px(d.x), px(d.y)]);
    });
    return pts;
  }

  function lineaColore(def, p) {
    if (def.id.indexOf('metro') === 0) return '#2e5e88';
    if (def.id.indexOf('tram') === 0) return '#d9a24a';
    if (def.id.indexOf('rail') === 0) return '#7d5a8c';
    if (def.id.indexOf('road') === 0 || def.id.indexOf('cintura') >= 0) return '#4a5359';
    if (def.cat === 'ambiente') return '#6f9a5e';
    if (def.cat === 'urbanistica') return '#b06a41';
    return '#8a8577';
  }

  function lineaSpessore(def) {
    if (def.id.indexOf('metro') === 0) return 7;
    if (def.id.indexOf('rail') === 0) return 5;
    if (def.id.indexOf('road') === 0 || def.id.indexOf('cintura') >= 0) return 6;
    if (def.id.indexOf('tram') === 0 || def.id.indexOf('brt') === 0) return 3.5;
    return 2.5;
  }
})();
