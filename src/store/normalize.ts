import type { RootState, Trade, TradingAccount } from '../types'
import { DEFAULT_ACCOUNT_ID } from './defaultState'

/**
 * دادهٔ ذخیره‌شدهٔ نسخه‌های قبلی (localStorage / Google Drive / فایل پشتیبان) ممکن است
 * فیلدهای جدید را نداشته باشد. این تابع هر داده‌ای را به شکل کامل نسخهٔ فعلی درمی‌آورد
 * تا اپ هنگام بارگذاری داده‌های قدیمی خراب نشود. غیرمخرب است و مقادیر موجود را نگه می‌دارد.
 */
export function normalizeState(input: RootState): RootState {
  const s = input as unknown as Record<string, unknown>

  // --- پرتفولیو: لیست یادداشت تعادل ---
  const portfolio = (s.portfolio ?? {}) as Record<string, unknown>
  if (!Array.isArray(portfolio.rebalanceNotes)) portfolio.rebalanceNotes = []

  // --- معاملات: حساب‌ها، حساب فعال، و اتصال هر معامله به یک حساب ---
  const trading = (s.trading ?? {}) as Record<string, unknown>
  let accounts = trading.accounts as TradingAccount[] | undefined
  if (!Array.isArray(accounts) || accounts.length === 0) {
    accounts = [{ id: DEFAULT_ACCOUNT_ID, name: 'حساب اصلی', riskPerTrade: 0 }]
    trading.accounts = accounts
  }
  const accountIds = new Set(accounts.map((a) => a.id))
  let activeId = trading.activeAccountId as string | undefined
  if (!activeId || !accountIds.has(activeId)) {
    activeId = accounts[0].id
    trading.activeAccountId = activeId
  }
  const trades = (Array.isArray(trading.trades) ? trading.trades : []) as Trade[]
  for (const t of trades) {
    if (!t.accountId || !accountIds.has(t.accountId)) t.accountId = activeId
    if (t.profit === undefined) t.profit = null
  }
  trading.trades = trades

  // --- برنامه: کارها و یادداشت ---
  const life = (s.life ?? {}) as Record<string, unknown>
  if (!Array.isArray(life.tasks)) life.tasks = []
  if (typeof life.notes !== 'string') life.notes = ''

  // --- تاریخچهٔ تغییرات ---
  const history = (s.history ?? {}) as Record<string, unknown>
  if (!Array.isArray(history.entries)) history.entries = []
  s.history = history

  return input
}
