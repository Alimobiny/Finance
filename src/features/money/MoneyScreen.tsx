import { useRootStore } from '../../store/rootStore'
import { useUIStore } from '../../store/uiStore'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { Card } from '../../components/ui/Card'
import { NumberField } from '../../components/ui/NumberField'
import { EditableLineItemList } from '../../components/ui/EditableLineItemList'
import { DebtCard } from './DebtCard'
import { faMoney, faNumber } from '../../lib/format/number'
import { computeTax, sumLineItems, totalMonthlyInstallment, totalRemainingDebt } from './lib/moneyCalcs'

export function MoneyScreen() {
  const editMode = useUIStore((s) => s.editMode)
  const money = useRootStore((s) => s.money)

  const setEmergencyTarget = useRootStore((s) => s.setEmergencyTarget)
  const setEmergencyCurrent = useRootStore((s) => s.setEmergencyCurrent)

  const addIncome = useRootStore((s) => s.addIncome)
  const updateIncome = useRootStore((s) => s.updateIncome)
  const removeIncome = useRootStore((s) => s.removeIncome)
  const restoreIncome = useRootStore((s) => s.restoreIncome)

  const addExpense = useRootStore((s) => s.addExpense)
  const updateExpense = useRootStore((s) => s.updateExpense)
  const removeExpense = useRootStore((s) => s.removeExpense)
  const restoreExpense = useRootStore((s) => s.restoreExpense)

  const addDebt = useRootStore((s) => s.addDebt)
  const setTax = useRootStore((s) => s.setTax)

  const incomeTotal = sumLineItems(money.income)
  const expenseTotal = sumLineItems(money.expenses)
  const net = incomeTotal - expenseTotal
  const remainingDebt = totalRemainingDebt(money.debts)
  const monthlyInstallment = totalMonthlyInstallment(money.debts)
  const tax = computeTax(money.tax)

  const efPercent = money.emergencyTarget > 0 ? Math.min((money.emergencyCurrent / money.emergencyTarget) * 100, 100) : 0

  return (
    <section style={{ animation: 'fadeUp .3s ease' }}>
      <ScreenHeader eyebrow="مدیریت مالی" eyebrowColor="var(--accent-blue)" title="درآمد، هزینه، بدهی و صندوق اضطراری" />

      <div style={{ background: '#FEF8EC', border: '1px solid #F0E2C0', borderRadius: 'var(--radius-lg)', padding: 18, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#7D6608' }}>صندوق اضطراری — اولویت اول</div>
        </div>
        <div style={{ height: 13, borderRadius: 8, background: '#F2E6C8', overflow: 'hidden', marginBottom: 9 }}>
          <div style={{ height: '100%', width: `${efPercent}%`, background: 'linear-gradient(90deg,#C9A227,#B0832B)', borderRadius: 8 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            موجودی فعلی · <b style={{ color: '#7D6608' }}>{faNumber(efPercent, 0)}٪</b> از هدف {money.emergencyTarget > 0 ? faMoney(money.emergencyTarget) : '—'}
          </div>
          {editMode && (
            <div style={{ display: 'flex', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-faint)' }}>
                هدف
                <NumberField value={money.emergencyTarget} onChange={setEmergencyTarget} style={{ width: 140 }} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-faint)' }}>
                موجودی
                <NumberField value={money.emergencyCurrent} onChange={setEmergencyCurrent} style={{ width: 140 }} />
              </label>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 14, marginBottom: 16 }}>
        <Card title="درآمد ماهانه">
          <EditableLineItemList items={money.income} editMode={editMode} addLabel="+ درآمد" onAdd={addIncome} onUpdate={updateIncome} onRemove={removeIncome} onRestore={restoreIncome} />
          <div style={{ marginTop: 13, paddingTop: 12, borderTop: '1px solid #F0EDE6', display: 'flex', justifyContent: 'space-between', fontSize: 13.5, fontWeight: 700 }}>
            <span>جمع درآمد</span>
            <span style={{ color: 'var(--accent-green)' }}>{faMoney(incomeTotal)}</span>
          </div>
        </Card>
        <Card title="هزینه‌های ماهانه">
          <EditableLineItemList items={money.expenses} editMode={editMode} addLabel="+ هزینه" onAdd={addExpense} onUpdate={updateExpense} onRemove={removeExpense} onRestore={restoreExpense} />
          <div style={{ marginTop: 13, paddingTop: 12, borderTop: '1px solid #F0EDE6', display: 'flex', justifyContent: 'space-between', fontSize: 13.5, fontWeight: 700 }}>
            <span>جمع هزینه</span>
            <span style={{ color: 'var(--accent-red-strong)' }}>{faMoney(expenseTotal)}</span>
          </div>
        </Card>
      </div>

      <Card style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>مازاد ماهانه (برای بدهی و پس‌انداز)</div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', color: net >= 0 ? 'var(--accent-green)' : 'var(--accent-red-strong)' }}>{faMoney(net)}</div>
      </Card>

      <Card
        title="بدهی‌ها (وام و قرض)"
        action={
          editMode ? (
            <div style={{ display: 'flex', gap: 7 }}>
              <button type="button" onClick={() => addDebt('installment')} style={{ border: 'none', background: '#7D6608', color: '#fff', cursor: 'pointer', borderRadius: 9, padding: '7px 13px', fontSize: 12, fontWeight: 700 }}>
                + وام
              </button>
              <button type="button" onClick={() => addDebt('personal')} style={{ border: 'none', background: '#5B6BA8', color: '#fff', cursor: 'pointer', borderRadius: 9, padding: '7px 13px', fontSize: 12, fontWeight: 700 }}>
                + قرض
              </button>
              <button type="button" onClick={() => addDebt('lumpSum')} style={{ border: 'none', background: '#3E6B5A', color: '#fff', cursor: 'pointer', borderRadius: 9, padding: '7px 13px', fontSize: 12, fontWeight: 700 }}>
                + بدهی یکجا
              </button>
            </div>
          ) : undefined
        }
        style={{ marginBottom: 16 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {money.debts.map((d, i) => (
            <DebtCard key={d.id} debt={d} index={i} />
          ))}
          {money.debts.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-quiet)' }}>بدهی‌ای ثبت نشده.</div>}
        </div>
        {money.debts.length > 0 && (
          <div style={{ marginTop: 13, paddingTop: 12, borderTop: '1px solid #F0EDE6', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 12.5 }}>
            <span style={{ color: 'var(--text-faint)' }}>
              مجموع قسط ماهانه: <b style={{ color: 'var(--text)' }}>{faMoney(monthlyInstallment)}</b>
            </span>
            <span style={{ color: 'var(--text-faint)' }}>
              مجموع مانده بدهی: <b style={{ color: 'var(--accent-red-strong)' }}>{faMoney(remainingDebt)}</b>
            </span>
          </div>
        )}
      </Card>

      <Card title="برآورد مالیات (اختیاری)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 11 }}>
          <label style={{ fontSize: 11.5, color: 'var(--text-faint)', fontWeight: 600 }}>
            کارکرد ناخالص سال
            <NumberField value={money.tax.gross} onChange={(v) => setTax({ gross: v })} style={{ marginTop: 5 }} />
          </label>
          <label style={{ fontSize: 11.5, color: 'var(--text-faint)', fontWeight: 600 }}>
            کسورات قابل قبول
            <NumberField value={money.tax.deduct} onChange={(v) => setTax({ deduct: v })} style={{ marginTop: 5 }} />
          </label>
          <label style={{ fontSize: 11.5, color: 'var(--text-faint)', fontWeight: 600 }}>
            معافیت سالانه
            <NumberField value={money.tax.exempt} onChange={(v) => setTax({ exempt: v })} style={{ marginTop: 5 }} />
          </label>
          <label style={{ fontSize: 11.5, color: 'var(--text-faint)', fontWeight: 600 }}>
            نرخ مؤثر (٪)
            <NumberField value={money.tax.rate} onChange={(v) => setTax({ rate: v })} style={{ marginTop: 5 }} decimals={1} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 11, marginTop: 15, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 140, background: 'var(--surface-muted)', borderRadius: 11, padding: 13, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>درآمد مشمول</div>
            <div style={{ fontSize: 16, fontWeight: 800, marginTop: 3 }}>{faMoney(tax.taxable)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 140, background: '#FBEEE8', borderRadius: 11, padding: 13, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--accent-red)', fontWeight: 600 }}>مالیات برآوردی</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-red)', marginTop: 3 }}>{faMoney(tax.taxAmount)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 140, background: '#EAF2EE', borderRadius: 11, padding: 13, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 600 }}>ذخیرهٔ ماهانه</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-green)', marginTop: 3 }}>{faMoney(tax.monthlySetAside)}</div>
          </div>
        </div>
      </Card>
    </section>
  )
}
