/* vista TESTIMONIES: dichiarazioni scritte + registrazioni acquisibili */
window.FMViews = window.FMViews || { views: {} };
(function () {
  const V = window.FMViews.views;

  V.testimonies = function (root) {
    const F = window.FM, S = window.FMState;
    root.appendChild(F.el('h1', 'pagetitle', 'TESTIMONIES'));
    root.appendChild(F.el('div', 'pagesub', 'dichiarazioni scritte e registrazioni acquisite'));

    F.el('h3', null, 'Dichiarazioni scritte');
    ['claire', 'thomas', 'elise', 'victor'].forEach(cid => {
      const c = F.ch(cid);
      const card = F.el('div', 'card');
      card.innerHTML = '<h3><span style="color:' + c.accent + '">' + F.esc(c.name) + '</span> \u2014 ' + F.esc(c.statement.title) + '</h3>' +
        '<div class="small mono" style="margin-bottom:6px">' + F.esc(c.statement.date) + '</div>' + c.statement.text;
      root.appendChild(card);
    });

    const recs = window.FM_EVIDENCE.filter(e => e.cat === 'recording');
    root.appendChild(F.el('h3', null, 'Registrazioni'));
    root.appendChild(F.el('div', 'pagesub', recs.filter(e => S.isDiscovered(e.id)).length + ' / ' + recs.length + ' acquisite'));
    const grid = F.el('div', 'grid cols2');
    recs.forEach(e => {
      const got = S.isDiscovered(e.id);
      const card = F.el('div', 'evcard' + (got ? '' : ' locked'));
      card.innerHTML = got
        ? '<div class="thumb">' + F.thumb(e) + '</div><div class="meta"><div class="code">' + F.esc(e.code) + '</div>' +
          '<div class="t">' + F.esc(e.title) + '</div><div class="s">' + F.esc(e.short || '') + '</div></div>'
        : '<div class="thumb"></div><div class="meta"><div class="code">REC \u2014 ???</div><div class="t">Registrazione non ancora acquisita</div>' +
          '<div class="s">si sblocca durante l\u2019indagine</div></div>';
      if (got) card.addEventListener('click', () => window.FMUI.openEvidence(e.id));
      grid.appendChild(card);
    });
    root.appendChild(grid);
  };
})();
