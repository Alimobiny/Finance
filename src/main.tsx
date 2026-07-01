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

// اشتراک در تغییرات استور برای ذخیرهٔ خودکار در localStorage (debounce شده)
startLocalPersistence(useRootStore)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
