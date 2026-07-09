import { useRootStore } from '../../store/rootStore'
import { useUIStore } from '../../store/uiStore'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { EditableTextList } from '../../components/ui/EditableTextList'
import { AnchorCard } from './AnchorCard'
import { TasksNotesCard } from './TasksNotesCard'
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

  const executionRules = useRootStore((s) => s.life.executionRules)
  const addExecutionRule = useRootStore((s) => s.addExecutionRule)
  const updateExecutionRule = useRootStore((s) => s.updateExecutionRule)
  const removeExecutionRule = useRootStore((s) => s.removeExecutionRule)
  const restoreExecutionRule = useRootStore((s) => s.restoreExecutionRule)

  return (
    <section style={{ animation: 'fadeUp .3s ease' }}>
      <ScreenHeader
        eyebrow="برنامهٔ من — لنگرها و عادت‌ها"
        eyebrowColor="var(--accent-gold-dark)"
        title="ردیاب عادت"
        subtitle="عادت‌ها را با یک «لنگر» (بعد از کاری که همیشه انجام می‌دهی) بساز. زنجیره، درصد و هیت‌مپ خودکار حساب می‌شوند."
      />

      <div style={{ fontSize: 12.5, color: 'var(--text-faint)', marginBottom: 14 }}>
        روی «امروز انجام بده» بزن یا خانه‌های هیت‌مپ را کلیک کن؛ زنجیره و پیشرفت خودکار به‌روز می‌شوند.
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

        <TasksNotesCard />
      </div>
    </section>
  )
}
