import { useState, useMemo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Dumbbell, X, User, Search } from 'lucide-react'
import { useWorkoutPlanStore, type WorkoutPlanStore } from '@/store/useWorkoutPlanStore'
import { useMemberStore, type MemberStore } from '@/store/useMemberStore'
import { pageVariants, pageTransition, listItemVariants } from '@/utils/variants'
import { EmptyState } from '@/components/ui/EmptyState'
import type { WorkoutPlan, WorkoutDay } from '@/domain/workout/types'
import type { Member } from '@/domain/member/types'

type PlanType = 'GENERAL' | 'CUSTOM'

interface CreateForm {
  name_ar: string
  name_en: string
  type: PlanType
  assignedMemberId: string
}

const EMPTY_FORM: CreateForm = {
  name_ar: '',
  name_en: '',
  type: 'GENERAL',
  assignedMemberId: '',
}

export function WorkoutPlansScreen() {
  const { t, i18n } = useTranslation()
  const dir = i18n.dir()
  const navigate = useNavigate()
  const isAr = i18n.language === 'ar'

  const plans  = useWorkoutPlanStore((s: WorkoutPlanStore) => s.plans)
  const addPlan    = useWorkoutPlanStore((s: WorkoutPlanStore) => s.addPlan)
  const deletePlan = useWorkoutPlanStore((s: WorkoutPlanStore) => s.deletePlan)
  const duplicatePlan = useWorkoutPlanStore((s: WorkoutPlanStore) => s.duplicatePlan)
  const members = useMemberStore((s: MemberStore) => s.members)

  const [activeTab, setActiveTab] = useState<PlanType>('GENERAL')
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState<CreateForm>(EMPTY_FORM)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [previewPlanId, setPreviewPlanId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'dayCount'>('updated')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.toLowerCase())
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load sort preferences from localStorage
  useEffect(() => {
    const savedSortBy = localStorage.getItem('workoutPlans_sortBy')
    const savedSortDirection = localStorage.getItem('workoutPlans_sortDirection')
    if (savedSortBy) setSortBy(savedSortBy as 'name' | 'updated' | 'dayCount')
    if (savedSortDirection) setSortDirection(savedSortDirection as 'asc' | 'desc')
  }, [])

  // Save sort preferences to localStorage
  useEffect(() => {
    localStorage.setItem('workoutPlans_sortBy', sortBy)
    localStorage.setItem('workoutPlans_sortDirection', sortDirection)
  }, [sortBy, sortDirection])

  const getMemberName = useCallback((memberId?: string) => {
    if (!memberId) return '—'
    const m = members.find((m: Member) => m.id === memberId)
    return m?.fullName ?? '—'
  }, [members])

  const generalPlans = useMemo(() => plans.filter((p: WorkoutPlan) => p.type === 'GENERAL'), [plans])
  const customPlans  = useMemo(() => plans.filter((p: WorkoutPlan) => p.type === 'CUSTOM'),  [plans])
  
  // Filter plans by search query
  const filteredPlans = useMemo(() => {
    const plansToFilter = activeTab === 'GENERAL' ? generalPlans : customPlans
    if (!debouncedSearch) return plansToFilter
    
    return plansToFilter.filter((plan: WorkoutPlan) => {
      const nameMatch = plan.name_ar.toLowerCase().includes(debouncedSearch) ||
                       plan.name_en.toLowerCase().includes(debouncedSearch)
      if (nameMatch) return true
      
      // For custom plans, also search by assigned member name
      if (plan.type === 'CUSTOM' && plan.assignedMemberId) {
        const memberName = getMemberName(plan.assignedMemberId)
        return memberName.toLowerCase().includes(debouncedSearch)
      }
      return false
    })
  }, [generalPlans, customPlans, activeTab, debouncedSearch, getMemberName])

  // Sort plans
  const sortedPlans = useMemo(() => {
    const plansToSort = [...filteredPlans]
    return plansToSort.sort((a: WorkoutPlan, b: WorkoutPlan) => {
      let comparison = 0
      
      if (sortBy === 'name') {
        const nameA = isAr ? a.name_ar : a.name_en
        const nameB = isAr ? b.name_ar : b.name_en
        comparison = nameA.localeCompare(nameB)
      } else if (sortBy === 'updated') {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        comparison = dateA - dateB
      } else if (sortBy === 'dayCount') {
        comparison = a.days.length - b.days.length
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredPlans, sortBy, sortDirection, isAr])
  
  const visiblePlans = sortedPlans

  const handleCreate = useCallback(() => {
    if (!form.name_ar.trim() || !form.name_en.trim()) return
    const newPlan = addPlan({
      name_ar: form.name_ar,
      name_en: form.name_en,
      type: form.type,
      ...(form.type === 'CUSTOM' && form.assignedMemberId
        ? { assignedMemberId: form.assignedMemberId }
        : {}),
      // days: [],
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
    navigate(`/admin/workouts/${newPlan.id}`)
  }, [form, addPlan, navigate])

  const handleDelete = useCallback((id: string) => {
    deletePlan(id)
    setConfirmId(null)
  }, [deletePlan])

  const handlePreview = useCallback((planId: string) => {
    setPreviewPlanId(planId)
  }, [])

  const handleEditFromPreview = useCallback((planId: string) => {
    setPreviewPlanId(null)
    navigate(`/admin/workouts/${planId}`)
  }, [navigate])

  const handleDuplicate = useCallback((planId: string) => {
    const newPlan = duplicatePlan(planId)
    setPreviewPlanId(null)
    if (newPlan) {
      navigate(`/admin/workouts/${newPlan.id}`)
    }
  }, [duplicatePlan, navigate])

  const tabs: { key: PlanType; label: string }[] = [
    { key: 'GENERAL', label: t('plans.general_tab') },
    { key: 'CUSTOM',  label: t('plans.custom_tab') },
  ]

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      data-screen="workout-plans"
      dir={dir}
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: 'var(--color-bg-base)' }}
    >

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Dumbbell size={20} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {t('workout.plans')}
          </h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'var(--color-primary)', color: 'var(--text-inverse)' }}
        >
          <Plus size={15} strokeWidth={1.5} />
          {t('plans.create')}
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-3 flex gap-2">
        <div className="relative flex-1">
          <Search 
            size={16} 
            strokeWidth={1.5} 
            style={{ color: 'var(--color-text-tertiary)' }}
            className="absolute start-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('plans.search_placeholder')}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ 
              background: 'var(--color-bg-elevated)', 
              color: 'var(--color-text-primary)', 
              border: '1px solid var(--border-default)' 
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 p-1"
            >
              <X size={14} strokeWidth={1.5} style={{ color: 'var(--color-text-tertiary)' }} />
            </button>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (sortBy === 'name') setSortBy('updated')
            else if (sortBy === 'updated') setSortBy('dayCount')
            else setSortBy('name')
          }}
          className="px-3 py-2.5 rounded-xl transition-all flex items-center gap-1"
          style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
            {sortBy === 'name' ? t('plans.sort_by_name') : sortBy === 'updated' ? t('plans.sort_by_updated') : t('plans.sort_by_day_count')}
          </span>
        </motion.button>
      </div>

      {/* Create Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md rounded-2xl p-5 flex flex-col gap-4"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-default)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {t('plans.create')}
                </h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
                  className="p-2 rounded-lg transition-all"
                  style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-tertiary)' }}
                >
                  <X size={16} strokeWidth={1.5} />
                </motion.button>
              </div>

              {/* Inputs */}
              <div className="flex flex-col gap-3">
                <input
                  placeholder={t('plans.name_ar_placeholder')}
                  value={form.name_ar}
                  onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', border: '1px solid var(--border-default)' }}
                />
                <input
                  placeholder={t('plans.name_en_placeholder')}
                  value={form.name_en}
                  onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', border: '1px solid var(--border-default)' }}
                />
                {/* Type toggle */}
                <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
                  {(['GENERAL', 'CUSTOM'] as PlanType[]).map(type => (
                    <motion.button
                      key={type}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setForm(f => ({ ...f, type }))}
                      className="flex-1 py-2 text-sm font-medium transition-all"
                      style={{
                        background: form.type === type ? 'var(--color-primary)' : 'var(--color-bg-card)',
                        color: form.type === type ? 'var(--text-inverse)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {type === 'GENERAL' ? t('plans.general_tab') : t('plans.custom_tab')}
                    </motion.button>
                  ))}
                </div>
                {/* Member picker for CUSTOM */}
                {form.type === 'CUSTOM' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <select
                      value={form.assignedMemberId}
                      onChange={e => setForm(f => ({ ...f, assignedMemberId: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', border: '1px solid var(--border-default)' }}
                    >
                      <option value="">{t('plans.assigned_to')}…</option>
                      {members.map((m: Member) => (
                        <option key={m.id} value={m.id}>{m.fullName}</option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--color-primary)', color: 'var(--text-inverse)' }}
                >
                  {t('common.confirm')}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-secondary)', border: '1px solid var(--border-default)' }}
                >
                  {t('common.cancel')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 mb-3 p-1 rounded-xl"
        style={{ background: 'var(--color-bg-elevated)' }}>
        {tabs.map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: activeTab === tab.key ? 'var(--color-bg-base)' : 'transparent',
              color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Plan list */}
      <div className="flex flex-col gap-2 px-4 pb-6">
        {visiblePlans.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title={searchQuery ? t('plans.no_results') : t('plans.empty_title')}
            subtitle={searchQuery ? t('plans.no_results_subtitle') : t('plans.empty_subtitle')}
            cta={!searchQuery ? {
              label: t('plans.create_first'),
              onClick: () => setShowForm(true)
            } : undefined}
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {visiblePlans.map((plan: WorkoutPlan, index: number) => (
              <motion.div
                key={plan.id}
                variants={listItemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ delay: index * 0.05 }}
              >
                <PlanRow
                  plan={plan}
                  isAr={isAr}
                  memberName={getMemberName(plan.assignedMemberId)}
                  onEdit={() => navigate(`/admin/workouts/${plan.id}`)}
                  onDelete={() => setConfirmId(plan.id)}
                  onDuplicate={() => handleDuplicate(plan.id)}
                  onPreview={handlePreview}
                  t={t}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Delete confirm overlay */}
      <AnimatePresence>
        {confirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="mx-6 rounded-2xl p-5 flex flex-col gap-4"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-default)' }}
              onClick={e => e.stopPropagation()}
            >
              <p className="text-sm font-semibold text-center" style={{ color: 'var(--color-text-primary)' }}>
                {t('plans.delete_confirm')}
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(confirmId)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--color-danger)', color: 'var(--text-inverse)' }}
                >
                  {t('common.confirm')}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConfirmId(null)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-secondary)', border: '1px solid var(--border-default)' }}
                >
                  {t('common.cancel')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview modal */}
      <AnimatePresence>
        {previewPlanId && (() => {
          const previewPlan = plans.find((p: WorkoutPlan) => p.id === previewPlanId)
          if (!previewPlan) return null
          const planName = isAr ? previewPlan.name_ar : previewPlan.name_en
          const memberName = getMemberName(previewPlan.assignedMemberId)
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end"
              style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={() => setPreviewPlanId(null)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-h-[75vh] rounded-t-3xl flex flex-col"
                style={{ background: 'var(--color-bg-elevated)' }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-default)' }}>
                  <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {t('plans.preview_title')}
                  </h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPreviewPlanId(null)}
                    className="p-2 rounded-xl transition-all"
                    style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-tertiary)' }}
                  >
                    <X size={18} strokeWidth={1.5} />
                  </motion.button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                  {/* Plan name */}
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                      {t('plans.name')}
                    </p>
                    <p className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {planName}
                    </p>
                  </div>

                  {/* Type */}
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                      {t('plans.type')}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {previewPlan.type === 'GENERAL' ? t('plans.general_tab') : t('plans.custom_tab')}
                    </p>
                  </div>

                  {/* Assigned member (for custom plans) */}
                  {previewPlan.type === 'CUSTOM' && (
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
                        {t('plans.assigned_to')}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {memberName}
                      </p>
                    </div>
                  )}

                  {/* Days */}
                  <div>
                    <p className="text-xs mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
                      {t('plans.days')} ({previewPlan.days.length})
                    </p>
                    <div className="flex flex-col gap-2">
                      {previewPlan.days.map((day: WorkoutDay) => (
                        <div
                          key={day.id}
                          className="px-3 py-2 rounded-xl"
                          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--border-default)' }}
                        >
                          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {isAr ? day.name_ar : day.name_en}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                            {day.exercises.length} {t('builder.add_exercise').toLowerCase()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 border-t flex gap-3" style={{ borderColor: 'var(--border-default)' }}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleEditFromPreview(previewPlan.id)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold"
                    style={{ background: 'var(--color-primary)', color: 'var(--text-inverse)' }}
                  >
                    {t('plans.edit')}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDuplicate(previewPlan.id)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold"
                    style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-secondary)', border: '1px solid var(--border-default)' }}
                  >
                    {t('plans.duplicate')}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </motion.div>
  )
}

interface PlanRowProps {
  plan: WorkoutPlan
  isAr: boolean
  memberName: string
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onPreview: (planId: string) => void
  t: (key: string) => string
}

function PlanRow({ plan, isAr, memberName, onEdit, onDelete, onDuplicate, onPreview, t }: PlanRowProps) {
  const name = isAr ? plan.name_ar : plan.name_en
  const dayCount = plan.days.length
  const isCustom = plan.type === 'CUSTOM'
  const [showMenu, setShowMenu] = useState(false)
  
  // Get member initial for avatar
  const memberInitial = memberName ? memberName.charAt(0).toUpperCase() : '?'
  
  // Format relative date
  const getRelativeDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return t('plans.updated_today')
    if (diffDays === 1) return t('plans.updated_yesterday')
    if (diffDays < 7) return `${diffDays} ${t('plans.days')}`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${t('plans.weeks')}`
    return `${Math.floor(diffDays / 30)} ${t('plans.months')}`
  }
  
  const relativeDate = getRelativeDate(plan.updatedAt)
  
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onPreview(plan.id)}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer"
      style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-default)' }}
    >
      {/* Type indicator */}
      <div className="flex-shrink-0">
        {isCustom ? (
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--color-primary-dim)', color: 'var(--color-primary)' }}
          >
            {memberInitial}
          </div>
        ) : (
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-secondary-dim)', color: 'var(--color-secondary)' }}
          >
            <Dumbbell size={16} strokeWidth={1.5} />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
          {name}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          {/* Day count as dots */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(dayCount, 5) }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ 
                  background: i < dayCount ? 'var(--color-primary)' : 'var(--color-bg-card)',
                  opacity: i < dayCount ? 1 : 0.3
                }}
              />
            ))}
            {dayCount > 5 && (
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                +{dayCount - 5}
              </span>
            )}
          </div>
          
          {/* Member name for custom plans */}
          {isCustom && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-primary)' }}>
              <User size={10} strokeWidth={1.5} />
              {memberName}
            </span>
          )}
          
          {/* Relative date */}
          {relativeDate && (
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {relativeDate}
            </span>
          )}
        </div>
      </div>
      
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v) }}
          className="p-2 rounded-xl transition-all"
          style={{ background: 'var(--color-bg-card)' }}
        >
          <span className="text-lg font-bold" style={{ color: 'var(--color-text-tertiary)', letterSpacing: '2px' }}>•••</span>
        </motion.button>
        
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute end-0 top-full mt-1 w-36 rounded-xl overflow-hidden z-10"
              style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-default)' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => { setShowMenu(false); onEdit(); }}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-all hover:bg-opacity-80"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <Pencil size={14} strokeWidth={1.5} />
                {t('plans.edit')}
              </button>
              <button
                onClick={() => { setShowMenu(false); onDuplicate(); }}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-all hover:bg-opacity-80"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span className="text-xs font-semibold">Copy</span>
                {t('plans.duplicate')}
              </button>
              <button
                onClick={() => { setShowMenu(false); onDelete(); }}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-all hover:bg-opacity-80"
                style={{ color: 'var(--color-danger)' }}
              >
                <Trash2 size={14} strokeWidth={1.5} />
                {t('common.delete')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}