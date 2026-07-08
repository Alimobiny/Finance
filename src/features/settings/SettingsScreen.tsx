import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { GistBackupPanel } from './GistBackupPanel'
import { BackupPanel } from './BackupPanel'
import { SymbolsTagsManager } from './SymbolsTagsManager'
import { HistoryPanel } from './HistoryPanel'

export function SettingsScreen() {
  return (
    <section style={{ animation: 'fadeUp .3s ease' }}>
      <ScreenHeader
        eyebrow="تنظیمات"
        eyebrowColor="var(--accent-blue)"
        title="پشتیبان‌گیری و بازیابی"
        subtitle="داده‌ها روی همین دستگاه ذخیره می‌شوند. برای امنیت و انتقال بین دستگاه‌ها، هر وقت خواستی دستی بک‌آپ بگیر (روی GitHub Gist یا فایل). اپ هیچ‌وقت خودکار داده را بازنویسی نمی‌کند."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 14, marginBottom: 14 }}>
        <GistBackupPanel />
        <BackupPanel />
      </div>

      <div style={{ marginBottom: 14 }}>
        <HistoryPanel />
      </div>

      <SymbolsTagsManager />
    </section>
  )
}
