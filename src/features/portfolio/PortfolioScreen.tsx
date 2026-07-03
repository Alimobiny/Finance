import { useRootStore } from '../../store/rootStore'
import { useUIStore } from '../../store/uiStore'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { EditableTextList } from '../../components/ui/EditableTextList'
import { HoldingRow } from './HoldingRow'
import { PricePanel } from './PricePanel'
import { AssetDonut } from '../../components/ui/AssetDonut'
import { faMoney, faPercent } from '../../lib/format/number'
import { holdingValue, portfolioTotal } from './lib/computeHoldingValue'
import { biggestDeviationLabel, defensivePercent, rebalanceSuggestions, targetSum } from './lib/portfolioAnalytics'

export function PortfolioScreen() {
  const editMode = useUIStore((s) => s.editMode)
  const portfolio = useRootStore((s) => s.portfolio)
  const addHolding = useRootStore((s) => s.addHolding)

  const rebalanceNotes = useRootStore((s) => s.portfolio.rebalanceNotes)
  const addRebalanceNote = useRootStore((s) => s.addRebalanceNote)
  const updateRebalanceNote = useRootStore((s) => s.updateRebalanceNote)
  const removeRebalanceNote = useRootStore((s) => s.removeRebalanceNote)
  const restoreRebalanceNote = useRootStore((s) => s.restoreRebalanceNote)

  const total = portfolioTotal(portfolio)
  const defPct = defensivePercent(portfolio)
  const suggestions = rebalanceSuggestions(portfolio)
  const tgtSum = targetSum(portfolio)

  return (
    <section style={{ animation: 'fadeUp .3s ease' }}>
      <ScreenHeader
        eyebrow="ساختار پرتفولیو"
        eyebrowColor="var(--accent-green)"
        title="تخصیص دارایی — هدف در برابر واقعیت"
        subtitle={
          <>
            ارزش واقعی هر دارایی را وارد کن. درصد انحراف از هدف و پیشنهاد تعادل خودکار محاسبه می‌شود.{' '}
            <b style={{ color: 'var(--accent-green)' }}>اصل تعادل:</b> اول با «افزودن به کم‌وزن‌ها»، نه فروش پرشده‌ها.
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 16 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 13, padding: '15px 16px' }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 6 }}>جمع پرتفولیو</div>
          <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--accent-green)' }}>{total === 0 ? '—' : faMoney(total)}</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 13, padding: '15px 16px' }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 6 }}>لایهٔ دفاعی (هدف ۶۰٪)</div>
          <div style={{ fontSize: 21, fontWeight: 800, color: Math.abs(defPct - 60) > 5 ? '#B5572F' : 'var(--accent-green)' }}>
            {total === 0 ? '—' : faPercent(defPct)}
          </div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 13, padding: '15px 16px' }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 6 }}>بزرگ‌ترین انحراف</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{biggestDeviationLabel(portfolio)}</div>
        </div>
      </div>

      {total > 0 && (
        <div style={{ height: 15, borderRadius: 10, overflow: 'hidden', display: 'flex', border: '1px solid var(--border)', background: 'var(--surface)', marginBottom: 16 }}>
          {portfolio.holdings.map((h) => (
            <div key={h.id} title={h.name} style={{ width: `${(holdingValue(h, portfolio.prices) / total) * 100}%`, background: h.color }} />
          ))}
        </div>
      )}

      {total > 0 && (
        <Card title="▪ ترکیب کل دارایی‌ها" style={{ marginBottom: 16 }}>
          <AssetDonut
            slices={portfolio.holdings.map((h) => ({ label: h.name, value: holdingValue(h, portfolio.prices), color: h.color }))}
          />
        </Card>
      )}

      <PricePanel />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 11 }}>
        <div style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>روی هر دارایی بزن تا زیرمجموعه‌هایش باز شود.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: Math.abs(tgtSum - 100) > 0.5 ? '#B5572F' : 'var(--accent-green)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 11px' }}>
            جمع هدف‌ها: {faPercent(tgtSum, 0)}
          </span>
          {editMode && (
            <button type="button" onClick={addHolding} style={{ border: 'none', background: 'var(--accent-green)', color: '#fff', cursor: 'pointer', borderRadius: 9, padding: '7px 14px', fontSize: 12.5, fontWeight: 700 }}>
              + دارایی جدید
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {portfolio.holdings.map((h, i) => (
          <HoldingRow key={h.id} holding={h} index={i} portfolio={portfolio} />
        ))}
        {portfolio.holdings.length === 0 && (
          <div style={{ background: 'var(--surface)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '28px 20px', textAlign: 'center', color: 'var(--text-quiet)', fontSize: 13 }}>
            هنوز دارایی‌ای ثبت نشده. {editMode ? 'دکمهٔ «+ دارایی جدید» را بزن.' : 'برای شروع، حالت ویرایش را فعال کن.'}
          </div>
        )}
      </div>

      <Card title="▪ پیشنهاد تعادل" style={{ marginTop: 18 }}>
        <EditableTextList
          items={rebalanceNotes}
          editMode={editMode}
          itemNoun="یادداشت تعادل"
          addLabel="+ یادداشت"
          bulletColor="var(--accent-green)"
          onAdd={addRebalanceNote}
          onUpdate={updateRebalanceNote}
          onRemove={removeRebalanceNote}
          onRestore={restoreRebalanceNote}
        />
        {!editMode && rebalanceNotes.length === 0 && (
          <div style={{ fontSize: 12.5, color: 'var(--text-quiet)', lineHeight: 1.6 }}>
            یادداشتی ثبت نشده. برای افزودن، حالت ویرایش را روشن کن. پیشنهاد خودکار سیستم را هم می‌توانی پایین ببینی.
          </div>
        )}
        {suggestions.length > 0 && (
          <details style={{ marginTop: rebalanceNotes.length > 0 || editMode ? 13 : 8, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
            <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--accent-navy)', listStyle: 'none' }}>
              ⚙ پیشنهاد خودکار سیستم (بر اساس انحراف فعلی) — {suggestions.length} مورد
            </summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {suggestions.map((s) => (
                <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--text-quiet)', fontWeight: 700 }}>▹</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </Card>

      <div style={{ marginTop: 14, background: 'var(--accent-red-soft)', border: '1px solid #F0D8D0', borderRadius: 'var(--radius-lg)', padding: '16px 18px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-red)', marginBottom: 6 }}>هشدار تمرکز صادقانه</div>
        <div style={{ fontSize: 12.5, color: '#6E3030', lineHeight: 1.7 }}>
          ۶۰٪ دفاعی (طلا + دلار) یک «تنوع واقعی» نیست — یک شرط کلان واحد است: ضعف ریال. اگر ریال تقویت شود، هر دو با هم افت
          می‌کنند. این را آگاهانه پذیرفته‌ای.
        </div>
      </div>
    </section>
  )
}
