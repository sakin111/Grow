'use client'

import { MentorProfileForm } from '@/components/mentor/MentorProfileForm'

export default function CreateMentorProfilePage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Mentor Profile</h1>
        <p className="text-muted-foreground mt-2">Set up your profile to start helping other entrepreneurs.</p>
      </div>
      <MentorProfileForm />
    </div>
  )
}
