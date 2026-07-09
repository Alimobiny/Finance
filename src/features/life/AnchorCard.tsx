import type { CSSProperties } from 'react'
import { useRootStore } from '../../store/rootStore'
import { useUIStore } from '../../store/uiStore'
import { useSoftDelete } from '../../lib/useSoftDelete'
import { WEEKDAYS_FA, jalaaliDayKey } from '../../lib/format/date'
import { faNumber } from '../../lib/format/number'
import { atRisk, currentStreak, habitGrid, isScheduledOn, weekCount } from './lib/habitStats'
import type { TimeAnchor } from '../../types'

const WEEKS = 5

const inputStyle: CSSProperties = { border: '1px solid var(--border)', borderRadius: 8, padding: '5px 9px', fontSize: 12, background: 'var(--surface-muted)', outline: 'none' }

function chip(on: boolean, color: string): CSSProperties {
  return {
    border: `1px solid ${on ? color : 'var(--border)'}`,
    background: on ? color : 'var(--surface-muted)',
    color: on ? '#fff' : 'var(--text-quiet)',
    cursor: 'pointer',
    borderRadius: 8,
    padding: '5px 11px',
    fontSize: 11.5,
    fontWeight: 600,
  }
}

export function AnchorCard({ anchor, index, dotColor }: { anchor: TimeAnchor; index: number; dotColor: string }) {
  const editMode = useUIStore((s) => s.editMode)
  const softDelete = useSoftDelete()
  const updateAnchor = useRootStore((s) => s.updateAnchor)
  const removeAnchor = useRootStore((s) => s.removeAnchor)
  const restoreAnchor = useRootStore((s) => s.restoreAnchor)
  const setAnchorSchedule = useRootStore((s) => s.setAnchorSchedule)
  const toggleAnchorWeekday = useRootStore((s) => s.toggleAnchorWeekday)
  const toggleAnchorDone = useRootStore((s) => s.toggleAnchorDone)

  const now = new Date()
  const todayKey = jalaaliDayKey(now)
  const doneToday = anchor.completions.includes(todayKey)
  const scheduledToday = isScheduledOn(anchor.schedule, now)
  const streak = currentStreak(anchor, now)
  const risk = atRisk(anchor, now)
  const grid = habitGrid(anchor, WEEKS, now)
  const target = anchor.schedule.kind === 'timesPerWeek' ? anchor.schedule.count : null
  const wc = weekCount(anchor, now)

  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${risk ? 'var(--accent-red)' : 'var(--border)'}`, borderRadius: 13, padding: 15 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        {editMode ? (
          <>
            <input value={anchor.name} onChange={(e) => updateAnchor(anchor.id, { name: e.target.value })} placeholder="نام عادت" style={{ ...inputStyle, fontSize: 13.5, fontWeight: 700, width: 150 }} />
            <input value={anchor.time} onChange={(e) => updateAnchor(anchor.id, { time: e.target.value })} placeholder="ساعت" style={{ ...inputStyle, width: 80 }} />
          </>
        ) : (
          <>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{anchor.name}</div>
            {anchor.time && (
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-gold-dark)', background: '#FBF6EC', borderRadius: 7, padding: '3px 10px' }}>{anchor.time}</div>
            )}
            {anchor.cue && <div style={{ fontSize: 11.5, color: 'var(--text-quiet)' }}>🔗 {anchor.cue}</div>}
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
        <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input value={anchor.cue} onChange={(e) => updateAnchor(anchor.id, { cue: e.target.value })} placeholder="لنگر (نشانه): بعد از [کارِ موجود]، این را انجام می‌دهم…" style={inputStyle} />
          <input value={anchor.note} onChange={(e) => updateAnchor(anchor.id, { note: e.target.value })} placeholder="توضیح (اختیاری)" style={inputStyle} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setAnchorSchedule(anchor.id, { kind: 'daily' })} style={chip(anchor.schedule.kind === 'daily', dotColor)}>هر روز</button>
            <button type="button" onClick={() => setAnchorSchedule(anchor.id, { kind: 'weekdays', weekdays: anchor.schedule.kind === 'weekdays' ? anchor.schedule.weekdays : [] })} style={chip(anchor.schedule.kind === 'weekdays', dotColor)}>روزهای هفته</button>
            <button type="button" onClick={() => setAnchorSchedule(anchor.id, { kind: 'timesPerWeek', count: anchor.schedule.kind === 'timesPerWeek' ? anchor.schedule.count : 3 })} style={chip(anchor.schedule.kind === 'timesPerWeek', dotColor)}>n بار در هفته</button>
          </div>
          {anchor.schedule.kind === 'weekdays' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {WEEKDAYS_FA.map((label, di) => (
                <button key={label} type="button" onClick={() => toggleAnchorWeekday(anchor.id, di)} style={chip(anchor.schedule.kind === 'weekdays' && anchor.schedule.weekdays.includes(di), dotColor)}>
                  {label}
                </button>
              ))}
            </div>
          )}
          {anchor.schedule.kind === 'timesPerWeek' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>تعداد در هفته:</span>
              <input
                type="number"
                min={1}
                max={7}
                value={anchor.schedule.count}
                onChange={(e) => setAnchorSchedule(anchor.id, { kind: 'timesPerWeek', count: Math.max(1, Math.min(7, Number(e.target.value) || 1)) })}
                style={{ ...inputStyle, width: 64 }}
              />
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
        {scheduledToday ? (
          <button
            type="button"
            onClick={() => toggleAnchorDone(anchor.id, todayKey)}
            style={{ border: 'none', cursor: 'pointer', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, background: doneToday ? dotColor : 'var(--surface-muted)', color: doneToday ? '#fff' : 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 7 }}
          >
            <span>{doneToday ? '✓' : '○'}</span>
            {doneToday ? 'امروز انجام شد' : 'امروز انجام بده'}
          </button>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text-quiet)' }}>امروز روزِ این عادت نیست</span>
        )}
        {streak > 0 && (
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-gold-dark)' }}>🔥 زنجیره: {faNumber(streak)} {target ? 'هفته' : 'روز'}</span>
        )}
        {target != null && <span style={{ fontSize: 11.5, color: 'var(--text-quiet)' }}>این هفته: {faNumber(wc)}/{faNumber(target)}</span>}
        {risk && <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--accent-red-strong)' }}>⚠ دو بار پشت‌سرِ‌هم جا نیفتد</span>}
      </div>

      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {grid.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', gap: 3 }}>
            {week.map((cell) => (
              <button
                key={cell.key}
                type="button"
                title={cell.key}
                disabled={cell.future}
                onClick={() => !cell.future && toggleAnchorDone(anchor.id, cell.key)}
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: 4,
                  padding: 0,
                  cursor: cell.future ? 'default' : 'pointer',
                  border: `1px solid ${cell.future ? 'transparent' : cell.done ? dotColor : 'var(--border)'}`,
                  background: cell.future ? 'transparent' : cell.done ? dotColor : cell.scheduled ? 'var(--surface-muted)' : 'var(--surface)',
                  opacity: cell.done || cell.scheduled ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
