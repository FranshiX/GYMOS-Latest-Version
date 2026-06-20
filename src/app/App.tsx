import { useEffect } from 'react'
import { Router } from './Router'
import { useMemberStore }     from '@/store/useMemberStore'
import { useMembershipStore } from '@/store/useMembershipStore'
import { useCheckinStore }    from '@/store/useCheckinStore'
import { useDirection }       from '@/hooks/useDirection'
import { PWAInstallPrompt }   from '@/components/shared/PWAInstallPrompt'

export function App() {
  useDirection()
  const loadMembers     = useMemberStore((s: any) => s.loadMembers)
  const loadMemberships = useMembershipStore((s: any) => s.loadMemberships)
  const loadCheckins    = useCheckinStore((s: any) => s.loadCheckins)

  useEffect(() => {
    loadMembers()
    loadMemberships()
    loadCheckins()
  }, [])

  return (
    <>
      <Router />
      <PWAInstallPrompt />
    </>
  )
}