'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { isAxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { getDefaultDashboardRoute, isValidRedirectForRole } from '@/lib/auth-utils'
import { authApi, userApi } from '@/lib/apiService'
import { useAuthStore } from '@/stores/authStore'

function getSafeReturnPath(candidate: string | null) {
  if (!candidate?.startsWith('/') || candidate.startsWith('//')) {
    return '/feed'
  }

  const destination = new URL(candidate, window.location.origin)
  return destination.origin === window.location.origin
    ? `${destination.pathname}${destination.search}${destination.hash}`
    : '/feed'
}

export default function GoogleAuthCallback() {
  const router = useRouter()
  const setUser = useAuthStore(state => state.setUser)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const callbackUrl = new URL(window.location.href)
    const code = callbackUrl.searchParams.get('code')
    const returnTo = getSafeReturnPath(callbackUrl.searchParams.get('redirect'))

    if (code) {
      callbackUrl.searchParams.delete('code')
      window.history.replaceState(
        window.history.state,
        '',
        `${callbackUrl.pathname}${callbackUrl.search}${callbackUrl.hash}`
      )
    }

    if (!code) {
      toast.error('Google sign-in code is missing or expired')
      router.replace('/login?error=google_auth_failed')
      return
    }

    const authCode = code

    async function completeSignIn() {
      try {
        await authApi.exchangeGoogleAuthCode({ code: authCode })
        const response = await userApi.getCurrentUser()
        const user = response.data.data
        setUser(user)
        router.replace(
          isValidRedirectForRole(returnTo, user.role)
            ? returnTo
            : getDefaultDashboardRoute(user.role)
        )
      } catch (error) {
        const message = isAxiosError<{ message?: string }>(error)
          ? error.response?.data?.message || 'Google sign-in failed'
          : 'Google sign-in failed'
        toast.error(message)
        router.replace('/login?error=google_auth_failed')
      }
    }

    void completeSignIn()
  }, [router, setUser])

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
