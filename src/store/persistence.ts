import type { StoreApi } from 'zustand'
import { SCHEMA_VERSION, type RootState } from '../types'
import type { RootStore } from './rootStoreType'

const STORAGE_KEY = 'qotbnama:v1'
const DEBOUNCE_MS = 400

/**
 * خواندن آخرین وضعیت ذخیره‌شده از localStorage (در بارگذاری اولیهٔ اپ).
 * اگر چیزی ذخیره نشده یا داده خراب باشد، null برمی‌گرداند تا از پیش‌فرض استفاده شود.
 */
export function loadPersistedState(): RootState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as RootState
  } catch {
    return null
  }
}

/** ساخت اسنپ‌شات همگام با نوع RootState از استور فعلی — هم برای localStorage و هم Drive استفاده می‌شود */
export function buildSnapshot(store: RootStore): RootState {
  return {
    meta: { updatedAt: new Date().toISOString(), schemaVersion: SCHEMA_VERSION },
    dashboard: store.dashboard,
    portfolio: store.portfolio,
    trading: store.trading,
    money: store.money,
    life: store.life,
    settings: store.settings,
    history: store.history,
  }
}

/**
 * روی هر تغییر استور، بعد از یک وقفهٔ کوتاه (debounce) کل وضعیت را در
 * localStorage می‌نویسد. بک‌آپ روی Google Drive جداست و فقط دستی انجام
 * می‌شود (نگاه کن به lib/sync/driveBackup.ts) — هیچ همگام‌سازیِ خودکاری نداریم.
 */
export function startLocalPersistence(api: StoreApi<RootStore>): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return api.subscribe((state) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(buildSnapshot(state)))
      } catch {
        // localStorage ممکن است پر یا در دسترس نباشد (مثلاً حالت خصوصی مرورگر) — بی‌صدا رد می‌شویم
      }
    }, DEBOUNCE_MS)
  })
}
