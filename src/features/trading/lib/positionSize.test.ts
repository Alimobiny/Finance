import { describe, it, expect } from 'vitest'
import { computePositionSize } from './positionSize'

describe('computePositionSize', () => {
  it('حجم = ریسک$ ÷ (پیپِ استاپ × ارزشِ هر پیپ)', () => {
    // موجودی ۱۰٬۰۰۰، ریسک ۱٪ → ۱۰۰$؛ استاپ ۲۰ پیپ، هر پیپ ۱۰$ → ضررِ هر لات ۲۰۰$، حجم ۰٫۵
    expect(computePositionSize({ balanceUsd: 10000, riskPercent: 1, stopPips: 20, pipValuePerLot: 10 })).toEqual({
      riskUsd: 100,
      riskPerLot: 200,
      lots: 0.5,
    })
  })

  it('مطابقِ Plan Trade3: موجودی ۱۰٬۰۰۰، ریسک ۳٪، طلا استاپ ۵۰۰ پیپ (=۵۰ قیمت)، هر پیپ ۱۰$ → ۰٫۰۶ لات', () => {
    const r = computePositionSize({ balanceUsd: 10000, riskPercent: 3, stopPips: 500, pipValuePerLot: 10 })
    expect(r.riskUsd).toBe(300)
    expect(r.riskPerLot).toBe(5000)
    expect(r.lots).toBeCloseTo(0.06, 10)
  })

  it('پیپ یا ارزشِ صفر → حجمِ صفر (بدونِ تقسیم بر صفر)', () => {
    expect(computePositionSize({ balanceUsd: 10000, riskPercent: 1, stopPips: 0, pipValuePerLot: 10 }).lots).toBe(0)
    expect(computePositionSize({ balanceUsd: 10000, riskPercent: 1, stopPips: 20, pipValuePerLot: 0 }).lots).toBe(0)
  })

  it('موجودی/ریسکِ نامعتبر → ریسکِ صفر', () => {
    expect(computePositionSize({ balanceUsd: 0, riskPercent: 1, stopPips: 20, pipValuePerLot: 10 }).riskUsd).toBe(0)
  })
})
