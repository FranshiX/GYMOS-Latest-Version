import { clsx } from 'clsx'
import { motion, HTMLMotionProps } from 'framer-motion'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'whileTap'> {
  variant?:   Variant
  size?:      Size
  fullWidth?: boolean
  full?:      boolean
  loading?:   boolean
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9  px-3 text-sm  gap-1.5',
  md: 'h-12 px-4 text-base gap-2',
  lg: 'h-14 px-5 text-lg  gap-2',
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-[var(--color-primary)] text-[var(--text-inverse)] ' +
    'hover:brightness-110 active:brightness-95',
  secondary:
    'bg-[var(--color-bg-elevated)] border border-[var(--border-default)] ' +
    'text-[var(--text-secondary)] ' +
    'hover:border-[var(--color-primary)] hover:text-[var(--text-primary)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] ' +
    'hover:text-[var(--text-primary)] hover:bg-[var(--color-bg-elevated)]',
  danger:
    'bg-[var(--color-danger-dim)] border border-[var(--color-danger)] ' +
    'text-[var(--color-danger)] hover:brightness-110',
}

const buttonTap = { scale: 0.95 }

export function Button({
  variant   = 'primary',
  size      = 'md',
  fullWidth = false,
  full      = false,
  loading   = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      whileTap={!isDisabled ? buttonTap : undefined}
      disabled={isDisabled}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-xl',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        (fullWidth || full) && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      ) : (
        <>
          {leftIcon  && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  )
}

export default Button