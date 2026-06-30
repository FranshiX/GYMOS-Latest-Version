import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { useDirection } from '@/hooks/useDirection'

interface DrawerProps {
  open:     boolean
  onClose:  () => void
  title?:   string
  children: ReactNode
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  const { isRTL } = useDirection()
  const { t } = useTranslation()

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else      document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
        />
      )}

      <div
        className="fixed top-0 bottom-0 z-50 w-full max-w-sm flex flex-col transition-transform duration-300"
        style={{
          background:  'var(--color-bg-secondary)',
          borderColor: 'var(--color-bg-border)',
          [isRTL ? 'left' : 'right']: 0,
          borderInlineStartWidth: '1px',
          transform: open ? 'translateX(0)' : isRTL ? 'translateX(-100%)' : 'translateX(100%)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 h-14 border-b flex-shrink-0"
          style={{ borderColor: 'var(--color-bg-border)' }}
        >
          {title && (
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 ms-auto"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label={t('common.close')}
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5" style={{ overscrollBehavior: 'contain' }}>
          {children}
        </div>
      </div>
    </>
  )
}

export default Drawer