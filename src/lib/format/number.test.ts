import { describe, it, expect } from 'vitest'
import { toPersianDigits, toLatinDigits, faNumber, faMoney, faPercent, parseNumberInput } from './number'

describe('toPersianDigits', () => {
  it('ارقام لاتین را فارسی می‌کند و بقیه را دست نمی‌زند', () => {
    expect(toPersianDigits(123)).toBe('۱۲۳')
    expect(toPersianDigits('a1b2')).toBe('a۱b۲')
  })
})

describe('toLatinDigits', () => {
  it('ارقام فارسی و عربی را لاتین می‌کند', () => {
    expect(toLatinDigits('۱۲۳')).toBe('123')
    expect(toLatinDigits('٠٩')).toBe('09') // ارقام عربی
  })
})

describe('faNumber', () => {
  it('جداکنندهٔ هزارگان + ارقام فارسی', () => {
    expect(faNumber(1000)).toBe('۱,۰۰۰')
    expect(faNumber(1234.5, 1)).toBe('۱,۲۳۴.۵')
  })

  it('مقدار نامعتبر → صفر', () => {
    expect(faNumber(NaN)).toBe('۰')
  })
})

describe('faMoney', () => {
  it('میلیارد و میلیون را خوانا می‌کند', () => {
    expect(faMoney(2_000_000_000)).toBe('۲ میلیارد ت')
    expect(faMoney(2_500_000)).toBe('۲.۵ میلیون ت')
  })

  it('مبالغ کوچک‌تر با واحد تومان', () => {
    expect(faMoney(5000)).toBe('۵,۰۰۰ ت')
  })

  it('مقدار منفی با علامت منها', () => {
    expect(faMoney(-2_000_000_000)).toBe('−۲ میلیارد ت')
  })
})

describe('faPercent', () => {
  it('درصد با اعشار پیش‌فرض و سفارشی', () => {
    expect(faPercent(50)).toBe('۵۰.۰٪')
    expect(faPercent(50, 0)).toBe('۵۰٪')
  })
})

describe('parseNumberInput', () => {
  it('جداکننده و ارقام فارسی را پاک/تبدیل می‌کند', () => {
    expect(parseNumberInput('۱٬۲۳۴')).toBe(1234)
    expect(parseNumberInput('12.5')).toBe(12.5)
    expect(parseNumberInput('-50')).toBe(-50)
  })

  it('ورودی نامعتبر → صفر', () => {
    expect(parseNumberInput('abc')).toBe(0)
  })
})
