import { useRootStore } from '../../store/rootStore'
import { computeTradeStats } from '../trading/lib/tradeStats'
import { faNumber, faPercent } from '../../lib/format/number'
import { StatTile } from '../../components/ui/StatTile'

// کاشی‌های KPI حالا از primitive مشترک StatTile استفاده می‌کنند؛ کامپوننت
// محلیِ Kpi حذف شد چون با Box در ژورنال تقریباً یکسان بود (رفع تکرار).
export function KpiCards() {
  const trades = useRootStore((s) => s.trading.trades)
  const stats = computeTradeStats(trades)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(165px,1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
      <StatTile size="kpi" accentBar label="تعداد معاملات ثبت‌شده" value={faNumber(stats.count)} sub="هدف: جمع ۵۰ تا ۱۰۰" color="var(--accent-navy)" />
      <StatTile
        size="kpi"
        accentBar
        label="Expectancy (معیار اصلی)"
        value={stats.expectancy == null ? '—' : faNumber(stats.expectancy, 2)}
        sub="مثبت = سیستم سوددهی"
        color={stats.expectancy == null ? 'var(--text-quiet)' : stats.expectancy >= 0 ? 'var(--accent-green)' : 'var(--accent-red-strong)'}
      />
      <StatTile
        size="kpi"
        accentBar
        label="نرخ رعایت قانون ۱"
        value={stats.rule1Rate == null ? '—' : faPercent(stats.rule1Rate, 0)}
        sub="هدف ۱۰۰٪"
        color={stats.rule1Rate == null ? 'var(--text-quiet)' : stats.rule1Rate >= 100 ? 'var(--accent-green)' : 'var(--accent-gold-dark)'}
      />
    </div>
  )
}
