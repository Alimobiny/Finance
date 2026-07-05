import { useMemo, useState } from 'react'
import type { Trade } from '../../../types'
import { faNumber } from '../../../lib/format/number'
import { hasR } from '../lib/tradeOutcome'

type Mode = 'R' | 'money'
interface Pt {
  cum: number
  delta: number
  label: string
}

const round2 = (v: number) => Math.round(v * 100) / 100

/**
 * سری منحنی رشد را می‌سازد:
 *   ۱) اگر معاملات R داشته باشند → R تجمعی (دقیق‌ترین).
 *   ۲) وگرنه اگر سود واقعی داشته باشند → سود خالص تجمعی ($) — پس حتی پیش از تنظیم ریسک هم منحنی دیده می‌شود.
 */
function buildSeries(trades: Trade[]): { mode: Mode; pts: Pt[] } | null {
  const chrono = trades.slice().reverse() // آرایه جدید→قدیم است؛ منحنی باید قدیم→جدید باشد.
  const withR = chrono.filter(hasR)
  if (withR.length > 0) {
    let cum = 0
    return { mode: 'R', pts: withR.map((t) => ({ delta: t.r, cum: (cum = round2(cum + t.r)), label: `${t.symbol} · ${t.date}` })) }
  }
  const withP = chrono.filter((t) => t.profit != null)
  if (withP.length > 0) {
    let cum = 0
    return { mode: 'money', pts: withP.map((t) => ({ delta: t.profit as number, cum: (cum = round2(cum + (t.profit as number))), label: `${t.symbol} · ${t.date}` })) }
  }
  return null
}

function fmt(mode: Mode, v: number): string {
  if (mode === 'R') return `${v > 0 ? '+' : v < 0 ? '−' : ''}${faNumber(Math.abs(v), 2)} R`
  return `${v > 0 ? '+' : v < 0 ? '−' : ''}$${faNumber(Math.abs(v), Number.isInteger(v) ? 0 : 1)}`
}

// padding داخل مختصات نرمال‌شدهٔ ۰..۱۰۰
const PX = 2
const PT = 10
const PB = 12

export function EquityCurve({ trades }: { trades: Trade[] }) {
  const series = useMemo(() => buildSeries(trades), [trades])
  const [hover, setHover] = useState<number | null>(null)

  const geo = useMemo(() => {
    if (!series) return null
    const cums = series.pts.map((p) => p.cum)
    const minC = Math.min(0, ...cums)
    const maxC = Math.max(0, ...cums)
    const range = maxC - minC || 1
    const n = series.pts.length
    const x = (i: number) => PX + (n <= 1 ? 50 : (i / (n - 1)) * (100 - 2 * PX))
    const y = (c: number) => PT + (1 - (c - minC) / range) * (100 - PT - PB)
    const coords = series.pts.map((p, i) => ({ x: x(i), y: y(p.cum), ...p }))
    const line = coords.map((c, i) => `${i ? 'L' : 'M'}${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(' ')
    const zeroY = y(0)
    const area = `${line} L${coords[coords.length - 1].x.toFixed(2)} ${zeroY.toFixed(2)} L${coords[0].x.toFixed(2)} ${zeroY.toFixed(2)} Z`
    return { coords, line, area, zeroY, last: cums[cums.length - 1], minC, maxC }
  }, [series])

  const up = (geo?.last ?? 0) >= 0
  const stroke = up ? 'var(--accent-green)' : 'var(--accent-red-strong)'
  const fillId = up ? 'eqUp' : 'eqDown'

  return (
    <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>منحنی رشد سرمایه</div>
          {series && (
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-navy)', background: 'var(--accent-navy-soft)', borderRadius: 6, padding: '2px 8px' }}>
              {series.mode === 'R' ? 'R تجمعی' : 'سود تجمعی ($)'}
            </span>
          )}
        </div>
        {geo && (
          <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
            آخرین:{' '}
            <b style={{ color: up ? 'var(--accent-green)' : 'var(--accent-red-strong)' }}>{fmt(series!.mode, geo.last)}</b>
          </div>
        )}
      </div>

      {geo ? (
        <div
          style={{ position: 'relative', width: '100%', height: 150 }}
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            const frac = (e.clientX - r.left) / r.width
            const n = geo.coords.length
            setHover(Math.max(0, Math.min(n - 1, Math.round(frac * (n - 1)))))
          }}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity="0.16" />
                <stop offset="100%" stopColor={stroke} stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* خطوط راهنمای کم‌رنگ */}
            {[0.5].map((g) => (
              <line key={g} x1="0" y1={100 * g} x2="100" y2={100 * g} stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeOpacity="0.6" />
            ))}
            {/* خط پایهٔ صفر */}
            <line x1="0" y1={geo.zeroY} x2="100" y2={geo.zeroY} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
            <path d={geo.area} fill={`url(#${fillId})`} />
            <path d={geo.line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            {hover != null && (
              <line x1={geo.coords[hover].x} y1="0" x2={geo.coords[hover].x} y2="100" stroke={stroke} strokeWidth="1" strokeOpacity="0.4" vectorEffect="non-scaling-stroke" />
            )}
          </svg>

          {/* نشانگرها و تولتیپ به‌صورت HTML تا گرد و خوانا بمانند */}
          {(() => {
            const idx = hover ?? geo.coords.length - 1
            const c = geo.coords[idx]
            return (
              <div
                style={{
                  position: 'absolute',
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  width: 9,
                  height: 9,
                  marginInlineStart: -4.5,
                  marginTop: -4.5,
                  borderRadius: '50%',
                  background: stroke,
                  border: '2px solid var(--surface)',
                  boxShadow: '0 0 0 1px rgba(0,0,0,.06)',
                  pointerEvents: 'none',
                }}
              />
            )
          })()}

          {hover != null && (
            <div
              style={{
                position: 'absolute',
                left: `${geo.coords[hover].x}%`,
                top: 0,
                transform: `translateX(${geo.coords[hover].x > 60 ? 'calc(-100% - 8px)' : '8px'})`,
                background: 'var(--text)',
                color: '#fff',
                borderRadius: 8,
                padding: '6px 9px',
                fontSize: 11,
                lineHeight: 1.5,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: 'var(--shadow-md)',
                zIndex: 2,
              }}
            >
              <div style={{ opacity: 0.75, fontSize: 10 }}>{geo.coords[hover].label}</div>
              <div style={{ fontWeight: 700 }}>
                تجمعی: {fmt(series!.mode, geo.coords[hover].cum)}
              </div>
              <div style={{ opacity: 0.85 }}>این معامله: {fmt(series!.mode, geo.coords[hover].delta)}</div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: 26, textAlign: 'center', fontSize: 12.5, color: 'var(--text-quiet)', lineHeight: 1.7 }}>
          {trades.length === 0
            ? 'با ثبت یا وارد کردن اولین معامله، منحنی رشد این‌جا شکل می‌گیرد.'
            : 'این معاملات هنوز «سود» یا «R» ثبت‌شده ندارند. فایل متاتریدر را دوباره import کن (نسخهٔ اصلاح‌شده سود واقعی را ذخیره می‌کند) یا «مبلغ ریسک هر معامله» حساب را تنظیم کن.'}
        </div>
      )}
    </div>
  )
}
