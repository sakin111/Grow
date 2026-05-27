'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { nomad } from '@/env.auto'

export default function VerifyEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<
    'verifying' | 'redirecting' | 'error'
  >('verifying')

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        return (
          <div className="flex min-h-screen items-center justify-center text-red-500">
            Invalid verification link
          </div>
        )
      }

      try {
        const res = await fetch(
          `${nomad.NEXT_PUBLIC_API_URL}/auth/verify-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, email }),
          }
        )

        if (!res.ok) {
          throw new Error('Verification failed')
        }

        toast.success('Email verified successfully')

        setStatus('redirecting')

        setTimeout(() => {
          router.replace('/company')
        }, 800)

      } catch (error: unknown) {
        setStatus('error')
        toast.error('Verification failed or expired link', {
          description: (error as Error).message,
        })
      }
    }

    verifyEmail()
  }, [token, email, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      {status === 'verifying' && (
        <p className="text-muted-foreground">
          Verifying your email...
        </p>
      )}
      {status === 'redirecting' && (
        <p className="text-muted-foreground">
          Redirecting...
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