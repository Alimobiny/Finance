const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

/** تبدیل ارقام انگلیسی درون یک رشته به ارقام فارسی */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)])
}

/** تبدیل ارقام فارسی/عربی درون یک رشته به ارقام انگلیسی (برای parse کردن ورودی input) */
export function toLatinDigits(input: string): string {
  return input.replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d))).replace(/[٠-٩]/g, (d) =>
    String(d.charCodeAt(0) - 0x0660),
  )
}

/** فرمت عدد با جداکنندهٔ هزارگان و رقم فارسی */
export function faNumber(value: number, decimals = 0): string {
  const n = Number.isFinite(value) ? value : 0
  return toPersianDigits(
    n.toLocaleString('en-US', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }),
  )
}

/** فرمت مبلغ تومانی به شکل خوانا (میلیارد/میلیون/تومان) */
export function faMoney(value: number): string {
  const abs = Math.abs(Number.isFinite(value) ? value : 0)
  const sign = value < 0 ? '−' : ''
  if (abs >= 1e9) {
    const v = abs / 1e9
    return `${sign}${faNumber(v, Number.isInteger(v) ? 0 : 2)} میلیارد ت`
  }
  if (abs >= 1e6) {
    const v = abs / 1e6
    return `${sign}${faNumber(v, Number.isInteger(v) ? 0 : 1)} میلیون ت`
  }
  return `${sign}${faNumber(abs)} ت`
}

/** درصد با یک رقم اعشار پیش‌فرض */
export function faPercent(value: number, decimals = 1): string {
  return `${faNumber(value, decimals)}٪`
}

/** استخراج عدد خام از متن ورودی کاربر (حذف جداکننده و تبدیل ارقام فارسی) */
export function parseNumberInput(raw: string): number {
  const cleaned = toLatinDigits(raw).replace(/[^\d.-]/g, '')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

/**
 * جمعِ ایمنِ اعداد: هر جمله را به شبکهٔ اعشارِ ثابت گرد و به‌صورتِ صحیح جمع می‌زند،
 * تا خطای انباشتِ float در جمع‌های بزرگ (سود کل، مجموع R) رشد نکند. دقتِ decimal.js
 * برای تجمیع، بدون وابستگی. مقادیرِ نامعتبر نادیده گرفته می‌شوند (هرگز NaN).
 */
export function sumRounded(values: readonly number[], decimals = 2): number {
  const f = 10 ** decimals
  let scaled = 0
  for (const v of values) if (Number.isFinite(v)) scaled += Math.round(v * f)
  return scaled / f
}
