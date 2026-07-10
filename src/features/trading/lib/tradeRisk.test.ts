import { describe, it, expect } from 'vitest'
import { riskFromReport } from './tradeRisk'

describe('riskFromReport', () => {
  it('گلد: سودِ ۵۰۰ با حرکتِ ۵۰ و فاصلهٔ استاپِ ۱۰ → ریسکِ ۱۰۰', () => {
    expect(riskFromReport({ entry: 3450, stop: 3460, exit: 3400, profit: 500 })).toBe(100)
  })

  it('استاپ‌اوتِ کامل → ریسک ≈ |سود| (یعنی R ≈ −۱)', () => {
    const risk = riskFromReport({ entry: 3450, stop: 3460, exit: 3460, profit: -100 })
    expect(risk).toBe(100)
    expect(Math.round((-100 / risk!) * 100) / 100).toBe(-1)
  })

  it('مستقل از نماد است (از خودِ سود کالیبره می‌شود)', () => {
    // یک کراسِ فرضی: حرکتِ ۰٫۰۲ ، فاصلهٔ استاپ ۰٫۰۱ ، سودِ ۲۰۰ → ریسک ۱۰۰
    expect(riskFromReport({ entry: 1.5, stop: 1.49, exit: 1.52, profit: 200 })).toBe(100)
  })

  it('دادهٔ ناقص یا خروج=ورود یا استاپ=ورود → null', () => {
    expect(riskFromReport({ entry: 100, stop: 90, exit: 100, profit: 10 })).toBeNull()
    expect(riskFromReport({ entry: null, stop: 90, exit: 120, profit: 10 })).toBeNull()
    expect(riskFromReport({ entry: 100, stop: 100, exit: 120, profit: 10 })).toBeNull()
    expect(riskFromReport({ entry: 100, stop: 90, exit: 120, profit: null })).toBeNull()
  })
})
