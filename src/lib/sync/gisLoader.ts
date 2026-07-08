import { GOOGLE_CLIENT_ID } from './googleClientId'

const GIS_SRC = 'https://accounts.google.com/gsi/client'
// drive.file: دسترسی فقط به فایل/پوشه‌هایی که خودِ اپ می‌سازد — این‌ها در Driveِ
// کاربر «قابل‌مشاهده»‌اند (برخلاف appdata که پنهان بود)، تا خودش بک‌آپ‌ها را ببیند.
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'
/** برای جلوگیری از رد شدن توکن درست قبل از استفاده، کمی زودتر منقضی‌شده در نظر می‌گیریم */
const EXPIRY_SAFETY_MARGIN_MS = 30_000

let loadPromise: Promise<void> | null = null

function ensureGisLoaded(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (loadPromise) return loadPromise
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('بارگذاری سرویس ورود گوگل ناموفق بود — اتصال اینترنت را بررسی کن'))
    document.head.appendChild(script)
  })
  return loadPromise
}

let tokenClient: GisTokenClient | null = null
let cachedToken: { accessToken: string; expiresAt: number } | null = null
let pending: { resolve: (token: string) => void; reject: (err: Error) => void } | null = null

function getTokenClient(clientId: string): GisTokenClient {
  if (tokenClient) return tokenClient
  tokenClient = window.google!.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: DRIVE_SCOPE,
    callback: (resp) => {
      const p = pending
      pending = null
      if (resp.access_token && resp.expires_in) {
        cachedToken = { accessToken: resp.access_token, expiresAt: Date.now() + resp.expires_in * 1000 - EXPIRY_SAFETY_MARGIN_MS }
        p?.resolve(resp.access_token)
      } else {
        p?.reject(new Error(resp.error || 'ورود با گوگل ناموفق بود'))
      }
    },
    error_callback: (err) => {
      const p = pending
      pending = null
      p?.reject(new Error(err.type === 'popup_closed' ? 'پنجرهٔ ورود بسته شد' : 'ورود با گوگل ناموفق بود'))
    },
  })
  return tokenClient
}

export function isDriveConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID)
}

/**
 * دریافت توکن دسترسی معتبر. اگر silent باشد، بدون نمایش پنجرهٔ ورود تلاش می‌کند
 * (در صورت وجود نشست فعال گوگل در مرورگر معمولاً بی‌صدا موفق می‌شود).
 */
export async function requestAccessToken(opts: { silent?: boolean } = {}): Promise<string> {
  const clientId = GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('Google Client ID پیکربندی نشده است')

  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.accessToken

  await ensureGisLoaded()
  const client = getTokenClient(clientId)

  return new Promise<string>((resolve, reject) => {
    pending = { resolve, reject }
    client.requestAccessToken(opts.silent ? { prompt: '' } : undefined)
  })
}

export function clearCachedToken(): void {
  cachedToken = null
}
