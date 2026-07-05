import { describe, it, expect } from 'vitest'
import type { Holding, PortfolioState } from '../../../types'
import { subValue, holdingValue, portfolioTotal } from './computeHoldingValue'

const PRICES: PortfolioState['prices'] = { usd: 50, usdt: 1, coin: 1000, gold18: 30 }

const holding = (subs: Holding['subs']): Holding => ({
  id: 'h',
  name: 'دارایی',
  layer: 'دفاعی',
  role: '',
  target: 0,
  color: '#000',
  subs,
})

describe('subValue', () => {
  it('زیرمجموعهٔ دستی مقدار خودش را می‌دهد', () => {
    expect(subValue({ id: 's', kind: 'manual', name: 'نقد', value: 100 }, PRICES)).toBe(100)
  })

  it('زیرمجموعهٔ متصل = تعداد × قیمت واحد', () => {
    expect(subValue({ id: 's', kind: 'linked', name: 'دلار', unit: 'usd', qty: 3 }, PRICES)).toBe(150)
    expect(subValue({ id: 's', kind: 'linked', name: 'طلا', unit: 'gold18', qty: 10 }, PRICES)).toBe(300)
  })

  it('اگر قیمت واحد موجود نباشد صفر می‌شود (نه NaN)', () => {
    expect(subValue({ id: 's', kind: 'linked', name: '?', unit: 'usd', qty: 5 }, { ...PRICES, usd: 0 })).toBe(0)
  })
})

describe('holdingValue', () => {
  it('جمعِ ارزشِ همهٔ زیرمجموعه‌ها', () => {
    const h = holding([
      { id: '1', kind: 'manual', name: 'نقد', value: 200 },
      { id: '2', kind: 'linked', name: 'دلار', unit: 'usd', qty: 2 }, // 100
    ])
    expect(holdingValue(h, PRICES)).toBe(300)
  })
})

describe('portfolioTotal', () => {
  it('جمعِ ارزشِ همهٔ دارایی‌ها', () => {
    const portfolio: PortfolioState = {
      holdings: [
        holding([{ id: '1', kind: 'manual', name: 'a', value: 6000 }]),
        holding([{ id: '2', kind: 'linked', name: 'b', unit: 'coin', qty: 4 }]), // 4000
      ],
      prices: PRICES,
      pricesUpdatedAt: null,
      rebalanceNotes: [],
    }
    expect(portfolioTotal(portfolio)).toBe(10000)
  })

  it('پرتفولیوی خالی → صفر', () => {
    expect(portfolioTotal({ holdings: [], prices: PRICES, pricesUpdatedAt: null, rebalanceNotes: [] })).toBe(0)
  })
})
