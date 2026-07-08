import type { PriceKey } from '../../../types'
import { fetchJson } from '../../../lib/net/fetchJson'

export interface LivePrices {
  prices: Partial<Record<PriceKey, number>>
  updatedAt: string | null
  source: string | null
  fromCache: boolean // اگر شبکه شکست خورد و آخرین نسخهٔ ذخیره‌شده برگشت
}

interface PricesFile {
  prices?: Record<string, unknown>
  updatedAt?: string
  source?: string
}

const KEYS: PriceKey[] = ['usd', 'usdt', 'coin', 'gold18']
const CACHE_KEY = 'qotbnama:livePricesCache'

/**
 * قیمت‌های لحظه‌ای را از فایل prices.json که یک GitHub Action به‌صورت دوره‌ای
 * تولید می‌کند می‌خواند. same-origin است پس مشکل CORS ندارد. با مهلتِ زمانی
 * (تا روی شبکهٔ کند بی‌نهایت منتظر نماند) و بازگشت به آخرین نسخهٔ سالمِ ذخیره‌شده.
 */
export async function fetchLivePrices(): Promise<LivePrices> {
  const url = `${import.meta.env.BASE_URL}prices.json?t=${Date.now()}`
  const { data, fromCache } = await fetchJson<PricesFile>(url, { timeoutMs: 8000, cacheKey: CACHE_KEY })

  const prices: Partial<Record<PriceKey, number>> = {}
  for (const k of KEYS) {
    const v = Number(data?.prices?.[k])
    if (Number.isFinite(v) && v > 0) prices[k] = v
  }
  return { prices, updatedAt: data?.updatedAt ?? null, source: data?.source ?? null, fromCache }
}
