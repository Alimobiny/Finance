import type { Trade } from '../../../types'
import { computeTradeStats } from '../lib/tradeStats'
import { faNumber, faPercent } from '../../../lib/format/number'

function Box({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '13px 14px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.4px', color }}>{value}</div>
      {sub && <div style={{ fontSize: 10.5, color: 'var(--text-quiet)', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

export function StatBoxes({ trades, calmCount, negativeCount }: { trades: Trade[]; calmCount: number; negativeCount: number }) {
  const st = computeTradeStats(trades)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(135px,1fr))', gap: 11, marginBottom: 16 }}>
      <Box label="برد / باخت / سربه‌سر" value={`${faNumber(st.wins)} / ${faNumber(st.losses)} / ${faNumber(st.breakeven)}`} color="var(--text)" />
      <Box label="نرخ برد" value={st.winRate == null ? '—' : faPercent(st.winRate, 0)} color="var(--accent-navy)" sub="با R:R بالا، ۴۰٪ هم سوددهی است" />
      <Box
        label="جمع R"
        value={st.count === 0 ? '—' : `${st.sumR > 0 ? '+' : ''}${faNumber(st.sumR, 2)}`}
        color={st.count === 0 ? 'var(--text-quiet)' : st.sumR >= 0 ? 'var(--accent-green)' : 'var(--accent-red-strong)'}
      />
      <Box
        label="Expectancy"
        value={st.expectancy == null ? '—' : `${st.expectancy > 0 ? '+' : ''}${faNumber(st.expectancy, 2)}`}
        color={st.expectancy == null ? 'var(--text-quiet)' : st.expectancy >= 0 ? 'var(--accent-green)' : 'var(--accent-red-strong)'}
        sub="میانگین R هر معامله"
      />
      <Box
        label="نرخ رعایت قانون ۱"
        value={st.rule1Rate == null ? '—' : faPercent(st.rule1Rate, 0)}
        color={st.rule1Rate == null ? 'var(--text-quiet)' : st.rule1Rate >= 100 ? 'var(--accent-green)' : 'var(--accent-gold-dark)'}
      />
      <Box
        label="نرخ تکمیل چک‌لیست"
        value={st.checklistRate == null ? '—' : faPercent(st.checklistRate, 0)}
        color={st.checklistRate == null ? 'var(--text-quiet)' : st.checklistRate >= 90 ? 'var(--accent-green)' : 'var(--accent-gold-dark)'}
      />
      <Box label="احساس آرام" value={faNumber(calmCount)} color="var(--accent-green)" />
      <Box label="احساس منفی" value={faNumber(negativeCount)} color={negativeCount > 0 ? 'var(--accent-red-strong)' : 'var(--text-quiet)'} />
    </div>
  )
}
