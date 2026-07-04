import type { CSSProperties } from 'react'

type StatTileSize = 'kpi' | 'compact'

type Props = {
  label: string
  value: string
  /** رنگ اصلیِ مقدار و نوار لهجه؛ پیش‌فرض رنگ متن معمولی */
  color?: string
  /** توضیح ریز زیر مقدار (اختیاری) */
  sub?: string
  /** نوار گرادیانیِ بالای کاشی (سبک KPI داشبورد) */
  accentBar?: boolean
  /** اندازهٔ کاشی: kpi بزرگ‌تر با فاصلهٔ بیشتر، compact فشرده‌تر */
  size?: StatTileSize
  style?: CSSProperties
}

/**
 * کاشیِ آماریِ واحدِ اپ — جایگزینِ دو کامپوننت تکراریِ قبلی (`Kpi` داشبورد و
 * `Box` ژورنال). همهٔ اندازه‌ها از توکن‌های سیستم طراحی می‌آیند تا آمار در
 * صفحات مختلف یک‌دست دیده شود (اصل DRY + یک‌دستیِ بصری).
 */
export function StatTile({ label, value, color = 'var(--text)', sub, accentBar = false, size = 'compact', style }: Props) {
  const isKpi = size === 'kpi'

  return (
    <div
      className="tile"
      style={{
        position: 'relative',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: isKpi ? 'var(--pad-tile)' : 'var(--pad-tile-compact)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {accentBar && (
        <div
          style={{
            position: 'absolute',
            insetInlineStart: 0,
            insetInlineEnd: 0,
            top: 0,
            height: 3,
            background: `linear-gradient(90deg, ${color}, ${color}44)`,
          }}
        />
      )}
      <div style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-faint)', fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-1-5)' }}>
        {label}
      </div>
      <div style={{ fontSize: isKpi ? 'var(--fs-2xl)' : 'var(--fs-xl)', fontWeight: 'var(--fw-extrabold)', letterSpacing: '-0.5px', color }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-quiet)', marginTop: 'var(--space-1)' }}>{sub}</div>}
    </div>
  )
}
