/* vista CASE FILE */
window.FMViews = window.FMViews || { views: {} };
(function () {
  const V = window.FMViews.views;

  V.casew = function (root) {
    const S = window.FMState, st = S.st, M = window.FM_META, F = window.FM;
    const goal = S.chapterGoal();
    const chs = window.FM_CHAPTERS;
    const cur = chs[S.chapter() - 1];

    const head = F.el('div');
    head.innerHTML =
      '<h1 class="pagetitle">CASE FILE</h1>' +
      '<div class="pagesub">' + F.esc(M.caseId) + ' \u2014 archivio investigativo</div>';
    root.appendChild(head);

    const info = F.el('div', 'card');
    info.innerHTML =
      '<h3>' + F.esc(M.subject) + '</h3>' +
      '<table class="mono" style="font-size:12px;color:#9aa3ad;border-spacing:0 4px">' +
      '<tr><td style="padding-right:18px">LUOGO</td><td style="color:#cfc6b8">' + F.esc(M.place) + '</td></tr>' +
      '<tr><td style="padding-right:18px">SCOMPARSA</td><td style="color:#cfc6b8">' + F.esc(M.dateOfDisappearance) + '</td></tr>' +
      '<tr><td style="padding-right:18px">DENUNCIA</td><td style="color:#cfc6b8">' + F.esc(M.reported) + '</td></tr>' +
      '<tr><td style="padding-right:18px">STATO</td><td style="color:#cfc6b8">' + F.esc(M.status) + '</td></tr>' +
      '</table>';
    root.appendChild(info);

    const brief = F.el('div', 'card');
    brief.innerHTML = '<h3>Briefing</h3>' + M.briefing;
    root.appendChild(brief);

    const chap = F.el('div', 'card');
    chap.innerHTML = '<h3>Capitolo ' + (cur.n < 10 ? '0' + cur.n : cur.n) + ' \u2014 ' + F.esc(cur.title) + '</h3>' +
      '<p>' + F.esc(cur.text) + '</p>' +
      '<p class="small mono">' + (goal.next
        ? 'per aprire il capitolo 0' + goal.next + ': ' + goal.need + ' prove ancora da acquisire'
        : 'tutti i capitoli aperti') + '</p>';
    root.appendChild(chap);

    const obj = F.el('div', 'card');
    obj.innerHTML = '<h3>Obiettivi operativi</h3><ul style="margin:6px 0 0;padding-left:20px">' +
      M.objectives.map(o => '<li style="margin:4px 0">' + F.esc(o) + '</li>').join('') + '</ul>';
    root.appendChild(obj);

    const hint = F.el('div', 'card');
    hint.innerHTML = '<h3>Norme di lavoro</h3>' +
      '<p class="small">Nessuna fonte \u00e8 affidabile per principio: testimonianze, orari e documenti vanno confrontati, mai presi per buoni. La bacheca e la timeline sono i tuoi strumenti: segnala le incoerenze che trovi, non risolvono il caso da sole.</p>' +
      '<p class="small mono">prove a disposizione: <b style="color:#cfc6b8">' + st.discovered.length + '</b> \u2014 contraddizioni segnalate: <b style="color:#d1554a">' + S.contradictionCount() + '</b></p>';
    root.appendChild(hint);
  };
})();
