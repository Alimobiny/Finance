import { newId } from '../lib/format/id'
import type { AllocationPreset, Holding } from '../types'

// دادهٔ اولیهٔ پورتفولیو، برگرفته از اکسلِ حسابرسی (Financial Management/سبد دارایی).
// این‌جا فقط ساختار (نامِ دسته‌ها، لایه، درصدِ هدف) و سبدهای الگو تعریف می‌شود؛
// مقادیرِ ریالی را کاربر خودش وارد می‌کند چون مدام تغییر می‌کنند.

/** پالتِ رنگِ دسته‌ها — بین اسلایس و seed مشترک است تا رنگ‌ها یکدست بمانند. */
export const PORTFOLIO_PALETTE = ['#B0832B', '#3E6B5A', '#5B6BA8', '#2C7A6B', '#8C5A8C', '#9A6B1E', '#1A5276', '#8C3A3A']

/** دسته‌های استانداردِ سبد با لایه و هدفِ پیش‌فرض (ستونِ «٪ هدف»ِ شیت۱). */
const STANDARD_DEFS: { name: string; layer: string; target: number }[] = [
  { name: 'گواهی سپرده', layer: 'دفاعی', target: 40 },
  { name: 'صندوق طلا', layer: 'دفاعی', target: 30 },
  { name: 'صندوق نقره', layer: 'دفاعی', target: 15 },
  { name: 'صندوق‌ها', layer: 'رشدی', target: 5 },
  { name: 'صندوق مس', layer: 'کالایی', target: 5 },
  { name: 'زعفران', layer: 'کالایی', target: 5 },
  { name: 'سهام', layer: 'رشدی', target: 0 },
  { name: 'درآمد ثابت', layer: 'دفاعی', target: 0 },
  { name: 'صندوق کالایی', layer: 'کالایی', target: 0 },
  { name: 'کریپتو', layer: 'رشدی', target: 0 },
  { name: 'دلار', layer: 'دفاعی', target: 0 },
]

/** نام‌های استاندارد — برای افزودنِ دسته‌های جامانده بدونِ دستکاریِ موجودها. */
export const STANDARD_BASKET_NAMES = STANDARD_DEFS.map((d) => d.name)

/** لیستِ تازه‌ای از دسته‌های استاندارد (idهای نو). */
export function standardBaskets(): Holding[] {
  return STANDARD_DEFS.map((d, i) => ({
    id: newId(),
    name: d.name,
    layer: d.layer,
    role: '',
    target: d.target,
    color: PORTFOLIO_PALETTE[i % PORTFOLIO_PALETTE.length],
    subs: [],
  }))
}

/** سه سبدِ الگوی هدف (شیت۲ اکسل): کم‌ریسک / دفاعی / جنگی. */
export function defaultAllocationPresets(): AllocationPreset[] {
  return [
    {
      id: newId(),
      name: 'کم‌ریسک',
      weights: [
        { category: 'درآمد ثابت', target: 50 },
        { category: 'صندوق طلا', target: 20 },
        { category: 'صندوق نقره', target: 10 },
        { category: 'سهام', target: 10 },
        { category: 'صندوق کالایی', target: 10 },
      ],
    },
    {
      id: newId(),
      name: 'دفاعی',
      weights: [
        { category: 'صندوق طلا', target: 40 },
        { category: 'گواهی سپرده', target: 30 },
        { category: 'صندوق نقره', target: 10 },
        { category: 'سهام', target: 10 },
        { category: 'درآمد ثابت', target: 10 },
      ],
    },
    {
      id: newId(),
      name: 'جنگی',
      weights: [
        { category: 'صندوق طلا', target: 35 },
        { category: 'گواهی سپرده', target: 25 },
        { category: 'صندوق کالایی', target: 15 },
        { category: 'سهام', target: 15 },
        { category: 'درآمد ثابت', target: 10 },
      ],
    },
  ]
}
