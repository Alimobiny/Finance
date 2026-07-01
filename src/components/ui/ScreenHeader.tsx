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
      <div style={{ fontSize: 12, fontWeight: 600, color: eyebrowColor, letterSpacing: '.5px' }}>{eyebrow}</div>
      <h1 style={{ margin: '3px 0 0', fontSize: 25, fontWeight: 800, letterSpacing: '-0.5px' }}>{title}</h1>
      {subtitle && (
        <p style={{ margin: '7px 0 0', fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.6, maxWidth: 640 }}>{subtitle}</p>
      )}
    </div>
  )
}
