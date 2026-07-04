import { useState } from 'react'
import { useRootStore } from '../../store/rootStore'
import { Card } from '../../components/ui/Card'

const MAX = 5

/** مدیریت کانال‌های تلگرام خلاصهٔ اخبار (افزودن/حذف تا ۵ کانال). */
export function NewsChannelsManager() {
  const channels = useRootStore((s) => s.settings.newsChannels)
  const addNewsChannel = useRootStore((s) => s.addNewsChannel)
  const removeNewsChannel = useRootStore((s) => s.removeNewsChannel)
  const [text, setText] = useState('')
  const [err, setErr] = useState('')

  const full = channels.length >= MAX

  function onAdd() {
    setErr('')
    if (!text.trim()) return
    const ok = addNewsChannel(text)
    if (ok) setText('')
    else setErr(full ? `حداکثر ${MAX} کانال مجاز است.` : 'این کانال قبلاً هست یا نامعتبر است.')
  }

  return (
    <Card title="کانال‌های خبری (تلگرام)">
      <div style={{ fontSize: 11.5, color: 'var(--text-quiet)', marginBottom: 12, lineHeight: 1.7 }}>
        یوزرنیم کانال‌های عمومی که خلاصهٔ اخبارشان در داشبورد نمایش داده می‌شود (تا {toFa(MAX)} کانال). خلاصهٔ هر کانال جدا و با سطح تأثیر رنگی نشان داده می‌شود.
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 13 }}>
        {channels.map((c) => (
          <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: 9, padding: '6px 10px', fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>
            @{c}
            <button
              type="button"
              onClick={() => removeNewsChannel(c)}
              title="حذف"
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red-strong)', fontSize: 15, lineHeight: 1, padding: 0 }}
            >
              ×
            </button>
          </span>
        ))}
        {channels.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-quiet)' }}>کانالی تنظیم نشده.</span>}
      </div>

      {!full && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
            placeholder="یوزرنیم یا لینک کانال (مثلاً tgju یا t.me/tgju)"
            style={{ flex: 1, minWidth: 180, border: '1px solid var(--border)', borderRadius: 9, padding: '9px 11px', fontSize: 12.5, background: 'var(--surface-muted)', outline: 'none' }}
          />
          <button
            type="button"
            onClick={onAdd}
            style={{ border: 'none', background: 'var(--accent-navy)', color: '#fff', cursor: 'pointer', borderRadius: 9, padding: '9px 18px', fontSize: 12.5, fontWeight: 700 }}
          >
            افزودن
          </button>
        </div>
      )}
      {err && <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--accent-red-strong)', fontWeight: 600 }}>{err}</div>}

      <div style={{ marginTop: 13, paddingTop: 12, borderTop: '1px dashed var(--border)', fontSize: 11, color: 'var(--text-quiet)', lineHeight: 1.7 }}>
        ℹ️ خلاصهٔ اخبار روی سرور (GitHub) روزی یک‌بار ساخته می‌شود. بعد از تغییر کانال‌ها این‌جا، برای اعمال روی خلاصهٔ خودکار کافی است یک‌بار به من (کلود) بگویی تا لیست را روی سرور هم به‌روزرسانی کنم.
      </div>
    </Card>
  )
}

function toFa(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
}
