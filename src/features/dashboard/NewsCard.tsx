import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { faDateShort } from '../../lib/format/date'

type Impact = 'high' | 'medium' | 'low'

interface NewsItem {
  title: string
  note?: string
  url?: string
  impact?: Impact
  source?: string
}

interface NewsChannel {
  channel: string
  items: NewsItem[]
}

interface NewsFeed {
  generatedAt: string | null
  channels?: NewsChannel[]
  // ساختار قدیمی (سازگاری عقب‌رو):
  items?: NewsItem[]
  sourceChannel?: string | null
  sources?: string[]
}

type State =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'error' }
  | { kind: 'ready'; feed: NewsFeed }

// رنگ‌های سطح تأثیر (مثل ForexFactory: قرمز/نارنجی/زرد) — با ولیدیتور dataviz تأیید شده.
const IMPACT_META: Record<Impact, { color: string; label: string }> = {
  high: { color: '#bb4631', label: 'پرتأثیر' },
  medium: { color: '#c77d2e', label: 'متوسط' },
  low: { color: '#c9a227', label: 'کم' },
}

function ImpactDot({ impact }: { impact?: Impact }) {
  const m = IMPACT_META[impact ?? 'low']
  return (
    <span
      title={`تأثیر: ${m.label}`}
      style={{ flexShrink: 0, width: 9, height: 9, borderRadius: '50%', background: m.color, marginTop: 5, boxShadow: `0 0 0 3px ${m.color}22` }}
    />
  )
}

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5, lineHeight: 1.6 }}>
      <ImpactDot impact={item.impact} />
      <div style={{ flex: 1 }}>
        {item.url ? (
          <a href={item.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}>
            {item.title}
          </a>
        ) : (
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{item.title}</span>
        )}
        {item.note && <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{item.note}</div>}
      </div>
    </div>
  )
}

export function NewsCard() {
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    let alive = true
    fetch(`${import.meta.env.BASE_URL}news.json?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      })
      .then((feed: NewsFeed) => {
        if (!alive) return
        const has = (feed.channels?.some((c) => c.items?.length) || feed.items?.length) && feed.generatedAt
        setState(has ? { kind: 'ready', feed } : { kind: 'empty' })
      })
      .catch(() => alive && setState({ kind: 'error' }))
    return () => {
      alive = false
    }
  }, [])

  const feed = state.kind === 'ready' ? state.feed : null
  const channels: NewsChannel[] = feed?.channels?.length
    ? feed.channels
    : feed?.items?.length
      ? [{ channel: (feed.sources?.[0] ?? feed.sourceChannel ?? '').replace(/^@/, ''), items: feed.items }]
      : []

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}>
          <span>▪ خلاصهٔ اخبار هفته</span>
          {feed?.generatedAt && <span style={{ fontSize: 10.5, color: 'var(--text-quiet)', fontWeight: 500 }}>{faDateShort(new Date(feed.generatedAt))}</span>}
        </div>
      }
    >
      {state.kind === 'loading' && <div style={{ fontSize: 12.5, color: 'var(--text-quiet)' }}>در حال دریافت…</div>}

      {state.kind === 'empty' && (
        <div style={{ fontSize: 12.5, color: 'var(--text-quiet)', lineHeight: 1.7 }}>
          هنوز خلاصه‌ای آماده نیست. پس از اولین اجرای خودکار (روزانه)، اخبار هر کانال این‌جا جدا و با سطح تأثیر رنگی نمایش داده می‌شود.
        </div>
      )}

      {state.kind === 'error' && <div style={{ fontSize: 12.5, color: 'var(--text-quiet)', lineHeight: 1.7 }}>فایل اخبار در دسترس نیست.</div>}

      {state.kind === 'ready' && (
        <div>
          {/* راهنمای رنگ سطح تأثیر (مثل فارکس‌فکتوری) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, flexWrap: 'wrap', marginBottom: 13, paddingBottom: 11, borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 10.5, color: 'var(--text-faint)', fontWeight: 600 }}>سطح تأثیر بر اقتصاد:</span>
            {(['high', 'medium', 'low'] as Impact[]).map((imp) => (
              <span key={imp} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: IMPACT_META[imp].color }} />
                {IMPACT_META[imp].label}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {channels.map((ch) => (
              <div key={ch.channel}>
                {ch.channel && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--accent-navy)', background: '#EEF1F8', borderRadius: 7, padding: '3px 10px' }}>@{ch.channel}</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {ch.items.slice(0, 10).map((item, i) => (
                    <NewsRow key={i} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
