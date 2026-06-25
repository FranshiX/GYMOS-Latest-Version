import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MonthlyReportCard } from '@/components/shared/MonthlyReportCard'
import { ProgressChart } from '@/components/shared/ProgressChart'
import { useMeasurementStore } from '@/store/useMeasurementStore'
import { useWorkoutLogStore } from '@/store/useWorkoutLogStore'
import { useExerciseStore } from '@/store/useExerciseStore'
import { useMemberStore } from '@/store/useMemberStore'
import { pageVariants, pageTransition } from '@/utils/variants'

type Tab = 'overview' | 'exercises' | 'body'

export function MyProgressScreen() {
  const { phone } = useParams<{ phone: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isAr = i18n.language === 'ar'
  const dir = i18n.dir()

  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const members  = useMemberStore((s: any) => s.members)
  const member   = useMemo(() => members.find((m: any) => m.phone === phone), [members, phone])
  const memberId = member?.id ?? phone ?? ''

  const getMeasurementsForMember     = useMeasurementStore((s: any) => s.getMeasurementsForMember)
  const getLogsForMember             = useWorkoutLogStore((s: any) => s.getLogsForMember)
  const getStreakForMember           = useWorkoutLogStore((s: any) => s.getStreakForMember)
  const getWeightProgressForExercise = useWorkoutLogStore((s: any) => s.getWeightProgressForExercise)
  const exercises = useExerciseStore((s: any) => s.exercises)

  const measurements = useMemo(() => getMeasurementsForMember(memberId), [memberId, getMeasurementsForMember])
  const logs         = useMemo(() => getLogsForMember(memberId), [memberId, getLogsForMember])
  const streak       = useMemo(() => getStreakForMember(memberId), [memberId, getStreakForMember])

  const weightData = useMemo(() =>
    measurements.slice(-10)
      .filter((m: any) => m.weight !== undefined)
      .map((m: any) => ({ date: m.date.slice(5), value: m.weight! })),
    [measurements]
  )

  const exerciseIds = useMemo(() => {
    const ids = new Set<string>()
    logs.forEach((log: any) => log.exercises.forEach((ex: any) => ids.add(ex.exerciseId)))
    return [...ids].slice(0, 5)
  }, [logs])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview',  label: t('progress.overview') },
    { key: 'exercises', label: t('progress.exercises') },
    { key: 'body',      label: t('progress.body') },
  ]

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      data-screen="my-progress"
      dir={dir}
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: 'var(--color-bg-base)' }}
    >

      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {t('workout.myProgress')}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 mb-4 p-1 rounded-xl"
        style={{ background: 'var(--color-bg-elevated)' }}>
        {tabs.map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeTab === tab.key ? 'var(--color-bg-card)' : 'transparent',
              color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 px-4 pb-8">
        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <>
            {/* Streak */}
            <Card variant="default" padding="md" className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{streak}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{t('workout.streak')}</p>
              </div>
            </Card>
            <MonthlyReportCard memberId={memberId} />
          </>
        )}

        {/* ── EXERCISES ── */}
        {activeTab === 'exercises' && (
          exerciseIds.length === 0 ? (
            <p className="text-sm text-center py-12" style={{ color: 'var(--color-text-tertiary)' }}>
              {t('progress.no_logs')}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {exerciseIds.map(exId => {
                const ex = exercises.find((e: any) => e.id === exId)
                const data = getWeightProgressForExercise(memberId, exId).slice(-5)
                const chartData = data.map((d: any) => ({ date: d.date.slice(5), value: d.maxWeight }))
                return (
                  <Card key={exId} variant="elevated" padding="md">
                    {chartData.length < 2 ? (
                      <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                        {ex ? (isAr ? ex.name_ar : ex.name_en) : exId}
                      </p>
                    ) : (
                      <ProgressChart
                        data={chartData}
                        label={ex ? (isAr ? ex.name_ar : ex.name_en) : exId}
                        height={128}
                      />
                    )}
                    {chartData.length < 2 && (
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>—</p>
                    )}
                  </Card>
                )
              })}
            </div>
          )
        )}

        {/* ── BODY ── */}
        {activeTab === 'body' && (
          <>
            <Card variant="elevated" padding="md">
              {weightData.length === 0 ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: 'var(--color-text-tertiary)' }}>
                    {t('workout.bodyWeight')}
                  </p>
                  <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-tertiary)' }}>
                    {t('measurements.no_data')}
                  </p>
                </>
              ) : (
                <ProgressChart
                  data={weightData}
                  label={t('workout.bodyWeight')}
                  height={160}
                />
              )}
            </Card>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate(`/member/${phone}/measurements`)}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm font-semibold">
                {t('workout.measurements')}
              </span>
              <ChevronRight size={16} strokeWidth={1.5} />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  )
}