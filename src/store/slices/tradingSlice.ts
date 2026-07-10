import type { StateCreator } from 'zustand'
import type { RootStore, Mutators } from '../rootStoreType'
import { newId } from '../../lib/format/id'
import { toPersianDigits } from '../../lib/format/number'
import { recordChange } from '../history'
import { accountRiskAmount, effectiveRiskAmount, rFromProfit } from '../../features/trading/lib/tradeMath'
import type { ChecklistItem, PositionSizeInputs, ScoreOption, Trade, TradingAccount, TradingState } from '../../types'

/** ورودی ثبت معامله؛ حساب به‌صورت خودکار «حساب فعال» می‌شود، پس accountId اینجا نیست. */
export type NewTradeInput = Omit<Trade, 'id' | 'accountId'>

export interface TradingSlice {
  trading: TradingState

  addAccount: (name?: string) => void
  updateAccount: (id: string, patch: Partial<Pick<TradingAccount, 'name' | 'balance' | 'riskPercent'>>) => void
  removeAccount: (id: string) => void
  setActiveAccount: (id: string) => void

  addTrade: (input: NewTradeInput) => void
  importTrades: (inputs: NewTradeInput[]) => { added: number; updated: number; skipped: number }
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

  addAccount: (name) =>
    set((s) => {
      const id = newId()
      const finalName = name?.trim() || `حساب ${s.trading.accounts.length + 1}`
      s.trading.accounts.push({ id, name: finalName, balance: 0, riskPercent: 1 })
      s.trading.activeAccountId = id
      recordChange(s, 'add', 'معاملات', `ساخت حساب «${finalName}»`)
    }),
  updateAccount: (id, patch) =>
    set((s) => {
      const acc = s.trading.accounts.find((a) => a.id === id)
      if (!acc) return
      Object.assign(acc, patch)
      // اگر موجودی یا درصد ریسک عوض شد، مبلغ ریسک و R معاملاتِ وارد‌شده را بازمحاسبه کن.
      if (patch.balance !== undefined || patch.riskPercent !== undefined) {
        const amount = accountRiskAmount(acc)
        for (const t of s.trading.trades) {
          // معاملاتی که «ریسکِ واقعیِ خودشان» را دارند با تغییر حساب دست نمی‌خورند.
          if (t.accountId === id && t.profit != null && !(t.riskUsd != null && t.riskUsd > 0)) {
            t.r = rFromProfit(t.profit, amount)
          }
        }
      }
    }),
  removeAccount: (id) =>
    set((s) => {
      if (s.trading.accounts.length <= 1) return // همیشه دست‌کم یک حساب بماند
      const acc = s.trading.accounts.find((a) => a.id === id)
      s.trading.accounts = s.trading.accounts.filter((a) => a.id !== id)
      s.trading.trades = s.trading.trades.filter((t) => t.accountId !== id)
      if (s.trading.activeAccountId === id) s.trading.activeAccountId = s.trading.accounts[0].id
      if (acc) recordChange(s, 'remove', 'معاملات', `حذف حساب «${acc.name}» و معاملاتش`)
    }),
  setActiveAccount: (id) =>
    set((s) => {
      if (s.trading.accounts.some((a) => a.id === id)) s.trading.activeAccountId = id
    }),

  addTrade: (input) =>
    set((s) => {
      s.trading.trades.unshift({ id: newId(), accountId: s.trading.activeAccountId, ...input })
      recordChange(s, 'add', 'معاملات', `ثبت معاملهٔ «${input.symbol || 'بدون‌نماد'}»`)
    }),
  importTrades: (inputs) => {
    let added = 0
    let updated = 0
    set((s) => {
      const accId = s.trading.activeAccountId
      const acc = s.trading.accounts.find((a) => a.id === accId)
      const risk = acc ? accountRiskAmount(acc) : 0
      // نگاشتِ ticket → معاملهٔ موجودِ همین حساب. import مجدد، فیلدهای مالی/قیمتی را «به‌روز»
      // می‌کند (نه رد؛ تا کمیسیون/سواپ و R اصلاح شوند) ولی تگ/احساس/امتیاز/یادداشت/عکس را نگه می‌دارد.
      const byTicket = new Map<string, Trade>()
      for (const t of s.trading.trades) if (t.accountId === accId && t.ticket) byTicket.set(t.ticket, t)
      // R از روی سود واقعی ÷ ریسکِ مؤثر (ریسکِ واقعیِ معامله اگر بود، وگرنه ریسکِ ثابتِ حساب).
      for (const input of inputs) {
        const r = input.profit != null ? rFromProfit(input.profit, effectiveRiskAmount(input.riskUsd, risk)) : input.r
        const existing = input.ticket ? byTicket.get(input.ticket) : undefined
        if (existing) {
          existing.date = input.date || existing.date
          existing.symbol = input.symbol
          existing.dir = input.dir
          existing.entry = input.entry
          existing.stop = input.stop
          existing.tp = input.tp
          existing.exit = input.exit
          existing.profit = input.profit
          existing.commission = input.commission
          existing.swap = input.swap
          existing.riskUsd = input.riskUsd
          existing.rr = input.rr
          existing.r = r
          updated++
        } else {
          const nt: Trade = { id: newId(), accountId: accId, ...input, r }
          s.trading.trades.unshift(nt)
          if (input.ticket) byTicket.set(input.ticket, nt)
          added++
        }
      }
      if (added > 0 || updated > 0) {
        recordChange(s, 'import', 'معاملات', `import متاتریدر: ${toPersianDigits(added)} جدید، ${toPersianDigits(updated)} به‌روزرسانی`)
      }
    })
    return { added, updated, skipped: 0 }
  },
  updateTrade: (id, input) =>
    set((s) => {
      const idx = s.trading.trades.findIndex((t) => t.id === id)
      if (idx !== -1) s.trading.trades[idx] = { id, accountId: s.trading.trades[idx].accountId, ...input }
      s.trading.editingTradeId = null
      recordChange(s, 'edit', 'معاملات', `ویرایش معاملهٔ «${input.symbol || 'بدون‌نماد'}»`)
    }),
  removeTrade: (id) =>
    set((s) => {
      const t = s.trading.trades.find((x) => x.id === id)
      s.trading.trades = s.trading.trades.filter((x) => x.id !== id)
      if (t) recordChange(s, 'remove', 'معاملات', `حذف معاملهٔ «${t.symbol}»`)
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
