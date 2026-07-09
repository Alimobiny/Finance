import type { Trade } from '../../../types'
import { computeTradeStats, type TradeStats } from './tradeStats'

export interface GroupStat {
  key: string
  stats: TradeStats
}

/**
 * معاملات را با یک کلید گروه‌بندی و برای هر گروه آمار (نرخ برد، جمع R، Expectancy) حساب می‌کند.
 * گروهِ کلیدِ خالی با برچسبِ emptyLabel می‌آید. خروجی بر اساسِ جمعِ R نزولی مرتب می‌شود.
 */
export function groupTradeStats(trades: Trade[], keyOf: (t: Trade) => string, emptyLabel = 'بدون تگ'): GroupStat[] {
  const map = new Map<string, Trade[]>()
  for (const t of trades) {
    const k = keyOf(t).trim() || emptyLabel
    const arr = map.get(k)
    if (arr) arr.push(t)
    else map.set(k, [t])
  }
  const out: GroupStat[] = []
  for (const [key, group] of map) out.push({ key, stats: computeTradeStats(group) })
  return out.sort((a, b) => b.stats.sumR - a.stats.sumR)
}

/** بندِ امتیازِ ست‌آپ طبق آستانه‌های ۸۰/۷۰ (تصمیمِ سه‌تیریِ IPS). */
export function scoreBand(score: number | null): string {
  if (score == null || !Number.isFinite(score)) return 'بدون امتیاز'
  if (score >= 80) return '≥۸۰ (عالی)'
  if (score >= 70) return '۷۰–۷۹ (خوب)'
  return '<۷۰ (ضعیف)'
}
