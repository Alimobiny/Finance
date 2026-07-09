import type { ComponentType } from 'react'
import { AppHeader } from './AppHeader'
import type { ScreenId } from './router'
import { useUIStore } from '../store/uiStore'
import { UndoToast } from '../components/ui/UndoToast'
import { DashboardScreen } from '../features/dashboard/DashboardScreen'
import { TradingScreen } from '../features/trading/TradingScreen'
import { LifeScreen } from '../features/life/LifeScreen'
import { SettingsScreen } from '../features/settings/SettingsScreen'

const SCREENS: Record<ScreenId, ComponentType> = {
  dashboard: DashboardScreen,
  trading: TradingScreen,
  life: LifeScreen,
  settings: SettingsScreen,
}

function App() {
  const activeScreen = useUIStore((s) => s.activeScreen)
  const setActiveScreen = useUIStore((s) => s.setActiveScreen)
  const editMode = useUIStore((s) => s.editMode)
  const toggleEditMode = useUIStore((s) => s.toggleEditMode)

  const ActiveScreen = SCREENS[activeScreen]

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <AppHeader
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        editMode={editMode}
        onToggleEdit={toggleEditMode}
      />
      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '22px 20px 90px' }}>
        <ActiveScreen />
      </main>
      <UndoToast />
    </div>
  )
}

export default App
