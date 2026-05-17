'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Loader2 } from 'lucide-react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    } else if (user) {
      if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
        router.push('/login?error=account_status')
      }
    }
  }, [isLoading, isAuthenticated, router, user])

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated || user?.status === 'BANNED' || user?.status === 'SUSPENDED') {
    return null
  }

  return <>{children}</>
}
