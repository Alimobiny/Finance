import { useState } from 'react'
import { getToken, setToken, backupNow, listBackups, restoreBackup } from '../../lib/sync/gistBackup'

export function GistBackupPanel() {
  const [tokenInput, setTokenInput] = useState(getToken())
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [backups, setBackups] = useState<string[] | null>(null)
  const saved = getToken()

  async function run(fn: () => Promise<void>) {
    setBusy(true)
    setErr(null)
    setMsg(null)
    try {
      await fn()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'خطای نامشخص')
    } finally {
      setBusy(false)
    }
  }

  function saveToken() {
    setToken(tokenInput)
    setMsg(tokenInput.trim() ? 'توکن ذخیره شد.' : 'توکن پاک شد.')
    setBackups(null)
  }

  const onBackup = () =>
    run(async () => {
      const name = await backupNow()
      setMsg(`بک‌آپ «${name}» در Gist ذخیره شد.`)
      setBackups(null)
    })

  const onList = () => run(async () => setBackups(await listBackups()))

  const onRestore = (name: string) =>
    run(async () => {
      if (!window.confirm(`همهٔ داده‌ی فعلیِ این دستگاه با بک‌آپِ «${name}» جایگزین شود؟\nپیش از جایگزینی، نسخهٔ فعلی به‌صورت پشتیبانِ ایمنی نگه داشته می‌شود.`)) return
      await restoreBackup(name)
      setMsg(`بازیابی از «${name}» انجام شد.`)
    })

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--pad-card)' }}>
      <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)', marginBottom: 'var(--space-1-5)' }}>بک‌آپ روی GitHub Gist</div>
      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-faint)', lineHeight: 'var(--lh-relaxed)', marginBottom: 'var(--space-3)' }}>
        بک‌آپ‌ها در یک <b>Gistِ خصوصی</b> (با تاریخ+ساعت) ذخیره می‌شوند و بین دستگاه‌ها مشترک‌اند. یک‌بار یک{' '}
        <a href="https://github.com/settings/tokens/new?scopes=gist&description=Qotbnama" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)' }}>
          Personal Access Token با دسترسیِ gist
        </a>{' '}
        بساز و این‌جا بگذار. اپ هیچ‌وقت خودکار بک‌آپ/بازیابی نمی‌کند.
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2-5)' }}>
        <input
          type="password"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="ghp_… (توکن گیت‌هاب)"
          style={{ flex: 1, minWidth: 200, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 10px', fontSize: 'var(--fs-xs)', direction: 'ltr', textAlign: 'left', background: 'var(--surface-muted)', outline: 'none' }}
        />
        <button type="button" onClick={saveToken} style={{ border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', borderRadius: 'var(--radius-md)', padding: '9px 16px', fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          ذخیرهٔ توکن
        </button>
      </div>

      {err && <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-red-strong)', background: 'var(--accent-red-soft)', borderRadius: 'var(--radius-sm)', padding: '8px 11px', marginBottom: 'var(--space-2-5)' }}>{err}</div>}
      {msg && <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-green)', marginBottom: 'var(--space-2-5)' }}>{msg}</div>}

      {saved && (
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button type="button" disabled={busy} onClick={onBackup} style={btn('var(--accent-green)', busy)}>
            ⬆ بک‌آپ الان
          </button>
          <button type="button" disabled={busy} onClick={onList} style={btnOutline(busy)}>
            🗂 بازیابی از Gist
          </button>
        </div>
      )}

      {backups && (
        <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px dashed var(--border)' }}>
          {backups.length === 0 ? (
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-quiet)' }}>هنوز بک‌آپی نیست.</div>
          ) : (
            <div className="scrl" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)', maxHeight: 240, overflowY: 'auto' }}>
              {backups.map((name) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', background: 'var(--surface-muted)', borderRadius: 'var(--radius-sm)', padding: '7px 10px' }}>
                  <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)', direction: 'ltr', unicodeBidi: 'isolate', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                  <button type="button" disabled={busy} onClick={() => onRestore(name)} style={{ flexShrink: 0, border: '1px solid var(--border)', background: 'var(--surface)', cursor: busy ? 'default' : 'pointer', borderRadius: 'var(--radius-sm)', padding: '5px 12px', fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--accent-navy)' }}>
                    بازیابی
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function btn(bg: string, busy: boolean): React.CSSProperties {
  return { border: 'none', background: bg, color: '#fff', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, borderRadius: 'var(--radius-md)', padding: '9px 16px', fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)' }
}
function btnOutline(busy: boolean): React.CSSProperties {
  return { border: '1px solid var(--border)', background: 'var(--surface)', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, borderRadius: 'var(--radius-md)', padding: '9px 16px', fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-muted)' }
}
