import type { StateCreator } from 'zustand'
import type { RootStore, Mutators } from '../rootStoreType'
import { addTextItem, removeTextItem, updateTextItem } from '../listHelpers'
import type { DashboardState } from '../../types'

export interface DashboardSlice {
  dashboard: DashboardState

  setNorthStar: (value: string) => void
  addGoal: () => void
  updateGoal: (id: string, text: string) => void
  removeGoal: (id: string) => void
  addIronRule: () => void
  updateIronRule: (id: string, text: string) => void
  removeIronRule: (id: string) => void
  addRedLine: () => void
  updateRedLine: (id: string, text: string) => void
  removeRedLine: (id: string) => void
  setGoldenRule: (value: string) => void
  setMarketPulse: (value: string) => void
  setTacticalPulse: (value: string) => void
}

export const createDashboardSlice = (
  initial: DashboardState,
): StateCreator<RootStore, Mutators, [], DashboardSlice> => (set) => ({
  dashboard: initial,

  setNorthStar: (value) =>
    set((s) => {
      s.dashboard.northStar = value
    }),
  addGoal: () =>
    set((s) => {
      addTextItem(s.dashboard.goals)
    }),
  updateGoal: (id, text) =>
    set((s) => {
      updateTextItem(s.dashboard.goals, id, text)
    }),
  removeGoal: (id) =>
    set((s) => {
      removeTextItem(s.dashboard.goals, id)
    }),
  addIronRule: () =>
    set((s) => {
      addTextItem(s.dashboard.ironRules)
    }),
  updateIronRule: (id, text) =>
    set((s) => {
      updateTextItem(s.dashboard.ironRules, id, text)
    }),
  removeIronRule: (id) =>
    set((s) => {
      removeTextItem(s.dashboard.ironRules, id)
    }),
  addRedLine: () =>
    set((s) => {
      addTextItem(s.dashboard.redLines)
    }),
  updateRedLine: (id, text) =>
    set((s) => {
      updateTextItem(s.dashboard.redLines, id, text)
    }),
  removeRedLine: (id) =>
    set((s) => {
      removeTextItem(s.dashboard.redLines, id)
    }),
  setGoldenRule: (value) =>
    set((s) => {
      s.dashboard.goldenRule = value
    }),
  setMarketPulse: (value) =>
    set((s) => {
      s.dashboard.marketPulse = value
    }),
  setTacticalPulse: (value) =>
    set((s) => {
      s.dashboard.tacticalPulse = value
    }),
})
