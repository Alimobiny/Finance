import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchAndImport } from './autoImport'

function mockFetch(ok: boolean, text: string) {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok, status: ok ? 200 : 500, text: async () => text }) as unknown as Response))
}

afterEach(() => vi.unstubAllGlobals())

const JSONL =
  '{"ticket":1,"symbol":"XAUUSD","type":"buy","openPrice":2400,"initialSL":2397,"closePrice":2415,"profit":75,"riskUsd":300}\n'

describe('fetchAndImport', () => {
  it('معاملاتِ منبع را می‌خواند و به importTrades می‌دهد', async () => {
    mockFetch(true, JSONL)
    const importTrades = vi.fn(() => ({ added: 1, skipped: 0 }))
    const res = await fetchAndImport('https://example.test/feed', importTrades)
    expect(res).toEqual({ added: 1, skipped: 0 })
    expect(importTrades).toHaveBeenCalledOnce()
    // ورودیِ داده‌شده باید ریسکِ واقعیِ EA را داشته باشد
    expect(importTrades.mock.calls[0][0][0].riskUsd).toBe(300)
  })

  it('پاسخِ ناموفق (غیر ۲xx) خطا می‌دهد', async () => {
    mockFetch(false, '')
    await expect(fetchAndImport('https://example.test/feed', vi.fn())).rejects.toThrow()
  })

  it('منبعِ خالی → بدون افزودن و importTrades صدا زده نمی‌شود', async () => {
    mockFetch(true, '   ')
    const importTrades = vi.fn(() => ({ added: 0, skipped: 0 }))
    const res = await fetchAndImport('https://example.test/feed', importTrades)
    expect(res).toEqual({ added: 0, skipped: 0 })
    expect(importTrades).not.toHaveBeenCalled()
  })
})
