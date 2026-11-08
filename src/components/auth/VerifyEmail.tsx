'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
  const [statusCheckFailed, setStatusCheckFailed] = useState(false)

  useEffect(() => {
    if (!email) return

    let disposed = false
    let retryTimeout: ReturnType<typeof setTimeout> | undefined
    let redirectTimeout: ReturnType<typeof setTimeout> | undefined
    let retryDelay = 3000

    const completeVerification = () => {
      if (disposed) return

      setStatus('success')
      toast.success('Email verified. Please log in to continue.')
      redirectTimeout = setTimeout(
        () => router.push(`/login?email=${encodeURIComponent(email)}`),
        1500
      )
    }

    const verifyFromLink = async (verificationToken: string) => {
      setStatus('verifying')

      try {
        await authApi.verifyEmail({ email, token: verificationToken })
        completeVerification()
      } catch {
        if (disposed) return
        setStatus('error')
        toast.error('Verification failed')
      }
    }

    const checkVerificationStatus = async () => {
      try {
        const response = await authApi.checkVerificationStatus(email)
        if (disposed) return

        setStatusCheckFailed(false)
        if (response.data.data?.verified) {
          completeVerification()
          return
        }
      } catch {
        if (disposed) return
        setStatusCheckFailed(true)
      }

      if (disposed) return
      retryTimeout = setTimeout(checkVerificationStatus, retryDelay)
      retryDelay = Math.min(retryDelay * 2, 30_000)
    }

    if (token) {
      void verifyFromLink(token)
    } else {
      void checkVerificationStatus()
    }

    return () => {
      disposed = true
      if (retryTimeout) clearTimeout(retryTimeout)
      if (redirectTimeout) clearTimeout(redirectTimeout)
    }
  }, [email, token, router])

  const displayStatus = email ? status : 'error'

  return (
    <div className="flex min-h-screen items-center justify-center">
      {displayStatus === 'waiting' && (
        <p className="text-center">
          {statusCheckFailed
            ? 'We could not check your verification status right now. We will keep trying automatically.'
            : 'Waiting for you to verify your email...'}
        </p>
      )}

      {displayStatus === 'verifying' && (
        <p>Verifying your email...</p>
      )}

      {displayStatus === 'success' && (
        <div className="space-y-3 text-center">
          <p className="text-green-600">
            Email verified successfully. Please log in to continue.
          </p>
          <Link
            href={`/login?email=${encodeURIComponent(email ?? '')}`}
            className="text-primary underline"
          >
            Continue to login
          </Link>
        </div>
      )}

      {displayStatus === 'error' && (
        <p className="text-red-500">
          Verification failed. Please try again.
        </p>
      )}
    </div>
  )
}