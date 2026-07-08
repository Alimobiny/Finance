import { useRootStore, applyRemoteState } from '../../store/rootStore'
import { buildSnapshot } from '../../store/persistence'
import type { RootState } from '../../types'
import { jalaaliFileStamp } from '../format/date'

/**
 * دانلود دستی کل داده به‌صورت یک فایل JSON — چون appDataFolder در Drive
 * برای کاربر در فضای عادی Drive دیده نمی‌شود، این تنها راه دیدن/پشتیبان‌گیری
 * دستیِ داده خارج از خودِ اپ است.
 */
export function downloadBackup(): void {
  const snapshot = buildSnapshot(useRootStore.getState())
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `qotbnama-backup-${jalaaliFileStamp()}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

function isValidRootState(value: unknown): value is RootState {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return ['meta', 'dashboard', 'portfolio', 'trading', 'life', 'settings'].every((key) => key in v)
}

export async function restoreFromFile(file: File): Promise<void> {
  const text = await file.text()
  const parsed: unknown = JSON.parse(text)
  if (!isValidRootState(parsed)) throw new Error('فایل پشتیبان معتبر نیست')
  applyRemoteState(parsed)
}

export async function restoreFromText(text: string): Promise<void> {
  const parsed: unknown = JSON.parse(text)
  if (!isValidRootState(parsed)) throw new Error('متن معتبر نیست')
  applyRemoteState(parsed)
}
