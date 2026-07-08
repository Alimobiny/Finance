import { useState, type CSSProperties } from 'react'
import { useRootStore } from '../../store/rootStore'
import { useUIStore } from '../../store/uiStore'
import { Card } from '../../components/ui/Card'
import { NumberField } from '../../components/ui/NumberField'
import { faMoney, faPercent } from '../../lib/format/number'
import { computeRebalance } from './lib/rebalance'

const th: CSSProperties = { padding: '6px 8px', fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right' }
const td: CSSProperties = { padding: '8px 8px', color: 'var(--text)', whiteSpace: 'nowrap', textAlign: 'right' }
const smallBtn: CSSProperties = {
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  cursor: 'pointer',
  borderRadius: 'var(--radius-md)',
  padding: '6px 12px',
  fontSize: 'var(--fs-xs)',
  fontWeight: 'var(--fw-semibold)',
  color: 'var(--text-muted)',
  whiteSpace: 'nowrap',
}

/** پنلِ تخصیصِ دارایی: سبدهای الگو، ویرایشگرِ اهداف، و پیشنهادِ تعادلِ مبلغی. */
export function AllocationPanel() {
  const editMode = useUIStore((s) => s.editMode)
  const portfolio = useRootStore((s) => s.portfolio)
  const setHoldingTarget = useRootStore((s) => s.setHoldingTarget)
  const applyAllocationPreset = useRootStore((s) => s.applyAllocationPreset)
  const saveAllocationPreset = useRootStore((s) => s.saveAllocationPreset)
  const removeAllocationPreset = useRootStore((s) => s.removeAllocationPreset)
  const addStandardBaskets = useRootStore((s) => s.addStandardBaskets)
  const normalizeTargetsTo100 = useRootStore((s) => s.normalizeTargetsTo100)

  const holdings = portfolio.holdings
  const presets = portfolio.allocationPresets
  const [presetName, setPresetName] = useState('')

  const { total, targetSum, rows } = computeRebalance(portfolio)
  const sumOff = Math.abs(targetSum - 100) > 0.5
  const thresh = total * 0.005 // زیرِ ۰٫۵٪ کلِ سبد را «متعادل» می‌شماریم

  return (
    <>
      <Card title="▪ سبدهای الگو و اهداف" style={{ marginBottom: 16 }}>
        {/* سبدهای الگو — یک کلیک، همهٔ اهداف را ست می‌کند */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-faint)', fontWeight: 'var(--fw-semibold)' }}>سبدِ الگو:</span>
          {presets.map((p) => (
            <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: 9, padding: '3px 6px 3px 10px' }}>
              <button type="button" onClick={() => applyAllocationPreset(p.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-bold)', color: 'var(--accent-navy)' }}>
                {p.name}
              </button>
              {editMode && (
                <button type="button" title="حذف الگو" onClick={() => removeAllocationPreset(p.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-quiet)', fontSize: 14, lineHeight: 1 }}>
                  ×
                </button>
              )}
            </span>
          ))}
          {presets.length === 0 && <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-quiet)' }}>الگویی ذخیره نشده.</span>}
        </div>

        {holdings.length === 0 ? (
          <div style={{ background: 'var(--surface-muted)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-quiet)', marginBottom: 10 }}>هنوز دسته‌ای نیست.</div>
            <button type="button" onClick={addStandardBaskets} style={{ ...smallBtn, background: 'var(--accent-green)', color: '#fff', border: 'none', fontWeight: 'var(--fw-bold)' }}>
              + افزودن دسته‌های استاندارد (از اکسل)
            </button>
          </div>
        ) : (
          <>
            {/* ویرایشگرِ درصدِ هدفِ هر دسته */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 10 }}>
              {holdings.map((h) => (
                <label key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--fs-xs)' }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: h.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</span>
                  <div style={{ width: 76 }}>
                    <NumberField value={h.target} onChange={(v) => setHoldingTarget(h.id, v)} />
                  </div>
                  <span style={{ color: 'var(--text-quiet)' }}>٪</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginTop: 13, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 'var(--fw-bold)', color: sumOff ? 'var(--accent-red-strong)' : 'var(--accent-green)' }}>
                جمعِ اهداف: {faPercent(targetSum, 0)} {sumOff ? '— باید ۱۰۰٪ شود' : '✓'}
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {sumOff && (
                  <button type="button" onClick={normalizeTargetsTo100} style={smallBtn}>
                    یکسان‌سازی به ۱۰۰٪
                  </button>
                )}
                <button type="button" onClick={addStandardBaskets} style={smallBtn}>
                  + دسته‌های استاندارد
                </button>
                {editMode && (
                  <>
                    <input
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="نامِ الگوی جدید"
                      style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '6px 10px', fontSize: 'var(--fs-xs)', background: 'var(--surface-muted)', outline: 'none', width: 120 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        saveAllocationPreset(presetName)
                        setPresetName('')
                      }}
                      style={{ ...smallBtn, color: 'var(--accent-navy)' }}
                    >
                      ذخیرهٔ اهداف به‌عنوان الگو
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </Card>

      {total > 0 && (
        <Card title="▪ پیشنهادِ تعادل (چقدر بخرم / بفروشم)" style={{ marginBottom: 16 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-xs)' }}>
              <thead>
                <tr style={{ color: 'var(--text-faint)' }}>
                  <th style={th}>دسته</th>
                  <th style={th}>٪ فعلی</th>
                  <th style={th}>٪ هدف</th>
                  <th style={th}>مبلغِ هدف</th>
                  <th style={th}>اقدام</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const balanced = Math.abs(r.delta) <= thresh
                  return (
                    <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={td}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: r.color, marginInlineEnd: 7 }} />
                        {r.name}
                      </td>
                      <td style={td}>{faPercent(r.actualPercent)}</td>
                      <td style={td}>{faPercent(r.targetPercent, Number.isInteger(r.targetPercent) ? 0 : 1)}</td>
                      <td style={td}>{faMoney(r.targetValue)}</td>
                      <td style={{ ...td, fontWeight: 'var(--fw-bold)', color: balanced ? 'var(--text-quiet)' : r.delta > 0 ? 'var(--accent-green)' : 'var(--accent-red-strong)' }}>
                        {balanced ? 'متعادل' : r.delta > 0 ? `بخر ${faMoney(r.delta)}` : `بفروش ${faMoney(-r.delta)}`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {sumOff && (
            <div style={{ marginTop: 10, fontSize: 'var(--fs-2xs)', color: 'var(--accent-red-strong)' }}>
              جمعِ اهداف ۱۰۰٪ نیست؛ تا اصلاح نشود مبالغِ هدف دقیق نیستند.
            </div>
          )}
        </Card>
      )}
    </>
  )
}
