import { describe, it, expect } from 'vitest'
import { encryptString, decryptString, isEncryptedBlob } from './secureBlob'

describe('secureBlob', () => {
  it('رفت‌وبرگشت: متنِ رمزشده با همان عبارت‌عبور دقیقاً بازمی‌گردد', async () => {
    const plain = JSON.stringify({ balance: 12_500_000, trades: [{ r: 2.5 }] })
    const blob = await encryptString(plain, 'رمزِ درست')
    expect(isEncryptedBlob(blob)).toBe(true)
    expect(await decryptString(blob, 'رمزِ درست')).toBe(plain)
  })

  it('هر بار salt/iv تازه → ciphertextِ متفاوت برای همان ورودی', async () => {
    const a = await encryptString('secret', 'p')
    const b = await encryptString('secret', 'p')
    expect(a.ct).not.toBe(b.ct)
    expect(a.salt).not.toBe(b.salt)
  })

  it('رمزِ غلط → خطا، نه دادهٔ خراب', async () => {
    const blob = await encryptString('secret', 'رمزِ درست')
    await expect(decryptString(blob, 'رمزِ غلط')).rejects.toThrow()
  })

  it('دستکاریِ ciphertext با تأییدِ تگِ GCM شکست می‌خورد', async () => {
    const blob = await encryptString('secret', 'p')
    const tampered = { ...blob, ct: blob.ct.slice(0, -4) + 'AAAA' }
    await expect(decryptString(tampered, 'p')).rejects.toThrow()
  })

  it('isEncryptedBlob فقط برای شیءِ رمزنگاری‌شده true است', () => {
    expect(isEncryptedBlob({ meta: {}, dashboard: {} })).toBe(false)
    expect(isEncryptedBlob(null)).toBe(false)
    expect(isEncryptedBlob('x')).toBe(false)
  })
})
