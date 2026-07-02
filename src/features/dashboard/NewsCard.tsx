import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { faDateShort } from '../../lib/format/date'
import { toPersianDigits } from '../../lib/format/number'

interface NewsItem {
  title: string
  note?: string
  url?: string
}

interface NewsFeed {
  generatedAt: string | null
  sourceChannel: string | null
  items: NewsItem[]
}

type State =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'error' }
  | { kind: 'ready'; feed: NewsFeed }

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
        if (!feed?.items?.length || !feed.generatedAt) setState({ kind: 'empty' })
        else setState({ kind: 'ready', feed })
      })
      .catch(() => alive && setState({ kind: 'error' }))
    return () => {
      alive = false
    }
  }, [])

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}>
          <span>▪ خلاصهٔ اخبار هفته</span>
          {state.kind === 'ready' && state.feed.generatedAt && (
            <span style={{ fontSize: 10.5, color: 'var(--text-quiet)', fontWeight: 500 }}>{faDateShort(new Date(state.feed.generatedAt))}</span>
          )}
        </div>
      }
    >
      {state.kind === 'loading' && <div style={{ fontSize: 12.5, color: 'var(--text-quiet)' }}>در حال دریافت…</div>}

      {state.kind === 'empty' && (
        <div style={{ fontSize: 12.5, color: 'var(--text-quiet)', lineHeight: 1.7 }}>
          هنوز خلاصه‌ای آماده نیست. پس از تنظیم کانال تلگرام و اولین اجرای خودکار (Action)، ۱۰ خبر مهم هفته این‌جا نمایش داده می‌شود.
        </div>
      )}

      {state.kind === 'error' && (
        <div style={{ fontSize: 12.5, color: 'var(--text-quiet)', lineHeight: 1.7 }}>فایل اخبار در دسترس نیست.</div>
      )}

      {state.kind === 'ready' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {state.feed.items.slice(0, 10).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5, lineHeight: 1.6 }}>
              <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: 'var(--surface-muted)', color: 'var(--accent-navy)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {toPersianDigits(i + 1)}
              </span>
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
          ))}
          {state.feed.sourceChannel && (
            <div style={{ marginTop: 4, fontSize: 10.5, color: 'var(--text-quiet)' }}>منبع: {state.feed.sourceChannel}</div>
          )}
        </div>
      )}
    </Card>
  )
}
