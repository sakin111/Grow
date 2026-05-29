'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { nomad } from '@/env.auto'

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

        const res = await fetch(
          `${nomad.NEXT_PUBLIC_API_URL}/auth/verify-email`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token }),
          }
        )

        await res.json()

        if (!res.ok) throw new Error()

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
      const res = await fetch(
        `${nomad.NEXT_PUBLIC_API_URL}/auth/check-verification-status?email=${email}`
      )

      const data = await res.json()

      if (data.data?.verified) {
        clearInterval(interval)

        setStatus('success')
        toast.success('Email verified')

        setTimeout(() => router.push('/company'), 1500)
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