// رمزنگاریِ متقارنِ یک رشتهٔ JSON با AES-GCM و کلیدِ مشتق‌شده از عبارت‌عبور (PBKDF2).
// کاربرد: پیش از فرستادن بک‌آپ به جای ثالث (Gist) تا دادهٔ مالی به‌صورت متنِ ساده لو نرود.
// هیچ کلیدی ذخیره نمی‌شود؛ کلید هر بار از عبارت‌عبورِ کاربر ساخته می‌شود.

const ENC = new TextEncoder()
const DEC = new TextDecoder()
const PBKDF2_ITERATIONS = 210_000 // هم‌راستا با توصیهٔ OWASP برای SHA-256
const SALT_BYTES = 16
const IV_BYTES = 12

/** خروجیِ خوداتکا: همهٔ پارامترهای لازم برای بازگشایی داخلش هست (نسخه‌پذیر). */
export interface EncryptedBlob {
  v: 1
  kdf: 'PBKDF2-SHA256'
  iter: number
  salt: string // base64
  iv: string // base64
  ct: string // base64 (ciphertext + tagِ GCM)
}

function subtle(): SubtleCrypto {
  const s = globalThis.crypto?.subtle
  if (!s) throw new Error('Web Crypto در این مرورگر در دسترس نیست.')
  return s
}

/**
 * یک کپیِ ArrayBuffer-محور از بایت‌ها می‌سازد. TypeScript 6 برای BufferSource در
 * Web Crypto صریحاً ArrayBuffer می‌خواهد (نه ArrayBufferLike/SharedArrayBuffer).
 */
function bytes(view: Uint8Array): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(view.byteLength)
  out.set(view)
  return out
}

function toB64(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (const b of arr) s += String.fromCharCode(b)
  return btoa(s)
}
function fromB64(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function deriveKey(passphrase: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<CryptoKey> {
  const base = await subtle().importKey('raw', bytes(ENC.encode(passphrase)), 'PBKDF2', false, ['deriveKey'])
  return subtle().deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/** یک رشته (JSON) را با عبارت‌عبور رمز می‌کند و یک شیءِ خوداتکا برمی‌گرداند. */
export async function encryptString(plain: string, passphrase: string): Promise<EncryptedBlob> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const key = await deriveKey(passphrase, salt, PBKDF2_ITERATIONS)
  const ct = await subtle().encrypt({ name: 'AES-GCM', iv }, key, bytes(ENC.encode(plain)))
  return { v: 1, kdf: 'PBKDF2-SHA256', iter: PBKDF2_ITERATIONS, salt: toB64(salt), iv: toB64(iv), ct: toB64(ct) }
}

/** خروجیِ encryptString را بازمی‌گشاید. رمزِ غلط یا دستکاری → خطا (نه دادهٔ خراب). */
export async function decryptString(blob: EncryptedBlob, passphrase: string): Promise<string> {
  const key = await deriveKey(passphrase, fromB64(blob.salt), blob.iter)
  try {
    const pt = await subtle().decrypt({ name: 'AES-GCM', iv: fromB64(blob.iv) }, key, fromB64(blob.ct))
    return DEC.decode(pt)
  } catch {
    // AES-GCM در صورتِ عبارت‌عبورِ غلط یا دستکاریِ داده، تأییدِ تگ (auth tag) شکست می‌خورد.
    throw new Error('رمز اشتباه است یا فایلِ بک‌آپ دستکاری شده.')
  }
}

/** تشخیصِ اینکه محتوای بازیابی‌شده رمزنگاری‌شده است یا JSONِ ساده (سازگاری با بک‌آپ‌های قدیمی). */
export function isEncryptedBlob(v: unknown): v is EncryptedBlob {
  return !!v && typeof v === 'object' && (v as { v?: unknown }).v === 1 && 'ct' in (v as object)
}
