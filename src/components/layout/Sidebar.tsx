import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Users,
  ScanLine,
  BarChart2,
  Settings,
  Dumbbell,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { to: '/admin/members',   icon: Users,           key: 'members'   },
  { to: '/admin/checkin',   icon: ScanLine,        key: 'checkin'   },
  { to: '/admin/workouts',  icon: Dumbbell,        key: 'workouts'  },
  { to: '/admin/reports',   icon: BarChart2,       key: 'reports'   },
  { to: '/admin/settings',  icon: Settings,        key: 'settings'  },
]

export function Sidebar() {
  const { t } = useTranslation()

  return (
    <aside
      className="hidden md:flex flex-col w-64 h-dvh sticky top-0"
      style={{
        background:  'var(--color-bg-secondary)',
        borderInlineEnd: '1px solid var(--color-bg-border)',
      }}
    >
      {/* Logo */}
      <div
        className="h-16 flex items-center gap-3 px-5"
        style={{ borderBottom: '1px solid var(--color-bg-border)' }}
      >
        {/* Icon mark */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: 'var(--color-brand-muted)',
            border:     '1px solid rgba(201,168,76,0.25)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
            style={{ color: 'var(--color-brand)' }}>
            <path d="M6.5 6.5h11M6.5 17.5h11M3 10h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3M21 10h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2M5 6.5v11M19 6.5v11"/>
          </svg>
        </div>
        <div>
          <span
            className="text-base font-bold tracking-tight"
            style={{ color: 'var(--color-brand)' }}
          >
            GymOS
          </span>
          <p className="text-xs leading-none mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Admin Panel
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={key}
            to={to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={({ isActive }) =>
              isActive
                ? {
                    background: 'var(--color-brand-muted)',
                    color:      'var(--color-brand)',
                    border:     '1px solid rgba(201,168,76,0.2)',
                  }
                : {
                    color:      'var(--color-text-secondary)',
                    border:     '1px solid transparent',
                  }
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} style={{ flexShrink: 0 }} />
                <span>{t(`nav.${key}`)}</span>
                {isActive && (
                  <span
                    className="ms-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--color-brand)' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4"
        style={{ borderTop: '1px solid var(--color-bg-border)' }}
      >
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          GymOS v2.0
        </p>
      </div>
    </aside>
  )
}
