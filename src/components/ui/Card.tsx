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
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 18,
        ...style,
      }}
    >
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 13 }}>
          {title && <div style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</div>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
