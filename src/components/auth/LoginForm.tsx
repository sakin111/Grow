/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'


import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '../ui/field'
import InputFieldError from '../shared/inputFieldError'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { loginUser } from '@/server/loginUser'





export function LoginForm({ redirect }: { redirect?: string | undefined }) {
  
    const [state, formAction, isPending] = useActionState(loginUser, null);

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast.error("login failed");
      console.log(state.error);
    }
  }, [state]);
  
  
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?redirect=/feed`
  }
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-2">Sign in to your Grow account</p>
      </div>

       <form action={formAction}>

      {redirect && <input type="hidden" name="redirect" value={redirect} />}
      <FieldGroup>
        <div className="grid grid-cols-1 gap-4">
          {/* Email */}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"

            />

            <InputFieldError field="email" state={state} />
          </Field>

          {/* Password */}
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"

            />
            <InputFieldError field="password" state={state} />
          </Field>
        </div>
        <FieldGroup className="mt-4">
          <Field>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Logging in..." : "Login"}
            </Button>

            <FieldDescription className="px-6 text-center">
              Don&apos;t have an account?{" "}
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
        <Link href="/register" className="text-primary hover:underline font-medium">
          Register
        </Link>
      </div>
    </div>
  )
}
