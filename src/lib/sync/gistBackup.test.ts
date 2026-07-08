import { describe, it, expect } from 'vitest'
import { backupFileName, isValidRootState, sortBackupNames } from './gistBackup'

describe('backupFileName', () => {
  it('نام را با تاریخ و ساعتِ شمسی به وقت تهران و پسوندِ json می‌سازد', () => {
    // 2026-07-05T05:35Z = ۹:۰۵ صبحِ تهران (UTC+3:30) = ۱۴۰۵/۰۴/۱۴
    expect(backupFileName(new Date('2026-07-05T05:35:00Z'))).toBe('qotbnama-backup-1405-04-14_09-05.json')
  })
  it('تک‌رقمی‌های ماه/روز/ساعت را صفرپیشوند می‌کند', () => {
    // 2026-06-21T23:37Z = ۳:۰۷ بامدادِ تهرانِ ۲۰۲۶-۰۶-۲۲ = ۱۴۰۵/۰۴/۰۱
    expect(backupFileName(new Date('2026-06-21T23:37:00Z'))).toBe('qotbnama-backup-1405-04-01_03-07.json')
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
