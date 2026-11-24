import type { DeptId, GameState } from './types'

export const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v))

export function deptById(s: GameState, id: DeptId) {
  return s.departments.find((d) => d.id === id)!
}

export const deptPerf = (s: GameState, id: DeptId) => deptById(s, id).performance

export function log(s: GameState, kind: 'info' | 'good' | 'bad' | 'mystery' | 'money', text: string) {
  s.log.push({ week: s.week, kind, text })
  if (s.log.length > 600) s.log.splice(0, s.log.length - 600)
}
