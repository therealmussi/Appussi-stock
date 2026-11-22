/* ui.js — DOM overlays: menus, HUD, prompts, subtitles, fades, title cards,
   chapter select, settings, credits, ending sequence. */

const $ = (id) => document.getElementById(id);

export class UI {
  constructor(game) {
    this.game = game;
    this.el = {
      main: $('screen-main'),
      chapters: $('screen-chapters'),
      credits: $('screen-credits'),
      settings: $('screen-settings'),
      pause: $('screen-pause'),
      hud: $('hud'),
      prompt: $('prompt'),
      subtitle: $('subtitle'),
      fade: $('fade'),
      titleCard: $('titlecard'),
      titleName: $('titlecard-name'),
      titleSub: $('titlecard-sub'),
      tape: $('tape-indicator'),
      tapeCount: $('tape-count'),
      crosshair: $('crosshair'),
      vignette: $('vignette'),
      clickToPlay: $('click-to-play'),
    };
    this._subs = [];
    this.bindMenus();
    this.bindSettings();
  }

  /* ---------- menu routing ---------- */
  showScreen(name) {
    for (const k of ['main', 'chapters', 'credits', 'settings', 'pause']) {
      this.el[k].classList.toggle('visible', k === name);
    }
    this.hud(name === null || name === undefined);
  }

  hideScreens() {
    for (const k of ['main', 'chapters', 'credits', 'settings', 'pause']) {
      this.el[k].classList.remove('visible');
    }
  }

  hud(v) {
    this.el.hud.classList.toggle('visible', !!v);
    this.el.vignette.classList.toggle('visible', !!v);
    this.el.clickToPlay.classList.toggle('visible', !!v && !this.game.input.locked && this.game.state === 'playing');
  }

  /* ---------- HUD ---------- */
  prompt(text) {
    const p = this.el.prompt;
    if (text) {
      if (p.textContent !== text) p.textContent = text;
      p.classList.add('on');
    } else {
      p.classList.remove('on');
    }
  }

  subtitle(text, dur = 3.5, onDone = null) {
    const el = this.el.subtitle;
    const item = { text, dur, onDone };
    this._subs.push(item);
    if (this._subs.length === 1) this._nextSubtitle();
  }

  _nextSubtitle() {
    const item = this._subs[0];
    if (!item) { this.el.subtitle.classList.remove('on'); return; }
    this.el.subtitle.textContent = item.text;
    this.el.subtitle.classList.add('on');
    clearTimeout(this._subT);
    this._subT = setTimeout(() => {
      this._subs.shift();
      if (item.onDone) item.onDone();
      this._nextSubtitle();
    }, item.dur * 1000);
  }

  clearSubtitles() {
    this._subs.length = 0;
    clearTimeout(this._subT);
    this.el.subtitle.classList.remove('on');
  }

  tapeIndicator(on) {
    this.el.tape.classList.toggle('on', !!on);
  }

  setTapeCount(n, total) {
    this.el.tapeCount.textContent = 'Recordings ' + n + ' / ' + total;
  }

  fadeTo(target, ms = 300, color = [0, 0, 0]) {
    this.game.fade.target = target;
    this.game.fade.speed = 1 / Math.max(0.05, ms / 1000);
    if (color) this.game.fade.color = color;
    this.el.fade.style.background = `rgb(${color.map(c => Math.round(c * 255)).join(',')})`;
  }

  setFade(a, color = [0, 0, 0]) {
    this.el.fade.style.opacity = String(a);
  }

  titleCard(name, sub) {
    const card = this.el.titleCard;
    if (name === '—') { // completion card
      this.el.titleName.textContent = sub || '';
      this.el.titleSub.textContent = 'The room rearranges itself.';
    } else {
      this.el.titleName.textContent = name;
      this.el.titleSub.textContent = sub || '';
    }
    card.classList.add('on');
    clearTimeout(this._titleT);
    this._titleT = setTimeout(() => card.classList.remove('on'), 2600);
  }

  setTitleVoidMode(on) {
    document.body.classList.toggle('void-mode', !!on);
  }

  /* ---------- menus ---------- */
  bindMenus() {
    const g = () => this.game;
    $('btn-new').addEventListener('click', () => {
      g().audio.init(); g().audio.resume(); g().audio.uiClick();
      g().save.chapter = 0;
      g().save.completed = [false, false, false, false, false, false, false, false];
      g().save.persist();
      this.hideScreens();
      this.runIntro(() => g().startLevel(0));
    });
    $('btn-continue').addEventListener('click', () => {
      g().audio.init(); g().audio.uiClick();
      if (localStorage.getItem('impossible-room-save-v1')) {
        g().state = 'playing';
        this.hideScreens();
        g().startLevel(g().save.chapter);
      }
    });
    $('btn-chapters').addEventListener('click', () => {
      g().audio.init(); g().audio.uiClick();
      this.buildChapters();
      this.showScreen('chapters');
    });
    $('btn-settings').addEventListener('click', () => {
      g().audio.init(); g().audio.uiClick();
      this._settingsReturn = 'main';
      this.showScreen('settings');
    });
    $('btn-credits').addEventListener('click', () => {
      g().audio.init(); g().audio.uiClick();
      this.showScreen('credits');
    });
    $('btn-chapters-back').addEventListener('click', () => {
      g().audio.uiClick(); this.showScreen('main');
    });
    $('btn-credits-back').addEventListener('click', () => {
      g().audio.uiClick();
      if (this._creditsCb) { const cb = this._creditsCb; this._creditsCb = null; cb(); }
      else this.showScreen('main');
    });
    $('btn-settings-back').addEventListener('click', () => {
      g().audio.uiClick();
      this.showScreen(this._settingsReturn === 'pause' ? 'pause' : 'main');
    });

    // pause menu
    $('btn-resume').addEventListener('click', () => g().resume());
    $('btn-restart').addEventListener('click', () => {
      g().audio.uiClick();
      g().restartLevel();
      g().resume();
    });
    $('btn-pause-settings').addEventListener('click', () => {
      g().audio.uiClick();
      this._settingsReturn = 'pause';
      this.showScreen('settings');
    });
    $('btn-quit').addEventListener('click', () => {
      g().audio.uiClick();
      g().toMenu();
    });

    // click to lock
    this.el.clickToPlay.addEventListener('click', () => {
      g().audio.init();
      g().audio.resume();
      g().input.requestLock();
    });
    document.getElementById('game-canvas').addEventListener('click', () => {
      if (g().state === 'playing' && !g().input.locked) {
        g().audio.init(); g().audio.resume();
        g().input.requestLock();
      }
    });
  }

  runIntro(cb) {
    const card = $('intro');
    const lines = [
      'Cold floor. A lamp you do not remember turning on.',
      'The door says it is a door.',
      'The building disagrees.',
    ];
    card.classList.add('visible');
    let i = 0;
    const nextLine = () => {
      if (i >= lines.length) {
        card.classList.remove('visible');
        cb();
        return;
      }
      card.textContent = lines[i];
      card.style.opacity = '1';
      setTimeout(() => { card.style.opacity = '0'; i++; setTimeout(nextLine, 900); }, 2300);
    };
    card.style.opacity = '0';
    nextLine();
  }

  buildChapters() {
    const g = this.game;
    const host = $('chapter-grid');
    host.innerHTML = '';
    const names = ['THE BEGINNING', 'THE WRONG DOOR', 'UPSIDE DOWN', 'THE SMALLER WORLD',
      'PERSPECTIVE', 'THE LOOP', 'THE ARCHITECT', 'THE IMPOSSIBLE ROOM'];
    names.forEach((n, i) => {
      const unlocked = i < g.save.maxUnlocked;
      const done = g.save.completed[i];
      const div = document.createElement('div');
      div.className = 'chapter' + (unlocked ? '' : ' locked') + (done ? ' done' : '');
      div.innerHTML = `<div class="ch-num">${String(i + 1).padStart(2, '0')}</div>
        <div class="ch-name">${unlocked ? n : '—— LOCKED ——'}</div>
        <div class="ch-state">${done ? '▪ surveyed' : (unlocked ? 'available' : 'unreachable')}</div>`;
      if (unlocked) {
        div.addEventListener('click', () => {
          this.game.audio.uiClick();
          this.hideScreens();
          this.game.state = 'playing';
          this.game.startLevel(i);
        });
      }
      host.appendChild(div);
    });
    this.el.tapeCount.textContent = 'Recordings ' + g.save.tapes.length + ' / ' + g.totalTapes;
    $('chapters-tapes').textContent = 'Recordings ' + g.save.tapes.length + ' / ' + g.totalTapes;
  }

  bindSettings() {
    const g = () => this.game;
    const bind = (id, apply, fmt) => {
      const el = $(id);
      const val = $(id + '-val');
      const upd = () => {
        const v = parseFloat(el.value);
        val.textContent = fmt ? fmt(v) : v;
      };
      el.addEventListener('input', () => { upd(); apply(parseFloat(el.value)); });
      upd();
      return el;
    };
    this._setEls = {
      sens: bind('set-sens', (v) => {
        g().save.settings.sensitivity = v;
        g().input.sensitivity = v;
        g().save.persist();
      }, v => v.toFixed(2)),
      master: bind('set-master', (v) => {
        g().save.settings.master = v; g().audio.volumes.master = v; g().audio.applyVolumes(); g().save.persist();
      }, v => Math.round(v * 100) + '%'),
      music: bind('set-music', (v) => {
        g().save.settings.music = v; g().audio.volumes.music = v; g().audio.applyVolumes(); g().save.persist();
      }, v => Math.round(v * 100) + '%'),
      sfx: bind('set-sfx', (v) => {
        g().save.settings.sfx = v; g().audio.volumes.sfx = v; g().audio.applyVolumes(); g().save.persist();
      }, v => Math.round(v * 100) + '%'),
      quality: $('set-quality'),
      fullscreen: $('set-fullscreen'),
    };
    this._setEls.quality.addEventListener('change', () => {
      g().save.settings.quality = this._setEls.quality.value;
      g().renderer.quality = this._setEls.quality.value;
      g().renderer.recreate();
      g().save.persist();
    });
    this._setEls.fullscreen.addEventListener('click', () => {
      const on = !document.fullscreenElement;
      if (on) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
      g().save.settings.fullscreen = on;
      g().save.persist();
    });
  }

  syncSettings() {
    const s = this.game.save.settings;
    this._setEls.sens.value = s.sensitivity;
    this._setEls.master.value = s.master;
    this._setEls.music.value = s.music;
    this._setEls.sfx.value = s.sfx;
    this._setEls.quality.value = s.quality;
    for (const el of [this._setEls.sens, this._setEls.master, this._setEls.music, this._setEls.sfx]) {
      el.dispatchEvent(new Event('input'));
    }
  }

  /* ---------- ending ---------- */
  runEnding(cb) {
    const cards = [
      'You stand where you began.',
      'Except the beginning was never a place.',
      'The room was never measured from the inside.',
      'You were not surveyed.',
      'You were the instrument.',
      'Somewhere, another lamp turns on.',
    ];
    const fade = $('ending-white');
    const card = $('ending-card');
    fade.classList.add('visible');
    let i = 0;
    const next = () => {
      if (i >= cards.length) {
        card.textContent = '';
        card.classList.remove('on');
        fade.classList.remove('visible');
        this.setTitleVoidMode(true);
        this.showCreditsThen(cb);
        return;
      }
      card.textContent = cards[i];
      card.classList.add('on');
      setTimeout(() => {
        card.classList.remove('on');
        i++;
        setTimeout(next, 700);
      }, 2600);
    };
    setTimeout(next, 1200);
  }

  showCreditsThen(cb) {
    this.hideScreens();
    this.hud(false);
    this.showScreen('credits');
    this._creditsCb = cb;
    // credits back button returns to main menu
  }
}
