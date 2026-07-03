import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createDashboardSlice } from './slices/dashboardSlice'
import { createPortfolioSlice } from './slices/portfolioSlice'
import { createTradingSlice } from './slices/tradingSlice'
import { createMoneySlice } from './slices/moneySlice'
import { createLifeSlice } from './slices/lifeSlice'
import { createSettingsSlice } from './slices/settingsSlice'
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
    ...createPortfolioSlice(initialState.portfolio)(...a),
    ...createTradingSlice(initialState.trading)(...a),
    ...createMoneySlice(initialState.money)(...a),
    ...createLifeSlice(initialState.life)(...a),
    ...createSettingsSlice(initialState.settings)(...a),
  })),
)

/** جایگزینیِ کامل داده‌های استور با نسخه‌ای که از Google Drive بازیابی یا از فایل پشتیبان بارگذاری شده */
export function applyRemoteState(state: RootState): void {
  const normalized = normalizeState(state)
  useRootStore.setState({
    dashboard: normalized.dashboard,
    portfolio: normalized.portfolio,
    trading: normalized.trading,
    money: normalized.money,
    life: normalized.life,
    settings: normalized.settings,
  })
}
