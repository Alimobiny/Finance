import { useState } from 'react'
import { useRootStore } from '../../store/rootStore'
import { useUIStore } from '../../store/uiStore'
import { isDriveConfigured, isSignedIn, signIn, signOut, syncNow } from '../../lib/sync/driveSync'
import { faDateShort } from '../../lib/format/date'

const STATUS_LABEL: Record<string, string> = {
  offline: 'آفلاین',
  'local-only': 'فقط محلی',
  syncing: 'در حال همگام‌سازی…',
  synced: 'همگام‌شده',
  error: 'خطا در همگام‌سازی',
}
const STATUS_COLOR: Record<string, string> = {
  offline: 'var(--text-quiet)',
  'local-only': 'var(--text-faint)',
  syncing: 'var(--accent-gold-dark)',
  synced: 'var(--accent-green)',
  error: 'var(--accent-red-strong)',
}

export function SyncPanel() {
  const configured = isDriveConfigured()
  const signedIn = isSignedIn()
  const syncStatus = useUIStore((s) => s.syncStatus)
  const lastSyncedAt = useRootStore((s) => s.settings.lastSyncedAt)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, forceRerender] = useState(0)

  async function handle(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای نامشخص')
    } finally {
      setBusy(false)
      forceRerender((n) => n + 1) // چون isSignedIn() از localStorage می‌خواند، نه از استور واکنش‌گر
    }
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: STATUS_COLOR[syncStatus] }} />
        همگام‌سازی با Google Drive
      </div>

      {!configured && (
        <div style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.7, marginBottom: 13 }}>
          هنوز پیکربندی نشده. برای فعال‌سازی، یک Google OAuth Client ID بساز و در فایل <code>.env.local</code> به‌عنوان{' '}
          <code>VITE_GOOGLE_CLIENT_ID</code> قرار بده (راهنما در README پروژه).
        </div>
      )}

      {configured && (
        <>
          <div style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.7, marginBottom: 13 }}>
            وضعیت: <b style={{ color: STATUS_COLOR[syncStatus] }}>{STATUS_LABEL[syncStatus]}</b>
            {lastSyncedAt && (
              <>
                {' '}
                · آخرین همگام‌سازی: <b style={{ color: 'var(--text)' }}>{faDateShort(new Date(lastSyncedAt))}</b>
              </>
            )}
          </div>
          {error && <div style={{ fontSize: 12, color: 'var(--accent-red-strong)', background: 'var(--accent-red-soft)', borderRadius: 8, padding: '8px 11px', marginBottom: 11 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            {!signedIn && (
              <button
                type="button"
                disabled={busy}
                onClick={() => handle(signIn)}
                style={{ border: 'none', background: 'var(--accent-blue)', color: '#fff', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, borderRadius: 9, padding: '9px 16px', fontSize: 13, fontWeight: 700 }}
              >
                ورود با گوگل
              </button>
            )}
            {signedIn && (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handle(syncNow)}
                  style={{ border: 'none', background: 'var(--accent-green)', color: '#fff', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, borderRadius: 9, padding: '9px 16px', fontSize: 13, fontWeight: 700 }}
                >
                  همگام‌سازی الان
                </button>
                <button
                  type="button"
                  onClick={() => {
                    signOut()
                    forceRerender((n) => n + 1)
                  }}
                  style={{ border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', borderRadius: 9, padding: '9px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}
                >
                  خروج
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
