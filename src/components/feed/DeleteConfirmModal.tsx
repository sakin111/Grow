
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import {

  Loader2
} from 'lucide-react'

import { toast } from 'sonner'
import { apiService } from '@/lib/apiService'





 export default function DeleteConfirmModal({
  postId,
  onClose,
}: {
  postId: string
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => apiService.social.deletePost(postId),
    onSuccess: () => {
      toast.success('Post deleted')
      queryClient.invalidateQueries({ queryKey: ['social-feed'] })
      onClose()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete post'),
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-background rounded-xl border shadow-lg w-full max-w-sm">
        <div className="px-6 py-5 space-y-2">
          <h2 className="text-base font-semibold">Delete Post</h2>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this post? This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
          <button
            onClick={onClose}
            disabled={mutation.isPending}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 transition disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}