import { useTranslation } from 'react-i18next'

interface StreakWidgetProps {
  streak: number
  totalSessions?: number
  lastWorkoutDate?: string
  compact?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function StreakWidget({
  streak,
  totalSessions = 0,
  lastWorkoutDate,
  compact = false,
  size = 'md',
}: StreakWidgetProps) {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  const daysSinceLast = lastWorkoutDate
    ? Math.floor((Date.now() - new Date(lastWorkoutDate).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const flameColor =
    streak === 0       ? 'text-white/20' :
    streak < 3         ? 'text-amber-400' :
    streak < 7         ? 'text-orange-400' :
                         'text-red-400'

  const numberSize =
    size === 'sm' ? 'text-xl' :
    size === 'lg' ? 'text-4xl' :
                    'text-2xl'

  if (compact || size === 'sm') {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-lg ${flameColor}`}>🔥</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {streak}
        </span>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {t('widget.streak_label')}
        </span>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-border)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`${size === 'lg' ? 'text-4xl' : 'text-3xl'} ${flameColor}`}>🔥</span>
          <div>
            <p className={`${numberSize} font-bold leading-none`} style={{ color: 'var(--color-brand)' }}>
              {streak}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {t('widget.streak_label')}
            </p>
          </div>
        </div>
        {totalSessions > 0 && (
          <div className="text-right">
            <p className="text-xl font-bold leading-none" style={{ color: 'var(--color-text-primary)' }}>
              {totalSessions}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {t('widget.sessions')}
            </p>
          </div>
        )}
      </div>
      {daysSinceLast !== null && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-bg-border)' }}>
          <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
            {daysSinceLast === 0
              ? isAr ? '✓ تمرنت اليوم' : '✓ Trained today'
              : daysSinceLast === 1
              ? isAr ? 'آخر تمرين: أمس' : 'Last session: yesterday'
              : isAr
              ? `آخر تمرين: منذ ${daysSinceLast} أيام`
              : `Last session: ${daysSinceLast} days ago`}
          </p>
        </div>
      )}
      <div className="mt-3">
        <div className="flex gap-1.5">
          {Array.from({ length: 7 }, (_, i) => 6 - i < streak).map((active, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-all"
              style={{ background: active ? 'var(--color-brand)' : 'var(--color-bg-border)' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}