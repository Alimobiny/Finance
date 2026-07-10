import { useRootStore } from '../../../store/rootStore'
import type { NewTradeInput } from '../../../store/slices/tradingSlice'
import { parseEaJson } from './importEaJson'

type ImportFn = (inputs: NewTradeInput[]) => { added: number; updated: number; skipped: number }

export interface AutoImportResult {
  added: number
  updated: number
  skipped: number
}

/**
 * URLِ منبعِ خودکار (خروجیِ Apps Script که EA به آن می‌نویسد) را fetch می‌کند و
 * معاملاتِ جدید را import می‌کند. تکراری‌زدایی per-ticket داخلِ importTrades انجام
 * می‌شود، پس fetchِ مکرر امن است و فقط معاملاتِ جدید اضافه می‌شوند.
 */
export async function fetchAndImport(url: string, importTrades: ImportFn): Promise<AutoImportResult> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
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
