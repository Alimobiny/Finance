import { create } from 'zustand'
import type { ScreenId } from '../app/router'

export type SyncStatus = 'offline' | 'local-only' | 'syncing' | 'synced' | 'error'

interface UIState {
  activeScreen: ScreenId
  editMode: boolean
  /** وضعیت همگام‌سازی Drive — تا Milestone مربوطه فقط 'local-only' باقی می‌ماند */
  syncStatus: SyncStatus

  setActiveScreen: (screen: ScreenId) => void
  toggleEditMode: () => void
  setSyncStatus: (status: SyncStatus) => void
}

/**
 * وضعیت‌های صرفاً رابط کاربری (تب فعال، حالت ویرایش، وضعیت سینک) —
 * عمداً از useRootStore جداست و هرگز در localStorage/Drive ذخیره نمی‌شود.
 */
export const useUIStore = create<UIState>((set) => ({
  activeScreen: 'dashboard',
  editMode: false,
  syncStatus: 'local-only',

  setActiveScreen: (screen) => set({ activeScreen: screen }),
  toggleEditMode: () => set((s) => ({ editMode: !s.editMode })),
  setSyncStatus: (status) => set({ syncStatus: status }),
}))
