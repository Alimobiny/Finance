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
  /** یادداشت‌های تعادل قابل‌ویرایش کاربر (جدا از پیشنهاد خودکار محاسبه‌شده) */
  rebalanceNotes: TextListItem[]
}

// ==================== معاملات ====================

export type TradeDirection = 'خرید' | 'فروش'
export type TradeOutcome = '' | 'win' | 'loss' | 'be'

export interface Trade {
  id: string
  /** شناسهٔ حساب معاملاتیِ صاحب این معامله (برای ژورنال‌های جدا) */
  accountId: string
  date: string
  symbol: string
  dir: TradeDirection
  riskPercent: string
  /** قیمت‌های ورود/حدضرر/حدسود/خروج — اگر پر شوند، R و R:R خودکار و عینی محاسبه می‌شوند */
  entry: number | null
  stop: number | null
  tp: number | null
  exit: number | null
  /** سود/زیان خالص واقعی (به دلار) برای معاملات وارد‌شده از متاتریدر؛ ثبت دستی null.
   *  R نهایی = این سود ÷ «مبلغ ریسک هر معاملهٔ» حساب. */
  profit: number | null
  /** شناسهٔ پوزیشن در متاتریدر (برای تکراری‌زدایی هنگام وارد کردن گزارش)؛ برای ثبت دستی null */
  ticket: string | null
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

/** یک حساب معاملاتی جدا با ژورنال مستقل خودش */
export interface TradingAccount {
  id: string
  name: string
  /** مبلغ ریسک هر معامله به دلار — مبنای محاسبهٔ R برای معاملات وارد‌شده (R = سود ÷ این مبلغ).
   *  چون سیو سود/ریسک‌فری/تریلینگ داری، R از روی «آخرین حد ضرر» گزارش غلط می‌شود؛ ریسک ثابت درست است. */
  riskPerTrade: number
}

export interface TradingState {
  accounts: TradingAccount[]
  activeAccountId: string
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

/** یک کار/تسک ساده با امکان تیک‌زدن (برای بخش «کارها و نوت‌ها») */
export interface TodoItem {
  id: string
  text: string
  done: boolean
}

export interface LifeState {
  anchors: TimeAnchor[]
  executionRules: TextListItem[]
  /** شناسهٔ هفتهٔ شمسی جاری (برای تشخیص لزوم ریست هفتگی) */
  currentWeekKey: string
  /** کارهای قابل‌تیک (جایگزین بخش «مسیر آزادی از بدهی») */
  tasks: TodoItem[]
  /** یادداشت آزاد */
  notes: string
}

// ==================== تنظیمات ====================

export interface SettingsState {
  symbols: TextListItem[]
  emotions: TextListItem[]
  lastSyncedAt: string | null
  /** یوزرنیم کانال‌های عمومی تلگرام برای خلاصهٔ اخبار (حداکثر ۵) */
  newsChannels: string[]
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

export const SCHEMA_VERSION = 2
