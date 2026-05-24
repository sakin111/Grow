/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { useActionState, useEffect} from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { registerUser } from '@/server/registrationUser'
import { Field, FieldDescription, FieldGroup,FieldLabel} from '../ui/field'
import InputFieldError from '../shared/inputFieldError'
import { useRouter } from 'next/router'





export function RegisterForm() {
 
  const [state, formAction, isPending] = useActionState(registerUser, null);
  const router = useRouter();

  useEffect(() => {

    if (state && state.success) {
        toast.success(state.message);
        router.push(
            `/verify-email?email=${encodeURIComponent(state.email)}`
        );
    }
    else if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);


  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?redirect=/feed`
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Create your account</h2>
      </div>

       <form action={formAction}>
      <FieldGroup>


        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" name="name" type="text" placeholder="John Doe" />
          <InputFieldError field="name" state={state} />
        </Field>


        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
          />

          <InputFieldError field="email" state={state} />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" name="password" type="password" placeholder="Enter your password" />

          <InputFieldError field="password" state={state} />
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
          />

          <InputFieldError field="confirmPassword" state={state} />
        </Field>

        <FieldGroup className="mt-4">
          <Field>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating Account..." : "Create Account"}
            </Button>

            <FieldDescription className="px-6 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
              <span className="px-1">or go to{" "}</span>
              <Link href="/" className="text-primary hover:underline">
                home
              </Link>
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
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </div>
  )
}
