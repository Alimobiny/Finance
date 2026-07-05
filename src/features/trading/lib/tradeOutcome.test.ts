import { describe, it, expect } from 'vitest'
import { hasR, resolveOutcome } from './tradeOutcome'

describe('hasR', () => {
  it('فقط عددِ متناهی را R معتبر می‌شمارد', () => {
    expect(hasR({ r: 2 })).toBe(true)
    expect(hasR({ r: 0 })).toBe(true)
    expect(hasR({ r: null })).toBe(false)
    expect(hasR({ r: NaN })).toBe(false)
    expect(hasR({ r: Infinity })).toBe(false)
  })
})

describe('resolveOutcome', () => {
  it('وقتی R معتبر است، نتیجه از علامتِ R می‌آید و نتیجهٔ دستی نادیده گرفته می‌شود', () => {
    expect(resolveOutcome({ r: 2, outcome: 'loss' })).toBe('win')
    expect(resolveOutcome({ r: -1, outcome: 'win' })).toBe('loss')
    expect(resolveOutcome({ r: 0, outcome: 'win' })).toBe('be')
  })

  it('وقتی R ثبت نشده، به نتیجهٔ دستی کاربر برمی‌گردد', () => {
    expect(resolveOutcome({ r: null, outcome: 'win' })).toBe('win')
    expect(resolveOutcome({ r: null, outcome: '' })).toBe('')
  })
})
