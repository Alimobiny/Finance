import type { StateCreator } from 'zustand'
import type { RootStore, Mutators } from '../rootStoreType'
import { newId } from '../../lib/format/id'
import type { ChecklistItem, PositionSizeInputs, ScoreOption, Trade, TradingState } from '../../types'

export type NewTradeInput = Omit<Trade, 'id'>

export interface TradingSlice {
  trading: TradingState

  addTrade: (input: NewTradeInput) => void
  importTrades: (inputs: NewTradeInput[]) => { added: number; skipped: number }
  updateTrade: (id: string, input: NewTradeInput) => void
  removeTrade: (id: string) => void
  startEditTrade: (id: string) => void
  cancelEditTrade: () => void

  addChecklistGroup: () => void
  updateChecklistGroupTitle: (groupId: string, title: string) => void
  removeChecklistGroup: (groupId: string) => void
  addChecklistItem: (groupId: string) => void
  updateChecklistItemText: (groupId: string, itemId: string, text: string) => void
  removeChecklistItem: (groupId: string, itemId: string) => void
  toggleChecked: (itemId: string) => void
  resetChecklist: () => void

  addScoreSection: () => void
  updateScoreSectionTitle: (sectionId: string, title: string) => void
  removeScoreSection: (sectionId: string) => void
  addScoreOption: (sectionId: string) => void
  updateScoreOption: (sectionId: string, optionId: string, patch: Partial<Pick<ScoreOption, 'label' | 'weight'>>) => void
  toggleScoreOption: (sectionId: string, optionId: string) => void
  removeScoreOption: (sectionId: string, optionId: string) => void
  setScoreThreshold: (value: number) => void

  setPositionSize: (patch: Partial<PositionSizeInputs>) => void
}

export const createTradingSlice = (
  initial: TradingState,
): StateCreator<RootStore, Mutators, [], TradingSlice> => (set) => ({
  trading: initial,

  addTrade: (input) =>
    set((s) => {
      s.trading.trades.unshift({ id: newId(), ...input })
    }),
  importTrades: (inputs) => {
    let added = 0
    let skipped = 0
    set((s) => {
      const seen = new Set(s.trading.trades.map((t) => t.ticket).filter(Boolean) as string[])
      // قدیمی→جدید اضافه می‌کنیم و در ابتدای آرایه می‌گذاریم تا در جدول، جدیدترین بالا بماند.
      for (const input of inputs) {
        if (input.ticket && seen.has(input.ticket)) {
          skipped++
          continue
        }
        if (input.ticket) seen.add(input.ticket)
        s.trading.trades.unshift({ id: newId(), ...input })
        added++
      }
    })
    return { added, skipped }
  },
  updateTrade: (id, input) =>
    set((s) => {
      const idx = s.trading.trades.findIndex((t) => t.id === id)
      if (idx !== -1) s.trading.trades[idx] = { id, ...input }
      s.trading.editingTradeId = null
    }),
  removeTrade: (id) =>
    set((s) => {
      s.trading.trades = s.trading.trades.filter((t) => t.id !== id)
    }),
  startEditTrade: (id) =>
    set((s) => {
      s.trading.editingTradeId = id
    }),
  cancelEditTrade: () =>
    set((s) => {
      s.trading.editingTradeId = null
    }),

  addChecklistGroup: () =>
    set((s) => {
      s.trading.checklistGroups.push({ id: newId(), title: 'گروه جدید', items: [] })
    }),
  updateChecklistGroupTitle: (groupId, title) =>
    set((s) => {
      const g = s.trading.checklistGroups.find((x) => x.id === groupId)
      if (g) g.title = title
    }),
  removeChecklistGroup: (groupId) =>
    set((s) => {
      s.trading.checklistGroups = s.trading.checklistGroups.filter((g) => g.id !== groupId)
    }),
  addChecklistItem: (groupId) =>
    set((s) => {
      const g = s.trading.checklistGroups.find((x) => x.id === groupId)
      const item: ChecklistItem = { id: newId(), text: 'مورد جدید — برای ویرایش بزن' }
      if (g) g.items.push(item)
    }),
  updateChecklistItemText: (groupId, itemId, text) =>
    set((s) => {
      const item = s.trading.checklistGroups.find((g) => g.id === groupId)?.items.find((i) => i.id === itemId)
      if (item) item.text = text
    }),
  removeChecklistItem: (groupId, itemId) =>
    set((s) => {
      const g = s.trading.checklistGroups.find((x) => x.id === groupId)
      if (g) g.items = g.items.filter((i) => i.id !== itemId)
    }),
  toggleChecked: (itemId) =>
    set((s) => {
      s.trading.checkedItems[itemId] = !s.trading.checkedItems[itemId]
    }),
  resetChecklist: () =>
    set((s) => {
      s.trading.checkedItems = {}
    }),

  addScoreSection: () =>
    set((s) => {
      s.trading.scoreSections.push({ id: newId(), title: 'بخش جدید', single: false, options: [] })
    }),
  updateScoreSectionTitle: (sectionId, title) =>
    set((s) => {
      const sec = s.trading.scoreSections.find((x) => x.id === sectionId)
      if (sec) sec.title = title
    }),
  removeScoreSection: (sectionId) =>
    set((s) => {
      s.trading.scoreSections = s.trading.scoreSections.filter((x) => x.id !== sectionId)
    }),
  addScoreOption: (sectionId) =>
    set((s) => {
      const sec = s.trading.scoreSections.find((x) => x.id === sectionId)
      if (sec) sec.options.push({ id: newId(), label: 'گزینهٔ جدید', weight: 5, on: false })
    }),
  updateScoreOption: (sectionId, optionId, patch) =>
    set((s) => {
      const opt = s.trading.scoreSections.find((x) => x.id === sectionId)?.options.find((o) => o.id === optionId)
      if (opt) Object.assign(opt, patch)
    }),
  toggleScoreOption: (sectionId, optionId) =>
    set((s) => {
      const sec = s.trading.scoreSections.find((x) => x.id === sectionId)
      if (!sec) return
      for (const opt of sec.options) {
        if (opt.id === optionId) opt.on = !opt.on
        else if (sec.single) opt.on = false
      }
    }),
  removeScoreOption: (sectionId, optionId) =>
    set((s) => {
      const sec = s.trading.scoreSections.find((x) => x.id === sectionId)
      if (sec) sec.options = sec.options.filter((o) => o.id !== optionId)
    }),
  setScoreThreshold: (value) =>
    set((s) => {
      s.trading.scoreThreshold = value
    }),

  setPositionSize: (patch) =>
    set((s) => {
      Object.assign(s.trading.positionSize, patch)
    }),
})
