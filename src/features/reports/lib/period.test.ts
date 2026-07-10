import { describe, it, expect } from 'vitest'
import { toJalaali } from 'jalaali-js'
import { parseJalaliDate, dateComposite, periodFromDate, shiftAnchor, inPeriod } from './period'

describe('parseJalaliDate', () => {
  it('ارقام فارسی/لاتین و جداکنندهٔ / یا - را می‌خواند', () => {
    expect(parseJalaliDate('۱۴۰۴/۴/۷')).toEqual({ jy: 1404, jm: 4, jd: 7 })
    expect(parseJalaliDate('1405-04-18')).toEqual({ jy: 1405, jm: 4, jd: 18 })
  })
  it('ورودی نامعتبر → null', () => {
    expect(parseJalaliDate('abc')).toBeNull()
    expect(parseJalaliDate('1405/13/1')).toBeNull()
  })
})

describe('periodFromDate — ماه', () => {
  const p = periodFromDate('month', new Date(2026, 6, 5)) // ۲۰۲۶-۰۷-۰۵ = ۱۴۰۵/۰۴/۱۴

  it('برچسب و بازهٔ ماهِ شمسی (تیر ۳۱ روز)', () => {
    expect(p.label).toBe('تیر ۱۴۰۵')
    expect(p.startNum).toBe(14050401)
    expect(p.endNum).toBe(14050431)
  })

  it('فقط تاریخِ همان ماه داخلِ بازه است', () => {
    expect(inPeriod(dateComposite('۱۴۰۵/۴/۱۴')!, p)).toBe(true)
    expect(inPeriod(dateComposite('۱۴۰۵/۵/۱')!, p)).toBe(false)
    expect(inPeriod(dateComposite('۱۴۰۵/۳/۳۱')!, p)).toBe(false)
  })
})

describe('periodFromDate — سال', () => {
  it('برچسب و شروعِ سالِ شمسی', () => {
    const p = periodFromDate('year', new Date(2026, 6, 5))
    expect(p.label).toBe('سالِ ۱۴۰۵')
    expect(p.startNum).toBe(14050101)
  })
})

describe('shiftAnchor — ماه', () => {
  it('یک ماه عقب: تیر → خرداد', () => {
    expect(toJalaali(shiftAnchor('month', new Date(2026, 6, 5), -1)).jm).toBe(3)
  })
  it('از فروردین یک ماه عقب → اسفندِ سالِ قبل', () => {
    const far = new Date(2026, 2, 25) // ~ ۱۴۰۵/۱/۵
    const j = toJalaali(far)
    if (j.jm === 1) {
      const prev = toJalaali(shiftAnchor('month', far, -1))
      expect(prev.jm).toBe(12)
      expect(prev.jy).toBe(j.jy - 1)
    }
  })
})
