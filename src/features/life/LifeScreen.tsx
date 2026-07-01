import { useRootStore } from '../../store/rootStore'
import { useUIStore } from '../../store/uiStore'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { EditableTextList } from '../../components/ui/EditableTextList'
import { NumberField } from '../../components/ui/NumberField'
import { AnchorCard } from './AnchorCard'
import { jalaaliWeekKey } from '../../lib/format/date'
import { faMoney, faNumber } from '../../lib/format/number'
import { totalRemainingDebt } from '../money/lib/moneyCalcs'
import type { DayPeriod } from '../../types'

const PERIODS: { key: DayPeriod; label: string; color: string; icon: string }[] = [
  { key: 'صبح', label: 'صبح', color: '#9A6B1E', icon: '☀' },
  { key: 'عصر', label: 'عصر', color: '#2C7A6B', icon: '⛅' },
  { key: 'شب', label: 'شب', color: '#5B6BA8', icon: '☾' },
]

export function LifeScreen() {
  const editMode = useUIStore((s) => s.editMode)
  const anchors = useRootStore((s) => s.life.anchors)
  const addAnchor = useRootStore((s) => s.addAnchor)
  const resetWeek = useRootStore((s) => s.resetWeek)

  const executionRules = useRootStore((s) => s.life.executionRules)
  const addExecutionRule = useRootStore((s) => s.addExecutionRule)
  const updateExecutionRule = useRootStore((s) => s.updateExecutionRule)
  const removeExecutionRule = useRootStore((s) => s.removeExecutionRule)
  const restoreExecutionRule = useRootStore((s) => s.restoreExecutionRule)

  const debts = useRootStore((s) => s.money.debts)
  const debtMonthlyCommitment = useRootStore((s) => s.money.debtMonthlyCommitment)
  const setDebtMonthlyCommitment = useRootStore((s) => s.setDebtMonthlyCommitment)

  const remainingDebt = totalRemainingDebt(debts)
  const freedomMonths = debtMonthlyCommitment > 0 && remainingDebt > 0 ? Math.ceil(remainingDebt / debtMonthlyCommitment) : null

  return (
    <section style={{ animation: 'fadeUp .3s ease' }}>
      <ScreenHeader
        eyebrow="برنامهٔ من — لنگرها و سیستم"
        eyebrowColor="var(--accent-gold-dark)"
        title="لنگرهای ثابت هفته"
        subtitle="عادت‌های ثابت هفتگی که هویت مدنظرت را می‌سازند — با ذهنی آرام و بدون فشار."
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>روی هر روز بزن تا انجام‌شده ثبت شود.</div>
        <button
          type="button"
          onClick={() => resetWeek(jalaaliWeekKey(new Date()))}
          style={{ border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', borderRadius: 9, padding: '8px 16px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}
        >
          شروع هفتهٔ جدید
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 18 }}>
        {PERIODS.map((p) => {
          const periodAnchors = anchors.filter((a) => a.period === p.key)
          return (
            <div key={p.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11 }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, background: p.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  {p.icon}
                </span>
                <div style={{ fontSize: 15, fontWeight: 800, color: p.color }}>{p.label}</div>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                {editMode && (
                  <button
                    type="button"
                    onClick={() => addAnchor(p.key)}
                    style={{ border: '1px dashed var(--border-strong)', background: 'var(--surface-muted)', cursor: 'pointer', borderRadius: 8, padding: '6px 12px', fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)' }}
                  >
                    + لنگر در {p.label}
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {periodAnchors.map((a) => (
                  <AnchorCard key={a.id} anchor={a} index={anchors.indexOf(a)} dotColor={p.color} />
                ))}
                {periodAnchors.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-quiet)', padding: '4px 2px' }}>لنگری در این بخش نیست.</div>}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
        <Card
          title="قوانین اجرا"
          action={
            editMode ? (
              <button type="button" onClick={addExecutionRule} style={{ border: '1px dashed var(--border-strong)', background: 'var(--surface-muted)', cursor: 'pointer', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                + قانون
              </button>
            ) : undefined
          }
        >
          <EditableTextList
            items={executionRules}
            editMode={editMode}
            itemNoun="قانون"
            addLabel="+ قانون"
            bulletColor="var(--accent-gold-dark)"
            onAdd={addExecutionRule}
            onUpdate={updateExecutionRule}
            onRemove={removeExecutionRule}
            onRestore={restoreExecutionRule}
          />
        </Card>

        <div style={{ background: '#FBF6EC', border: '1px solid #EDDFC2', borderRadius: 'var(--radius-lg)', padding: 18 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 6, color: 'var(--accent-gold-dark)' }}>مسیر آزادی از بدهی</div>
          <div style={{ fontSize: 11.5, color: '#A38A5A', marginBottom: 14, lineHeight: 1.5 }}>ابر مبهم را به یک عدد و یک تاریخ تبدیل می‌کند.</div>
          {editMode && (
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14 }}>
              مبلغ ماهانه برای بدهی (ت)
              <NumberField value={debtMonthlyCommitment} onChange={setDebtMonthlyCommitment} style={{ width: 140 }} />
            </label>
          )}
          <div style={{ display: 'flex', gap: 11 }}>
            <div style={{ flex: 1, background: '#fff', borderRadius: 11, padding: 13, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>مانده بدهی</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-red-strong)', marginTop: 3 }}>{faMoney(remainingDebt)}</div>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: 11, padding: 13, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>تا آزادی</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent-gold-dark)', marginTop: 3 }}>
                {freedomMonths == null ? '—' : `${faNumber(freedomMonths)} ماه`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
