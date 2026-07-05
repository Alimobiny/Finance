import { useRootStore } from '../../store/rootStore'
import { useUIStore } from '../../store/uiStore'
import { useSoftDelete } from '../../lib/useSoftDelete'
import { faNumber } from '../../lib/format/number'

export function GoalsCard() {
  const northStar = useRootStore((s) => s.dashboard.northStar)
  const setNorthStar = useRootStore((s) => s.setNorthStar)
  const goals = useRootStore((s) => s.dashboard.goals)
  const addGoal = useRootStore((s) => s.addGoal)
  const updateGoal = useRootStore((s) => s.updateGoal)
  const removeGoal = useRootStore((s) => s.removeGoal)
  const restoreGoal = useRootStore((s) => s.restoreGoal)
  const editMode = useUIStore((s) => s.editMode)
  const softDelete = useSoftDelete()

  return (
    <div
      style={{
        background: 'linear-gradient(135deg,var(--accent-navy),var(--accent-blue-dark))',
        borderRadius: 'var(--radius-xl)',
        padding: '22px 24px',
        color: '#EAEEF6',
        marginBottom: 16,
      }}
    >
      <div style={{ fontSize: 11.5, fontWeight: 600, color: '#9DB0D6', letterSpacing: '.5px', marginBottom: 7 }}>
        ★ ستارهٔ قطبی
      </div>

      {editMode ? (
        <input
          value={northStar}
          onChange={(e) => setNorthStar(e.target.value)}
          style={{
            width: '100%',
            fontSize: 16,
            fontWeight: 700,
            border: '1px solid #ffffff33',
            background: '#ffffff14',
            color: '#fff',
            borderRadius: 9,
            padding: '9px 12px',
            outline: 'none',
          }}
        />
      ) : (
        <div style={{ fontSize: 18.5, fontWeight: 700, lineHeight: 1.6 }}>{northStar}</div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 15 }}>
        {goals.map((g, index) => (
          <div
            key={g.id}
            style={{
              background: '#ffffff14',
              border: '1px solid #ffffff22',
              borderRadius: 9,
              padding: '8px 13px',
              fontSize: 12.5,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {editMode ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{faNumber(index + 1)}</span>
                <input
                  value={g.text}
                  onChange={(e) => updateGoal(g.id, e.target.value)}
                  style={{
                    width: 170,
                    border: '1px solid #ffffff33',
                    background: '#ffffff14',
                    color: '#fff',
                    borderRadius: 7,
                    padding: '4px 8px',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const snapshot = { ...g }
                    softDelete(`هدف «${snapshot.text}» حذف شد`, () => removeGoal(g.id), () => restoreGoal(snapshot, index))
                  }}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#E59B86', fontSize: 14, padding: 0 }}
                >
                  ×
                </button>
              </span>
            ) : (
              <span>
                {faNumber(index + 1)} · {g.text}
              </span>
            )}
          </div>
        ))}
        {editMode && (
          <button
            type="button"
            onClick={addGoal}
            style={{
              background: '#ffffff22',
              border: '1px dashed #ffffff44',
              borderRadius: 9,
              padding: '8px 14px',
              fontSize: 12.5,
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            + هدف
          </button>
        )}
      </div>
    </div>
  )
}
