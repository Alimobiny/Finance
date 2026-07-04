import type { DashboardSlice } from './slices/dashboardSlice'
import type { PortfolioSlice } from './slices/portfolioSlice'
import type { TradingSlice } from './slices/tradingSlice'
import type { MoneySlice } from './slices/moneySlice'
import type { LifeSlice } from './slices/lifeSlice'
import type { SettingsSlice } from './slices/settingsSlice'
import type { HistorySlice } from './slices/historySlice'

/** میان‌افزارهای فعال روی استور (فقط immer) — برای typing صحیح StateCreator هر اسلایس لازم است */
export type Mutators = [['zustand/immer', never]]

export type RootStore = DashboardSlice &
  PortfolioSlice &
  TradingSlice &
  MoneySlice &
  LifeSlice &
  SettingsSlice &
  HistorySlice
