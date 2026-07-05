import { describe, it, expect } from 'vitest'
import { faWeekdayName, faWeekdayIndex, faDateShort, jalaaliWeekKey } from './date'

// تاریخ‌ها با سازندهٔ محلی (year, monthIndex, day) ساخته می‌شوند تا getDay() مستقل
// از منطقهٔ زمانی و پایدار باشد. مبنای هفته شنبه=۰ است (برخلاف getDay جاوااسکریپت).
describe('faWeekdayName و faWeekdayIndex', () => {
  it('۳ ژانویه ۲۰۲۶ شنبه است → اندیس ۰', () => {
    const saturday = new Date(2026, 0, 3)
    expect(faWeekdayName(saturday)).toBe('شنبه')
    expect(faWeekdayIndex(saturday)).toBe(0)
  })

  it('۱ ژانویه ۲۰۲۶ پنجشنبه است', () => {
    expect(faWeekdayName(new Date(2026, 0, 1))).toBe('پنج‌شنبه')
  })
})

describe('faDateShort', () => {
  it('قالب شمسیِ y/m/d فقط با ارقام فارسی و اسلش', () => {
    const out = faDateShort(new Date(2026, 0, 1))
    expect(out).toMatch(/^[۰-۹]+\/[۰-۹]+\/[۰-۹]+$/)
  })
})

describe('jalaaliWeekKey', () => {
  it('روزهای یک هفتهٔ شمسی (شنبه تا جمعه) کلید یکسان دارند', () => {
    const sat = new Date(2026, 0, 3) // شنبه
    const fri = new Date(2026, 0, 9) // جمعهٔ همان هفته
    expect(jalaaliWeekKey(sat)).toBe(jalaaliWeekKey(fri))
  })

  it('هفتهٔ بعد کلید متفاوت دارد (تشخیص هفتهٔ جدید)', () => {
    const sat = new Date(2026, 0, 3)
    const nextSat = new Date(2026, 0, 10)
    expect(jalaaliWeekKey(sat)).not.toBe(jalaaliWeekKey(nextSat))
  })
})
