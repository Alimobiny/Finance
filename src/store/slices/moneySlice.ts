import type { StateCreator } from 'zustand'
import type { RootStore, Mutators } from '../rootStoreType'
import { newId } from '../../lib/format/id'
import type { Debt, MoneyState, TaxInputs } from '../../types'

export interface MoneySlice {
  money: MoneyState

  setEmergencyTarget: (value: number) => void
  setEmergencyCurrent: (value: number) => void

  addIncome: () => void
  updateIncome: (id: string, patch: { label?: string; value?: number }) => void
  removeIncome: (id: string) => void

  addExpense: () => void
  updateExpense: (id: string, patch: { label?: string; value?: number }) => void
  removeExpense: (id: string) => void

  addDebt: (kind: Debt['kind']) => void
  updateDebt: (id: string, patch: Record<string, unknown>) => void
  toggleDebtSettled: (id: string) => void
  payInstallment: (id: string) => void
  unpayInstallment: (id: string) => void
  removeDebt: (id: string) => void

  setDebtMonthlyCommitment: (value: number) => void
  setTax: (patch: Partial<TaxInputs>) => void
}

export const createMoneySlice = (initial: MoneyState): StateCreator<RootStore, Mutators, [], MoneySlice> => (set) => ({
  money: initial,

  setEmergencyTarget: (value) =>
    set((s) => {
      s.money.emergencyTarget = value
    }),
  setEmergencyCurrent: (value) =>
    set((s) => {
      s.money.emergencyCurrent = value
    }),

  addIncome: () =>
    set((s) => {
      s.money.income.push({ id: newId(), label: 'درآمد جدید', value: 0 })
    }),
  updateIncome: (id, patch) =>
    set((s) => {
      const item = s.money.income.find((x) => x.id === id)
      if (item) Object.assign(item, patch)
    }),
  removeIncome: (id) =>
    set((s) => {
      s.money.income = s.money.income.filter((x) => x.id !== id)
    }),

  addExpense: () =>
    set((s) => {
      s.money.expenses.push({ id: newId(), label: 'هزینهٔ جدید', value: 0 })
    }),
  updateExpense: (id, patch) =>
    set((s) => {
      const item = s.money.expenses.find((x) => x.id === id)
      if (item) Object.assign(item, patch)
    }),
  removeExpense: (id) =>
    set((s) => {
      s.money.expenses = s.money.expenses.filter((x) => x.id !== id)
    }),

  addDebt: (kind) =>
    set((s) => {
      const id = newId()
      const base = { id, name: kind === 'lumpSum' ? 'بدهی یکجای جدید' : kind === 'personal' ? 'قرض جدید' : 'وام جدید' }
      const debt: Debt =
        kind === 'lumpSum'
          ? { ...base, kind, total: 0, dueDate: '', settled: false }
          : { ...base, kind, total: 0, monthly: 0, count: 0, paid: 0 }
      s.money.debts.push(debt)
    }),
  updateDebt: (id, patch) =>
    set((s) => {
      const debt = s.money.debts.find((x) => x.id === id)
      if (debt) Object.assign(debt, patch)
    }),
  toggleDebtSettled: (id) =>
    set((s) => {
      const debt = s.money.debts.find((x) => x.id === id)
      if (debt && debt.kind === 'lumpSum') debt.settled = !debt.settled
    }),
  payInstallment: (id) =>
    set((s) => {
      const debt = s.money.debts.find((x) => x.id === id)
      if (debt && debt.kind !== 'lumpSum') debt.paid = Math.min(debt.paid + 1, debt.count)
    }),
  unpayInstallment: (id) =>
    set((s) => {
      const debt = s.money.debts.find((x) => x.id === id)
      if (debt && debt.kind !== 'lumpSum') debt.paid = Math.max(debt.paid - 1, 0)
    }),
  removeDebt: (id) =>
    set((s) => {
      s.money.debts = s.money.debts.filter((x) => x.id !== id)
    }),

  setDebtMonthlyCommitment: (value) =>
    set((s) => {
      s.money.debtMonthlyCommitment = value
    }),
  setTax: (patch) =>
    set((s) => {
      Object.assign(s.money.tax, patch)
    }),
})
