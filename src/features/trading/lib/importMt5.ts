import type { TradeDirection } from '../../../types'
import type { NewTradeInput } from '../../../store/slices/tradingSlice'
import { faDateShort } from '../../../lib/format/date'
import { computePlannedRR, computeRFromPrices } from './tradeMath'

// وارد کردن معاملاتِ بسته‌شده از گزارش HTML متاتریدر ۵ (History → Report).
// بخش «Positions» را می‌خوانیم که برای هر پوزیشن این ستون‌ها را دارد (ترتیب ثابت):
//   Time | Position | Symbol | Type | Volume | Price(ورود) | S/L | T/P |
//   Time(بستن) | Price(خروج) | Commission | Swap | Profit
// نگاشت بر پایهٔ ترتیب ستون‌هاست تا به زبان ترمینال وابسته نباشد.

export interface ParsedTrade {
  input: NewTradeInput
  ticket: string
  profit: number | null
}

function num(raw: string | undefined): number | null {
  if (raw == null) return null
  const cleaned = raw.replace(/ /g, ' ').replace(/[\s,]/g, '')
  if (cleaned === '' || cleaned === '-') return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

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
  if (t.includes('buy')) return 'خرید'
  if (t.includes('sell')) return 'فروش'
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
    // ردیف هدر (Symbol/Type/…) یا ردیف‌های خالی/جمع را رد می‌کنیم.
    if (cells.length < 13) {
      if (cells.length > 0 && cells.length < 13) skipped++
      continue
    }
    const dir = directionFrom(cells[3])
    if (!dir) {
      // ردیف هدر یا نامعتبر
      if (!/type/i.test(cells[3])) skipped++
      continue
    }

    const openDate = parseMtDate(cells[0])
    const symbol = cells[2] || 'XAUUSD'
    const entry = num(cells[5])
    const slRaw = num(cells[6])
    const tpRaw = num(cells[7])
    const exit = num(cells[9])
    const profit = num(cells[cells.length - 1])
    const ticket = cells[1] || ''

    // در متاتریدر «0» یعنی حدضرر/حدسود تنظیم نشده.
    const stop = slRaw && slRaw !== 0 ? slRaw : null
    const tp = tpRaw && tpRaw !== 0 ? tpRaw : null

    const r = computeRFromPrices(dir, entry, stop, exit)
    const rr = computePlannedRR(entry, stop, tp)

    const input: NewTradeInput = {
      date: openDate ? faDateShort(openDate) : '',
      symbol,
      dir,
      riskPercent: '',
      entry,
      stop,
      tp,
      exit,
      ticket: ticket || null,
      rr: rr != null ? String(rr) : '',
      r,
      outcome: r != null ? '' : profit != null ? (profit > 0 ? 'win' : profit < 0 ? 'loss' : 'be') : '',
      checklistFollowed: true,
      rule1Followed: true,
      emotion: '',
      reason: '',
      lesson: '',
      shot: null,
    }
    trades.push({ input, ticket: ticket || `${symbol}-${cells[0]}-${cells[8]}`, profit })
  }

  return { trades, skipped }
}
