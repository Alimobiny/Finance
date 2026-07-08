import { useState } from 'react'
import { isDriveConfigured, isSignedIn, signIn, signOut, backupNow, listBackups, restoreBackup, type BackupRef } from '../../lib/sync/driveBackup'

export function DriveBackupPanel() {
  const configured = isDriveConfigured()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [backups, setBackups] = useState<BackupRef[] | null>(null)
  const [, rerender] = useState(0)
  const signedIn = isSignedIn()

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
      rerender((n) => n + 1) // isSignedIn از localStorage می‌خواند، نه استورِ واکنش‌گر
    }
  }

  const onBackup = () =>
    run(async () => {
      const name = await backupNow()
      setMsg(`بک‌آپ «${name}» در Drive ذخیره شد.`)
      setBackups(null) // لیست را تازه کن
    })

  const onLoadList = () =>
    run(async () => {
      setBackups(await listBackups())
    })

  const onRestore = (b: BackupRef) =>
    run(async () => {
      if (!window.confirm(`همهٔ داده‌ی فعلیِ این دستگاه با بک‌آپِ «${b.name}» جایگزین شود؟\nپیش از جایگزینی، نسخهٔ فعلی به‌صورت پشتیبانِ ایمنی نگه داشته می‌شود.`)) return
      await restoreBackup(b.id)
      setMsg(`بازیابی از «${b.name}» انجام شد.`)
    })

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--pad-card)' }}>
      <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 'var(--fw-bold)', marginBottom: 'var(--space-1-5)' }}>بک‌آپ روی Google Drive</div>

      {!configured && (
        <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-faint)', lineHeight: 'var(--lh-relaxed)' }}>
          هنوز پیکربندی نشده. برای فعال‌سازی، یک Google OAuth Client ID بساز و به‌عنوان <code>VITE_GOOGLE_CLIENT_ID</code> بگذار.
        </div>
      )}

      {configured && (
        <>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-faint)', lineHeight: 'var(--lh-relaxed)', marginBottom: 'var(--space-3)' }}>
            بک‌آپ‌ها در پوشهٔ <b>«قطب‌نما — پشتیبان»</b> در Driveِ خودت (با تاریخ و ساعت) ذخیره می‌شوند. اپ هیچ‌وقت خودکار بک‌آپ یا بازیابی نمی‌کند —
            همه با دکمه و تأییدِ توست.
          </div>

          {err && <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-red-strong)', background: 'var(--accent-red-soft)', borderRadius: 'var(--radius-sm)', padding: '8px 11px', marginBottom: 'var(--space-2-5)' }}>{err}</div>}
          {msg && <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--accent-green)', marginBottom: 'var(--space-2-5)' }}>{msg}</div>}

          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {!signedIn ? (
              <button type="button" disabled={busy} onClick={() => run(signIn)} style={btn('var(--accent-blue)', busy)}>
                ورود با گوگل
              </button>
            ) : (
              <>
                <button type="button" disabled={busy} onClick={onBackup} style={btn('var(--accent-green)', busy)}>
                  ⬆ بک‌آپ الان در Drive
                </button>
                <button type="button" disabled={busy} onClick={onLoadList} style={btnOutline(busy)}>
                  🗂 بازیابی از Drive
                </button>
                <button type="button" onClick={() => { signOut(); rerender((n) => n + 1) }} style={btnOutline(false)}>
                  خروج
                </button>
              </>
            )}
          </div>

          {backups && (
            <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px dashed var(--border)' }}>
              {backups.length === 0 ? (
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-quiet)' }}>هنوز بک‌آپی در Drive نیست.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)', maxHeight: 240, overflowY: 'auto' }} className="scrl">
                  {backups.map((b) => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', background: 'var(--surface-muted)', borderRadius: 'var(--radius-sm)', padding: '7px 10px' }}>
                      <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)', direction: 'ltr', unicodeBidi: 'isolate', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span>
                      <button type="button" disabled={busy} onClick={() => onRestore(b)} style={{ flexShrink: 0, border: '1px solid var(--border)', background: 'var(--surface)', cursor: busy ? 'default' : 'pointer', borderRadius: 'var(--radius-sm)', padding: '5px 12px', fontSize: 'var(--fs-2xs)', fontWeight: 'var(--fw-semibold)', color: 'var(--accent-navy)' }}>
                        بازیابی
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
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
