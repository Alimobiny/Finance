import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { SyncPanel } from './SyncPanel'
import { BackupPanel } from './BackupPanel'
import { SymbolsTagsManager } from './SymbolsTagsManager'
import { HistoryPanel } from './HistoryPanel'

export function SettingsScreen() {
  return (
    <section style={{ animation: 'fadeUp .3s ease' }}>
      <ScreenHeader
        eyebrow="تنظیمات"
        eyebrowColor="var(--accent-blue)"
        title="پشتیبان‌گیری، بازیابی و همگام‌سازی"
        subtitle="همهٔ داده‌ها روی همین دستگاه و در فرآیند همگام‌سازی روی Google Drive شخصی‌ات ذخیره می‌شوند. هیچ سروری بین شما و گوگل نیست."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 14, marginBottom: 14 }}>
        <BackupPanel />
        <SyncPanel />
      </div>

      <div style={{ marginBottom: 14 }}>
        <HistoryPanel />
      </div>

      <SymbolsTagsManager />
    </section>
  )
}
