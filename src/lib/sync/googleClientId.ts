// شناسهٔ Google OAuth Client برای همگام‌سازی با Drive.
//
// نکتهٔ امنیتی: OAuth Client ID برای «برنامهٔ وب» عمومی است و در مرورگر ارسال می‌شود؛
// امن است که این‌جا در کد باشد. امنیت واقعی از «Authorized JavaScript origins»
// (که فقط https://alimobiny.github.io مجاز است) می‌آید، نه از مخفی‌بودن این شناسه.
//
// فعال‌سازی: مقدار FALLBACK_CLIENT_ID را با Client ID که از Google Cloud گرفتی جایگزین کن
// (چیزی شبیه «xxxxx.apps.googleusercontent.com»). یا آن را به‌عنوان متغیر
// VITE_GOOGLE_CLIENT_ID در بیلد بگذار.
const FALLBACK_CLIENT_ID = ''

export const GOOGLE_CLIENT_ID: string =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || FALLBACK_CLIENT_ID
