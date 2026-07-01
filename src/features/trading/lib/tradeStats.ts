import type { Trade } from '../../../types'

export interface TradeStats {
  count: number
  wins: number
  losses: number
  breakeven: number
  sumR: number
  expectancy: number | null
  winRate: number | null
  rule1Rate: number | null
  checklistRate: number | null
}

export function computeTradeStats(trades: Trade[]): TradeStats {
  const withR = trades.filter((t) => t.r != null)
  const sumR = withR.reduce((acc, t) => acc + (t.r ?? 0), 0)

  const wins = trades.filter((t) => t.outcome === 'win' || (!t.outcome && (t.r ?? 0) > 0)).length
  const losses = trades.filter((t) => t.outcome === 'loss' || (!t.outcome && (t.r ?? 0) < 0)).length
  const breakeven = trades.filter((t) => t.outcome === 'be').length
  const decided = wins + losses

  const rule1Rated = trades.filter((t) => t.rule1Followed !== undefined)
  const checklistRated = trades.filter((t) => t.checklistFollowed !== undefined)

  return {
    count: trades.length,
    wins,
    losses,
    breakeven,
    sumR,
    expectancy: withR.length ? sumR / withR.length : null,
    winRate: decided ? (wins / decided) * 100 : null,
    rule1Rate: rule1Rated.length ? (rule1Rated.filter((t) => t.rule1Followed).length / rule1Rated.length) * 100 : null,
    checklistRate: checklistRated.length
      ? (checklistRated.filter((t) => t.checklistFollowed).length / checklistRated.length) * 100
      : null,
  }
}
