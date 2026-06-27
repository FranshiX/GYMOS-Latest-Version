import { useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useExerciseStore } from '../../store/useExerciseStore';
import { useWorkoutLogStore } from '../../store/useWorkoutLogStore';
import { useMemberStore } from '../../store/useMemberStore';
import { SetLogger } from '@/components/shared/SetLogger';

const ExerciseDetailScreen: React.FC = () => {
  const { phone, id } = useParams<{ phone: string; id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const isAr = i18n.language === 'ar';

  const member = useMemberStore(s => s.members.find(m => m.phone === phone));

  const { exercises } = useExerciseStore();
  const exercise = useMemo(
    () => exercises.find((e: any) => e.id === id) ?? null,
    [exercises, id]
  );

  const { getLogsForMember } = useWorkoutLogStore();
  const prevSessions = useMemo(() => {
    if (!member || !id) return [];
    const logs = getLogsForMember(member.id);
    return logs
      .filter((log: any) => log.exercises.some((ex: any) => ex.exerciseId === id))
      .slice(-3)
      .reverse()
      .map((log: any) => {
        const exerciseLog = log.exercises.find((ex: any) => ex.exerciseId === id);
        return {
          id: log.id,
          date: log.date,
          sets: exerciseLog?.sets ?? [],
        };
      });
  }, [member, id, getLogsForMember]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  if (!exercise) {
    return (
      <div
        data-screen="exercise-detail"
        dir={dir}
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
      >
        <p style={{ color: 'var(--color-text-muted)' }}>{t('workout.no_plan')}</p>
      </div>
    );
  }

  const exerciseName = isAr ? exercise.name_ar : exercise.name_en;
  const exerciseDescription = isAr ? exercise.description_ar : exercise.description_en;

  return (
    <div
      data-screen="exercise-detail"
      dir={dir}
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 border-b"
        style={{ borderColor: 'var(--color-bg-border)' }}
      >
        <button
          onClick={handleBack}
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)' }}
          aria-label="Back"
        >
          ‹
        </button>
        <h1 className="font-bold text-lg flex-1" style={{ color: 'var(--color-text-primary)' }}>
          {exerciseName}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          <span
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: 'var(--color-brand-muted)', color: 'var(--color-brand)' }}
          >
            {exercise.muscleGroup}
          </span>
          {exercise.equipment && (
            <span
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{
                background: 'var(--color-bg-elevated)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-bg-border)',
              }}
            >
              {exercise.equipment}
            </span>
          )}
        </div>

        {/* Video area */}
        <div
          className="rounded-2xl overflow-hidden aspect-video flex items-center justify-center"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-bg-border)',
          }}
        >
          {exercise.videoUrl ? (
            <a
              href={exercise.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sm underline"
              style={{ color: 'var(--color-brand)' }}
            >
              {t('exercise.video_link')}
            </a>
          ) : (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {isAr ? 'الفيديو غير متاح' : 'Video unavailable'}
            </span>
          )}
        </div>

        {/* Description */}
        {exerciseDescription && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {exerciseDescription}
          </p>
        )}

        {/* Set logger */}
        {member && id && <SetLogger exerciseId={id} />}

        {/* Previous sessions */}
        {prevSessions.length > 0 && (
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {t('exercise.prev_sessions')}
            </p>
            <div className="flex flex-col gap-2">
              {prevSessions.map((session: any) => (
                <div
                  key={session.id}
                  className="rounded-xl p-3 border"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    borderColor: 'var(--color-bg-border)',
                  }}
                >
                  <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    {session.date.slice(0, 10)}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {session.sets.map((set: any) => (
                      <span
                        key={set.setNumber}
                        className="text-xs"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        Set {set.setNumber}: {set.weight}kg × {set.reps}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseDetailScreen;