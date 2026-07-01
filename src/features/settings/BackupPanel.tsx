import { useRef, useState } from 'react'
import { useRootStore } from '../../store/rootStore'
import { buildSnapshot } from '../../store/persistence'
import { downloadBackup, restoreFromFile, restoreFromText } from '../../lib/sync/backup'

export function BackupPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      await restoreFromFile(file)
      setMessage('بازیابی از فایل انجام شد.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'فایل پشتیبان نامعتبر است.')
    }
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(buildSnapshot(useRootStore.getState())))
      setMessage('نسخهٔ پشتیبان در کلیپ‌بورد کپی شد.')
    } catch {
      setMessage('کپی ناموفق بود.')
    }
  }

  async function onPaste() {
    const text = window.prompt('متن پشتیبان را این‌جا بچسبان:')
    if (!text) return
    try {
      await restoreFromText(text)
      setMessage('بازیابی از متن انجام شد.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'متن نامعتبر است.')
    }
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}>پشتیبان‌گیری دستی (فایل)</div>
      <div style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.7, marginBottom: 14 }}>
        یک فایل JSON از کل اطلاعاتت دانلود می‌شود. برای بازیابی، همان فایل را انتخاب کن. این روش مستقل از Google Drive است و
        تنها راه دیدن دستیِ داده‌هاست، چون پوشهٔ ذخیرهٔ Drive برای اپ در فضای عادی Drive دیده نمی‌شود.
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
        <button type="button" onClick={downloadBackup} style={{ border: 'none', background: 'var(--accent-blue)', color: '#fff', cursor: 'pointer', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700 }}>
          ⬇ دانلود پشتیبان
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{ border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}
        >
          ⬆ بازیابی از فایل
        </button>
        <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={onFileChange} style={{ display: 'none' }} />
      </div>
      <div style={{ marginTop: 13, paddingTop: 13, borderTop: '1px dashed var(--border)', display: 'flex', flexWrap: 'wrap', gap: 9 }}>
        <button type="button" onClick={onCopy} style={{ border: '1px solid var(--border)', background: 'var(--surface-muted)', cursor: 'pointer', borderRadius: 9, padding: '8px 15px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
          کپی به کلیپ‌بورد
        </button>
        <button type="button" onClick={onPaste} style={{ border: '1px solid var(--border)', background: 'var(--surface-muted)', cursor: 'pointer', borderRadius: 9, padding: '8px 15px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
          بازیابی از متن
        </button>
      </div>
      {message && <div style={{ marginTop: 11, fontSize: 12, color: 'var(--accent-green)' }}>{message}</div>}
    </div>
  )
}
