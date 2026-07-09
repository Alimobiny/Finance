import type { DashboardSlice } from './slices/dashboardSlice'
import type { TradingSlice } from './slices/tradingSlice'
import type { LifeSlice } from './slices/lifeSlice'
import type { SettingsSlice } from './slices/settingsSlice'
import type { HistorySlice } from './slices/historySlice'

/** میان‌افزارهای فعال روی استور (فقط immer) — برای typing صحیح StateCreator هر اسلایس لازم است */
export type Mutators = [['zustand/immer', never]]

export type RootStore = DashboardSlice &
  TradingSlice &
  LifeSlice &
  SettingsSlice &
  HistorySlice
