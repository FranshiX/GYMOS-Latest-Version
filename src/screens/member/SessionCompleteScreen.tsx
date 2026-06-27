import { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Dumbbell, CheckCircle, ChevronLeft } from 'lucide-react';
import { useWorkoutPlanStore } from '../../store/useWorkoutPlanStore';
import { useWorkoutLogStore } from '../../store/useWorkoutLogStore';
import { useMemberStore } from '../../store/useMemberStore';
import { pageVariants, pageTransition, celebrationVariants } from '@/utils/variants';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';

const SessionCompleteScreen = () => {
  const { phone, dayId } = useParams<{ phone: string; dayId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const { plans } = useWorkoutPlanStore();
  const { getLogsForMember } = useWorkoutLogStore();
  const { members } = useMemberStore();
  const [perceivedExertion, setPerceivedExertion] = useState<'easy' | 'moderate' | 'hard' | 'very_hard' | null>(null);
  const [notes, setNotes] = useState('');

  const member = useMemo(
    () => members.find((m: any) => m.phone === phone),
    [members, phone]
  );

  const day = useMemo(() => {
    for (const plan of plans) {
      const found = plan.days.find((d: any) => d.id === dayId);
      if (found) return found;
    }
    return null;
  }, [plans, dayId]);

  const todayLogs = useMemo(() => {
    if (!member) return [];
    const today = new Date().toISOString().slice(0, 10);
    return getLogsForMember(member.id).filter((log: any) => log.date.slice(0, 10) === today);
  }, [member, getLogsForMember]);

  const sessionStats = useMemo(() => {
    if (!todayLogs.length || !day) return null;

    const log = todayLogs[0];
    const totalSets = log.exercises.reduce((acc: number, ex: any) => acc + ex.sets.length, 0);
    const completedSets = log.exercises.reduce((acc: number, ex: any) =>
      acc + ex.sets.filter((s: any) => s.completed).length, 0
    );
    const totalVolume = log.exercises.reduce((acc: number, ex: any) =>
      acc + ex.sets.reduce((setAcc: number, s: any) => setAcc + (s.weight * s.reps), 0), 0
    );

    // Get real duration from route state (passed from WorkoutDayScreen)
    const elapsedSeconds = location.state?.elapsedSeconds;
    const duration = elapsedSeconds !== undefined ? Math.round(elapsedSeconds / 60) : null;

    return {
      duration,
      volume: totalVolume,
      totalExercises: day.exercises.length,
      completedExercises: log.exercises.length,
      totalSets,
      completedSets,
    };
  }, [todayLogs, day, location.state]);

  const dayName = useMemo(() => {
    if (!day) return '';
    return isAr ? day.name_ar : day.name_en;
  }, [day, isAr]);

  const exertionOptions = [
    { value: 'easy', label: isAr ? 'سهل' : 'Easy', color: 'var(--color-success)' },
    { value: 'moderate', label: isAr ? 'متوسط' : 'Moderate', color: 'var(--color-secondary)' },
    { value: 'hard', label: isAr ? 'صعب' : 'Hard', color: 'var(--color-warning)' },
    { value: 'very_hard', label: isAr ? 'صعب جداً' : 'Very Hard', color: 'var(--color-danger)' },
  ];

  const handleBackToHome = () => {
    navigate(`/member/${phone}`);
  };

  if (!day || !sessionStats) {
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
        <p style={{ color: 'var(--color-text-tertiary)' }}>{t('workout.no_session_data')}</p>
      </motion.div>
    );
  }

  const progress = sessionStats.totalSets > 0 
    ? (sessionStats.completedSets / sessionStats.totalSets) * 100 
    : 0;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen flex flex-col"
      data-screen="session-complete"
      style={{ background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
    >
      {/* Celebration Header */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          variants={celebrationVariants}
          initial="initial"
          animate="animate"
          className="mb-6"
        >
          <ProgressRing
            progress={progress}
            size={180}
            strokeWidth={12}
            color="var(--color-primary)"
            backgroundColor="var(--color-bg-elevated)"
          >
            <div className="text-center">
              <motion.div
                variants={celebrationVariants}
                initial="initial"
                animate="animate"
                className="text-4xl mb-1"
              >
                🎉
              </motion.div>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {Math.round(progress)}%
              </div>
            </div>
          </ProgressRing>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-2xl font-bold mb-2 text-center"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {t('workout.session_complete')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-lg mb-8 text-center"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {dayName}
        </motion.p>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="grid grid-cols-2 gap-3 w-full max-w-sm mb-6"
        >
          <Card variant="elevated" padding="md">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} strokeWidth={1.5} style={{ color: 'var(--color-secondary)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {t('workout.duration')}
              </span>
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {sessionStats.duration !== null ? `${sessionStats.duration} ${t('common.min')}` : '--'}
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell size={18} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {t('workout.volume')}
              </span>
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {sessionStats.volume.toLocaleString()} kg
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={18} strokeWidth={1.5} style={{ color: 'var(--color-success)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {t('workout.exercises')}
              </span>
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {sessionStats.completedExercises} / {sessionStats.totalExercises}
            </div>
          </Card>

          <Card variant="elevated" padding="md">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} strokeWidth={1.5} style={{ color: 'var(--color-warning)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {t('workout.sets')}
              </span>
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {sessionStats.completedSets} / {sessionStats.totalSets}
            </div>
          </Card>
        </motion.div>

        {/* Perceived Exertion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="w-full max-w-sm mb-6"
        >
          <p className="text-sm mb-3 text-center" style={{ color: 'var(--color-text-secondary)' }}>
            {t('workout.how_did_it_feel')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {exertionOptions.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPerceivedExertion(option.value as any)}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  perceivedExertion === option.value ? 'ring-2' : ''
                }`}
                style={{
                  background: perceivedExertion === option.value 
                    ? option.color 
                    : 'var(--color-bg-elevated)',
                  color: perceivedExertion === option.value 
                    ? 'var(--text-inverse)' 
                    : 'var(--color-text-primary)',
                  border: perceivedExertion === option.value 
                    ? 'none' 
                    : '1px solid var(--border-default)',
                }}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="w-full max-w-sm mb-6"
        >
          <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            {t('workout.notes_optional')}
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isAr ? 'أضف ملاحظاتك هنا...' : 'Add your notes here...'}
            className="w-full p-4 rounded-xl text-sm outline-none resize-none"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--color-text-primary)',
              minHeight: '80px',
            }}
            rows={3}
          />
        </motion.div>
      </div>

      {/* Back to Home Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        className="p-4"
      >
        <Button
          variant="primary"
          fullWidth
          onClick={handleBackToHome}
          leftIcon={<ChevronLeft size={18} strokeWidth={1.5} />}
        >
          {t('workout.back_to_home')}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default SessionCompleteScreen;
