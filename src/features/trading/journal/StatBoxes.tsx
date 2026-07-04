import type { Trade } from '../../../types'
import { computeTradeStats } from '../lib/tradeStats'
import { faNumber, faPercent } from '../../../lib/format/number'
import { StatTile } from '../../../components/ui/StatTile'

// آمار ژورنال حالا از primitive مشترک StatTile استفاده می‌کند؛ کامپوننت محلیِ
// Box حذف شد (با Kpi داشبورد تقریباً یکسان بود). variant «compact» ظاهر فشردهٔ
// قبلی را نگه می‌دارد.
export function StatBoxes({ trades, calmCount, negativeCount }: { trades: Trade[]; calmCount: number; negativeCount: number }) {
  const st = computeTradeStats(trades)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(135px,1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
      <StatTile label="برد / باخت / سربه‌سر" value={`${faNumber(st.wins)} / ${faNumber(st.losses)} / ${faNumber(st.breakeven)}`} color="var(--text)" />
      <StatTile label="نرخ برد" value={st.winRate == null ? '—' : faPercent(st.winRate, 0)} color="var(--accent-navy)" sub="با R:R بالا، ۴۰٪ هم سوددهی است" />
      <StatTile
        label="جمع R"
        value={st.count === 0 ? '—' : `${st.sumR > 0 ? '+' : ''}${faNumber(st.sumR, 2)}`}
        color={st.count === 0 ? 'var(--text-quiet)' : st.sumR >= 0 ? 'var(--accent-green)' : 'var(--accent-red-strong)'}
      />
      <StatTile
        label="Expectancy"
        value={st.expectancy == null ? '—' : `${st.expectancy > 0 ? '+' : ''}${faNumber(st.expectancy, 2)}`}
        color={st.expectancy == null ? 'var(--text-quiet)' : st.expectancy >= 0 ? 'var(--accent-green)' : 'var(--accent-red-strong)'}
        sub="میانگین R هر معامله"
      />
      <StatTile
        label="نرخ رعایت قانون ۱"
        value={st.rule1Rate == null ? '—' : faPercent(st.rule1Rate, 0)}
        color={st.rule1Rate == null ? 'var(--text-quiet)' : st.rule1Rate >= 100 ? 'var(--accent-green)' : 'var(--accent-gold-dark)'}
      />
      <StatTile
        label="نرخ تکمیل چک‌لیست"
        value={st.checklistRate == null ? '—' : faPercent(st.checklistRate, 0)}
        color={st.checklistRate == null ? 'var(--text-quiet)' : st.checklistRate >= 90 ? 'var(--accent-green)' : 'var(--accent-gold-dark)'}
      />
      <StatTile label="احساس آرام" value={faNumber(calmCount)} color="var(--accent-green)" />
      <StatTile label="احساس منفی" value={faNumber(negativeCount)} color={negativeCount > 0 ? 'var(--accent-red-strong)' : 'var(--text-quiet)'} />
    </div>
  )
}
