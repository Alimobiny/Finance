import { useRootStore } from '../../store/rootStore'
import { computeTradeStats } from '../trading/lib/tradeStats'
import { portfolioTotal } from '../portfolio/lib/computeHoldingValue'
import { faMoney, faNumber, faPercent } from '../../lib/format/number'

function Kpi({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 13, padding: '15px 16px' }}>
      <div style={{ fontSize: 11.5, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.5px', color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-quiet)', marginTop: 3 }}>{sub}</div>
    </div>
  )
}

export function KpiCards() {
  const trades = useRootStore((s) => s.trading.trades)
  const portfolio = useRootStore((s) => s.portfolio)
  const stats = computeTradeStats(trades)
  const total = portfolioTotal(portfolio)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(165px,1fr))', gap: 12, marginBottom: 16 }}>
      <Kpi label="تعداد معاملات ثبت‌شده" value={faNumber(stats.count)} sub="هدف: جمع ۵۰ تا ۱۰۰" color="var(--accent-navy)" />
      <Kpi
        label="Expectancy (معیار اصلی)"
        value={stats.expectancy == null ? '—' : faNumber(stats.expectancy, 2)}
        sub="مثبت = سیستم سوددهی"
        color={stats.expectancy == null ? 'var(--text-quiet)' : stats.expectancy >= 0 ? 'var(--accent-green)' : 'var(--accent-red-strong)'}
      />
      <Kpi
        label="نرخ رعایت قانون ۱"
        value={stats.rule1Rate == null ? '—' : faPercent(stats.rule1Rate, 0)}
        sub="هدف ۱۰۰٪"
        color={stats.rule1Rate == null ? 'var(--text-quiet)' : stats.rule1Rate >= 100 ? 'var(--accent-green)' : 'var(--accent-gold-dark)'}
      />
      <Kpi label="پرتفولیو" value={total === 0 ? '—' : faMoney(total)} sub="هدف ۶۰٪ دفاعی" color="var(--accent-green)" />
    </div>
  )
}
