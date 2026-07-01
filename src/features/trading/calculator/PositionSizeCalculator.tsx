import { useRootStore } from '../../../store/rootStore'
import { NumberField } from '../../../components/ui/NumberField'
import { faNumber } from '../../../lib/format/number'
import { computePositionSize } from '../lib/positionSize'

export function PositionSizeCalculator() {
  const positionSize = useRootStore((s) => s.trading.positionSize)
  const setPositionSize = useRootStore((s) => s.setPositionSize)
  const result = computePositionSize(positionSize)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18 }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>بخش ۲ — حجم با ریسک ثابت</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-quiet)', marginBottom: 14 }}>فرمول دلاری مخصوص طلا · ۱ لات = ۱۰۰ اونس</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 12.5, color: 'var(--text-muted)' }}>
          موجودی حساب (دلار)
          <NumberField value={positionSize.balanceUsd} onChange={(v) => setPositionSize({ balanceUsd: v })} style={{ width: 130 }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 12.5, color: 'var(--text-muted)' }}>
          ریسک ثابت هر معامله (٪)
          <NumberField value={positionSize.riskPercent} onChange={(v) => setPositionSize({ riskPercent: v })} decimals={2} style={{ width: 130 }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: 12.5, color: 'var(--text-muted)' }}>
          فاصلهٔ استاپ به دلار
          <NumberField value={positionSize.stopUsd} onChange={(v) => setPositionSize({ stopUsd: v })} decimals={2} style={{ width: 130 }} />
        </label>
      </div>
      <div style={{ display: 'flex', gap: 11, marginTop: 15 }}>
        <div style={{ flex: 1, background: 'var(--surface-muted)', borderRadius: 11, padding: 13, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>ریسک دلاری</div>
          <div style={{ fontSize: 19, fontWeight: 800, direction: 'ltr' }}>{faNumber(result.riskUsd, 0)}$</div>
        </div>
        <div style={{ flex: 1, background: 'var(--accent-green-soft)', borderRadius: 11, padding: 13, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 600 }}>حجم معامله (لات)</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--accent-green)', direction: 'ltr' }}>{faNumber(result.lots, 3)}</div>
        </div>
      </div>
      <div style={{ marginTop: 13, fontSize: 11.5, color: '#7D6608', background: '#FEFBF0', borderRadius: 9, padding: '10px 12px', lineHeight: 1.6 }}>
        امتیاز بالا هیچ‌وقت دلیل افزایش ریسک نیست. ریسک تو همیشه ثابت است.
      </div>
    </div>
  )
}
