import type { GameState } from './types'

const KEY = 'meridian_save_v1'

export function saveGame(s: GameState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
    return true
  } catch {
    return false
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as GameState
    if (!s || typeof s.week !== 'number' || !Array.isArray(s.departments)) return null
    return s
  } catch {
    return null
  }
}

export function hasSave(): boolean {
  try { return !!localStorage.getItem(KEY) } catch { return false }
}

export function clearSave() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}
