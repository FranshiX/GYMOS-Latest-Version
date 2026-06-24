import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Dumbbell, TrendingUp, Calendar, Activity } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { StampBar } from '@/components/shared/StampBar'
import { useMemberStore } from '@/store/useMemberStore'
import { useMembershipStore } from '@/store/useMembershipStore'
import { useCheckinStore } from '@/store/useCheckinStore'
import { useWorkoutLogStore } from '@/store/useWorkoutLogStore'
import { pageVariants, pageTransition } from '@/utils/variants'
import { computeStatus, getDateRange, getStampsBalance } from '@/domain/membership/membershipLogic'
import plansData from '@/data/plans.json'
import { format, parseISO } from 'date-fns'

// ── Circular progress arc ────────────────────────────────────────────────────

function StampCircle({
  remaining, total, status,
}: {
  remaining: number
  total:     number
  status:    'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED'
}) {
  const { t } = useTranslation()
  const pct   = total > 0 ? remaining / total : 0
  const r     = 52
  const cx    = 64
  const cy    = 64
  const circumference = 2 * Math.PI * r
  const dash  = circumference * pct
  const color =
    status === 'ACTIVE'        ? 'var(--color-success)' :
    status === 'EXPIRING_SOON' ? 'var(--color-warning)' :
                                  'var(--color-danger)'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="128" height="128" viewBox="0 0 128 128">
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--color-bg-border)"
          strokeWidth="8"
        />
        {/* Progress */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          strokeDashoffset={circumference * 0.25}
          style={{ transition: 'stroke-dasharray 0.6s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="middle"
          style={{ fill: color, fontSize: '26px', fontWeight: 700, fontFamily: 'inherit' }}>
          {remaining}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle"
          style={{ fill: 'var(--color-text-muted)', fontSize: '10px', fontFamily: 'inherit' }}>
          {t('checkin.stamps_remaining')}
        </text>
      </svg>
    </div>
  )
}

// ── Main Screen ──────────────────────────────────────────────────────────────

export function MemberProfileScreen() {
  const { phone }  = useParams<{ phone: string }>()
  const { t, i18n } = useTranslation()
  const navigate   = useNavigate()
  const dir = i18n.dir()

  const members     = useMemberStore((s: any) => s.members)
  const memberships = useMembershipStore((s: any) => s.memberships)
  const checkins    = useCheckinStore((s: any) => s.checkins)
  const { getLogsForMember, getStreakForMember } = useWorkoutLogStore()

  const member = members.find((m: any) => m.phone === phone)

  if (!member) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6"
        dir={dir}
        style={{ background: 'var(--color-bg-base)' }}
      >
        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          {t('entry.member_not_found')}
        </p>
        <Button variant="secondary" onClick={() => navigate('/')}>
          {t('common.cancel')}
        </Button>
      </motion.div>
    )
  }

  const ms      = memberships.find((x: any) => x.id === member.activeMembershipId)
  const status  = ms ? computeStatus(ms)    : 'EXPIRED' as const
  const stamps  = ms ? getStampsBalance(ms) : null
  const dates   = ms ? getDateRange(ms)     : null
  const plan    = ms ? plansData.find(p => p.id === ms.planId) : null

  const myCheckins = checkins
    .filter((c: any) => c.memberId === member.id && c.result === 'GRANTED')
    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6)

  const streak       = getStreakForMember(member.id)
  const logs         = getLogsForMember(member.id)
  const totalSessions = logs.length

  const statusColor =
    status === 'ACTIVE'        ? 'var(--color-success)' :
    status === 'EXPIRING_SOON' ? 'var(--color-warning)' :
                                  'var(--color-danger)'
  const statusColorDim =
    status === 'ACTIVE'        ? 'var(--color-success-dim)' :
    status === 'EXPIRING_SOON' ? 'var(--color-warning-dim)' :
                                  'var(--color-danger-dim)'

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

      {/* Hero — member identity */}
      <Card variant="elevated" padding="lg" className="flex flex-col items-center gap-4 relative overflow-hidden">
        {/* Glow top */}
        <div
          className="absolute top-0 start-0 end-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${statusColor}50, transparent)`,
          }}
        />

        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
          style={{
            background: statusColorDim,
            border:     `1.5px solid ${statusColor}40`,
            color:      statusColor,
          }}
        >
          {member.fullName.charAt(0).toUpperCase()}
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {member.fullName}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {member.phone}
          </p>
        </div>

        <StatusBadge status={status} />

        {/* Stamp circle */}
        {stamps && (
          <StampCircle
            remaining={stamps.remaining}
            total={stamps.total}
            status={status}
          />
        )}

        {/* Stamp bar */}
        {stamps && (
          <div className="w-full">
            <StampBar total={stamps.total} used={stamps.used} />
          </div>
        )}
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {/* Days left */}
        <Card variant="default" padding="sm" className="flex flex-col items-center gap-1">
          <Calendar size={14} strokeWidth={1.5} style={{ color: 'var(--color-secondary)' }} />
          <span className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {dates?.daysLeft ?? 0}
          </span>
          <span className="text-xs text-center leading-tight" style={{ color: 'var(--color-text-tertiary)' }}>
            {t('members.days_remaining')}
          </span>
        </Card>

        {/* Streak */}
        <Card variant="default" padding="sm" className="flex flex-col items-center gap-1">
          <span className="text-base">🔥</span>
          <span className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {streak}
          </span>
          <span className="text-xs text-center leading-tight" style={{ color: 'var(--color-text-tertiary)' }}>
            {t('workout.streak')}
          </span>
        </Card>

        {/* Total sessions */}
        <Card variant="default" padding="sm" className="flex flex-col items-center gap-1">
          <Activity size={14} strokeWidth={1.5} style={{ color: 'var(--color-success)' }} />
          <span className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {totalSessions}
          </span>
          <span className="text-xs text-center leading-tight" style={{ color: 'var(--color-text-tertiary)' }}>
            {t('workout.sessions')}
          </span>
        </Card>
      </div>

      {/* Membership details */}
      {ms && plan && dates && (
        <Card variant="elevated" padding="md">
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {t('member_drawer.membership')}
          </p>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            {[
              { label: t('member_drawer.plan'),       value: plan.name },
              { label: t('member_drawer.start_date'), value: format(parseISO(ms.startDate), 'MMM d, yyyy') },
              { label: t('member_drawer.end_date'),   value: format(parseISO(ms.endDate),   'MMM d, yyyy') },
              { label: t('members.days_remaining'),   value: `${dates.daysLeft} ${t('plans.days')}` },
            ].map(({ label, value }, i, arr) => (
              <div
                key={label}
                className="flex justify-between items-center px-4 py-3"
                style={{
                  background:   i % 2 === 0 ? 'var(--color-bg-card)' : 'transparent',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {label}
                </span>
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Expired banner */}
      {status === 'EXPIRED' && (
        <div
          className="rounded-2xl p-4 text-center"
          style={{
            background:  'var(--color-danger-dim)',
            border:      '1.5px solid var(--color-danger)',
          }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--color-danger)' }}>
            {t('checkin.denied_subtitle')}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {t('member_drawer.renew')}
          </p>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="primary"
          fullWidth
          onClick={() => navigate(`/member/${phone}/workout`)}
          className="flex flex-col items-center gap-2 p-4"
        >
          <Dumbbell size={20} strokeWidth={1.5} />
          <span className="text-xs font-semibold">
            {t('workout.myWorkout')}
          </span>
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigate(`/member/${phone}/progress`)}
          className="flex flex-col items-center gap-2 p-4"
        >
          <TrendingUp size={20} strokeWidth={1.5} />
          <span className="text-xs font-semibold">
            {t('workout.myProgress')}
          </span>
        </Button>
      </div>

      {/* Recent checkins */}
      <Card variant="elevated" padding="md">
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {t('member_drawer.recent_activity')}
        </p>
        {myCheckins.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-tertiary)' }}>
            {t('member_drawer.no_activity')}
          </p>
        ) : (
          <div className="flex flex-col">
            {myCheckins.map((c: any) => (
              <div
                key={c.id}
                className="flex items-center gap-3 py-2.5 border-b last:border-0"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: 'var(--color-success)' }}
                />
                <span className="text-xs flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {format(new Date(c.timestamp), 'MMM d, yyyy')}
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
                  {format(new Date(c.timestamp), 'HH:mm')}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  )
}
