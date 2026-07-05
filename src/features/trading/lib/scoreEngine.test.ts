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

describe('scoreVerdict (سه‌تیری)', () => {
  const threshold = 50
  it('آستانه+۲۰ به بالا → GOOD', () => {
    expect(scoreVerdict(70, threshold).label).toContain('GOOD')
  })
  it('آستانه+۱۰ تا +۲۰ → Normal', () => {
    expect(scoreVerdict(60, threshold).label).toContain('Normal')
  })
  it('زیر آستانه+۱۰ → Risky (بدون تیر چهارم)', () => {
    expect(scoreVerdict(59, threshold).label).toContain('Risky')
    expect(scoreVerdict(40, threshold).label).toContain('Risky')
  })
})

// تطبیق دقیق با Plan Trade3 (Khalagh Academy): تصمیم سه‌تیری با آستانهٔ ۶۰
describe('مطابقت با Plan Trade3 (آستانهٔ ۶۰)', () => {
  const T = 60

  it('مرزها: ≥۸۰ GOOD، ≥۷۰ Normal، زیر ۷۰ Risky', () => {
    expect(scoreVerdict(80, T).label).toContain('GOOD')
    expect(scoreVerdict(70, T).label).toContain('Normal')
    expect(scoreVerdict(69, T).label).toContain('Risky')
    expect(scoreVerdict(60, T).label).toContain('Risky')
  })

  it('مثال دقیق Plan Trade3: تحلیل ۱۷٫۵ + روند ۱۰ + وضعیت ۲۰ + استراتژی ۳۵ = ۸۲٫۵ → GOOD', () => {
    const sections = [
      section(false, [{ weight: 6.25, on: true }, { weight: 5, on: true }, { weight: 3.75, on: true }, { weight: 2.5, on: true }]), // 17.5
      section(false, [{ weight: 5, on: true }, { weight: 5, on: false }, { weight: 5, on: true }]), // 10 (۵min خاموش)
      section(false, [{ weight: 5, on: true }, { weight: 7.5, on: false }, { weight: 10, on: true }, { weight: 5, on: true }]), // 20 (Minor خاموش)
      // استراتژی چندانتخابی و جمع‌شونده: EOW+EOC+EOW+ACD روشن، PA-EOC خاموش = 35
      section(false, [{ weight: 5, on: true }, { weight: 15, on: true }, { weight: 5, on: true }, { weight: 15, on: false }, { weight: 10, on: true }]), // 35
    ]
    expect(totalScore(sections)).toBe(82.5)
    expect(scoreVerdict(82.5, T).label).toContain('GOOD')
  })
})
