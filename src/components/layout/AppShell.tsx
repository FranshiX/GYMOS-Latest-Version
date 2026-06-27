import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar }   from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopBar }    from './TopBar'
import { useDirection } from '@/hooks/useDirection'

export function AppShell() {
  const { isRTL }  = useDirection()
  const location   = useLocation()
  const role       = location.pathname.startsWith('/member') ? 'member' : 'admin'

  return (
    <div
      className="min-h-dvh flex"
      style={{ background: 'var(--color-bg-primary)' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Desktop sidebar — admin only */}
      {role === 'admin' && <Sidebar />}

      {/* Main content area */}
      <div className="flex flex-col flex-1 md:ms-0 min-w-0">
        <TopBar />
        <main
          className="flex-1 overflow-y-auto p-4"
          style={{
            maxWidth: '100%',
            paddingBottom: 'calc(7rem + var(--safe-area-inset-bottom))',
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — always visible on mobile */}
      <BottomNav role={role} />
    </div>
  )
}
