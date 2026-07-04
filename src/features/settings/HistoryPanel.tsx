import { useRootStore } from '../../store/rootStore'
import { Card } from '../../components/ui/Card'
import { faDateShort } from '../../lib/format/date'
import type { ChangeAction } from '../../types'

const ACTION_META: Record<ChangeAction, { label: string; icon: string; color: string; bg: string }> = {
  add: { label: 'افزودن', icon: '＋', color: 'var(--accent-green)', bg: 'var(--accent-green-soft)' },
  import: { label: 'وارد کردن', icon: '↓', color: 'var(--accent-navy)', bg: '#EEF1F8' },
  edit: { label: 'ویرایش', icon: '✎', color: 'var(--accent-gold-dark)', bg: '#FEF8EC' },
  remove: { label: 'حذف', icon: '×', color: 'var(--accent-red-strong)', bg: 'var(--accent-red-soft)' },
}

function timeLabel(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const time = d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
  return `${faDateShort(d)} · ${time}`
}

export function HistoryPanel() {
  const entries = useRootStore((s) => s.history.entries)
  const clearHistory = useRootStore((s) => s.clearHistory)

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>تاریخچهٔ تغییرات</span>
          {entries.length > 0 && <span style={{ fontSize: 10.5, color: 'var(--text-quiet)', fontWeight: 500 }}>{toFa(entries.length)} رویداد</span>}
        </div>
      }
      action={
        entries.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('کل تاریخچهٔ تغییرات پاک شود؟')) clearHistory()
            }}
            style={{ border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}
          >
            پاک کردن
          </button>
        ) : undefined
      }
    >
      <div style={{ fontSize: 11.5, color: 'var(--text-quiet)', marginBottom: 13, lineHeight: 1.7 }}>
        فهرست تغییرهای مهمی که روی داده‌هایت انجام داده‌ای (ثبت/ویرایش/حذف معامله و دارایی و بدهی و کار). با همگام‌سازی، این تاریخچه هم بین دستگاه‌ها منتقل می‌شود.
      </div>

      {entries.length === 0 ? (
        <div style={{ fontSize: 12.5, color: 'var(--text-quiet)' }}>هنوز تغییری ثبت نشده.</div>
      ) : (
        <div className="scrl" style={{ display: 'flex', flexDirection: 'column', maxHeight: 420, overflowY: 'auto' }}>
          {entries.map((e) => {
            const m = ACTION_META[e.action]
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 2px', borderBottom: '1px solid #F0EDE6' }}>
                <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 7, background: m.bg, color: m.color, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {m.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.5 }}>{e.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-faint)', background: 'var(--surface-muted)', borderRadius: 5, padding: '1px 7px' }}>{e.area}</span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-quiet)', direction: 'rtl' }}>{timeLabel(e.at)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

function toFa(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
}
