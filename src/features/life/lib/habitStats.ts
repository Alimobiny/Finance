import type { HabitSchedule, TimeAnchor } from '../../../types'
import { faWeekdayIndex, jalaaliDayKey } from '../../../lib/format/date'

const DAY_MS = 86400000

export function addDays(date: Date, n: number): Date {
  return new Date(date.getTime() + n * DAY_MS)
}

/** شنبهٔ هفتهٔ شاملِ این تاریخ (مبنای شنبه=۰). */
function weekSaturday(date: Date): Date {
  return addDays(date, -faWeekdayIndex(date))
}

/** آیا عادت طبق زمان‌بندی در این روز «انتظار می‌رود»؟ (timesPerWeek: هر روز مجاز است) */
export function isScheduledOn(schedule: HabitSchedule, date: Date): boolean {
  if (schedule.kind === 'weekdays') return schedule.weekdays.includes(faWeekdayIndex(date))
  return true
}

/** آیا عادت در این روز انجام شده؟ (بر اساس لاگِ تاریخ‌دار) */
export function isDoneOn(anchor: TimeAnchor, date: Date): boolean {
  return anchor.completions.includes(jalaaliDayKey(date))
}

/**
 * زنجیرهٔ فعلی:
 *  - daily/weekdays: تعدادِ روزهای برنامه‌ایِ پشتِ‌سرِ‌هم که انجام شده‌اند
 *    (امروزِ انجام‌نشده زنجیره را نمی‌شکند چون هنوز تمام نشده).
 *  - timesPerWeek: تعدادِ هفته‌های پشتِ‌سرِ‌همی که به تعداد رسیده‌اند.
 */
export function currentStreak(anchor: TimeAnchor, now: Date = new Date()): number {
  if (anchor.schedule.kind === 'timesPerWeek') return weekStreak(anchor, anchor.schedule.count, now)
  let streak = 0
  let d = new Date(now)
  for (let i = 0; i < 400; i++) {
    if (isScheduledOn(anchor.schedule, d)) {
      if (isDoneOn(anchor, d)) streak++
      else if (i !== 0) break // فقط «امروزِ» انجام‌نشده مجاز است؛ روزِ گذشتهٔ جاافتاده می‌شکند
    }
    d = addDays(d, -1)
  }
  return streak
}

/** تعدادِ انجامِ عادت در هفتهٔ شاملِ این تاریخ (شنبه→جمعه). */
export function weekCount(anchor: TimeAnchor, now: Date = new Date()): number {
  const sat = weekSaturday(now)
  let c = 0
  for (let i = 0; i < 7; i++) if (isDoneOn(anchor, addDays(sat, i))) c++
  return c
}

function weekStreak(anchor: TimeAnchor, target: number, now: Date): number {
  let streak = 0
  let sat = weekSaturday(now)
  for (let w = 0; w < 200; w++) {
    let c = 0
    for (let i = 0; i < 7; i++) if (isDoneOn(anchor, addDays(sat, i))) c++
    if (c >= Math.max(1, target)) streak++
    else if (w !== 0) break // هفتهٔ جاری اگر هنوز به تعداد نرسیده، زنجیره را نمی‌شکند
    sat = addDays(sat, -7)
  }
  return streak
}

/** «هرگز دو بار پشتِ‌سرِ‌هم جا ننداز»: امروز روزِ برنامه است و انجام نشده، و آخرین روزِ برنامه‌ایِ قبل هم جا افتاده. */
export function atRisk(anchor: TimeAnchor, now: Date = new Date()): boolean {
  if (!isScheduledOn(anchor.schedule, now) || isDoneOn(anchor, now)) return false
  let d = addDays(now, -1)
  for (let i = 0; i < 14; i++) {
    if (isScheduledOn(anchor.schedule, d)) return !isDoneOn(anchor, d)
    d = addDays(d, -1)
  }
  return false
}

export interface HeatDay {
  key: string
  scheduled: boolean
  done: boolean
  future: boolean
}

/** شبکهٔ هیت‌مپ: `weeks` هفتهٔ اخیر (قدیمی→جدید)، هر ردیف شنبه→جمعه. */
export function habitGrid(anchor: TimeAnchor, weeks: number, now: Date = new Date()): HeatDay[][] {
  const sat = weekSaturday(now)
  const grid: HeatDay[][] = []
  for (let w = weeks - 1; w >= 0; w--) {
    const start = addDays(sat, -7 * w)
    const row: HeatDay[] = []
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i)
      row.push({
        key: jalaaliDayKey(d),
        scheduled: isScheduledOn(anchor.schedule, d),
        done: isDoneOn(anchor, d),
        future: d.getTime() > now.getTime(),
      })
    }
    grid.push(row)
  }
  return grid
}
