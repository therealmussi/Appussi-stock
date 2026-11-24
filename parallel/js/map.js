/* PARALLEL — carta di Torino, geometria riconoscibile e livelli tematici.
   Rendering SVG: distretti tessellati, fiumi con argini, parchi, assi stradali,
   spina ferroviaria, stazioni, punti di riferimento, comuni, corridoi dei progetti.
   Interazioni: selezione distretto, zoom a rotella, pan a trascinamento, doppio clic = azzeramento. */
(function () {
  'use strict';
  const PAR = (window.PAR = window.PAR || {});

  const W = 1000, H = 1000, CELL = W / 8;
  const px = v => v * CELL;

  const COLORE_USO = {
    centro: '#c2ac86', urbano: '#cbba95', popolare: '#b5a98c', residenziale: '#cfc7ab',
    operaio: '#a89b85', periferia: '#d6cdae', industriale: '#97928a', collina: '#8ea878'
  };

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
      const g = sc.mappa;
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.classList.add('mappa-svg');
      const V = PAR.Map._view || (PAR.Map._view = { k: 1, x: 0, y: 0 });
      const wrap = (tag, attrs, parent) => {
        const e = document.createElementNS(ns, tag);
        for (const k in attrs) e.setAttribute(k, attrs[k]);
        (parent || svg).appendChild(e);
        return e;
      };

      wrap('rect', { x: 0, y: 0, width: W, height: H, fill: '#e3dbc6' });
      const collinaSfondo = wrap('path', {
        d: smussa(g.poligoni.collina, 26),
        fill: 'rgba(122,146,101,0.33)', stroke: 'none',
        transform: 'translate(62,-46) scale(1.18)'
      }, svg);
      collinaSfondo.setAttribute('opacity', 0.5);

      const root = wrap('g', { id: 'carta' });

      g.parchi.forEach(p => {
        wrap('path', {
          d: smussa(p.poligono, 20),
          fill: p.tipo === 'giardini' ? '#9db37c' : '#8ca86e',
          stroke: '#6f8a53', 'stroke-width': 2, opacity: 0.85
        }, root);
      });

      S.territorio.distretti.forEach(d => {
        const def = g.poligoni[d.id];
        if (!def) return;
        const p = wrap('path', {
          d: smussa(def, 16),
          fill: PAR.Map.colore(S, d, layer),
          stroke: sel === d.id ? '#2f3e46' : '#a89e86',
          'stroke-width': sel === d.id ? 6 : 2.2,
          'stroke-linejoin': 'round',
          class: 'distretto'
        }, root);
        p.appendChild(tooltip(distrettoTT(S, d, layer)));
        p.addEventListener('click', () => callbacks.onSelect(d.id));
      });

      S.territorio.distretti.forEach(d => {
        if (!g.poligoni[d.id]) return;
        const t = wrap('text', { x: px(d.x), y: px(d.y), class: 'etichetta', 'text-anchor': 'middle' }, root);
        t.textContent = abbrevia(d.nome);
      });

      g.assiStradali.forEach(a => {
        wrap('polyline', {
          points: pts(a.punti), fill: 'none', stroke: '#b3a88b', 'stroke-width': 13,
          'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.85
        }, root);
        wrap('polyline', {
          points: pts(a.punti), fill: 'none', stroke: '#e8e0c8', 'stroke-width': 5.5,
          'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.9
        }, root);
      });

      g.ferrovia.forEach(f => {
        wrap('polyline', {
          points: pts(f.punti), fill: 'none', stroke: '#6b5f4e', 'stroke-width': 8,
          'stroke-dasharray': '18,7', 'stroke-linejoin': 'round', opacity: 0.75
        }, root);
      });

      g.fiumi.forEach(f => {
        wrap('polyline', {
          points: pts(f.punti), fill: 'none', stroke: f.argine, 'stroke-width': f.larghezza * 1.5,
          'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.7
        }, root);
        const r = wrap('polyline', {
          points: pts(f.punti), fill: 'none', stroke: f.colore, 'stroke-width': f.larghezza,
          'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.92
        }, root);
        r.appendChild(tooltip(f.nome));
      });

      g.stazioni.forEach(st => {
        wrap('circle', { cx: px(st.x), cy: px(st.y), r: 11, fill: '#3f4a52', stroke: '#e8e0c8', 'stroke-width': 3 }, root);
        const t = wrap('text', { x: px(st.x), y: px(st.y) - 18, class: 'stazione', 'text-anchor': 'middle' }, root);
        t.textContent = st.nome;
      });

      g.punti.forEach(p => {
        wrap('path', {
          d: 'M' + px(p.x) + ' ' + (px(p.y) - 13) + ' l11 15 -11 -6 -11 6 z',
          fill: '#7a5c3a', stroke: '#e8e0c8', 'stroke-width': 2
        }, root);
        const t = wrap('text', { x: px(p.x), y: px(p.y) + 26, class: 'punto', 'text-anchor': 'middle' }, root);
        t.textContent = p.nome;
      });

      S.projects.forEach(pr => {
        const defe = PAR.Engine.progetti.find(x => x.id === pr.id);
        if (!defe || !defe.corridoio) return;
        const seg = percorso(S, defe);
        if (!seg.length) return;
        const pl = wrap('polyline', {
          points: seg.map(q => q[0] + ',' + q[1]).join(' '),
          fill: 'none', stroke: lineaColore(defe), 'stroke-width': lineaSpessore(defe) + 5,
          'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.5
        }, root);
        const linee = wrap('polyline', {
          points: seg.map(q => q[0] + ',' + q[1]).join(' '),
          fill: 'none', stroke: lineaColore(defe), 'stroke-width': lineaSpessore(defe),
          'stroke-linejoin': 'round', 'stroke-linecap': 'round'
        }, root);
        if (!pr.completato) linee.setAttribute('stroke-dasharray', '16,11');
        if (layer !== 'progetti') { pl.setAttribute('opacity', 0.35); linee.setAttribute('opacity', 0.85); }
        const tt = tooltip(defe.nome + (pr.completato ? ' (completato ' + pr.annoCompletamento + ')' : ' (in corso, ' + Math.round(pr.progresso) + '%)'));
        linee.appendChild(tt);
        linee.addEventListener('click', () => callbacks.onProject && callbacks.onProject(pr.id));
        if (!pr.completato) {
          const mid = seg[Math.floor(seg.length / 2)];
          const fg = wrap('g', { transform: 'translate(' + mid[0] + ',' + mid[1] + ')' }, root);
          wrap('circle', { r: 26, fill: '#e8e0c8', stroke: lineaColore(defe), 'stroke-width': 3 }, fg);
          const txt = wrap('text', { y: 8, 'text-anchor': 'middle', class: 'cantiere' }, fg);
          txt.textContent = Math.round(pr.progresso) + '%';
          fg.appendChild(tooltip(defe.nome + ': cantiere al ' + Math.round(pr.progresso) + '%'));
        }
      });

      g.comuni.forEach(c => {
        wrap('circle', { cx: px(c.x), cy: px(c.y), r: 5, fill: '#8a7f66' }, root);
        const t = wrap('text', { x: px(c.x) + 11, y: px(c.y) + 7, class: 'comune' }, root);
        t.textContent = c.nome;
      });

      const ctrl = document.createElement('div');
      ctrl.className = 'mappa-ctrl';
      ctrl.innerHTML = '<button class="btn mappa-btn" data-z="1" title="Aumenta zoom">+</button>' +
        '<button class="btn mappa-btn" data-z="-1" title="Riduci zoom">−</button>' +
        '<button class="btn mappa-btn" data-z="0" title="Azzera vista">⌂</button>';
      container.innerHTML = '';
      container.style.position = 'relative';
      container.appendChild(svg);
      container.appendChild(ctrl);

      const aplica = () => root.setAttribute('transform', 'translate(' + V.x + ',' + V.y + ') scale(' + V.k + ')');
      aplica();
      const zoom = (f, cx, cy) => {
        const nk = Math.max(1, Math.min(6, V.k * f));
        cx = cx == null ? W / 2 : cx; cy = cy == null ? H / 2 : cy;
        V.x = cx - (cx - V.x) * nk / V.k;
        V.y = cy - (cy - V.y) * nk / V.k;
        V.k = nk;
        if (V.k === 1) { V.x = 0; V.y = 0; }
        aplica();
      };
      ctrl.querySelectorAll('.mappa-btn').forEach(b => b.addEventListener('click', ev => {
        ev.stopPropagation();
        const z = b.dataset.z;
        if (z === '0') { V.k = 1; V.x = 0; V.y = 0; aplica(); }
        else zoom(z === '1' ? 1.45 : 1 / 1.45);
      }));
      svg.addEventListener('wheel', ev => {
        ev.preventDefault();
        const r = svg.getBoundingClientRect();
        zoom(ev.deltaY < 0 ? 1.18 : 1 / 1.18, (ev.clientX - r.left) / r.width * W, (ev.clientY - r.top) / r.height * H);
      }, { passive: false });
      if (PAR.Map._winMove) window.removeEventListener('pointermove', PAR.Map._winMove);
      if (PAR.Map._winUp) window.removeEventListener('pointerup', PAR.Map._winUp);
      if (PAR.Map._winCancel) window.removeEventListener('pointercancel', PAR.Map._winUp);

      let attivi = [];
      const pinch = () => {
        if (attivi.length < 2) return null;
        const a = attivi[0], b = attivi[1];
        return { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
      };
      svg.addEventListener('pointerdown', ev => {
        attivi.push({ id: ev.pointerId, x: ev.clientX, y: ev.clientY });
        svg.classList.add('afferra');
      });
      const su = ev => {
        attivi = attivi.filter(p => p.pointerId !== ev.pointerId);
        if (!attivi.length) svg.classList.remove('afferra');
      };
      PAR.Map._winMove = ev => {
        const i = attivi.findIndex(p => p.pointerId === ev.pointerId);
        if (i < 0) return;
        const prima = pinch();
        attivi[i].x = ev.clientX; attivi[i].y = ev.clientY;
        const r = svg.getBoundingClientRect();
        const versoPx = (cx, cy) => [(cx - r.left) / r.width * W, (cy - r.top) / r.height * H];
        if (attivi.length >= 2) {
          const dopo = pinch(), davanti = prima;
          if (davanti && davanti.d > 0) {
            const [qx, qy] = versoPx(davanti.cx, davanti.cy);
            zoom(dopo.d / davanti.d, qx, qy);
            const dispX = (dopo.cx - davanti.cx) / r.width * W * V.k;
            const dispY = (dopo.cy - davanti.cy) / r.height * H * V.k;
            V.x = Math.max(Math.min(V.x - dispX, 0), W - W * V.k);
            V.y = Math.max(Math.min(V.y - dispY, 0), H - H * V.k);
            aplica();
          }
        } else {
          const p = attivi[0];
          const ax = p.x, ay = p.y;
          V.x = Math.max(Math.min(V.x + (ev.clientX - ax) / r.width * W, 0), W - W * V.k);
          V.y = Math.max(Math.min(V.y + (ev.clientY - ay) / r.height * H, 0), H - H * V.k);
          aplica();
          p.x = ev.clientX; p.y = ev.clientY;
        }
      };
      PAR.Map._winUp = su;
      window.addEventListener('pointermove', PAR.Map._winMove);
      window.addEventListener('pointerup', PAR.Map._winUp);
      window.addEventListener('pointercancel', PAR.Map._winUp);
      svg.addEventListener('dblclick', () => { V.k = 1; V.x = 0; V.y = 0; aplica(); });
    },

    legenda(S, layer) {
      const pal = this.palete(layer), r = this.range(layer);
      if (layer === 'uso-suolo') {
        return {
          testo: 'carattere delle zone',
          stops: [
            { v: 'centro', c: COLORE_USO.centro }, { v: 'urbano', c: COLORE_USO.urbano },
            { v: 'popolare', c: COLORE_USO.popolare }, { v: 'residenziale', c: COLORE_USO.residenziale },
            { v: 'operaio', c: COLORE_USO.operaio }, { v: 'periferia', c: COLORE_USO.periferia },
            { v: 'industriale', c: COLORE_USO.industriale }, { v: 'collina', c: COLORE_USO.collina }
          ]
        };
      }
      if (layer === 'progetti') {
        return {
          testo: 'corridoi',
          stops: [
            { v: 'metropolitana', c: '#2e5e88' }, { v: 'tranvia', c: '#d9a24a' },
            { v: 'ferrovia', c: '#7d5a8c' }, { v: 'strade', c: '#4a5359' },
            { v: 'ambiente', c: '#6f9a5e' }, { v: 'urbanistica', c: '#b06a41' }
          ]
        };
      }
      if (!pal || !r) return { testo: '', stops: null };
      return {
        testo: layerNome(layer),
        stops: [
          { v: PAR.fmt.idx(r.min, r.min < 1 ? 2 : 0), c: pal[0] },
          { v: PAR.fmt.idx((r.min + r.max) / 2, 1), c: interpColor(pal[0], pal[1], 0.5) },
          { v: PAR.fmt.idx(r.max, r.max < 1 ? 2 : 0), c: pal[1] }
        ]
      };
    }
  };

  function layerNome(layer) {
    const l = PAR.Map.layers.find(x => x.id === layer);
    return l ? l.nome.toLowerCase() : layer;
  }

  function distrettoTT(S, d, layer) {
    const v = PAR.Map.valoreDistretto(S, d, layer);
    const r = layer !== 'uso-suolo' && layer !== 'progetti' ? PAR.Map.range(layer) : null;
    let riga = '';
    if (v != null && r) riga = '\n' + layerNome(layer) + ': ' + (+v).toLocaleString('it-IT', { maximumFractionDigits: 2 });
    return d.nome +
      '\nresidenti: ' + PAR.fmt.num(Math.round(d.residenti)) +
      '\nabitazioni: ' + PAR.fmt.num(Math.round(d.abitazioni)) +
      '\ndensità: ' + (d.residenti / d.supHa).toFixed(1) + ' ab/ha' +
      '\noccupati: ' + PAR.fmt.num(Math.round(d.occupati)) +
      '\nverde: ' + Math.round(d.verdeHa) + ' ha' +
      '\naccessibilità: ' + Math.round(d.accessibilita * 100) + '/100' + riga;
  }

  function tooltip(testo) {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    t.textContent = testo;
    return t;
  }

  function pts(punti) {
    return punti.map(p => px(p[0]) + ',' + px(p[1])).join(' ');
  }

  function smussa(poligono, raggio) {
    const P = poligono.map(p => [px(p[0]), px(p[1])]);
    const n = P.length;
    let d = '';
    for (let i = 0; i < n; i++) {
      const prev = P[(i + n - 1) % n], cur = P[i], next = P[(i + 1) % n];
      const l1 = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
      const l2 = Math.hypot(next[0] - cur[0], next[1] - cur[1]);
      const r1 = Math.min(raggio, l1 / 2.4), r2 = Math.min(raggio, l2 / 2.4);
      const a = [cur[0] + (prev[0] - cur[0]) / l1 * r1, cur[1] + (prev[1] - cur[1]) / l1 * r1];
      const b = [cur[0] + (next[0] - cur[0]) / l2 * r2, cur[1] + (next[1] - cur[1]) / l2 * r2];
      d += (i === 0 ? 'M' : 'L') + a[0].toFixed(1) + ' ' + a[1].toFixed(1) +
        'Q' + cur[0].toFixed(1) + ' ' + cur[1].toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) + ' ';
    }
    return d + 'Z';
  }

  function abbrevia(nome) {
    return nome.replace('–', ' ').split(' ').map(w => w.length > 10 ? w.slice(0, 10) : w).join(' ');
  }

  function percorso(S, def) {
    const DT = S.territorio.distretti;
    const out = [];
    (def.corridoio || []).forEach(id => {
      const d = DT.find(x => x.id === id);
      if (d) out.push([px(d.x), px(d.y)]);
    });
    return out;
  }

  function lineaColore(def) {
    if (def.id.indexOf('metro') === 0) return '#2e5e88';
    if (def.id.indexOf('tram') === 0) return '#d9a24a';
    if (def.id.indexOf('rail') === 0) return '#7d5a8c';
    if (def.id.indexOf('road') === 0 || def.id.indexOf('cintura') >= 0) return '#4a5359';
    if (def.cat === 'ambiente') return '#6f9a5e';
    if (def.cat === 'urbanistica') return '#b06a41';
    return '#8a8577';
  }

  function lineaSpessore(def) {
    if (def.id.indexOf('metro') === 0) return 14;
    if (def.id.indexOf('rail') === 0) return 10;
    if (def.id.indexOf('road') === 0 || def.id.indexOf('cintura') >= 0) return 12;
    if (def.id.indexOf('tram') === 0 || def.id.indexOf('brt') === 0) return 7;
    return 5;
  }

  function interpColor(c1, c2, t) {
    const p = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    const a = p(c1), b = p(c2);
    const m = a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, t))));
    return 'rgb(' + m.join(',') + ')';
  }
})();
