import { describe, it, expect } from 'vitest'
import type { TextListItem } from '../types'
import { addTextItem, updateTextItem, removeTextItem, insertTextItem } from './listHelpers'

// این توابع برای immer نوشته شده‌اند اما در زمان اجرا روی آرایهٔ ساده کار می‌کنند،
// پس مستقیم با آرایهٔ معمولی تست می‌شوند.

describe('addTextItem', () => {
  it('آیتم جدید با شناسهٔ یکتا اضافه می‌کند', () => {
    const list: TextListItem[] = []
    addTextItem(list, 'هدف اول')
    expect(list).toHaveLength(1)
    expect(list[0].text).toBe('هدف اول')
    expect(typeof list[0].id).toBe('string')
    expect(list[0].id.length).toBeGreaterThan(0)
  })
})

describe('updateTextItem', () => {
  it('متنِ آیتمِ موجود را تغییر می‌دهد', () => {
    const list: TextListItem[] = [{ id: 'a', text: 'قدیمی' }]
    updateTextItem(list, 'a', 'جدید')
    expect(list[0].text).toBe('جدید')
  })

  it('برای شناسهٔ ناموجود بی‌اثر است', () => {
    const list: TextListItem[] = [{ id: 'a', text: 'x' }]
    updateTextItem(list, 'ناموجود', 'y')
    expect(list[0].text).toBe('x')
  })
})

describe('removeTextItem', () => {
  it('آیتم را حذف می‌کند', () => {
    const list: TextListItem[] = [{ id: 'a', text: 'x' }, { id: 'b', text: 'y' }]
    removeTextItem(list, 'a')
    expect(list).toEqual([{ id: 'b', text: 'y' }])
  })
})

describe('insertTextItem', () => {
  it('آیتم را در جایگاه مشخص برمی‌گرداند (برای Undo)', () => {
    const list: TextListItem[] = [{ id: 'a', text: 'a' }, { id: 'c', text: 'c' }]
    insertTextItem(list, { id: 'b', text: 'b' }, 1)
    expect(list.map((i) => i.id)).toEqual(['a', 'b', 'c'])
  })

  it('اندیس خارج از بازه را به داخل بازه محدود می‌کند', () => {
    const list: TextListItem[] = [{ id: 'a', text: 'a' }]
    insertTextItem(list, { id: 'z', text: 'z' }, 99)
    expect(list.map((i) => i.id)).toEqual(['a', 'z'])
  })
})
