import { useRootStore } from '../../../store/rootStore'
import type { NewTradeInput } from '../../../store/slices/tradingSlice'
import { parseEaJson } from './importEaJson'
import { getToken } from '../../../lib/sync/gistBackup'

type ImportFn = (inputs: NewTradeInput[]) => { added: number; updated: number; skipped: number }

export interface AutoImportResult {
  added: number
  updated: number
  skipped: number
}

/**
 * متنِ منبعِ خودکار را می‌گیرد. دو حالت:
 *  - «gist:GISTID/filename» → فایلِ EA را از یک Gistِ خصوصی با توکنِ بک‌آپ می‌خواند.
 *    (رایگان، از ایران باز است، و دادهٔ معاملات خصوصی می‌ماند.)
 *  - وگرنه: یک URL ساده که با GET خوانده می‌شود (مثلاً خروجیِ یک وب‌سرویس).
 */
async function fetchEaText(source: string): Promise<string> {
  const url = source.trim()
  if (url.toLowerCase().startsWith('gist:')) {
    const rest = url.slice(5)
    const slash = rest.indexOf('/')
    const gistId = (slash >= 0 ? rest.slice(0, slash) : rest).trim()
    const fileName = slash >= 0 ? rest.slice(slash + 1).trim() : ''
    const token = getToken()
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
    if (token) headers.Authorization = `Bearer ${token}`
    const res = await fetch(`https://api.github.com/gists/${gistId}`, { headers, cache: 'no-store' })
    if (!res.ok) throw new Error(`Gist ${res.status}`)
    const gist = (await res.json()) as { files?: Record<string, { content?: string; truncated?: boolean; raw_url?: string }> }
    const files = gist.files ?? {}
    const file = fileName && files[fileName] ? files[fileName] : Object.values(files)[0]
    if (!file) throw new Error('فایلِ EA در Gist پیدا نشد.')
    // فایل‌های بزرگ (>۱MB) در پاسخِ API بریده می‌شوند؛ محتوای کامل را از raw_url می‌گیریم.
    if (file.truncated && file.raw_url) return await (await fetch(file.raw_url)).text()
    return file.content ?? ''
  }
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.text()
}

/**
 * منبعِ خودکار را می‌گیرد و معاملاتِ جدید را import می‌کند. تکراری‌زدایی/به‌روزرسانی
 * per-ticket داخلِ importTrades انجام می‌شود، پس fetchِ مکرر امن است.
 */
export async function fetchAndImport(url: string, importTrades: ImportFn): Promise<AutoImportResult> {
  const text = await fetchEaText(url)
  const { trades } = parseEaJson(text)
  if (trades.length === 0) return { added: 0, updated: 0, skipped: 0 }
  return importTrades(trades.map((t) => t.input))
}

/** روی بارگذاری اپ: اگر URL تنظیم شده باشد، بی‌صدا معاملاتِ جدید را می‌آورد. */
export async function bootstrapAutoImport(): Promise<void> {
  const state = useRootStore.getState()
  const url = state.settings.autoImportUrl
  if (!url) return
  try {
    await fetchAndImport(url, state.importTrades)
  } catch {
    // منبع/شبکه در دسترس نبود — بی‌صدا رد می‌شویم (کاربر می‌تواند دستی «همگام‌سازی الان» بزند)
  }
}
