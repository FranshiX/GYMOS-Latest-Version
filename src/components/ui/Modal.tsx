import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface ModalProps {
  open:       boolean
  onClose:    () => void
  title?:     string
  children:   ReactNode
  size?:      'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />

      <div
        className={clsx('relative w-full rounded-2xl border shadow-xl z-10', SIZES[size])}
        style={{
          background:  'var(--color-bg-secondary)',
          borderColor: 'var(--color-bg-border)',
        }}
      >
        {title && (
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: 'var(--color-bg-border)' }}
          >
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label={t('common.close')}
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="p-5" style={{ overscrollBehavior: 'contain' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal