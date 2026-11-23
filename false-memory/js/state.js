/* stato di gioco e persistenza */
(function () {
  const KEY = 'fm_case001_v1';
  const CHAPTER_THRESHOLDS = { 2: 11, 3: 17, 4: 23, 5: 27 };

  function fresh() {
    return {
      started: false, finished: false,
      chapter: 1,
      discovered: [], exams: [], speakers: [], flags: [],
      talks: {}, confronts: {}, read: {},
      reliability: {},
      board: { nodes: [], links: [], nextNode: 1, nextLink: 1 },
      timeline: { custom: [], flagged: [] },
      conclusions: null, endings: [],
      settings: { music: 0.4, sfx: 0.6, textSize: 1, animate: true, audioOn: true },
      seen: {}
    };
  }

  let st = null;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      st = raw ? JSON.parse(raw) : fresh();
    } catch (e) { st = fresh(); }
    if (!st.settings) st.settings = fresh().settings;
    return st;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* pieno o non disponibile */ }
  }
  function reset() {
    const prev = st || {};
    st = fresh();
    if (prev.endings && prev.endings.length) st.endings = prev.endings;
    if (prev.settings) st.settings = prev.settings;
    st.started = true;
    save();
    return st;
  }
  const hasSave = () => !!localStorage.getItem(KEY);

  const S = {
    get st() { return st || load(); },
    load, save, reset, hasSave,

    isDiscovered: id => st.discovered.indexOf(id) !== -1,
    discover(ids) {
      let added = [];
      (Array.isArray(ids) ? ids : [ids]).forEach(id => {
        if (st.discovered.indexOf(id) === -1) { st.discovered.push(id); added.push(id); }
      });
      if (added.length) save();
      return added;
    },

    hasFlag: f => st.flags.indexOf(f) !== -1,
    setFlag(f) { if (st.flags.indexOf(f) === -1) { st.flags.push(f); save(); } },

    hasExam: evId => st.exams.indexOf(evId) !== -1,
    markExam: evId => { if (st.exams.indexOf(evId) === -1) { st.exams.push(evId); save(); } },

    setReliability(evId, level) { st.reliability[evId] = level; save(); },
    getReliability(ev) { return st.reliability[ev.id] || ev.reliability || 'unknown'; },

    hasTalk: key => !!st.talks[key],
    markTalk(key) { st.talks[key] = true; save(); },
    hasCon: key => !!st.confronts[key],
    markCon(key) { st.confronts[key] = true; save(); },

    chapter() { return st.chapter; },
    progressChapter() {
      const n = st.discovered.length;
      let ch = 1;
      [2, 3, 4, 5].forEach(c => { if (n >= CHAPTER_THRESHOLDS[c]) ch = c; });
      if (ch > st.chapter) { st.chapter = ch; save(); return ch; }
      return 0;
    },
    chapterGoal() {
      const n = st.discovered.length;
      for (const c of [2, 3, 4, 5]) if (n < CHAPTER_THRESHOLDS[c]) return { next: c, need: CHAPTER_THRESHOLDS[c] - n };
      return { next: null, need: 0 };
    },

    /* contraddizioni segnate: relazioni "contradicts" in bacheca + eventi flaggati */
    contradictionCount() {
      const links = (st.board.links || []).filter(l => l.rel === 'contradicts').length;
      return links + (st.timeline.flagged || []).length;
    }
  };
  window.FMState = S;
})();
