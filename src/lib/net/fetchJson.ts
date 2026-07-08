// لایهٔ نازک روی fetch: مهلتِ زمانی (timeout)، خطای معنادار، و بازگشتِ اختیاری
// به آخرین نسخهٔ سالمِ کش‌شده وقتی شبکه در دسترس نیست.

export interface FetchJsonResult<T> {
  data: T
  fromCache: boolean // آیا از کشِ محلی برگشت (چون شبکه شکست خورد)؟
}

export async function fetchJson<T>(
  url: string,
  opts: { timeoutMs?: number; cacheKey?: string } = {},
): Promise<FetchJsonResult<T>> {
  const { timeoutMs = 8000, cacheKey } = opts
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal })
    if (!res.ok) throw new Error(`درخواست ناموفق بود (کد ${res.status})`)
    const data = (await res.json()) as T
    if (cacheKey) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data))
      } catch {
        // پر بودنِ localStorage نباید مانعِ برگرداندنِ دادهٔ تازه شود.
      }
    }
    return { data, fromCache: false }
  } catch (err) {
    if (cacheKey) {
      try {
        const raw = localStorage.getItem(cacheKey)
        if (raw) return { data: JSON.parse(raw) as T, fromCache: true }
      } catch {
        // کشِ خراب را نادیده بگیر و خطای اصلی را بالا بده.
      }
    }
    if (controller.signal.aborted) throw new Error('اتصال کند بود؛ دوباره تلاش کن.')
    throw err instanceof Error ? err : new Error('خطای شبکه')
  } finally {
    clearTimeout(timer)
  }
}
