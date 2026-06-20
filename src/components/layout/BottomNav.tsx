import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  Dumbbell,
  BarChart2,
  Settings,
  User,
  TrendingUp,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

type NavItem = {
  path:    string
  labelKey: string
  Icon:    React.ComponentType<{ size?: number; strokeWidth?: number }>
  exact?:  boolean
}

const adminNav: NavItem[] = [
  { path: '/admin/dashboard', labelKey: 'dashboard.title', Icon: LayoutDashboard },
  { path: '/admin/members',   labelKey: 'members.title',   Icon: Users         },
  { path: '/admin/checkin',   labelKey: 'checkin.title',   Icon: CheckCircle   },
  { path: '/admin/workouts',  labelKey: 'workout.plans',   Icon: Dumbbell      },
  { path: '/admin/reports',   labelKey: 'reports.title',   Icon: BarChart2     },
  { path: '/admin/settings',  labelKey: 'settings.title',  Icon: Settings      },
]

// ── Component ────────────────────────────────────────────────────────────────

export function BottomNav({ role }: { role: 'admin' | 'member' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { phone } = useParams<{ phone: string }>()
  const { t }     = useTranslation()

  const memberNav: NavItem[] = [
    { path: `/member/${phone}/workout`,  labelKey: 'workout.myWorkout',  Icon: Dumbbell   },
    { path: `/member/${phone}/progress`, labelKey: 'workout.myProgress', Icon: TrendingUp },
    { path: `/member/${phone}`,          labelKey: 'profile.title',     Icon: User,       exact: true },
  ]

  const items = role === 'admin' ? adminNav : memberNav

  const navTap = { scale: 0.9 }

  return (
    <nav
      className="fixed bottom-0 start-0 end-0 z-30 pb-safe"
      style={{
        background:   'rgba(8,8,8,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop:    '1px solid var(--border-default)',
      }}
    >
      <div className="flex items-center justify-around px-1 py-1.5">
        {items.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path)

          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              whileTap={navTap}
              className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all flex-1 min-w-0 relative"
              style={{
                color: isActive
                  ? 'var(--color-primary)'
                  : 'var(--color-text-tertiary)',
              }}
            >
              {/* Active indicator dot */}
              {isActive && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0.5 w-1 h-1 rounded-full"
                  style={{ background: 'var(--color-primary)' }}
                />
              )}

              <item.Icon size={22} strokeWidth={1.5} />

              <span
                className="leading-tight truncate w-full text-center"
                style={{
                  fontSize:   role === 'admin' ? '9px' : '10px',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {t(item.labelKey)}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
