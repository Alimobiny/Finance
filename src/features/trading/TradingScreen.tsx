import { useState } from 'react'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { JournalTab } from './journal/JournalTab'
import { ChecklistTab } from './checklist/ChecklistTab'
import { CalculatorTab } from './calculator/CalculatorTab'

type TradingTab = 'journal' | 'calculator' | 'checklist'

const TABS: { key: TradingTab; label: string }[] = [
  { key: 'journal', label: 'ژورنال و آمار' },
  { key: 'calculator', label: 'ماشین‌حساب‌گر' },
  { key: 'checklist', label: 'چک‌لیست' },
]

export function TradingScreen() {
  const [tab, setTab] = useState<TradingTab>('journal')

  return (
    <section style={{ animation: 'fadeUp .3s ease' }}>
      <ScreenHeader
        eyebrow="پول معاملاتی · چارچوب · ابزارها"
        eyebrowColor="var(--accent-red)"
        title="میز کار معامله‌گری"
        subtitle="هدف این مرحله یادگیری و نظم است، نه سود. موفقیت = رعایت قوانین."
      />

      <div style={{ display: 'inline-flex', gap: 5, background: '#EDEAE2', borderRadius: 11, padding: 4, marginBottom: 18 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              border: 'none',
              cursor: 'pointer',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: tab === t.key ? 700 : 500,
              background: tab === t.key ? '#fff' : 'transparent',
              color: tab === t.key ? 'var(--accent-red)' : '#8A8478',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'journal' && <JournalTab />}
      {tab === 'calculator' && <CalculatorTab />}
      {tab === 'checklist' && <ChecklistTab />}
    </section>
  )
}
