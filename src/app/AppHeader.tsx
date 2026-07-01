import { CompassLogo } from './CompassLogo'
import { SyncStatusDot } from './SyncStatusDot'
import { SCREEN_IDS, SCREEN_LABELS, type ScreenId } from './router'
import { todayLabel } from '../lib/format/date'
import './AppHeader.css'

type Props = {
  activeScreen: ScreenId
  onNavigate: (screen: ScreenId) => void
  editMode: boolean
  onToggleEdit: () => void
}

export function AppHeader({ activeScreen, onNavigate, editMode, onToggleEdit }: Props) {
  const today = todayLabel()

  return (
    <header className="header">
      <div className="headerRow">
        <div className="brand">
          <CompassLogo />
          <div className="brandText">
            <div className="brandTitle">قطب‌نما</div>
            <div className="brandSubtitle">سیستم مالی و فعالیتی شخصی</div>
          </div>
        </div>
        <div className="spacer" />
        <SyncStatusDot />
        <button className="editBtn" data-active={editMode} onClick={onToggleEdit} type="button">
          <span>✎</span>
          {editMode ? 'پایان ویرایش' : 'حالت ویرایش'}
        </button>
        <div className="todayBox">
          <div className="todayWeekday">{today.weekday}</div>
          <div className="todayDate">{today.date}</div>
        </div>
      </div>
      <nav className="nav scrl">
        {SCREEN_IDS.map((id) => (
          <button
            key={id}
            className="navBtn"
            data-active={activeScreen === id}
            onClick={() => onNavigate(id)}
            type="button"
          >
            {SCREEN_LABELS[id]}
          </button>
        ))}
      </nav>
    </header>
  )
}
