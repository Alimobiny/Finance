import type { StateCreator } from 'zustand'
import type { RootStore, Mutators } from '../rootStoreType'
import { newId } from '../../lib/format/id'
import { recordChange } from '../history'
import type { Debt, LineItem, MoneyState, TaxInputs } from '../../types'

export interface MoneySlice {
  money: MoneyState

  setEmergencyTarget: (value: number) => void
  setEmergencyCurrent: (value: number) => void

  addIncome: () => void
  updateIncome: (id: string, patch: { label?: string; value?: number }) => void
  removeIncome: (id: string) => void
  restoreIncome: (item: LineItem, index: number) => void

  addExpense: () => void
  updateExpense: (id: string, patch: { label?: string; value?: number }) => void
  removeExpense: (id: string) => void
  restoreExpense: (item: LineItem, index: number) => void

  addDebt: (kind: Debt['kind']) => void
  updateDebt: (id: string, patch: Record<string, unknown>) => void
  toggleDebtSettled: (id: string) => void
  payInstallment: (id: string) => void
  unpayInstallment: (id: string) => void
  removeDebt: (id: string) => void
  restoreDebt: (item: Debt, index: number) => void

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
      recordChange(s, 'add', 'مالی', 'افزودن ردیف درآمد')
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
  restoreIncome: (item, index) =>
    set((s) => {
      s.money.income.splice(Math.min(index, s.money.income.length), 0, item)
    }),

  addExpense: () =>
    set((s) => {
      s.money.expenses.push({ id: newId(), label: 'هزینهٔ جدید', value: 0 })
      recordChange(s, 'add', 'مالی', 'افزودن ردیف هزینه')
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
  restoreExpense: (item, index) =>
    set((s) => {
      s.money.expenses.splice(Math.min(index, s.money.expenses.length), 0, item)
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
      recordChange(s, 'add', 'مالی', `افزودن ${base.name}`)
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
      const d = s.money.debts.find((x) => x.id === id)
      s.money.debts = s.money.debts.filter((x) => x.id !== id)
      if (d) recordChange(s, 'remove', 'مالی', `حذف «${d.name}»`)
    }),
  restoreDebt: (item, index) =>
    set((s) => {
      s.money.debts.splice(Math.min(index, s.money.debts.length), 0, item)
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
