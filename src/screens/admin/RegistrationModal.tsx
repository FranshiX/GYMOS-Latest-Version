import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useMemberStore } from '@/store/useMemberStore'
import { useMembershipStore } from '@/store/useMembershipStore'
import { planService } from '@/services/planService'
import { addDays, format } from 'date-fns'
import type { Plan } from '@/domain/plan/types'
import { CheckCircle } from 'lucide-react'

interface Props {
  open:    boolean
  onClose: () => void
}

interface Step1 { fullName: string; phone: string }

export function RegistrationModal({ open, onClose }: Props) {
  const { t }         = useTranslation()
  const members       = useMemberStore((s: any) => s.members)
  const addMember     = useMemberStore((s: any) => s.addMember)
  const addMembership = useMembershipStore((s: any) => s.addMembership)

  const [step,   setStep]   = useState(1)
  const [info,   setInfo]   = useState<Step1>({ fullName: '', phone: '' })
  const [errors, setErrors] = useState<Partial<Step1>>({})
  const [plan,   setPlan]   = useState<Plan | null>(null)
  const [done,   setDone]   = useState(false)

  function reset() {
    setStep(1)
    setInfo({ fullName: '', phone: '' })
    setErrors({})
    setPlan(null)
    setDone(false)
  }

  function handleClose() { reset(); onClose() }

  function validateStep1() {
    const e: Partial<Step1> = {}
    if (!info.fullName.trim()) e.fullName = t('registration.name_required')
    if (!info.phone.trim())    e.phone    = t('registration.phone_required')
    else if (members.some((m: any) => m.phone === info.phone))
      e.phone = t('registration.phone_exists')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleConfirm() {
    if (!plan) return
    const today    = new Date()
    const memberId = `m-${crypto.randomUUID().slice(0, 8)}`
    const msId     = `ms-${crypto.randomUUID().slice(0, 8)}`
    addMember({
      id:                 memberId,
      fullName:           info.fullName,
      phone:              info.phone,
      joinDate:           format(today, 'yyyy-MM-dd'),
      activeMembershipId: msId,
    })
    addMembership({
      id:          msId,
      memberId,
      planId:      plan.id,
      startDate:   format(today, 'yyyy-MM-dd'),
      endDate:     format(addDays(today, plan.durationDays), 'yyyy-MM-dd'),
      stampsTotal: plan.stampsTotal,
      stampsUsed:  0,
      paymentId:   `pay-${crypto.randomUUID().slice(0, 8)}`,
    })
    setDone(true)
  }

  const plans = planService.getAll()

  return (
    <Modal open={open} onClose={handleClose} title={t('registration.title')} size="md" data-screen="registration-modal">

      {/* Progress bar */}
      {!done && (
        <div className="flex items-center gap-1.5 mb-5">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 h-0.5 rounded-full overflow-hidden"
              style={{ background: 'var(--color-bg-border)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width:      s <= step ? '100%' : '0%',
                  background: 'var(--color-brand)',
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Step label */}
      {!done && (
        <p className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--color-text-muted)' }}>
          {[t('registration.step1'), t('registration.step2'), t('registration.step3')][step - 1]}
        </p>
      )}

      {/* Done state */}
      {done ? (
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
              {info.fullName}
            </p>
          </div>
          <Button full onClick={handleClose}>{t('common.close')}</Button>
        </div>
      ) : (
        <>
          {/* Step 1 — Personal info */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <Input
                label={t('registration.full_name')}
                value={info.fullName}
                onChange={e => setInfo(p => ({ ...p, fullName: e.target.value }))}
                error={errors.fullName}
              />
              <Input
                label={t('registration.phone')}
                type="tel"
                inputMode="numeric"
                value={info.phone}
                onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))}
                error={errors.phone}
              />
              <Button full onClick={() => validateStep1() && setStep(2)}>
                {t('registration.next')}
              </Button>
            </div>
          )}

          {/* Step 2 — Choose plan */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              {plans.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlan(p as Plan)}
                  className="w-full text-start rounded-xl p-4 transition-all"
                  style={{
                    background:  plan?.id === p.id ? 'var(--color-brand-muted)' : 'var(--color-bg-elevated)',
                    border:      plan?.id === p.id
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
                      style={{ color: plan?.id === p.id ? 'var(--color-brand)' : 'var(--color-text-secondary)' }}
                    >
                      {p.price} {t('common.currency')}
                    </span>
                  </div>
                </button>
              ))}
              <div className="flex gap-2 mt-1">
                <Button full variant="secondary" onClick={() => setStep(1)}>
                  {t('registration.back')}
                </Button>
                <Button full disabled={!plan} onClick={() => plan && setStep(3)}>
                  {t('registration.next')}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — Confirm */}
          {step === 3 && plan && (
            <div className="flex flex-col gap-4">
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--color-bg-border)' }}
              >
                {[
                  { label: t('registration.full_name'), value: info.fullName },
                  { label: t('registration.phone'),     value: info.phone    },
                  { label: t('member_drawer.plan'),     value: plan.name     },
                  { label: t('plans.stamps'),           value: `${plan.stampsTotal} ${t('plans.visits')}` },
                  { label: t('plans.duration'),         value: `${plan.durationDays} ${t('plans.days')}` },
                  { label: t('plans.price'),            value: `${plan.price} ${t('common.currency')}` },
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
              </div>

              <div className="flex gap-2">
                <Button full variant="secondary" onClick={() => setStep(2)}>
                  {t('registration.back')}
                </Button>
                <Button full onClick={handleConfirm}>
                  {t('registration.confirm')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}
