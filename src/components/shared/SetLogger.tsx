import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Plus } from 'lucide-react'
import { checkVariants } from '@/utils/variants'
import { useWorkoutLogStore } from '@/store/useWorkoutLogStore'

interface SetLoggerProps {
  sessionId?: string
  exerciseId?: string
  onComplete?: () => void
  targetSets?: number
  targetReps?: number
}

interface SetRow {
  setNumber: number
  weight: number
  reps: number
  completed: boolean
}

export function SetLogger({ sessionId, exerciseId, onComplete, targetSets = 3, targetReps = 10 }: SetLoggerProps) {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const updateSetLog = useWorkoutLogStore((s: any) => s.updateSetLog)
  const addExerciseLog = useWorkoutLogStore((s: any) => s.addExerciseLog)

  const [rows, setRows] = useState<SetRow[]>(() => 
    Array.from({ length: targetSets }, (_, i) => ({
      setNumber: i + 1,
      weight: 0,
      reps: targetReps,
      completed: false,
    }))
  )

  const allCompleted = rows.every(r => r.completed)

  useEffect(() => {
    if (allCompleted && onComplete) {
      onComplete()
    }
  }, [allCompleted, onComplete])

  // Ensure exercise log exists in the session
  useEffect(() => {
    if (sessionId && exerciseId) {
      // Add exercise log if not already present
      addExerciseLog(sessionId, {
        exerciseId,
        sets: rows.map(r => ({
          setNumber: r.setNumber,
          weight: r.weight,
          reps: r.reps,
          completed: r.completed,
        })),
      })
    }
  }, [sessionId, exerciseId])

  const update = (index: number, field: 'weight' | 'reps', value: number) => {
    setRows(prev => {
      const updated = prev.map((r, i) => {
        if (i !== index) return r
        const newRow = { ...r, [field]: value, completed: false }
        
        // Write to store when weight or reps change
        if (sessionId && exerciseId) {
          updateSetLog(
            sessionId,
            exerciseId,
            r.setNumber,
            { weight: newRow.weight, reps: newRow.reps, completed: false }
          )
        }
        
        return newRow
      })
      return updated
    })
  }

  const toggleComplete = (index: number) => {
    setRows(prev => prev.map((r, i) => {
      if (i !== index) return r
      const newCompleted = !r.completed
      const newWeight = (newCompleted && r.weight === 0) ? 20 : r.weight
      
      // Write to store when set is completed or uncompleted
      if (sessionId && exerciseId) {
        updateSetLog(
          sessionId,
          exerciseId,
          r.setNumber,
          { weight: newWeight, reps: r.reps, completed: newCompleted }
        )
      }
      
      return { ...r, weight: newWeight, completed: newCompleted }
    }))
  }

  const addRow = () => {
    setRows(prev => [
      ...prev,
      { setNumber: prev.length + 1, weight: prev[prev.length - 1]?.weight || 0, reps: targetReps, completed: false },
    ])
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-default)' }}
    >
      {/* Header */}
      <div
        className="grid grid-cols-12 gap-2 px-4 py-2"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="col-span-2 text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
          {isAr ? 'مجموعة' : 'Set'}
        </div>
        <div className="col-span-4 text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
          {isAr ? 'وزن (كغ)' : 'Weight (kg)'}
        </div>
        <div className="col-span-4 text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
          {isAr ? 'تكرار' : 'Reps'}
        </div>
        <div className="col-span-2" />
      </div>

      {/* Set Rows */}
      <AnimatePresence mode="popLayout">
        {rows.map((row, i) => (
          <motion.div
            key={row.setNumber}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center"
            style={{
              borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              background: row.completed ? 'var(--color-success-dim)' : 'transparent',
            }}
          >
            <div className="col-span-2 text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
              {row.setNumber}
            </div>
            <div className="col-span-4">
              <input
                type="number"
                min="0"
                step="2.5"
                value={row.weight || ''}
                onChange={e => update(i, 'weight', parseFloat(e.target.value) || 0)}
                placeholder="0"
                disabled={row.completed}
                className="w-full text-center text-sm rounded-lg py-2 px-2 outline-none transition-all"
                style={{
                  background: row.completed ? 'var(--color-bg-card)' : 'var(--color-bg-card)',
                  border: `1px solid ${row.completed ? 'var(--color-success)' : 'var(--border-default)'}`,
                  color: 'var(--color-text-primary)',
                  opacity: row.completed ? 0.6 : 1,
                }}
              />
            </div>
            <div className="col-span-4">
              <input
                type="number"
                min="0"
                step="1"
                value={row.reps || ''}
                onChange={e => update(i, 'reps', parseInt(e.target.value) || 0)}
                placeholder="0"
                disabled={row.completed}
                className="w-full text-center text-sm rounded-lg py-2 px-2 outline-none transition-all"
                style={{
                  background: row.completed ? 'var(--color-bg-card)' : 'var(--color-bg-card)',
                  border: `1px solid ${row.completed ? 'var(--color-success)' : 'var(--border-default)'}`,
                  color: 'var(--color-text-primary)',
                  opacity: row.completed ? 0.6 : 1,
                }}
              />
            </div>
            <div className="col-span-2 flex justify-center">
              <motion.button
                variants={checkVariants}
                initial={row.completed ? 'unchecked' : 'unchecked'}
                animate={row.completed ? 'checked' : 'unchecked'}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleComplete(i)}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all"
                style={
                  row.completed
                    ? { background: 'var(--color-success)', borderColor: 'var(--color-success)' }
                    : { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }
                }
              >
                {row.completed ? (
                  <CheckCircle size={14} strokeWidth={2.5} style={{ color: 'var(--text-inverse)' }} />
                ) : (
                  <div className="w-3 h-3 rounded-full" style={{ background: 'transparent' }} />
                )}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add Set Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={addRow}
        className="w-full py-3 text-sm font-medium transition-all flex items-center justify-center gap-2"
        style={{ color: 'var(--color-primary)', borderTop: '1px solid var(--border-subtle)' }}
      >
        <Plus size={16} strokeWidth={1.5} />
        {isAr ? 'إضافة مجموعة' : 'Add Set'}
      </motion.button>
    </div>
  )
}