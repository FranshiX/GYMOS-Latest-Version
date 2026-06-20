import type { MemberStatus } from '@/domain/membership/types'

interface AlertRowProps {
  name:     string
  phone:    string
  status:   MemberStatus
  detail:   string
  onClick?: () => void
}

const STATUS_CONFIG: Record<MemberStatus, { color: string; bg: string }> = {
  ACTIVE:        { color: 'var(--color-success)', bg: 'var(--color-success-muted)' },
  EXPIRING_SOON: { color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' },
  EXPIRED:       { color: 'var(--color-danger)',  bg: 'var(--color-danger-muted)'  },
}

export function AlertRow({ name, phone, status, detail, onClick }: AlertRowProps) {
  const cfg = STATUS_CONFIG[status]

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-start transition-all active:scale-99"
      style={{
        background: 'var(--color-bg-elevated)',
        border: `1px solid var(--color-bg-border)`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = `${cfg.color}40`
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-bg-border)'
      }}
    >
      {/* Status dot */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
      />

      {/* Info */}
      <div className="flex flex-col flex-1 min-w-0">
        <span
          className="text-sm font-medium truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {name}
        </span>
        {phone && (
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {phone}
          </span>
        )}
      </div>

      {/* Detail badge */}
      <span
        className="text-xs font-medium px-2.5 py-1 rounded-lg flex-shrink-0"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        {detail}
      </span>
    </button>
  )
}
