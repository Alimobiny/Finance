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

  addNewsChannel: (raw: string) => boolean
  removeNewsChannel: (channel: string) => void

  setLastSyncedAt: (iso: string | null) => void
}

const MAX_NEWS_CHANNELS = 5

/** یوزرنیم کانال را از لینک/@/فاصله پاک می‌کند. */
export function sanitizeChannel(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\/t\.me\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '')
    .replace(/\s+/g, '')
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

  addNewsChannel: (raw) => {
    const channel = sanitizeChannel(raw)
    let ok = false
    set((s) => {
      if (!s.settings.newsChannels) s.settings.newsChannels = []
      const exists = s.settings.newsChannels.some((c) => c.toLowerCase() === channel.toLowerCase())
      if (channel && !exists && s.settings.newsChannels.length < MAX_NEWS_CHANNELS) {
        s.settings.newsChannels.push(channel)
        ok = true
      }
    })
    return ok
  },
  removeNewsChannel: (channel) =>
    set((s) => {
      s.settings.newsChannels = (s.settings.newsChannels ?? []).filter((c) => c !== channel)
    }),

  setLastSyncedAt: (iso) =>
    set((s) => {
      s.settings.lastSyncedAt = iso
    }),
})
