// مدل دادهٔ کامل اپ — این اینترفیس دقیقاً همان چیزی است که در localStorage
// و بعداً در فایل JSON داخل Google Drive ذخیره می‌شود.

export interface Meta {
  updatedAt: string
  schemaVersion: number
}

/** الگوی مشترک لیست‌های متنی ساده (اهداف، قوانین، خط‌قرمزها، نمادها، احساسات و ...) */
export interface TextListItem {
  id: string
  text: string
}

// ==================== داشبورد ====================

export interface DashboardState {
  northStar: string
  goals: TextListItem[]
  ironRules: TextListItem[]
  redLines: TextListItem[]
  goldenRule: string
  marketPulse: string
  tacticalPulse: string
}

// ==================== پرتفولیو ====================

export type PriceKey = 'usd' | 'usdt' | 'coin' | 'gold18'

export type HoldingSub =
  | { id: string; kind: 'manual'; name: string; value: number }
  | { id: string; kind: 'linked'; name: string; unit: PriceKey; qty: number }

export interface Holding {
  id: string
  name: string
  layer: string
  role: string
  target: number // درصد هدف از کل پرتفولیو
  color: string
  subs: HoldingSub[]
}

export interface PortfolioState {
  holdings: Holding[]
  prices: Record<PriceKey, number>
  pricesUpdatedAt: string | null
}

// ==================== معاملات ====================

export type TradeDirection = 'خرید' | 'فروش'
export type TradeOutcome = '' | 'win' | 'loss' | 'be'

export interface Trade {
  id: string
  date: string
  symbol: string
  dir: TradeDirection
  riskPercent: string
  rr: string
  r: number | null
  outcome: TradeOutcome
  checklistFollowed: boolean
  rule1Followed: boolean
  emotion: string
  reason: string
  lesson: string
  /** دیتا-یو‌آر‌ال فشرده‌شدهٔ اسکرین‌شات (حداکثر ~۸۰۰px، کیفیت پایین) */
  shot: string | null
}

export interface ChecklistItem {
  id: string
  text: string
}

export interface ChecklistGroup {
  id: string
  title: string
  items: ChecklistItem[]
}

export interface ScoreOption {
  id: string
  label: string
  weight: number
  on: boolean
}

export interface ScoreSection {
  id: string
  title: string
  /** اگر true باشد فقط یک گزینه هم‌زمان می‌تواند فعال باشد */
  single: boolean
  options: ScoreOption[]
}

export interface PositionSizeInputs {
  balanceUsd: number
  riskPercent: number
  stopUsd: number
}

export interface TradingState {
  trades: Trade[]
  editingTradeId: string | null
  checklistGroups: ChecklistGroup[]
  checkedItems: Record<string, boolean>
  scoreSections: ScoreSection[]
  scoreThreshold: number
  positionSize: PositionSizeInputs
}

// ==================== مالی ====================

export interface LineItem {
  id: string
  label: string
  value: number
}

export type Debt =
  | { id: string; kind: 'installment'; name: string; total: number; monthly: number; count: number; paid: number }
  | { id: string; kind: 'personal'; name: string; total: number; monthly: number; count: number; paid: number }
  | { id: string; kind: 'lumpSum'; name: string; total: number; dueDate: string; settled: boolean }

export interface TaxInputs {
  gross: number
  deduct: number
  exempt: number
  rate: number
}

export interface MoneyState {
  emergencyTarget: number
  emergencyCurrent: number
  income: LineItem[]
  expenses: LineItem[]
  debts: Debt[]
  debtMonthlyCommitment: number
  tax: TaxInputs
}

// ==================== برنامهٔ روزانه ====================

export type DayPeriod = 'صبح' | 'عصر' | 'شب'

export interface TimeAnchor {
  id: string
  name: string
  note: string
  time: string
  period: DayPeriod
  /** اندیس روزهای هفته با مبنای شنبه=۰ */
  activeWeekdays: number[]
  doneWeekdays: number[]
}

export interface LifeState {
  anchors: TimeAnchor[]
  executionRules: TextListItem[]
  /** شناسهٔ هفتهٔ شمسی جاری (برای تشخیص لزوم ریست هفتگی) */
  currentWeekKey: string
}

// ==================== تنظیمات ====================

export interface SettingsState {
  symbols: TextListItem[]
  emotions: TextListItem[]
  lastSyncedAt: string | null
}

// ==================== ریشه ====================

export interface RootState {
  meta: Meta
  dashboard: DashboardState
  portfolio: PortfolioState
  trading: TradingState
  money: MoneyState
  life: LifeState
  settings: SettingsState
}

export const SCHEMA_VERSION = 1
