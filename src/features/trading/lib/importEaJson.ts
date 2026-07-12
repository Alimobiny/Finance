import type { TradeDirection } from '../../../types'
import type { NewTradeInput } from '../../../store/slices/tradingSlice'
import { faDateShort } from '../../../lib/format/date'
import { parseMtDate, sanePlannedRR, type Mt5ParseResult, type ParsedTrade } from './importMt5'
import { riskFromReport } from './tradeRisk'

// وارد کردن معاملات از خروجیِ JSONِ Expert Advisorِ «قطب‌نما» (فایل mt5-ea).
// مزیتِ این مسیر نسبت به گزارشِ HTML: EA در لحظهٔ ورود، «استاپِ اولیه» و «ریسکِ
// واقعیِ دلاری» را ثبت می‌کند؛ پس هم R دقیق (سود ÷ ریسکِ واقعی) و هم R:R واقعی است
// (بدون آرتیفکتِ استاپِ تریل‌شده).

/** یک رکورد معامله در خروجیِ EA. همهٔ فیلدها اختیاری‌اند تا نسخه‌های قدیمی‌تر هم بخوانند. */
interface EaTrade {
  ticket?: string | number
  symbol?: string
  type?: string | number // "buy"/"sell" یا 0/1
  lot?: number
  openTime?: string
  openPrice?: number
  initialSL?: number
  tp?: number
  closeTime?: string
  closePrice?: number
  profit?: number // سودِ خالص (شاملِ کمیسیون و سواپ)
  commission?: number
  swap?: number
  riskUsd?: number
}

const round2 = (v: number) => Math.round(v * 100) / 100
const fin = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

function eaDirection(type: EaTrade['type']): TradeDirection | null {
  if (typeof type === 'number') return type === 0 ? 'خرید' : type === 1 ? 'فروش' : null
  const t = (type ?? '').toString().trim().toLowerCase()
  if (t.startsWith('buy')) return 'خرید'
  if (t.startsWith('sell')) return 'فروش'
  return null
}

/** تشخیصِ سریع اینکه محتوای فایل JSONِ EA است (نه گزارشِ HTML متاتریدر). */
export function looksLikeEaJson(text: string): boolean {
  const t = text.trimStart()
  return t.startsWith('{') || t.startsWith('[')
}

/** حالتِ JSONL: هر خط یک آبجکتِ معامله (EA برای append ساده این را تولید می‌کند). */
function parseJsonl(text: string): EaTrade[] {
  const out: EaTrade[] = []
  for (const line of text.split(/\r?\n/)) {
    const l = line.trim()
    if (!l || l[0] !== '{') continue
    try {
      out.push(JSON.parse(l) as EaTrade)
    } catch {
      // خطِ خراب را رد کن
    }
  }
  return out
}

/** دادهٔ پارس‌شده را به آرایه‌ای از رکوردها تبدیل می‌کند: آرایه، یا {trades:[]}، یا یک آبجکتِ تکِ معامله. */
function asRows(data: unknown): EaTrade[] {
  if (Array.isArray(data)) return data as EaTrade[]
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.trades)) return obj.trades as EaTrade[]
    // فایل/خطِ تکِ یک معامله (مثلاً وقتی فقط یک معامله ثبت شده)
    if ('openPrice' in obj || 'type' in obj || 'ticket' in obj) return [obj as EaTrade]
  }
  return []
}

export function parseEaJson(text: string): Mt5ParseResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    // شاید JSONL باشد (خروجیِ append‌شدهٔ EA، چند خط)
    const fromLines = parseJsonl(text)
    if (fromLines.length === 0) return { trades: [], skipped: 0 }
    data = fromLines
  }

  const rows: EaTrade[] = asRows(data)

  const trades: ParsedTrade[] = []
  let skipped = 0

  for (const row of rows) {
    const dir = eaDirection(row.type)
    const entry = fin(row.openPrice) ? row.openPrice : null
    if (!dir || entry == null) {
      skipped++
      continue
    }

    const stop = fin(row.initialSL) && row.initialSL !== 0 ? row.initialSL : null
    const tp = fin(row.tp) && row.tp !== 0 ? row.tp : null
    const exit = fin(row.closePrice) ? row.closePrice : null
    const profit = fin(row.profit) ? round2(row.profit) : null
    const riskUsd = fin(row.riskUsd) && row.riskUsd > 0 ? round2(row.riskUsd) : null
    // استاپِ اولیه واقعی است، پس R:R معنا دارد (با همان سقفِ منطقیِ ≤۱۰).
    const rr = sanePlannedRR(entry, stop, tp)
    const ticket = row.ticket != null ? String(row.ticket) : null
    const openDate = parseMtDate(row.openTime)
    const symbol = (row.symbol || 'XAUUSD').toString().trim()

    const input: NewTradeInput = {
      date: openDate ? faDateShort(openDate) : '',
      symbol,
      dir,
      riskPercent: '',
      entry,
      stop,
      tp,
      exit,
      profit,
      commission: fin(row.commission) ? round2(row.commission) : null,
      swap: fin(row.swap) ? round2(row.swap) : null,
      // ریسکِ واقعیِ EA اولویت دارد؛ اگر EA آن را نداد، از قیمت‌ها و سود بازسازی می‌کنیم.
      riskUsd: riskUsd ?? riskFromReport({ entry, stop, exit, profit }),
      r: null, // R نهایی در استور: سود ÷ ریسکِ واقعی (riskUsd) اگر بود
      ticket,
      rr: rr != null ? String(rr) : '',
      outcome: profit != null ? (profit > 0 ? 'win' : profit < 0 ? 'loss' : 'be') : '',
      checklistFollowed: true,
      rule1Followed: true,
      emotion: '',
      setup: '',
      mistake: '',
      score: null,
      reason: '',
      lesson: '',
      shot: null,
    }
    trades.push({ input, ticket: ticket ?? `${symbol}-${row.openTime ?? ''}`, profit })
  }

  return { trades, skipped }
}
