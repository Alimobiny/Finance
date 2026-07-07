import { useState } from 'react'
import { useRootStore } from '../../../store/rootStore'
import { faNumber } from '../../../lib/format/number'
import { accountRiskAmount } from '../lib/tradeMath'
import { decodeReport, parseMt5Html, type ParsedTrade } from '../lib/importMt5'
import { looksLikeEaJson, parseEaJson } from '../lib/importEaJson'
import { fetchAndImport } from '../lib/autoImport'

type Stage =
  | { kind: 'idle' }
  | { kind: 'parsed'; trades: ParsedTrade[]; skipped: number; fileName: string }
  | { kind: 'done'; added: number; skipped: number }
  | { kind: 'error'; msg: string }

const OUTCOME_LABEL: Record<string, string> = { win: 'برد', loss: 'باخت', be: 'سربه‌سر', '': '—' }

export function ImportPanel() {
  const importTrades = useRootStore((s) => s.importTrades)
  const accounts = useRootStore((s) => s.trading.accounts)
  const activeAccountId = useRootStore((s) => s.trading.activeAccountId)
  const activeAccount = accounts.find((a) => a.id === activeAccountId)
  const autoImportUrl = useRootStore((s) => s.settings.autoImportUrl)
  const setAutoImportUrl = useRootStore((s) => s.setAutoImportUrl)
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<Stage>({ kind: 'idle' })
  const [autoBusy, setAutoBusy] = useState(false)
  const [autoMsg, setAutoMsg] = useState('')

  async function syncNow() {
    if (!autoImportUrl || autoBusy) return
    setAutoBusy(true)
    setAutoMsg('')
    try {
      const { added, skipped } = await fetchAndImport(autoImportUrl, importTrades)
      setAutoMsg(
        added > 0
          ? `✓ ${toFa(added)} معاملهٔ جدید اضافه شد${skipped ? ` · ${toFa(skipped)} تکراری رد شد` : ''}.`
          : 'چیز جدیدی نبود (همهٔ معاملات از قبل ثبت شده‌اند).',
      )
    } catch {
      setAutoMsg('دریافت از منبع ناموفق بود. آدرس یا دسترسیِ Apps Script را بررسی کن.')
    } finally {
      setAutoBusy(false)
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // تا انتخاب دوبارهٔ همان فایل هم کار کند
    if (!file) return
    try {
      const buffer = await file.arrayBuffer()
      const text = decodeReport(buffer) // فایل متاتریدر معمولاً UTF-16 است
      // فرمت را خودکار تشخیص می‌دهیم: JSONِ خروجیِ EA یا گزارشِ HTML متاتریدر.
      const { trades, skipped } = looksLikeEaJson(text) ? parseEaJson(text) : parseMt5Html(text)
      if (trades.length === 0) {
        setStage({ kind: 'error', msg: 'هیچ معاملهٔ معتبری در فایل پیدا نشد. یا گزارشِ HTML متاتریدر (History → Report) بده، یا فایلِ JSONِ خروجیِ EA قطب‌نما.' })
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
        <span style={{ fontSize: 11, color: 'var(--text-quiet)' }}>· گزارش HTML یا فایل JSONِ EA را بده</span>
      </div>

      {open && (
        <div style={{ marginTop: 13 }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-faint)', lineHeight: 1.7, marginBottom: 11 }}>
            در MT5: پنل <b>Toolbox</b> → تب <b>History</b> → کلیک راست → <b>Report</b> → ذخیره به‌صورت HTML. سپس همان فایل را این‌جا انتخاب کن. معاملات تکراری (بر اساس شمارهٔ پوزیشن) دوباره اضافه نمی‌شوند.
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--accent-navy)', lineHeight: 1.7, marginBottom: 11, background: 'var(--accent-navy-soft)', borderRadius: 9, padding: '8px 11px' }}>
            💡 اگر فایلِ <b>JSONِ خروجیِ EA قطب‌نما</b> را بدهی، «ریسکِ واقعیِ هر معامله» و «R:R واقعی» هم وارد می‌شوند (چون EA استاپِ اولیه را قبل از تریل ثبت می‌کند) و R دقیق‌تر از حالتِ HTML محاسبه می‌شود.
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 11, background: 'var(--surface-muted)', borderRadius: 9, padding: '8px 11px', lineHeight: 1.6 }}>
            معاملات به حساب <b>«{activeAccount?.name}»</b> اضافه می‌شوند.{' '}
            {activeAccount && accountRiskAmount(activeAccount) > 0 ? (
              <>
                نتیجهٔ R = سود ÷ <b>${faNumber(accountRiskAmount(activeAccount), 0)}</b> (موجودی × ٪ ریسک).
              </>
            ) : (
              <b style={{ color: 'var(--accent-gold-dark)' }}>
                برای محاسبهٔ R، اول «موجودی حساب» و «٪ ریسک» را در بالای همین صفحه تنظیم کن.
              </b>
            )}
          </div>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', border: '1px dashed var(--border-strong)', background: 'var(--surface-muted)', borderRadius: 9, padding: '9px 14px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
            📄 انتخاب فایل گزارش (HTML یا JSON)
            <input type="file" accept=".html,.htm,.json,text/html,application/json" onChange={onFile} style={{ display: 'none' }} />
          </label>

          {/* اتصالِ خودکار: بدون فایل، از URLِ Apps Scriptِ متصل به EA */}
          <div style={{ marginTop: 14, paddingTop: 13, borderTop: '1px dashed var(--border)' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 5 }}>یا اتصالِ خودکار (بدون فایل)</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-faint)', lineHeight: 1.7, marginBottom: 9 }}>
              اگر EA را به یک Google Apps Script وصل کرده‌ای، آدرسِ آن (GET) را این‌جا بگذار. اپ هر بار که باز شود و با دکمهٔ زیر، خودکار معاملاتِ جدید را می‌آورد.
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                value={autoImportUrl}
                onChange={(e) => setAutoImportUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/…/exec"
                style={{ flex: 1, minWidth: 220, border: '1px solid var(--border)', borderRadius: 9, padding: '8px 10px', fontSize: 12, direction: 'ltr', textAlign: 'left', background: 'var(--surface-muted)', outline: 'none' }}
              />
              <button
                type="button"
                onClick={syncNow}
                disabled={!autoImportUrl || autoBusy}
                style={{ border: 'none', cursor: autoImportUrl && !autoBusy ? 'pointer' : 'not-allowed', background: autoImportUrl && !autoBusy ? 'var(--accent-navy)' : 'var(--border-strong)', color: '#fff', borderRadius: 9, padding: '8px 16px', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                {autoBusy ? 'در حال دریافت…' : 'همگام‌سازی الان'}
              </button>
            </div>
            {autoMsg && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{autoMsg}</div>}
          </div>

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
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, minWidth: 520 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-muted)', textAlign: 'right', color: 'var(--text-faint)' }}>
                      {['تاریخ', 'نماد', 'جهت', 'ورود', 'خروج', 'سود/زیان ($)', 'نتیجه'].map((h) => (
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
                        <td style={{ padding: '6px 9px', direction: 'ltr' }}>{t.input.exit ?? '—'}</td>
                        <td style={{ padding: '6px 9px', direction: 'ltr', fontWeight: 700, color: t.profit == null ? 'var(--text-quiet)' : t.profit > 0 ? 'var(--accent-green)' : 'var(--accent-red-strong)' }}>
                          {t.profit == null ? '—' : `${t.profit > 0 ? '+' : ''}${t.profit}`}
                        </td>
                        <td style={{ padding: '6px 9px' }}>{OUTCOME_LABEL[t.profit != null ? (t.profit > 0 ? 'win' : t.profit < 0 ? 'loss' : 'be') : t.input.outcome]}</td>
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
