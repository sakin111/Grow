import { DiscussionForm } from '@/components/discussion/DiscussionForm'

export default function CreateDiscussionPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New Discussion</h1>
        <p className="text-muted-foreground mt-2">Start a conversation with the community.</p>
      </div>
      <DiscussionForm />
    </div>
  )
}
