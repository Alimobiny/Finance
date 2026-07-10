export const SCREEN_IDS = ['dashboard', 'trading', 'life', 'reports', 'settings'] as const

export type ScreenId = (typeof SCREEN_IDS)[number]

export const SCREEN_LABELS: Record<ScreenId, string> = {
  dashboard: 'داشبورد',
  trading: 'معاملات',
  life: 'برنامه',
  reports: 'گزارش',
  settings: 'تنظیمات',
}
