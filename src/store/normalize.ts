import type { RootState, Trade, TradingAccount } from '../types'
import { DEFAULT_ACCOUNT_ID } from './defaultState'
import { newId } from '../lib/format/id'

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
  let accounts: TradingAccount[]
  const rawAccounts = trading.accounts as TradingAccount[] | undefined
  if (!Array.isArray(rawAccounts) || rawAccounts.length === 0) {
    accounts = [{ id: DEFAULT_ACCOUNT_ID, name: 'حساب اصلی', balance: 0, riskPercent: 1 }]
  } else {
    accounts = rawAccounts
  }
  trading.accounts = accounts
  // مهاجرت مدل ریسک: از riskPerTrade قدیمی به balance + riskPercent (با حفظ مبلغ ریسک قبلی).
  for (const a of accounts as unknown as Array<Record<string, unknown>>) {
    if (typeof a.riskPercent !== 'number') a.riskPercent = 1
    if (typeof a.balance !== 'number') {
      const old = typeof a.riskPerTrade === 'number' ? a.riskPerTrade : 0
      a.balance = old > 0 ? (old * 100) / (a.riskPercent as number) : 0
    }
    delete a.riskPerTrade
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

  // مهاجرتِ امتیازدهی: اگر بخش «وضعیت بازار» (۲۷٫۵ امتیاز، طبق محاسبه‌گر IPS) جا
  // افتاده باشد آن را تزریق می‌کنیم. بدون این بخش، حداکثر امتیاز ۴۷٫۵ می‌ماند و
  // آستانهٔ ۶۰ هرگز دست‌یافتنی نیست (همیشه «وارد نشو»). غیرمخرب و idempotent است.
  const scoreSections = Array.isArray(trading.scoreSections) ? (trading.scoreSections as Array<Record<string, unknown>>) : null
  if (scoreSections && scoreSections.length > 0) {
    // ۱) تزریق بخش «وضعیت بازار» اگر جا افتاده باشد.
    if (!scoreSections.some((sec) => typeof sec.title === 'string' && sec.title.includes('وضعیت بازار'))) {
      const marketSection = {
        id: newId(),
        title: 'وضعیت بازار',
        single: false,
        options: [
          { id: newId(), label: 'MACD', weight: 5, on: false },
          { id: newId(), label: 'Minor Line', weight: 7.5, on: false },
          { id: newId(), label: 'Major Line', weight: 10, on: false },
          { id: newId(), label: 'Slope', weight: 5, on: false },
        ],
      }
      const strategyIdx = scoreSections.findIndex((sec) => typeof sec.title === 'string' && sec.title.includes('استراتژی'))
      if (strategyIdx >= 0) scoreSections.splice(strategyIdx, 0, marketSection)
      else scoreSections.push(marketSection)
    }

    // ۲) استراتژی چندانتخابی است (نسخه‌های قبلی single=true با عنوانِ «یکی را انتخاب کن» بودند).
    for (const sec of scoreSections) {
      if (typeof sec.title === 'string' && sec.title.includes('استراتژی')) {
        sec.single = false
        sec.title = 'استراتژی'
      }
    }

    trading.scoreSections = scoreSections
  }

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
