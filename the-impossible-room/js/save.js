/* save.js + settings.js — persistence via localStorage. */

const KEY = 'impossible-room-save-v1';

export const DEFAULT_SETTINGS = {
  sensitivity: 1.0,
  master: 0.8,
  music: 0.7,
  sfx: 0.9,
  quality: 'medium',
  fullscreen: false,
};

export function defaultSave() {
  return {
    v: 1,
    chapter: 0,              // current level index 0..7
    maxUnlocked: 1,          // highest level number available for replay
    completed: [false, false, false, false, false, false, false, false],
    tapes: [],               // ids of collected recordings
    endingSeen: false,
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.v !== 1) return null;
    const base = defaultSave();
    return {
      ...base,
      ...data,
      completed: Array.isArray(data.completed) && data.completed.length === 8
        ? data.completed : base.completed,
      tapes: Array.isArray(data.tapes) ? data.tapes : [],
      settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
    };
  } catch (e) {
    return null;
  }
}

export function writeSave(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage disabled */ }
}

export function clearSave() {
  try { localStorage.removeItem(KEY); } catch (e) { }
}
