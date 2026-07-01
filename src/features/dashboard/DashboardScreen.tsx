import { useRootStore } from '../../store/rootStore'
import { useUIStore } from '../../store/uiStore'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { EditableTextList } from '../../components/ui/EditableTextList'
import { GoalsCard } from './GoalsCard'
import { KpiCards } from './KpiCards'
import { MbtiCard } from './MbtiCard'

const REVIEWS = [
  { every: 'روزانه', dur: '۳۰ دقیقه', what: 'وضعیت، نتایج معاملات، رعایت قوانین، کالیبراسیون' },
  { every: 'هفتگی', dur: '۲ ساعت', what: 'تعادل پرتفولیو، واقعیت در برابر هدف' },
  { every: 'ماهانه', dur: 'نشست جدی', what: 'بازبینی کامل اهداف و پروفایل ریسک' },
]

export function DashboardScreen() {
  const editMode = useUIStore((s) => s.editMode)

  const ironRules = useRootStore((s) => s.dashboard.ironRules)
  const addIronRule = useRootStore((s) => s.addIronRule)
  const updateIronRule = useRootStore((s) => s.updateIronRule)
  const removeIronRule = useRootStore((s) => s.removeIronRule)
  const restoreIronRule = useRootStore((s) => s.restoreIronRule)

  const redLines = useRootStore((s) => s.dashboard.redLines)
  const addRedLine = useRootStore((s) => s.addRedLine)
  const updateRedLine = useRootStore((s) => s.updateRedLine)
  const removeRedLine = useRootStore((s) => s.removeRedLine)
  const restoreRedLine = useRootStore((s) => s.restoreRedLine)

  const goldenRule = useRootStore((s) => s.dashboard.goldenRule)
  const setGoldenRule = useRootStore((s) => s.setGoldenRule)
  const marketPulse = useRootStore((s) => s.dashboard.marketPulse)
  const setMarketPulse = useRootStore((s) => s.setMarketPulse)

  return (
    <section style={{ animation: 'fadeUp .3s ease' }}>
      <ScreenHeader eyebrow="قطب‌نمای روزانه" title="یک نگاه به کل سیستم" />

      <GoalsCard />
      <KpiCards />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 14 }}>
        <Card title={<span>▪ قوانین آهنین</span>}>
          <EditableTextList
            items={ironRules}
            editMode={editMode}
            itemNoun="قانون"
            addLabel="+ قانون"
            bulletColor="var(--accent-red)"
            onAdd={addIronRule}
            onUpdate={updateIronRule}
            onRemove={removeIronRule}
            onRestore={restoreIronRule}
          />
          <div
            style={{
              marginTop: 13,
              paddingTop: 13,
              borderTop: '1px dashed var(--border)',
              fontSize: 12.5,
              color: '#7D6608',
              background: '#FEFBF0',
              margin: '13px -18px -18px',
              padding: '13px 18px',
              borderRadius: '0 0 14px 14px',
              lineHeight: 1.6,
            }}
          >
            <b>قانون طلایی: </b>
            {editMode ? (
              <input
                value={goldenRule}
                onChange={(e) => setGoldenRule(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 6,
                  border: '1px solid #EBD9A8',
                  borderRadius: 7,
                  padding: '6px 9px',
                  fontSize: 12,
                  background: '#fff',
                  outline: 'none',
                }}
              />
            ) : (
              goldenRule
            )}
          </div>
        </Card>

        <Card title={<span>▪ خط قرمزها — بدون استثنا</span>}>
          <EditableTextList
            items={redLines}
            editMode={editMode}
            itemNoun="خط قرمز"
            addLabel="+ خط قرمز"
            bulletColor="var(--accent-red-strong)"
            onAdd={addRedLine}
            onUpdate={updateRedLine}
            onRemove={removeRedLine}
            onRestore={restoreRedLine}
          />
        </Card>

        <Card title="نبض بازار">
          <textarea
            value={marketPulse}
            onChange={(e) => setMarketPulse(e.target.value)}
            placeholder="خلاصهٔ اخبار/تحلیل هفتهٔ جاری…"
            style={{
              width: '100%',
              minHeight: 96,
              resize: 'vertical',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '11px 12px',
              fontSize: 12.5,
              lineHeight: 1.7,
              color: 'var(--text)',
              background: 'var(--surface-muted)',
              outline: 'none',
            }}
          />
        </Card>

        <Card title="ریتم بازبینی">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {REVIEWS.map((rv) => (
              <div key={rv.every} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div
                  style={{
                    width: 54,
                    flexShrink: 0,
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--accent-navy)',
                    background: '#EEF1F8',
                    borderRadius: 7,
                    padding: '6px 4px',
                  }}
                >
                  {rv.every}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.45 }}>
                  <b>{rv.dur}</b> · {rv.what}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <MbtiCard />
    </section>
  )
}
