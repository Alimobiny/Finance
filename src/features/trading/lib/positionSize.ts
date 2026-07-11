import type { PositionSizeInputs } from '../../../types'

export interface PositionSizeResult {
  riskUsd: number // مبلغِ ریسک = موجودی × ٪ریسک
  riskPerLot: number // ضررِ دلاری اگر ۱ لات بگیری = پیپِ استاپ × ارزشِ هر پیپ
  lots: number // حجمِ پیشنهادی
}

/**
 * حجمِ معامله با ریسکِ ثابت — نمادمستقل و بر اساسِ «پیپ»:
 *   ریسک$ = موجودی × ٪ریسک
 *   ضررِ هر لات = فاصلهٔ استاپ (پیپ) × ارزشِ هر پیپ (دلار، طبق نماد)
 *   حجم(لات) = ریسک$ ÷ ضررِ هر لات
 * (فرمولِ Plan Trade3: Lot = ریسک$ ÷ StopLoss، که StopLoss همان ضررِ هر لات است.)
 */
export function computePositionSize(inputs: PositionSizeInputs): PositionSizeResult {
  const riskUsd = (inputs.balanceUsd * inputs.riskPercent) / 100
  const riskPerLot = inputs.stopPips * inputs.pipValuePerLot
  const lots = riskPerLot > 0 && riskUsd > 0 ? riskUsd / riskPerLot : 0
  return { riskUsd: riskUsd > 0 ? riskUsd : 0, riskPerLot, lots }
}

/** پریستِ ارزشِ هر پیپ (دلار، به‌ازای ۱ لاتِ استاندارد) — نقطهٔ شروع؛ در UI قابلِ ویرایش. */
export interface PipPreset {
  label: string
  pipValue: number
  note: string
}

export const PIP_PRESETS: PipPreset[] = [
  { label: 'فارکس — مظنهٔ USD (EURUSD, GBPUSD, AUDUSD…)', pipValue: 10, note: '۱ پیپ=۰٫۰۰۰۱ · ۱ لات=۱۰۰٬۰۰۰' },
  { label: 'فارکس — جفت‌های ین (USDJPY, GBPJPY…)', pipValue: 9.1, note: '۱ پیپ=۰٫۰۱ · به نرخِ ین وابسته، تنظیم کن' },
  { label: 'طلا XAUUSD', pipValue: 10, note: '۱ پیپ=۰٫۱ · ۱ لات=۱۰۰ اونس' },
  { label: 'نقره XAGUSD', pipValue: 25, note: '۱ لات=۵۰۰۰ اونس · بسته به بروکر تنظیم کن' },
  { label: 'سفارشی', pipValue: 0, note: 'ارزشِ هر پیپ را خودت وارد کن' },
]
