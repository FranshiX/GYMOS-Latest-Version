import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Users, UserCheck, AlertTriangle, UserX,
  ScanLine, TrendingUp,
} from 'lucide-react'
import { KPICard }  from '@/components/shared/KPICard'
import { AlertRow } from '@/components/shared/AlertRow'
import { Card }     from '@/components/ui/Card'
import { useDashboardStats }    from '@/store/useDashboardStore'
import { useMembershipStore }   from '@/store/useMembershipStore'
import { useMemberStore }       from '@/store/useMemberStore'
import { pageVariants, pageTransition, listItemVariants } from '@/utils/variants'
import { computeStatus, getDateRange, getStampsBalance } from '@/domain/membership/membershipLogic'
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import paymentsData from '@/data/payments.json'
import { format, subDays } from 'date-fns'
import { useNavigate } from 'react-router-dom'

function buildRevenueChart() {
  return Array.from({ length: 7 }, (_, i) => {
    const date  = subDays(new Date(), 6 - i)
    const key   = format(date, 'yyyy-MM-dd')
    const total = paymentsData
      .filter(p => p.date === key)
      .reduce((s, p) => s + p.amount, 0)
    return { day: format(date, 'EEE'), revenue: total }
  })
}

// Custom tooltip for charts
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-3 py-2 shadow-xl text-sm"
      style={{
        background:  'var(--color-bg-card)',
        border:      '1px solid var(--border-default)',
        color:       'var(--color-text-primary)',
      }}
    >
      <p style={{ color: 'var(--color-text-tertiary)', fontSize: 11 }}>{label}</p>
      <p style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
        {payload[0].value}
      </p>
    </div>
  )
}

export function DashboardScreen() {
  const { t, i18n } = useTranslation()
  const navigate      = useNavigate()
  const dir = i18n.dir()
  const stats         = useDashboardStats()
  const memberships   = useMembershipStore((s: any) => s.memberships)
  const members       = useMemberStore((s: any) => s.members)
  const revenueData   = buildRevenueChart()
  const totalRevenue  = paymentsData.reduce((s, p) => s + p.amount, 0)

  const pieData = [
    { name: t('status.active'),        value: stats.activeMembers,   color: 'var(--color-success)' },
    { name: t('status.expiring_soon'), value: stats.expiringMembers, color: 'var(--color-warning)' },
    { name: t('status.expired'),       value: stats.expiredMembers,  color: 'var(--color-danger)'  },
  ].filter(d => d.value > 0)

  // Fix: resolve member name from memberId
  const expiringMemberships = memberships
    .filter((ms: any) => computeStatus(ms) === 'EXPIRING_SOON')
    .slice(0, 5)

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

      {/* KPI Grid */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        variants={listItemVariants}
        initial="hidden"
        animate="visible"
      >
        <KPICard
          label={t('dashboard.total_members')}
          value={stats.totalMembers}
          icon={Users}
        />
        <KPICard
          label={t('dashboard.active_members')}
          value={stats.activeMembers}
          icon={UserCheck}
          color="var(--color-success)"
        />
        <KPICard
          label={t('dashboard.expiring_soon')}
          value={stats.expiringMembers}
          icon={AlertTriangle}
          color="var(--color-warning)"
        />
        <KPICard
          label={t('dashboard.expired')}
          value={stats.expiredMembers}
          icon={UserX}
          color="var(--color-danger)"
        />
        <KPICard
          label={t('dashboard.today_checkins')}
          value={stats.todayCheckins}
          icon={ScanLine}
          color="var(--color-secondary)"
        />
        <KPICard
          label={t('dashboard.revenue_month')}
          value={`${totalRevenue}`}
          icon={TrendingUp}
          color="var(--color-success)"
          subtitle={t('common.currency')}
        />
      </motion.div>

      {/* Revenue Chart */}
      <Card variant="elevated" padding="md">
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {t('reports.revenue')} — 7 {t('plans.days')}
        </p>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="var(--color-secondary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tick={{ fill: 'var(--color-text-tertiary)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-secondary)"
              strokeWidth={2}
              fill="url(#revGrad)"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--color-secondary)', stroke: 'var(--color-bg-base)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Membership Breakdown */}
      <Card variant="elevated" padding="md">
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {t('reports.membership')}
        </p>
        <div className="flex items-center gap-4">
          {/* Donut */}
          <div className="flex-shrink-0">
            <ResponsiveContainer width={110} height={110}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={32} outerRadius={48}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2.5 flex-1">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: d.color }}
                  />
                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    {d.name}
                  </span>
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Alerts */}
      {expiringMemberships.length > 0 && (
        <Card variant="elevated" padding="md">
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {t('dashboard.alerts_title')}
            </p>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--color-warning-dim)',
                color:      'var(--color-warning)',
              }}
            >
              {expiringMemberships.length}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {expiringMemberships.map((ms: any) => {
              const { daysLeft } = getDateRange(ms)
              const { remaining } = getStampsBalance(ms)
              // Resolve actual member name
              const member = members.find((m: any) => m.id === ms.memberId)
              const displayName = member?.fullName ?? ms.memberId

              return (
                <AlertRow
                  key={ms.id}
                  name={displayName}
                  phone={member?.phone ?? ''}
                  status="EXPIRING_SOON"
                  detail={`${daysLeft}d · ${remaining} stamps`}
                  onClick={() => navigate('/admin/members')}
                />
              )
            })}
          </div>
        </Card>
      )}
    </motion.div>
  )
}
