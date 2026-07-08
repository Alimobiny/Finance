import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// فونت وزیرمتن به‌صورت لوکال (self-host) برای کارکرد کامل آفلاین
import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/500.css'
import '@fontsource/vazirmatn/600.css'
import '@fontsource/vazirmatn/700.css'
import '@fontsource/vazirmatn/800.css'

import './index.css'
import App from './app/App.tsx'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { useRootStore } from './store/rootStore'
import { startLocalPersistence } from './store/persistence'
import { bootstrapAutoImport } from './features/trading/lib/autoImport'

// اشتراک در تغییرات استور برای ذخیرهٔ خودکار در localStorage (debounce شده).
// عمداً هیچ همگام‌سازیِ خودکارِ Drive نداریم: بک‌آپ/بازیابی فقط دستی و با تأییدِ
// کاربر است (نگاه کن به features/settings/DriveBackupPanel) تا داده هرگز بدون
// اجازه بازنویسی نشود.
startLocalPersistence(useRootStore)
// اگر «منبعِ خودکارِ معاملات» تنظیم شده باشد، معاملاتِ جدیدِ متاتریدر را بی‌صدا می‌آورد
void bootstrapAutoImport()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
