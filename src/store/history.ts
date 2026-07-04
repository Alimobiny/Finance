import { newId } from '../lib/format/id'
import type { ChangeAction, HistoryState } from '../types'

/** بیشترین تعداد رکورد تاریخچه که نگه می‌داریم (برای محدود ماندن حجم localStorage/Drive). */
const MAX_HISTORY = 300

/**
 * ثبت یک رویداد در تاریخچهٔ تغییرات. باید داخل یک producer از immer (set) صدا زده شود
 * و `s` همان draft کل استور است (که شامل history می‌شود).
 */
export function recordChange(s: { history: HistoryState }, action: ChangeAction, area: string, label: string): void {
  s.history.entries.unshift({ id: newId(), at: new Date().toISOString(), action, area, label })
  if (s.history.entries.length > MAX_HISTORY) s.history.entries.length = MAX_HISTORY
}
