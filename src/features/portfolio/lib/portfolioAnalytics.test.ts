import { describe, it, expect } from 'vitest'
import type { Holding, PortfolioState } from '../../../types'
import { holdingRowStats, rebalanceSuggestions, defensivePercent, biggestDeviationLabel, targetSum } from './portfolioAnalytics'

const PRICES: PortfolioState['prices'] = { usd: 1, usdt: 1, coin: 1, gold18: 1 }

const holding = (name: string, value: number, target: number, layer: string): Holding => ({
  id: name,
  name,
  layer,
  role: '',
  target,
  color: '#000',
  subs: [{ id: `${name}-s`, kind: 'manual', name, value }],
})

// طلا ۷۰٪ واقعی در برابر هدف ۵۵٪ (پروزنِ دفاعی)؛ سهام ۳۰٪ در برابر ۴۵٪ (کم‌وزن)
const portfolio: PortfolioState = {
  holdings: [holding('طلا', 7000, 55, 'دفاعی'), holding('سهام', 3000, 45, 'تهاجمی')],
  prices: PRICES,
  pricesUpdatedAt: null,
  rebalanceNotes: [],
}

describe('holdingRowStats', () => {
  it('درصد واقعی، انحراف و وضعیت را می‌سازد', () => {
    expect(holdingRowStats(portfolio.holdings[0], portfolio)).toEqual({ value: 7000, actualPercent: 70, deviation: 15, status: 'پروزن' })
    expect(holdingRowStats(portfolio.holdings[1], portfolio)).toEqual({ value: 3000, actualPercent: 30, deviation: -15, status: 'کم‌وزن' })
  })

  it('اگر جمع پرتفولیو صفر باشد وضعیت «—» و درصدها صفر', () => {
    const empty: PortfolioState = { holdings: [holding('x', 0, 50, 'دفاعی')], prices: PRICES, pricesUpdatedAt: null, rebalanceNotes: [] }
    expect(holdingRowStats(empty.holdings[0], empty)).toEqual({ value: 0, actualPercent: 0, deviation: 0, status: '—' })
  })

  it('انحراف در بازهٔ ±۵ → متعادل', () => {
    const p: PortfolioState = { holdings: [holding('a', 5200, 50, 'دفاعی'), holding('b', 4800, 50, 'تهاجمی')], prices: PRICES, pricesUpdatedAt: null, rebalanceNotes: [] }
    expect(holdingRowStats(p.holdings[0], p).status).toBe('متعادل') // ۵۲٪ در برابر ۵۰٪ → انحراف ۲
  })
})

describe('rebalanceSuggestions', () => {
  it('برای کم‌وزن پیشنهاد می‌دهد؛ پروزنِ دفاعی را نادیده می‌گیرد', () => {
    const s = rebalanceSuggestions(portfolio)
    expect(s).toHaveLength(1)
    expect(s[0]).toContain('سهام')
    expect(s[0]).toContain('کم‌وزن')
  })

  it('پرتفولیوی بی‌ارزش → بدون پیشنهاد', () => {
    expect(rebalanceSuggestions({ holdings: [], prices: PRICES, pricesUpdatedAt: null, rebalanceNotes: [] })).toEqual([])
  })
})

describe('defensivePercent', () => {
  it('سهمِ لایهٔ دفاعی از کل', () => {
    expect(defensivePercent(portfolio)).toBe(70)
  })
})

describe('biggestDeviationLabel', () => {
  it('دارایی با بیشترین قدرمطلقِ انحراف را با علامت نشان می‌دهد', () => {
    // هر دو |۱۵|؛ اولین (طلا، +۱۵) انتخاب می‌شود
    expect(biggestDeviationLabel(portfolio)).toBe('طلا (+۱۵.۰٪)')
  })

  it('پرتفولیوی بی‌ارزش → «—»', () => {
    expect(biggestDeviationLabel({ holdings: [], prices: PRICES, pricesUpdatedAt: null, rebalanceNotes: [] })).toBe('—')
  })
})

describe('targetSum', () => {
  it('جمعِ درصدهای هدف', () => {
    expect(targetSum(portfolio)).toBe(100)
  })
})
