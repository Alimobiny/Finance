import { requestAccessToken, clearCachedToken, isDriveConfigured } from './gisLoader'
import { useRootStore, applyRemoteState } from '../../store/rootStore'
import { buildSnapshot } from '../../store/persistence'
import type { RootState } from '../../types'

// بک‌آپِ دستی روی یک پوشهٔ «قابل‌مشاهده» در Google Drive. برخلاف نسخهٔ قبلی، اپ
// هیچ‌وقت خودکار بک‌آپ/بازیابی نمی‌کند — همه با دکمه و تأییدِ کاربر است. هر بازیابی
// پیش از بازنویسی، یک پشتیبانِ ایمنیِ محلی نگه می‌دارد.

const SIGNED_IN_KEY = 'qotbnama:driveSignedIn'
const FOLDER_NAME = 'قطب‌نما — پشتیبان'
/** پشتیبانِ ایمنیِ محلی پیش از هر بازیابی (تا بازیابیِ اشتباه برگشت‌پذیر بماند). */
const PRE_RESTORE_KEY = 'qotbnama:preRestoreBackup'

const FILES_URL = 'https://www.googleapis.com/drive/v3/files'
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files'
const FOLDER_MIME = 'application/vnd.google-apps.folder'

export { isDriveConfigured }

export function isSignedIn(): boolean {
  return localStorage.getItem(SIGNED_IN_KEY) === '1'
}
function setSignedIn(v: boolean): void {
  if (v) localStorage.setItem(SIGNED_IN_KEY, '1')
  else localStorage.removeItem(SIGNED_IN_KEY)
}

/** نامِ فایلِ بک‌آپ با تاریخ و ساعتِ محلی (مثلاً qotbnama-backup-2026-07-05_14-30.json). */
export function backupFileName(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `qotbnama-backup-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}.json`
}

/** بررسیِ سرسختانه که محتوای بازیابی یک RootState معتبر است (نه فایلِ نامربوط). */
export function isValidRootState(value: unknown): value is RootState {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return ['meta', 'dashboard', 'portfolio', 'trading', 'money', 'life', 'settings'].every((k) => k in v)
}

export async function signIn(): Promise<void> {
  await requestAccessToken({ silent: false })
  setSignedIn(true)
}
export function signOut(): void {
  setSignedIn(false)
  clearCachedToken()
}

async function token(): Promise<string> {
  const t = await requestAccessToken({ silent: !!isSignedIn() })
  setSignedIn(true)
  return t
}

async function driveList(t: string, q: string, fields: string, orderBy?: string): Promise<Array<Record<string, string>>> {
  const params = new URLSearchParams({ q, fields: `files(${fields})`, pageSize: '1000' })
  if (orderBy) params.set('orderBy', orderBy)
  const res = await fetch(`${FILES_URL}?${params.toString()}`, { headers: { Authorization: `Bearer ${t}` } })
  if (!res.ok) throw new Error('خواندن فهرست از Drive ناموفق بود')
  const data = (await res.json()) as { files?: Array<Record<string, string>> }
  return data.files ?? []
}

async function ensureFolder(t: string): Promise<string> {
  const q = `name='${FOLDER_NAME}' and mimeType='${FOLDER_MIME}' and trashed=false`
  const found = await driveList(t, q, 'id')
  if (found[0]?.id) return found[0].id
  const res = await fetch(FILES_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: FOLDER_MIME }),
  })
  if (!res.ok) throw new Error('ساخت پوشهٔ پشتیبان در Drive ناموفق بود')
  return ((await res.json()) as { id: string }).id
}

export interface BackupRef {
  id: string
  name: string
  createdTime: string
}

/** ساختِ یک فایلِ بک‌آپِ زمان‌دار در پوشه. نامِ فایل را برمی‌گرداند. */
export async function backupNow(): Promise<string> {
  const t = await token()
  const folderId = await ensureFolder(t)
  const name = backupFileName()
  const content = JSON.stringify(buildSnapshot(useRootStore.getState()))
  const boundary = 'qn' + Date.now()
  const metadata = { name, parents: [folderId] }
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}\r\n--${boundary}--`
  const res = await fetch(`${UPLOAD_URL}?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  })
  if (!res.ok) throw new Error('ساخت فایلِ بک‌آپ در Drive ناموفق بود')
  useRootStore.getState().setLastSyncedAt(new Date().toISOString())
  return name
}

/** فهرستِ بک‌آپ‌های موجود در پوشه، تازه‌ترین اول. */
export async function listBackups(): Promise<BackupRef[]> {
  const t = await token()
  const folderId = await ensureFolder(t)
  const files = await driveList(t, `'${folderId}' in parents and trashed=false`, 'id,name,createdTime', 'createdTime desc')
  return files as unknown as BackupRef[]
}

/**
 * بازیابیِ دستیِ یک بک‌آپ. پیش از بازنویسی، حالتِ فعلی را در یک کلیدِ محلی نگه
 * می‌دارد تا اگر اشتباه شد، برگشت‌پذیر باشد.
 */
export async function restoreBackup(fileId: string): Promise<void> {
  const t = await token()
  const res = await fetch(`${FILES_URL}/${fileId}?alt=media`, { headers: { Authorization: `Bearer ${t}` } })
  if (!res.ok) throw new Error('دانلود بک‌آپ از Drive ناموفق بود')
  const parsed: unknown = JSON.parse(await res.text())
  if (!isValidRootState(parsed)) throw new Error('این فایل یک بک‌آپِ معتبرِ قطب‌نما نیست')
  try {
    localStorage.setItem(PRE_RESTORE_KEY, JSON.stringify(buildSnapshot(useRootStore.getState())))
  } catch {
    // اگر localStorage پر بود هم بازیابی را ادامه می‌دهیم
  }
  applyRemoteState(parsed)
}
