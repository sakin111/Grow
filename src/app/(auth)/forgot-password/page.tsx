'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import api from '@/lib/api'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
})

type FormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', data)
      setIsSuccess(true)
      toast.success('Check your email for the reset link.')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Forgot password</h2>
      </div>

      {isSuccess ? (
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Check your email for the reset link.
          </p>
          <Link href="/login" className={cn(buttonVariants({ variant: "default" }), "w-full flex justify-center")}>
            Back to login
          </Link>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send reset link
            </Button>
          </form>
        </Form>
      )}

      {!isSuccess && (
        <div className="text-center text-sm">
          <Link href="/login" className="text-primary hover:underline font-medium">
            Back to login
          </Link>
        </div>
      )}
    </div>
  )
}
