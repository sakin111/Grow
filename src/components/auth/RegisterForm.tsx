'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'

import { registerUser } from '@/server/registrationUser'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'

import InputFieldError from '@/components/shared/inputFieldError'

type RegisterState = {
  success: boolean
  message?: string
  email?: string
  errors?: Record<string, string[]>
} | null

const INITIAL_STATE: RegisterState = null

export function RegisterForm() {
  const router = useRouter()

  const [state, formAction, isPending] = useActionState(
    registerUser,
    INITIAL_STATE
  )

  useEffect(() => {
    if (!state) return

    if (state.success && state.email) {
      toast.success(state.message || 'Account created successfully')

      router.push(
        `/verify-email?email=${encodeURIComponent(state.email)}`
      )

      return
    }

    if (!state.success && state.message) {
      toast.error(state.message)
    }
  }, [state, router])

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    if (!apiUrl) {
      toast.error('API URL is not configured')
      return
    }

    window.location.href = `${apiUrl}/auth/google?redirect=/feed`
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h2>
      </div>

      <form action={formAction} className="space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>

            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              required
            />

            <InputFieldError field="name" state={state} />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>

            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              required
            />

            <InputFieldError field="email" state={state} />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>

            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="new-password"
              required
            />

            <InputFieldError field="password" state={state} />
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">
              Confirm Password
            </FieldLabel>

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
            />

            <InputFieldError
              field="confirmPassword"
              state={state}
            />
          </Field>
        </FieldGroup>

        <div className="space-y-4">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending
              ? 'Creating Account...'
              : 'Create Account'}
          </Button>

          <FieldDescription className="text-center">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>

            <span className="px-1">or go to</span>

            <Link
              href="/"
              className="font-medium text-primary hover:underline"
            >
              home
            </Link>
          </FieldDescription>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>

        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
      >
        Continue with Google
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          Already have an account?{' '}
        </span>

        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}