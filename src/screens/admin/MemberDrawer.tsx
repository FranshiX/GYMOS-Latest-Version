import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Drawer } from '@/components/ui/Drawer'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { StampBar } from '@/components/shared/StampBar'
import { Button } from '@/components/ui/Button'
import type { Member } from '@/domain/member/types'
import { useMemberStore } from '@/store/useMemberStore'
import { useMembershipStore } from '@/store/useMembershipStore'
import { useCheckinStore } from '@/store/useCheckinStore'
import { computeStatus, getDateRange, getStampsBalance } from '@/domain/membership/membershipLogic'
import type { Plan } from '@/domain/plan/types'
import { planService } from '@/services/planService'
import { format, parseISO, addDays } from 'date-fns'
import { CheckCircle, Clock, XCircle, Dumbbell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface MemberDrawerProps {
  member:  Member | null
  onClose: () => void
}

export function MemberDrawer({ member, onClose }: MemberDrawerProps) {
  const { t }  = useTranslation()
  const navigate = useNavigate()
  const getMembership          = useMembershipStore((s: any) => s.getActiveMembership)
  const addMembership          = useMembershipStore((s: any) => s.addMembership)
  const updateActiveMembership = useMemberStore((s: any) => s.updateActiveMembership)
  const checkins               = useCheckinStore((s: any) => s.checkins)

  const [showRenew,    setShowRenew]    = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [renewed,      setRenewed]      = useState(false)

  if (!member) return null

  const ms     = getMembership(member.id, member.activeMembershipId)
  const status = ms ? computeStatus(ms)    : 'EXPIRED' as const
  const stamps = ms ? getStampsBalance(ms) : null
  const dates  = ms ? getDateRange(ms)     : null
  const plans  = planService.getAll()
  const plan   = ms ? plans.find(p => p.id === ms.planId) : null

  const recentCheckins = checkins
    .filter((c: any) => c.memberId === member.id)
    .slice(0, 5)

  function handleRenew() {
    if (!selectedPlan || !member) return
    const today   = new Date()
    const newMsId = `ms-${crypto.randomUUID().slice(0, 8)}`
    addMembership({
      id:          newMsId,
      memberId:    member.id,
      planId:      selectedPlan.id,
      startDate:   format(today, 'yyyy-MM-dd'),
      endDate:     format(addDays(today, selectedPlan.durationDays), 'yyyy-MM-dd'),
      stampsTotal: selectedPlan.stampsTotal,
      stampsUsed:  0,
      paymentId:   `pay-${crypto.randomUUID().slice(0, 8)}`,
    })
    updateActiveMembership(member.id, newMsId)
    setRenewed(true)
  }

  function handleCloseRenew() {
    setShowRenew(false)
    setSelectedPlan(null)
    setRenewed(false)
  }

  return (
    <>
      <Drawer open={!!member} onClose={onClose} title={member.fullName} data-screen="member-drawer">
        <div className="flex flex-col gap-5">

          {/* Status + phone */}
          <div className="flex items-center justify-between">
            <StatusBadge status={status} />
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
              {member.phone}
            </span>
          </div>

          {/* Days remaining hero */}
          {dates && dates.daysLeft > 0 && (
            <div
              className="rounded-2xl p-4 flex items-center gap-4"
              style={{
                background: 'var(--color-brand-muted)',
                border:     '1px solid rgba(201,168,76,0.2)',
              }}
            >
              <div className="flex flex-col flex-1">
                <span className="text-3xl font-bold" style={{ color: 'var(--color-brand)' }}>
                  {dates.daysLeft}
                </span>
                <span className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {t('members.days_remaining')}
                </span>
              </div>
              {stamps && (
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {stamps.remaining}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {t('members.stamps_remaining')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Membership details */}
          {ms && plan && (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--color-bg-border)' }}
            >
              {[
                { label: t('member_drawer.plan'),       value: plan.name },
                { label: t('member_drawer.start_date'), value: format(parseISO(ms.startDate), 'MMM d, yyyy') },
                { label: t('member_drawer.end_date'),   value: format(parseISO(ms.endDate),   'MMM d, yyyy') },
              ].map(({ label, value }, i, arr) => (
                <div
                  key={label}
                  className="flex justify-between items-center px-4 py-3"
                  style={{
                    background:   i % 2 === 0 ? 'var(--color-bg-elevated)' : 'transparent',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--color-bg-border-subtle)' : 'none',
                  }}
                >
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {label}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {value}
                  </span>
                </div>
              ))}

              {/* Stamp bar row */}
              {stamps && (
                <div
                  className="px-4 py-3"
                  style={{ background: 'transparent', borderTop: '1px solid var(--color-bg-border-subtle)' }}
                >
                  <div className="flex justify-between text-xs mb-2">
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {t('member_drawer.stamps_remaining')}
                    </span>
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                      {stamps.remaining} / {stamps.total}
                    </span>
                  </div>
                  <StampBar total={stamps.total} used={stamps.used} showLabel={false} />
                </div>
              )}
            </div>
          )}

          {/* Progress shortcut */}
          <button
            onClick={() => { onClose(); navigate(`/admin/members/${member.id}/progress`) }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
            style={{
              background: 'var(--color-bg-elevated)',
              border:     '1px solid var(--color-bg-border)',
            }}
          >
            <Dumbbell size={16} style={{ color: 'var(--color-brand)' }} />
            <span className="text-sm font-medium flex-1 text-start" style={{ color: 'var(--color-text-primary)' }}>
              {t('workout.progressReport')}
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>›</span>
          </button>

          {/* Recent activity */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {t('member_drawer.recent_activity')}
            </p>
            {recentCheckins.length === 0 ? (
              <div className="flex items-center gap-2 py-2">
                <Clock size={14} style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {t('member_drawer.no_activity')}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-0">
                {recentCheckins.map((c: any) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 py-2.5 border-b last:border-0"
                    style={{ borderColor: 'var(--color-bg-border-subtle)' }}
                  >
                    {c.result === 'GRANTED'
                      ? <CheckCircle size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                      : <XCircle    size={14} style={{ color: 'var(--color-danger)',  flexShrink: 0 }} />
                    }
                    <span className="text-xs flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {format(new Date(c.timestamp), 'MMM d, HH:mm')}
                    </span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: c.result === 'GRANTED' ? 'var(--color-success)' : 'var(--color-danger)' }}
                    >
                      {c.result === 'GRANTED' ? t('result.granted') : t('result.denied')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Renew CTA */}
          <Button full onClick={() => setShowRenew(true)}>
            {t('member_drawer.renew')}
          </Button>
        </div>
      </Drawer>

      {/* Renew Modal */}
      <Modal
        open={showRenew}
        onClose={handleCloseRenew}
        title={t('member_drawer.renew')}
        size="md"
      >
        {renewed ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-success-muted)', border: '1px solid rgba(76,175,125,0.3)' }}
            >
              <CheckCircle size={28} style={{ color: 'var(--color-success)' }} />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {t('registration.success')}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {member.fullName}
              </p>
            </div>
            <Button full onClick={handleCloseRenew}>{t('common.close')}</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
              {t('registration.step2')}
            </p>
            {plans.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p as Plan)}
                className="w-full text-start rounded-xl p-4 transition-all"
                style={{
                  background:  selectedPlan?.id === p.id ? 'var(--color-brand-muted)' : 'var(--color-bg-elevated)',
                  border:      selectedPlan?.id === p.id
                    ? '1.5px solid var(--color-brand)'
                    : '1px solid var(--color-bg-border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {p.name}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {p.stampsTotal} {t('plans.visits')} · {p.durationDays} {t('plans.days')}
                    </p>
                  </div>
                  <span
                    className="text-lg font-bold"
                    style={{ color: selectedPlan?.id === p.id ? 'var(--color-brand)' : 'var(--color-text-secondary)' }}
                  >
                    {p.price} {t('common.currency')}
                  </span>
                </div>
              </button>
            ))}
            <Button full disabled={!selectedPlan} onClick={handleRenew} className="mt-1">
              {t('registration.confirm')}
            </Button>
          </div>
        )}
      </Modal>
    </>
  )
}
