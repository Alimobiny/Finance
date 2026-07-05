import type { Trade } from '../../../types'
import { useRootStore } from '../../../store/rootStore'
import { useSoftDelete } from '../../../lib/useSoftDelete'
import { hasR, resolveOutcome } from '../lib/tradeOutcome'
import { accountRiskAmount } from '../lib/tradeMath'
import { faNumber } from '../../../lib/format/number'

const OUTCOME_LABEL: Record<string, string> = { win: 'برد', loss: 'باخت', be: 'سربه‌سر', '': '—' }
const OUTCOME_STYLE: Record<string, { bg: string; color: string }> = {
  win: { bg: 'var(--accent-green-soft)', color: 'var(--accent-green)' },
  loss: { bg: 'var(--accent-red-soft)', color: 'var(--accent-red-strong)' },
  be: { bg: '#F1F4F9', color: 'var(--accent-navy)' },
  '': { bg: '#F4F2EC', color: 'var(--text-quiet)' },
}

function viewShot(src: string) {
  const win = window.open()
  win?.document.write(`<img src="${src}" style="max-width:100%">`)
}

export function TradesTable({ trades }: { trades: Trade[] }) {
  const removeTrade = useRootStore((s) => s.removeTrade)
  const startEditTrade = useRootStore((s) => s.startEditTrade)
  const softDelete = useSoftDelete()
  const addTradeBack = useRootStore((s) => s.addTrade)

  // جدول فقط معاملاتِ حساب فعال را نشان می‌دهد؛ مبلغ ریسکِ همان حساب مبنای R است.
  const accounts = useRootStore((s) => s.trading.accounts)
  const activeId = useRootStore((s) => s.trading.activeAccountId)
  const riskAmount = accountRiskAmount(accounts.find((a) => a.id === activeId) ?? { balance: 0, riskPercent: 0 })
  const riskAmountLabel = riskAmount > 0 ? `$${faNumber(riskAmount, Number.isInteger(riskAmount) ? 0 : 2)}` : '—'

  if (trades.length === 0) return null

  return (
    <div className="scrl" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 760 }}>
        <thead>
          <tr style={{ background: 'var(--surface-muted)', textAlign: 'right', color: 'var(--text-faint)' }}>
            {['تاریخ', 'نماد', 'جهت', 'نتیجه', 'ریسک', 'R:R', 'نتیجهٔ R', 'چک‌لیست', 'قانون ۱', 'احساس', ''].map((h) => (
              <th key={h} style={{ padding: '11px 12px', fontWeight: 600 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => {
            const outcome = resolveOutcome(t)
            const outStyle = OUTCOME_STYLE[outcome]
            return (
              <tr key={t.id} style={{ borderTop: '1px solid #F0EDE6' }}>
                <td style={{ padding: '10px 12px', direction: 'ltr', textAlign: 'right' }}>{t.date}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{t.symbol}</td>
                <td style={{ padding: '10px 12px', color: t.dir === 'خرید' ? 'var(--accent-green)' : 'var(--accent-red-strong)', fontWeight: 600 }}>{t.dir}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '3px 9px', background: outStyle.bg, color: outStyle.color }}>{OUTCOME_LABEL[outcome]}</span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {t.riskPercent ? (
                    `${t.riskPercent}٪`
                  ) : (
                    // معاملهٔ واردشده: درصدِ هر معامله در گزارش نیست؛ مبلغ ریسکِ ثابتِ حساب (مبنای R) را نشان می‌دهیم.
                    <span style={{ direction: 'ltr', unicodeBidi: 'isolate', color: 'var(--text-muted)' }}>{riskAmountLabel}</span>
                  )}
                </td>
                <td style={{ padding: '10px 12px' }}>{t.rr || '—'}</td>
                <td style={{ padding: '10px 12px', fontWeight: 800, color: !hasR(t) ? 'var(--text-quiet)' : t.r! > 0 ? 'var(--accent-green)' : t.r! < 0 ? 'var(--accent-red-strong)' : 'var(--text)' }}>
                  {!hasR(t) ? '—' : `${t.r! > 0 ? '+' : ''}${t.r}`}
                </td>
                <td style={{ padding: '10px 12px', color: t.checklistFollowed ? 'var(--accent-green)' : 'var(--accent-red-strong)', fontWeight: 600 }}>{t.checklistFollowed ? 'بله' : 'خیر'}</td>
                <td style={{ padding: '10px 12px', color: t.rule1Followed ? 'var(--accent-green)' : 'var(--accent-red-strong)', fontWeight: 600 }}>{t.rule1Followed ? 'بله' : 'خیر'}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{t.emotion || '—'}</td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {t.shot && (
                      <div
                        onClick={() => viewShot(t.shot as string)}
                        style={{ height: 26, width: 26, borderRadius: 5, border: '1px solid var(--border)', cursor: 'pointer', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${t.shot})` }}
                      />
                    )}
                    <button type="button" onClick={() => startEditTrade(t.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-navy)', fontSize: 14, lineHeight: 1 }}>
                      ✎
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const snapshot = { ...t }
                        softDelete(`معاملهٔ «${snapshot.symbol}» حذف شد`, () => removeTrade(t.id), () => addTradeBack(snapshot))
                      }}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red-strong)', fontSize: 16, lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
