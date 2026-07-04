import type { StateCreator } from 'zustand'
import type { RootStore, Mutators } from '../rootStoreType'
import { newId } from '../../lib/format/id'
import { addTextItem, insertTextItem, removeTextItem, updateTextItem } from '../listHelpers'
import { recordChange } from '../history'
import type { Holding, HoldingSub, PortfolioState, PriceKey, TextListItem } from '../../types'

const PALETTE = ['#B0832B', '#3E6B5A', '#5B6BA8', '#2C7A6B', '#8C5A8C', '#9A6B1E', '#1A5276', '#8C3A3A']

export interface PortfolioSlice {
  portfolio: PortfolioState

  addHolding: () => void
  updateHolding: (id: string, patch: Partial<Pick<Holding, 'name' | 'layer' | 'role' | 'target'>>) => void
  removeHolding: (id: string) => void
  restoreHolding: (item: Holding, index: number) => void
  addManualSub: (holdingId: string) => void
  addLinkedSub: (holdingId: string) => void
  updateSubName: (holdingId: string, subId: string, name: string) => void
  updateSubValue: (holdingId: string, subId: string, value: number) => void
  updateSubQty: (holdingId: string, subId: string, qty: number) => void
  updateSubUnit: (holdingId: string, subId: string, unit: PriceKey) => void
  removeSub: (holdingId: string, subId: string) => void
  restoreSub: (holdingId: string, item: HoldingSub, index: number) => void
  setPrice: (key: PriceKey, value: number) => void
  markPricesApplied: () => void
  addRebalanceNote: () => void
  updateRebalanceNote: (id: string, text: string) => void
  removeRebalanceNote: (id: string) => void
  restoreRebalanceNote: (item: TextListItem, index: number) => void
}

export const createPortfolioSlice = (
  initial: PortfolioState,
): StateCreator<RootStore, Mutators, [], PortfolioSlice> => (set) => ({
  portfolio: initial,

  addHolding: () =>
    set((s) => {
      const color = PALETTE[s.portfolio.holdings.length % PALETTE.length]
      s.portfolio.holdings.push({ id: newId(), name: 'دارایی جدید', layer: 'سایر', role: '', target: 0, color, subs: [] })
      recordChange(s, 'add', 'پرتفولیو', 'افزودن دارایی جدید')
    }),
  updateHolding: (id, patch) =>
    set((s) => {
      const h = s.portfolio.holdings.find((x) => x.id === id)
      if (h) Object.assign(h, patch)
    }),
  removeHolding: (id) =>
    set((s) => {
      const h = s.portfolio.holdings.find((x) => x.id === id)
      s.portfolio.holdings = s.portfolio.holdings.filter((x) => x.id !== id)
      if (h) recordChange(s, 'remove', 'پرتفولیو', `حذف دارایی «${h.name}»`)
    }),
  restoreHolding: (item, index) =>
    set((s) => {
      s.portfolio.holdings.splice(Math.min(index, s.portfolio.holdings.length), 0, item)
    }),
  addManualSub: (holdingId) =>
    set((s) => {
      const h = s.portfolio.holdings.find((x) => x.id === holdingId)
      if (h) h.subs.push({ id: newId(), kind: 'manual', name: 'زیرمجموعهٔ جدید', value: 0 })
    }),
  addLinkedSub: (holdingId) =>
    set((s) => {
      const h = s.portfolio.holdings.find((x) => x.id === holdingId)
      if (h) h.subs.push({ id: newId(), kind: 'linked', name: 'زیرمجموعهٔ جدید', unit: 'usd', qty: 0 })
    }),
  updateSubName: (holdingId, subId, name) =>
    set((s) => {
      const sub = findSub(s.portfolio.holdings, holdingId, subId)
      if (sub) sub.name = name
    }),
  updateSubValue: (holdingId, subId, value) =>
    set((s) => {
      const sub = findSub(s.portfolio.holdings, holdingId, subId)
      if (sub && sub.kind === 'manual') sub.value = value
    }),
  updateSubQty: (holdingId, subId, qty) =>
    set((s) => {
      const sub = findSub(s.portfolio.holdings, holdingId, subId)
      if (sub && sub.kind === 'linked') sub.qty = qty
    }),
  updateSubUnit: (holdingId, subId, unit) =>
    set((s) => {
      const sub = findSub(s.portfolio.holdings, holdingId, subId)
      if (sub && sub.kind === 'linked') sub.unit = unit
    }),
  removeSub: (holdingId, subId) =>
    set((s) => {
      const h = s.portfolio.holdings.find((x) => x.id === holdingId)
      if (h) h.subs = h.subs.filter((sub) => sub.id !== subId)
    }),
  restoreSub: (holdingId, item, index) =>
    set((s) => {
      const h = s.portfolio.holdings.find((x) => x.id === holdingId)
      if (h) h.subs.splice(Math.min(index, h.subs.length), 0, item)
    }),
  setPrice: (key, value) =>
    set((s) => {
      s.portfolio.prices[key] = value
    }),
  markPricesApplied: () =>
    set((s) => {
      s.portfolio.pricesUpdatedAt = new Date().toISOString()
    }),

  addRebalanceNote: () =>
    set((s) => {
      addTextItem(s.portfolio.rebalanceNotes)
    }),
  updateRebalanceNote: (id, text) =>
    set((s) => {
      updateTextItem(s.portfolio.rebalanceNotes, id, text)
    }),
  removeRebalanceNote: (id) =>
    set((s) => {
      removeTextItem(s.portfolio.rebalanceNotes, id)
    }),
  restoreRebalanceNote: (item, index) =>
    set((s) => {
      insertTextItem(s.portfolio.rebalanceNotes, item, index)
    }),
})

function findSub(holdings: Holding[], holdingId: string, subId: string): HoldingSub | undefined {
  return holdings.find((h) => h.id === holdingId)?.subs.find((sub) => sub.id === subId)
}
