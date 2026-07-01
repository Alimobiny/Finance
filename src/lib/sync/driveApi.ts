const FILE_NAME = 'qotbnama.json'
const FILES_URL = 'https://www.googleapis.com/drive/v3/files'
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files'

export interface DriveFileRef {
  id: string
}

/** جست‌وجوی فایل داده در appDataFolder — فولدر پنهانی که فقط این اپ به آن دسترسی دارد */
export async function findFile(token: string): Promise<DriveFileRef | null> {
  const q = encodeURIComponent(`name='${FILE_NAME}'`)
  const res = await fetch(`${FILES_URL}?spaces=appDataFolder&q=${q}&fields=files(id)`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('خواندن فهرست فایل‌های Drive ناموفق بود')
  const data = (await res.json()) as { files?: DriveFileRef[] }
  return data.files?.[0] ?? null
}

export async function downloadFile(token: string, fileId: string): Promise<string> {
  const res = await fetch(`${FILES_URL}/${fileId}?alt=media`, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error('دانلود فایل از Drive ناموفق بود')
  return res.text()
}

export async function createFile(token: string, content: string): Promise<string> {
  const metadata = { name: FILE_NAME, parents: ['appDataFolder'] }
  const boundary = 'qn' + Date.now()
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}\r\n--${boundary}--`
  const res = await fetch(`${UPLOAD_URL}?uploadType=multipart`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  })
  if (!res.ok) throw new Error('ساخت فایل در Drive ناموفق بود')
  const data = (await res.json()) as DriveFileRef
  return data.id
}

export async function updateFile(token: string, fileId: string, content: string): Promise<void> {
  const res = await fetch(`${UPLOAD_URL}/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: content,
  })
  if (!res.ok) throw new Error('به‌روزرسانی فایل در Drive ناموفق بود')
}
