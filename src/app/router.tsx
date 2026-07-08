export const SCREEN_IDS = ['dashboard', 'portfolio', 'trading', 'life', 'settings'] as const

export type ScreenId = (typeof SCREEN_IDS)[number]

export const SCREEN_LABELS: Record<ScreenId, string> = {
  dashboard: 'داشبورد',
  portfolio: 'پرتفولیو',
  trading: 'معاملات',
  life: 'برنامه',
  settings: 'تنظیمات',
}
