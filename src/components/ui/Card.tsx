import type { CSSProperties, ReactNode } from 'react'

type Props = {
  children: ReactNode
  title?: ReactNode
  action?: ReactNode
  style?: CSSProperties
}

export function Card({ children, title, action, style }: Props) {
  return (
    <div
      className="card"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--pad-card)',
        ...style,
      }}
    >
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2-5)', marginBottom: 'var(--space-3)' }}>
          {title && <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)' }}>{title}</div>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
