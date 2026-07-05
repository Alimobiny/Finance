import { describe, it, expect } from 'vitest'
import type { Trade } from '../../../types'
import { computeTradeStats } from './tradeStats'

/** ساختِ یک Trade کامل با مقادیر پیش‌فرضِ بی‌اثر؛ فقط فیلدهای مهمِ تست را override می‌کنیم. */
function makeTrade(over: Partial<Trade>): Trade {
  return {
    id: 'x',
    accountId: 'a',
    date: '2026-01-01',
    symbol: 'XAUUSD',
    dir: 'خرید',
    riskPercent: '1',
    entry: null,
    stop: null,
    tp: null,
    exit: null,
    profit: null,
    ticket: null,
    rr: '',
    r: null,
    outcome: '',
    checklistFollowed: true,
    rule1Followed: true,
    emotion: '',
    reason: '',
    lesson: '',
    shot: null,
    ...over,
  }
}

describe('computeTradeStats', () => {
  it('لیست خالی → شمارنده‌ها صفر و معیارها null', () => {
    const s = computeTradeStats([])
    expect(s).toMatchObject({
      count: 0,
      wins: 0,
      losses: 0,
      breakeven: 0,
      sumR: 0,
      expectancy: null,
      winRate: null,
      rule1Rate: null,
      checklistRate: null,
    })
  })

  it('برد/باخت/سربه‌سر و معیارها را از منبعِ حقیقتِ واحد (R) می‌سازد', () => {
    const trades = [
      makeTrade({ r: 2, rule1Followed: true, checklistFollowed: true }),
      makeTrade({ r: -1, rule1Followed: false, checklistFollowed: true }),
      makeTrade({ r: 0, rule1Followed: true, checklistFollowed: false }),
      makeTrade({ r: null, outcome: '', rule1Followed: true, checklistFollowed: true }),
    ]
    const s = computeTradeStats(trades)

    expect(s.count).toBe(4)
    expect(s.wins).toBe(1)
    expect(s.losses).toBe(1)
    expect(s.breakeven).toBe(1)
    expect(s.sumR).toBe(1) // فقط سه معاملهٔ دارای R: 2 + (−1) + 0
    expect(s.expectancy).toBeCloseTo(1 / 3, 5)
    expect(s.winRate).toBe(50) // ۱ برد از ۲ معاملهٔ تصمیم‌گرفته (برد+باخت)
    expect(s.rule1Rate).toBe(75) // ۳ از ۴
    expect(s.checklistRate).toBe(75) // ۳ از ۴
  })

  it('وقتی R ثبت نشده، نتیجهٔ دستی روی نرخ برد اثر می‌گذارد ولی نه روی جمعِ R', () => {
    const s = computeTradeStats([makeTrade({ r: null, outcome: 'win' })])
    expect(s.sumR).toBe(0)
    expect(s.expectancy).toBeNull()
    expect(s.wins).toBe(1)
    expect(s.winRate).toBe(100)
  })
})
