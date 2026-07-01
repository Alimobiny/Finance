import { useRootStore } from '../../store/rootStore'
import { NumberField } from '../../components/ui/NumberField'
import { faDateShort } from '../../lib/format/date'
import type { PriceKey } from '../../types'

const FIELDS: { key: PriceKey; label: string }[] = [
  { key: 'usd', label: 'دلار (هر ۱ دلار)' },
  { key: 'usdt', label: 'تتر USDT (هر ۱)' },
  { key: 'coin', label: 'سکهٔ امامی (هر ۱)' },
  { key: 'gold18', label: 'طلای ۱۸ عیار (هر گرم)' },
]

export function PricePanel() {
  const prices = useRootStore((s) => s.portfolio.prices)
  const pricesUpdatedAt = useRootStore((s) => s.portfolio.pricesUpdatedAt)
  const setPrice = useRootStore((s) => s.setPrice)
  const markPricesApplied = useRootStore((s) => s.markPricesApplied)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 18px', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>قیمت‌های لحظه‌ای (دستی)</div>
        <div style={{ fontSize: 11, color: 'var(--text-quiet)' }}>
          {pricesUpdatedAt ? `آخرین اعمال: ${faDateShort(new Date(pricesUpdatedAt))}` : 'هنوز اعمال نشده'}
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--text-faint)', lineHeight: 1.7, marginBottom: 13 }}>
        قیمت‌ها را از جایی مثل tgju.org ببین و این‌جا وارد کن. سپس در زیرمجموعه‌های «متصل به قیمت»، فقط مقدار (تعداد/گرم) را وارد
        می‌کنی و ارزش خودکار حساب می‌شود.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 10 }}>
        {FIELDS.map((f) => (
          <label key={f.key} style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>
            {f.label}
            <NumberField value={prices[f.key]} onChange={(v) => setPrice(f.key, v)} placeholder="تومان" style={{ marginTop: 4 }} />
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={markPricesApplied}
        style={{ marginTop: 13, border: 'none', background: 'var(--accent-gold)', color: '#fff', cursor: 'pointer', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700 }}
      >
        اعمال قیمت‌ها
      </button>
    </div>
  )
}
