import { describe, it, expect } from 'vitest'
import { computePositionSize } from './positionSize'

describe('computePositionSize', () => {
  it('مبلغ ریسک و حجم لات را با فرمول ریسک ثابت حساب می‌کند', () => {
    // موجودی ۱۰٬۰۰۰، ریسک ۱٪ → ریسک ۱۰۰ دلار؛ حد ضرر ۵ دلار → ۰٫۲ لات (۱ لات=۱۰۰ اونس)
    expect(computePositionSize({ balanceUsd: 10000, riskPercent: 1, stopUsd: 5 })).toEqual({
      riskUsd: 100,
      lots: 0.2,
    })
  })

  it('درصد ریسک را درست اعمال می‌کند', () => {
    expect(computePositionSize({ balanceUsd: 5000, riskPercent: 2, stopUsd: 10 })).toEqual({
      riskUsd: 100,
      lots: 0.1,
    })
  })

  it('اگر حد ضرر صفر یا منفی باشد حجم صفر می‌شود (جلوگیری از تقسیم بر صفر)', () => {
    expect(computePositionSize({ balanceUsd: 10000, riskPercent: 1, stopUsd: 0 }).lots).toBe(0)
    expect(computePositionSize({ balanceUsd: 10000, riskPercent: 1, stopUsd: -3 }).lots).toBe(0)
  })
})
