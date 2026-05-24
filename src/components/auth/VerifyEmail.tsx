'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export default function VerifyEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        toast.error('Invalid verification link')
        return
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`,
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

        router.push('/company')
      } catch (error: unknown) {
        toast.error('Verification failed or expired link', { description: (error as Error).message })
      }
    }

    verifyEmail()
  }, [token, email, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">
        Verifying your email...
      </p>
    </div>
  )
}