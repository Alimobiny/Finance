const round2 = (v: number) => Math.round(v * 100) / 100

/**
 * ریسکِ دلاریِ واقعیِ یک معاملهٔ بسته‌شده را از قیمت‌ها و سودِ واقعی بازمی‌سازد —
 * بدونِ نیاز به جدولِ «ارزشِ نماد» یا نرخِ تبدیل، پس برای هر نماد (حتی کراس‌ها) کار می‌کند:
 *
 *   دلار به‌ازای هر واحدِ قیمت (حجم × ارزشِ نماد) = |سود| ÷ |خروج − ورود|
 *   ریسک$ = |ورود − استاپ| × همان
 *
 * فرض: استاپِ گزارش همان استاپِ واقعیِ لحظهٔ ورود است (اگر استاپ را در متاتریدر
 * ترِیل/جابه‌جا نکنی، دقیق است). اگر داده ناقص باشد یا خروج=ورود (حرکتی نبوده)، null.
 */
export function riskFromReport(t: {
  entry: number | null
  stop: number | null
  exit: number | null
  profit: number | null
}): number | null {
  const { entry, stop, exit, profit } = t
  if (entry == null || stop == null || exit == null || profit == null) return null
  const move = Math.abs(exit - entry)
  const stopDist = Math.abs(entry - stop)
  if (move === 0 || stopDist === 0) return null
  const perPoint = Math.abs(profit) / move
  const risk = round2(stopDist * perPoint)
  return risk > 0 ? risk : null
}
