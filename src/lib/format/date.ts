import { toJalaali, jalaaliWeek } from 'jalaali-js'
import { toPersianDigits } from './number'

const WEEKDAYS_FA = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه']

/** نام روز هفته به فارسی (هفته از شنبه شروع می‌شود، برخلاف getDay() جاوااسکریپت که یکشنبه=۰ است) */
export function faWeekdayName(date: Date): string {
  return WEEKDAYS_FA[(date.getDay() + 1) % 7]
}

/** اندیس روز هفته با مبنای شنبه=۰ (برای ذخیره‌سازی activeWeekdays/doneThisWeek) */
export function faWeekdayIndex(date: Date): number {
  return (date.getDay() + 1) % 7
}

/** تاریخ شمسی به شکل ۱۴۰۴/۴/۱۰ */
export function faDateShort(date: Date): string {
  const { jy, jm, jd } = toJalaali(date)
  return toPersianDigits(`${jy}/${jm}/${jd}`)
}

/** شناسهٔ یکتای هفتهٔ شمسی جاری (شنبهٔ آن هفته)، برای تشخیص «هفتهٔ جدید» جهت ریست لنگرها */
export function jalaaliWeekKey(date: Date): string {
  const { jy, jm, jd } = toJalaali(date)
  const { saturday } = jalaaliWeek(jy, jm, jd)
  return `${saturday.jy}-${saturday.jm}-${saturday.jd}`
}

export function todayLabel(): { weekday: string; date: string } {
  const now = new Date()
  return { weekday: faWeekdayName(now), date: faDateShort(now) }
}
