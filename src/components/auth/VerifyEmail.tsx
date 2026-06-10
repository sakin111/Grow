'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi } from '@/lib/apiService'

export default function VerifyEmail() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const email = searchParams.get('email')
  const token = searchParams.get('token')

  const [status, setStatus] = useState<
    'waiting' | 'verifying' | 'success' | 'error'
  >('waiting')



useEffect(() => {
  if (!email) return

  let interval: NodeJS.Timeout

  const run = async () => {
    if (token) {
      try {
        setStatus('verifying')

        await authApi.verifyEmail({ email, token })

        setStatus('success')
        toast.success('Email verified')

        setTimeout(() => router.push('/company'), 1500)
      } catch {
        setStatus('error')
        toast.error('Verification failed')
      }

      return
    }

    interval = setInterval(async () => {
      const res = await authApi.checkVerificationStatus(email)
      const data = res.data

      if (data.data?.verified) {
        clearInterval(interval)

        setStatus('success')
        toast.success('Email verified')

        setTimeout(() => router.push('/login'), 1500)
      }
    }, 3000)
  }

  run()

  return () => clearInterval(interval)
}, [email, token, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      {status === 'waiting' && (
        <p>Waiting for you to verify your email...</p>
      )}

      {status === 'verifying' && (
        <p>Verifying your email...</p>
      )}

      {status === 'success' && (
        <p className="text-green-500">
          Email verified successfully. Redirecting...
        </p>
      )}

      {status === 'error' && (
        <p className="text-red-500">
          Verification failed. Please try again.
        </p>
      )}
    </div>
  )
}