import { toJalaali, jalaaliWeek } from 'jalaali-js'
import { toPersianDigits } from './number'

/** نام روزهای هفته با مبنای شنبه=۰ */
export const WEEKDAYS_FA = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه']

/** نام روز هفته به فارسی (هفته از شنبه شروع می‌شود، برخلاف getDay() جاوااسکریپت که یکشنبه=۰ است) */
export function faWeekdayName(date: Date): string {
  return WEEKDAYS_FA[(date.getDay() + 1) % 7]
}

/** اندیس روز هفته با مبنای شنبه=۰ (برای ذخیره‌سازی activeWeekdays/doneThisWeek) */
export function faWeekdayIndex(date: Date): number {
  return (date.getDay() + 1) % 7
}

/**
 * اجزای زمانِ دیواریِ «تهران» را از یک Date بیرون می‌کشد — مستقل از منطقهٔ
 * زمانیِ دستگاه/سرور. این‌طوری تاریخ‌ها و اسمِ فایلِ بک‌آپ همیشه به وقت ایران‌اند،
 * حتی اگر کد روی سرورِ UTC (مثل GitHub Actions) یا دستگاهی با تایم‌زونِ دیگر اجرا شود.
 */
function tehranParts(date: Date): { gy: number; gm: number; gd: number; hh: number; mm: number } {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const p: Record<string, string> = {}
  for (const part of f.formatToParts(date)) if (part.type !== 'literal') p[part.type] = part.value
  const hh = Number(p.hour) % 24 // برخی موتورها نیمه‌شب را «۲۴» می‌دهند
  return { gy: Number(p.year), gm: Number(p.month), gd: Number(p.day), hh, mm: Number(p.minute) }
}

/** تاریخ شمسی به وقت تهران، به شکل ۱۴۰۴/۴/۱۰ */
export function faDateShort(date: Date): string {
  const { gy, gm, gd } = tehranParts(date)
  const { jy, jm, jd } = toJalaali(gy, gm, gd)
  return toPersianDigits(`${jy}/${jm}/${jd}`)
}

/** تاریخ شمسی + ساعت به وقت تهران، به شکل ۱۴۰۴/۴/۱۰ ۱۴:۳۰ */
export function faDateTime(date: Date): string {
  const { gy, gm, gd, hh, mm } = tehranParts(date)
  const { jy, jm, jd } = toJalaali(gy, gm, gd)
  const p2 = (n: number) => String(n).padStart(2, '0')
  return toPersianDigits(`${jy}/${jm}/${jd} ${p2(hh)}:${p2(mm)}`)
}

/**
 * مهرِ زمانیِ شمسی+تهران برای نامِ فایلِ بک‌آپ: 1404-04-10_14-30
 * (ارقام لاتین، صفرپیشوند، قابلِ مرتب‌سازی). تاریخ و ساعت هر دو به وقت ایران.
 */
export function jalaaliFileStamp(date: Date = new Date()): string {
  const { gy, gm, gd, hh, mm } = tehranParts(date)
  const { jy, jm, jd } = toJalaali(gy, gm, gd)
  const p2 = (n: number) => String(n).padStart(2, '0')
  return `${jy}-${p2(jm)}-${p2(jd)}_${p2(hh)}-${p2(mm)}`
}

/** شناسهٔ یکتای هفتهٔ شمسی جاری (شنبهٔ آن هفته) به وقت تهران، برای تشخیص «هفتهٔ جدید» جهت ریست لنگرها */
export function jalaaliWeekKey(date: Date): string {
  const { gy, gm, gd } = tehranParts(date)
  const { jy, jm, jd } = toJalaali(gy, gm, gd)
  const { saturday } = jalaaliWeek(jy, jm, jd)
  return `${saturday.jy}-${saturday.jm}-${saturday.jd}`
}

export function todayLabel(): { weekday: string; date: string } {
  const now = new Date()
  return { weekday: faWeekdayName(now), date: faDateShort(now) }
}
