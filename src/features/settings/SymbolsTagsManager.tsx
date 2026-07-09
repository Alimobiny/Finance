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

  const setups = useRootStore((s) => s.settings.setups)
  const addSetup = useRootStore((s) => s.addSetup)
  const updateSetup = useRootStore((s) => s.updateSetup)
  const removeSetup = useRootStore((s) => s.removeSetup)
  const restoreSetup = useRootStore((s) => s.restoreSetup)

  const mistakes = useRootStore((s) => s.settings.mistakes)
  const addMistake = useRootStore((s) => s.addMistake)
  const updateMistake = useRootStore((s) => s.updateMistake)
  const removeMistake = useRootStore((s) => s.removeMistake)
  const restoreMistake = useRootStore((s) => s.restoreMistake)

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
      <Card title="تگ‌های ست‌آپ">
        <div style={{ fontSize: 11.5, color: 'var(--text-quiet)', marginBottom: 11 }}>استراتژی/ست‌آپِ هر معامله؛ مبنای «تحلیلِ تفکیکی» در ژورنال.</div>
        <EditableTextList
          items={setups}
          editMode={editMode}
          itemNoun="ست‌آپ"
          addLabel="+ ست‌آپ"
          bulletColor="var(--accent-green)"
          onAdd={addSetup}
          onUpdate={updateSetup}
          onRemove={removeSetup}
          onRestore={restoreSetup}
        />
      </Card>
      <Card title="تگ‌های اشتباه">
        <div style={{ fontSize: 11.5, color: 'var(--text-quiet)', marginBottom: 11 }}>دسته‌بندیِ اشتباه‌ها تا هزینهٔ هر رفتار (R) را ببینی.</div>
        <EditableTextList
          items={mistakes}
          editMode={editMode}
          itemNoun="اشتباه"
          addLabel="+ اشتباه"
          bulletColor="var(--accent-red)"
          onAdd={addMistake}
          onUpdate={updateMistake}
          onRemove={removeMistake}
          onRestore={restoreMistake}
        />
      </Card>
    </div>
  )
}
