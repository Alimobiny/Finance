import { useState } from 'react'
import { useRootStore } from '../../../store/rootStore'
import { parseMt5Html, type ParsedTrade } from '../lib/importMt5'

type Stage =
  | { kind: 'idle' }
  | { kind: 'parsed'; trades: ParsedTrade[]; skipped: number; fileName: string }
  | { kind: 'done'; added: number; skipped: number }
  | { kind: 'error'; msg: string }

const OUTCOME_LABEL: Record<string, string> = { win: 'برد', loss: 'باخت', be: 'سربه‌سر', '': '—' }

export function ImportPanel() {
  const importTrades = useRootStore((s) => s.importTrades)
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<Stage>({ kind: 'idle' })

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // تا انتخاب دوبارهٔ همان فایل هم کار کند
    if (!file) return
    try {
      const text = await file.text()
      const { trades, skipped } = parseMt5Html(text)
      if (trades.length === 0) {
        setStage({ kind: 'error', msg: 'هیچ معاملهٔ بسته‌شده‌ای در فایل پیدا نشد. مطمئن شو از MT5 مسیر History → کلیک راست → Report (خروجی HTML) گرفته‌ای.' })
        return
      }
      setStage({ kind: 'parsed', trades, skipped, fileName: file.name })
    } catch {
      setStage({ kind: 'error', msg: 'خواندن فایل ناموفق بود. فایل HTML گزارش متاتریدر را انتخاب کن.' })
    }
  }

  function confirmImport() {
    if (stage.kind !== 'parsed') return
    const res = importTrades(stage.trades.map((t) => t.input))
    setStage({ kind: 'done', added: res.added, skipped: res.skipped })
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: 16 }}>
      <div onClick={() => setOpen((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <span style={{ fontSize: 13, color: 'var(--text-quiet)' }}>{open ? '▾' : '▸'}</span>
        <span style={{ fontSize: 13.5, fontWeight: 700 }}>وارد کردن خودکار از متاتریدر ۵</span>
        <span style={{ fontSize: 11, color: 'var(--text-quiet)' }}>· گزارش HTML را بده تا معاملات خودکار ثبت شوند</span>
      </div>

      {open && (
        <div style={{ marginTop: 13 }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-faint)', lineHeight: 1.7, marginBottom: 11 }}>
            در MT5: پنل <b>Toolbox</b> → تب <b>History</b> → کلیک راست → <b>Report</b> → ذخیره به‌صورت HTML. سپس همان فایل را این‌جا انتخاب کن. معاملات تکراری (بر اساس شمارهٔ پوزیشن) دوباره اضافه نمی‌شوند.
          </div>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', border: '1px dashed var(--border-strong)', background: 'var(--surface-muted)', borderRadius: 9, padding: '9px 14px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
            📄 انتخاب فایل گزارش (HTML)
            <input type="file" accept=".html,.htm,text/html" onChange={onFile} style={{ display: 'none' }} />
          </label>

          {stage.kind === 'error' && (
            <div style={{ marginTop: 11, fontSize: 12, color: 'var(--accent-red-strong)', fontWeight: 600, lineHeight: 1.6 }}>{stage.msg}</div>
          )}

          {stage.kind === 'parsed' && (
            <div style={{ marginTop: 13 }}>
              <div style={{ fontSize: 12.5, marginBottom: 9 }}>
                <b style={{ color: 'var(--accent-green)' }}>{toFa(stage.trades.length)}</b> معامله از «{stage.fileName}» خوانده شد
                {stage.skipped > 0 && <span style={{ color: 'var(--text-quiet)' }}> · {toFa(stage.skipped)} ردیف نامفهوم رد شد</span>}. پیش‌نمایش:
              </div>
              <div className="scrl" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 10 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, minWidth: 560 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-muted)', textAlign: 'right', color: 'var(--text-faint)' }}>
                      {['تاریخ', 'نماد', 'جهت', 'ورود', 'حدضرر', 'خروج', 'R', 'نتیجه'].map((h) => (
                        <th key={h} style={{ padding: '7px 9px', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stage.trades.slice(0, 8).map((t, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #F0EDE6' }}>
                        <td style={{ padding: '6px 9px', direction: 'ltr', textAlign: 'right' }}>{t.input.date || '—'}</td>
                        <td style={{ padding: '6px 9px', fontWeight: 600 }}>{t.input.symbol}</td>
                        <td style={{ padding: '6px 9px', color: t.input.dir === 'خرید' ? 'var(--accent-green)' : 'var(--accent-red-strong)' }}>{t.input.dir}</td>
                        <td style={{ padding: '6px 9px', direction: 'ltr' }}>{t.input.entry ?? '—'}</td>
                        <td style={{ padding: '6px 9px', direction: 'ltr' }}>{t.input.stop ?? '—'}</td>
                        <td style={{ padding: '6px 9px', direction: 'ltr' }}>{t.input.exit ?? '—'}</td>
                        <td style={{ padding: '6px 9px', direction: 'ltr', fontWeight: 700, color: t.input.r == null ? 'var(--text-quiet)' : t.input.r > 0 ? 'var(--accent-green)' : 'var(--accent-red-strong)' }}>
                          {t.input.r == null ? '—' : `${t.input.r > 0 ? '+' : ''}${t.input.r}`}
                        </td>
                        <td style={{ padding: '6px 9px' }}>{OUTCOME_LABEL[t.input.r != null ? (t.input.r > 0 ? 'win' : t.input.r < 0 ? 'loss' : 'be') : t.input.outcome]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {stage.trades.length > 8 && <div style={{ fontSize: 11, color: 'var(--text-quiet)', marginTop: 6 }}>… و {toFa(stage.trades.length - 8)} مورد دیگر</div>}
              <button
                type="button"
                onClick={confirmImport}
                style={{ marginTop: 13, border: 'none', background: 'var(--accent-green)', color: '#fff', cursor: 'pointer', borderRadius: 9, padding: '9px 20px', fontSize: 13, fontWeight: 700 }}
              >
                افزودن {toFa(stage.trades.length)} معامله به ژورنال
              </button>
            </div>
          )}

          {stage.kind === 'done' && (
            <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--accent-green)', fontWeight: 700 }}>
              ✓ {toFa(stage.added)} معاملهٔ جدید اضافه شد{stage.skipped > 0 ? ` · ${toFa(stage.skipped)} مورد تکراری بود و رد شد` : ''}.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function toFa(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
}
