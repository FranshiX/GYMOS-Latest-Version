import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useWorkoutLogStore } from '@/store/useWorkoutLogStore'
import { useMeasurementStore } from '@/store/useMeasurementStore'
import { Card } from '@/components/ui/Card'

interface MonthlyReportCardProps {
  memberId: string
}

export function MonthlyReportCard({ memberId }: MonthlyReportCardProps) {
  const { t } = useTranslation()
  const { getLogsForMember } = useWorkoutLogStore()
  const { getMeasurementsForMember } = useMeasurementStore()

  const stats = useMemo(() => {
    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const logs = getLogsForMember(memberId).filter((l: any) => l.date.startsWith(monthStr))
    const totalSessions = logs.length
    const totalSets = logs.reduce(
      (acc: number, log: any) => acc + log.exercises.reduce((a: number, ex: any) => a + ex.sets.length, 0),
      0
    )
    const bestLift = logs.reduce((max: number, log: any) =>
      log.exercises.reduce((m: number, ex: any) =>
        ex.sets.reduce((mx: number, s: any) => Math.max(mx, s.weight), m), max
      ), 0
    )

    const measurements = getMeasurementsForMember(memberId)
      .filter((m: any) => m.date.startsWith(monthStr))
      .sort((a: any, b: any) => a.date.localeCompare(b.date))

    const weightChange =
      measurements.length >= 2 && measurements[0].weight != null && measurements[measurements.length - 1].weight != null
        ? (measurements[measurements.length - 1].weight! - measurements[0].weight!)
        : null

    return { totalSessions, totalSets, bestLift, weightChange }
  }, [memberId, getLogsForMember, getMeasurementsForMember])

  const kpis = [
    { label: t('widget.sessions'),    value: stats.totalSessions },
    { label: t('widget.sets_logged'), value: stats.totalSets     },
    { label: t('widget.best_lift'),   value: stats.bestLift > 0 ? `${stats.bestLift} kg` : '—' },
    {
      label: t('widget.weight_change'),
      value: stats.weightChange != null
        ? `${stats.weightChange > 0 ? '+' : ''}${stats.weightChange.toFixed(1)} kg`
        : '—',
    },
  ]

  return (
    <Card variant="brand" padding="md">
      <div className="grid grid-cols-2 gap-3">
        {kpis.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-xl font-bold" style={{ color: 'var(--color-brand)' }}>
              {value}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}