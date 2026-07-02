// پیام‌های یک هفتهٔ اخیر یک کانال عمومی تلگرام را می‌خواند، با GitHub Models
// (رایگان، داخل خود Action) به ۱۰ خبر مهم خلاصه می‌کند و در public/news.json می‌نویسد.
//
// نیازها:
//   - متغیر TELEGRAM_CHANNEL: یوزرنیم کانال عمومی (مثلاً tgju یا با @).
//   - GITHUB_TOKEN: به‌صورت خودکار در Action موجود است (permissions: models: read).
// اگر کانال خصوصی باشد، صفحهٔ t.me/s در دسترس نیست و باید عمومی شود.
// اگر خلاصه‌سازی به هر دلیل شکست بخورد، همان آخرین پیام‌ها خام نوشته می‌شوند.

import { writeFile } from 'node:fs/promises'

const OUT = new URL('../public/news.json', import.meta.url)
const CHANNEL = (process.env.TELEGRAM_CHANNEL || '').replace(/^@/, '').trim()
const TOKEN = process.env.GITHUB_TOKEN
const MODEL = process.env.NEWS_MODEL || 'openai/gpt-4o-mini'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

if (!CHANNEL) {
  console.error('TELEGRAM_CHANNEL تنظیم نشده؛ خروج بدون تغییر.')
  process.exit(0)
}

function stripHtml(s) {
  return s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function fetchMessages() {
  const res = await fetch(`https://t.me/s/${CHANNEL}`, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`تلگرام HTTP ${res.status}`)
  const html = await res.text()

  // هر پیام را جدا می‌کنیم تا زمان و متنِ همان پیام به هم بچسبند.
  const blocks = html.split('tgme_widget_message_wrap').slice(1)
  const messages = []
  for (const b of blocks) {
    const tm = b.match(/datetime="([^"]+)"/)
    const tx = b.match(/tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>\s*<div class="tgme_widget_message_(?:footer|info)/) || b.match(/tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/)
    const text = tx ? stripHtml(tx[1]) : ''
    const date = tm ? Date.parse(tm[1]) : NaN
    if (!text) continue
    if (Number.isFinite(date) && Date.now() - date > WEEK_MS) continue
    messages.push({ text, date: Number.isFinite(date) ? new Date(date).toISOString() : null })
  }
  return messages
}

async function summarize(messages) {
  const joined = messages.map((m, i) => `(${i + 1}) ${m.text}`).join('\n\n').slice(0, 12000)
  const body = {
    model: MODEL,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'تو خلاصه‌ساز اخبار مالی/اقتصادی فارسی هستی. فقط JSON معتبر برگردان.' },
      {
        role: 'user',
        content:
          'این‌ها پیام‌های یک هفتهٔ اخیر یک کانال خبری مالی است. ۱۰ خبر مهم‌تر را انتخاب کن و به فارسی خلاصه بنویس. ' +
          'خروجی دقیقاً این ساختار و بدون هیچ متن اضافه:\n' +
          '{"items":[{"title":"تیتر کوتاه","note":"یک جملهٔ توضیحی"}]}\n' +
          'حداکثر ۱۰ آیتم.\n\nپیام‌ها:\n' +
          joined,
      },
    ],
  }
  const res = await fetch('https://models.github.ai/inference/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`GitHub Models HTTP ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content || '{}'
  const parsed = JSON.parse(content)
  const items = Array.isArray(parsed?.items) ? parsed.items : []
  return items
    .filter((it) => it && typeof it.title === 'string')
    .slice(0, 10)
    .map((it) => ({ title: it.title, note: typeof it.note === 'string' ? it.note : undefined }))
}

async function main() {
  let messages
  try {
    messages = await fetchMessages()
  } catch (err) {
    console.error('خواندن کانال ناموفق بود؛ فایل قبلی دست‌نخورده می‌ماند:', err.message)
    process.exit(0)
  }
  if (messages.length === 0) {
    console.warn('پیامی در یک هفتهٔ اخیر یافت نشد.')
    process.exit(0)
  }

  let items
  try {
    items = await summarize(messages)
  } catch (err) {
    console.error('خلاصه‌سازی ناموفق بود؛ آخرین پیام‌ها خام نوشته می‌شوند:', err.message)
    items = messages.slice(0, 10).map((m) => ({ title: m.text.slice(0, 120) }))
  }
  if (items.length === 0) items = messages.slice(0, 10).map((m) => ({ title: m.text.slice(0, 120) }))

  const out = { generatedAt: new Date().toISOString(), sourceChannel: `@${CHANNEL}`, items }
  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n')
  console.log(`نوشته شد. ${items.length} آیتم از @${CHANNEL}.`)
}

main()
