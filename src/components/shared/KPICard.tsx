import { type LucideIcon } from 'lucide-react'

interface KPICardProps {
  label:     string
  value:     number | string
  icon?:     LucideIcon
  color?:    string
  subtitle?: string
  trend?:    'up' | 'down' | 'neutral'
}

export function KPICard({ label, value, icon: Icon, color, subtitle }: KPICardProps) {
  const accentColor = color ?? 'var(--color-brand)'

  return (
    <div
      className="relative rounded-2xl p-4 flex flex-col gap-3 overflow-hidden"
      style={{
        background:  'var(--color-bg-secondary)',
        border:      '1px solid var(--color-bg-border)',
      }}
    >
      {/* Subtle top accent line */}
      <div
        className="absolute top-0 start-0 end-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)`,
        }}
      />

      {/* Icon + Value row */}
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}25`,
          }}
        >
          {Icon && <Icon size={16} style={{ color: accentColor }} />}
        </div>
      </div>

      {/* Value */}
      <div className="flex flex-col gap-0.5">
        <span
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {value}
        </span>
        <span
          className="text-xs font-medium leading-tight"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {label}
        </span>
        {subtitle && (
          <span
            className="text-xs mt-0.5"
            style={{ color: accentColor, opacity: 0.8 }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}
