import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanLine, CheckCircle, XCircle, Clock, Delete } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useCheckinStore } from '@/store/useCheckinStore'
import { useMemberStore } from '@/store/useMemberStore'
import { useMembershipStore } from '@/store/useMembershipStore'
import { pageVariants, pageTransition } from '@/utils/variants'
import { getStampsBalance, getDateRange } from '@/domain/membership/membershipLogic'
import { format } from 'date-fns'

// ── Phone Keypad ─────────────────────────────────────────────────────────────

function Keypad({ onPress, onDelete }: { onPress: (v: string) => void; onDelete: () => void }) {
  const keys = ['1','2','3','4','5','6','7','8','9','','0','del']
  return (
    <div className="grid grid-cols-3 gap-2.5 w-full">
      {keys.map((key, i) => {
        if (key === '') return <div key={i} />
        if (key === 'del') return (
          <button
            key={i}
            onClick={onDelete}
            className="h-13 rounded-2xl flex items-center justify-center transition-all active:scale-95"
            style={{
              background: 'var(--color-bg-elevated)',
              border:     '1px solid var(--border-default)',
              height:     '52px',
            }}
          >
            <Delete size={18} strokeWidth={1.5} style={{ color: 'var(--color-text-tertiary)' }} />
          </button>
        )
        return (
          <button
            key={i}
            onClick={() => onPress(key)}
            className="rounded-2xl flex items-center justify-center text-lg font-medium transition-all active:scale-95"
            style={{
              background: 'var(--color-bg-elevated)',
              border:     '1px solid var(--border-default)',
              color:      'var(--color-text-primary)',
              height:     '52px',
            }}
          >
            {key}
          </button>
        )
      })}
    </div>
  )
}

// ── Result Card ──────────────────────────────────────────────────────────────

function ResultCard({
  result, memberName, stamps, daysLeft, onDismiss,
}: {
  result:     'GRANTED' | 'DENIED'
  memberName: string
  stamps?:    number
  daysLeft?:  number
  onDismiss:  () => void
}) {
  const { t }     = useTranslation()
  const isGranted = result === 'GRANTED'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
      className="rounded-2xl p-5 flex flex-col items-center gap-4 text-center"
      style={{
        background:  isGranted ? 'var(--color-success-dim)' : 'var(--color-danger-dim)',
        border:      `1.5px solid ${isGranted ? 'var(--color-success)' : 'var(--color-danger)'}`,
      }}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: isGranted ? 'rgba(76,175,125,0.2)' : 'rgba(224,82,82,0.2)',
          boxShadow:  isGranted
            ? '0 0 32px rgba(76,175,125,0.3)'
            : '0 0 32px rgba(224,82,82,0.3)',
        }}
      >
        {isGranted
          ? <CheckCircle size={32} strokeWidth={2} style={{ color: 'var(--color-success)' }} />
          : <XCircle    size={32} strokeWidth={2} style={{ color: 'var(--color-danger)'  }} />
        }
      </motion.div>

      {/* Result */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.2 }}
      >
        <p
          className="text-2xl font-bold tracking-tight"
          style={{ color: isGranted ? 'var(--color-success)' : 'var(--color-danger)' }}
        >
          {isGranted ? t('checkin.granted_title') : t('checkin.denied_title')}
        </p>
        <p className="text-base mt-1 font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {memberName}
        </p>
        {!isGranted && (
          <p className="text-xs mt-1.5" style={{ color: 'var(--color-danger)', opacity: 0.8 }}>
            {t('checkin.denied_subtitle')}
          </p>
        )}
      </motion.div>

      {/* Stats row — only on GRANTED */}
      {isGranted && stamps !== undefined && daysLeft !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.2 }}
          className="flex w-full rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--color-success)' }}
        >
          <div
            className="flex-1 flex flex-col items-center py-3"
            style={{ background: 'rgba(76,175,125,0.1)', borderInlineEnd: '1px solid var(--color-success)' }}
          >
            <span className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
              {stamps}
            </span>
            <span className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
              {t('checkin.stamps_remaining')}
            </span>
          </div>
          <div
            className="flex-1 flex flex-col items-center py-3"
            style={{ background: 'rgba(76,175,125,0.1)' }}
          >
            <span className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
              {daysLeft}
            </span>
            <span className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
              {t('members.days_remaining')}
            </span>
          </div>
        </motion.div>
      )}

      {/* Dismiss */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.2 }}
        onClick={onDismiss}
        className="text-xs font-medium px-4 py-1.5 rounded-full transition-all"
        style={{
          background: 'rgba(255,255,255,0.06)',
          color:      'var(--color-text-tertiary)',
          border:     '1px solid var(--border-default)',
        }}
      >
        {t('common.dismiss') ?? 'Dismiss'}
      </motion.button>
    </motion.div>
  )
}

// ── Main Screen ──────────────────────────────────────────────────────────────

export function CheckInScreen() {
  const { t, i18n } = useTranslation()
  const dir = i18n.dir()

  const [phone, setPhone]   = useState('')
  const processCheckIn      = useCheckinStore((s: any) => s.processCheckInByPhone)
  const lastResult          = useCheckinStore((s: any) => s.lastResult)
  const lastCheckin         = useCheckinStore((s: any) => s.lastCheckin)
  const clearResult         = useCheckinStore((s: any) => s.clearLastResult)
  const checkins            = useCheckinStore((s: any) => s.checkins)
  const isProcessing        = useCheckinStore((s: any) => s.isProcessing)
  const members             = useMemberStore((s: any) => s.members)
  const memberships         = useMembershipStore((s: any) => s.memberships)

  const today    = new Date().toISOString().split('T')[0]
  const todayLog = checkins
    .filter((c: any) => c.timestamp.startsWith(today))
    .sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp))

  const lastMember     = lastCheckin ? members.find((m: any) => m.id === lastCheckin.memberId) : null
  const lastMembership = lastMember  ? memberships.find((ms: any) => ms.id === lastMember.activeMembershipId) : null
  const lastStamps     = lastMembership ? getStampsBalance(lastMembership) : null
  const lastDates      = lastMembership ? getDateRange(lastMembership)     : null

  function handleKeyPress(digit: string) {
    if (phone.length >= 15) return
    setPhone(p => p + digit)
    clearResult()
  }

  function handleDelete() {
    setPhone(p => p.slice(0, -1))
  }

  function handleSubmit() {
    if (!phone.trim() || isProcessing) return
    processCheckIn(phone.trim())
    setPhone('')
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="flex flex-col gap-4"
      dir={dir}
      data-screen="check-in"
      style={{ background: 'var(--color-bg-base)' }}
    >

      {/* Input display */}
      <Card variant="elevated" padding="lg" className="flex flex-col items-center gap-4">
        {/* Icon + title */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: 'var(--color-secondary-dim)',
              border:     '1px solid var(--color-secondary)',
            }}
          >
            <ScanLine size={22} strokeWidth={1.5} style={{ color: 'var(--color-secondary)' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            {t('checkin.input_label')}
          </p>
        </div>

        {/* Phone display */}
        <div
          className="w-full h-14 rounded-xl flex items-center justify-center text-2xl font-bold tracking-widest"
          style={{
            background:  'var(--color-bg-card)',
            border:      '1px solid var(--border-default)',
            color:       phone ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
            letterSpacing: '0.15em',
          }}
        >
          {phone || t('checkin.input_placeholder')}
        </div>

        {/* Keypad */}
        <Keypad onPress={handleKeyPress} onDelete={handleDelete} />

        {/* Submit */}
        <Button
          variant="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={!phone.trim() || isProcessing}
        >
          {isProcessing ? t('common.loading') : t('checkin.submit')}
        </Button>
      </Card>

      {/* Result card */}
      <AnimatePresence>
        {lastResult && lastCheckin && (
          <ResultCard
            result={lastResult}
            memberName={lastMember?.fullName ?? t('entry.member_not_found')}
            stamps={lastStamps?.remaining}
            daysLeft={lastDates?.daysLeft}
            onDismiss={clearResult}
          />
        )}
      </AnimatePresence>

      {/* Today's log */}
      <Card variant="elevated" padding="md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock size={13} strokeWidth={1.5} style={{ color: 'var(--color-text-tertiary)' }} />
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {t('checkin.today_log')}
            </p>
          </div>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: 'var(--color-secondary-dim)',
              color:      'var(--color-secondary)',
            }}
          >
            {todayLog.length}
          </span>
        </div>

        {todayLog.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: 'var(--color-text-tertiary)' }}>
            {t('checkin.no_checkins')}
          </p>
        ) : (
          <div className="flex flex-col">
            {todayLog.slice(0, 12).map((c: any) => {
              const m         = members.find((x: any) => x.id === c.memberId)
              const isGranted = c.result === 'GRANTED'
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-3 py-2.5 border-b last:border-0"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  {/* Avatar initial */}
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: isGranted ? 'var(--color-success-dim)' : 'var(--color-danger-dim)',
                      color:      isGranted ? 'var(--color-success)'       : 'var(--color-danger)',
                    }}
                  >
                    {m?.fullName?.charAt(0).toUpperCase() ?? '?'}
                  </div>

                  <span
                    className="text-sm flex-1 truncate"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {m?.fullName ?? t('entry.member_not_found')}
                  </span>

                  <span
                    className="text-xs font-mono flex-shrink-0"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    {format(new Date(c.timestamp), 'HH:mm')}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </motion.div>
  )
}
