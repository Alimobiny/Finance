import type { RootState, Trade, TradingAccount } from '../types'
import { DEFAULT_ACCOUNT_ID, DEFAULT_SETUPS, DEFAULT_MISTAKES } from './defaultState'
import { newId } from '../lib/format/id'
import { faWeekdayIndex, jalaaliDayKey } from '../lib/format/date'
import { riskFromReport } from '../features/trading/lib/tradeRisk'

/**
 * دادهٔ ذخیره‌شدهٔ نسخه‌های قبلی (localStorage / Google Drive / فایل پشتیبان) ممکن است
 * فیلدهای جدید را نداشته باشد. این تابع هر داده‌ای را به شکل کامل نسخهٔ فعلی درمی‌آورد
 * تا اپ هنگام بارگذاری داده‌های قدیمی خراب نشود. غیرمخرب است و مقادیر موجود را نگه می‌دارد.
 */
export function normalizeState(input: RootState): RootState {
  const s = input as unknown as Record<string, unknown>

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
    if (t.riskUsd === undefined) t.riskUsd = null
    // فیلدهای جدیدِ ژورنال (تگ‌ها و امتیاز) روی معاملاتِ قدیمی
    if (typeof t.setup !== 'string') t.setup = ''
    if (typeof t.mistake !== 'string') t.mistake = ''
    if (t.score === undefined) t.score = null
    if (t.commission === undefined) t.commission = null
    if (t.swap === undefined) t.swap = null
    // ریسکِ واقعیِ معاملاتِ import‌شدهٔ قدیمی را از سودِ «ناخالص» (قبل از کمیسیون/سواپ) بازسازی کن،
    // تا R = سودِ خالص ÷ ریسک، کمیسیون/سواپ را لحاظ کند. (اگر ثبت نشده و داده کامل است.)
    if (t.riskUsd == null && t.profit != null && t.entry != null && t.stop != null && t.exit != null) {
      const gross = t.profit - (t.commission ?? 0) - (t.swap ?? 0)
      const rk = riskFromReport({ entry: t.entry, stop: t.stop, exit: t.exit, profit: gross })
      if (rk != null) {
        t.riskUsd = rk
        t.r = Math.round((t.profit / rk) * 100) / 100
      }
    }
  }
  trading.trades = trades

  // محاسبه‌گرِ حجم: مهاجرت از فرمولِ دلاریِ طلا (stopUsd × ۱۰۰) به پیپ/نماد.
  const ps = (trading.positionSize ?? {}) as Record<string, unknown>
  if (typeof ps.balanceUsd !== 'number') ps.balanceUsd = 0
  if (typeof ps.riskPercent !== 'number') ps.riskPercent = 0.5
  if (typeof ps.stopPips !== 'number') ps.stopPips = 0
  if (typeof ps.pipValuePerLot !== 'number') ps.pipValuePerLot = 10
  delete ps.stopUsd
  trading.positionSize = ps

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

  // --- برنامه: کارها، یادداشت، و مهاجرتِ لنگرها به مدلِ عادت (schedule/completions/cue) ---
  const life = (s.life ?? {}) as Record<string, unknown>
  if (!Array.isArray(life.tasks)) life.tasks = []
  if (typeof life.notes !== 'string') life.notes = ''
  const anchors = Array.isArray(life.anchors) ? (life.anchors as Array<Record<string, unknown>>) : []
  const DAY_MS = 86400000
  for (const a of anchors) {
    if (typeof a.cue !== 'string') a.cue = ''
    if (!Array.isArray(a.completions)) a.completions = []
    if (!a.schedule || typeof a.schedule !== 'object') {
      const aw = Array.isArray(a.activeWeekdays) ? (a.activeWeekdays as number[]) : []
      a.schedule = aw.length > 0 ? { kind: 'weekdays', weekdays: [...aw].sort((x, y) => x - y) } : { kind: 'daily' }
      // «انجام‌شده‌های این هفته»ی قدیمی را به لاگِ تاریخ‌دارِ همین هفته منتقل می‌کنیم.
      const dw = Array.isArray(a.doneWeekdays) ? (a.doneWeekdays as number[]) : []
      if (dw.length) {
        const now = new Date()
        const sat = new Date(now.getTime() - faWeekdayIndex(now) * DAY_MS)
        const comp = a.completions as string[]
        for (const di of dw) {
          const dayKey = jalaaliDayKey(new Date(sat.getTime() + di * DAY_MS))
          if (!comp.includes(dayKey)) comp.push(dayKey)
        }
      }
    }
    delete a.activeWeekdays
    delete a.doneWeekdays
  }
  life.anchors = anchors
  s.life = life

  // --- تنظیمات: URL منبعِ خودکارِ معاملات ---
  const settings = (s.settings ?? {}) as Record<string, unknown>
  if (typeof settings.autoImportUrl !== 'string') settings.autoImportUrl = ''
  if (!Array.isArray(settings.setups)) settings.setups = DEFAULT_SETUPS.map((text) => ({ id: newId(), text }))
  if (!Array.isArray(settings.mistakes)) settings.mistakes = DEFAULT_MISTAKES.map((text) => ({ id: newId(), text }))
  s.settings = settings

  // --- تاریخچهٔ تغییرات ---
  const history = (s.history ?? {}) as Record<string, unknown>
  if (!Array.isArray(history.entries)) history.entries = []
  s.history = history

  return input
}
