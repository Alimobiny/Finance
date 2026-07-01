import { useRootStore } from '../../store/rootStore'
import { useUIStore } from '../../store/uiStore'
import { useSoftDelete } from '../../lib/useSoftDelete'
import { NumberField } from '../../components/ui/NumberField'
import { faMoney, faNumber } from '../../lib/format/number'
import { deriveDebt } from './lib/moneyCalcs'
import type { Debt } from '../../types'

const KIND_LABEL: Record<Debt['kind'], string> = { installment: 'وام', personal: 'قرض', lumpSum: 'یکجا' }
const KIND_COLOR: Record<Debt['kind'], string> = { installment: '#7D6608', personal: '#5B6BA8', lumpSum: '#3E6B5A' }

export function DebtCard({ debt, index }: { debt: Debt; index: number }) {
  const editMode = useUIStore((s) => s.editMode)
  const softDelete = useSoftDelete()
  const updateDebt = useRootStore((s) => s.updateDebt)
  const removeDebt = useRootStore((s) => s.removeDebt)
  const restoreDebt = useRootStore((s) => s.restoreDebt)
  const toggleDebtSettled = useRootStore((s) => s.toggleDebtSettled)
  const payInstallment = useRootStore((s) => s.payInstallment)
  const unpayInstallment = useRootStore((s) => s.unpayInstallment)

  const derived = deriveDebt(debt)
  const isLump = debt.kind === 'lumpSum'

  return (
    <div style={{ border: '1px solid #F0EDE6', borderRadius: 12, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#fff', background: KIND_COLOR[debt.kind], borderRadius: 6, padding: '2px 8px' }}>
          {KIND_LABEL[debt.kind]}
        </span>
        {editMode ? (
          <input
            value={debt.name}
            onChange={(e) => updateDebt(debt.id, { name: e.target.value })}
            style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '5px 9px', fontSize: 13, fontWeight: 600, background: 'var(--surface-muted)', outline: 'none', width: 160 }}
          />
        ) : (
          <div style={{ fontWeight: 700, fontSize: 14 }}>{debt.name}</div>
        )}
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', background: '#F4F2EC', borderRadius: 7, padding: '3px 9px' }}>
          {derived.status}
        </div>
        <div style={{ flex: 1 }} />
        {editMode && (
          <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {!isLump && (
              <>
                <button type="button" onClick={() => payInstallment(debt.id)} style={{ border: '1px solid #BFE0CD', background: '#F1F8F3', cursor: 'pointer', color: 'var(--accent-green)', borderRadius: 7, padding: '4px 9px', fontSize: 11, fontWeight: 700 }}>
                  +قسط
                </button>
                <button type="button" onClick={() => unpayInstallment(debt.id)} style={{ border: '1px solid var(--border)', background: 'var(--surface-muted)', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: 7, padding: '4px 9px', fontSize: 11, fontWeight: 700 }}>
                  −قسط
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                const snapshot = { ...debt }
                softDelete(`«${snapshot.name}» حذف شد`, () => removeDebt(debt.id), () => restoreDebt(snapshot, index))
              }}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red-strong)', fontSize: 15 }}
            >
              ×
            </button>
          </span>
        )}
      </div>

      {editMode && !isLump && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 8, marginBottom: 11 }}>
          <label style={{ fontSize: 10.5, color: 'var(--text-faint)', fontWeight: 600 }}>
            مبلغ کل
            <NumberField value={debt.total} onChange={(v) => updateDebt(debt.id, { total: v })} style={{ marginTop: 3 }} />
          </label>
          <label style={{ fontSize: 10.5, color: 'var(--text-faint)', fontWeight: 600 }}>
            قسط ماهانه
            <NumberField value={debt.monthly} onChange={(v) => updateDebt(debt.id, { monthly: v })} style={{ marginTop: 3 }} />
          </label>
          <label style={{ fontSize: 10.5, color: 'var(--text-faint)', fontWeight: 600 }}>
            تعداد کل اقساط
            <NumberField value={debt.count} onChange={(v) => updateDebt(debt.id, { count: v })} style={{ marginTop: 3 }} />
          </label>
          <label style={{ fontSize: 10.5, color: 'var(--text-faint)', fontWeight: 600 }}>
            پرداخت‌شده
            <NumberField value={debt.paid} onChange={(v) => updateDebt(debt.id, { paid: v })} style={{ marginTop: 3 }} />
          </label>
        </div>
      )}

      {editMode && isLump && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8, marginBottom: 11 }}>
          <label style={{ fontSize: 10.5, color: 'var(--text-faint)', fontWeight: 600 }}>
            مبلغ
            <NumberField value={debt.total} onChange={(v) => updateDebt(debt.id, { total: v })} style={{ marginTop: 3 }} />
          </label>
          <label style={{ fontSize: 10.5, color: 'var(--text-faint)', fontWeight: 600 }}>
            تاریخ سررسید
            <input
              value={debt.dueDate}
              onChange={(e) => updateDebt(debt.id, { dueDate: e.target.value })}
              placeholder="۱۴۰۴/۶/۱"
              style={{ marginTop: 3, width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px', fontSize: 12, direction: 'ltr', textAlign: 'left', background: 'var(--surface-muted)', outline: 'none' }}
            />
          </label>
        </div>
      )}

      {!isLump && (
        <>
          <div style={{ height: 8, borderRadius: 6, background: '#F0EDE6', overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${derived.progressPercent}%`, background: 'var(--accent-green)', borderRadius: 6 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-faint)', flexWrap: 'wrap', gap: 8 }}>
            <span>
              پیشرفت: <b style={{ color: 'var(--text)' }}>{faNumber(derived.progressPercent, 0)}٪</b>
            </span>
            <span>
              اقساط مانده: <b style={{ color: 'var(--text)' }}>{faNumber(derived.remainingCount)}</b>
            </span>
            <span>
              مانده بدهی: <b style={{ color: 'var(--accent-red-strong)' }}>{faMoney(derived.remainingDebt)}</b>
            </span>
          </div>
        </>
      )}

      {isLump && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text)', cursor: 'pointer', fontWeight: 600 }}>
            <input type="checkbox" checked={debt.settled} onChange={() => toggleDebtSettled(debt.id)} style={{ width: 17, height: 17, accentColor: 'var(--accent-green)', cursor: 'pointer' }} />
            پرداخت شد
          </label>
          <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>
            مبلغ: <b style={{ color: 'var(--text)' }}>{faMoney(debt.total)}</b> · مانده: <b style={{ color: 'var(--accent-red-strong)' }}>{faMoney(derived.remainingDebt)}</b>
          </span>
        </div>
      )}
    </div>
  )
}
