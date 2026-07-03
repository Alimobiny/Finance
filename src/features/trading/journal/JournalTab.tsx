import { useRootStore } from '../../../store/rootStore'
import { AccountBar } from './AccountBar'
import { StatBoxes } from './StatBoxes'
import { EquityCurve } from './EquityCurve'
import { ImportPanel } from './ImportPanel'
import { TradeForm } from './TradeForm'
import { TradesTable } from './TradesTable'

const NEGATIVE_EMOTIONS = new Set(['عصبانی', 'ترس', 'طمع', 'مضطرب'])

export function JournalTab() {
  const allTrades = useRootStore((s) => s.trading.trades)
  const activeAccountId = useRootStore((s) => s.trading.activeAccountId)
  // هر حساب ژورنال جدا دارد؛ فقط معاملات حساب فعال را نشان می‌دهیم.
  const trades = allTrades.filter((t) => t.accountId === activeAccountId)

  const calmCount = trades.filter((t) => t.emotion === 'آرام').length
  const negativeCount = trades.filter((t) => NEGATIVE_EMOTIONS.has(t.emotion)).length

  return (
    <div>
      <AccountBar />
      <StatBoxes trades={trades} calmCount={calmCount} negativeCount={negativeCount} />
      <EquityCurve trades={trades} />
      <ImportPanel />
      <TradeForm />
      <TradesTable trades={trades} />
    </div>
  )
}
