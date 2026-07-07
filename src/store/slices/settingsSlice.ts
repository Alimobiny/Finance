import type { StateCreator } from 'zustand'
import type { RootStore, Mutators } from '../rootStoreType'
import { addTextItem, insertTextItem, removeTextItem, updateTextItem } from '../listHelpers'
import type { SettingsState, TextListItem } from '../../types'

export interface SettingsSlice {
  settings: SettingsState

  addSymbol: () => void
  updateSymbol: (id: string, text: string) => void
  removeSymbol: (id: string) => void
  restoreSymbol: (item: TextListItem, index: number) => void

  addEmotion: () => void
  updateEmotion: (id: string, text: string) => void
  removeEmotion: (id: string) => void
  restoreEmotion: (item: TextListItem, index: number) => void

  setLastSyncedAt: (iso: string | null) => void
  setAutoImportUrl: (url: string) => void
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
  restoreSymbol: (item, index) =>
    set((s) => {
      insertTextItem(s.settings.symbols, item, index)
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
  restoreEmotion: (item, index) =>
    set((s) => {
      insertTextItem(s.settings.emotions, item, index)
    }),

  setLastSyncedAt: (iso) =>
    set((s) => {
      s.settings.lastSyncedAt = iso
    }),
  setAutoImportUrl: (url) =>
    set((s) => {
      s.settings.autoImportUrl = url.trim()
    }),
})
