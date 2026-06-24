import { useState, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useMeasurementStore } from '@/store/useMeasurementStore'
import { useMemberStore } from '@/store/useMemberStore'
import { pageVariants, pageTransition } from '@/utils/variants'
import type { BodyMeasurement } from '@/domain/measurement/types'

interface FormState {
  weight: string
  bodyFat: string
  chest: string
  waist: string
  hips: string
  notes: string
}

const EMPTY_FORM: FormState = {
  weight: '', bodyFat: '', chest: '', waist: '', hips: '', notes: '',
}

export function MeasurementsScreen() {
  const { phone } = useParams<{ phone: string }>()
  const { t, i18n } = useTranslation()
  const dir = i18n.dir()

  const members  = useMemberStore((s: any) => s.members)
  const member   = useMemo(() => members.find((m: any) => m.phone === phone), [members, phone])
  const memberId = member?.id ?? phone ?? ''

  const getMeasurementsForMember = useMeasurementStore((s: any) => s.getMeasurementsForMember)
  const addMeasurement           = useMeasurementStore((s: any) => s.addMeasurement)

  const measurements = useMemo(() => getMeasurementsForMember(memberId), [memberId, getMeasurementsForMember])

  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState<FormState>(EMPTY_FORM)

  const weightChartData = useMemo(() =>
    measurements.slice(-20)
      .filter((m: any) => m.weight !== undefined)
      .map((m: any) => ({ date: m.date.slice(5), value: m.weight! })),
    [measurements]
  )

  const handleSubmit = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    addMeasurement({
      memberId,
      date: today,
      ...(form.weight   ? { weight: Number(form.weight) } : {}),
      measurements: {
        ...(form.chest ? { chest: Number(form.chest) } : {}),
        ...(form.waist ? { waist: Number(form.waist) } : {}),
        ...(form.bodyFat ? { bodyFat: Number(form.bodyFat) } : {}),
        ...(form.hips  ? { hips:  Number(form.hips)  } : {}),
      },
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
  }, [memberId, form, addMeasurement])

  const fields: { key: keyof FormState; label: string }[] = [
    { key: 'weight',  label: t('measurements.weight') },
    { key: 'bodyFat', label: t('measurements.body_fat') },
    { key: 'chest',   label: t('workout.chest') },
    { key: 'waist',   label: t('workout.waist') },
    { key: 'hips',    label: t('workout.hips') },
  ]

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      data-screen="measurements"
      dir={dir}
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: 'var(--color-bg-base)' }}
    >

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {t('workout.measurements')}
        </h1>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5"
        >
          <Plus size={15} strokeWidth={1.5} />
          {t('measurements.add')}
        </Button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-4 mb-4 rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-default)' }}
          >
            <div className="grid grid-cols-2 gap-3">
              {fields.map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{label}</label>
                  <input
                    type="number"
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', border: '1px solid var(--border-default)' }}
                  />
                </div>
              ))}
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {t('measurements.notes')}
                </label>
                <input
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', border: '1px solid var(--border-default)' }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" fullWidth onClick={handleSubmit}>
                {t('common.save')}
              </Button>
              <Button variant="secondary" fullWidth onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}>
                {t('common.cancel')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4 px-4 pb-8">
        {/* Weight chart */}
        {weightChartData.length > 0 && (
          <Card variant="elevated" padding="md">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-text-tertiary)' }}>
              {t('measurements.weight')}
            </p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightChartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} width={30} />
                  <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--border-default)', borderRadius: 10, fontSize: 12 }} />
                  <Line dataKey="value" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* History */}
        {measurements.length === 0 ? (
          <p className="text-sm text-center py-12" style={{ color: 'var(--color-text-tertiary)' }}>
            {t('measurements.no_data')}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {[...measurements].reverse().map(m => (
              <MeasurementCard key={m.id} m={m} t={t} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function MeasurementCard({ m, t }: { m: BodyMeasurement; t: (k: string) => string }) {
  const items: { label: string; value: string }[] = []
  if (m.weight)                items.push({ label: t('measurements.weight'),   value: `${m.weight} kg` })
  if (m.measurements?.chest)   items.push({ label: t('workout.chest'),          value: `${m.measurements.chest} cm` })
  if (m.measurements?.waist)   items.push({ label: t('workout.waist'),          value: `${m.measurements.waist} cm` })
  if (m.measurements?.hips)    items.push({ label: t('workout.hips'),           value: `${m.measurements.hips} cm` })

  return (
    <Card variant="default" padding="sm">
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>{m.date}</p>
      <div className="grid grid-cols-2 gap-1">
        {items.map(({ label, value }) => (
          <div key={label} className="flex justify-between">
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{label}</span>
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}