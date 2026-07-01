import { useRootStore } from '../../store/rootStore'
import { useUIStore } from '../../store/uiStore'
import { useSoftDelete } from '../../lib/useSoftDelete'
import { WEEKDAYS_FA } from '../../lib/format/date'
import type { TimeAnchor } from '../../types'

export function AnchorCard({ anchor, index, dotColor }: { anchor: TimeAnchor; index: number; dotColor: string }) {
  const editMode = useUIStore((s) => s.editMode)
  const softDelete = useSoftDelete()
  const updateAnchor = useRootStore((s) => s.updateAnchor)
  const removeAnchor = useRootStore((s) => s.removeAnchor)
  const restoreAnchor = useRootStore((s) => s.restoreAnchor)
  const toggleAnchorWeekday = useRootStore((s) => s.toggleAnchorWeekday)
  const toggleAnchorDone = useRootStore((s) => s.toggleAnchorDone)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 13, padding: 15 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 11 }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        {editMode ? (
          <>
            <input
              value={anchor.name}
              onChange={(e) => updateAnchor(anchor.id, { name: e.target.value })}
              placeholder="نام لنگر"
              style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '5px 9px', fontSize: 13.5, fontWeight: 700, background: 'var(--surface-muted)', outline: 'none', width: 150 }}
            />
            <input
              value={anchor.time}
              onChange={(e) => updateAnchor(anchor.id, { time: e.target.value })}
              placeholder="ساعت"
              style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '5px 9px', fontSize: 11.5, background: 'var(--surface-muted)', outline: 'none', width: 80 }}
            />
            <input
              value={anchor.note}
              onChange={(e) => updateAnchor(anchor.id, { note: e.target.value })}
              placeholder="توضیح"
              style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '5px 9px', fontSize: 11.5, background: 'var(--surface-muted)', outline: 'none', flex: 1, minWidth: 120 }}
            />
          </>
        ) : (
          <>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{anchor.name}</div>
            {anchor.time && (
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-gold-dark)', background: '#FBF6EC', borderRadius: 7, padding: '3px 10px' }}>
                {anchor.time}
              </div>
            )}
            <div style={{ fontSize: 11.5, color: 'var(--text-quiet)' }}>{anchor.note}</div>
          </>
        )}
        <div style={{ flex: 1 }} />
        {editMode && (
          <button
            type="button"
            onClick={() => {
              const snapshot = { ...anchor }
              softDelete(`«${snapshot.name}» حذف شد`, () => removeAnchor(anchor.id), () => restoreAnchor(snapshot, index))
            }}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red-strong)', fontSize: 15 }}
          >
            ×
          </button>
        )}
      </div>

      {editMode && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--text-quiet)', marginBottom: 6 }}>روزهای فعال را انتخاب کن:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {WEEKDAYS_FA.map((label, di) => {
              const on = anchor.activeWeekdays.includes(di)
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleAnchorWeekday(anchor.id, di)}
                  style={{
                    border: `1px solid ${on ? dotColor : 'var(--border)'}`,
                    background: on ? dotColor : 'var(--surface-muted)',
                    color: on ? '#fff' : 'var(--text-quiet)',
                    cursor: 'pointer',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 11.5,
                    fontWeight: 600,
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {anchor.activeWeekdays.map((di) => {
          const done = anchor.doneWeekdays.includes(di)
          return (
            <button
              key={di}
              type="button"
              onClick={() => toggleAnchorDone(anchor.id, di)}
              style={{
                border: `1px solid ${done ? dotColor : 'var(--border)'}`,
                background: done ? dotColor : 'var(--surface)',
                color: done ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                borderRadius: 9,
                padding: '8px 15px',
                fontSize: 12.5,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <span style={{ fontSize: 13 }}>{done ? '✓' : ''}</span>
              {WEEKDAYS_FA[di]}
            </button>
          )
        })}
        {anchor.activeWeekdays.length === 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-quiet)', padding: '8px 0' }}>هنوز روزی تعیین نشده — در حالت ویرایش روزها را انتخاب کن.</span>
        )}
      </div>
    </div>
  )
}
