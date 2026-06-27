import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Dumbbell, Trash2 } from 'lucide-react';
import { useExerciseStore } from '../../store/useExerciseStore';
import { ExerciseCard } from '../../components/shared/ExerciseCard';
import { Modal } from '../../components/ui/Modal';
import type { MuscleGroup } from '../../domain/exercise/types';

const MUSCLE_GROUPS: { key: MuscleGroup; ar: string; en: string }[] = [
  { key: 'CHEST',     ar: 'الصدر',  en: 'Chest'     },
  { key: 'BACK',      ar: 'الظهر',  en: 'Back'       },
  { key: 'SHOULDERS', ar: 'الكتف',  en: 'Shoulders'  },
  { key: 'ARMS',      ar: 'الأذرع', en: 'Arms'       },
  { key: 'LEGS',      ar: 'الأرجل', en: 'Legs'       },
  { key: 'CORE',      ar: 'الكور',  en: 'Core'       },
];

const EMPTY_FORM = {
  name_ar: '',
  name_en: '',
  muscleGroup: 'CHEST' as MuscleGroup,
  equipment: '',
  videoUrl: '',
  description_ar: '',
  description_en: '',
  targetMuscles: [] as string[],
};

export function ExerciseLibraryScreen() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const dir = i18n.dir();
  const { exercises, addExercise, deleteExercise } = useExerciseStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MuscleGroup | 'ALL'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return exercises.filter((e: any) => {
      const matchGroup = filter === 'ALL' || e.muscleGroup === filter;
      const name = isAr ? e.name_ar : e.name_en;
      const matchSearch = name.toLowerCase().includes(search.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [exercises, filter, search, isAr]);

  const handleAdd = useCallback(() => {
    if (!form.name_ar || !form.name_en || !form.equipment) return;
    addExercise(form);
    setForm(EMPTY_FORM);
    setShowModal(false);
  }, [form, addExercise]);

  const handleDelete = useCallback(() => {
    if (deleteId) {
      deleteExercise(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteExercise]);

  const handleFormChange = (field: keyof typeof EMPTY_FORM, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div dir={dir} className="flex flex-col gap-4 pb-4" data-screen="exercise-library">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {isAr ? 'مكتبة التمارين' : 'Exercise Library'}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {exercises.length} {isAr ? 'تمرين' : 'exercises'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{ background: 'var(--color-brand)', color: '#0A0A0A' }}
        >
          <Plus size={16} />
          {isAr ? 'إضافة' : 'Add'}
        </button>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 h-11 px-3 rounded-xl"
        style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-border)' }}
      >
        <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isAr ? 'ابحث عن تمرين...' : 'Search exercises...'}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--color-text-primary)' }}
        />
      </div>

      {/* Muscle Group Filter */}
      <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
        {[{ key: 'ALL' as const, ar: 'الكل', en: 'All' }, ...MUSCLE_GROUPS].map((g) => {
          const isActive = filter === g.key;
          return (
            <button
              key={g.key}
              onClick={() => setFilter(g.key)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={
                isActive
                  ? { background: 'var(--color-brand)', color: '#0A0A0A' }
                  : { background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-bg-border)' }
              }
            >
              {isAr ? g.ar : g.en}
            </button>
          );
        })}
      </div>

      {/* Exercise List */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-2xl py-16"
          style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-border)' }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-bg-elevated)' }}>
            <Dumbbell size={20} style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {isAr ? 'لا توجد تمارين' : 'No exercises found'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((ex: any) => (
            <div key={ex.id} className="relative group">
              <ExerciseCard exercise={ex} showEquipment />
              <button
                onClick={() => setDeleteId(ex.id)}
                className="absolute top-3 end-3 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'var(--color-danger-muted)', border: '1px solid rgba(224,82,82,0.25)' }}
              >
                <Trash2 size={12} style={{ color: 'var(--color-danger)' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Exercise Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={isAr ? 'إضافة تمرين جديد' : 'Add New Exercise'}
        size="md"
      >
        <div className="flex flex-col gap-4">
          {/* Name AR */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>
              {isAr ? 'الاسم بالعربية' : 'Name (Arabic)'}
            </label>
            <input
              value={form.name_ar}
              onChange={(e) => handleFormChange('name_ar', e.target.value)}
              dir="rtl"
              placeholder="مثال: بنش بريس بالبار"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Name EN */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>
              {isAr ? 'الاسم بالإنجليزية' : 'Name (English)'}
            </label>
            <input
              value={form.name_en}
              onChange={(e) => handleFormChange('name_en', e.target.value)}
              dir="ltr"
              placeholder="e.g. Barbell Bench Press"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Muscle Group */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>
              {isAr ? 'المجموعة العضلية' : 'Muscle Group'}
            </label>
            <select
              value={form.muscleGroup}
              onChange={(e) => handleFormChange('muscleGroup', e.target.value as MuscleGroup)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', color: 'var(--color-text-primary)' }}
            >
              {MUSCLE_GROUPS.map((g) => (
                <option key={g.key} value={g.key} style={{ background: 'var(--color-bg-secondary)' }}>
                  {isAr ? g.ar : g.en}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>
              {isAr ? 'المعدات' : 'Equipment'}
            </label>
            <input
              value={form.equipment}
              onChange={(e) => handleFormChange('equipment', e.target.value)}
              placeholder={isAr ? 'مثال: بار + بنش' : 'e.g. Barbell + Bench'}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>
              {isAr ? 'رابط الفيديو' : 'Video URL'}
            </label>
            <input
              value={form.videoUrl}
              onChange={(e) => handleFormChange('videoUrl', e.target.value)}
              placeholder="https://..."
              dir="ltr"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Description AR */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>
              {isAr ? 'الوصف بالعربية' : 'Description (Arabic)'}
            </label>
            <textarea
              value={form.description_ar}
              onChange={(e) => handleFormChange('description_ar', e.target.value)}
              rows={2}
              dir="rtl"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* Description EN */}
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>
              {isAr ? 'الوصف بالإنجليزية' : 'Description (English)'}
            </label>
            <textarea
              value={form.description_en}
              onChange={(e) => handleFormChange('description_en', e.target.value)}
              rows={2}
              dir="ltr"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={!form.name_ar || !form.name_en || !form.equipment}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-98"
            style={{ background: 'var(--color-brand)', color: '#0A0A0A' }}
          >
            {isAr ? 'إضافة التمرين' : 'Add Exercise'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title={isAr ? 'حذف التمرين' : 'Delete Exercise'}
        size="sm"
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-danger-muted)' }}>
            <Trash2 size={20} style={{ color: 'var(--color-danger)' }} />
          </div>
          <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
            {isAr ? 'هل أنت متأكد من حذف هذا التمرين؟' : 'Are you sure you want to delete this exercise?'}
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', color: 'var(--color-text-secondary)' }}
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors"
              style={{ background: 'var(--color-danger)', color: 'white' }}
            >
              {isAr ? 'حذف' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}