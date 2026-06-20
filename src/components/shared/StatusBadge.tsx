import { useTranslation } from 'react-i18next'
import type { MemberStatus } from '@/domain/membership/types'

type SimpleStatus = 'active' | 'expired' | 'expiring'

interface StatusBadgeProps {
  status: MemberStatus | SimpleStatus
  size?: 'sm' | 'md'
}

function normalize(status: MemberStatus | SimpleStatus): MemberStatus {
  if (status === 'active') return 'ACTIVE'
  if (status === 'expiring') return 'EXPIRING_SOON'
  if (status === 'expired') return 'EXPIRED'
  return status
}

const CONFIG: Record<MemberStatus, { bg: string; color: string; dot: string; key: string }> = {
  ACTIVE: {
    bg:    'var(--color-success-muted)',
    color: 'var(--color-success)',
    dot:   'var(--color-success)',
    key:   'status.active',
  },
  EXPIRING_SOON: {
    bg:    'var(--color-warning-muted)',
    color: 'var(--color-warning)',
    dot:   'var(--color-warning)',
    key:   'status.expiring_soon',
  },
  EXPIRED: {
    bg:    'var(--color-danger-muted)',
    color: 'var(--color-danger)',
    dot:   'var(--color-danger)',
    key:   'status.expired',
  },
}

const SIZE_CLASSES: Record<'sm' | 'md', string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { t } = useTranslation()
  const cfg = CONFIG[normalize(status)]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold flex-shrink-0 ${SIZE_CLASSES[size]}`}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.dot, boxShadow: `0 0 4px ${cfg.dot}` }}
      />
      {t(cfg.key)}
    </span>
  )
}