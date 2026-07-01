import { useUIStore } from '../store/uiStore'
import { isDriveConfigured } from '../lib/sync/driveSync'

const COLOR: Record<string, string> = {
  offline: 'var(--text-quiet)',
  'local-only': 'var(--text-quiet)',
  syncing: 'var(--accent-gold-dark)',
  synced: 'var(--accent-green)',
  error: 'var(--accent-red-strong)',
}
const LABEL: Record<string, string> = {
  offline: 'آفلاین',
  'local-only': 'فقط محلی (Drive وصل نیست)',
  syncing: 'در حال همگام‌سازی…',
  synced: 'همگام با Google Drive',
  error: 'خطا در همگام‌سازی',
}

/** نقطهٔ کوچک وضعیت سینک در هدر — فقط وقتی Drive پیکربندی شده نمایش داده می‌شود */
export function SyncStatusDot() {
  const status = useUIStore((s) => s.syncStatus)
  if (!isDriveConfigured()) return null

  return (
    <span
      title={LABEL[status]}
      style={{ width: 8, height: 8, borderRadius: '50%', background: COLOR[status], flexShrink: 0, display: 'inline-block' }}
    />
  )
}
