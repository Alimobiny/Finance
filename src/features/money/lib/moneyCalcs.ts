import type { Debt, LineItem, TaxInputs } from '../../../types'

export function sumLineItems(items: LineItem[]): number {
  return items.reduce((sum, i) => sum + i.value, 0)
}

export interface DebtDerived {
  remainingCount: number
  remainingDebt: number
  progressPercent: number
  status: 'تسویه‌شده' | 'در جریان' | 'پرداخت‌شده' | 'پرداخت‌نشده'
}

export function deriveDebt(debt: Debt): DebtDerived {
  if (debt.kind === 'lumpSum') {
    return {
      remainingCount: 0,
      remainingDebt: debt.settled ? 0 : debt.total,
      progressPercent: debt.settled ? 100 : 0,
      status: debt.settled ? 'پرداخت‌شده' : 'پرداخت‌نشده',
    }
  }
  const remainingCount = Math.max(debt.count - debt.paid, 0)
  return {
    remainingCount,
    remainingDebt: debt.monthly * remainingCount,
    progressPercent: debt.count > 0 ? (debt.paid / debt.count) * 100 : 0,
    status: remainingCount <= 0 ? 'تسویه‌شده' : 'در جریان',
  }
}

export function totalRemainingDebt(debts: Debt[]): number {
  return debts.reduce((sum, d) => sum + deriveDebt(d).remainingDebt, 0)
}

export function totalMonthlyInstallment(debts: Debt[]): number {
  return debts.reduce((sum, d) => sum + (d.kind === 'lumpSum' ? 0 : d.monthly), 0)
}

export interface TaxResult {
  taxable: number
  taxAmount: number
  monthlySetAside: number
}

export function computeTax(tax: TaxInputs): TaxResult {
  const taxable = Math.max(0, tax.gross - tax.deduct - tax.exempt)
  const taxAmount = (taxable * tax.rate) / 100
  return { taxable, taxAmount, monthlySetAside: taxAmount / 12 }
}
