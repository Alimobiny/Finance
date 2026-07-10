import { useState, type CSSProperties } from 'react'
import { useRootStore } from '../../store/rootStore'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { StatTile } from '../../components/ui/StatTile'
import { faNumber, faPercent } from '../../lib/format/number'
import { computeTradeStats } from '../trading/lib/tradeStats'
import { groupTradeStats } from '../trading/lib/tradeBreakdown'
import { hasR } from '../trading/lib/tradeOutcome'
import { periodFromDate, shiftAnchor, type PeriodKind } from './lib/period'
import { habitReport, tradesInPeriod } from './lib/reportData'

const KINDS: { key: PeriodKind; label: string }[] = [
  { key: 'week', label: 'هفته' },
  { key: 'month', label: 'ماه' },
  { key: 'year', label: 'سال' },
]

const th: CSSProperties = { padding: '6px 10px', fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right' }
const td: CSSProperties = { padding: '8px 10px', color: 'var(--text)', whiteSpace: 'nowrap', textAlign: 'right' }

const seg = (on: boolean): CSSProperties => ({
  border: '1px solid var(--border)',
  cursor: 'pointer',
  borderRadius: 8,
  padding: '6px 16px',
  fontSize: 'var(--fs-sm)',
  fontWeight: 'var(--fw-bold)',
  background: on ? 'var(--accent-navy)' : 'var(--surface)',
  color: on ? '#fff' : 'var(--text-muted)',
})
const navBtn: CSSProperties = {
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  cursor: 'pointer',
  borderRadius: 8,
  width: 34,
  height: 32,
  fontSize: 16,
  fontWeight: 700,
  color: 'var(--text-muted)',
}

const rColor = (v: number | null) =>
  v == null ? 'var(--text-quiet)' : v > 0 ? 'var(--accent-green)' : v < 0 ? 'var(--accent-red-strong)' : 'var(--text)'

export function ReportsScreen() {
  const [kind, setKind] = useState<PeriodKind>('month')
  const [anchor, setAnchor] = useState<Date>(() => new Date())
  const period = periodFromDate(kind, anchor)

  const allTrades = useRootStore((s) => s.trading.trades)
  const activeAccountId = useRootStore((s) => s.trading.activeAccountId)
  const anchors = useRootStore((s) => s.life.anchors)

  const trades = allTrades.filter((t) => t.accountId === activeAccountId)
  const periodTrades = tradesInPeriod(trades, period)
  const st = computeTradeStats(periodTrades)
  const rs = periodTrades.filter(hasR).map((t) => t.r)
  const bestR = rs.length ? Math.max(...rs) : null
  const worstR = rs.length ? Math.min(...rs) : null
  const setupRows = groupTradeStats(periodTrades, (t) => t.setup).slice(0, 5)
  const habitRows = habitReport(anchors, period)

  return (
    <section style={{ animation: 'fadeUp .3s ease' }}>
      <ScreenHeader
        eyebrow="گزارش"
        eyebrowColor="var(--accent-navy)"
        title="گزارشِ دوره‌ای"
        subtitle="کارنامهٔ معاملات و عادت‌ها در هفته/ماه/سالِ شمسی. فقط حسابِ معاملاتیِ فعال."
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {KINDS.map((k) => (
            <button key={k.key} type="button" onClick={() => setKind(k.key)} style={seg(kind === k.key)}>
              {k.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" onClick={() => setAnchor(shiftAnchor(kind, anchor, -1))} style={navBtn} title="دورهٔ قبل">
            ‹
          </button>
          <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)', minWidth: 160, textAlign: 'center' }}>{period.label}</span>
          <button type="button" onClick={() => setAnchor(shiftAnchor(kind, anchor, 1))} style={navBtn} title="دورهٔ بعد">
            ›
          </button>
          <button type="button" onClick={() => setAnchor(new Date())} style={{ ...navBtn, width: 'auto', padding: '0 12px', fontSize: 'var(--fs-xs)' }}>
            این دوره
          </button>
        </div>
      </div>

      <Card title="▪ معاملات" style={{ marginBottom: 16 }}>
        {periodTrades.length === 0 ? (
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-quiet)' }}>در این دوره معامله‌ای ثبت نشده.</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 'var(--space-3)' }}>
              <StatTile label="تعداد" value={faNumber(st.count)} color="var(--accent-navy)" />
              <StatTile label="نرخ برد" value={st.winRate == null ? '—' : faPercent(st.winRate, 0)} color="var(--accent-navy)" />
              <StatTile label="جمع R" value={`${st.sumR > 0 ? '+' : ''}${faNumber(st.sumR, 2)}`} color={rColor(st.sumR)} />
              <StatTile
                label="Expectancy"
                value={st.expectancy == null ? '—' : `${st.expectancy > 0 ? '+' : ''}${faNumber(st.expectancy, 2)}`}
                color={rColor(st.expectancy)}
                sub="میانگین R"
              />
              <StatTile label="بهترین R" value={bestR == null ? '—' : `+${faNumber(bestR, 2)}`} color="var(--accent-green)" />
              <StatTile label="بدترین R" value={worstR == null ? '—' : faNumber(worstR, 2)} color="var(--accent-red-strong)" />
              <StatTile label="رعایت قانون ۱" value={st.rule1Rate == null ? '—' : faPercent(st.rule1Rate, 0)} color="var(--accent-gold-dark)" />
            </div>
            {setupRows.length > 0 && (
              <div style={{ marginTop: 14, overflowX: 'auto' }}>
                <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-bold)', color: 'var(--text-faint)', marginBottom: 8 }}>به تفکیکِ ست‌آپ</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-xs)' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-faint)' }}>
                      <th style={th}>ست‌آپ</th>
                      <th style={th}>تعداد</th>
                      <th style={th}>نرخ برد</th>
                      <th style={th}>جمع R</th>
                    </tr>
                  </thead>
                  <tbody>
                    {setupRows.map((g) => (
                      <tr key={g.key} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ ...td, fontWeight: 'var(--fw-bold)' }}>{g.key}</td>
                        <td style={td}>{faNumber(g.stats.count)}</td>
                        <td style={td}>{g.stats.winRate == null ? '—' : faPercent(g.stats.winRate, 0)}</td>
                        <td style={{ ...td, color: rColor(g.stats.sumR) }}>
                          {g.stats.sumR > 0 ? '+' : ''}
                          {faNumber(g.stats.sumR, 2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Card>

      <Card title="▪ عادت‌ها">
        {habitRows.length === 0 ? (
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-quiet)' }}>هنوز عادتی تعریف نشده.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-xs)' }}>
              <thead>
                <tr style={{ color: 'var(--text-faint)' }}>
                  <th style={th}>عادت</th>
                  <th style={th}>انجام / انتظار</th>
                  <th style={th}>درصد</th>
                  <th style={th}>🔥 زنجیره</th>
                </tr>
              </thead>
              <tbody>
                {habitRows.map((h) => (
                  <tr key={h.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ ...td, fontWeight: 'var(--fw-bold)' }}>{h.name}</td>
                    <td style={td}>
                      {faNumber(h.done)} / {faNumber(h.expected)}
                    </td>
                    <td style={{ ...td, fontWeight: 'var(--fw-bold)', color: h.rate == null ? 'var(--text-quiet)' : h.rate >= 80 ? 'var(--accent-green)' : h.rate >= 50 ? 'var(--accent-gold-dark)' : 'var(--accent-red-strong)' }}>
                      {h.rate == null ? '—' : faPercent(Math.min(100, h.rate), 0)}
                    </td>
                    <td style={td}>{faNumber(h.streak)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  )
}
