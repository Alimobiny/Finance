import type { TradeDirection } from '../../../types'
import { toLatinDigits } from '../../../lib/format/number'

type Maybe = number | null | undefined
const fin = (v: Maybe): v is number => v != null && Number.isFinite(v)
const round2 = (v: number) => Math.round(v * 100) / 100

/** متن ورودی یک قیمت را به عدد مثبت یا null تبدیل می‌کند (هرگز NaN، بدون علامت منفی). */
export function parsePriceInput(raw: string): number | null {
  const cleaned = toLatinDigits(raw).replace(/[^\d.]/g, '')
  if (cleaned === '' || cleaned === '.') return null
  const n = Number(cleaned)
  return Number.isFinite(n) && n > 0 ? n : null
}

/**
 * R واقعیِ معامله را از قیمت‌ها می‌سازد:
 *   ریسک هر واحد = |ورود − حدضرر| ، سود هر واحد بسته به جهت.
 *   خرید:  R = (خروج − ورود) / ریسک
 *   فروش:  R = (ورود − خروج) / ریسک
 * اگر ورودی‌ها ناقص یا ریسک صفر باشد، null برمی‌گرداند.
 */
export function computeRFromPrices(dir: TradeDirection, entry: Maybe, stop: Maybe, exit: Maybe): number | null {
  if (!fin(entry) || !fin(stop) || !fin(exit)) return null
  const risk = Math.abs(entry - stop)
  if (risk === 0) return null
  const sign = dir === 'خرید' ? 1 : -1
  return round2((sign * (exit - entry)) / risk)
}

/** نسبت R:R هدف = |حدسود − ورود| / |ورود − حدضرر|. */
export function computePlannedRR(entry: Maybe, stop: Maybe, tp: Maybe): number | null {
  if (!fin(entry) || !fin(stop) || !fin(tp)) return null
  const risk = Math.abs(entry - stop)
  if (risk === 0) return null
  return round2(Math.abs(tp - entry) / risk)
}

/**
 * R واقعیِ معامله از روی سود/زیان خالص و «مبلغ ریسک ثابت هر معامله»:
 *   R = سود ÷ مبلغ ریسک
 * این روش برای معاملات وارد‌شده از متاتریدر درست است، چون گزارش فقط «آخرین» حد ضرر
 * را می‌دهد و با سیو سود / ریسک‌فری / تریلینگ، R از روی قیمت غلط می‌شود.
 */
export function rFromProfit(profit: Maybe, riskPerTrade: Maybe): number | null {
  if (!fin(profit) || !fin(riskPerTrade) || riskPerTrade <= 0) return null
  return round2(profit / riskPerTrade)
}

/** مبلغ ریسک هر معامله (به دلار) = موجودی حساب × درصد ریسک ÷ ۱۰۰. اگر نامعتبر بود ۰. */
export function accountRiskAmount(a: { balance: number; riskPercent: number }): number {
  const v = (a.balance * a.riskPercent) / 100
  return Number.isFinite(v) && v > 0 ? v : 0
}
