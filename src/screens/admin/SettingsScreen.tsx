import { useTranslation } from 'react-i18next'
import { useDirection } from '@/hooks/useDirection'
import { Card } from '@/components/ui/Card'
import { planService } from '@/services/planService'

const APP_VERSION = '2.0.0'

export function SettingsScreen() {
  const { t, i18n } = useTranslation()
  const { isRTL, language } = useDirection()
  const plans = planService.getAll()

  return (
    <div
      data-screen="settings"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="flex flex-col gap-5 pb-6"
    >
      {/* Gym name placeholder */}
      <Card padding="md">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-brand-muted)', border: '1px solid rgba(201,168,76,0.25)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
              style={{ color: 'var(--color-brand)' }}>
              <path d="M6.5 6.5h11M6.5 17.5h11M3 10h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3M21 10h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2M5 6.5v11M19 6.5v11"/>
            </svg>
          </div>
          <div>
            <p className="text-base font-bold" style={{ color: 'var(--color-brand)' }}>
              GymOS
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {t('settings.app_version')} {APP_VERSION}
            </p>
          </div>
        </div>
      </Card>

      {/* Language toggle */}
      <Card padding="md">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
          {t('settings.language')}
        </p>
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--color-bg-border)' }}
        >
          {(['ar', 'en'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => i18n.changeLanguage(lang)}
              className="flex-1 py-2.5 text-sm font-semibold transition-all"
              style={
                language === lang
                  ? { background: 'var(--color-brand)', color: '#0A0A0A' }
                  : { background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }
              }
            >
              {lang === 'ar' ? t('settings.arabic') : t('settings.english')}
            </button>
          ))}
        </div>
      </Card>

      {/* Plans — read only */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: 'var(--color-text-muted)' }}>
          {t('settings.plans')}
        </p>
        <div className="flex flex-col gap-3">
          {plans.map((plan, i) => (
            <Card key={plan.id} padding="md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {plan.name}
                  </p>
                </div>
                <span className="text-lg font-bold" style={{ color: 'var(--color-brand)' }}>
                  ${plan.price}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: t('plans.duration'), value: `${plan.durationDays} ${t('plans.days')}` },
                  { label: t('plans.stamps'),   value: `${plan.stampsTotal} ${t('plans.visits')}` },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-lg p-2.5"
                    style={{ background: 'var(--color-bg-elevated)' }}
                  >
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* App version */}
      <div className="text-center pt-2">
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {t('settings.app_version')} {APP_VERSION}
        </p>
      </div>
    </div>
  )
}