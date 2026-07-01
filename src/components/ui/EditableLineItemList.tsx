import { useSoftDelete } from '../../lib/useSoftDelete'
import { NumberField } from './NumberField'
import type { LineItem } from '../../types'

type Props = {
  items: LineItem[]
  editMode: boolean
  addLabel: string
  onAdd: () => void
  onUpdate: (id: string, patch: { label?: string; value?: number }) => void
  onRemove: (id: string) => void
  onRestore: (item: LineItem, index: number) => void
}

export function EditableLineItemList({ items, editMode, addLabel, onAdd, onUpdate, onRemove, onRestore }: Props) {
  const softDelete = useSoftDelete()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {items.map((item, index) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 12.5, color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {editMode ? (
              <input
                value={item.label}
                onChange={(e) => onUpdate(item.id, { label: e.target.value })}
                style={{ width: 150, border: '1px solid var(--border)', borderRadius: 8, padding: '5px 8px', fontSize: 12, background: 'var(--surface-muted)', outline: 'none' }}
              />
            ) : (
              <span>{item.label}</span>
            )}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <NumberField value={item.value} onChange={(value) => onUpdate(item.id, { value })} style={{ width: 135 }} />
            {editMode && (
              <button
                type="button"
                onClick={() => {
                  const snapshot = { ...item }
                  softDelete(`«${snapshot.label}» حذف شد`, () => onRemove(item.id), () => onRestore(snapshot, index))
                }}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red-strong)', fontSize: 15 }}
              >
                ×
              </button>
            )}
          </span>
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
            borderRadius: 9,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-muted)',
          }}
        >
          {addLabel}
        </button>
      )}
    </div>
  )
}
