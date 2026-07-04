import type { ReactNode } from 'react'

type Props = {
  eyebrow: string
  eyebrowColor?: string
  title: string
  subtitle?: ReactNode
}

export function ScreenHeader({ eyebrow, eyebrowColor = 'var(--accent-navy)', title, subtitle }: Props) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: eyebrowColor, boxShadow: `0 0 0 3px ${eyebrowColor}22` }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: eyebrowColor, letterSpacing: '.5px' }}>{eyebrow}</span>
      </div>
      <h1 style={{ margin: '6px 0 0', fontSize: 25, fontWeight: 800, letterSpacing: '-0.5px' }}>{title}</h1>
      <div style={{ width: 46, height: 3, borderRadius: 3, marginTop: 8, background: `linear-gradient(90deg, ${eyebrowColor}, transparent)` }} />
      {subtitle && (
        <p style={{ margin: '9px 0 0', fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.6, maxWidth: 640 }}>{subtitle}</p>
      )}
    </div>
  )
}
