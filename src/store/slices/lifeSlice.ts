import type { StateCreator } from 'zustand'
import type { RootStore, Mutators } from '../rootStoreType'
import { newId } from '../../lib/format/id'
import { addTextItem, insertTextItem, removeTextItem, updateTextItem } from '../listHelpers'
import { recordChange } from '../history'
import type { DayPeriod, HabitSchedule, LifeState, TextListItem, TimeAnchor, TodoItem } from '../../types'

export interface LifeSlice {
  life: LifeState

  addAnchor: (period: DayPeriod) => void
  updateAnchor: (id: string, patch: { name?: string; cue?: string; note?: string; time?: string; period?: DayPeriod }) => void
  removeAnchor: (id: string) => void
  restoreAnchor: (item: TimeAnchor, index: number) => void
  setAnchorSchedule: (id: string, schedule: HabitSchedule) => void
  toggleAnchorWeekday: (id: string, weekday: number) => void
  toggleAnchorDone: (id: string, dayKey: string) => void

  addExecutionRule: () => void
  updateExecutionRule: (id: string, text: string) => void
  removeExecutionRule: (id: string) => void
  restoreExecutionRule: (item: TextListItem, index: number) => void

  addTask: () => void
  updateTaskText: (id: string, text: string) => void
  toggleTask: (id: string) => void
  removeTask: (id: string) => void
  restoreTask: (item: TodoItem, index: number) => void
  setNotes: (value: string) => void
}

export const createLifeSlice = (initial: LifeState): StateCreator<RootStore, Mutators, [], LifeSlice> => (set) => ({
  life: initial,

  addAnchor: (period) =>
    set((s) => {
      s.life.anchors.push({ id: newId(), name: 'لنگر جدید', cue: '', note: '', time: '', period, schedule: { kind: 'daily' }, completions: [] })
    }),
  updateAnchor: (id, patch) =>
    set((s) => {
      const a = s.life.anchors.find((x) => x.id === id)
      if (a) Object.assign(a, patch)
    }),
  removeAnchor: (id) =>
    set((s) => {
      s.life.anchors = s.life.anchors.filter((a) => a.id !== id)
    }),
  restoreAnchor: (item, index) =>
    set((s) => {
      s.life.anchors.splice(Math.min(index, s.life.anchors.length), 0, item)
    }),
  setAnchorSchedule: (id, schedule) =>
    set((s) => {
      const a = s.life.anchors.find((x) => x.id === id)
      if (a) a.schedule = schedule
    }),
  toggleAnchorWeekday: (id, weekday) =>
    set((s) => {
      const a = s.life.anchors.find((x) => x.id === id)
      if (!a || a.schedule.kind !== 'weekdays') return
      const wd = a.schedule.weekdays
      a.schedule.weekdays = wd.includes(weekday) ? wd.filter((d) => d !== weekday) : [...wd, weekday].sort((x, y) => x - y)
    }),
  toggleAnchorDone: (id, dayKey) =>
    set((s) => {
      const a = s.life.anchors.find((x) => x.id === id)
      if (!a) return
      a.completions = a.completions.includes(dayKey) ? a.completions.filter((k) => k !== dayKey) : [...a.completions, dayKey]
    }),

  addExecutionRule: () =>
    set((s) => {
      addTextItem(s.life.executionRules)
    }),
  updateExecutionRule: (id, text) =>
    set((s) => {
      updateTextItem(s.life.executionRules, id, text)
    }),
  removeExecutionRule: (id) =>
    set((s) => {
      removeTextItem(s.life.executionRules, id)
    }),
  restoreExecutionRule: (item, index) =>
    set((s) => {
      insertTextItem(s.life.executionRules, item, index)
    }),

  addTask: () =>
    set((s) => {
      s.life.tasks.push({ id: newId(), text: '', done: false })
      recordChange(s, 'add', 'برنامه', 'افزودن کار جدید')
    }),
  updateTaskText: (id, text) =>
    set((s) => {
      const t = s.life.tasks.find((x) => x.id === id)
      if (t) t.text = text
    }),
  toggleTask: (id) =>
    set((s) => {
      const t = s.life.tasks.find((x) => x.id === id)
      if (t) t.done = !t.done
    }),
  removeTask: (id) =>
    set((s) => {
      const t = s.life.tasks.find((x) => x.id === id)
      s.life.tasks = s.life.tasks.filter((x) => x.id !== id)
      if (t) recordChange(s, 'remove', 'برنامه', `حذف کار «${t.text || 'بدون عنوان'}»`)
    }),
  restoreTask: (item, index) =>
    set((s) => {
      s.life.tasks.splice(Math.min(index, s.life.tasks.length), 0, item)
    }),
  setNotes: (value) =>
    set((s) => {
      s.life.notes = value
    }),
})
