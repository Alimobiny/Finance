import type { ScoreSection } from '../../../types'

export interface ScoreSectionResult {
  sum: number
  max: number
}

export function scoreSectionResult(section: ScoreSection): ScoreSectionResult {
  const sum = section.options.reduce((acc, o) => acc + (o.on ? o.weight : 0), 0)
  const max = section.single ? Math.max(0, ...section.options.map((o) => o.weight)) : section.options.reduce((acc, o) => acc + o.weight, 0)
  return { sum, max }
}

export function totalScore(sections: ScoreSection[]): number {
  return sections.reduce((acc, sec) => acc + scoreSectionResult(sec).sum, 0)
}

export interface ScoreVerdict {
  label: string
  color: string
  bg: string
}

export function scoreVerdict(total: number, threshold: number): ScoreVerdict {
  if (total >= threshold + 20) return { label: 'ورود مجاز — کیفیت بالا', color: 'var(--accent-green)', bg: 'var(--accent-green-soft)' }
  if (total >= threshold + 10) return { label: 'ورود مجاز — معمولی', color: 'var(--accent-teal)', bg: 'var(--accent-green-soft)' }
  if (total >= threshold) return { label: 'ورود با احتیاط', color: '#7D6608', bg: '#FEFBF0' }
  return { label: 'وارد نشو — کیفیت پایین', color: 'var(--accent-red-strong)', bg: 'var(--accent-red-soft)' }
}
