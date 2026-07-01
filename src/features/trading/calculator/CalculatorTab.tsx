import { SetupScoreCalculator } from './SetupScoreCalculator'
import { PositionSizeCalculator } from './PositionSizeCalculator'

export function CalculatorTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14, alignItems: 'start' }}>
      <SetupScoreCalculator />
      <PositionSizeCalculator />
    </div>
  )
}
