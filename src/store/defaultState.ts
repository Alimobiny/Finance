import { newId } from '../lib/format/id'
import { SCHEMA_VERSION, type RootState, type TextListItem } from '../types'

/** شناسهٔ ثابت حساب پیش‌فرض تا مهاجرت دادهٔ قدیمی هم به همین حساب بچسبد */
export const DEFAULT_ACCOUNT_ID = 'acc-main'

const textItems = (texts: string[]): TextListItem[] => texts.map((text) => ({ id: newId(), text }))

/**
 * دادهٔ پیش‌فرض اپ برای اولین اجرا. لیست‌های «قانون/راهنما» با محتوای معنادار
 * پر شده‌اند (چون در حالت ویرایش قابل تغییرند)، اما داده‌های شخصی مالی
 * (دارایی‌ها، معاملات، بدهی‌ها، درآمد/هزینه) خالی می‌مانند تا کاربر خودش وارد کند.
 */
export function createDefaultState(): RootState {
  return {
    meta: {
      updatedAt: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
    },
    dashboard: {
      northStar: 'آرامش روانی + ساختن ثروت پایدار — نه هیجان معامله',
      goals: textItems([
        'حفظ ارزش پول در برابر تورم',
        'رشد سرمایه برای اهداف بزرگ زندگی',
        'یادگیری معامله‌گری (عاملی حرفه‌ای آینده)',
      ]),
      ironRules: textItems([
        'ریسک هر معامله ۰.۲۵ تا ۱٪ (ثابت)',
        'رسیدن به ۲٪ ضرر روزانه — توقف',
        'رسیدن به ۴٪ ضرر هفتگی — یک هفته دوری',
        'رسیدن به ۸٪ ضرر ماهانه — یک ماه دوری',
        'بعد از ۲ ضرر متوالی — توقف کامل آن روز',
      ]),
      redLines: textItems([
        'فروش طلا یا دلار برای تأمین سرمایهٔ معامله',
        'انتقال پول پرتفولیو به حساب معاملاتی',
        'جبران ضرر با افزایش حجم (انتقام)',
        'ورود به دارایی جدید بدون دلیل مکتوب',
      ]),
      goldenRule: 'هر تصمیم در استرس یا هیجان — ۲۴ ساعت صبر، سپس با ذهن آرام.',
      marketPulse: '',
      tacticalPulse: '',
    },
    portfolio: {
      holdings: [],
      prices: { usd: 0, usdt: 0, coin: 0, gold18: 0 },
      pricesUpdatedAt: null,
      rebalanceNotes: [],
    },
    trading: {
      accounts: [{ id: DEFAULT_ACCOUNT_ID, name: 'حساب اصلی', balance: 0, riskPercent: 1 }],
      activeAccountId: DEFAULT_ACCOUNT_ID,
      trades: [],
      editingTradeId: null,
      checklistGroups: [
        {
          id: newId(),
          title: 'پیش‌نیاز روانی',
          items: textItems([
            'امروز ۲ ضرر متوالی نخورده‌ام',
            'آرام هستم (نه عصبانی، نه در حال جبران ضرر)',
            'به حد ضرر روزانهٔ ۲٪ نرسیده‌ام',
          ]).map((t) => ({ id: t.id, text: t.text })),
        },
        {
          id: newId(),
          title: 'زمینه و جفت',
          items: textItems(['روند و اولویت در تایم بالا مشخص است', 'جفت معامله با اولویت روند هم‌جهت است']).map(
            (t) => ({ id: t.id, text: t.text }),
          ),
        },
        {
          id: newId(),
          title: 'سطح و اردربلاک',
          items: textItems([
            'قیمت به اردربلاک معتبر (۵ شرط) رسیده است',
            'اردربلاک Unmitigated است (قیمت قبلاً نرسیده)',
          ]).map((t) => ({ id: t.id, text: t.text })),
        },
        {
          id: newId(),
          title: 'ورود و خروج',
          items: textItems(['ساختار ورود در تایم پایین شناسایی شده', 'حد ضرر مشخص است', 'نسبت R:R حداقل ۱:۱ است']).map(
            (t) => ({ id: t.id, text: t.text }),
          ),
        },
        {
          id: newId(),
          title: 'حجم و تعهد',
          items: textItems(['حجم با ریسک ثابت محاسبه شده', 'از ماشین‌حساب استفاده کرده‌ام، نه حدس']).map((t) => ({
            id: t.id,
            text: t.text,
          })),
        },
      ],
      checkedItems: {},
      scoreSections: [
        {
          id: newId(),
          title: 'تحلیل تایم‌فریم',
          single: false,
          options: [
            { id: newId(), label: 'M30', weight: 6.25, on: false },
            { id: newId(), label: 'H1', weight: 5, on: false },
            { id: newId(), label: 'H4', weight: 3.75, on: false },
            { id: newId(), label: 'Daily', weight: 2.5, on: false },
          ],
        },
        {
          id: newId(),
          title: 'جفت روند',
          single: false,
          options: [
            { id: newId(), label: '۱ دقیقه', weight: 5, on: false },
            { id: newId(), label: '۵ دقیقه', weight: 5, on: false },
            { id: newId(), label: '۱۵ دقیقه', weight: 5, on: false },
          ],
        },
        {
          // بخش «وضعیت بازار» — طبق محاسبه‌گر IPS (۵_محاسبه‌گر_معامله). بدون این
          // بخش (۲۷٫۵ امتیاز) حداکثر امتیاز ۴۷٫۵ می‌شد و آستانهٔ ۶۰ هرگز
          // دست‌یافتنی نبود؛ یعنی همیشه «وارد نشو» نمایش داده می‌شد.
          id: newId(),
          title: 'وضعیت بازار',
          single: false,
          options: [
            { id: newId(), label: 'MACD', weight: 5, on: false },
            { id: newId(), label: 'Minor Line', weight: 7.5, on: false },
            { id: newId(), label: 'Major Line', weight: 10, on: false },
            { id: newId(), label: 'Slope', weight: 5, on: false },
          ],
        },
        {
          // چندانتخابی و جمع‌شونده — طبق Plan Trade3 و محاسبه‌گر IPS، یک ست‌آپ
          // می‌تواند چند معیار استراتژی را هم‌زمان برآورده کند و وزن‌ها جمع می‌شوند.
          id: newId(),
          title: 'استراتژی',
          single: false,
          options: [
            { id: newId(), label: 'Miner-EOW', weight: 5, on: false },
            { id: newId(), label: 'Miner-EOC', weight: 15, on: false },
            { id: newId(), label: 'PA-EOW', weight: 5, on: false },
            { id: newId(), label: 'PA-EOC', weight: 15, on: false },
            { id: newId(), label: 'ACD', weight: 10, on: false },
          ],
        },
      ],
      scoreThreshold: 60,
      positionSize: { balanceUsd: 0, riskPercent: 0.5, stopUsd: 0 },
    },
    money: {
      emergencyTarget: 0,
      emergencyCurrent: 0,
      income: textItems(['درآمد اصلی', 'درآمد معامله‌گری', 'سود سرمایه‌گذاری', 'سایر درآمدها']).map((t) => ({
        id: t.id,
        label: t.text,
        value: 0,
      })),
      expenses: textItems(['مسکن', 'خوراک و سوپرمارکت', 'قبض‌ها', 'خودرو و حمل‌ونقل', 'درمان و دارو', 'بیمه', 'تفریح', 'آموزش']).map(
        (t) => ({ id: t.id, label: t.text, value: 0 }),
      ),
      debts: [],
      debtMonthlyCommitment: 0,
      tax: { gross: 0, deduct: 0, exempt: 0, rate: 10 },
    },
    life: {
      anchors: [],
      executionRules: textItems([
        'ماشه اجرا: به‌محض خاموش‌شدن آلارم، قبل از هر کار، برنامه را باز کن',
        'شکست = داده، نه نقص شخصیت',
        'محفوظهٔ آرامش: پیامد نزدیک را بگو — «اگر الان بخوابم، صبح چه می‌شود»',
      ]),
      currentWeekKey: '',
      tasks: [],
      notes: '',
    },
    settings: {
      symbols: textItems(['XAUUSD', 'EURUSD', 'GBPUSD', 'BTCUSD', 'US30']),
      emotions: textItems(['آرام', 'مضطرب', 'عصبانی', 'ترس', 'طمع', 'بی‌تفاوت']),
      lastSyncedAt: null,
    },
    history: { entries: [] },
  }
}
