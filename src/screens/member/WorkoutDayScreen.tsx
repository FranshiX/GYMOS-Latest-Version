import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import { useWorkoutPlanStore } from '../../store/useWorkoutPlanStore';
import { useWorkoutLogStore } from '../../store/useWorkoutLogStore';
import { useExerciseStore } from '../../store/useExerciseStore';
import { useMemberStore } from '../../store/useMemberStore';
import { useDirection } from '@/hooks/useDirection';
import { pageVariants, pageTransition, collapseVariants, checkVariants } from '@/utils/variants';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SetLogger } from '@/components/shared/SetLogger';

const WorkoutDayScreen = () => {
  const { phone, dayId } = useParams<{ phone: string; dayId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isRTL } = useDirection();
  const isAr = i18n.language === 'ar';

  const { plans } = useWorkoutPlanStore();
  const { getLogsForMember, startLog, finishLog } = useWorkoutLogStore();
  const { exercises } = useExerciseStore();
  const { members } = useMemberStore();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [collapsedExercises, setCollapsedExercises] = useState<Set<string>>(new Set());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const sessionStartedRef = useRef(false);

  const member = useMemo(
    () => members.find((m: any) => m.phone === phone),
    [members, phone]
  );

  const day = useMemo(() => {
    for (const plan of plans) {
      const found = plan.days.find((d: any) => d.id === dayId);
      if (found) return { ...found, planId: plan.id } as { planId: string; [key: string]: any };
    }
    return null;
  }, [plans, dayId]);

  // Start workout session on mount
  useEffect(() => {
    if (!phone || !day || sessionStartedRef.current || !member) return;
    sessionStartedRef.current = true;
    const planId = (day as { planId: string }).planId;
    // @ts-ignore - planId is guaranteed to be string by the type assertion above
    const session = startLog(member.id, planId, dayId);
    setSessionId(session.id);
  }, [phone, day, dayId, startLog, member]);

  // Session timer - starts when sessionId is set
  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const formatTime = (totalSeconds: number) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const getExerciseName = useCallback((exerciseId: string) => {
    const ex = exercises.find((e: any) => e.id === exerciseId);
    if (!ex) return exerciseId;
    return isAr ? ex.name_ar : ex.name_en;
  }, [exercises, isAr]);

  const getLastSessionData = useCallback((exerciseId: string) => {
    if (!member) return null;
    const today = new Date().toISOString().split('T')[0];
    const allLogs = getLogsForMember(member.id);

    // Filter to logs from previous days that are completed
    const previousLogs = allLogs.filter((log: any) =>
      log.date !== today &&
      log.completedAt &&
      log.exercises.some((ex: any) => ex.exerciseId === exerciseId)
    );

    if (previousLogs.length === 0) return null;

    // Sort by date descending (most recent first)
    previousLogs.sort((a: any, b: any) => b.date.localeCompare(a.date));

    const lastLog = previousLogs[0];
    const exerciseData = lastLog.exercises.find((ex: any) => ex.exerciseId === exerciseId);
    if (!exerciseData) return null;

    return exerciseData.sets;
  }, [member, getLogsForMember]);

  const handleExerciseComplete = useCallback((exerciseId: string) => {
    setCompletedExercises(prev => new Set(prev).add(exerciseId));
    setCollapsedExercises(prev => new Set(prev).add(exerciseId));
    
    // Auto-advance to next exercise after delay
    setTimeout(() => {
      if (currentExerciseIndex < (day?.exercises.length || 0) - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
      }
    }, 500);
  }, [currentExerciseIndex, day?.exercises.length]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  if (!day) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-screen p-4 flex items-center justify-center"
        style={{ background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
      >
        <p style={{ color: 'var(--color-text-tertiary)' }}>{t('workout.no_plan')}</p>
      </motion.div>
    );
  }

  const dayName = isAr ? day.name_ar : day.name_en;
  const totalExercises = day.exercises.length;
  const completedCount = completedExercises.size;
  const progress = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

  // Check if all exercises are completed
  const allExercisesComplete = day.exercises.length > 0 &&
    day.exercises.every((we: any) => completedExercises.has(we.exerciseId));

  // Auto-navigate to SessionCompleteScreen when all exercises are done
  useEffect(() => {
    if (allExercisesComplete && sessionId) {
      finishLog(sessionId);
      navigate(`/member/${phone}/workout/${dayId}/complete`, {
        state: { elapsedSeconds },
        replace: true
      });
    }
  }, [allExercisesComplete, sessionId, phone, dayId, elapsedSeconds, navigate, finishLog]);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
    >
      {/* Session Header */}
      <div
        className="h-14 flex items-center justify-between px-4 sticky top-0 z-40"
        style={{
          background: 'rgba(8,8,8,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <BackIcon size={18} strokeWidth={1.5} />
          </motion.button>
          <h1 className="text-base font-semibold">{dayName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} strokeWidth={1.5} style={{ color: 'var(--color-text-secondary)' }} />
          <span className="text-sm font-mono">{formatTime(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {t('workout.exercise_progress', { current: currentExerciseIndex + 1, total: totalExercises })}
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--color-bg-elevated)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--color-primary)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {day.exercises.map((we: any, index: number) => {
            const isCurrent = index === currentExerciseIndex;
            const isCompleted = completedExercises.has(we.exerciseId);
            const isCollapsed = collapsedExercises.has(we.exerciseId);
            const exerciseName = getExerciseName(we.exerciseId);
            const lastSessionData = getLastSessionData(we.exerciseId);

            return (
              <motion.div
                key={we.exerciseId}
                variants={collapseVariants}
                initial={isCollapsed ? 'collapsed' : 'open'}
                animate={isCollapsed ? 'collapsed' : 'open'}
                transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
              >
                <Card
                  variant={isCurrent ? 'brand' : 'default'}
                  padding="md"
                  className="relative overflow-hidden"
                >
                  {/* Exercise Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--color-text-primary)' }}>
                        {exerciseName}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {t('workout.target_sets_reps', { sets: we.sets, reps: we.reps })}
                      </p>
                    </div>
                    {isCompleted && (
                      <motion.div
                        variants={checkVariants}
                        initial="unchecked"
                        animate="checked"
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: 'var(--color-success)' }}
                      >
                        <CheckCircle size={16} strokeWidth={2} style={{ color: 'var(--text-inverse)' }} />
                      </motion.div>
                    )}
                  </div>

                  {/* Set Logger - Only show for current exercise */}
                  {isCurrent && !isCompleted && (
                    <SetLogger
                      sessionId={sessionId || undefined}
                      exerciseId={we.exerciseId}
                      targetSets={we.sets}
                      targetReps={we.reps}
                      onComplete={() => handleExerciseComplete(we.exerciseId)}
                    />
                  )}

                  {/* Last Session Comparison */}
                  {lastSessionData && lastSessionData.length > 0 && (
                    <div
                      className="mt-3 pt-3 border-t"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <p className="text-xs mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                        {t('workout.last_session')}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {lastSessionData.slice(0, 3).map((set: any, i: number) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              background: 'var(--color-bg-elevated)',
                              color: 'var(--color-text-secondary)',
                            }}
                          >
                            {set.weight}kg × {set.reps}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Collapsed State */}
                  {isCollapsed && isCompleted && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                      <p className="text-sm" style={{ color: 'var(--color-success)' }}>
                        {t('workout.completed')}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
            disabled={currentExerciseIndex === 0}
          >
            {t('common.previous')}
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={() => setCurrentExerciseIndex(Math.min(totalExercises - 1, currentExerciseIndex + 1))}
            disabled={currentExerciseIndex === totalExercises - 1}
          >
            {t('common.next')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default WorkoutDayScreen;