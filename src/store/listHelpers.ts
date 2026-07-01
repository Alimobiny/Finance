import type { Draft } from 'immer'
import { newId } from '../lib/format/id'
import type { TextListItem } from '../types'

/**
 * منطق مشترک لیست‌های متنی سادهٔ قابل‌ویرایش (اهداف، قوانین آهنین، خط‌قرمزها،
 * قوانین اجرا، نمادها، احساسات) که در چند اسلایس مختلف تکرار می‌شود.
 * باید داخل یک بلاک immer (set) صدا زده شود.
 */
export function addTextItem(list: Draft<TextListItem[]>, text = ''): void {
  list.push({ id: newId(), text })
}

export function updateTextItem(list: Draft<TextListItem[]>, id: string, text: string): void {
  const item = list.find((i) => i.id === id)
  if (item) item.text = text
}

export function removeTextItem(list: Draft<TextListItem[]>, id: string): void {
  const idx = list.findIndex((i) => i.id === id)
  if (idx !== -1) list.splice(idx, 1)
}

/** بازگرداندن آیتم حذف‌شده به همان جایگاه قبلی (برای Undo Toast) */
export function insertTextItem(list: Draft<TextListItem[]>, item: TextListItem, index: number): void {
  list.splice(Math.min(Math.max(index, 0), list.length), 0, item)
}
