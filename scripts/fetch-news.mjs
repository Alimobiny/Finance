// پیام‌های یک هفتهٔ اخیرِ چند کانال عمومی تلگرام (تا ۵ کانال) را می‌خواند و برای «هر کانال جدا»
// با GitHub Models (رایگان، داخل خود Action) خلاصه می‌کند، سطح تأثیر بر اقتصاد کلان (impact)
// را مثل ForexFactory مشخص می‌کند و در public/news.json می‌نویسد.
//
// منبع کانال‌ها به این ترتیب:
//   1) متغیر محیطی TELEGRAM_CHANNELS (چند کانال با کاما) —
//   2) فایل public/news-channels.json (که از داخل برنامه/تنظیمات مدیریت می‌شود) —
//   3) لیست پیش‌فرضِ همین فایل.
//
// GITHUB_TOKEN به‌صورت خودکار در Action موجود است (permissions: models: read).
// اگر خلاصه‌سازی یک کانال شکست بخورد، همان پیام‌های خام آن کانال نوشته می‌شوند.

import { readFile, writeFile } from 'node:fs/promises'

const OUT = new URL('../public/news.json', import.meta.url)
const CHANNELS_FILE = new URL('../public/news-channels.json', import.meta.url)
const TOKEN = process.env.GITHUB_TOKEN
const MODEL = process.env.NEWS_MODEL || 'openai/gpt-4o-mini'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const MAX_CHANNELS = 5
const ITEMS_PER_CHANNEL = 10 // حداکثر خبر برای هر کانال (بعداً قابل تغییر)

const DEFAULT_CHANNELS = ['newscitypro', 'virauniversitycom']

function clean(c) {
  return c
    .replace(/^https?:\/\/t\.me\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '')
    .trim()
}

async function resolveChannels() {
  if (process.env.TELEGRAM_CHANNELS) {
    return dedupCap(process.env.TELEGRAM_CHANNELS.split(',').map(clean).filter(Boolean))
  }
  try {
    const raw = await readFile(CHANNELS_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed?.channels) && parsed.channels.length) {
      return dedupCap(parsed.channels.map(clean).filter(Boolean))
    }
  } catch {
    // فایل نبود یا خراب بود — می‌رویم سراغ پیش‌فرض.
  }
  if (process.env.TELEGRAM_CHANNEL) return dedupCap([clean(process.env.TELEGRAM_CHANNEL)])
  return dedupCap(DEFAULT_CHANNELS)
}

function dedupCap(list) {
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
    messages.push({ text, date: Number.isFinite(date) ? date : 0 })
  }
  return messages.sort((a, b) => b.date - a.date)
}

const IMPACTS = new Set(['high', 'medium', 'low'])

/** یک کانال را جداگانه خلاصه می‌کند و به هر خبر سطح تأثیر (high/medium/low) می‌دهد. */
async function summarizeChannel(channel, messages) {
  const joined = messages.slice(0, 40).map((m, i) => `(${i + 1}) ${m.text}`).join('\n\n').slice(0, 14000)
  const body = {
    model: MODEL,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'تو یک تحلیل‌گر اخبار مالی/اقتصادی فارسی هستی. فقط JSON معتبر برگردان.' },
      {
        role: 'user',
        content:
          `این‌ها پیام‌های یک هفتهٔ اخیرِ کانال تلگرامی «${channel}» است (ممکن است اقتصادی یا علمی باشد). ` +
          `مهم‌ترین حداکثر ${ITEMS_PER_CHANNEL} خبر را انتخاب و به فارسی خلاصه کن. ` +
          'برای هر خبر: یک تیتر کوتاه، یک جملهٔ «تحلیل کوتاه» دربارهٔ اهمیت/پیامد آن، و سطح تأثیر بر اقتصاد کلان ' +
          'در فیلد impact با یکی از این سه مقدار: "high" (پرتأثیر مثل نرخ بهره/تورم/سیاست پولی/تصمیم بانک مرکزی/جنگ)، ' +
          '"medium" (اثر متوسط بر بازار)، "low" (خبر عمومی یا علمی با اثر کم). ' +
          'اخبار پرتأثیرتر را اول بیاور. خروجی دقیقاً این ساختار و بدون هیچ متن اضافه:\n' +
          '{"items":[{"title":"تیتر","note":"تحلیل کوتاه","impact":"high|medium|low"}]}\n\n' +
          'پیام‌ها:\n' +
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
  const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}')
  const items = Array.isArray(parsed?.items) ? parsed.items : []
  const order = { high: 0, medium: 1, low: 2 }
  return items
    .filter((it) => it && typeof it.title === 'string')
    .map((it) => ({
      title: it.title,
      note: typeof it.note === 'string' ? it.note : undefined,
      impact: IMPACTS.has(it.impact) ? it.impact : 'low',
    }))
    .sort((a, b) => order[a.impact] - order[b.impact])
    .slice(0, ITEMS_PER_CHANNEL)
}

async function main() {
  const channels = await resolveChannels()
  if (channels.length === 0) {
    console.error('هیچ کانالی تنظیم نشده؛ خروج بدون تغییر.')
    process.exit(0)
  }
  console.log(`کانال‌ها: ${channels.join(', ')}`)

  const out = { generatedAt: new Date().toISOString(), channels: [] }

  for (const channel of channels) {
    let messages = []
    try {
      messages = await fetchMessages(channel)
    } catch (err) {
      console.warn(`کانال «${channel}» خوانده نشد: ${err.message}`)
      continue
    }
    if (messages.length === 0) {
      console.warn(`کانال «${channel}» پیامی در هفتهٔ اخیر نداشت.`)
      continue
    }
    let items
    try {
      items = await summarizeChannel(channel, messages)
    } catch (err) {
      console.error(`خلاصه‌سازی «${channel}» ناموفق بود؛ خام نوشته می‌شود: ${err.message}`)
      items = messages.slice(0, ITEMS_PER_CHANNEL).map((m) => ({ title: m.text.slice(0, 120), impact: 'low' }))
    }
    if (items.length) out.channels.push({ channel, items })
  }

  if (out.channels.length === 0) {
    console.warn('هیچ خبری از هیچ کانالی به‌دست نیامد؛ فایل قبلی دست‌نخورده می‌ماند.')
    process.exit(0)
  }

  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n')
  console.log(`نوشته شد. ${out.channels.length} کانال، مجموعاً ${out.channels.reduce((n, c) => n + c.items.length, 0)} خبر.`)
}

main()
