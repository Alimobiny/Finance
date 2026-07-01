import type { Trade } from '../../../types'
import { faNumber } from '../../../lib/format/number'

const W = 320
const H = 90
const PAD = 6

function buildPath(trades: Trade[]) {
  const rValues = trades
    .filter((t) => t.r != null)
    .slice()
    .reverse() // معاملات جدید در ابتدای آرایه‌اند؛ منحنی باید زمانی (قدیم→جدید) باشد
    .map((t) => t.r as number)
  if (rValues.length === 0) return null

  const points: { i: number; cum: number }[] = []
  let cum = 0
  rValues.forEach((r, i) => {
    cum += r
    points.push({ i: i + 1, cum })
  })

  const cums = points.map((p) => p.cum)
  const minC = Math.min(0, ...cums)
  const maxC = Math.max(0, ...cums)
  const range = maxC - minC || 1
  const xMax = Math.max(...points.map((p) => p.i), 1)

  const x = (i: number) => PAD + ((i - 1) / Math.max(xMax - 1, 1)) * (W - 2 * PAD)
  const y = (c: number) => H - PAD - ((c - minC) / range) * (H - 2 * PAD)

  const line = points.map((p, k) => `${k ? 'L' : 'M'}${x(p.i).toFixed(1)} ${y(p.cum).toFixed(1)}`).join(' ')
  const zeroY = y(0).toFixed(1)
  const area = `${line} L${x(points[points.length - 1].i).toFixed(1)} ${zeroY} L${x(1).toFixed(1)} ${zeroY} Z`

  return { line, area, zeroY, last: cums[cums.length - 1] }
}

export function EquityCurve({ trades }: { trades: Trade[] }) {
  const curve = buildPath(trades)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>منحنی رشد سرمایه (R تجمعی)</div>
        <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
          آخرین:{' '}
          <b style={{ color: !curve ? 'var(--text-quiet)' : curve.last >= 0 ? 'var(--accent-green)' : 'var(--accent-red-strong)' }}>
            {curve ? `${curve.last > 0 ? '+' : ''}${faNumber(curve.last, 2)} R` : '—'}
          </b>
        </div>
      </div>
      {curve ? (
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 120, display: 'block' }}>
          <line x1={6} y1={curve.zeroY} x2={314} y2={curve.zeroY} stroke="#E0DBD0" strokeWidth={1} strokeDasharray="3 3" />
          <path d={curve.area} fill="#8C3A3A14" />
          <path d={curve.line} fill="none" stroke="#8C3A3A" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      ) : (
        <div style={{ padding: 26, textAlign: 'center', fontSize: 13, color: 'var(--text-quiet)' }}>با ثبت اولین معامله، منحنی رشد این‌جا شکل می‌گیرد.</div>
      )}
    </div>
  )
}
