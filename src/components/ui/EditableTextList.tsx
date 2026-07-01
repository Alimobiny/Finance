import { useSoftDelete } from '../../lib/useSoftDelete'
import type { TextListItem } from '../../types'

type Props = {
  items: TextListItem[]
  editMode: boolean
  itemNoun: string
  addLabel: string
  bulletColor?: string
  onAdd: () => void
  onUpdate: (id: string, text: string) => void
  onRemove: (id: string) => void
  onRestore: (item: TextListItem, index: number) => void
}

export function EditableTextList({
  items,
  editMode,
  itemNoun,
  addLabel,
  bulletColor = 'var(--accent-red)',
  onAdd,
  onUpdate,
  onRemove,
  onRestore,
}: Props) {
  const softDelete = useSoftDelete()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {items.map((item, index) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, lineHeight: 1.5 }}>
          <span style={{ color: bulletColor, fontWeight: 700, marginTop: 1 }}>▪</span>
          {editMode ? (
            <>
              <input
                value={item.text}
                onChange={(e) => onUpdate(item.id, e.target.value)}
                style={{
                  flex: 1,
                  border: '1px solid var(--border)',
                  borderRadius: 7,
                  padding: '5px 9px',
                  fontSize: 12.5,
                  background: 'var(--surface-muted)',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const snapshot = { ...item }
                  softDelete(`«${snapshot.text}» حذف شد`, () => onRemove(item.id), () => onRestore(snapshot, index))
                }}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red-strong)', fontSize: 14 }}
              >
                ×
              </button>
            </>
          ) : (
            <span style={{ color: 'var(--text)' }}>{item.text}</span>
          )}
        </div>
      ))}
      {editMode && (
        <button
          type="button"
          onClick={onAdd}
          style={{
            alignSelf: 'flex-start',
            border: '1px dashed var(--border-strong)',
            background: 'var(--surface-muted)',
            cursor: 'pointer',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 11.5,
            fontWeight: 600,
            color: 'var(--text-muted)',
          }}
        >
          {addLabel}
        </button>
      )}
      {items.length === 0 && !editMode && <div style={{ fontSize: 12, color: 'var(--text-quiet)' }}>هنوز {itemNoun}ای ثبت نشده.</div>}
    </div>
  )
}
