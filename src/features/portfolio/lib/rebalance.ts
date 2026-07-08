import type { PortfolioState } from '../../../types'
import { holdingValue, portfolioTotal } from './computeHoldingValue'

/** یک ردیفِ تعادل: وضعِ فعلی در برابر هدف، و مبلغِ لازم برای رسیدن به هدف. */
export interface RebalanceRow {
  id: string
  name: string
  color: string
  value: number // ارزشِ فعلیِ دسته
  actualPercent: number // ٪ فعلی از کلِ پرتفولیو
  targetPercent: number // ٪ هدف
  targetValue: number // مبلغِ هدف = کل × ٪هدف
  delta: number // مبلغِ هدف − ارزشِ فعلی (+ یعنی «بخر»، − یعنی «بفروش»)
}

export interface RebalanceResult {
  total: number
  targetSum: number // جمعِ ٪هدف‌ها (باید ۱۰۰ باشد)
  rows: RebalanceRow[]
}

/**
 * برای هر دسته: مبلغِ هدف و اختلافِ «بخر/بفروش» را حساب می‌کند تا سبد به تخصیصِ
 * هدف برسد. تابعِ خالص و تست‌پذیر — همان منطقِ اکسلِ حسابرسی، اما مبلغی.
 */
export function computeRebalance(portfolio: PortfolioState): RebalanceResult {
  const total = portfolioTotal(portfolio)
  const targetSum = portfolio.holdings.reduce((s, h) => s + (Number.isFinite(h.target) ? h.target : 0), 0)
  const rows: RebalanceRow[] = portfolio.holdings.map((h) => {
    const value = holdingValue(h, portfolio.prices)
    const targetPercent = Number.isFinite(h.target) ? h.target : 0
    const targetValue = Math.round((total * targetPercent) / 100)
    return {
      id: h.id,
      name: h.name,
      color: h.color,
      value,
      actualPercent: total > 0 ? (value / total) * 100 : 0,
      targetPercent,
      targetValue,
      delta: targetValue - value,
    }
  })
  return { total, targetSum, rows }
}
