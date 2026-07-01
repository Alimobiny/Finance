import type { StoreApi } from 'zustand'
import type { RootState } from '../../types'
import type { RootStore } from '../../store/rootStoreType'
import { useRootStore, applyRemoteState } from '../../store/rootStore'
import { buildSnapshot } from '../../store/persistence'
import { useUIStore } from '../../store/uiStore'
import { isDriveConfigured, requestAccessToken, clearCachedToken } from './gisLoader'
import { createFile, downloadFile, findFile, updateFile } from './driveApi'

const SIGNED_IN_KEY = 'qotbnama:driveSignedIn'
const FILE_ID_KEY = 'qotbnama:driveFileId'
const AUTO_PUSH_DEBOUNCE_MS = 4000

function wasSignedIn(): boolean {
  return localStorage.getItem(SIGNED_IN_KEY) === '1'
}
function setSignedIn(v: boolean) {
  if (v) localStorage.setItem(SIGNED_IN_KEY, '1')
  else localStorage.removeItem(SIGNED_IN_KEY)
}
function getStoredFileId(): string | null {
  return localStorage.getItem(FILE_ID_KEY)
}
function setStoredFileId(id: string) {
  localStorage.setItem(FILE_ID_KEY, id)
}

export { isDriveConfigured }

export function isSignedIn(): boolean {
  return wasSignedIn()
}

/** آپلود اسنپ‌شات فعلی — اگر فایلی در Drive نباشد می‌سازد، وگرنه بازنویسی می‌کند */
async function pushSnapshot(token: string, snapshot: RootState): Promise<void> {
  const content = JSON.stringify(snapshot)
  let fileId = getStoredFileId()
  if (!fileId) {
    const found = await findFile(token)
    fileId = found?.id ?? null
  }
  if (fileId) {
    await updateFile(token, fileId, content)
  } else {
    fileId = await createFile(token, content)
  }
  setStoredFileId(fileId)
}

/** خواندن اسنپ‌شات فعلی از Drive (یا null اگر فایلی هنوز ساخته نشده) */
async function pullSnapshot(token: string): Promise<RootState | null> {
  let fileId = getStoredFileId()
  if (!fileId) {
    const found = await findFile(token)
    if (!found) return null
    fileId = found.id
    setStoredFileId(fileId)
  }
  const content = await downloadFile(token, fileId)
  return JSON.parse(content) as RootState
}

/**
 * منطق اصلی Last-Write-Wins: نسخهٔ محلی و نسخهٔ Drive را بر اساس
 * meta.updatedAt مقایسه می‌کند؛ هرکدام جدیدتر بود برنده است.
 */
async function reconcile(token: string): Promise<void> {
  const local = buildSnapshot(useRootStore.getState())
  const remote = await pullSnapshot(token)

  if (!remote) {
    await pushSnapshot(token, local)
    return
  }

  const remoteNewer = new Date(remote.meta.updatedAt).getTime() > new Date(local.meta.updatedAt).getTime()
  if (remoteNewer) {
    applyRemoteState(remote)
  } else {
    await pushSnapshot(token, local)
  }
}

/** ورود صریح کاربر (با نمایش پنجرهٔ انتخاب حساب گوگل) */
export async function signIn(): Promise<void> {
  useUIStore.getState().setSyncStatus('syncing')
  try {
    const token = await requestAccessToken({ silent: false })
    setSignedIn(true)
    await reconcile(token)
    useRootStore.getState().setLastSyncedAt(new Date().toISOString())
    useUIStore.getState().setSyncStatus('synced')
  } catch (err) {
    useUIStore.getState().setSyncStatus('error')
    throw err
  }
}

export function signOut(): void {
  setSignedIn(false)
  clearCachedToken()
  useUIStore.getState().setSyncStatus('local-only')
}

/** روی بارگذاری اپ صدا زده می‌شود — اگر قبلاً وارد شده بود، بی‌صدا تلاش برای همگام‌سازی می‌کند */
export async function bootstrapSync(): Promise<void> {
  if (!isDriveConfigured() || !wasSignedIn()) return
  useUIStore.getState().setSyncStatus('syncing')
  try {
    const token = await requestAccessToken({ silent: true })
    await reconcile(token)
    useRootStore.getState().setLastSyncedAt(new Date().toISOString())
    useUIStore.getState().setSyncStatus('synced')
  } catch {
    // ورود بی‌صدا شکست خورد (نشست گوگل منقضی شده) — کاربر باید از تنظیمات دوباره وارد شود
    useUIStore.getState().setSyncStatus('error')
  }
}

/** دکمهٔ «همگام‌سازی الان» در تنظیمات — بدون debounce، فوری اجرا می‌شود */
export async function syncNow(): Promise<void> {
  if (!isDriveConfigured()) throw new Error('Google Drive پیکربندی نشده است')
  useUIStore.getState().setSyncStatus('syncing')
  try {
    const token = await requestAccessToken({ silent: !!wasSignedIn() })
    setSignedIn(true)
    await reconcile(token)
    useRootStore.getState().setLastSyncedAt(new Date().toISOString())
    useUIStore.getState().setSyncStatus('synced')
  } catch (err) {
    useUIStore.getState().setSyncStatus('error')
    throw err
  }
}

/**
 * روی هر تغییر استور (با debounce طولانی‌تر از localStorage)، در صورت
 * ورود قبلی، اسنپ‌شات را در Drive بازنویسی می‌کند. هرگز جلوی UI را
 * نمی‌گیرد — خطاها فقط وضعیت سینک را عوض می‌کنند، چیزی throw نمی‌شود.
 */
export function startDriveAutoSync(api: StoreApi<RootStore>): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return api.subscribe((state) => {
    if (!isDriveConfigured() || !wasSignedIn()) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(async () => {
      useUIStore.getState().setSyncStatus('syncing')
      try {
        const token = await requestAccessToken({ silent: true })
        await pushSnapshot(token, buildSnapshot(state))
        useRootStore.getState().setLastSyncedAt(new Date().toISOString())
        useUIStore.getState().setSyncStatus('synced')
      } catch {
        useUIStore.getState().setSyncStatus('error')
      }
    }, AUTO_PUSH_DEBOUNCE_MS)
  })
}
