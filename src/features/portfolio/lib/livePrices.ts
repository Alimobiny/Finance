import type { PriceKey } from '../../../types'

export interface LivePrices {
  prices: Partial<Record<PriceKey, number>>
  updatedAt: string | null
  source: string | null
}

const KEYS: PriceKey[] = ['usd', 'usdt', 'coin', 'gold18']

/**
 * قیمت‌های لحظه‌ای را از فایل prices.json که یک GitHub Action به‌صورت دوره‌ای
 * تولید می‌کند می‌خواند. same-origin است پس مشکل CORS ندارد؛ no-store هم می‌زنیم
 * تا نسخهٔ کش‌شده برنگردد.
 */
export async function fetchLivePrices(): Promise<LivePrices> {
  const url = `${import.meta.env.BASE_URL}prices.json?t=${Date.now()}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`دریافت قیمت‌ها ناموفق بود (کد ${res.status})`)
  const data = (await res.json()) as { prices?: Record<string, unknown>; updatedAt?: string; source?: string }

  const prices: Partial<Record<PriceKey, number>> = {}
  for (const k of KEYS) {
    const v = Number(data?.prices?.[k])
    if (Number.isFinite(v) && v > 0) prices[k] = v
  }
  return { prices, updatedAt: data?.updatedAt ?? null, source: data?.source ?? null }
}
