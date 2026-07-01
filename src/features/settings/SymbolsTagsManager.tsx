import { useRootStore } from '../../store/rootStore'
import { useUIStore } from '../../store/uiStore'
import { Card } from '../../components/ui/Card'
import { EditableTextList } from '../../components/ui/EditableTextList'

export function SymbolsTagsManager() {
  const editMode = useUIStore((s) => s.editMode)
  const symbols = useRootStore((s) => s.settings.symbols)
  const addSymbol = useRootStore((s) => s.addSymbol)
  const updateSymbol = useRootStore((s) => s.updateSymbol)
  const removeSymbol = useRootStore((s) => s.removeSymbol)
  const restoreSymbol = useRootStore((s) => s.restoreSymbol)

  const emotions = useRootStore((s) => s.settings.emotions)
  const addEmotion = useRootStore((s) => s.addEmotion)
  const updateEmotion = useRootStore((s) => s.updateEmotion)
  const removeEmotion = useRootStore((s) => s.removeEmotion)
  const restoreEmotion = useRootStore((s) => s.restoreEmotion)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 14 }}>
      <Card title="نمادهای معاملاتی">
        <div style={{ fontSize: 11.5, color: 'var(--text-quiet)', marginBottom: 11 }}>در فرم ثبت معامله به‌عنوان پیشنهاد نمایش داده می‌شوند.</div>
        <EditableTextList
          items={symbols}
          editMode={editMode}
          itemNoun="نماد"
          addLabel="+ نماد"
          bulletColor="var(--accent-navy)"
          onAdd={addSymbol}
          onUpdate={updateSymbol}
          onRemove={removeSymbol}
          onRestore={restoreSymbol}
        />
      </Card>
      <Card title="حالت‌های احساسی">
        <div style={{ fontSize: 11.5, color: 'var(--text-quiet)', marginBottom: 11 }}>برای ثبت حال روانی هنگام هر معامله در ژورنال.</div>
        <EditableTextList
          items={emotions}
          editMode={editMode}
          itemNoun="احساس"
          addLabel="+ احساس"
          bulletColor="var(--accent-purple)"
          onAdd={addEmotion}
          onUpdate={updateEmotion}
          onRemove={removeEmotion}
          onRestore={restoreEmotion}
        />
      </Card>
    </div>
  )
}
