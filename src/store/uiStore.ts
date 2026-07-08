import { create } from 'zustand'
import type { ScreenId } from '../app/router'

export interface UndoToast {
  message: string
  onUndo: () => void
}

interface UIState {
  activeScreen: ScreenId
  editMode: boolean
  /** آخرین حذفِ قابل بازگردانی (Undo Toast)، با شناسهٔ نمایشی برای تشخیص تغییر */
  undoToast: (UndoToast & { key: number }) | null

  setActiveScreen: (screen: ScreenId) => void
  toggleEditMode: () => void
  showUndoToast: (toast: UndoToast) => void
  dismissUndoToast: () => void
}

let undoToastCounter = 0

/**
 * وضعیت‌های صرفاً رابط کاربری (تب فعال، حالت ویرایش، وضعیت سینک، Undo Toast) —
 * عمداً از useRootStore جداست و هرگز در localStorage/Drive ذخیره نمی‌شود.
 */
export const useUIStore = create<UIState>((set) => ({
  activeScreen: 'dashboard',
  editMode: false,
  undoToast: null,

  setActiveScreen: (screen) => set({ activeScreen: screen }),
  toggleEditMode: () => set((s) => ({ editMode: !s.editMode })),
  showUndoToast: (toast) => set({ undoToast: { ...toast, key: ++undoToastCounter } }),
  dismissUndoToast: () => set({ undoToast: null }),
}))
