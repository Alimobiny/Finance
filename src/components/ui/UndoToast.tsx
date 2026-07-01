import { useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'

const AUTO_DISMISS_MS = 5000

export function UndoToast() {
  const toast = useUIStore((s) => s.undoToast)
  const dismiss = useUIStore((s) => s.dismissUndoToast)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [toast, dismiss])

  if (!toast) return null

  return (
    <div
      dir="rtl"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: '#2a2723',
        color: '#fff',
        padding: '11px 14px 11px 18px',
        borderRadius: 13,
        boxShadow: 'var(--shadow-md)',
        fontSize: 13,
        fontWeight: 600,
        animation: 'toastUp .22s ease-out',
        maxWidth: '92vw',
      }}
    >
      <span style={{ whiteSpace: 'nowrap' }}>{toast.message}</span>
      <button
        type="button"
        onClick={() => {
          toast.onUndo()
          dismiss()
        }}
        style={{
          border: 'none',
          background: 'var(--accent-gold)',
          color: '#fff',
          cursor: 'pointer',
          borderRadius: 9,
          padding: '7px 16px',
          fontSize: 12.5,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        بازگشت
      </button>
    </div>
  )
}
