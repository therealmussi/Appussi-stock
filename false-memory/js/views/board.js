/* vista INVESTIGATION BOARD: bacheca drag&drop con relazioni manuali */
window.FMViews = window.FMViews || { views: {} };
(function () {
  const V = window.FMViews.views;
  const RELS = ['confirms', 'contradicts', 'supports', 'weakens', 'unrelated', 'uncertain'];
  const REL_IT = {
    confirms: 'CONFERMA', contradicts: 'CONTRADDICE', supports: 'SOSTIENE',
    weakens: 'INDEBOLISCE', unrelated: 'NESSUN LEGAME', uncertain: 'INCERTA'
  };
  const REL_COLOR = {
    confirms: '#7fae72', contradicts: '#d1554a', supports: '#8fa6b8',
    weakens: '#d9a441', unrelated: '#3f4a55', uncertain: '#9a8fb4'
  };
  let mode = 'select', sel = null, pendingLink = null, rootRef = null;

  V.board = function (root) {
    rootRef = root;
    mode = 'select'; sel = null; pendingLink = null;
    const F = window.FM, S = window.FMState, st = S.st;

    root.appendChild(F.el('h1', 'pagetitle', 'INVESTIGATION BOARD'));
    root.appendChild(F.el('div', 'pagesub', 'trascina i nodi, collega gli elementi, assegna le relazioni \u2014 salvataggio automatico'));

    const bar = F.el('div', 'btoolbar');
    const modeBtn = (m, label) => {
      const b = F.el('button', 'modebtn' + (mode === m ? ' on' : ''), label);
      b.dataset.m = m;
      b.addEventListener('click', () => {
        window.FMAudio.sfx.click(); mode = m; sel = null; pendingLink = null;
        bar.querySelectorAll('.modebtn').forEach(x => x.classList.toggle('on', x.dataset.m === m));
        draw(); /* ridisegna selezione */
      });
      return b;
    };
    bar.appendChild(modeBtn('select', 'SELEZIONA'));
    bar.appendChild(modeBtn('connect', 'COLLEGA'));
    bar.appendChild(modeBtn('remove', 'ELIMINA'));
    bar.appendChild(F.el('span', 'small mono', ' | '));

    const addEv = F.el('button', 'modebtn', '+ PROVA');
    addEv.addEventListener('click', () => openAddEvidence());
    bar.appendChild(addEv);

    const addSp = F.el('button', 'modebtn', '+ TESTIMONIANZA');
    addSp.addEventListener('click', () => {
      F.openModal('<h2>Aggiungi una testimonianza alla bacheca</h2><div class="code-line">le dichiarazioni scritte dei quattro conosciuti</div>' + pickList());
      function pickList() {
        const g = F.el('div');
        ['claire', 'thomas', 'elise', 'victor'].forEach(cid => {
          const c = F.ch(cid);
          const b = F.el('button', 'btn', F.esc(c.name));
          b.style.cssText = 'display:block;width:100%;margin-bottom:8px;text-align:left';
          b.addEventListener('click', () => {
            addNode({ kind: 'person', ref: cid });
            F.closeModal();
          });
          g.appendChild(b);
        });
        return g;
      }
    });
    bar.appendChild(addSp);

    const addNote = F.el('button', 'modebtn', '+ NOTA');
    addNote.addEventListener('click', () => {
      const node = addNode({ kind: 'note', txt: 'Nuova nota' });
      editNote(node);
    });
    bar.appendChild(addNote);

    const hint = F.el('span', 'small mono', '');
    bar.appendChild(hint);

    F.hintOnce(root, 'board',
      'Trascina gli elementi e collegali in modalit\u00e0 <b>COLLEGA</b>: clicca il primo nodo, poi il secondo, poi scegli la relazione. <b>CONTRADDICE</b> conta come contraddizione segnata. Doppio clic su una nota per scriverci.');

    const wrap = F.el('div', 'board-wrap');
    const canvas = F.el('div', 'board-canvas');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'links');
    canvas.appendChild(svg);
    wrap.appendChild(canvas);
    root.appendChild(wrap);

    hint.textContent = mode === 'connect'
      ? 'clicca il primo elemento, poi il secondo, scegli la relazione'
      : ' doppio clic su una nota per modificarla; clic su una linea per modificarla';

    function addNode(partial) {
      const n = Object.assign({
        id: 'N' + st.board.nextNode++,
        kind: 'note', ref: null, txt: '', x: 120 + (st.board.nodes.length % 5) * 210, y: 90 + Math.floor(st.board.nodes.length / 5) * 150
      }, partial);
      st.board.nodes.push(n);
      S.save();
      FMAudio.sfx.unlock();
      draw();
      return n;
    }

    function nodeOf(id) { return st.board.nodes.find(n => n.id === id); }
    function nodeCenter(n) { return { x: n.x + 95, y: n.y + 45 }; }

    function delNode(id) {
      st.board.links = st.board.links.filter(l => l.a !== id && l.b !== id);
      st.board.nodes = st.board.nodes.filter(n => n.id !== id);
      S.save();
      FMAudio.sfx.paper();
      V.board(root);
    }

    function openLinkModal(linkId) {
      const l = st.board.links.find(x => x.id === linkId);
      if (!l) return;
      const na = nodeOf(l.a), nb = nodeOf(l.b);
      const c = F.el('div');
      c.innerHTML = '<h2>Relazione fra i due elementi</h2><div class="code-line">' +
        F.esc(nodeLabel(na)) + '  \u2194  ' + F.esc(nodeLabel(nb)) + '</div>';
      RELS.forEach(r => {
        const b = F.el('button', 'btn' + (l.rel === r ? ' primary' : ''), REL_IT[r]);
        b.style.cssText = 'display:block;width:100%;margin-bottom:8px;text-align:left;color:' + REL_COLOR[r];
        b.addEventListener('click', () => {
          l.rel = r; S.save(); FMAudio.sfx.click(); F.closeModal(); draw();
        });
        c.appendChild(b);
      });
      const del = F.el('button', 'btn danger', 'RIMUOVI COLLEGAMENTO');
      del.style.cssText = 'display:block;width:100%;margin-top:12px';
      del.addEventListener('click', () => {
        st.board.links = st.board.links.filter(x => x.id !== linkId);
        S.save(); FMAudio.sfx.paper(); F.closeModal(); draw();
      });
      c.appendChild(del);
      F.openModal(c);
    }

    function editNote(n) {
      const c = F.el('div');
      c.innerHTML = '<h2>Nota di lavoro</h2>';
      const ta = document.createElement('textarea');
      ta.value = n.txt || ''; ta.style.minHeight = '110px';
      c.appendChild(ta);
      const bar2 = F.el('div', 'closebar');
      const del = F.el('button', 'btn danger', 'ELIMINA');
      del.addEventListener('click', () => { F.closeModal(); delNode(n.id); });
      const ok = F.el('button', 'btn primary', 'SALVA');
      ok.addEventListener('click', () => {
        n.txt = ta.value || '(vuoto)'; S.save(); FMAudio.sfx.paper(); F.closeModal(); draw();
      });
      bar2.appendChild(del); bar2.appendChild(ok);
      c.appendChild(bar2);
      F.openModal(c);
    }

    function openAddEvidence() {
      const disc = window.FM_EVIDENCE.filter(e => S.isDiscovered(e.id));
      const already = st.board.nodes.filter(n => n.kind === 'ev').map(n => n.ref);
      const c = F.el('div');
      c.innerHTML = '<h2>Aggiungi una prova alla bacheca</h2><div class="code-line">' +
        (disc.length - already.length) + ' prove non ancora presenti</div>';
      const g = F.el('div', 'grid cols3');
      disc.forEach(e => {
        const has = already.indexOf(e.id) !== -1;
        const card = F.el('div', 'evcard' + (has ? ' locked' : ''),
          '<div class="thumb">' + F.thumb(e) + '</div><div class="meta"><div class="code">' + F.esc(e.code) +
          '</div><div class="t">' + F.esc(e.title) + '</div></div>');
        if (!has) card.addEventListener('click', () => {
          addNode({ kind: 'ev', ref: e.id });
          F.closeModal();
        });
        g.appendChild(card);
      });
      c.appendChild(g);
      F.openModal(c);
    }

    function nodeLabel(n) {
      if (n.kind === 'ev') { const e = F.ev(n.ref); return e ? e.code + ' ' + e.title : 'prova'; }
      if (n.kind === 'person') return 'Dichiarazione di ' + F.ch(n.ref).name;
      return 'Nota: ' + (n.txt || '');
    }

    function mkPath(l, clickable) {
      const na = nodeOf(l.a), nb = nodeOf(l.b);
      if (!na || !nb) return null;
      const p1 = nodeCenter(na), p2 = nodeCenter(nb);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M' + p1.x + ' ' + p1.y + ' L' + p2.x + ' ' + p2.y);
      path.setAttribute('stroke', REL_COLOR[l.rel] || '#3f4a55');
      path.setAttribute('stroke-width', l.rel === 'contradicts' ? '2.5' : '1.5');
      path.setAttribute('fill', 'none');
      if (clickable) path.addEventListener('click', () => openLinkModal(l.id));
      svg.appendChild(path);
      /* etichetta del legame a met\u00e0 linea */
      const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', mx); txt.setAttribute('y', my - 6);
      txt.setAttribute('class', 'linklabel');
      txt.setAttribute('fill', REL_COLOR[l.rel] || '#9aa3ad');
      txt.textContent = REL_IT[l.rel] || '';
      svg.appendChild(txt);
    }

    function draw() {
      svg.innerHTML = '';
      canvas.querySelectorAll('.bnode').forEach(x => x.remove());
      /* collegamenti */
      st.board.links.forEach(l => { mkPath(l, true); });
      /* nodi */
      st.board.nodes.forEach(n => {
        const nd = F.el('div', 'bnode' + (sel === n.id ? ' selected' : '') + (n.kind === 'note' ? ' note' : ''));
        nd.style.left = n.x + 'px'; nd.style.top = n.y + 'px';
        let inner = '<div class="b-x">\u00d7</div>';
        if (n.kind === 'ev') {
          const e = F.ev(n.ref);
          inner += '<div class="b-code">' + F.esc(e.code) + '</div><div class="b-title">' + F.esc(e.title) + '</div><div class="b-body">' + F.esc(e.short || '') + '</div>';
        } else if (n.kind === 'person') {
          inner += '<div class="b-code">TESTIMONIANZA</div><div class="b-title">' + F.esc(F.ch(n.ref).name) + '</div><div class="b-body">' + F.esc(F.ch(n.ref).statement.title) + '</div>';
        } else {
          inner += '<div class="b-code">NOTA</div><div class="b-title">' + F.esc((n.txt || '').slice(0, 60)) + '</div>';
        }
        nd.innerHTML = inner;
        nd.addEventListener('dblclick', () => { if (n.kind === 'note') editNote(n); });
        nd.addEventListener('pointerdown', ev => {
          if (ev.target.classList.contains('b-x')) return;
          if (mode === 'remove') { delNode(n.id); return; }
          if (mode === 'connect') {
            if (!pendingLink) { pendingLink = n.id; sel = n.id; draw(); hint.textContent = 'primo elemento: ' + nodeLabel(n) + ' \u2014 scegli il secondo'; }
            else if (pendingLink !== n.id) {
              const a = nodeOf(pendingLink), b = n;
              st.board.links.push({ id: 'L' + st.board.nextLink++, a: a.id, b: b.id, rel: 'uncertain' });
              S.save();
              pendingLink = null; sel = b.id;
              mode = 'select';
              bar.querySelectorAll('.modebtn').forEach(x => x.classList.toggle('on', x.dataset.m === 'select'));
              FMAudio.sfx.unlock();
              openLinkModal(st.board.links[st.board.links.length - 1].id);
              draw();
            }
            return;
          }
          /* drag */
          sel = n.id;
          nd.classList.add('dragging');
          const sx = ev.clientX, sy = ev.clientY, ox = n.x, oy = n.y;
          const move = e2 => {
            const rx = Math.max(0, Math.min(2300 - 190, ox + (e2.clientX - sx)));
            const ry = Math.max(0, Math.min(1500 - 80, oy + (e2.clientY - sy)));
            n.x = Math.round(rx / 25) * 25;
            n.y = Math.round(ry / 25) * 25;
            nd.style.left = n.x + 'px'; nd.style.top = n.y + 'px';
            drawLinksOnly();
          };
          const up = () => {
            nd.classList.remove('dragging');
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            S.save();
          };
          window.addEventListener('pointermove', move);
          window.addEventListener('pointerup', up);
        });
        nd.querySelector('.b-x').addEventListener('click', ev => { ev.stopPropagation(); delNode(n.id); });
        canvas.appendChild(nd);
      });
      /* elenco relazioni sotto */
      const old = rootRef.querySelector('.rellist');
      if (old) old.remove();
      if (st.board.links.length) {
        const list = F.el('div', 'rellist');
        list.innerHTML = '<span class="small mono">COLLEGAMENTI ATTIVI (' + st.board.links.length + '): clic su una linea per modificarla</span>';
        st.board.links.forEach(l => {
          const na = nodeOf(l.a), nb = nodeOf(l.b);
          if (!na || !nb) return;
          const it = F.el('div', 'relitem');
          it.innerHTML = '<span class="rel-' + (l.rel === 'confirms' ? 'confirm' : l.rel === 'contradicts' ? 'contradict' : l.rel === 'supports' ? 'support' : 'support') + '">' +
            REL_IT[l.rel] + '</span><span>' + F.esc(nodeLabel(na)) + ' \u2194 ' + F.esc(nodeLabel(nb)) + '</span>';
          it.style.cursor = 'pointer';
          it.addEventListener('click', () => openLinkModal(l.id));
          list.appendChild(it);
        });
        rootRef.appendChild(list);
      }
    }
    function drawLinksOnly() {
      svg.innerHTML = '';
      st.board.links.forEach(l => { mkPath(l, true); });
    }

    draw();
  };
})();
