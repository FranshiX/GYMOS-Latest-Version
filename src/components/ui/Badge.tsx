import { clsx } from 'clsx'

type BadgeVariant = 'brand' | 'success' | 'warning' | 'danger' | 'neutral'
type BadgeSize    = 'sm' | 'md'

interface BadgeProps {
  variant?:   BadgeVariant
  size?:      BadgeSize
  children:   React.ReactNode
  className?: string
}

const VARIANT_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  brand:   { background: 'var(--color-brand-muted)',   color: 'var(--color-brand)'           },
  success: { background: 'var(--color-success-muted)', color: 'var(--color-success)'         },
  warning: { background: 'var(--color-warning-muted)', color: 'var(--color-warning)'         },
  danger:  { background: 'var(--color-danger-muted)',  color: 'var(--color-danger)'          },
  neutral: { background: 'var(--color-bg-elevated)',   color: 'var(--color-text-secondary)'  },
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
}

export function Badge({
  variant   = 'neutral',
  size      = 'md',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        SIZE_CLASSES[size],
        className,
      )}
      style={VARIANT_STYLES[variant]}
    >
      {children}
    </span>
  )
}