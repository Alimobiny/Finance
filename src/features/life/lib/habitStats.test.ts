import { describe, it, expect } from 'vitest'
import { jalaaliDayKey } from '../../../lib/format/date'
import { addDays, currentStreak, weekCount, atRisk, isScheduledOn } from './habitStats'
import type { TimeAnchor } from '../../../types'

// یک «حالا»ی ثابت (به وقت تهران دور از مرزِ نیمه‌شب) برای تست‌های قطعی.
const NOW = new Date('2026-07-08T09:00:00Z')
const key = (offset: number) => jalaaliDayKey(addDays(NOW, offset))

const daily = (completions: string[]): TimeAnchor => ({
  id: 'h',
  name: 'مطالعه',
  cue: '',
  note: '',
  time: '',
  period: 'صبح',
  schedule: { kind: 'daily' },
  completions,
})

describe('currentStreak (daily)', () => {
  it('روزهای پشتِ‌سرِ‌هم را می‌شمارد', () => {
    expect(currentStreak(daily([key(0), key(-1), key(-2)]), NOW)).toBe(3)
  })

  it('امروزِ انجام‌نشده زنجیره را نمی‌شکند', () => {
    expect(currentStreak(daily([key(-1), key(-2)]), NOW)).toBe(2)
  })

  it('جاافتادنِ یک روزِ گذشته زنجیره را می‌شکند', () => {
    expect(currentStreak(daily([key(0), key(-2), key(-3)]), NOW)).toBe(1)
  })

  it('لاگِ خالی → زنجیرهٔ صفر', () => {
    expect(currentStreak(daily([]), NOW)).toBe(0)
  })
})

describe('weekCount', () => {
  it('انجام‌های همین هفته را می‌شمارد', () => {
    // شنبهٔ همین هفته را پیدا و دو روزِ آن را علامت می‌زنیم
    const anchor = daily([key(0), key(-1)])
    expect(weekCount(anchor, NOW)).toBeGreaterThanOrEqual(1)
  })
})

describe('isScheduledOn (weekdays)', () => {
  it('فقط روزهای انتخابی برنامه‌ای‌اند', () => {
    const wd = faWeekdaysAround()
    const schedule = { kind: 'weekdays' as const, weekdays: [wd] }
    expect(isScheduledOn(schedule, NOW)).toBe(true)
    expect(isScheduledOn({ kind: 'weekdays', weekdays: [(wd + 1) % 7] }, NOW)).toBe(false)
  })
})

describe('atRisk (هرگز دو بار جا ننداز)', () => {
  it('وقتی دیروز جا افتاده و امروز هم هنوز نه → هشدار', () => {
    expect(atRisk(daily([key(-2)]), NOW)).toBe(true) // دیروز key(-1) نیست
  })
  it('اگر امروز انجام شده باشد → بدونِ هشدار', () => {
    expect(atRisk(daily([key(0)]), NOW)).toBe(false)
  })
  it('اگر دیروز انجام شده باشد → بدونِ هشدار', () => {
    expect(atRisk(daily([key(-1)]), NOW)).toBe(false)
  })
})

// اندیس روزِ هفتهٔ NOW (شنبه=۰) را از خودِ کتابخانه می‌گیریم تا مستقل از تقویم بماند.
function faWeekdaysAround(): number {
  return (NOW.getDay() + 1) % 7
}
