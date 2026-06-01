/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, Building2, UserCircle, Star } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { VerificationBadge } from '@/components/company/VerificationBadge'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof changePasswordSchema>

export default function ProfilePage() {
  const user = useAuthStore(state => state.user)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  if (!user) return null

  async function onChangePassword(data: FormData) {
    setIsChangingPassword(true)
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Password changed successfully')
      form.reset()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={user.picture || ''} />
                <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
              <Badge variant="secondary" className="px-3 py-1 text-xs">
                {user.role} ROLE
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last login</span>
                <span className="font-medium">
                  {user.lastLoginAt ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true }) : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          {(user.role === 'OWNER' || user.role === 'ADMIN') && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle>My Company</CardTitle>
                </div>
                <CardDescription>Manage your company profile and verification</CardDescription>
              </CardHeader>
              <CardContent>
                {user.company ? (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                    <div>
                      <h4 className="font-semibold">{user.company.name}</h4>
                      <div className="mt-1">
                        <VerificationBadge status={user.company.verificationStatus} />
                      </div>
                    </div>
                    <Link href="/profile/company" className={cn(buttonVariants({ variant: "outline" }))}>Manage</Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border border-dashed rounded-lg bg-muted/10 text-muted-foreground">
                    <span>No company profile set up.</span>
                    <Link href="/company" className={cn(buttonVariants({ variant: "default" }))}>Set Up Company</Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {user.role === 'MENTOR' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <CardTitle>My Mentor Profile</CardTitle>
                </div>
                <CardDescription>Manage your mentor profile, expertise, and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div>
                    <h4 className="font-semibold">Mentor Settings</h4>
                    <p className="text-sm text-muted-foreground">Update your bio and schedule</p>
                  </div>
                  <Link href="/profile/mentor" className={cn(buttonVariants({ variant: "outline" }))}>Manage Profile</Link>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
