import type { Trade } from '../../../types'
import { hasR, resolveOutcome } from './tradeOutcome'

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
  const withR = trades.filter(hasR)
  const sumR = withR.reduce((acc, t) => acc + t.r, 0)

  // برد/باخت/سربه‌سر از همان منبع حقیقتی گرفته می‌شود که ستون «نتیجه» جدول
  // استفاده می‌کند، تا جمع R و نرخ برد هرگز با هم تناقض نداشته باشند.
  let wins = 0
  let losses = 0
  let breakeven = 0
  for (const t of trades) {
    const o = resolveOutcome(t)
    if (o === 'win') wins++
    else if (o === 'loss') losses++
    else if (o === 'be') breakeven++
  }
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
