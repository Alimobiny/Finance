import type { StateCreator } from 'zustand'
import type { RootStore, Mutators } from '../rootStoreType'
import { addTextItem, removeTextItem, updateTextItem } from '../listHelpers'
import type { SettingsState } from '../../types'

export interface SettingsSlice {
  settings: SettingsState

  addSymbol: () => void
  updateSymbol: (id: string, text: string) => void
  removeSymbol: (id: string) => void

  addEmotion: () => void
  updateEmotion: (id: string, text: string) => void
  removeEmotion: (id: string) => void

  setLastSyncedAt: (iso: string | null) => void
}

export const createSettingsSlice = (
  initial: SettingsState,
): StateCreator<RootStore, Mutators, [], SettingsSlice> => (set) => ({
  settings: initial,

  addSymbol: () =>
    set((s) => {
      addTextItem(s.settings.symbols)
    }),
  updateSymbol: (id, text) =>
    set((s) => {
      updateTextItem(s.settings.symbols, id, text)
    }),
  removeSymbol: (id) =>
    set((s) => {
      removeTextItem(s.settings.symbols, id)
    }),

  addEmotion: () =>
    set((s) => {
      addTextItem(s.settings.emotions)
    }),
  updateEmotion: (id, text) =>
    set((s) => {
      updateTextItem(s.settings.emotions, id, text)
    }),
  removeEmotion: (id) =>
    set((s) => {
      removeTextItem(s.settings.emotions, id)
    }),

  setLastSyncedAt: (iso) =>
    set((s) => {
      s.settings.lastSyncedAt = iso
    }),
})
