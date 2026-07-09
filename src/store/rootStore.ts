import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createDashboardSlice } from './slices/dashboardSlice'
import { createTradingSlice } from './slices/tradingSlice'
import { createLifeSlice } from './slices/lifeSlice'
import { createSettingsSlice } from './slices/settingsSlice'
import { createHistorySlice } from './slices/historySlice'
import type { RootStore } from './rootStoreType'
import { createDefaultState } from './defaultState'
import { loadPersistedState } from './persistence'
import { normalizeState } from './normalize'
import type { RootState } from '../types'

const persisted = loadPersistedState()
const initialState = persisted ? normalizeState(persisted) : createDefaultState()

/** استور اصلیِ داده‌ای اپ — دقیقاً معادل چیزی که در localStorage و Google Drive ذخیره می‌شود */
export const useRootStore = create<RootStore>()(
  immer((...a) => ({
    ...createDashboardSlice(initialState.dashboard)(...a),
    ...createTradingSlice(initialState.trading)(...a),
    ...createLifeSlice(initialState.life)(...a),
    ...createSettingsSlice(initialState.settings)(...a),
    ...createHistorySlice(initialState.history)(...a),
  })),
)

/** جایگزینیِ کامل داده‌های استور با نسخه‌ای که از Google Drive بازیابی یا از فایل پشتیبان بارگذاری شده */
export function applyRemoteState(state: RootState): void {
  const normalized = normalizeState(state)
  useRootStore.setState({
    dashboard: normalized.dashboard,
    trading: normalized.trading,
    life: normalized.life,
    settings: normalized.settings,
    history: normalized.history,
  })
}
