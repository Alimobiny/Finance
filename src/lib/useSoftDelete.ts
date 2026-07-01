import { useUIStore } from '../store/uiStore'

/**
 * حذف «نرم»: بلافاصله آیتم را حذف می‌کند اما یک Undo Toast نشان می‌دهد که
 * تا چند ثانیه امکان بازگردانی می‌دهد. `remove` و `restore` باید اکشن‌های
 * واقعی استور را صدا بزنند (مثلاً removeGoal/restoreGoal).
 */
export function useSoftDelete() {
  const showUndoToast = useUIStore((s) => s.showUndoToast)

  return function softDelete(message: string, remove: () => void, restore: () => void) {
    remove()
    showUndoToast({ message, onUndo: restore })
  }
}
