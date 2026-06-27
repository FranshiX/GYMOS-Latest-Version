import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, X, Save, Trash2, Search, Users } from 'lucide-react'
import { useWorkoutPlanStore } from '@/store/useWorkoutPlanStore'
import { useExerciseStore } from '@/store/useExerciseStore'
import { useMemberStore } from '@/store/useMemberStore'
import { useDirection } from '@/hooks/useDirection'
import { pageVariants, pageTransition } from '@/utils/variants'
import { Card } from '@/components/ui/Card'
import type { WorkoutDay, WorkoutExercise } from '@/domain/workout/types'
import type { Exercise } from '@/domain/exercise/types'

export function WorkoutPlanBuilder() {
  const { planId } = useParams<{ planId: string }>()
  const { t, i18n } = useTranslation()
  const { isRTL } = useDirection()
  const navigate = useNavigate()
  const isAr = i18n.language === 'ar'

  const plan       = useWorkoutPlanStore((s: any) => s.plans.find((p: any) => p.id === planId))
  const updatePlan = useWorkoutPlanStore((s: any) => s.updatePlan)
  const addDay     = useWorkoutPlanStore((s: any) => s.addDay)
  const updateDay  = useWorkoutPlanStore((s: any) => s.updateDay)
  const deleteDay  = useWorkoutPlanStore((s: any) => s.deleteDay)
  const addExerciseToDay      = useWorkoutPlanStore((s: any) => s.addExerciseToDay)
  const updateExerciseInDay   = useWorkoutPlanStore((s: any) => s.updateExerciseInDay)
  const removeExerciseFromDay = useWorkoutPlanStore((s: any) => s.removeExerciseFromDay)

  const exercises = useExerciseStore((s: any) => s.exercises)
  const members = useMemberStore((s: any) => s.members)

  const [editingName, setEditingName]     = useState(false)
  const [nameAr, setNameAr]               = useState(plan?.name_ar ?? '')
  const [nameEn, setNameEn]               = useState(plan?.name_en ?? '')
  const [confirmDayId, setConfirmDayId]   = useState<string | null>(null)
  const [pickerDayId, setPickerDayId]     = useState<string | null>(null)
  const [exSearch, setExSearch]           = useState('')
  const [programType, setProgramType]     = useState<'general' | 'private'>(plan?.type || 'general')
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(plan?.assignedMemberId || null)

  const filteredExercises = useMemo(() => {
    const q = exSearch.toLowerCase()
    return exercises.filter((e: any) =>
      e.name_ar.includes(q) || e.name_en.toLowerCase().includes(q)
    )
  }, [exercises, exSearch])

  const handleSaveName = useCallback(() => {
    if (!planId) return
    updatePlan(planId, { name_ar: nameAr, name_en: nameEn, type: programType, assignedMemberId: selectedMemberId })
    setEditingName(false)
  }, [planId, nameAr, nameEn, programType, selectedMemberId, updatePlan])

  const handleAddDay = useCallback(() => {
    if (!planId) return
    const num = (plan?.days.length ?? 0) + 1
    addDay(planId, {
      dayNumber: num,
      name_ar: t('builder.day_name', { num }),
      name_en: t('builder.day_name_en', { num }),
      // exercises: [],
    })
  }, [planId, plan, addDay, t])

  const handleDayNameChange = useCallback((dayId: string, field: 'name_ar' | 'name_en', val: string) => {
    if (!planId) return
    updateDay(planId, dayId, { [field]: val })
  }, [planId, updateDay])

  const handleDeleteDay = useCallback((dayId: string) => {
    if (!planId) return
    deleteDay(planId, dayId)
    setConfirmDayId(null)
  }, [planId, deleteDay])

  const handleAddExercise = useCallback((dayId: string, ex: Exercise) => {
    if (!planId) return
    addExerciseToDay(planId, dayId, {
      exerciseId: ex.id,
      sets: 3,
      reps: 10,
      restSeconds: 60,
    })
    setPickerDayId(null)
    setExSearch('')
  }, [planId, addExerciseToDay])

  const handleExUpdate = useCallback((
    dayId: string, exId: string,
    field: 'sets' | 'reps' | 'restSeconds', val: number
  ) => {
    if (!planId) return
    updateExerciseInDay(planId, dayId, exId, { [field]: val })
  }, [planId, updateExerciseInDay])

  const handleRemoveEx = useCallback((dayId: string, exId: string) => {
    if (!planId) return
    removeExerciseFromDay(planId, dayId, exId)
  }, [planId, removeExerciseFromDay])

  if (!plan) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="flex items-center justify-center h-full"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {t('builder.plan_not_found')}
      </motion.div>
    )
  }

  const planName = isAr ? plan.name_ar : plan.name_en
  const BackIcon = isRTL ? ChevronRight : ChevronLeft

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="flex flex-col h-full overflow-y-auto"
      data-screen="workout-plan-builder"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Header */}
      <div
        className="h-14 flex items-center gap-3 px-4 sticky top-0 z-40"
        style={{
          background: 'rgba(8,8,8,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/admin/workouts')}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <BackIcon size={18} strokeWidth={1.5} />
        </motion.button>

        {editingName ? (
          <div className="flex-1 flex gap-2">
            <input
              value={nameAr}
              onChange={e => setNameAr(e.target.value)}
              placeholder={isAr ? 'الاسم بالعربية' : 'Arabic name'}
              className="flex-1 px-3 py-1.5 rounded-xl text-sm outline-none"
              style={{
                background: 'var(--color-bg-elevated)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-primary)',
              }}
            />
            <input
              value={nameEn}
              onChange={e => setNameEn(e.target.value)}
              placeholder={isAr ? 'الاسم بالإنجليزية' : 'English name'}
              className="flex-1 px-3 py-1.5 rounded-xl text-sm outline-none"
              style={{
                background: 'var(--color-bg-elevated)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--border-default)',
              }}
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSaveName}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--color-primary)', color: 'var(--text-inverse)' }}
            >
              <Save size={16} strokeWidth={1.5} />
            </motion.button>
          </div>
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="flex-1 text-start text-base font-semibold truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {planName}
          </button>
        )}
      </div>

      {/* Program Type Toggle */}
      <div className="px-4 py-3">
        <div className="flex gap-2 mb-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setProgramType('general')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              programType === 'general' ? 'ring-2' : ''
            }`}
            style={{
              background: programType === 'general' ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
              color: programType === 'general' ? 'var(--text-inverse)' : 'var(--color-text-primary)',
              border: programType === 'general' ? 'none' : '1px solid var(--border-default)',
            }}
          >
            {t('builder.general')}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setProgramType('private')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              programType === 'private' ? 'ring-2' : ''
            }`}
            style={{
              background: programType === 'private' ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
              color: programType === 'private' ? 'var(--text-inverse)' : 'var(--color-text-primary)',
              border: programType === 'private' ? 'none' : '1px solid var(--border-default)',
            }}
          >
            {t('builder.private')}
          </motion.button>
        </div>

        {/* Member Selector for Private Programs */}
        {programType === 'private' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2"
          >
            <Users size={16} strokeWidth={1.5} style={{ color: 'var(--color-text-tertiary)' }} />
            <select
              value={selectedMemberId || ''}
              onChange={e => setSelectedMemberId(e.target.value || null)}
              className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: 'var(--color-bg-elevated)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--border-default)',
              }}
            >
              <option value="">{t('builder.select_member')}</option>
              {members.map((member: any) => (
                <option key={member.id} value={member.id}>
                  {member.fullName}
                </option>
              ))}
            </select>
          </motion.div>
        )}
      </div>

      {/* Days */}
      <div className="flex flex-col gap-4 p-4 pb-8">
        <AnimatePresence mode="popLayout">
          {plan.days.map((day: any, index: number) => (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              <DayCard
                day={day}
                isAr={isAr}
                exercises={exercises}
                t={t}
                onDayNameChange={(field, val) => handleDayNameChange(day.id, field, val)}
                onDeleteDay={() => setConfirmDayId(day.id)}
                onAddExercise={() => { setPickerDayId(day.id); setExSearch('') }}
                onExUpdate={(exId, field, val) => handleExUpdate(day.id, exId, field, val)}
                onRemoveEx={exId => handleRemoveEx(day.id, exId)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Day */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleAddDay}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px dashed var(--border-default)',
            color: 'var(--color-text-tertiary)',
          }}
        >
          <Plus size={16} strokeWidth={1.5} />
          {t('builder.add_day')}
        </motion.button>
      </div>

      {/* Delete day confirm */}
      <AnimatePresence>
        {confirmDayId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setConfirmDayId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mx-6 rounded-2xl p-5 flex flex-col gap-4"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--border-default)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <p className="text-sm font-semibold text-center" style={{ color: 'var(--color-text-primary)' }}>
                {t('builder.delete_day_confirm')}
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteDay(confirmDayId)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--color-danger)', color: 'var(--text-inverse)' }}
                >
                  {t('common.confirm')}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setConfirmDayId(null)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  {t('common.cancel')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise picker */}
      {pickerDayId && (
        <div className="fixed inset-0 z-50 flex flex-col"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setPickerDayId(null)}>
          <div className="mt-auto mx-0 rounded-t-3xl flex flex-col max-h-[75vh]"
            style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--color-bg-border)' }}>
              <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
              <input autoFocus
                value={exSearch}
                onChange={e => setExSearch(e.target.value)}
                placeholder={t('builder.search_exercise_placeholder')}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: 'var(--color-text-primary)' }} />
              <button onClick={() => setPickerDayId(null)}>
                <X size={18} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-3 flex flex-col gap-2">
              {filteredExercises.map((ex: any) => (
                <button key={ex.id}
                  onClick={() => handleAddExercise(pickerDayId, ex)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-start transition-all active:scale-98"
                  style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-border)' }}>
                  <span className="text-sm font-medium flex-1" style={{ color: 'var(--color-text-primary)' }}>
                    {isAr ? ex.name_ar : ex.name_en}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}>
                    {ex.muscleGroup}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ── DayCard ──────────────────────────────────────────────
interface DayCardProps {
  day: WorkoutDay
  isAr: boolean
  exercises: Exercise[]
  t: (key: string) => string
  onDayNameChange: (field: 'name_ar' | 'name_en', val: string) => void
  onDeleteDay: () => void
  onAddExercise: () => void
  onExUpdate: (exId: string, field: 'sets' | 'reps' | 'restSeconds', val: number) => void
  onRemoveEx: (exId: string) => void
}

function DayCard({ day, isAr, exercises, t, onDayNameChange, onDeleteDay, onAddExercise, onExUpdate, onRemoveEx }: DayCardProps) {
  const dayName = isAr ? day.name_ar : day.name_en

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      {/* Day header */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <input
          value={dayName}
          onChange={e => onDayNameChange(isAr ? 'name_ar' : 'name_en', e.target.value)}
          className="flex-1 bg-transparent text-sm font-semibold outline-none"
          style={{ color: 'var(--color-text-primary)' }}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onDeleteDay}
          className="p-2 rounded-lg transition-all"
          style={{ background: 'var(--color-danger-dim)' }}
        >
          <Trash2 size={13} strokeWidth={1.5} style={{ color: 'var(--color-danger)' }} />
        </motion.button>
      </div>

      {/* Exercises */}
      <div className="flex flex-col">
        {day.exercises.map(ex => (
          <ExerciseRow
            key={ex.id}
            ex={ex}
            isAr={isAr}
            exercises={exercises}
            t={t}
            onUpdate={(field, val) => onExUpdate(ex.id, field, val)}
            onRemove={() => onRemoveEx(ex.id)}
          />
        ))}
      </div>

      {/* Add exercise */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onAddExercise}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all"
        style={{
          color: 'var(--color-primary)',
          borderTop: day.exercises.length > 0 ? '1px solid var(--border-subtle)' : 'none',
        }}
      >
        <Plus size={14} strokeWidth={1.5} />
        {t('builder.add_exercise')}
      </motion.button>
    </Card>
  )
}

// ── ExerciseRow ───────────────────────────────────────────
interface ExerciseRowProps {
  ex: WorkoutExercise
  isAr: boolean
  exercises: Exercise[]
  t: (key: string) => string
  onUpdate: (field: 'sets' | 'reps' | 'restSeconds', val: number) => void
  onRemove: () => void
}

function ExerciseRow({ ex, isAr, exercises, t, onUpdate, onRemove }: ExerciseRowProps) {
  const exercise = exercises.find(e => e.id === ex.exerciseId)
  const name = exercise ? (isAr ? exercise.name_ar : exercise.name_en) : ex.exerciseId

  return (
    <div
      className="flex flex-col gap-2 px-4 py-3"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center gap-2">
        <span className="flex-1 text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
          {name}
        </span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className="p-2 rounded-lg transition-all"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          <X size={14} strokeWidth={1.5} />
        </motion.button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {([
          { field: 'sets' as const, label: t('builder.sets'), value: ex.sets },
          { field: 'reps' as const, label: t('builder.reps'), value: ex.reps },
          { field: 'restSeconds' as const, label: t('builder.rest'), value: ex.restSeconds },
        ]).map(({ field, label, value }) => (
          <div key={field} className="flex flex-col gap-1">
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{label}</span>
            <input
              type="number"
              value={value}
              onChange={e => onUpdate(field, Number(e.target.value))}
              className="w-full px-2 py-1.5 rounded-lg text-sm text-center outline-none"
              style={{
                background: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--border-default)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

