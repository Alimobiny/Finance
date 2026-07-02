/** ابزارهای سبک رنگ برای ساختن طیف هم‌خانوادهٔ یک رنگ پایه (برای نمودار زیر‌دارایی‌ها). */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

/**
 * n سایهٔ هم‌خانواده از یک رنگ پایه می‌سازد (از خودِ رنگ به سمت روشن‌تر).
 * برای نمایش زیر‌دارایی‌ها به‌شکل طیفی از رنگ خودِ دارایی استفاده می‌شود.
 */
export function tintPalette(base: string, n: number): string[] {
  if (n <= 1) return [base]
  const [r, g, b] = hexToRgb(base)
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * 0.62 // ۰ تا ۰٫۶۲ به سمت سفید
    out.push(rgbToHex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t))
  }
  return out
}
