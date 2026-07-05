import { describe, it, expect } from 'vitest'
import { parsePriceInput, computeRFromPrices, computePlannedRR, rFromProfit, accountRiskAmount, effectiveRiskAmount } from './tradeMath'

describe('parsePriceInput', () => {
  it('عدد اعشاری معتبر را می‌خواند', () => {
    expect(parsePriceInput('1234.5')).toBe(1234.5)
  })

  it('ارقام فارسی را به عدد تبدیل می‌کند', () => {
    expect(parsePriceInput('۱۲۳')).toBe(123)
  })

  it('ورودی خالی، نقطهٔ تنها و متن نامعتبر → null', () => {
    expect(parsePriceInput('')).toBeNull()
    expect(parsePriceInput('.')).toBeNull()
    expect(parsePriceInput('abc')).toBeNull()
    expect(parsePriceInput('12.3.4')).toBeNull()
  })

  it('علامت منفی را حذف می‌کند و صفر را نامعتبر می‌شمارد (قیمت همیشه مثبت)', () => {
    expect(parsePriceInput('-5')).toBe(5)
    expect(parsePriceInput('0')).toBeNull()
  })
})

describe('computeRFromPrices', () => {
  it('خرید سودده: R مثبت', () => {
    expect(computeRFromPrices('خرید', 100, 90, 120)).toBe(2)
  })

  it('فروش سودده: جهت لحاظ می‌شود', () => {
    expect(computeRFromPrices('فروش', 100, 110, 80)).toBe(2)
  })

  it('خرید زیان‌ده: R منفی', () => {
    expect(computeRFromPrices('خرید', 100, 90, 95)).toBe(-0.5)
  })

  it('به دو رقم اعشار گرد می‌کند', () => {
    expect(computeRFromPrices('خرید', 100, 97, 110)).toBe(3.33)
  })

  it('ریسک صفر یا ورودی ناقص → null', () => {
    expect(computeRFromPrices('خرید', 100, 100, 120)).toBeNull()
    expect(computeRFromPrices('خرید', null, 90, 120)).toBeNull()
  })
})

describe('computePlannedRR', () => {
  it('نسبت R:R هدف را حساب می‌کند', () => {
    expect(computePlannedRR(100, 90, 130)).toBe(3)
  })

  it('ریسک صفر یا ورودی ناقص → null', () => {
    expect(computePlannedRR(100, 100, 130)).toBeNull()
    expect(computePlannedRR(100, 90, null)).toBeNull()
  })
})

describe('rFromProfit', () => {
  it('R = سود ÷ مبلغ ریسک هر معامله', () => {
    expect(rFromProfit(250, 100)).toBe(2.5)
    expect(rFromProfit(-50, 100)).toBe(-0.5)
  })

  it('مبلغ ریسک صفر/منفی یا سود null → null', () => {
    expect(rFromProfit(250, 0)).toBeNull()
    expect(rFromProfit(250, -10)).toBeNull()
    expect(rFromProfit(null, 100)).toBeNull()
  })
})

describe('accountRiskAmount', () => {
  it('مبلغ ریسک = موجودی × درصد ÷ ۱۰۰', () => {
    expect(accountRiskAmount({ balance: 10000, riskPercent: 1 })).toBe(100)
  })

  it('موجودی صفر یا مقدار نامعتبر → صفر', () => {
    expect(accountRiskAmount({ balance: 0, riskPercent: 1 })).toBe(0)
    expect(accountRiskAmount({ balance: -100, riskPercent: 1 })).toBe(0)
  })
})

describe('effectiveRiskAmount', () => {
  it('ریسکِ واقعیِ معامله (اگر معتبر) بر ریسکِ ثابتِ حساب مقدم است', () => {
    expect(effectiveRiskAmount(80, 50)).toBe(80)
  })

  it('اگر ریسکِ واقعی نبود/نامعتبر بود، به ریسکِ حساب برمی‌گردد', () => {
    expect(effectiveRiskAmount(null, 50)).toBe(50)
    expect(effectiveRiskAmount(undefined, 50)).toBe(50)
    expect(effectiveRiskAmount(0, 50)).toBe(50)
    expect(effectiveRiskAmount(-10, 50)).toBe(50)
  })

  it('R نهایی با ریسکِ واقعی: سود ۱۶۰ ÷ ریسکِ واقعی ۸۰ → ۲ (مستقل از حساب)', () => {
    expect(rFromProfit(160, effectiveRiskAmount(80, 50))).toBe(2)
  })
})
