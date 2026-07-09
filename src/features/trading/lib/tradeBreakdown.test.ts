import { describe, it, expect } from 'vitest'
import { groupTradeStats, scoreBand } from './tradeBreakdown'
import type { Trade } from '../../../types'

const t = (over: Partial<Trade>): Trade => ({
  id: Math.random().toString(36),
  accountId: 'a',
  date: '',
  symbol: 'XAUUSD',
  dir: 'خرید',
  riskPercent: '',
  entry: null,
  stop: null,
  tp: null,
  exit: null,
  profit: null,
  ticket: null,
  rr: '',
  r: null,
  riskUsd: null,
  outcome: '',
  checklistFollowed: true,
  rule1Followed: true,
  emotion: '',
  setup: '',
  mistake: '',
  score: null,
  reason: '',
  lesson: '',
  shot: null,
  ...over,
})

describe('groupTradeStats', () => {
  it('به تفکیکِ ست‌آپ گروه‌بندی و آمار می‌سازد و بر جمعِ R مرتب می‌کند', () => {
    const trades = [t({ setup: 'ACD', r: 2 }), t({ setup: 'ACD', r: -1 }), t({ setup: 'PA-EOC', r: 3 })]
    const g = groupTradeStats(trades, (x) => x.setup)
    expect(g[0].key).toBe('PA-EOC') // جمعِ R بیشتر
    expect(g[0].stats.sumR).toBe(3)
    const acd = g.find((x) => x.key === 'ACD')!
    expect(acd.stats.count).toBe(2)
    expect(acd.stats.sumR).toBe(1)
    expect(acd.stats.winRate).toBe(50)
  })

  it('تگِ خالی با برچسبِ پیش‌فرض می‌آید', () => {
    const g = groupTradeStats([t({ setup: '' })], (x) => x.setup)
    expect(g[0].key).toBe('بدون تگ')
  })
})

describe('scoreBand', () => {
  it('طبق آستانه‌های ۸۰/۷۰ دسته‌بندی می‌کند', () => {
    expect(scoreBand(85)).toContain('۸۰')
    expect(scoreBand(72)).toContain('۷۰')
    expect(scoreBand(60)).toContain('۷۰')
    expect(scoreBand(null)).toBe('بدون امتیاز')
  })
})
