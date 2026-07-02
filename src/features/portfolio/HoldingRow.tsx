import { useState } from 'react'
import { useRootStore } from '../../store/rootStore'
import { useUIStore } from '../../store/uiStore'
import { useSoftDelete } from '../../lib/useSoftDelete'
import { NumberField } from '../../components/ui/NumberField'
import { AssetDonut } from '../../components/ui/AssetDonut'
import { faMoney, faPercent } from '../../lib/format/number'
import { tintPalette } from '../../lib/color'
import { holdingRowStats } from './lib/portfolioAnalytics'
import { subValue } from './lib/computeHoldingValue'
import type { Holding, PriceKey } from '../../types'

const UNIT_LABEL: Record<PriceKey, string> = { usd: 'دلار', usdt: 'تتر', coin: 'سکه', gold18: 'گرم طلا' }

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  متعادل: { bg: '#EEF1F8', color: 'var(--accent-navy)' },
  'کم‌وزن': { bg: 'var(--accent-green-soft)', color: 'var(--accent-green)' },
  'پروزن': { bg: 'var(--accent-red-soft)', color: '#B5572F' },
  '—': { bg: '#F0EDE6', color: 'var(--text-quiet)' },
}

export function HoldingRow({ holding, index, portfolio }: { holding: Holding; index: number; portfolio: import('../../types').PortfolioState }) {
  const [expanded, setExpanded] = useState(false)
  const editMode = useUIStore((s) => s.editMode)
  const softDelete = useSoftDelete()

  const updateHolding = useRootStore((s) => s.updateHolding)
  const removeHolding = useRootStore((s) => s.removeHolding)
  const restoreHolding = useRootStore((s) => s.restoreHolding)
  const addManualSub = useRootStore((s) => s.addManualSub)
  const addLinkedSub = useRootStore((s) => s.addLinkedSub)
  const updateSubName = useRootStore((s) => s.updateSubName)
  const updateSubValue = useRootStore((s) => s.updateSubValue)
  const updateSubQty = useRootStore((s) => s.updateSubQty)
  const updateSubUnit = useRootStore((s) => s.updateSubUnit)
  const removeSub = useRootStore((s) => s.removeSub)
  const restoreSub = useRootStore((s) => s.restoreSub)

  const stats = holdingRowStats(holding, portfolio)
  const statusStyle = STATUS_STYLE[stats.status]
  const subColors = tintPalette(holding.color, holding.subs.length)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 13, padding: '15px 16px' }}>
      <div onClick={() => setExpanded((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: 11, flexWrap: 'wrap', cursor: 'pointer' }}>
        <span style={{ fontSize: 13, color: 'var(--text-quiet)', width: 13 }}>{expanded ? '▾' : '▸'}</span>
        <span style={{ width: 11, height: 11, borderRadius: 3, background: holding.color, flexShrink: 0 }} />
        {editMode ? (
          <input
            value={holding.name}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => updateHolding(holding.id, { name: e.target.value })}
            style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '5px 9px', fontSize: 13.5, fontWeight: 700, background: 'var(--surface-muted)', outline: 'none', width: 140 }}
          />
        ) : (
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>{holding.name}</div>
        )}
        {editMode ? (
          <input
            value={holding.layer}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => updateHolding(holding.id, { layer: e.target.value })}
            style={{ border: '1px solid var(--border)', borderRadius: 20, padding: '3px 10px', fontSize: 11, background: holding.color, color: '#fff', outline: 'none', width: 80 }}
          />
        ) : (
          <div style={{ fontSize: 11, color: '#fff', background: holding.color, borderRadius: 20, padding: '2px 9px', fontWeight: 600 }}>{holding.layer}</div>
        )}
        <div style={{ fontSize: 11.5, color: 'var(--text-quiet)' }}>{holding.role}</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', direction: 'ltr' }}>{faMoney(stats.value)}</div>
        <div style={{ fontSize: 11.5, fontWeight: 600, background: statusStyle.bg, color: statusStyle.color, borderRadius: 7, padding: '4px 10px' }}>{stats.status}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 13, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ height: 9, borderRadius: 6, background: '#F0EDE6', overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: '100%', width: `${Math.min(stats.actualPercent, 100)}%`, background: holding.color, borderRadius: 6 }} />
            <div style={{ position: 'absolute', top: -3, bottom: -3, insetInlineStart: `${Math.min(holding.target, 100)}%`, width: 2, background: 'var(--text)', borderRadius: 2 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-quiet)' }}>
            <span>
              واقعی: <b style={{ color: 'var(--text)' }}>{faPercent(stats.actualPercent)}</b>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              هدف:{' '}
              {editMode ? (
                <NumberField value={holding.target} onChange={(v) => updateHolding(holding.id, { target: v })} decimals={1} style={{ width: 60, padding: '3px 6px' }} />
              ) : (
                <b style={{ color: 'var(--text)' }}>{faPercent(holding.target, 0)}</b>
              )}
            </span>
          </div>
        </div>
        {editMode && (
          <button
            type="button"
            onClick={() => {
              const snapshot = { ...holding }
              softDelete(`«${snapshot.name}» حذف شد`, () => removeHolding(holding.id), () => restoreHolding(snapshot, index))
            }}
            style={{ border: '1px solid #F0D8D0', background: '#FBF1EE', cursor: 'pointer', borderRadius: 8, padding: '8px 12px', fontSize: 11.5, fontWeight: 600, color: 'var(--accent-red-strong)' }}
          >
            حذف دارایی
          </button>
        )}
      </div>

      {expanded && (
        <div style={{ marginTop: 13, paddingTop: 13, borderTop: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {holding.subs.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 9 }}>ترکیب «{holding.name}»</div>
              <AssetDonut
                size={120}
                thickness={17}
                slices={holding.subs.map((sub, i) => ({
                  label: sub.name,
                  value: subValue(sub, portfolio.prices),
                  color: subColors[i],
                }))}
                emptyHint="برای دیدن نمودار، ارزش زیرمجموعه‌ها را وارد کن."
              />
            </div>
          )}
          {holding.subs.map((sub, subIndex) => (
            <div key={sub.id} style={{ background: 'var(--surface-muted)', borderRadius: 10, padding: '9px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: holding.color, flexShrink: 0 }} />
                {editMode ? (
                  <input
                    value={sub.name}
                    onChange={(e) => updateSubName(holding.id, sub.id, e.target.value)}
                    style={{ flex: 1, minWidth: 100, border: '1px solid var(--border)', borderRadius: 8, padding: '6px 9px', fontSize: 12, background: 'var(--surface)', outline: 'none' }}
                  />
                ) : (
                  <div style={{ fontSize: 12.5, flex: 1, minWidth: 100 }}>{sub.name}</div>
                )}

                {sub.kind === 'linked' ? (
                  <>
                    {editMode ? (
                      <select
                        value={sub.unit}
                        onChange={(e) => updateSubUnit(holding.id, sub.id, e.target.value as PriceKey)}
                        style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px', fontSize: 11.5, background: 'var(--surface)', outline: 'none' }}
                      >
                        {(Object.keys(UNIT_LABEL) as PriceKey[]).map((u) => (
                          <option key={u} value={u}>
                            {UNIT_LABEL[u]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-quiet)' }}>{UNIT_LABEL[sub.unit]}</span>
                    )}
                    {editMode && (
                      <NumberField value={sub.qty} onChange={(v) => updateSubQty(holding.id, sub.id, v)} decimals={4} placeholder="مقدار" style={{ width: 90 }} />
                    )}
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-green)', minWidth: 90, textAlign: 'left', direction: 'ltr' }}>
                      {faMoney(subValue(sub, portfolio.prices))}
                    </span>
                  </>
                ) : (
                  <NumberField value={sub.value} onChange={(v) => updateSubValue(holding.id, sub.id, v)} placeholder="ارزش (ت)" style={{ width: 130 }} />
                )}

                {editMode && (
                  <button
                    type="button"
                    onClick={() => {
                      const snapshot = { ...sub }
                      softDelete(`«${snapshot.name}» حذف شد`, () => removeSub(holding.id, sub.id), () => restoreSub(holding.id, snapshot, subIndex))
                    }}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red-strong)', fontSize: 15 }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          {editMode && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => addManualSub(holding.id)}
                style={{ border: '1px dashed var(--border-strong)', background: 'var(--surface)', cursor: 'pointer', borderRadius: 9, padding: '7px 13px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}
              >
                + زیرمجموعهٔ دستی
              </button>
              <button
                type="button"
                onClick={() => addLinkedSub(holding.id)}
                style={{ border: '1px dashed var(--border-strong)', background: 'var(--surface)', cursor: 'pointer', borderRadius: 9, padding: '7px 13px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}
              >
                + زیرمجموعهٔ متصل به قیمت
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
