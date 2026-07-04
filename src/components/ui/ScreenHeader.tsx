import type { ReactNode } from 'react'

type Props = {
  eyebrow: string
  eyebrowColor?: string
  title: string
  subtitle?: ReactNode
}

export function ScreenHeader({ eyebrow, eyebrowColor = 'var(--accent-navy)', title, subtitle }: Props) {
  return (
    <div style={{ marginBottom: 'var(--space-4-5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1-5)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: eyebrowColor, boxShadow: `0 0 0 3px ${eyebrowColor}22` }} />
        <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-bold)', color: eyebrowColor, letterSpacing: '.5px' }}>{eyebrow}</span>
      </div>
      <h1 style={{ margin: 'var(--space-1-5) 0 0', fontSize: 'var(--fs-3xl)', fontWeight: 'var(--fw-extrabold)', letterSpacing: '-0.5px' }}>{title}</h1>
      <div style={{ width: 46, height: 3, borderRadius: 3, marginTop: 'var(--space-2)', background: `linear-gradient(90deg, ${eyebrowColor}, transparent)` }} />
      {subtitle && (
        <p style={{ margin: 'var(--space-2) 0 0', fontSize: 'var(--fs-sm)', color: 'var(--text-faint)', lineHeight: 'var(--lh-relaxed)', maxWidth: 640 }}>{subtitle}</p>
      )}
    </div>
  )
}
