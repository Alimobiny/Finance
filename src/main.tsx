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
import { useRootStore } from './store/rootStore'
import { startLocalPersistence } from './store/persistence'
import { bootstrapSync, startDriveAutoSync } from './lib/sync/driveSync'

// اشتراک در تغییرات استور برای ذخیرهٔ خودکار در localStorage (debounce شده)
startLocalPersistence(useRootStore)
// اشتراک جداگانه برای ارسال خودکار (debounce طولانی‌تر) به Google Drive در صورت ورود قبلی
startDriveAutoSync(useRootStore)
// در بارگذاری اپ، اگر قبلاً وارد گوگل شده بودیم، بی‌صدا تلاش برای همگام‌سازی می‌کنیم
void bootstrapSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
