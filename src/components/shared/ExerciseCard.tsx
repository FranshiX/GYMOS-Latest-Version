import { useTranslation } from 'react-i18next'
import { Exercise, MuscleGroup } from '../../domain/exercise/types'

const muscleColors: Record<MuscleGroup, string> = {
  CHEST:     'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  BACK:      'bg-sky-500/10 text-sky-400 border-sky-500/20',
  SHOULDERS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  ARMS:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  LEGS:      'bg-red-500/10 text-red-400 border-red-500/20',
  CORE:      'bg-pink-500/10 text-pink-400 border-pink-500/20',
}

const muscleLabels: Record<MuscleGroup, { ar: string; en: string }> = {
  CHEST:     { ar: 'الصدر',   en: 'Chest' },
  BACK:      { ar: 'الظهر',   en: 'Back' },
  SHOULDERS: { ar: 'الكتف',   en: 'Shoulders' },
  ARMS:      { ar: 'الأذرع',  en: 'Arms' },
  LEGS:      { ar: 'الأرجل',  en: 'Legs' },
  CORE:      { ar: 'الكور',   en: 'Core' },
}

interface ExerciseCardProps {
  exercise: Exercise
  onClick?: () => void
  selected?: boolean
  showEquipment?: boolean
  compact?: boolean
}

export function ExerciseCard({
  exercise,
  onClick,
  selected = false,
  showEquipment = true,
  compact = false,
}: ExerciseCardProps) {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  const name = isAr ? exercise.name_ar : exercise.name_en
  const colorClass = muscleColors[exercise.muscleGroup]
  const muscleLabel = isAr
    ? muscleLabels[exercise.muscleGroup].ar
    : muscleLabels[exercise.muscleGroup].en

  return (
    <div
      onClick={onClick}
      className={[
        'rounded-xl border transition-all duration-150',
        compact ? 'p-3' : 'p-4',
        onClick ? 'cursor-pointer' : '',
        selected
          ? 'border-indigo-500 bg-indigo-500/5'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={[
            'font-medium text-white truncate',
            compact ? 'text-sm' : 'text-base',
          ].join(' ')}>
            {name}
          </p>
          {showEquipment && !compact && (
            <p className="text-xs text-white/40 mt-0.5 truncate">
              {exercise.equipment}
            </p>
          )}
        </div>
        <span className={[
          'shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border',
          colorClass,
        ].join(' ')}>
          {muscleLabel}
        </span>
      </div>

      {selected && (
        <div className="mt-2 flex items-center gap-1 text-indigo-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-xs font-medium">
            {isAr ? 'محدد' : 'Selected'}
          </span>
        </div>
      )}
    </div>
  )
}