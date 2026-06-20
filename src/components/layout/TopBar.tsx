import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDirection } from '@/hooks/useDirection'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

const SCREEN_KEYS: Record<string, string> = {
  '/admin/dashboard':  'dashboard.title',
  '/admin/members':    'members.title',
  '/admin/checkin':    'checkin.title',
  '/admin/exercises':  'exercises.title',
  '/admin/workouts':   'workout.plans',
  '/admin/reports':    'reports.title',
  '/admin/settings':   'settings.title',
}

// Screens that show a back button
const BACK_SCREENS = [
  '/admin/workouts/',
  '/admin/members/',
  '/member/',
]

function resolveTitle(pathname: string, t: (key: string) => string): string {
  // Exact match first
  if (SCREEN_KEYS[pathname]) return t(SCREEN_KEYS[pathname])

  // Prefix match for dynamic routes
  if (pathname.startsWith('/admin/workouts/')) return t('workout.builder')
  if (pathname.startsWith('/admin/members/') && pathname.endsWith('/progress'))
    return t('workout.progressReport')

  // Member routes
  if (pathname.endsWith('/workout'))      return t('workout.myWorkout')
  if (pathname.endsWith('/progress'))     return t('workout.myProgress')
  if (pathname.endsWith('/measurements')) return t('measurements.title')
  if (pathname.includes('/exercise/'))    return t('exercises.detail')
  if (pathname.includes('/workout/'))     return t('workout.todayWorkout')

  return t('app.name')
}

const buttonTap = { scale: 0.9 }

export function TopBar() {
  const { t }                      = useTranslation()
  const { pathname }               = useLocation()
  const navigate                   = useNavigate()
  const { toggleLanguage, language, isRTL } = useDirection()

  const title    = resolveTitle(pathname, t)
  const showBack = BACK_SCREENS.some(prefix => pathname.includes(prefix.slice(0, -1)) && pathname !== prefix.slice(0, -1))
  const BackIcon = isRTL ? ChevronRight : ChevronLeft

  return (
    <header
      className="h-14 flex items-center justify-between px-4 sticky top-0 z-40"
      style={{
        background:   'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div className="flex items-center gap-2">
        {showBack && (
          <motion.button
            whileTap={buttonTap}
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5 -ms-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <BackIcon size={18} strokeWidth={1.5} />
          </motion.button>
        )}
        <h1
          className="text-base font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </h1>
      </div>

      <motion.button
        whileTap={buttonTap}
        onClick={toggleLanguage}
        className="text-xs px-3 py-1.5 rounded-xl border transition-all hover:bg-white/5 font-medium"
        style={{
          color:       'var(--color-text-secondary)',
          borderColor: 'var(--border-default)',
        }}
      >
        {language === 'ar' ? 'EN' : 'ع'}
      </motion.button>
    </header>
  )
}
