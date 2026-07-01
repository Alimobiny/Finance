export const SCREEN_IDS = ['dashboard', 'portfolio', 'trading', 'money', 'life', 'settings'] as const

export type ScreenId = (typeof SCREEN_IDS)[number]

export const SCREEN_LABELS: Record<ScreenId, string> = {
  dashboard: 'داشبورد',
  portfolio: 'پرتفولیو',
  trading: 'معاملات',
  money: 'مالی',
  life: 'برنامه',
  settings: 'تنظیمات',
}
