import type { TradeDirection } from '../../../types'
import type { NewTradeInput } from '../../../store/slices/tradingSlice'
import { faDateShort } from '../../../lib/format/date'

// وارد کردن معاملاتِ بسته‌شده از گزارش HTML متاتریدر ۵ (History → Report).
// بخش «Positions» را می‌خوانیم که برای هر پوزیشن این ستون‌ها را دارد:
//   Time | Position | Symbol | Type | [سلول خالی] | Volume | Price(ورود) | S/L | T/P |
//   Time(بستن) | Price(خروج) | Commission | Swap | Profit
// نکتهٔ کلیدی: ردیف داده در نسخه‌های جدید متاتریدر یک «سلول خالیِ فاصله» بعد از Type دارد
// که ردیف هدر ندارد؛ برای همین به‌جای اندیس ثابت، از محل ستون Type لنگر می‌گیریم و در صورت
// وجود آن سلول خالی، یکی جلو می‌رویم. این باگ باعث می‌شد ورود/خروج اشتباه خوانده و R خراب شود.

export interface ParsedTrade {
  input: NewTradeInput
  ticket: string
  profit: number | null
}

/**
 * فایل گزارش متاتریدر معمولاً UTF-16LE (با BOM) ذخیره می‌شود؛ خواندنِ خام آن به‌صورت UTF-8
 * داده را خراب می‌کند. اینجا از روی BOM انکودینگ را تشخیص می‌دهیم و درست رمزگشایی می‌کنیم.
 */
export function decodeReport(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(buffer)
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(buffer)
  return new TextDecoder('utf-8').decode(buffer)
}

function num(raw: string | undefined): number | null {
  if (raw == null) return null
  const cleaned = raw.replace(/ /g, ' ').replace(/[\s,]/g, '')
  if (cleaned === '' || cleaned === '-') return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

const round2 = (v: number) => Math.round(v * 100) / 100

/** «2026.07.03 10:15:30» → Date؛ اگر نشد null. */
function parseMtDate(raw: string | undefined): Date | null {
  if (!raw) return null
  const m = raw.match(/(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/)
  if (!m) return null
  const [, y, mo, d, h, mi, s] = m
  const date = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s ?? '0'))
  return Number.isNaN(date.getTime()) ? null : date
}

function directionFrom(typeCell: string): TradeDirection | null {
  const t = typeCell.trim().toLowerCase()
  if (/^buy\b/.test(t)) return 'خرید'
  if (/^sell\b/.test(t)) return 'فروش'
  return null
}

function cellsOf(row: Element): string[] {
  return Array.from(row.querySelectorAll('td, th')).map((c) => (c.textContent ?? '').trim())
}

export interface Mt5ParseResult {
  trades: ParsedTrade[]
  /** تعداد ردیف‌هایی که در بخش Positions بودند ولی قابل‌خواندن نبودند (برای هشدار). */
  skipped: number
}

export function parseMt5Html(html: string): Mt5ParseResult {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const rows = Array.from(doc.querySelectorAll('tr'))

  const trades: ParsedTrade[] = []
  let skipped = 0
  let inPositions = false

  for (const row of rows) {
    const text = (row.textContent ?? '').trim()

    // شروع/پایان بخش‌ها را با تیتر تشخیص می‌دهیم.
    if (/^Positions\b/i.test(text)) {
      inPositions = true
      continue
    }
    if (/^(Orders|Deals|Results|Summary)\b/i.test(text)) {
      inPositions = false
      continue
    }
    if (!inPositions) continue

    const cells = cellsOf(row)
    // ستون Type (buy/sell) لنگر ماست؛ ردیف هدر و ردیف‌های جمع، این ستون را ندارند.
    const typeIdx = cells.findIndex((c) => directionFrom(c) != null)
    if (typeIdx < 3) continue // ردیف هدر/جمع بدون ستون نوع
    const dir = directionFrom(cells[typeIdx])!

    // بعد از Type ممکن است یک سلول خالیِ فاصله باشد؛ اگر بود، رد شو.
    let vi = typeIdx + 1
    if (cells[vi] != null && cells[vi].trim() === '') vi++

    // برای خواندن ورود/حدضرر/خروج به دست‌کم vi+5 سلول نیاز داریم.
    if (cells.length < vi + 6) {
      skipped++
      continue
    }

    const openDate = parseMtDate(cells[typeIdx - 3])
    const ticket = cells[typeIdx - 2] || ''
    const symbol = (cells[typeIdx - 1] || 'XAUUSD').replace(/!+$/, '')
    const entry = num(cells[vi + 1])
    const slRaw = num(cells[vi + 2])
    const exit = num(cells[vi + 5])

    // در متاتریدر «0» یعنی حدضرر تنظیم نشده. حدضرر گزارش «آخرین» مقدار است، نه اولیه؛
    // برای همین R را از قیمت حساب نمی‌کنیم و فقط برای اطلاع ذخیره‌اش می‌کنیم.
    const stop = slRaw && slRaw !== 0 ? slRaw : null

    // سود/زیان خالص = Profit + Swap + Commission (سه ستون آخر) به دلار.
    const gross = num(cells[cells.length - 1])
    const swap = num(cells[cells.length - 2]) ?? 0
    const commission = num(cells[cells.length - 3]) ?? 0
    const profit = gross == null ? null : round2(gross + swap + commission)

    const input: NewTradeInput = {
      date: openDate ? faDateShort(openDate) : '',
      symbol,
      dir,
      riskPercent: '',
      entry,
      stop,
      tp: null,
      exit,
      profit,
      // R نهایی در استور از روی سود ÷ «ریسک ثابت حساب» محاسبه می‌شود (اینجا هنوز نامعلوم).
      r: null,
      ticket: ticket || null,
      rr: '',
      outcome: profit != null ? (profit > 0 ? 'win' : profit < 0 ? 'loss' : 'be') : '',
      checklistFollowed: true,
      rule1Followed: true,
      emotion: '',
      reason: '',
      lesson: '',
      shot: null,
    }
    trades.push({ input, ticket: ticket || `${symbol}-${cells[typeIdx - 3]}`, profit })
  }

  return { trades, skipped }
}
