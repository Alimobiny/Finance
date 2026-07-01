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
import type { RootState } from '../types'

const initialState = loadPersistedState() ?? createDefaultState()

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
  useRootStore.setState({
    dashboard: state.dashboard,
    portfolio: state.portfolio,
    trading: state.trading,
    money: state.money,
    life: state.life,
    settings: state.settings,
  })
}
