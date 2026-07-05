import { describe, it, expect } from 'vitest'
import type { Debt } from '../../../types'
import { sumLineItems, deriveDebt, totalRemainingDebt, totalMonthlyInstallment, computeTax } from './moneyCalcs'

describe('sumLineItems', () => {
  it('مجموع مقادیر را می‌دهد', () => {
    expect(sumLineItems([{ id: '1', label: 'a', value: 10 }, { id: '2', label: 'b', value: 20 }])).toBe(30)
    expect(sumLineItems([])).toBe(0)
  })
})

describe('deriveDebt', () => {
  it('بدهی یکجا تسویه‌شده', () => {
    const d: Debt = { id: '1', kind: 'lumpSum', name: 'x', total: 1000, dueDate: '2026-01-01', settled: true }
    expect(deriveDebt(d)).toEqual({ remainingCount: 0, remainingDebt: 0, progressPercent: 100, status: 'پرداخت‌شده' })
  })

  it('بدهی یکجا تسویه‌نشده', () => {
    const d: Debt = { id: '1', kind: 'lumpSum', name: 'x', total: 1000, dueDate: '2026-01-01', settled: false }
    expect(deriveDebt(d)).toMatchObject({ remainingDebt: 1000, progressPercent: 0, status: 'پرداخت‌نشده' })
  })

  it('بدهی قسطی در جریان: باقی‌مانده و درصد پیشرفت', () => {
    const d: Debt = { id: '1', kind: 'installment', name: 'x', total: 1000, monthly: 100, count: 10, paid: 4 }
    expect(deriveDebt(d)).toEqual({ remainingCount: 6, remainingDebt: 600, progressPercent: 40, status: 'در جریان' })
  })

  it('قسطیِ کاملاً پرداخت‌شده → تسویه‌شده', () => {
    const d: Debt = { id: '1', kind: 'installment', name: 'x', total: 1000, monthly: 100, count: 10, paid: 10 }
    expect(deriveDebt(d)).toMatchObject({ remainingCount: 0, remainingDebt: 0, status: 'تسویه‌شده' })
  })

  it('اگر پرداختی بیش از تعداد باشد، باقی‌مانده منفی نمی‌شود', () => {
    const d: Debt = { id: '1', kind: 'installment', name: 'x', total: 1000, monthly: 100, count: 10, paid: 12 }
    expect(deriveDebt(d).remainingCount).toBe(0)
    expect(deriveDebt(d).remainingDebt).toBe(0)
  })
})

describe('totalRemainingDebt و totalMonthlyInstallment', () => {
  const debts: Debt[] = [
    { id: '1', kind: 'installment', name: 'a', total: 1000, monthly: 100, count: 10, paid: 4 }, // باقی ۶۰۰، ماهانه ۱۰۰
    { id: '2', kind: 'lumpSum', name: 'b', total: 500, dueDate: '2026-01-01', settled: false }, // باقی ۵۰۰، ماهانه ۰
  ]

  it('جمعِ باقی‌ماندهٔ کلِ بدهی‌ها', () => {
    expect(totalRemainingDebt(debts)).toBe(1100)
  })

  it('جمعِ اقساطِ ماهانه (بدهی یکجا صفر لحاظ می‌شود)', () => {
    expect(totalMonthlyInstallment(debts)).toBe(100)
  })
})

describe('computeTax', () => {
  it('مالیاتِ مشمول، مبلغ و کنارگذاریِ ماهانه', () => {
    const r = computeTax({ gross: 1000, deduct: 100, exempt: 200, rate: 10 })
    expect(r.taxable).toBe(700)
    expect(r.taxAmount).toBe(70)
    expect(r.monthlySetAside).toBeCloseTo(70 / 12, 6)
  })

  it('مشمول هرگز منفی نمی‌شود', () => {
    const r = computeTax({ gross: 100, deduct: 200, exempt: 0, rate: 10 })
    expect(r.taxable).toBe(0)
    expect(r.taxAmount).toBe(0)
  })
})
