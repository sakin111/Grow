'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import axios from 'axios'
import Link from 'next/link'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../ui/field'
import { authApi, userApi } from '@/lib/apiService'
import { getPostLoginDestination } from '@/lib/auth-flow'
import { useAuthStore } from '@/stores/authStore'
import { nomad } from '@/env.auto'

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm({
  redirect,
  roleChanged = false,
  initialEmail = '',
}: {
  redirect?: string
  roleChanged?: boolean
  initialEmail?: string
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const setUser = useAuthStore(state => state.setUser)
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: initialEmail, password: '' },
  })

  async function onSubmit(credentials: LoginFormData) {
    if (isPending) return

    setIsPending(true)
    setServerError(null)
    let loginSucceeded = false

    try {
      const loginResponse = await authApi.login(credentials)
      if (loginResponse.data?.success === false) {
        throw new Error(loginResponse.data.message || 'Login failed')
      }

      loginSucceeded = true
      const userResponse = await userApi.getCurrentUser({
        withCredentials: true,
        skipAuthHandling: true,
      })
      const user = userResponse.data?.data

      if (!user || !['ADMIN', 'OWNER', 'MENTOR'].includes(user.role)) {
        throw new Error('Unable to load your account after login.')
      }

      setUser(user)
      queryClient.setQueryData(['me', false], user)

      const destination = getPostLoginDestination(user, redirect)
      router.replace(`${destination}${destination.includes('?') ? '&' : '?'}loggedIn=true`)
    } catch (error) {
      let message: string
      if (loginSucceeded) {
        message = 'Your login did not establish a session. Please log in again.'
      } else if (axios.isAxiosError(error) && error.response?.status === 401) {
        message = 'Email or password is incorrect. Please try again.'
      } else if (
        axios.isAxiosError(error) &&
        typeof error.response?.data?.message === 'string'
      ) {
        message = error.response.data.message
      } else if (error instanceof Error) {
        message = error.message
      } else {
        message = 'Login failed. Please try again.'
      }

      setServerError(message)
      toast.error(message)
    } finally {
      setIsPending(false)
    }
  }

  const handleGoogleLogin = () => {
    if (!nomad.NEXT_PUBLIC_API_URL) {
      toast.error('API URL is not configured')
      return
    }

    window.location.href = authApi.googleAuthUrl(redirect || '/feed')
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Want to Grow</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to your Grow account</p>
      </div>

      {roleChanged && (
        <p className="rounded-md border bg-muted p-3 text-sm text-muted-foreground">
          Your account is now set to Mentor. Sign in again to continue to mentor profile setup.
        </p>
      )}

      {serverError && (
        <p role="alert" className="rounded-md border border-destructive p-3 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {redirect && <input type="hidden" name="redirect" value={redirect} />}
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <FieldDescription role="alert" className="text-red-600">
                  {form.formState.errors.email.message}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <FieldDescription role="alert" className="text-red-600">
                  {form.formState.errors.password.message}
                </FieldDescription>
              )}
            </Field>
          </div>
          <FieldGroup className="mt-4">
            <Field>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Logging in...' : 'Login'}
              </Button>

              <FieldDescription className="px-6 text-center">
                Don&apos;t have an account?{' '}
                <a href="/register" className="text-primary hover:underline">
                  Sign up
                </a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </FieldGroup>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or continue with</span>
        </div>
      </div>

      <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin}>
        Google
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Do not have an account? </span>
        <Link href="/register" className="mr-2 font-medium text-primary hover:underline">
          Register
        </Link>
        <span>|</span>
        <Link href="/forgot-password" className="ml-2 font-medium text-primary hover:underline">
          forgot password
        </Link>
      </div>
    </div>
  )
}
