'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import { Loader2 } from 'lucide-react'

export default function GoogleCallbackPage() {
  const router = useRouter()
  const setUser = useAuthStore(state => state.setUser)

  useEffect(() => {
    async function handleCallback() {
      try {
        const res = await api.get('/user/me')
        setUser(res.data.data)
        router.push('/feed')
      } catch (error) {
        router.push('/login?error=google_auth_failed')
      }
    }
    handleCallback()
  }, [router, setUser])

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
