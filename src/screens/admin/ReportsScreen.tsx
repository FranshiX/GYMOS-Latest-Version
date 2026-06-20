import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDirection } from '@/hooks/useDirection'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useMemberStore } from '@/store/useMemberStore'
import { useMembershipStore } from '@/store/useMembershipStore'
import { useCheckinStore } from '@/store/useCheckinStore'
import { computeStatus, getDateRange } from '@/domain/membership/membershipLogic'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import paymentsData from '@/data/payments.json'
import plansData from '@/data/plans.json'
import { format, subDays, subMonths } from 'date-fns'

type Tab = 'revenue' | 'attendance' | 'membership' | 'expired'

const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-bg-border)',
    borderRadius: 8,
    fontSize: 11,
  },
  labelStyle: { color: 'var(--color-text-muted)' },
}

const PIE_COLORS = ['var(--color-success)', 'var(--color-warning)', 'var(--color-danger)']

function buildMonthlyRevenue() {
  return Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i)
    const monthStr = format(date, 'yyyy-MM')
    const total = paymentsData
      .filter(p => p.date.startsWith(monthStr))
      .reduce((s, p) => s + p.amount, 0)
    return { month: format(date, 'MMM'), amount: total }
  })
}

function buildDailyCheckins(
  checkins: { timestamp: string; result: string }[]
) {
  return Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i)
    const key = format(date, 'yyyy-MM-dd')
    const count = checkins.filter(
      c => c.timestamp.startsWith(key) && c.result === 'GRANTED'
    ).length
    return { day: format(date, 'MM/dd'), visits: count }
  })
}

function buildPeakDays(checkins: { timestamp: string; result: string }[]) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const counts = new Array(7).fill(0)
  checkins.forEach(c => {
    if (c.result === 'GRANTED') {
      const d = new Date(c.timestamp).getDay()
      counts[d]++
    }
  })
  return days.map((day, i) => ({ day, visits: counts[i] }))
}

export function ReportsScreen() {
  const { t } = useTranslation()
  const { isRTL } = useDirection()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('revenue')

  const members     = useMemberStore((s: any) => s.members)
  const memberships = useMembershipStore((s: any) => s.memberships)
  const checkins    = useCheckinStore((s: any) => s.checkins)

  const monthlyRevenue = useMemo(() => buildMonthlyRevenue(), [])
  const dailyCheckins  = useMemo(() => buildDailyCheckins(checkins), [checkins])
  const peakDays       = useMemo(() => buildPeakDays(checkins), [checkins])

  const currentMonthStr = format(new Date(), 'yyyy-MM')
  const currentMonthRevenue = useMemo(
    () => paymentsData
      .filter(p => p.date.startsWith(currentMonthStr))
      .reduce((s, p) => s + p.amount, 0),
    [currentMonthStr]
  )

  const membershipStats = useMemo(() => {
    const active    = memberships.filter((ms: any) => computeStatus(ms) === 'ACTIVE').length
    const expiring  = memberships.filter((ms: any) => computeStatus(ms) === 'EXPIRING_SOON').length
    const expired   = memberships.filter((ms: any) => computeStatus(ms) === 'EXPIRED').length
    return { active, expiring, expired }
  }, [memberships])

  const planDist = useMemo(
    () => plansData.map(plan => ({
      name: plan.name,
      count: memberships.filter((ms: any) => ms.planId === plan.id).length,
    })),
    [memberships]
  )

  const expiredList = useMemo(
    () =>
      memberships
        .filter((ms: any) => computeStatus(ms) === 'EXPIRED')
        .map((ms: any) => {
          const member = members.find((m: any) => m.id === ms.memberId)
          const dates  = getDateRange(ms)
          return { ms, member, daysOverdue: Math.abs(dates.daysLeft) }
        })
        .filter((x: any) => x.member),
    [memberships, members]
  )

  const TABS: { key: Tab; label: string }[] = [
    { key: 'revenue',    label: t('reports.revenue')    },
    { key: 'attendance', label: t('reports.attendance') },
    { key: 'membership', label: t('reports.membership') },
    { key: 'expired',    label: t('reports.expired')    },
  ]

  return (
    <div
      data-screen="reports"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="flex flex-col gap-4 pb-6"
    >
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 px-0.5">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={
              tab === key
                ? { background: 'var(--color-brand)', color: '#0A0A0A' }
                : {
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-bg-border)',
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Revenue tab */}
      {tab === 'revenue' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Card padding="md">
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                {t('reports.monthly_revenue')}
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
                ${currentMonthRevenue}
              </p>
            </Card>
            <Card padding="md">
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                {t('dashboard.revenue_month')}
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-brand)' }}>
                ${paymentsData.reduce((s, p) => s + p.amount, 0)}
              </p>
            </Card>
          </div>

          <Card padding="md">
            <p className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {t('reports.monthly_revenue')} — 6 {t('plans.days').replace('يوم', 'أشهر') || 'months'}
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid stroke="var(--color-bg-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="amount" fill="var(--color-brand)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card padding="md">
            <p className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {t('reports.membership')}
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={planDist}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                >
                  {planDist.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {planDist.map((p, i) => (
                <div key={p.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {p.name} ({p.count})
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Attendance tab */}
      {tab === 'attendance' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Card padding="md">
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                {t('checkin.today_log')}
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-brand)' }}>
                {checkins.filter((c: any) =>
                  c.timestamp.startsWith(format(new Date(), 'yyyy-MM-dd')) &&
                  c.result === 'GRANTED'
                ).length}
              </p>
            </Card>
            <Card padding="md">
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Total
              </p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
                {checkins.filter((c: any) => c.result === 'GRANTED').length}
              </p>
            </Card>
          </div>

          <Card padding="md">
            <p className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {t('reports.attendance')} — 30 days
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyCheckins}>
                <defs>
                  <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-brand)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-bg-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis hide />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="visits" stroke="var(--color-brand)" strokeWidth={2} fill="url(#areaG)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card padding="md">
            <p className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {t('reports.peak_day')}
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={peakDays}>
                <CartesianGrid stroke="var(--color-bg-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="visits" fill="var(--color-brand-muted)" stroke="var(--color-brand)" strokeWidth={1} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Membership tab */}
      {tab === 'membership' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('status.active'),   value: membershipStats.active,   color: 'var(--color-success)' },
              { label: t('status.expiring'), value: membershipStats.expiring, color: 'var(--color-warning)' },
              { label: t('status.expired'),  value: membershipStats.expired,  color: 'var(--color-danger)'  },
            ].map(({ label, value, color }) => (
              <Card key={label} padding="sm">
                <p className="text-xl font-bold" style={{ color }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
              </Card>
            ))}
          </div>

          <Card padding="md">
            <p className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {t('reports.membership')}
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: t('status.active'),   value: membershipStats.active   },
                    { name: t('status.expiring'), value: membershipStats.expiring },
                    { name: t('status.expired'),  value: membershipStats.expired  },
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                >
                  {PIE_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Expired tab */}
      {tab === 'expired' && (
        <div className="flex flex-col gap-3">
          {expiredList.length === 0 ? (
            <p className="text-sm text-center py-10" style={{ color: 'var(--color-text-muted)' }}>
              {t('dashboard.no_alerts')}
            </p>
          ) : (
            expiredList.map(({ ms, member }: any) => (
              <Card key={ms.id} padding="md">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {member!.fullName}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {member!.phone} · {format(new Date(ms.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status="EXPIRED" size="sm" />
                    <button
                      onClick={() => navigate('/admin/members')}
                      className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all"
                      style={{ background: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}
                    >
                      {t('member_drawer.renew')}
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}