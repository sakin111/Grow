'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { apiService } from '@/lib/apiService'
import { useAuthStore } from '@/stores/authStore'

const mentorProfileLoginUrl =
  '/login?redirect=%2Fprofile%2Fmentor%2Fcreate&roleChanged=true'

export function BecomeMentorCard() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const logout = useAuthStore(state => state.logout)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleBecomeMentor = async () => {
    setIsLoading(true)

    try {
      await apiService.user.changeRole({ role: 'MENTOR' })

      let logoutError: unknown
      try {
        await apiService.auth.logout()
      } catch (error) {
        logoutError = error
        console.error('Failed to end session after changing role:', error)
      }

      queryClient.clear()
      logout()
      setDialogOpen(false)

      if (logoutError) {
        toast.error('Your role changed, but your session could not be ended. Sign in again to continue.')
      } else {
        toast.success('Your role changed. Sign in again to create your mentor profile.')
      }

      router.replace(mentorProfileLoginUrl)
    } catch (error) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || 'Could not change your account to a mentor'
        : 'Could not change your account to a mentor'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Want to become a mentor?</CardTitle>
          <CardDescription>
            Switch your account to a mentor and create a profile to offer sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setDialogOpen(true)}>
            Become a mentor
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Switch your account to Mentor?"
        description="Your account can have only one role right now. Switching to Mentor replaces Owner, so owner-specific features may no longer be available. You will be signed out and asked to sign in again before creating your mentor profile."
        confirmLabel="Switch to Mentor"
        onConfirm={handleBecomeMentor}
        isLoading={isLoading}
      />
    </>
  )
}
