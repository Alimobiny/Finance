import { useState, type ComponentType } from 'react'
import { AppHeader } from './AppHeader'
import { SCREEN_IDS, type ScreenId } from './router'
import { DashboardScreen } from '../features/dashboard/DashboardScreen'
import { PortfolioScreen } from '../features/portfolio/PortfolioScreen'
import { TradingScreen } from '../features/trading/TradingScreen'
import { MoneyScreen } from '../features/money/MoneyScreen'
import { LifeScreen } from '../features/life/LifeScreen'
import { SettingsScreen } from '../features/settings/SettingsScreen'

const SCREENS: Record<ScreenId, ComponentType> = {
  dashboard: DashboardScreen,
  portfolio: PortfolioScreen,
  trading: TradingScreen,
  money: MoneyScreen,
  life: LifeScreen,
  settings: SettingsScreen,
}

function App() {
  // TODO(Milestone 2): این دو state به uiSlice در Zustand store منتقل می‌شوند
  const [activeScreen, setActiveScreen] = useState<ScreenId>(SCREEN_IDS[0])
  const [editMode, setEditMode] = useState(false)

  const ActiveScreen = SCREENS[activeScreen]

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <AppHeader
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        editMode={editMode}
        onToggleEdit={() => setEditMode((v) => !v)}
      />
      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '22px 20px 90px' }}>
        <ActiveScreen />
      </main>
    </div>
  )
}

export default App
