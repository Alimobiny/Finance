import type { Holding, PortfolioState } from '../../../types'
import { holdingValue, portfolioTotal } from './computeHoldingValue'
import { faPercent } from '../../../lib/format/number'

export interface HoldingRowStats {
  value: number
  actualPercent: number
  deviation: number
  status: 'متعادل' | 'کم‌وزن' | 'پروزن' | '—'
}

export function holdingRowStats(holding: Holding, portfolio: PortfolioState): HoldingRowStats {
  const total = portfolioTotal(portfolio)
  const value = holdingValue(holding, portfolio.prices)
  if (total <= 0) return { value, actualPercent: 0, deviation: 0, status: '—' }
  const actualPercent = (value / total) * 100
  const deviation = actualPercent - holding.target
  const status = deviation > 5 ? 'پروزن' : deviation < -5 ? 'کم‌وزن' : 'متعادل'
  return { value, actualPercent, deviation, status }
}

export function rebalanceSuggestions(portfolio: PortfolioState): string[] {
  const total = portfolioTotal(portfolio)
  if (total <= 0) return []
  const suggestions: string[] = []
  for (const h of portfolio.holdings) {
    const { deviation } = holdingRowStats(h, portfolio)
    if (deviation < -5) suggestions.push(`«${h.name}» حدود ${faPercent(Math.abs(deviation))} کم‌وزن است — با مازاد درآمد تقویت کن.`)
  }
  for (const h of portfolio.holdings) {
    const { deviation } = holdingRowStats(h, portfolio)
    if (deviation > 5 && h.layer !== 'دفاعی') suggestions.push(`«${h.name}» حدود ${faPercent(deviation)} پروزن است — در بازبینی سه‌ماهه بخشی را برای تعادل بردار.`)
  }
  return suggestions
}

export function defensivePercent(portfolio: PortfolioState): number {
  const total = portfolioTotal(portfolio)
  if (total <= 0) return 0
  const defensiveValue = portfolio.holdings.filter((h) => h.layer === 'دفاعی').reduce((sum, h) => sum + holdingValue(h, portfolio.prices), 0)
  return (defensiveValue / total) * 100
}

export function biggestDeviationLabel(portfolio: PortfolioState): string {
  const total = portfolioTotal(portfolio)
  if (total <= 0) return '—'
  let max = 0
  let name = '—'
  for (const h of portfolio.holdings) {
    const { deviation } = holdingRowStats(h, portfolio)
    if (Math.abs(deviation) > Math.abs(max)) {
      max = deviation
      name = h.name
    }
  }
  if (name === '—') return '—'
  return `${name} (${max > 0 ? '+' : '−'}${faPercent(Math.abs(max))})`
}

export function targetSum(portfolio: PortfolioState): number {
  return portfolio.holdings.reduce((sum, h) => sum + h.target, 0)
}
