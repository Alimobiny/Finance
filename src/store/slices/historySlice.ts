import type { StateCreator } from 'zustand'
import type { RootStore, Mutators } from '../rootStoreType'
import type { HistoryState } from '../../types'

export interface HistorySlice {
  history: HistoryState
  clearHistory: () => void
}

export const createHistorySlice =
  (initial: HistoryState): StateCreator<RootStore, Mutators, [], HistorySlice> =>
  (set) => ({
    history: initial,
    clearHistory: () =>
      set((s) => {
        s.history.entries = []
      }),
  })
