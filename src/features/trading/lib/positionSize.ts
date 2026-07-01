import type { PositionSizeInputs } from '../../../types'

export interface PositionSizeResult {
  riskUsd: number
  lots: number
}

/** محاسبهٔ حجم معامله با ریسک ثابت — واحد فرمولی دلاری، ۱ لات = ۱۰۰ اونس طلا */
export function computePositionSize(inputs: PositionSizeInputs): PositionSizeResult {
  const riskUsd = (inputs.balanceUsd * inputs.riskPercent) / 100
  const lots = inputs.stopUsd > 0 ? riskUsd / (inputs.stopUsd * 100) : 0
  return { riskUsd, lots }
}
