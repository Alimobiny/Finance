import { useEffect, useState } from 'react'
import { useRootStore } from '../../../store/rootStore'
import { resizeImageFile } from '../../../lib/image/resizeImage'
import type { NewTradeInput } from '../../../store/slices/tradingSlice'
import type { TradeDirection, TradeOutcome } from '../../../types'
import { faDateShort } from '../../../lib/format/date'
import { toLatinDigits } from '../../../lib/format/number'
import { accountRiskAmount, computePlannedRR, computeRFromPrices, parsePriceInput, rFromProfit } from '../lib/tradeMath'

/** متن ورودی «نتیجهٔ R» را به عدد پاک یا null تبدیل می‌کند (هرگز NaN). */
function parseRInput(raw: string): number | null {
  const cleaned = toLatinDigits(raw).replace(/[^\d.-]/g, '')
  if (cleaned === '' || cleaned === '-' || cleaned === '.' || cleaned === '-.') return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

/** متن ورودی «امتیاز ست‌آپ» را به عدد مثبت یا null تبدیل می‌کند (هرگز NaN/منفی). */
function parseScoreInput(raw: string): number | null {
  const cleaned = toLatinDigits(raw).replace(/[^\d.]/g, '')
  if (cleaned === '' || cleaned === '.') return null
  const n = Number(cleaned)
  return Number.isFinite(n) && n >= 0 ? n : null
}

const EMPTY_PRICES = { entry: '', stop: '', tp: '', exit: '' }

const OUTCOME_FROM_R = (r: number): TradeOutcome => (r > 0 ? 'win' : r < 0 ? 'loss' : 'be')
const OUTCOME_LABEL: Record<TradeOutcome, string> = { '': '—', win: 'برد', loss: 'باخت', be: 'سربه‌سر' }

const EMPTY_FORM: NewTradeInput = {
  date: '',
  symbol: '',
  dir: 'خرید',
  riskPercent: '',
  entry: null,
  stop: null,
  tp: null,
  exit: null,
  profit: null,
  commission: null,
  swap: null,
  ticket: null,
  rr: '',
  r: null,
  riskUsd: null,
  outcome: '',
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

export function TradeForm() {
  const symbols = useRootStore((s) => s.settings.symbols)
  const emotions = useRootStore((s) => s.settings.emotions)
  const setups = useRootStore((s) => s.settings.setups)
  const mistakes = useRootStore((s) => s.settings.mistakes)
  const trades = useRootStore((s) => s.trading.trades)
  const accounts = useRootStore((s) => s.trading.accounts)
  const activeAccountId = useRootStore((s) => s.trading.activeAccountId)
  const activeAccount = accounts.find((a) => a.id === activeAccountId)
  const activeRisk = activeAccount ? accountRiskAmount(activeAccount) : 0
  const editingTradeId = useRootStore((s) => s.trading.editingTradeId)
  const addTrade = useRootStore((s) => s.addTrade)
  const updateTrade = useRootStore((s) => s.updateTrade)
  const cancelEditTrade = useRootStore((s) => s.cancelEditTrade)

  const [form, setForm] = useState<NewTradeInput>(EMPTY_FORM)
  // متن خام فیلدهای عددی را جدا نگه می‌داریم تا تایپ «-» یا «1.» وسط کار به null تبدیل نشود.
  const [rText, setRText] = useState('')
  const [riskUsdText, setRiskUsdText] = useState('')
  const [scoreText, setScoreText] = useState('')
  const [priceText, setPriceText] = useState(EMPTY_PRICES)
  const [imageBusy, setImageBusy] = useState(false)

  const editingTrade = editingTradeId ? trades.find((t) => t.id === editingTradeId) : null

  useEffect(() => {
    if (editingTrade) {
      const { id: _id, ...rest } = editingTrade
      setForm(rest)
      setRText(rest.r != null && Number.isFinite(rest.r) ? String(rest.r) : '')
      const num = (v: number | null | undefined) => (v != null && Number.isFinite(v) ? String(v) : '')
      setRiskUsdText(num(rest.riskUsd))
      setScoreText(num(rest.score))
      setPriceText({ entry: num(rest.entry), stop: num(rest.stop), tp: num(rest.tp), exit: num(rest.exit) })
    }
  }, [editingTrade])

  const entryN = parsePriceInput(priceText.entry)
  const stopN = parsePriceInput(priceText.stop)
  const tpN = parsePriceInput(priceText.tp)
  const exitN = parsePriceInput(priceText.exit)

  // معاملهٔ دارای سود واقعی: R از سود ÷ ریسک می‌آید. ریسکِ واقعیِ همین معامله (اگر
  // وارد شود) بر ریسکِ ثابتِ حساب مقدم است — چون ریسکِ هر معامله در عمل فرق می‌کند.
  const isImported = form.profit != null
  const riskUsdN = parsePriceInput(riskUsdText)
  const effectiveRisk = riskUsdN ?? activeRisk
  const usingTradeRisk = riskUsdN != null
  const profitR = isImported ? rFromProfit(form.profit, effectiveRisk) : null

  // اگر قیمت‌ها کامل باشند، R و R:R خودکار و عینی محاسبه می‌شوند و بر ورودی دستی مقدم‌اند.
  const computedR = isImported ? profitR : computeRFromPrices(form.dir, entryN, stopN, exitN)
  const computedRR = isImported ? null : computePlannedRR(entryN, stopN, tpN)
  const rFromPrices = computedR != null
  const rrFromPrices = computedRR != null

  const rNum = computedR ?? parseRInput(rText)
  const rrValue = rrFromPrices ? String(computedRR) : form.rr
  const rLocked = rNum != null // وقتی R عدد معتبری است، نتیجه از آن مشتق و قفل می‌شود
  const shownOutcome: TradeOutcome = rLocked ? OUTCOME_FROM_R(rNum) : form.outcome

  function setPrice(key: keyof typeof EMPTY_PRICES, value: string) {
    setPriceText((p) => ({ ...p, [key]: value }))
  }

  function set<K extends keyof NewTradeInput>(key: K, value: NewTradeInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onShot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageBusy(true)
    try {
      const dataUrl = await resizeImageFile(file)
      set('shot', dataUrl)
    } finally {
      setImageBusy(false)
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.symbol.trim() && rNum == null && !form.outcome) return
    const payload: NewTradeInput = {
      ...form,
      entry: entryN,
      stop: stopN,
      tp: tpN,
      exit: exitN,
      rr: rrValue,
      r: rNum, // همیشه عدد پاک یا null — هرگز NaN (از قیمت‌ها یا ورودی دستی)
      riskUsd: riskUsdN,
      score: parseScoreInput(scoreText),
      outcome: rLocked ? '' : form.outcome, // با R معتبر، نتیجه از R مشتق می‌شود
      date: form.date || faDateShort(new Date()),
      symbol: form.symbol.trim() || 'XAUUSD',
    }
    if (editingTradeId) updateTrade(editingTradeId, payload)
    else addTrade(payload)
    setForm(EMPTY_FORM)
    setRText('')
    setRiskUsdText('')
    setScoreText('')
    setPriceText(EMPTY_PRICES)
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18, marginBottom: 16 }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 14 }}>{editingTradeId ? 'ویرایش معامله' : 'ثبت معاملهٔ جدید'}</div>
      <form onSubmit={onSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(125px,1fr))', gap: 10 }}>
          <Field label="تاریخ">
            <input value={form.date} onChange={(e) => set('date', e.target.value)} placeholder="۱۴۰۴/۴/۷" style={inputStyle} />
          </Field>
          <Field label="نماد">
            <input value={form.symbol} onChange={(e) => set('symbol', e.target.value)} list="symlist" placeholder="XAUUSD یا تایپ کن" style={inputStyle} />
            <datalist id="symlist">
              {symbols.map((sy) => (
                <option key={sy.id} value={sy.text} />
              ))}
            </datalist>
          </Field>
          <Field label="جهت">
            <select value={form.dir} onChange={(e) => set('dir', e.target.value as TradeDirection)} style={inputStyle}>
              <option>خرید</option>
              <option>فروش</option>
            </select>
          </Field>
          <Field label="ریسک٪">
            <input value={form.riskPercent} onChange={(e) => set('riskPercent', e.target.value)} placeholder="0.5" inputMode="decimal" style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }} />
          </Field>
          <Field label="ریسک واقعی ($)">
            <input
              value={riskUsdText}
              onChange={(e) => setRiskUsdText(e.target.value)}
              placeholder="مثلاً 50"
              inputMode="decimal"
              title="مبلغ دلاریِ واقعیِ ریسکِ همین معامله (لات × فاصلهٔ استاپِ اولیه). اگر پر شود، R از همین حساب می‌شود، نه ریسکِ ثابتِ حساب."
              style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }}
            />
          </Field>
          <Field label="قیمت ورود">
            <input value={priceText.entry} onChange={(e) => setPrice('entry', e.target.value)} placeholder="مثلاً 3450" inputMode="decimal" style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }} />
          </Field>
          <Field label="حد ضرر (SL)">
            <input value={priceText.stop} onChange={(e) => setPrice('stop', e.target.value)} placeholder="مثلاً 3440" inputMode="decimal" style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }} />
          </Field>
          <Field label="حد سود (TP)">
            <input value={priceText.tp} onChange={(e) => setPrice('tp', e.target.value)} placeholder="اختیاری" inputMode="decimal" style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }} />
          </Field>
          <Field label="قیمت خروج">
            <input value={priceText.exit} onChange={(e) => setPrice('exit', e.target.value)} placeholder="بعد از بستن" inputMode="decimal" style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }} />
          </Field>
          <Field label={rrFromPrices ? 'R:R هدف · خودکار' : 'R:R هدف'}>
            <input
              value={rrValue}
              onChange={(e) => set('rr', e.target.value)}
              readOnly={rrFromPrices}
              placeholder="2"
              inputMode="decimal"
              title={rrFromPrices ? 'از ورود/حدضرر/حدسود حساب شد' : undefined}
              style={{ ...inputStyle, direction: 'ltr', textAlign: 'left', ...(rrFromPrices ? lockedStyle : null) }}
            />
          </Field>
          <Field label={rFromPrices ? (isImported ? 'نتیجهٔ R · از سود' : 'نتیجهٔ R · خودکار') : 'نتیجهٔ R'}>
            <input
              value={rFromPrices ? String(computedR) : rText}
              onChange={(e) => setRText(e.target.value)}
              readOnly={rFromPrices}
              placeholder="مثلاً 2 یا -1"
              inputMode="decimal"
              title={rFromPrices ? (isImported ? `از سود ÷ ${usingTradeRisk ? 'ریسکِ واقعیِ معامله' : 'مبلغ ریسکِ ثابتِ حساب'} حساب شد` : 'از ورود/حدضرر/خروج حساب شد') : undefined}
              style={{ ...inputStyle, direction: 'ltr', textAlign: 'left', ...(rFromPrices ? lockedStyle : null) }}
            />
          </Field>
          <Field label="نتیجه">
            {rLocked ? (
              // با R معتبر، نتیجه از علامت R مشتق و قفل می‌شود تا تناقض «باخت با R مثبت» رخ ندهد.
              <div
                title="نتیجه از «نتیجهٔ R» گرفته می‌شود؛ برای تغییر، مقدار R را ویرایش کن."
                style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', cursor: 'not-allowed' }}
              >
                <span>{OUTCOME_LABEL[shownOutcome]}</span>
                <span style={{ fontSize: 10, color: 'var(--text-quiet)' }}>· خودکار از R</span>
              </div>
            ) : (
              <select value={form.outcome} onChange={(e) => set('outcome', e.target.value as TradeOutcome)} style={inputStyle}>
                <option value="">— (R را وارد کن)</option>
                <option value="win">برد</option>
                <option value="loss">باخت</option>
                <option value="be">سربه‌سر</option>
              </select>
            )}
          </Field>
          <Field label="چک‌لیست کامل؟">
            <select value={form.checklistFollowed ? 'yes' : 'no'} onChange={(e) => set('checklistFollowed', e.target.value === 'yes')} style={inputStyle}>
              <option value="yes">بله</option>
              <option value="no">خیر</option>
            </select>
          </Field>
          <Field label="قانون ۱ رعایت شد؟">
            <select value={form.rule1Followed ? 'yes' : 'no'} onChange={(e) => set('rule1Followed', e.target.value === 'yes')} style={inputStyle}>
              <option value="yes">بله</option>
              <option value="no">خیر</option>
            </select>
          </Field>
          <Field label="احساس">
            <select value={form.emotion} onChange={(e) => set('emotion', e.target.value)} style={inputStyle}>
              <option value="">—</option>
              {emotions.map((em) => (
                <option key={em.id} value={em.text}>
                  {em.text}
                </option>
              ))}
            </select>
          </Field>
          <Field label="ست‌آپ">
            <input value={form.setup} onChange={(e) => set('setup', e.target.value)} list="setuplist" placeholder="مثلاً ACD" style={inputStyle} />
            <datalist id="setuplist">
              {setups.map((x) => (
                <option key={x.id} value={x.text} />
              ))}
            </datalist>
          </Field>
          <Field label="اشتباه (اگر بود)">
            <input value={form.mistake} onChange={(e) => set('mistake', e.target.value)} list="mistakelist" placeholder="—" style={inputStyle} />
            <datalist id="mistakelist">
              {mistakes.map((x) => (
                <option key={x.id} value={x.text} />
              ))}
            </datalist>
          </Field>
          <Field label="امتیاز ست‌آپ">
            <input value={scoreText} onChange={(e) => setScoreText(e.target.value)} placeholder="۰ تا ۱۰۰" inputMode="decimal" style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }} />
          </Field>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 9, lineHeight: 1.6 }}>
          اگر «ورود»، «حد ضرر» و «خروج» را وارد کنی، <b style={{ color: 'var(--accent-green)' }}>نتیجهٔ R و R:R خودکار و دقیق</b> محاسبه می‌شوند و دیگر خطای دستی ممکن نیست. در غیر این‌صورت می‌توانی همان R را دستی وارد کنی.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          <input value={form.reason} onChange={(e) => set('reason', e.target.value)} placeholder="علت ورود" style={inputStyle} />
          <input value={form.lesson} onChange={(e) => set('lesson', e.target.value)} placeholder="درس این معامله" style={inputStyle} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginTop: 12, flexWrap: 'wrap' }}>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              border: '1px dashed var(--border-strong)',
              background: 'var(--surface-muted)',
              borderRadius: 9,
              padding: '9px 14px',
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            <span style={{ fontSize: 14 }}>📎</span>
            {imageBusy ? 'در حال فشرده‌سازی…' : 'عکس چارت/معامله'}
            <input type="file" accept="image/*" onChange={onShot} style={{ display: 'none' }} />
          </label>
          {form.shot && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ height: 42, width: 64, borderRadius: 7, border: '1px solid var(--border)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${form.shot})` }} />
              <button type="button" onClick={() => set('shot', null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red-strong)', fontSize: 12, fontWeight: 600 }}>
                حذف عکس
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 13 }}>
          <button
            type="submit"
            style={{ border: 'none', cursor: 'pointer', background: 'var(--accent-red)', color: '#fff', borderRadius: 10, padding: '10px 22px', fontSize: 13.5, fontWeight: 700 }}
          >
            {editingTradeId ? 'ذخیرهٔ تغییرات' : 'ثبت در ژورنال'}
          </button>
          {editingTradeId && (
            <button
              type="button"
              onClick={() => {
                cancelEditTrade()
                setForm(EMPTY_FORM)
                setRText('')
                setRiskUsdText('')
                setScoreText('')
                setPriceText(EMPTY_PRICES)
              }}
              style={{ border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}
            >
              انصراف
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  marginTop: 4,
  width: '100%',
  border: '1px solid var(--border)',
  borderRadius: 9,
  padding: '8px 10px',
  fontSize: 12.5,
  background: 'var(--surface-muted)',
  outline: 'none',
}

// ظاهر فیلدهای «قفل‌شده» که مقدارشان خودکار از قیمت‌ها می‌آید.
const lockedStyle: React.CSSProperties = {
  background: 'var(--accent-green-soft)',
  borderColor: 'transparent',
  color: 'var(--accent-green)',
  fontWeight: 700,
  cursor: 'not-allowed',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>
      {label}
      {children}
    </label>
  )
}

