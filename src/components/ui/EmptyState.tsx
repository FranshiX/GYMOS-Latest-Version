import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?:     LucideIcon
  title:     string
  subtitle?: string
  cta?:      {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, subtitle, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      {Icon && (
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <Icon size={24} style={{ color: 'var(--color-text-muted)' }} />
        </div>
      )}
      <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
        {title}
      </p>
      {subtitle && (
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {subtitle}
        </p>
      )}
      {cta && (
        <button
          onClick={cta.onClick}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'var(--color-primary)', color: 'var(--text-inverse)' }}
        >
          {cta.label}
        </button>
      )}
    </div>
  )
}