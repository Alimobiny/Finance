import { useRootStore } from '../../store/rootStore'
import { useSoftDelete } from '../../lib/useSoftDelete'
import { Card } from '../../components/ui/Card'

/** بخش «کارها و نوت‌ها» — جایگزین «مسیر آزادی از بدهی». کارهای قابل‌تیک + یادداشت آزاد. */
export function TasksNotesCard() {
  const tasks = useRootStore((s) => s.life.tasks)
  const notes = useRootStore((s) => s.life.notes)
  const addTask = useRootStore((s) => s.addTask)
  const updateTaskText = useRootStore((s) => s.updateTaskText)
  const toggleTask = useRootStore((s) => s.toggleTask)
  const removeTask = useRootStore((s) => s.removeTask)
  const restoreTask = useRootStore((s) => s.restoreTask)
  const setNotes = useRootStore((s) => s.setNotes)
  const softDelete = useSoftDelete()

  const doneCount = tasks.filter((t) => t.done).length

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}>
          <span>▪ کارها و نوت‌ها</span>
          {tasks.length > 0 && (
            <span style={{ fontSize: 11, color: 'var(--text-quiet)', fontWeight: 500 }}>
              {toFa(doneCount)}/{toFa(tasks.length)} انجام‌شده
            </span>
          )}
        </div>
      }
      action={
        <button
          type="button"
          onClick={addTask}
          style={{ border: '1px dashed var(--border-strong)', background: 'var(--surface-muted)', cursor: 'pointer', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}
        >
          + کار
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map((t, index) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <button
              type="button"
              onClick={() => toggleTask(t.id)}
              title={t.done ? 'انجام‌شده' : 'در انتظار'}
              style={{
                flexShrink: 0,
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: t.done ? 'none' : '2px solid var(--border-strong)',
                background: t.done ? 'var(--accent-green)' : 'transparent',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 12,
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {t.done ? '✓' : ''}
            </button>
            <input
              value={t.text}
              onChange={(e) => updateTaskText(t.id, e.target.value)}
              placeholder="کار جدید…"
              style={{
                flex: 1,
                border: '1px solid var(--border)',
                borderRadius: 7,
                padding: '6px 9px',
                fontSize: 12.5,
                background: 'var(--surface-muted)',
                outline: 'none',
                color: t.done ? 'var(--text-quiet)' : 'var(--text)',
                textDecoration: t.done ? 'line-through' : 'none',
              }}
            />
            <button
              type="button"
              onClick={() => {
                const snapshot = { ...t }
                softDelete(`کار «${snapshot.text || 'بدون عنوان'}» حذف شد`, () => removeTask(t.id), () => restoreTask(snapshot, index))
              }}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red-strong)', fontSize: 15 }}
            >
              ×
            </button>
          </div>
        ))}
        {tasks.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-quiet)', padding: '2px 2px 4px' }}>هنوز کاری اضافه نشده. با «+ کار» شروع کن.</div>}
      </div>

      <div style={{ marginTop: 14, paddingTop: 13, borderTop: '1px dashed var(--border)' }}>
        <div style={{ fontSize: 11.5, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 7 }}>یادداشت</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="هر چیزی که می‌خواهی به خاطر بسپاری…"
          style={{
            width: '100%',
            minHeight: 90,
            resize: 'vertical',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 12.5,
            lineHeight: 1.7,
            color: 'var(--text)',
            background: 'var(--surface-muted)',
            outline: 'none',
          }}
        />
      </div>
    </Card>
  )
}

function toFa(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
}
