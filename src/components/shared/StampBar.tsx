interface StampBarProps {
  total: number
  used: number
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function StampBar({ total, used, size = 'md', showLabel = true }: StampBarProps) {
  if (total === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          0 / 0
        </span>
      </div>
    )
  }

  if (total > 20) {
    const remaining = total - used
    const pct = Math.round((remaining / total) * 100)
    const color =
      pct > 40 ? 'var(--color-success)' :
      pct > 15 ? 'var(--color-warning)' :
                 'var(--color-danger)'
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {showLabel && (
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium" style={{ color }}>
              {remaining} / {total}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {pct}%
            </span>
          </div>
        )}
        <div
          className="h-1.5 w-full rounded-full overflow-hidden"
          style={{ background: 'var(--color-bg-border)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: pct > 40
                ? 'linear-gradient(90deg, var(--color-success), #6DD99A)'
                : pct > 15
                  ? 'linear-gradient(90deg, var(--color-warning), #F0C060)'
                  : 'linear-gradient(90deg, var(--color-danger), #E88080)',
              boxShadow: `0 0 6px ${color}60`,
            }}
          />
        </div>
      </div>
    )
  }

  const circleSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium" style={{ color: 'var(--color-brand)' }}>
            {used} / {total}
          </span>
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`${circleSize} rounded-full border transition-all`}
            style={
              i < used
                ? {
                    background: 'var(--color-brand)',
                    borderColor: 'var(--color-brand)',
                    boxShadow: '0 0 4px var(--color-brand-glow)',
                  }
                : {
                    background: 'var(--color-bg-elevated)',
                    borderColor: 'var(--color-bg-border)',
                  }
            }
          />
        ))}
      </div>
    </div>
  )
}