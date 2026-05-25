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
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'

import InputFieldError from '@/components/shared/inputFieldError'
import { RegisterState } from '@/types/registration'



const INITIAL_STATE: RegisterState = null

export function RegisterForm() {
  const router = useRouter()

  const [state, formAction, isPending] =
    useActionState(registerUser, INITIAL_STATE)

  useEffect(() => {
    if (!state) return

    if (state.success && state.redirectTo && state.email) {
      toast.success(state.message || 'Account created successfully')

      router.push(
        `${state.redirectTo}?email=${encodeURIComponent(state.email)}`
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
            <Input name="name" />
            <InputFieldError field="name" state={state} />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input name="email" type="email" />
            <InputFieldError field="email" state={state} />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input name="password" type="password" />
            <InputFieldError field="password" state={state} />
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">
              Confirm Password
            </FieldLabel>
            <Input name="confirmPassword" type="password" />
            <InputFieldError field="confirmPassword" state={state} />
          </Field>
        </FieldGroup>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
      >
        Continue with Google
      </Button>

      <div className="text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}