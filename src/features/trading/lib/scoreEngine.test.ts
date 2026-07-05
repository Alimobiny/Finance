import { describe, it, expect } from 'vitest'
import type { ScoreSection } from '../../../types'
import { scoreSectionResult, totalScore, scoreVerdict } from './scoreEngine'

const section = (single: boolean, options: Array<{ weight: number; on: boolean }>): ScoreSection => ({
  id: 's',
  title: 't',
  single,
  options: options.map((o, i) => ({ id: `o${i}`, label: `o${i}`, weight: o.weight, on: o.on })),
})

describe('scoreSectionResult', () => {
  it('بخش چندگزینه‌ای: مجموعِ فعال‌ها و بیشینهٔ جمعِ همه', () => {
    const r = scoreSectionResult(section(false, [{ weight: 5, on: true }, { weight: 3, on: false }, { weight: 2, on: true }]))
    expect(r).toEqual({ sum: 7, max: 10 })
  })

  it('بخش تک‌گزینه‌ای: بیشینه فقط بزرگ‌ترین وزن است', () => {
    const r = scoreSectionResult(section(true, [{ weight: 5, on: true }, { weight: 8, on: false }]))
    expect(r).toEqual({ sum: 5, max: 8 })
  })

  it('بخش تک‌گزینه‌ای بدون گزینهٔ فعال: مجموع صفر', () => {
    const r = scoreSectionResult(section(true, [{ weight: 5, on: false }, { weight: 8, on: false }]))
    expect(r.sum).toBe(0)
    expect(r.max).toBe(8)
  })
})

describe('totalScore', () => {
  it('مجموعِ امتیازِ فعالِ همهٔ بخش‌ها', () => {
    const secs = [
      section(false, [{ weight: 5, on: true }, { weight: 2, on: true }]),
      section(true, [{ weight: 10, on: true }, { weight: 4, on: false }]),
    ]
    expect(totalScore(secs)).toBe(17)
  })
})

describe('scoreVerdict', () => {
  const threshold = 50
  it('آستانه+۲۰ به بالا → کیفیت بالا', () => {
    expect(scoreVerdict(70, threshold).label).toBe('ورود مجاز — کیفیت بالا')
  })
  it('آستانه+۱۰ تا +۲۰ → معمولی', () => {
    expect(scoreVerdict(60, threshold).label).toBe('ورود مجاز — معمولی')
  })
  it('بین آستانه و آستانه+۱۰ → با احتیاط', () => {
    expect(scoreVerdict(55, threshold).label).toBe('ورود با احتیاط')
  })
  it('زیر آستانه → وارد نشو', () => {
    expect(scoreVerdict(49, threshold).label).toBe('وارد نشو — کیفیت پایین')
  })
})
