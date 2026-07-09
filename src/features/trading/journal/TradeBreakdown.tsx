import { useState, type CSSProperties } from 'react'
import type { Trade } from '../../../types'
import { Card } from '../../../components/ui/Card'
import { faNumber, faPercent } from '../../../lib/format/number'
import { groupTradeStats, scoreBand } from '../lib/tradeBreakdown'

type Dim = 'setup' | 'mistake' | 'emotion' | 'score'

const DIMS: { key: Dim; label: string; keyOf: (t: Trade) => string; empty: string }[] = [
  { key: 'setup', label: 'ست‌آپ', keyOf: (t) => t.setup, empty: 'بدون ست‌آپ' },
  { key: 'mistake', label: 'اشتباه', keyOf: (t) => t.mistake, empty: 'بدون اشتباه' },
  { key: 'emotion', label: 'احساس', keyOf: (t) => t.emotion, empty: 'بدون احساس' },
  { key: 'score', label: 'امتیاز', keyOf: (t) => scoreBand(t.score), empty: 'بدون امتیاز' },
]

const th: CSSProperties = { padding: '6px 10px', fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right' }
const td: CSSProperties = { padding: '8px 10px', color: 'var(--text)', whiteSpace: 'nowrap', textAlign: 'right' }

/** تحلیلِ تفکیکیِ ژورنال: R/نرخ برد/Expectancy به تفکیکِ ست‌آپ، اشتباه، احساس، یا بندِ امتیاز. */
export function TradeBreakdown({ trades }: { trades: Trade[] }) {
  const [dim, setDim] = useState<Dim>('setup')
  const active = DIMS.find((d) => d.key === dim) ?? DIMS[0]
  const rows = groupTradeStats(trades, active.keyOf, active.empty)

  if (trades.length === 0) return null

  return (
    <Card title="▪ تحلیلِ تفکیکی" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {DIMS.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setDim(d.key)}
            style={{
              border: '1px solid var(--border)',
              cursor: 'pointer',
              borderRadius: 8,
              padding: '5px 13px',
              fontSize: 'var(--fs-xs)',
              fontWeight: 'var(--fw-bold)',
              background: dim === d.key ? 'var(--accent-navy)' : 'var(--surface-muted)',
              color: dim === d.key ? '#fff' : 'var(--text-muted)',
            }}
          >
            به تفکیکِ {d.label}
          </button>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-xs)' }}>
          <thead>
            <tr style={{ color: 'var(--text-faint)' }}>
              <th style={th}>{active.label}</th>
              <th style={th}>تعداد</th>
              <th style={th}>نرخ برد</th>
              <th style={th}>جمع R</th>
              <th style={th}>Expectancy</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => (
              <tr key={g.key} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ ...td, fontWeight: 'var(--fw-bold)' }}>{g.key}</td>
                <td style={td}>{faNumber(g.stats.count)}</td>
                <td style={td}>{g.stats.winRate == null ? '—' : faPercent(g.stats.winRate, 0)}</td>
                <td style={{ ...td, fontWeight: 'var(--fw-bold)', color: g.stats.sumR > 0 ? 'var(--accent-green)' : g.stats.sumR < 0 ? 'var(--accent-red-strong)' : 'var(--text)' }}>
                  {g.stats.sumR > 0 ? '+' : ''}
                  {faNumber(g.stats.sumR, 2)}
                </td>
                <td style={{ ...td, color: g.stats.expectancy == null ? 'var(--text-quiet)' : g.stats.expectancy >= 0 ? 'var(--accent-green)' : 'var(--accent-red-strong)' }}>
                  {g.stats.expectancy == null ? '—' : `${g.stats.expectancy > 0 ? '+' : ''}${faNumber(g.stats.expectancy, 2)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 9, fontSize: 'var(--fs-2xs)', color: 'var(--text-quiet)', lineHeight: 1.6 }}>
        برای نتیجه‌گیریِ قابل‌اتکا، هر گروه دستِ‌کم ۲۰ تا ۳۰ معامله لازم دارد.
      </div>
    </Card>
  )
}
