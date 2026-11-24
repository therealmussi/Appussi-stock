export const fmtK = (v: number) => {
  const sign = v < 0 ? '−' : ''
  const a = Math.abs(Math.round(v))
  return `${sign}$${a.toLocaleString('en-US')}`
}
export const fmtPct = (v: number) => `${Math.round(v)}%`
export const weekDate = (week: number, founded = 2026) => {
  const d = new Date(founded, 0, 6 + (week - 1) * 7)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
