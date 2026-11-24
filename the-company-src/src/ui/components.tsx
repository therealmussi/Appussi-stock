import type { ReactNode } from 'react'

export function Panel({ title, right, children, className = '' }: { title?: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <header className="panel-head">
          <h3>{title}</h3>
          {right}
        </header>
      )}
      <div className="panel-body">{children}</div>
    </section>
  )
}

const KIND_CLASS: Record<string, string> = { primary: 'btn primary', danger: 'btn danger', ghost: 'btn ghost', gold: 'btn gold', small: 'btn small' }

export function Btn({ children, onClick, kind = '', disabled, title, className = '' }: { children: ReactNode; onClick?: () => void; kind?: '' | 'primary' | 'danger' | 'ghost' | 'gold' | 'small'; disabled?: boolean; title?: string; className?: string }) {
  return (
    <button className={`${KIND_CLASS[kind] ?? 'btn'} ${className}`} onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  )
}

export function Stat({ label, value, sub, tone = '' }: { label: string; value: string; sub?: string; tone?: '' | 'good' | 'bad' | 'warn' }) {
  return (
    <div className={`stat ${tone}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  )
}

export function Bar({ value, color = 'var(--accent)', height = 6 }: { value: number; color?: string; height?: number }) {
  return (
    <div className="bar" style={{ height }}>
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  )
}

export function Gauge({ label, value, invert = false }: { label: string; value: number; invert?: boolean }) {
  const good = invert ? value < 45 : value > 55
  const bad = invert ? value > 65 : value < 35
  return (
    <div className="gauge">
      <div className="gauge-top">
        <span className="stat-label">{label}</span>
        <span className={good ? 't-good' : bad ? 't-bad' : 't-mid'}>{Math.round(value)}</span>
      </div>
      <Bar value={value} color={good ? 'var(--good)' : bad ? 'var(--bad)' : 'var(--warn)'} />
    </div>
  )
}

export function Sparkline({ data, width = 130, height = 30, color = 'var(--accent)' }: { data: number[]; width?: number; height?: number; color?: string }) {
  if (data.length < 2) return <svg width={width} height={height} />
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - 2) + 1
    const y = height - 2 - ((v - min) / span) * (height - 4)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg width={width} height={height} className="sparkline">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

export function Tag({ children, tone = '' }: { children: ReactNode; tone?: string }) {
  return <span className={`tag ${tone}`}>{children}</span>
}
