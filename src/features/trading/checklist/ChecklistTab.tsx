import { useRootStore } from '../../../store/rootStore'
import { useUIStore } from '../../../store/uiStore'
import { faNumber } from '../../../lib/format/number'

export function ChecklistTab() {
  const editMode = useUIStore((s) => s.editMode)
  const groups = useRootStore((s) => s.trading.checklistGroups)
  const checkedItems = useRootStore((s) => s.trading.checkedItems)
  const toggleChecked = useRootStore((s) => s.toggleChecked)
  const resetChecklist = useRootStore((s) => s.resetChecklist)
  const addChecklistGroup = useRootStore((s) => s.addChecklistGroup)
  const updateChecklistGroupTitle = useRootStore((s) => s.updateChecklistGroupTitle)
  const removeChecklistGroup = useRootStore((s) => s.removeChecklistGroup)
  const addChecklistItem = useRootStore((s) => s.addChecklistItem)
  const updateChecklistItemText = useRootStore((s) => s.updateChecklistItemText)
  const removeChecklistItem = useRootStore((s) => s.removeChecklistItem)

  const allItemIds = groups.flatMap((g) => g.items.map((i) => i.id))
  const checkedCount = allItemIds.filter((id) => checkedItems[id]).length
  const canEnter = allItemIds.length > 0 && allItemIds.every((id) => checkedItems[id])

  return (
    <div>
      <div
        style={{
          background: canEnter ? 'var(--accent-green-soft)' : 'var(--accent-red-soft)',
          border: `1px solid ${canEnter ? '#BFE0CD' : '#F0D8D0'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: canEnter ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {canEnter ? 'حالا می‌توانی وارد شوی' : 'هنوز وارد نشو'}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3 }}>
            {faNumber(checkedCount)} از {faNumber(allItemIds.length)} شرط برقرار است
          </div>
        </div>
        <button
          type="button"
          onClick={resetChecklist}
          style={{ border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', borderRadius: 9, padding: '8px 16px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}
        >
          شروع دوباره
        </button>
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--text-faint)', marginBottom: 14, lineHeight: 1.6 }}>
        ۳۰ ثانیه قبل از زدن هر دکمه — اگر حتی یک مورد خالی است، وارد نشو.
        {editMode && <b style={{ color: 'var(--accent-blue)' }}> حالت ویرایش روشن است: متن، گروه و موارد را ویرایش/حذف/اضافه کن.</b>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {groups.map((g) => (
          <div key={g.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 13, padding: '15px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11 }}>
              {editMode ? (
                <>
                  <input
                    value={g.title}
                    onChange={(e) => updateChecklistGroupTitle(g.id, e.target.value)}
                    style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 12.5, fontWeight: 700, color: 'var(--accent-red)', background: 'var(--surface-muted)', outline: 'none' }}
                  />
                  <button type="button" onClick={() => removeChecklistGroup(g.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red-strong)', fontSize: 15 }}>
                    ×
                  </button>
                </>
              ) : (
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent-red)', flex: 1 }}>{g.title}</div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {g.items.map((item) => {
                const on = !!checkedItems[item.id]
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {editMode ? (
                      <>
                        <input
                          value={item.text}
                          onChange={(e) => updateChecklistItemText(g.id, item.id, e.target.value)}
                          style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 9, padding: '9px 11px', fontSize: 12.5, color: 'var(--text)', background: 'var(--surface-muted)', outline: 'none' }}
                        />
                        <button type="button" onClick={() => removeChecklistItem(g.id, item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red-strong)', fontSize: 15, flexShrink: 0 }}>
                          ×
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleChecked(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 11,
                          textAlign: 'right',
                          border: `1px solid ${on ? '#BFE0CD' : '#EFEBE2'}`,
                          background: on ? '#F1F8F3' : '#fff',
                          cursor: 'pointer',
                          borderRadius: 10,
                          padding: '11px 13px',
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
                            width: 21,
                            height: 21,
                            borderRadius: 6,
                            border: `2px solid ${on ? 'var(--accent-green)' : 'var(--border-strong)'}`,
                            background: on ? 'var(--accent-green)' : 'transparent',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          {on ? '✓' : ''}
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.45 }}>{item.text}</span>
                      </button>
                    )}
                  </div>
                )
              })}
              {editMode && (
                <button
                  type="button"
                  onClick={() => addChecklistItem(g.id)}
                  style={{ alignSelf: 'flex-start', border: '1px dashed var(--border-strong)', background: 'var(--surface-muted)', cursor: 'pointer', borderRadius: 9, padding: '7px 13px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}
                >
                  + مورد جدید
                </button>
              )}
            </div>
          </div>
        ))}
        {editMode && (
          <button
            type="button"
            onClick={addChecklistGroup}
            style={{ alignSelf: 'flex-start', border: 'none', background: 'var(--accent-red)', color: '#fff', cursor: 'pointer', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700 }}
          >
            + گروه جدید
          </button>
        )}
      </div>
    </div>
  )
}
