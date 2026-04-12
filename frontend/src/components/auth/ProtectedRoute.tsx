'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useHydration } from '@/hooks/useHydration'

interface Props {
  children: React.ReactNode
  redirectTo?: string
  adminOnly?: boolean
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login',
  adminOnly = false 
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const hydrated = useHydration()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (!hydrated) return
    
    if (!isAuthenticated) {
      router.replace(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    
    if (adminOnly && user?.role !== 'ADMIN') {
      router.replace('/')
    }
  }, [hydrated, isAuthenticated, user, router, redirectTo, adminOnly, pathname])

  // Show nothing until hydration completes
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  // Show nothing if not authenticated (redirect in progress)
  if (!isAuthenticated) return null
  
  // Admin check
  if (adminOnly && user?.role !== 'ADMIN') return null

  return <>{children}</>
}
