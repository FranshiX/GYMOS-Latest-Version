import { clsx } from 'clsx'
import { motion } from 'framer-motion'

type CardVariant = 'default' | 'elevated' | 'brand' | 'ghost'
type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps {
  variant?:   CardVariant
  padding?:   CardPadding
  className?: string
  children:   React.ReactNode
  onClick?:   () => void
}

const PADDING: Record<CardPadding, string> = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-6',
}

const VARIANT_STYLES: Record<CardVariant, React.CSSProperties> = {
  default: {
    background:  'var(--color-bg-card)',
    borderColor: 'var(--border-default)',
    border:      '1px solid var(--border-default)',
  },
  elevated: {
    background:  'var(--color-bg-elevated)',
    borderColor: 'var(--border-default)',
    border:      '1px solid var(--border-default)',
    boxShadow:   'var(--shadow-md)',
  },
  brand: {
    background:  'var(--color-bg-card)',
    border:      '1px solid var(--color-primary)',
  },
  ghost: {
    background: 'transparent',
    border:     'none',
  },
}

const cardHover = { scale: 1.01 }
const cardTap = { scale: 0.99 }

export function Card({
  variant   = 'default',
  padding   = 'md',
  className,
  children,
  onClick,
}: CardProps) {
  const MotionComponent = onClick ? motion.button : motion.div

  return (
    <MotionComponent
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      whileHover={onClick ? cardHover : undefined}
      whileTap={onClick ? cardTap : undefined}
      className={clsx(
        'rounded-xl transition-all duration-200',
        PADDING[padding],
        onClick && 'cursor-pointer hover:border-[var(--color-primary)]',
        className,
      )}
      style={VARIANT_STYLES[variant]}
    >
      {children}
    </MotionComponent>
  )
}

export default Card