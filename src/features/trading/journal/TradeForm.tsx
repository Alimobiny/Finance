import { useEffect, useState } from 'react'
import { useRootStore } from '../../../store/rootStore'
import { resizeImageFile } from '../../../lib/image/resizeImage'
import type { NewTradeInput } from '../../../store/slices/tradingSlice'
import type { TradeDirection, TradeOutcome } from '../../../types'
import { faDateShort } from '../../../lib/format/date'

const EMPTY_FORM: NewTradeInput = {
  date: '',
  symbol: '',
  dir: 'خرید',
  riskPercent: '',
  rr: '',
  r: null,
  outcome: '',
  checklistFollowed: true,
  rule1Followed: true,
  emotion: '',
  reason: '',
  lesson: '',
  shot: null,
}

export function TradeForm() {
  const symbols = useRootStore((s) => s.settings.symbols)
  const emotions = useRootStore((s) => s.settings.emotions)
  const trades = useRootStore((s) => s.trading.trades)
  const editingTradeId = useRootStore((s) => s.trading.editingTradeId)
  const addTrade = useRootStore((s) => s.addTrade)
  const updateTrade = useRootStore((s) => s.updateTrade)
  const cancelEditTrade = useRootStore((s) => s.cancelEditTrade)

  const [form, setForm] = useState<NewTradeInput>(EMPTY_FORM)
  const [imageBusy, setImageBusy] = useState(false)

  const editingTrade = editingTradeId ? trades.find((t) => t.id === editingTradeId) : null

  useEffect(() => {
    if (editingTrade) {
      const { id: _id, ...rest } = editingTrade
      setForm(rest)
    }
  }, [editingTrade])

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
    if (!form.symbol.trim() && form.r == null && !form.outcome) return
    const payload: NewTradeInput = {
      ...form,
      date: form.date || faDateShort(new Date()),
      symbol: form.symbol.trim() || 'XAUUSD',
    }
    if (editingTradeId) updateTrade(editingTradeId, payload)
    else addTrade(payload)
    setForm(EMPTY_FORM)
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
          <Field label="R:R هدف">
            <input value={form.rr} onChange={(e) => set('rr', e.target.value)} placeholder="2" inputMode="decimal" style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }} />
          </Field>
          <Field label="نتیجهٔ R">
            <input
              value={form.r ?? ''}
              onChange={(e) => set('r', e.target.value === '' ? null : Number(e.target.value))}
              placeholder="مثلاً 2 یا -1"
              inputMode="decimal"
              style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }}
            />
          </Field>
          <Field label="نتیجه">
            <select value={form.outcome} onChange={(e) => set('outcome', e.target.value as TradeOutcome)} style={inputStyle}>
              <option value="">خودکار (از R)</option>
              <option value="win">برد</option>
              <option value="loss">باخت</option>
              <option value="be">سربه‌سر</option>
            </select>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>
      {label}
      {children}
    </label>
  )
}

