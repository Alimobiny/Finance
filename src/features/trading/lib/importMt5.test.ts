import { describe, it, expect } from 'vitest'
import { sanePlannedRR } from './importMt5'

describe('sanePlannedRR — سقفِ R:R واردشده', () => {
  it('R:R منطقی را برمی‌گرداند', () => {
    // ورود ۱۰۰، استاپ ۹۰ (ریسک ۱۰)، حدسود ۱۳۰ → ۳
    expect(sanePlannedRR(100, 90, 130)).toBe(3)
  })

  it('دقیقاً ۱۰ هنوز منطقی است', () => {
    expect(sanePlannedRR(100, 90, 200)).toBe(10)
  })

  it('R:Rِ کاذبِ ناشی از استاپِ تریل‌شده (بزرگ‌تر از ۱۰) را null می‌کند', () => {
    // استاپ به نزدیک ورود تریل شده: |۰٫۹−۰٫۸۹۹۸|=۰٫۰۰۰۲ و |۰٫۹۳−۰٫۹|=۰٫۰۳ → ۱۵۰
    expect(sanePlannedRR(0.9, 0.8998, 0.93)).toBeNull()
  })

  it('ورودی ناقص → null', () => {
    expect(sanePlannedRR(100, null, 130)).toBeNull()
  })
})
