import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Plus, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { StampBar } from '@/components/shared/StampBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { useMemberStore } from '@/store/useMemberStore'
import { useMembershipStore } from '@/store/useMembershipStore'
import { pageVariants, pageTransition, listItemVariants } from '@/utils/variants'
import { computeStatus, getDateRange, getStampsBalance } from '@/domain/membership/membershipLogic'
import type { MemberStatus } from '@/domain/membership/types'
import type { Member } from '@/domain/member/types'
import plansData from '@/data/plans.json'
import { MemberDrawer } from './MemberDrawer'
import { RegistrationModal } from './RegistrationModal'

type Filter = 'ALL' | MemberStatus

const FILTERS: { key: Filter; i18n: string }[] = [
  { key: 'ALL',           i18n: 'members.filter_all'      },
  { key: 'ACTIVE',        i18n: 'members.filter_active'   },
  { key: 'EXPIRING_SOON', i18n: 'members.filter_expiring' },
  { key: 'EXPIRED',       i18n: 'members.filter_expired'  },
]

const STATUS_ACCENT: Record<MemberStatus, string> = {
  ACTIVE:        'var(--color-success)',
  EXPIRING_SOON: 'var(--color-warning)',
  EXPIRED:       'var(--color-danger)',
}

export function MembersScreen() {
  const { t, i18n } = useTranslation()
  const dir = i18n.dir()
  const members     = useMemberStore((s: any) => s.members)
  const memberships = useMembershipStore((s: any) => s.memberships)
  const [query,    setQuery]    = useState('')
  const [filter,   setFilter]   = useState<Filter>('ALL')
  const [selected, setSelected] = useState<Member | null>(null)
  const [showReg,  setShowReg]  = useState(false)

  const enriched = members.map((m: any) => {
    const ms     = memberships.find((x: any) => x.id === m.activeMembershipId)
    const status = ms ? computeStatus(ms) : 'EXPIRED' as MemberStatus
    const stamps = ms ? getStampsBalance(ms) : null
    const dates  = ms ? getDateRange(ms)     : null
    const plan   = ms ? plansData.find(p => p.id === ms.planId) : null
    return { member: m, ms, status, stamps, dates, plan }
  })

  const filtered = enriched.filter(({ member, status }: any) => {
    const matchQ = query === '' ||
      member.fullName.toLowerCase().includes(query.toLowerCase()) ||
      member.phone.includes(query)
    const matchF = filter === 'ALL' || status === filter
    return matchQ && matchF
  })

  // Count per filter for badges
  const counts = {
    ALL:           enriched.length,
    ACTIVE:        enriched.filter((e: any) => e.status === 'ACTIVE').length,
    EXPIRING_SOON: enriched.filter((e: any) => e.status === 'EXPIRING_SOON').length,
    EXPIRED:       enriched.filter((e: any) => e.status === 'EXPIRED').length,
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="flex flex-col gap-4 pb-4"
      dir={dir}
      style={{ background: 'var(--color-bg-base)' }}
    >

      {/* Search + Add */}
      <div className="flex items-center gap-2">
        <div
          className="flex-1 flex items-center gap-2 h-11 px-3 rounded-xl"
          style={{
            background:  'var(--color-bg-elevated)',
            border:      '1px solid var(--border-default)',
          }}
        >
          <Search size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-tertiary)' }} />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('members.search_placeholder')}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>
        <Button variant="primary" onClick={() => setShowReg(true)} size="md">
          <Plus size={16} strokeWidth={1.5} />
          <span className="hidden sm:inline">{t('members.add_member')}</span>
        </Button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map(({ key, i18n }) => {
          const isActive = filter === key
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all"
              style={
                isActive
                  ? { background: 'var(--color-primary)', color: 'var(--text-inverse)' }
                  : {
                      background:  'var(--color-bg-elevated)',
                      color:       'var(--color-text-tertiary)',
                      border:      '1px solid var(--border-default)',
                    }
              }
            >
              {t(i18n)}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{
                  background: isActive ? 'rgba(0,0,0,0.2)' : 'var(--border-subtle)',
                  color:      isActive ? 'var(--text-inverse)' : 'var(--color-text-tertiary)',
                  minWidth: '20px',
                  textAlign: 'center',
                }}
              >
                {counts[key]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Members list */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title={t('members.no_results')} />
      ) : (
        <motion.div
          className="flex flex-col gap-2.5"
          variants={listItemVariants}
          initial="hidden"
          animate="visible"
        >
          {filtered.map(({ member, status, stamps, dates, plan }: any, index: number) => {
            const accent = STATUS_ACCENT[status as MemberStatus]
            return (
              <motion.button
                key={member.id}
                onClick={() => setSelected(member)}
                className="w-full text-start rounded-2xl p-4 transition-all active:scale-99"
                style={{
                  background: 'var(--color-bg-elevated)',
                  border:     '1px solid var(--border-default)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${accent}40`
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{
                        background: `${accent}20`,
                        color:      accent,
                        border:     `1px solid ${accent}40`,
                      }}
                    >
                      {member.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold leading-tight"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {member.fullName}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {member.phone}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={status} />
                </div>

                {/* Stamp bar */}
                {stamps && (
                  <div className="mb-3">
                    <StampBar total={stamps.total} used={stamps.used} />
                  </div>
                )}

                {/* Footer row */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-medium"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {plan?.name ?? '—'}
                  </span>
                  {dates && (
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: dates.daysLeft <= 0
                          ? 'var(--color-danger)'
                          : dates.daysLeft <= 7
                            ? 'var(--color-warning)'
                            : 'var(--color-text-secondary)',
                      }}
                    >
                      {dates.daysLeft > 0
                        ? `${dates.daysLeft} ${t('members.days_remaining')}`
                        : t('status.expired')}
                    </span>
                  )}
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      )}

      <MemberDrawer member={selected} onClose={() => setSelected(null)} />
      <RegistrationModal open={showReg} onClose={() => setShowReg(false)} />
    </motion.div>
  )
}
