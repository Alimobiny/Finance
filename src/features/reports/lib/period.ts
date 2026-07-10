import { toJalaali, toGregorian, jalaaliMonthLength } from 'jalaali-js'
import { toPersianDigits, toLatinDigits } from '../../../lib/format/number'
import { faWeekdayIndex } from '../../../lib/format/date'

export type PeriodKind = 'week' | 'month' | 'year'

/** یک دورهٔ شمسی: مرزها هم به شکلِ «کدِ فشردهٔ شمسی» (برای فیلترِ معاملات) و هم Date (برای پیمایشِ روزهای عادت). */
export interface Period {
  kind: PeriodKind
  startNum: number // jy*10000 + jm*100 + jd — یکنواخت با ترتیبِ واقعیِ تاریخ
  endNum: number
  startDate: Date
  endDate: Date
  label: string
}

const MONTHS_FA = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
const DAY_MS = 86400000

const comp = (jy: number, jm: number, jd: number) => jy * 10000 + jm * 100 + jd
const gToDate = (g: { gy: number; gm: number; gd: number }) => new Date(g.gy, g.gm - 1, g.gd)
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
const faYmd = (jy: number, jm: number, jd: number) => toPersianDigits(`${jy}/${jm}/${jd}`)

/** «۱۴۰۴/۴/۷» یا «1405-04-18» → {jy,jm,jd} یا null. ارقام فارسی و جداکنندهٔ / یا - پذیرفته می‌شوند. */
export function parseJalaliDate(s: string): { jy: number; jm: number; jd: number } | null {
  const m = toLatinDigits(s).match(/(\d{3,4})[/-](\d{1,2})[/-](\d{1,2})/)
  if (!m) return null
  const jy = Number(m[1])
  const jm = Number(m[2])
  const jd = Number(m[3])
  if (jm < 1 || jm > 12 || jd < 1 || jd > 31) return null
  return { jy, jm, jd }
}

/** کدِ فشردهٔ شمسیِ یک رشتهٔ تاریخ (برای مقایسهٔ بازه). */
export function dateComposite(s: string): number | null {
  const j = parseJalaliDate(s)
  return j ? comp(j.jy, j.jm, j.jd) : null
}

/** دورهٔ شاملِ یک تاریخِ میلادی را می‌سازد (هفته=شنبه→جمعه، ماه/سالِ شمسی). */
export function periodFromDate(kind: PeriodKind, d: Date): Period {
  if (kind === 'week') {
    const sat = new Date(d.getTime() - faWeekdayIndex(d) * DAY_MS)
    const fri = new Date(sat.getTime() + 6 * DAY_MS)
    const sj = toJalaali(sat)
    const fj = toJalaali(fri)
    return {
      kind,
      startNum: comp(sj.jy, sj.jm, sj.jd),
      endNum: comp(fj.jy, fj.jm, fj.jd),
      startDate: startOfDay(sat),
      endDate: endOfDay(fri),
      label: `هفتهٔ ${faYmd(sj.jy, sj.jm, sj.jd)} تا ${faYmd(fj.jy, fj.jm, fj.jd)}`,
    }
  }
  if (kind === 'month') {
    const j = toJalaali(d)
    const last = jalaaliMonthLength(j.jy, j.jm)
    return {
      kind,
      startNum: comp(j.jy, j.jm, 1),
      endNum: comp(j.jy, j.jm, last),
      startDate: startOfDay(gToDate(toGregorian(j.jy, j.jm, 1))),
      endDate: endOfDay(gToDate(toGregorian(j.jy, j.jm, last))),
      label: `${MONTHS_FA[j.jm - 1]} ${toPersianDigits(j.jy)}`,
    }
  }
  const j = toJalaali(d)
  const lastM = jalaaliMonthLength(j.jy, 12)
  return {
    kind,
    startNum: comp(j.jy, 1, 1),
    endNum: comp(j.jy, 12, lastM),
    startDate: startOfDay(gToDate(toGregorian(j.jy, 1, 1))),
    endDate: endOfDay(gToDate(toGregorian(j.jy, 12, lastM))),
    label: `سالِ ${toPersianDigits(j.jy)}`,
  }
}

/** لنگرِ تاریخ را به اندازهٔ delta دوره (± ) جابه‌جا می‌کند؛ برای ناوبریِ عقب/جلو. */
export function shiftAnchor(kind: PeriodKind, d: Date, delta: number): Date {
  if (kind === 'week') return new Date(d.getTime() + delta * 7 * DAY_MS)
  const j = toJalaali(d)
  if (kind === 'month') {
    const total = j.jm - 1 + delta
    const jy = j.jy + Math.floor(total / 12)
    const jm = (((total % 12) + 12) % 12) + 1
    const jd = Math.min(j.jd, jalaaliMonthLength(jy, jm))
    return gToDate(toGregorian(jy, jm, jd))
  }
  const jy = j.jy + delta
  const jd = Math.min(j.jd, jalaaliMonthLength(jy, j.jm))
  return gToDate(toGregorian(jy, j.jm, jd))
}

export function inPeriod(composite: number, period: Period): boolean {
  return composite >= period.startNum && composite <= period.endNum
}
