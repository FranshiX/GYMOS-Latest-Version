import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, User, Delete, ChevronLeft } from 'lucide-react'
import { useMemberStore } from '@/store/useMemberStore'
import { useDirection } from '@/hooks/useDirection'

type Mode = 'select' | 'staff' | 'member'

const STAFF_PIN = '0000'

// PIN dot indicator
function PinDots({ length }: { length: number }) {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="w-3.5 h-3.5 rounded-full transition-all duration-200"
          style={{
            background: i < length
              ? 'var(--color-brand)'
              : 'rgba(255,255,255,0.12)',
            transform: i < length ? 'scale(1.15)' : 'scale(1)',
            boxShadow: i < length ? '0 0 8px rgba(99,102,241,0.6)' : 'none',
          }}
        />
      ))}
    </div>
  )
}

// Number keypad
function Keypad({ onPress, onDelete }: { onPress: (v: string) => void; onDelete: () => void }) {
  const keys = ['1','2','3','4','5','6','7','8','9','','0','del']
  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      {keys.map((key, i) => {
        if (key === '') return <div key={i} />
        if (key === 'del') return (
          <button
            key={i}
            onClick={onDelete}
            className="h-16 rounded-2xl flex items-center justify-center transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <Delete size={20} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        )
        return (
          <button
            key={i}
            onClick={() => onPress(key)}
            className="h-16 rounded-2xl flex items-center justify-center text-xl font-medium transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--color-text-primary)',
            }}
            onMouseDown={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseUp={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            {key}
          </button>
        )
      })}
    </div>
  )
}

// Phone input for member login
function PhoneInput({
  value,
  onChange,
  error,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  error: string
  placeholder: string
}) {
  return (
    <div className="w-full flex flex-col gap-2">
      <input
        type="tel"
        inputMode="numeric"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-14 rounded-2xl text-center text-lg tracking-widest outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: error
            ? '1.5px solid var(--color-danger)'
            : '1.5px solid rgba(255,255,255,0.1)',
          color: 'var(--color-text-primary)',
        }}
      />
      {error && (
        <p className="text-xs text-center" style={{ color: 'var(--color-danger)' }}>
          {error}
        </p>
      )}
    </div>
  )
}

export function EntryScreen() {
  const { t } = useTranslation()
  const { toggleLanguage, language } = useDirection()
  const navigate = useNavigate()
  const members = useMemberStore((s: any) => s.members)

  const [mode, setMode]   = useState<Mode>('select')
  const [pin, setPin]     = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  function triggerShake() {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  function handlePinPress(digit: string) {
    if (pin.length >= 4) return
    const next = pin + digit
    setPin(next)
    setError('')
    if (next.length === 4) {
      setTimeout(() => {
        if (next === STAFF_PIN) {
          navigate('/admin/dashboard')
        } else {
          triggerShake()
          setError(t('entry.wrong_pin'))
          setPin('')
        }
      }, 120)
    }
  }

  function handlePinDelete() {
    setPin(p => p.slice(0, -1))
    setError('')
  }

  function handleMemberLogin() {
    const found = members.find((m: any) => m.phone === phone)
    if (found) {
      navigate(`/member/${phone}`)
    } else {
      triggerShake()
      setError(t('entry.member_not_found'))
    }
  }

  function goBack() {
    setMode('select')
    setPin('')
    setPhone('')
    setError('')
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-between p-6 pb-10"
      data-screen="entry"
      style={{ background: 'var(--color-bg-primary)' }}
    >
      {/* Top bar */}
      <div className="w-full max-w-sm flex items-center justify-between h-12">
        {mode !== 'select' ? (
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{
              color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <div className="w-9" />
        )}
        <button
          onClick={toggleLanguage}
          className="text-xs px-3 py-1.5 rounded-xl border transition-colors font-medium"
          style={{
            color: 'var(--color-text-secondary)',
            borderColor: 'var(--color-bg-border)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {language === 'ar' ? 'EN' : 'ع'}
        </button>
      </div>

      {/* Center content */}
      <div className="w-full max-w-sm flex flex-col items-center gap-8 flex-1 justify-center">

        {/* Brand */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0.08) 100%)',
              border: '1px solid rgba(99,102,241,0.25)',
              boxShadow: '0 0 40px rgba(99,102,241,0.15)',
            }}
          >
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: 'var(--color-brand)' }}>
              <path d="M6.5 6.5h1M16.5 6.5h1M6.5 17.5h1M16.5 17.5h1"/>
              <path d="M7.5 6.5v11M17.5 6.5v11"/>
              <path d="M7.5 12h9"/>
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              GymOS
            </h1>
            {mode === 'select' && (
              <p className="text-sm mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                {t('entry.subtitle')}
              </p>
            )}
            {mode === 'staff' && (
              <p className="text-sm mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                {t('entry.pin_label')}
              </p>
            )}
            {mode === 'member' && (
              <p className="text-sm mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                {t('entry.phone_label')}
              </p>
            )}
          </div>
        </div>

        {/* SELECT mode */}
        {mode === 'select' && (
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => { setMode('staff'); setError('') }}
              className="w-full flex items-center gap-4 p-5 rounded-2xl transition-all active:scale-98"
              style={{
                background: 'var(--color-brand-muted)',
                border: '1.5px solid var(--color-brand)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-brand)'}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.2)' }}
              >
                <ShieldCheck size={22} style={{ color: 'var(--color-brand)' }} />
              </div>
              <div className="text-start">
                <p className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {t('entry.staff')}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {language === 'ar' ? 'للموظفين والإدارة' : 'For staff & management'}
                </p>
              </div>
            </button>

            <button
              onClick={() => { setMode('member'); setError('') }}
              className="w-full flex items-center gap-4 p-5 rounded-2xl transition-all active:scale-98"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(34,197,94,0.12)' }}
              >
                <User size={22} style={{ color: 'var(--color-success)' }} />
              </div>
              <div className="text-start">
                <p className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {t('entry.member')}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {language === 'ar' ? 'لمتابعة تقدمك وتمريناتك' : 'Track your workouts & progress'}
                </p>
              </div>
            </button>
          </div>
        )}

        {/* STAFF mode — PIN keypad */}
        {mode === 'staff' && (
          <div
            className="w-full flex flex-col items-center gap-6"
            style={{
              animation: shake ? 'shake 0.5s ease' : 'none',
            }}
          >
            <PinDots length={pin.length} />
            {error && (
              <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
                {error}
              </p>
            )}
            <Keypad onPress={handlePinPress} onDelete={handlePinDelete} />
          </div>
        )}

        {/* MEMBER mode — phone input + keypad */}
        {mode === 'member' && (
          <div
            className="w-full flex flex-col items-center gap-5"
            style={{
              animation: shake ? 'shake 0.5s ease' : 'none',
            }}
          >
            <PhoneInput
              value={phone}
              onChange={v => { setPhone(v); setError('') }}
              error={error}
              placeholder={t('entry.phone_placeholder')}
            />
            <button
              onClick={handleMemberLogin}
              disabled={phone.length < 5}
              className="w-full h-13 rounded-2xl text-base font-semibold transition-all active:scale-98 disabled:opacity-40"
              style={{
                background: 'var(--color-brand)',
                color: 'white',
                height: '52px',
              }}
            >
              {t('entry.enter')}
            </button>
          </div>
        )}
      </div>

      {/* Bottom spacer */}
      <div className="h-4" />

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-5px); }
          80%       { transform: translateX(5px); }
        }
      `}</style>
    </div>
  )
}
