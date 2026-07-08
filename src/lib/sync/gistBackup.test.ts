import { describe, it, expect } from 'vitest'
import { backupFileName, isValidRootState, sortBackupNames } from './gistBackup'

describe('backupFileName', () => {
  it('نام را با تاریخ و ساعتِ محلی و پسوندِ json می‌سازد', () => {
    expect(backupFileName(new Date(2026, 6, 5, 9, 5))).toBe('qotbnama-backup-2026-07-05_09-05.json')
  })
  it('تک‌رقمی‌ها را صفرپیشوند می‌کند', () => {
    expect(backupFileName(new Date(2026, 0, 1, 0, 0))).toBe('qotbnama-backup-2026-01-01_00-00.json')
  })
})

describe('sortBackupNames', () => {
  it('تازه‌ترین (زمانِ بزرگ‌تر) را اول می‌آورد و غیر json را حذف می‌کند', () => {
    const input = ['qotbnama-backup-2026-07-05_09-05.json', 'readme.txt', 'qotbnama-backup-2026-07-06_10-00.json']
    expect(sortBackupNames(input)).toEqual([
      'qotbnama-backup-2026-07-06_10-00.json',
      'qotbnama-backup-2026-07-05_09-05.json',
    ])
  })
})

describe('isValidRootState', () => {
  it('آبجکتِ دارای همهٔ کلیدهای اصلی معتبر است', () => {
    expect(isValidRootState({ meta: {}, dashboard: {}, portfolio: {}, trading: {}, money: {}, life: {}, settings: {} })).toBe(true)
  })
  it('فایلِ نامربوط یا ناقص نامعتبر است', () => {
    expect(isValidRootState({ foo: 1 })).toBe(false)
    expect(isValidRootState(null)).toBe(false)
  })
})
