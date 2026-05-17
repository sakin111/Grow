'use client'

import { Comment } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/stores/authStore'
import { useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import Link from 'next/link'

interface CommentItemProps {
  comment: Comment
  discussionId: string
}

export function CommentItem({ comment, discussionId }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const user = useAuthStore(state => state.user)
  const queryClient = useQueryClient()

  const isAuthor = user?.company?.id === comment.companyId

  const handleEdit = async () => {
    try {
      await api.patch(`/discussion/comments/${comment.id}`, { content: editContent })
      toast.success('Comment updated')
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update comment')
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/discussion/comments/${comment.id}`)
      toast.success('Comment deleted')
      queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete comment')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (comment.isDeleted) {
    return (
      <div className="py-4 border-b text-muted-foreground italic text-sm">
        This comment has been deleted.
      </div>
    )
  }

  return (
    <div className="py-6 border-b last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <Link href={`/companies/${comment.company?.id}`} className="font-semibold text-foreground hover:underline">
          {comment.company?.name || 'Unknown Company'}
        </Link>
        <span>·</span>
        <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
        {comment.isEdited && <span className="italic">(edited)</span>}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <Textarea 
            value={editContent} 
            onChange={e => setEditContent(e.target.value)} 
            className="min-h-[100px]"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleEdit}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditContent(comment.content); }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <p className="text-sm md:text-base whitespace-pre-wrap text-foreground">
          {comment.content}
        </p>
      )}

      {isAuthor && !isEditing && (
        <div className="mt-3 flex gap-4 text-sm">
          <button onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-foreground transition-colors">
            Edit
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="text-muted-foreground hover:text-destructive transition-colors">
            Delete
          </button>
        </div>
      )}

      <ConfirmDialog 
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmVariant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
