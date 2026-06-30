import { Outlet, useLocation } from 'react-router-dom'
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
      {/* Centered phone-width container — transform creates containing block for fixed descendants */}
      <div className="mx-auto max-w-md h-dvh flex flex-col" style={{ transform: 'translateZ(0)' }}>
        <TopBar />
        <main
          className="flex-1 overflow-y-auto p-4"
          style={{ paddingBottom: 'calc(7rem + var(--safe-area-inset-bottom))' }}
        >
          <Outlet />
        </main>
        <BottomNav role={role} />
      </div>
    </div>
  )
}
