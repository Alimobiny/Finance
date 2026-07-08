import { describe, it, expect } from 'vitest'
import { backupFileName, isValidRootState } from './driveBackup'

describe('backupFileName', () => {
  it('نام را با تاریخ و ساعتِ محلی و پسوندِ json می‌سازد', () => {
    // ۵ ژوئیهٔ ۲۰۲۶، ساعت ۹:۰۵ (محلی)
    expect(backupFileName(new Date(2026, 6, 5, 9, 5))).toBe('qotbnama-backup-2026-07-05_09-05.json')
  })

  it('ماه/روز/ساعت/دقیقهٔ تک‌رقمی را صفرپیشوند می‌کند', () => {
    expect(backupFileName(new Date(2026, 0, 1, 0, 0))).toBe('qotbnama-backup-2026-01-01_00-00.json')
  })
})

describe('isValidRootState', () => {
  it('آبجکتِ دارای همهٔ کلیدهای اصلی معتبر است', () => {
    const ok = { meta: {}, dashboard: {}, portfolio: {}, trading: {}, money: {}, life: {}, settings: {} }
    expect(isValidRootState(ok)).toBe(true)
  })

  it('فایلِ نامربوط یا ناقص نامعتبر است', () => {
    expect(isValidRootState({ foo: 1 })).toBe(false)
    expect(isValidRootState({ meta: {}, dashboard: {} })).toBe(false)
    expect(isValidRootState(null)).toBe(false)
    expect(isValidRootState('x')).toBe(false)
  })
})
