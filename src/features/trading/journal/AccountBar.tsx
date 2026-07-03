import { useState } from 'react'
import { useRootStore } from '../../../store/rootStore'
import { NumberField } from '../../../components/ui/NumberField'

/**
 * نوار انتخاب و مدیریت حساب‌های معاملاتی. هر حساب ژورنال جدا دارد و «مبلغ ریسک هر معامله»‌اش
 * مبنای محاسبهٔ R است (R = سود ÷ ریسک). با تغییر ریسک، R معاملات وارد‌شدهٔ حساب بازمحاسبه می‌شود.
 */
export function AccountBar() {
  const accounts = useRootStore((s) => s.trading.accounts)
  const activeId = useRootStore((s) => s.trading.activeAccountId)
  const trades = useRootStore((s) => s.trading.trades)
  const setActive = useRootStore((s) => s.setActiveAccount)
  const addAccount = useRootStore((s) => s.addAccount)
  const renameAccount = useRootStore((s) => s.renameAccount)
  const setAccountRisk = useRootStore((s) => s.setAccountRisk)
  const removeAccount = useRootStore((s) => s.removeAccount)

  const active = accounts.find((a) => a.id === activeId) ?? accounts[0]
  const [editingName, setEditingName] = useState(false)

  const tradeCount = (id: string) => trades.filter((t) => t.accountId === id).length

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 13 }}>
        <span style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 600, marginInlineEnd: 4 }}>حساب معاملاتی:</span>
        {accounts.map((a) => {
          const on = a.id === activeId
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setActive(a.id)}
              style={{
                border: on ? '1px solid var(--accent-red)' : '1px solid var(--border)',
                background: on ? 'var(--accent-red-soft)' : 'var(--surface-muted)',
                color: on ? 'var(--accent-red)' : 'var(--text-muted)',
                cursor: 'pointer',
                borderRadius: 9,
                padding: '7px 13px',
                fontSize: 12.5,
                fontWeight: on ? 700 : 600,
              }}
            >
              {a.name}
              <span style={{ fontSize: 10.5, opacity: 0.7, marginInlineStart: 6 }}>
                {toFa(tradeCount(a.id))}
              </span>
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => addAccount()}
          style={{ border: '1px dashed var(--border-strong)', background: 'var(--surface-muted)', cursor: 'pointer', borderRadius: 9, padding: '7px 13px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}
        >
          + حساب جدید
        </button>
      </div>

      {active && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap', paddingTop: 13, borderTop: '1px solid var(--border)' }}>
          <label style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>
            نام حساب
            <div style={{ marginTop: 4 }}>
              {editingName ? (
                <input
                  autoFocus
                  value={active.name}
                  onChange={(e) => renameAccount(active.id, e.target.value)}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
                  style={{ width: 170, border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px', fontSize: 12.5, background: 'var(--surface-muted)', outline: 'none' }}
                />
              ) : (
                <button type="button" onClick={() => setEditingName(true)} style={{ width: 170, textAlign: 'right', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px', fontSize: 12.5, background: 'var(--surface)', cursor: 'text', color: 'var(--text)' }}>
                  {active.name} <span style={{ fontSize: 11, color: 'var(--text-quiet)' }}>✎</span>
                </button>
              )}
            </div>
          </label>

          <label style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>
            مبلغ ریسک هر معامله ($) — مبنای R
            <NumberField value={active.riskPerTrade} onChange={(v) => setAccountRisk(active.id, v)} style={{ width: 150, marginTop: 4 }} />
          </label>

          {accounts.length > 1 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`حساب «${active.name}» و همهٔ ${toFa(tradeCount(active.id))} معاملهٔ آن حذف شود؟`)) removeAccount(active.id)
              }}
              style={{ border: '1px solid #F0D8D0', background: 'var(--accent-red-soft)', color: 'var(--accent-red-strong)', cursor: 'pointer', borderRadius: 8, padding: '8px 13px', fontSize: 12, fontWeight: 600 }}
            >
              حذف این حساب
            </button>
          )}
        </div>
      )}

      {active && active.riskPerTrade <= 0 && (
        <div style={{ marginTop: 11, fontSize: 11.5, color: 'var(--accent-gold-dark)', lineHeight: 1.6 }}>
          برای این‌که «نتیجهٔ R» و «منحنی رشد سرمایه» درست محاسبه شوند، «مبلغ ریسک هر معامله» را وارد کن (مثلاً اگر ۱٪ ریسک روی موجودی ۱۰۰۰ دلار می‌کنی، یعنی ۱۰ دلار). R هر معامله = سود ÷ همین مبلغ.
        </div>
      )}
    </div>
  )
}

function toFa(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
}
