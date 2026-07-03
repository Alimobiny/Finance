// پیام‌های یک هفتهٔ اخیرِ چند کانال عمومی تلگرام (تا ۵ کانال) را می‌خواند، با GitHub Models
// (رایگان، داخل خود Action) به ۱۰ خبر مهم خلاصه می‌کند و در public/news.json می‌نویسد.
//
// کانال‌ها به این ترتیب انتخاب می‌شوند:
//   1) متغیر TELEGRAM_CHANNELS (چند کانال با کاما) —
//   2) متغیر قدیمی TELEGRAM_CHANNEL (یک کانال) —
//   3) لیست پیش‌فرضِ همین فایل (DEFAULT_CHANNELS).
// چون gh/متغیر ریپو لازم نیست، تغییر لیست پیش‌فرض همین‌جا کافی است.
//
// GITHUB_TOKEN به‌صورت خودکار در Action موجود است (permissions: models: read).
// اگر کانالی خصوصی باشد، صفحهٔ t.me/s در دسترس نیست و باید عمومی شود.
// اگر خلاصه‌سازی شکست بخورد، آخرین پیام‌ها به‌صورت چرخشی بین کانال‌ها نوشته می‌شوند.

import { writeFile } from 'node:fs/promises'

const OUT = new URL('../public/news.json', import.meta.url)
const TOKEN = process.env.GITHUB_TOKEN
const MODEL = process.env.NEWS_MODEL || 'openai/gpt-4o-mini'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const MAX_CHANNELS = 5

// لیست پیش‌فرض کانال‌های عمومی (بدون @). برای افزودن/حذف کانال، همین آرایه را ویرایش کن (حداکثر ۵).
const DEFAULT_CHANNELS = ['newscitypro', 'virauniversitycom']

function resolveChannels() {
  const raw = process.env.TELEGRAM_CHANNELS || process.env.TELEGRAM_CHANNEL || DEFAULT_CHANNELS.join(',')
  const list = raw
    .split(',')
    .map((c) => c.replace(/^https?:\/\/t\.me\//i, '').replace(/^@/, '').replace(/\/.*$/, '').trim())
    .filter(Boolean)
  // یکتا‌سازی با حفظ ترتیب و سقف ۵ کانال.
  return [...new Set(list)].slice(0, MAX_CHANNELS)
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

async function fetchMessages(channel) {
  const res = await fetch(`https://t.me/s/${channel}`, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`تلگرام HTTP ${res.status}`)
  const html = await res.text()

  // هر پیام را جدا می‌کنیم تا زمان و متنِ همان پیام به هم بچسبند.
  const blocks = html.split('tgme_widget_message_wrap').slice(1)
  const messages = []
  for (const b of blocks) {
    const tm = b.match(/datetime="([^"]+)"/)
    const tx =
      b.match(/tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>\s*<div class="tgme_widget_message_(?:footer|info)/) ||
      b.match(/tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/)
    const text = tx ? stripHtml(tx[1]) : ''
    const date = tm ? Date.parse(tm[1]) : NaN
    if (!text) continue
    if (Number.isFinite(date) && Date.now() - date > WEEK_MS) continue
    messages.push({ text, source: channel, date: Number.isFinite(date) ? date : 0 })
  }
  return messages
}

/** پیام‌های همهٔ کانال‌ها را می‌آورد؛ کانال‌های ناموفق را رد می‌کند. */
async function fetchAll(channels) {
  const results = await Promise.allSettled(channels.map(fetchMessages))
  const all = []
  const okChannels = []
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value.length) {
      all.push(...r.value)
      okChannels.push(channels[i])
    } else {
      console.warn(`کانال «${channels[i]}» خوانده نشد یا خالی بود.`)
    }
  })
  // جدیدترین‌ها اول.
  all.sort((a, b) => b.date - a.date)
  return { messages: all, okChannels }
}

async function summarize(messages, channels) {
  // برای پوشش منصفانه، از هر کانال حداکثر ~۲۵ پیام آخر می‌فرستیم.
  const perChannel = 25
  const grouped = {}
  for (const m of messages) (grouped[m.source] ??= []).push(m)
  const picked = []
  for (const ch of channels) picked.push(...(grouped[ch] || []).slice(0, perChannel))

  const joined = picked.map((m, i) => `(${i + 1}) [${m.source}] ${m.text}`).join('\n\n').slice(0, 16000)
  const body = {
    model: MODEL,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'تو یک تحلیل‌گر اخبار مالی/اقتصادی فارسی هستی. فقط JSON معتبر برگردان.' },
      {
        role: 'user',
        content:
          `این‌ها پیام‌های یک هفتهٔ اخیرِ ${channels.length} کانال خبری مالی است (نام کانال داخل [] آمده). ` +
          'مهم‌ترین ۱۰ خبرِ هفته را انتخاب کن. اخبار تکراری یا هم‌مضمون بین کانال‌ها را یکی کن. ' +
          'برای هر خبر یک تیتر کوتاه فارسی و یک جملهٔ توضیحیِ مفید بنویس و نام کانال منبع را در فیلد source بگذار. ' +
          'اولویت با اخبار قابل‌استفاده برای معامله‌گر/سرمایه‌گذار (بازار، طلا، دلار، رمزارز، نرخ بهره، تورم، سیاست پولی) باشد. ' +
          'خروجی دقیقاً این ساختار و بدون هیچ متن اضافه:\n' +
          '{"items":[{"title":"تیتر کوتاه","note":"یک جملهٔ توضیحی","source":"نام‌کانال"}]}\n' +
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
    .map((it) => ({
      title: it.title,
      note: typeof it.note === 'string' ? it.note : undefined,
      source: typeof it.source === 'string' ? it.source.replace(/^@/, '') : undefined,
    }))
}

/** اگر خلاصه‌سازی نشد: به‌صورت چرخشی از هر کانال یک پیام برمی‌داریم تا همه پوشش داده شوند. */
function roundRobinFallback(messages, channels) {
  const grouped = {}
  for (const m of messages) (grouped[m.source] ??= []).push(m)
  const out = []
  for (let i = 0; out.length < 10; i++) {
    let advanced = false
    for (const ch of channels) {
      const list = grouped[ch]
      if (list && list[i]) {
        out.push({ title: list[i].text.slice(0, 120), source: ch })
        advanced = true
        if (out.length >= 10) break
      }
    }
    if (!advanced) break
  }
  return out
}

async function main() {
  const channels = resolveChannels()
  if (channels.length === 0) {
    console.error('هیچ کانالی تنظیم نشده؛ خروج بدون تغییر.')
    process.exit(0)
  }
  console.log(`کانال‌ها: ${channels.join(', ')}`)

  const { messages, okChannels } = await fetchAll(channels)
  if (messages.length === 0) {
    console.warn('پیامی در یک هفتهٔ اخیر از هیچ کانالی یافت نشد؛ فایل قبلی دست‌نخورده می‌ماند.')
    process.exit(0)
  }

  let items
  try {
    items = await summarize(messages, okChannels)
  } catch (err) {
    console.error('خلاصه‌سازی ناموفق بود؛ حالت چرخشی خام:', err.message)
    items = roundRobinFallback(messages, okChannels)
  }
  if (!items || items.length === 0) items = roundRobinFallback(messages, okChannels)

  const out = {
    generatedAt: new Date().toISOString(),
    sources: okChannels.map((c) => `@${c}`),
    // برای سازگاری با نسخهٔ قبلی برنامه.
    sourceChannel: okChannels.map((c) => `@${c}`).join('، '),
    items,
  }
  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n')
  console.log(`نوشته شد. ${items.length} آیتم از ${okChannels.length} کانال (${okChannels.join(', ')}).`)
}

main()
