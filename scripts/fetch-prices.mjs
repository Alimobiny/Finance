// قیمت‌های بازار ایران را می‌گیرد و در public/prices.json می‌نویسد.
// این اسکریپت سمت سرور (GitHub Action) اجرا می‌شود، پس محدودیت CORS ندارد.
// طراحی مقاوم: اگر منبع خطا داد یا فیلدی نیامد، آخرین مقدار معتبر قبلی حفظ می‌شود
// (هرگز قیمت‌ها را با صفر بازنویسی نمی‌کند).
//
// منبع پیش‌فرض: tgju.org (بدون کلید). اگر روزی کلید BrsApi داشتی، می‌توانی تابع
// fromBrsApi را جایگزین کنی — پایدارتر است (کلید در Secrets می‌ماند، نه در اپ).

import { readFile, writeFile } from 'node:fs/promises'

const OUT = new URL('../public/prices.json', import.meta.url)
const KEYS = ['usd', 'usdt', 'coin', 'gold18']

function toNumber(raw) {
  if (raw == null) return NaN
  return Number(String(raw).replace(/[,\s]/g, ''))
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(OUT, 'utf8'))
  } catch {
    return { prices: {} }
  }
}

// tgju قیمت‌ها را به ریال می‌دهد؛ برای تومان بر ۱۰ تقسیم می‌کنیم.
async function fromTgju() {
  const res = await fetch('https://call3.tgju.org/ajax.json', {
    headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`tgju HTTP ${res.status}`)
  const data = await res.json()
  const cur = data?.current ?? {}
  const rialToToman = (v) => (Number.isFinite(v) ? Math.round(v / 10) : NaN)
  const pick = (key) => rialToToman(toNumber(cur?.[key]?.p))
  return {
    source: 'tgju.org',
    prices: {
      usd: pick('price_dollar_rl'),
      usdt: pick('crypto-tether-irr'),
      coin: pick('sekee'),
      gold18: pick('geram18'),
    },
  }
}

async function main() {
  const prev = await readExisting()
  let fresh
  try {
    fresh = await fromTgju()
  } catch (err) {
    console.error('دریافت قیمت‌ها ناموفق بود؛ فایل قبلی دست‌نخورده می‌ماند:', err.message)
    process.exit(0)
  }

  const merged = { ...(prev.prices ?? {}) }
  let changed = 0
  for (const k of KEYS) {
    const v = fresh.prices[k]
    if (Number.isFinite(v) && v > 0) {
      if (merged[k] !== v) changed++
      merged[k] = v
    } else {
      console.warn(`فیلد ${k} از منبع نیامد؛ مقدار قبلی حفظ شد.`)
    }
  }

  const out = { source: fresh.source, updatedAt: new Date().toISOString(), prices: merged }
  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n')
  console.log(`نوشته شد. ${changed} قیمت تغییر کرد:`, merged)
}

main()
