import { useEffect, type ReactNode } from 'react'

export function Overlay({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="settings-overlay" onClick={onClose} role="presentation">
      <div
        className="settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="overlay-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="overlay-title">{title}</h3>
        {children}
      </div>
    </div>
  )
}
