import type { TimeAnchor, Trade } from '../../../types'
import { dateComposite, inPeriod, type Period } from './period'
import { addDays, currentStreak, isDoneOn, isScheduledOn } from '../../life/lib/habitStats'

/** معاملاتِ داخلِ یک دورهٔ شمسی (بر اساسِ رشتهٔ تاریخِ شمسیِ هر معامله). */
export function tradesInPeriod(trades: Trade[], period: Period): Trade[] {
  return trades.filter((t) => {
    const c = dateComposite(t.date)
    return c != null && inPeriod(c, period)
  })
}

export interface HabitReportRow {
  id: string
  name: string
  done: number
  expected: number
  rate: number | null // درصدِ انجام در دوره
  streak: number // زنجیرهٔ فعلی (تا امروز)
}

/**
 * گزارشِ عادت‌ها در یک دوره: تعدادِ انجام در برابرِ انتظار (طبقِ زمان‌بندی) و درصد.
 * expected: daily→همهٔ روزها، weekdays→روزهای برنامه‌ای، timesPerWeek→count×هفته‌ها.
 */
export function habitReport(anchors: TimeAnchor[], period: Period): HabitReportRow[] {
  const rows: HabitReportRow[] = anchors.map((a) => {
    let done = 0
    let scheduledDays = 0
    let totalDays = 0
    for (let d = new Date(period.startDate); d.getTime() <= period.endDate.getTime(); d = addDays(d, 1)) {
      totalDays++
      if (isScheduledOn(a.schedule, d)) scheduledDays++
      if (isDoneOn(a, d)) done++
    }
    let expected: number
    if (a.schedule.kind === 'weekdays') expected = scheduledDays
    else if (a.schedule.kind === 'timesPerWeek') expected = a.schedule.count * Math.max(1, Math.round(totalDays / 7))
    else expected = totalDays
    return {
      id: a.id,
      name: a.name,
      done,
      expected,
      rate: expected > 0 ? (done / expected) * 100 : null,
      streak: currentStreak(a),
    }
  })
  return rows.sort((x, y) => (y.rate ?? -1) - (x.rate ?? -1))
}
