import { useState } from 'react'
import { useRootStore } from '../../store/rootStore'
import { NumberField } from '../../components/ui/NumberField'
import { faDateShort } from '../../lib/format/date'
import { fetchLivePrices } from './lib/livePrices'
import type { PriceKey } from '../../types'

const FIELDS: { key: PriceKey; label: string }[] = [
  { key: 'usd', label: 'دلار (هر ۱ دلار)' },
  { key: 'usdt', label: 'تتر USDT (هر ۱)' },
  { key: 'coin', label: 'سکهٔ امامی (هر ۱)' },
  { key: 'gold18', label: 'طلای ۱۸ عیار (هر گرم)' },
]

type FetchState = { kind: 'idle' } | { kind: 'loading' } | { kind: 'ok'; msg: string } | { kind: 'err'; msg: string }

export function PricePanel() {
  const prices = useRootStore((s) => s.portfolio.prices)
  const pricesUpdatedAt = useRootStore((s) => s.portfolio.pricesUpdatedAt)
  const setPrice = useRootStore((s) => s.setPrice)
  const markPricesApplied = useRootStore((s) => s.markPricesApplied)

  const [fetchState, setFetchState] = useState<FetchState>({ kind: 'idle' })

  async function onFetchLive() {
    setFetchState({ kind: 'loading' })
    try {
      const live = await fetchLivePrices()
      const applied = Object.entries(live.prices) as [PriceKey, number][]
      if (applied.length === 0) {
        setFetchState({ kind: 'err', msg: 'هنوز قیمتی آماده نیست — بعد از اولین اجرای خودکار (Action) فعال می‌شود.' })
        return
      }
      for (const [key, value] of applied) setPrice(key, value)
      markPricesApplied()
      const when = live.updatedAt ? faDateShort(new Date(live.updatedAt)) : 'اکنون'
      setFetchState({ kind: 'ok', msg: `${applied.length} قیمت به‌روزرسانی شد${live.source ? ` · منبع: ${live.source}` : ''} · ${when}` })
    } catch (e) {
      setFetchState({ kind: 'err', msg: e instanceof Error ? e.message : 'خطای نامشخص در دریافت قیمت‌ها' })
    }
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>قیمت‌های لحظه‌ای</div>
        <div style={{ fontSize: 11, color: 'var(--text-quiet)' }}>
          {pricesUpdatedAt ? `آخرین اعمال: ${faDateShort(new Date(pricesUpdatedAt))}` : 'هنوز اعمال نشده'}
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--text-faint)', lineHeight: 1.7, marginBottom: 13 }}>
        «دریافت خودکار» قیمت‌ها را از به‌روزرسانی دوره‌ای می‌گیرد و اعمال می‌کند. در صورت نیاز می‌توانی هر مقدار را دستی هم اصلاح
        کنی و «اعمال قیمت‌ها» را بزنی. سپس در زیرمجموعه‌های «متصل به قیمت»، فقط مقدار (تعداد/گرم) را وارد می‌کنی.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 10 }}>
        {FIELDS.map((f) => (
          <label key={f.key} style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>
            {f.label}
            <NumberField value={prices[f.key]} onChange={(v) => setPrice(f.key, v)} placeholder="تومان" style={{ marginTop: 4 }} />
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 13, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onFetchLive}
          disabled={fetchState.kind === 'loading'}
          style={{ border: 'none', background: 'var(--accent-green)', color: '#fff', cursor: fetchState.kind === 'loading' ? 'wait' : 'pointer', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, opacity: fetchState.kind === 'loading' ? 0.7 : 1 }}
        >
          {fetchState.kind === 'loading' ? 'در حال دریافت…' : '⟳ دریافت خودکار قیمت‌ها'}
        </button>
        <button
          type="button"
          onClick={markPricesApplied}
          style={{ border: 'none', background: 'var(--accent-gold)', color: '#fff', cursor: 'pointer', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700 }}
        >
          اعمال قیمت‌ها
        </button>
      </div>
      {fetchState.kind === 'ok' && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--accent-green)', fontWeight: 600 }}>{fetchState.msg}</div>
      )}
      {fetchState.kind === 'err' && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--accent-red-strong)', fontWeight: 600 }}>{fetchState.msg}</div>
      )}
    </div>
  )
}
