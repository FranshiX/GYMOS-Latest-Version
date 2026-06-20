import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function PWAInstallPrompt() {
  const { t } = useTranslation()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 inset-x-4 md:inset-x-auto md:end-4 md:w-80 z-50"
      >
        <div
          className="rounded-2xl p-4 flex items-center gap-3 shadow-lg"
          style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-default)' }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--color-primary)' }}
          >
            <span className="text-2xl font-bold" style={{ color: 'var(--text-inverse)' }}>↓</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {t('pwa.install_title')}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {t('pwa.install_subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDismiss}
              className="p-2 rounded-xl transition-all"
              style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-tertiary)' }}
            >
              <X size={16} strokeWidth={1.5} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleInstall}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'var(--color-primary)', color: 'var(--text-inverse)' }}
            >
              {t('pwa.install')}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
