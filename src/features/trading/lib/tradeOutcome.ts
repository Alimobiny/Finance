import type { Trade, TradeOutcome } from '../../../types'

/** آیا نتیجهٔ R یک عدد معتبر است (نه null، نه NaN، نه بی‌نهایت). */
export function hasR<T extends { r: number | null }>(t: T): t is T & { r: number } {
  return t.r != null && Number.isFinite(t.r)
}

/**
 * نتیجهٔ نهایی معامله بر اساس یک منبع حقیقت واحد.
 * اصل استاندارد ژورنال: «نتیجهٔ R» مبنای برد/باخت است، چون از قیمت خروج
 * نسبت به حد ضرر مشتق می‌شود. پس اگر R عددی معتبر باشد، جهت نتیجه از علامت آن
 * تعیین می‌شود و نتیجهٔ دستی نادیده گرفته می‌شود؛ فقط وقتی R ثبت نشده، نتیجهٔ
 * دستی کاربر ملاک است. این کار تناقض «باخت با R مثبت» را ساختاراً غیرممکن می‌کند.
 */
export function resolveOutcome(t: Pick<Trade, 'r' | 'outcome'>): TradeOutcome {
  if (hasR(t)) return t.r > 0 ? 'win' : t.r < 0 ? 'loss' : 'be'
  return t.outcome
}
