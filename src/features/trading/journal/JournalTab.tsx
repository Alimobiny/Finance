import { useRootStore } from '../../../store/rootStore'
import { StatBoxes } from './StatBoxes'
import { EquityCurve } from './EquityCurve'
import { ImportPanel } from './ImportPanel'
import { TradeForm } from './TradeForm'
import { TradesTable } from './TradesTable'

const NEGATIVE_EMOTIONS = new Set(['عصبانی', 'ترس', 'طمع', 'مضطرب'])

export function JournalTab() {
  const trades = useRootStore((s) => s.trading.trades)
  const calmCount = trades.filter((t) => t.emotion === 'آرام').length
  const negativeCount = trades.filter((t) => NEGATIVE_EMOTIONS.has(t.emotion)).length

  return (
    <div>
      <StatBoxes trades={trades} calmCount={calmCount} negativeCount={negativeCount} />
      <EquityCurve trades={trades} />
      <ImportPanel />
      <TradeForm />
      <TradesTable />
    </div>
  )
}
