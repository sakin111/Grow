'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Discussion } from '@/types'
import { TopicBadge } from '@/components/shared/TopicBadge'
import { CommentForm } from '@/components/discussion/CommentForm'
import { CommentItem } from '@/components/discussion/CommentItem'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function DiscussionDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const user = useAuthStore(state => state.user)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showDelete, setShowDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['discussion', id],
    queryFn: async () => {
      const res = await api.get(`/discussion/discussion/${id}`)
      return res.data.data as Discussion
    }
  })

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
  if (error || !data) return <div className="text-center py-12 text-muted-foreground">Discussion not found.</div>

  const isOwner = user?.company?.id === data.companyId

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/discussion/discussion/${id}`)
      toast.success('Discussion deleted')
      router.push('/feed')
    } catch (err: any) {
      toast.error('Failed to delete discussion')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <Link href="/feed" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Feed
      </Link>

      <div className="bg-card border rounded-xl p-6 shadow-sm mb-8">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href={`/companies/${data.company?.id}`} className="font-semibold text-foreground hover:underline">
              {data.company?.name || 'Unknown Company'}
            </Link>
            <span>·</span>
            <span>{formatDistanceToNow(new Date(data.createdAt), { addSuffix: true })}</span>
            <TopicBadge topic={data.topic} />
          </div>
          
          {isOwner && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setShowDelete(true)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-6">{data.title}</h1>
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none whitespace-pre-wrap mb-6">
          {data.content}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">{data.comments?.length || 0} Comments</h3>
        {user?.company ? (
          <div className="mb-8 bg-card border rounded-xl p-4">
            <CommentForm discussionId={data.id} />
          </div>
        ) : (
          <div className="mb-8 text-sm text-muted-foreground p-4 bg-muted/30 rounded-xl border border-dashed text-center">
            You must have a company profile to comment. <Link href="/profile/company/create" className="text-primary hover:underline">Create one</Link>
          </div>
        )}

        <div className="space-y-0">
          {data.comments?.map(comment => (
            <CommentItem key={comment.id} comment={comment} discussionId={data.id} />
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Discussion"
        description="Are you sure you want to delete this discussion? All comments will also be removed."
        confirmVariant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
