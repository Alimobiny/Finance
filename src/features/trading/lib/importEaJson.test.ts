import { describe, it, expect } from 'vitest'
import { parseEaJson, looksLikeEaJson } from './importEaJson'

const ONE = JSON.stringify({
  source: 'qotbnama-mt5-ea',
  trades: [
    {
      ticket: 123456,
      symbol: 'XAUUSD',
      type: 'buy',
      lot: 0.05,
      openTime: '2026.07.03 10:15:30',
      openPrice: 2400,
      initialSL: 2397, // ریسک ۳ دلاری قیمت → R:R با TP
      tp: 2430,
      closeTime: '2026.07.03 12:00:00',
      closePrice: 2415,
      profit: 75,
      riskUsd: 300,
    },
  ],
})

describe('looksLikeEaJson', () => {
  it('محتوای JSON را از HTML تشخیص می‌دهد', () => {
    expect(looksLikeEaJson('  {"trades":[]}')).toBe(true)
    expect(looksLikeEaJson('[]')).toBe(true)
    expect(looksLikeEaJson('<html><body>...')).toBe(false)
  })
})

describe('parseEaJson', () => {
  it('رکورد کامل را با ریسکِ واقعی و R:R واقعی می‌خواند', () => {
    const { trades, skipped } = parseEaJson(ONE)
    expect(skipped).toBe(0)
    expect(trades).toHaveLength(1)
    const t = trades[0].input
    expect(t.symbol).toBe('XAUUSD')
    expect(t.dir).toBe('خرید')
    expect(t.entry).toBe(2400)
    expect(t.stop).toBe(2397)
    expect(t.exit).toBe(2415)
    expect(t.profit).toBe(75)
    expect(t.riskUsd).toBe(300) // ← کلید: ریسکِ واقعیِ EA
    expect(t.rr).toBe('10') // |۲۴۳۰−۲۴۰۰| ÷ |۲۴۰۰−۲۳۹۷| = ۳۰/۳ = ۱۰
    expect(t.outcome).toBe('win')
    expect(trades[0].ticket).toBe('123456')
  })

  it('آرایهٔ ساده (بدون پوشش trades) را هم می‌پذیرد', () => {
    const arr = JSON.stringify([{ symbol: 'EURUSD', type: 'sell', openPrice: 1.1, closePrice: 1.09, profit: -20, riskUsd: 40 }])
    const { trades } = parseEaJson(arr)
    expect(trades).toHaveLength(1)
    expect(trades[0].input.dir).toBe('فروش')
    expect(trades[0].input.riskUsd).toBe(40)
    expect(trades[0].input.outcome).toBe('loss')
  })

  it('R:Rِ کاذب (بزرگ‌تر از ۱۰) همچنان سقف‌دار می‌شود', () => {
    const arr = JSON.stringify([{ symbol: 'XAUUSD', type: 'buy', openPrice: 2400, initialSL: 2399.9, tp: 2430, profit: 10, riskUsd: 5 }])
    expect(parseEaJson(arr).trades[0].input.rr).toBe('') // ۳۰۰ > ۱۰ → خالی
  })

  it('رکوردِ بدون جهت/قیمتِ ورود رد می‌شود؛ JSON نامعتبر → خالی', () => {
    expect(parseEaJson(JSON.stringify([{ symbol: 'X' }])).skipped).toBe(1)
    expect(parseEaJson('not json').trades).toHaveLength(0)
  })

  it('آبجکتِ تکِ یک معامله (فقط یک معامله ثبت‌شده) را هم می‌خواند', () => {
    const single = JSON.stringify({ ticket: 9, symbol: 'XAUUSD', type: 'buy', openPrice: 2400, closePrice: 2410, profit: 50, riskUsd: 100 })
    const { trades } = parseEaJson(single)
    expect(trades).toHaveLength(1)
    expect(trades[0].input.riskUsd).toBe(100)
  })

  it('فرمتِ JSONL (هر خط یک آبجکت) را هم می‌خواند — خروجیِ append‌شدهٔ EA', () => {
    const jsonl =
      '{"ticket":1,"symbol":"XAUUSD","type":"buy","openPrice":2400,"initialSL":2397,"closePrice":2415,"profit":75,"riskUsd":300}\n' +
      '{"ticket":2,"symbol":"EURUSD","type":"sell","openPrice":1.1,"closePrice":1.12,"profit":-30,"riskUsd":40}\n'
    const { trades } = parseEaJson(jsonl)
    expect(trades).toHaveLength(2)
    expect(trades[0].input.riskUsd).toBe(300)
    expect(trades[1].input.outcome).toBe('loss')
  })
})
