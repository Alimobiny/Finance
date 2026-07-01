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

const initialState = loadPersistedState() ?? createDefaultState()

/** استور اصلیِ داده‌ای اپ — دقیقاً معادل چیزی که در localStorage و بعداً Google Drive ذخیره می‌شود */
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
