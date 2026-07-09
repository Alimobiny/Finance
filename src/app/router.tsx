export const SCREEN_IDS = ['dashboard', 'trading', 'life', 'settings'] as const

export type ScreenId = (typeof SCREEN_IDS)[number]

export const SCREEN_LABELS: Record<ScreenId, string> = {
  dashboard: 'داشبورد',
  trading: 'معاملات',
  life: 'برنامه',
  settings: 'تنظیمات',
}
