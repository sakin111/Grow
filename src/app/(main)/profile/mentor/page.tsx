'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { apiService } from '@/lib/apiService'
import { MentorProfile } from '@/types'
import { MentorProfileForm } from '@/components/mentor/MentorProfileForm'
import { Loader2, UserCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { EmptyState } from '@/components/shared/EmptyState'
import { AvailabilityManager } from '@/components/mentor/AvailabilityManager'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function MyMentorProfilePage() {
  const user = useAuthStore(state => state.user)
  const queryClient = useQueryClient()
  
  const { data: mentor, isLoading, error } = useQuery({
    queryKey: ['my-mentor-profile'],
    queryFn: async () => {
    
      const res = await apiService.mentor.getCurrentMentorProfile()
      return res.data.data as MentorProfile
    },
    retry: false
  })

  const activeStatusMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      const response = await apiService.mentor.updateActiveStatus(isActive)
      return response.data.data
    },
    onSuccess: async updatedProfile => {
      queryClient.setQueryData<MentorProfile>(['my-mentor-profile'], current =>
        current ? { ...current, id: updatedProfile.id, isActive: updatedProfile.isActive } : current
      )
      queryClient.setQueryData<MentorProfile>(['mentor', updatedProfile.id], current =>
        current ? { ...current, isActive: updatedProfile.isActive } : current
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-mentor-profile'] }),
        queryClient.invalidateQueries({ queryKey: ['mentor', updatedProfile.id] }),
        queryClient.invalidateQueries({ queryKey: ['mentors'] }),
        queryClient.invalidateQueries({ queryKey: ['mentor-search'] }),
      ])
      toast.success(
        updatedProfile.isActive
          ? 'You are now available for bookings'
          : 'You are no longer available for bookings'
      )
    },
    onError: (error: unknown) => {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined
      toast.error(message || 'Could not update booking availability')
    },
  })

  if (user?.role !== 'MENTOR') {
    return <div className="p-8 text-center text-muted-foreground">This page is only for mentors.</div>
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>

  if (!mentor || error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">My Mentor Profile</h1>
        <EmptyState
          icon={UserCircle}
          title="No mentor profile"
          description="Create your mentor profile to start receiving bookings."
          action={{ label: "Create Profile", href: "/profile/mentor/create" }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Mentor Profile</h1>
      </div>
      <section className="flex items-center justify-between gap-6 rounded-xl border p-5">
        <div className="space-y-1">
          <h2 id="mentor-availability-label" className="font-semibold">
            Available for bookings
          </h2>
          <p id="mentor-availability-description" className="text-sm text-muted-foreground">
            When inactive, you won’t appear in the mentor directory or receive new booking requests.
          </p>
          {isAxiosError(activeStatusMutation.error) &&
            activeStatusMutation.error.response?.status === 404 && (
              <div role="alert" className="space-y-2 pt-2 text-sm text-destructive">
                <p>
                  Your mentor profile could not be found. Create or complete your profile before changing
                  booking availability.
                </p>
                <Link
                  href="/profile/mentor/create"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  Create or complete profile
                </Link>
              </div>
            )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {activeStatusMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Saving availability" />
          )}
          <Switch
            checked={mentor.isActive}
            disabled={activeStatusMutation.isPending}
            aria-labelledby="mentor-availability-label"
            aria-describedby="mentor-availability-description"
            onCheckedChange={isActive => activeStatusMutation.mutate(isActive)}
          />
        </div>
      </section>
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <MentorProfileForm initialData={mentor} />
      </div>
      <div className="border-t pt-6">
        <AvailabilityManager mentorId={mentor.id} />
      </div>
    </div>
  )
}
