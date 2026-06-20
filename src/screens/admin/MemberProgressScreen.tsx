import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Activity, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useMemberStore } from '@/store/useMemberStore'
import { useMeasurementStore } from '@/store/useMeasurementStore'
import { useWorkoutLogStore } from '@/store/useWorkoutLogStore'
import { useExerciseStore } from '@/store/useExerciseStore'
import { useDirection } from '@/hooks/useDirection'

export function MemberProgressScreen() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const { isRTL } = useDirection()
  const navigate = useNavigate()
  const isAr = i18n.language === 'ar'

  const member = useMemberStore((s: any) => s.members.find((m: any) => m.id === id))
  const getMeasurementsForMember = useMeasurementStore((s: any) => s.getMeasurementsForMember)
  const getLogsForMember         = useWorkoutLogStore((s: any) => s.getLogsForMember)
  const getStreakForMember       = useWorkoutLogStore((s: any) => s.getStreakForMember)
  const getWeightProgressForExercise = useWorkoutLogStore((s: any) => s.getWeightProgressForExercise)
  const exercises = useExerciseStore((s: any) => s.exercises)

  const measurements = useMemo(() => id ? getMeasurementsForMember(id) : [], [id, getMeasurementsForMember])
  const logs         = useMemo(() => id ? getLogsForMember(id) : [], [id, getLogsForMember])
  const streak       = useMemo(() => id ? getStreakForMember(id) : 0, [id, getStreakForMember])

  const weightData = useMemo(() =>
    measurements.slice(-10)
      .filter((m: any) => m.weight !== undefined)
      .map((m: any) => ({ date: m.date.slice(5), value: m.weight! })),
    [measurements]
  )

  // Unique exercise IDs from logs
  const exerciseIds = useMemo(() => {
    const ids = new Set<string>()
    logs.forEach((log: any) => log.exercises.forEach((ex: any) => ids.add(ex.exerciseId)))
    return [...ids].slice(0, 5)
  }, [logs])

  // Session history
  const sessions = useMemo(() =>
    logs.slice(0, 10).map((log: any) => ({
      date: log.date,
      count: log.exercises.length,
    })),
    [logs]
  )

  if (!member) {
    return (
      <div className="flex items-center justify-center h-full"
        style={{ color: 'var(--color-text-muted)' }}>
        Member not found
      </div>
    )
  }

  return (
    <div data-screen="member-progress" dir={isRTL ? 'rtl' : 'ltr'}
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: 'var(--color-bg-primary)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4"
        style={{ borderBottom: '1px solid var(--color-bg-border)' }}>
        <button onClick={() => navigate(-1)}
          className="p-1.5 rounded-xl"
          style={{ background: 'var(--color-bg-elevated)' }}>
          <ChevronLeft size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {member.fullName}
          </h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {t('workout.progressReport')}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-4 pb-8">
        {/* Streak */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)' }}>
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{streak}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t('workout.streak')}</p>
          </div>
        </div>

        {/* Weight chart */}
        <Section title={t('workout.bodyWeight')}>
          {weightData.length === 0 ? (
            <Empty text={t('measurements.no_data')} />
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} width={30} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', borderRadius: 10, fontSize: 12 }}
                  />
                  <Line dataKey="value" stroke="var(--color-brand)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Section>

        {/* Exercise progress */}
        <Section title={t('workout.exerciseProgress')}>
          {exerciseIds.length === 0 ? (
            <Empty text={t('progress.no_logs')} />
          ) : (
            <div className="flex flex-col gap-4">
              {exerciseIds.map(exId => {
                const ex = exercises.find((e: any) => e.id === exId)
                const data = id ? getWeightProgressForExercise(id, exId).slice(-5) : []
                const chartData = data.map((d: any) => ({ date: d.date.slice(5), value: d.maxWeight }))
                return (
                  <div key={exId}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      {ex ? (isAr ? ex.name_ar : ex.name_en) : exId}
                    </p>
                    {chartData.length < 2 ? (
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>—</p>
                    ) : (
                      <div className="h-28">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }} />
                            <YAxis tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }} width={28} />
                            <Tooltip
                              contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', borderRadius: 8, fontSize: 11 }}
                            />
                            <Line dataKey="value" stroke="var(--color-success)" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        {/* Session history */}
        <Section title={t('workout.sessionHistory')}>
          {sessions.length === 0 ? (
            <Empty text={t('workout.noSessions')} />
          ) : (
            <div className="flex flex-col gap-1">
              {sessions.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: i % 2 === 0 ? 'var(--color-bg-secondary)' : 'transparent' }}>
                  <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    <Calendar size={12} style={{ color: 'var(--color-brand)' }} />
                    {s.date}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <Activity size={11} />
                    {s.count} {t('workout.exercises')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)' }}>
      <p className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-bg-border)' }}>
        {title}
      </p>
      <div className="p-4">{children}</div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>{text}</p>
  )
}