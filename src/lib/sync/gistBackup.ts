import { useRootStore, applyRemoteState } from '../../store/rootStore'
import { buildSnapshot } from '../../store/persistence'
import type { RootState } from '../../types'
import { encryptString, decryptString, isEncryptedBlob } from '../crypto/secureBlob'

// بک‌آپِ دستی روی یک GitHub Gistِ خصوصی — چون گیت‌هاب از ایران باز است و CORS دارد.
// همهٔ بک‌آپ‌ها در یک gist (هر بک‌آپ = یک فایلِ زمان‌دار) جمع می‌شوند تا بین دستگاه‌ها
// مشترک باشند (با description پیدا می‌شود). اپ هیچ‌وقت خودکار بک‌آپ/بازیابی نمی‌کند.
//
// توکن و شناسهٔ gist جدا از دادهٔ اپ در localStorage نگه داشته می‌شوند تا داخلِ خودِ
// بک‌آپ‌ها (RootState) لو نروند.

const API = 'https://api.github.com/gists'
const GIST_DESC = 'Qotbnama backups — قطب‌نما پشتیبان'
const TOKEN_KEY = 'qotbnama:gistToken'
const GIST_ID_KEY = 'qotbnama:gistId'
/** پشتیبانِ ایمنیِ محلی پیش از هر بازیابی (تا بازیابیِ اشتباه برگشت‌پذیر بماند). */
const PRE_RESTORE_KEY = 'qotbnama:preRestoreBackup'

// ---- توکن و شناسهٔ gist (محلی، جدا از دادهٔ اپ) ----
export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? ''
}
export function setToken(t: string): void {
  const v = t.trim()
  if (v) localStorage.setItem(TOKEN_KEY, v)
  else localStorage.removeItem(TOKEN_KEY)
}
export function isConfigured(): boolean {
  return !!getToken()
}
function getStoredGistId(): string {
  return localStorage.getItem(GIST_ID_KEY) ?? ''
}
function setStoredGistId(id: string): void {
  localStorage.setItem(GIST_ID_KEY, id)
}

// ---- کمکی‌های خالص ----
export function backupFileName(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `qotbnama-backup-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}.json`
}

export function isValidRootState(value: unknown): value is RootState {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return ['meta', 'dashboard', 'portfolio', 'trading', 'money', 'life', 'settings'].every((k) => k in v)
}

/** نامِ فایل‌های بک‌آپ را نزولی (تازه‌ترین اول) مرتب می‌کند — چون نام شامل زمان است. */
export function sortBackupNames(names: string[]): string[] {
  return [...names].filter((n) => n.endsWith('.json')).sort((a, b) => b.localeCompare(a))
}

// ---- ارتباط با GitHub ----
interface GistFile {
  filename?: string
  content?: string
  truncated?: boolean
  raw_url?: string
}
interface Gist {
  id: string
  description: string | null
  files: Record<string, GistFile>
}

function ghHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
}

async function ghError(res: Response, fallback: string): Promise<Error> {
  if (res.status === 401) return new Error('توکن گیت‌هاب نامعتبر است یا دسترسی gist ندارد.')
  return new Error(`${fallback} (کد ${res.status})`)
}

/** شناسهٔ gistِ بک‌آپ را پیدا می‌کند: ذخیره‌شده، یا با description در gistهای کاربر. */
async function resolveGistId(token: string): Promise<string> {
  const stored = getStoredGistId()
  if (stored) return stored
  const res = await fetch(`${API}?per_page=100`, { headers: ghHeaders(token) })
  if (!res.ok) throw await ghError(res, 'خواندن فهرست Gist ناموفق بود')
  const gists = (await res.json()) as Array<{ id: string; description: string | null }>
  const found = gists.find((g) => g.description === GIST_DESC)?.id ?? ''
  if (found) setStoredGistId(found)
  return found
}

/**
 * بک‌آپِ الان: اگر gist نبود می‌سازد، وگرنه فایلِ زمان‌دار اضافه می‌کند. نامِ فایل را برمی‌گرداند.
 * اگر عبارت‌عبور داده شود، اسنپ‌شات پیش از رفتن به گیت‌هاب با AES-GCM رمز می‌شود تا دادهٔ
 * مالی به‌صورت متنِ ساده روی سرورِ ثالث ذخیره نشود. عبارت‌عبور هیچ‌جا نگه داشته نمی‌شود.
 */
export async function backupNow(passphrase?: string): Promise<string> {
  const token = getToken()
  if (!token) throw new Error('اول توکن گیت‌هاب را وارد کن.')
  const name = backupFileName()
  const snapshot = JSON.stringify(buildSnapshot(useRootStore.getState()))
  const pass = passphrase?.trim()
  const content = pass ? JSON.stringify(await encryptString(snapshot, pass)) : snapshot
  const gistId = await resolveGistId(token)

  if (gistId) {
    const res = await fetch(`${API}/${gistId}`, {
      method: 'PATCH',
      headers: { ...ghHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: { [name]: { content } } }),
    })
    if (!res.ok) throw await ghError(res, 'به‌روزرسانی Gist ناموفق بود')
  } else {
    const res = await fetch(API, {
      method: 'POST',
      headers: { ...ghHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: GIST_DESC, public: false, files: { [name]: { content } } }),
    })
    if (!res.ok) throw await ghError(res, 'ساخت Gist ناموفق بود')
    setStoredGistId(((await res.json()) as Gist).id)
  }
  useRootStore.getState().setLastSyncedAt(new Date().toISOString())
  return name
}

/** فهرستِ بک‌آپ‌ها (نامِ فایل‌های داخلِ gist)، تازه‌ترین اول. */
export async function listBackups(): Promise<string[]> {
  const token = getToken()
  if (!token) throw new Error('اول توکن گیت‌هاب را وارد کن.')
  const gistId = await resolveGistId(token)
  if (!gistId) return []
  const res = await fetch(`${API}/${gistId}`, { headers: ghHeaders(token) })
  if (!res.ok) throw await ghError(res, 'خواندن Gist ناموفق بود')
  const gist = (await res.json()) as Gist
  return sortBackupNames(Object.keys(gist.files))
}

/**
 * بازیابیِ دستیِ یک بک‌آپ (با نامِ فایل). پیش از بازنویسی، پشتیبانِ ایمنیِ محلی نگه می‌دارد.
 * اگر بک‌آپ رمزنگاری‌شده باشد، با عبارت‌عبور بازش می‌کند؛ بک‌آپ‌های قدیمیِ ساده هم پشتیبانی می‌شوند.
 */
export async function restoreBackup(fileName: string, passphrase?: string): Promise<void> {
  const token = getToken()
  if (!token) throw new Error('اول توکن گیت‌هاب را وارد کن.')
  const gistId = await resolveGistId(token)
  if (!gistId) throw new Error('هیچ بک‌آپی پیدا نشد.')
  const res = await fetch(`${API}/${gistId}`, { headers: ghHeaders(token) })
  if (!res.ok) throw await ghError(res, 'خواندن Gist ناموفق بود')
  const gist = (await res.json()) as Gist
  const file = gist.files[fileName]
  if (!file) throw new Error('این بک‌آپ پیدا نشد.')

  // فایل‌های بزرگ (>۱MB) در پاسخِ API بریده می‌شوند؛ محتوای کامل را از raw_url می‌گیریم.
  let content = file.content ?? ''
  if (file.truncated && file.raw_url) content = await (await fetch(file.raw_url)).text()

  // اگر رمزنگاری‌شده بود، اول بازگشایی؛ وگرنه همان محتوا. اعتبارسنجی همیشه بعد از بازگشایی.
  const outer: unknown = JSON.parse(content)
  let parsed: unknown = outer
  if (isEncryptedBlob(outer)) {
    const pass = passphrase?.trim()
    if (!pass) throw new Error('این بک‌آپ رمزنگاری‌شده است — عبارت‌عبور را وارد کن.')
    parsed = JSON.parse(await decryptString(outer, pass))
  }
  if (!isValidRootState(parsed)) throw new Error('این فایل یک بک‌آپِ معتبرِ قطب‌نما نیست.')
  try {
    localStorage.setItem(PRE_RESTORE_KEY, JSON.stringify(buildSnapshot(useRootStore.getState())))
  } catch {
    // اگر localStorage پر بود هم بازیابی را ادامه می‌دهیم
  }
  applyRemoteState(parsed)
}
