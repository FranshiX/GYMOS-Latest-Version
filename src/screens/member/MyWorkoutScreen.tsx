import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, CheckCircle, ChevronRight } from 'lucide-react';
import { useWorkoutPlanStore } from '../../store/useWorkoutPlanStore';
import { useWorkoutLogStore } from '../../store/useWorkoutLogStore';
import { useMemberStore } from '../../store/useMemberStore';
import { pageVariants, pageTransition } from '@/utils/variants';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';

export function MyWorkoutScreen() {
  const { phone } = useParams<{ phone: string }>();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const dir = i18n.dir();
  const navigate = useNavigate();

  const { members } = useMemberStore();
  const { plans } = useWorkoutPlanStore();
  const { getLogsForMember, getStreakForMember } = useWorkoutLogStore();

  const member = useMemo(
    () => members.find((m: any) => m.phone === phone),
    [members, phone]
  );

  const logs = useMemo(
    () => getLogsForMember(member?.id ?? ''),
    [getLogsForMember, member?.id]
  );

  const streak = useMemo(
    () => getStreakForMember(member?.id ?? ''),
    [getStreakForMember, member?.id]
  );

  const customPlan = useMemo(
    () => plans.find((p: any) => p.type === 'CUSTOM' && p.assignedMemberId === member?.id),
    [plans, member?.id]
  );

  const generalPlans = useMemo(
    () => plans.filter((p: any) => p.type === 'GENERAL'),
    [plans]
  );

  const activePlan = customPlan ?? generalPlans[0];

  const handleDayClick = useCallback(
    (dayId: string, planId: string) => {
      navigate(`/member/${phone}/workout/${dayId}?planId=${planId}`);
    },
    [navigate, phone]
  );

  const handleStartWorkout = useCallback(
    (dayId: string, planId: string) => {
      navigate(`/member/${phone}/workout/${dayId}?planId=${planId}`);
    },
    [navigate, phone]
  );

  if (!member) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="flex items-center justify-center h-full"
        dir={dir}
        style={{ background: 'var(--color-bg-base)' }}
      >
        <p style={{ color: 'var(--color-text-tertiary)' }}>
          {isAr ? 'العضو غير موجود' : 'Member not found'}
        </p>
      </motion.div>
    );
  }

  if (!activePlan) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="flex flex-col h-full p-4"
        dir={dir}
        style={{ background: 'var(--color-bg-base)' }}
      >
        <div className="flex flex-col items-center justify-center h-40 gap-3 rounded-xl border border-dashed mt-8">
          <span className="text-4xl">🏋️</span>
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            {t('workout.no_plan')}
          </p>
        </div>
      </motion.div>
    );
  }

  const planName = isAr ? activePlan.name_ar : activePlan.name_en;
  const totalSessions = activePlan.days.length;
  const completedSessions = logs.filter((log: any) => log.workoutPlanId === activePlan.id && log.completedAt).length;
  const totalExercisesCompleted = logs.reduce((acc: number, log: any) => acc + (log.exercises?.length ?? 0), 0);

  const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  // Determine current day (first uncompleted day, or cycle to day 1 if all completed)
  const currentDayIndex = activePlan.days.findIndex((day: any) => {
    return !logs.some((log: any) => log.workoutDayId === day.id && log.completedAt);
  });
  const allDaysCompleted = currentDayIndex === -1;
  const currentDayIndexFinal = allDaysCompleted ? 0 : Math.max(0, currentDayIndex);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="flex flex-col h-full"
      dir={dir}
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Header */}
      <div
        className="px-4 pt-5 pb-3"
        style={{ background: 'var(--color-bg-base)' }}
      >
        <p
          className="text-xs uppercase tracking-wider mb-0.5"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {isAr ? 'مرحباً،' : 'Welcome back,'}
        </p>
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {member.fullName}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 flex flex-col gap-4">
        {/* Stats Card */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4">
            <ProgressRing
              progress={progress}
              size={100}
              strokeWidth={10}
              color="var(--color-primary)"
              backgroundColor="var(--color-bg-elevated)"
            >
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  {Math.round(progress)}%
                </div>
              </div>
            </ProgressRing>
            <div className="flex-1">
              <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                {planName}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar size={16} strokeWidth={1.5} style={{ color: 'var(--color-secondary)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {completedSessions} / {totalSessions} {t('workout.sessions')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} strokeWidth={1.5} style={{ color: 'var(--color-success)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {totalExercisesCompleted} {t('workout.exercises_completed')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} strokeWidth={1.5} style={{ color: 'var(--color-warning)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {streak} {t('workout.day_streak')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Cycle Complete State */}
        {allDaysCompleted && (
          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-4">
              <CheckCircle size={32} style={{ color: 'var(--color-success)' }} />
              <div>
                <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {t('workout.cycle_complete')}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {t('workout.restarting_day_1')}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Workout Days Timeline */}
        <div>
          <p
            className="text-xs font-medium uppercase tracking-wider mb-3"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {t('workout.workout_days')}
          </p>
          <div className="flex flex-col gap-2">
            {activePlan.days.map((day: any, index: number) => {
              const isCompleted = logs.some((log: any) => log.workoutDayId === day.id && !!log.completedAt);
              const isCurrent = index === currentDayIndexFinal;
              const isUpcoming = index > currentDayIndexFinal;
              const dayName = isAr ? day.name_ar : day.name_en;

              return (
                <motion.button
                  key={day.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  onClick={() => handleDayClick(day.id, activePlan.id)}
                  disabled={isUpcoming}
                  className="w-full rounded-xl border transition-all duration-200 p-4 text-start relative overflow-hidden"
                  style={{
                    background: isCurrent 
                      ? 'var(--color-primary-dim)' 
                      : 'var(--color-bg-elevated)',
                    borderColor: isCurrent 
                      ? 'var(--color-primary)' 
                      : isCompleted 
                        ? 'var(--color-success)' 
                        : 'var(--border-default)',
                    opacity: isUpcoming ? 0.5 : 1,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                      {isCompleted ? (
                        <CheckCircle size={18} strokeWidth={2} style={{ color: 'var(--color-success)' }} />
                      ) : isCurrent ? (
                        <ChevronRight size={16} strokeWidth={2} style={{ color: 'var(--color-primary)' }} />
                      ) : (
                        <div className="w-4 h-4 rounded-full" style={{ background: 'var(--color-text-tertiary)' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ 
                          color: isCurrent 
                            ? 'var(--color-primary)' 
                            : 'var(--color-text-primary)' 
                        }}
                      >
                        {dayName}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                        {day.exercises.length} {t('workout.exercises')}
                      </p>
                      {isUpcoming && (
                        <div className="flex items-center gap-1 mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                          <span className="text-xs">{t('workout.complete_previous_first')}</span>
                        </div>
                      )}
                    </div>
                    {isCurrent && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartWorkout(day.id, activePlan.id);
                        }}
                      >
                        {t('workout.start')}
                      </Button>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}