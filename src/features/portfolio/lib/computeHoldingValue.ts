import type { Holding, PortfolioState } from '../../../types'

export function subValue(sub: Holding['subs'][number], prices: PortfolioState['prices']): number {
  if (sub.kind === 'manual') return sub.value
  return sub.qty * (prices[sub.unit] || 0)
}

export function holdingValue(holding: Holding, prices: PortfolioState['prices']): number {
  return holding.subs.reduce((sum, sub) => sum + subValue(sub, prices), 0)
}

export function portfolioTotal(portfolio: PortfolioState): number {
  return portfolio.holdings.reduce((sum, h) => sum + holdingValue(h, portfolio.prices), 0)
}
