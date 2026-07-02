import { faMoney, faPercent } from '../../lib/format/number'

export interface DonutSlice {
  label: string
  value: number
  color: string
}

/**
 * نمودار دایره‌ای (donut) با راهنمای کنار آن.
 * درصد هر بخش (نسبت به جمع) و ارزش آن نمایش داده می‌شود.
 */
export function AssetDonut({
  slices,
  size = 138,
  thickness = 20,
  emptyHint = 'ارزشی برای نمایش نیست.',
  formatValue = faMoney,
}: {
  slices: DonutSlice[]
  size?: number
  thickness?: number
  emptyHint?: string
  formatValue?: (v: number) => string
}) {
  const positive = slices.filter((s) => s.value > 0)
  const total = positive.reduce((sum, s) => sum + s.value, 0)

  if (total <= 0) {
    return <div style={{ fontSize: 12, color: 'var(--text-quiet)', padding: '10px 2px' }}>{emptyHint}</div>
  }

  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const cx = size / 2
  const ordered = [...positive].sort((a, b) => b.value - a.value)

  let acc = 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
          <g transform={`rotate(-90 ${cx} ${cx})`}>
            <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--surface-muted)" strokeWidth={thickness} />
            {ordered.map((s) => {
              const len = (s.value / total) * c
              const seg = (
                <circle
                  key={s.label}
                  cx={cx}
                  cy={cx}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-acc}
                >
                  <title>{`${s.label} — ${faPercent((s.value / total) * 100)}`}</title>
                </circle>
              )
              acc += len
              return seg
            })}
          </g>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 10.5, color: 'var(--text-faint)', fontWeight: 600 }}>جمع</div>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text)', direction: 'ltr' }}>{formatValue(total)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1, minWidth: 150 }}>
        {ordered.map((s) => {
          const pct = (s.value / total) * 100
          return (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>{s.label}</span>
              <b style={{ color: 'var(--text)', direction: 'ltr' }}>{faPercent(pct)}</b>
              <span style={{ color: 'var(--text-quiet)', direction: 'ltr', fontSize: 11 }}>{formatValue(s.value)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
