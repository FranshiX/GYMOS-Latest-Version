import { type InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?:     string
  error?:     string
  prefix?:    React.ReactNode   // preserved — legacy alias for leftIcon
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, leftIcon, rightIcon, className, ...props }, ref) => {
    const hasLeft = leftIcon ?? prefix

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {hasLeft && (
            <span
              className="absolute start-3 text-sm pointer-events-none"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {hasLeft}
            </span>
          )}

          <input
            ref={ref}
            className={clsx(
              'w-full h-12 rounded-xl border text-sm outline-none',
              'transition-all duration-200',
              'placeholder:text-[var(--color-text-muted)]',
              'focus:border-[var(--color-brand)]',
              'focus:[box-shadow:0_0_0_3px_var(--color-brand-glow)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              hasLeft  ? 'ps-9' : 'ps-4',
              rightIcon ? 'pe-9' : 'pe-4',
              className,
            )}
            style={{
              background:  'var(--color-bg-elevated)',
              borderColor: error ? 'var(--color-danger)' : 'var(--color-bg-border)',
              color:       'var(--color-text-primary)',
            }}
            {...props}
          />

          {rightIcon && (
            <span
              className="absolute end-3 text-sm pointer-events-none"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <span className="text-xs" style={{ color: 'var(--color-danger)' }}>
            {error}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'