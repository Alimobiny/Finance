import { describe, it, expect } from 'vitest'
import type { RootState } from '../types'
import { normalizeState } from './normalize'

/** ساختِ یک ورودیِ حداقلی برای normalize با اسکور‌سکشن‌های داده‌شده */
function stateWithSections(titles: string[]): RootState {
  return {
    trading: {
      accounts: [{ id: 'a', name: 'حساب', balance: 0, riskPercent: 1 }],
      activeAccountId: 'a',
      trades: [],
      scoreSections: titles.map((title, i) => ({ id: `s${i}`, title, single: false, options: [] })),
    },
  } as unknown as RootState
}

describe('normalizeState — مهاجرت بخش «وضعیت بازار»', () => {
  it('بخش جا‌افتاده را قبل از «استراتژی» تزریق می‌کند', () => {
    const out = normalizeState(stateWithSections(['تحلیل تایم‌فریم', 'جفت روند', 'استراتژی (یکی را انتخاب کن)']))
    const titles = out.trading.scoreSections.map((s) => s.title)
    expect(titles).toEqual(['تحلیل تایم‌فریم', 'جفت روند', 'وضعیت بازار', 'استراتژی (یکی را انتخاب کن)'])

    // وزن‌های بخش طبق محاسبه‌گر IPS
    const market = out.trading.scoreSections.find((s) => s.title === 'وضعیت بازار')
    expect(market?.options.map((o) => o.weight)).toEqual([5, 7.5, 10, 5])
  })

  it('idempotent است — اجرای دوباره بخش تکراری اضافه نمی‌کند', () => {
    const once = normalizeState(stateWithSections(['تحلیل تایم‌فریم', 'جفت روند', 'استراتژی (یکی را انتخاب کن)']))
    const twice = normalizeState(once)
    expect(twice.trading.scoreSections.filter((s) => s.title === 'وضعیت بازار')).toHaveLength(1)
  })

  it('اگر بخش «استراتژی» نباشد، به انتها اضافه می‌شود', () => {
    const out = normalizeState(stateWithSections(['تحلیل تایم‌فریم', 'جفت روند']))
    const titles = out.trading.scoreSections.map((s) => s.title)
    expect(titles[titles.length - 1]).toBe('وضعیت بازار')
  })
})
