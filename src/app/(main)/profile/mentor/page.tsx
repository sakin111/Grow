'use client'

import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/lib/apiService'
import { MentorProfile } from '@/types'
import { MentorProfileForm } from '@/components/mentor/MentorProfileForm'
import { Loader2, UserCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { EmptyState } from '@/components/shared/EmptyState'
import { AvailabilityManager } from '@/components/mentor/AvailabilityManager'

export default function MyMentorProfilePage() {
  const user = useAuthStore(state => state.user)
  
  const { data: mentor, isLoading, error } = useQuery({
    queryKey: ['my-mentor-profile'],
    queryFn: async () => {
    
      const res = await apiService.mentor.getCurrentMentorProfile()
      return res.data.data as MentorProfile
    },
    retry: false
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
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <MentorProfileForm initialData={mentor} />
      </div>
      <div className="border-t pt-6">
        <AvailabilityManager mentorId={mentor.id} />
      </div>
    </div>
  )
}
