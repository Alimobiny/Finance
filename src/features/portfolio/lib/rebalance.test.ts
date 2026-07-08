import { describe, it, expect } from 'vitest'
import { computeRebalance } from './rebalance'
import type { Holding, PortfolioState } from '../../../types'

const wrap = (holdings: Holding[]): PortfolioState => ({
  holdings,
  prices: { usd: 0, usdt: 0, coin: 0, gold18: 0 },
  pricesUpdatedAt: null,
  rebalanceNotes: [],
  allocationPresets: [],
})

const basket = (id: string, name: string, target: number, value: number): Holding => ({
  id,
  name,
  layer: 'سایر',
  role: '',
  target,
  color: '#000',
  subs: [{ id: `${id}-s`, kind: 'manual', name: 'x', value }],
})

describe('computeRebalance', () => {
  it('مبلغِ هدف و اختلافِ بخر/بفروش را درست حساب می‌کند', () => {
    const r = computeRebalance(wrap([basket('a', 'طلا', 60, 400), basket('b', 'سهام', 40, 600)]))
    expect(r.total).toBe(1000)
    expect(r.targetSum).toBe(100)
    expect(r.rows[0].targetValue).toBe(600) // ۶۰٪ از ۱۰۰۰
    expect(r.rows[0].delta).toBe(200) // ۲۰۰ کم داری → بخر
    expect(r.rows[1].delta).toBe(-200) // ۲۰۰ زیاد داری → بفروش
  })

  it('٪ فعلی نسبت به کلِ سبد حساب می‌شود', () => {
    const r = computeRebalance(wrap([basket('a', 'طلا', 50, 250), basket('b', 'سهام', 50, 750)]))
    expect(r.rows[0].actualPercent).toBe(25)
    expect(r.rows[1].actualPercent).toBe(75)
  })

  it('سبدِ خالی → کل صفر و بدونِ ردیف', () => {
    const r = computeRebalance(wrap([]))
    expect(r.total).toBe(0)
    expect(r.rows).toEqual([])
  })

  it('targetِ نامعتبر را صفر می‌گیرد (هرگز NaN)', () => {
    const r = computeRebalance(wrap([basket('a', 'طلا', Number.NaN, 100)]))
    expect(r.rows[0].targetPercent).toBe(0)
    expect(r.targetSum).toBe(0)
  })
})
