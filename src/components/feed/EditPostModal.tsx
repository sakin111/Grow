
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cn } from '@/lib/utils'
import {
 
  Loader2,  X,
} from 'lucide-react'

import { toast } from 'sonner'
import { apiService } from '@/lib/apiService'
import { Post } from './FeedPage'

const TOPICS = ['MARKETING', 'FUNDING', 'HIRING', 'OPERATIONS', 'TECH', 'GENERAL'] as const
export type Topic = typeof TOPICS[number]



export default function EditPostModal({
  post,
  onClose,
}: {
  post: Post
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState(post.content)
  const [topic, setTopic] = useState<Topic>(post.topic as Topic)

  const mutation = useMutation({
    mutationFn: () => apiService.social.updatePost(post.id, { content, topic }),
    onSuccess: () => {
      toast.success('Post updated')
      queryClient.invalidateQueries({ queryKey: ['social-feed'] })
      queryClient.invalidateQueries({ queryKey: ['post', post.id] })
      onClose()
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update post'),
  })

  const canSubmit = content.trim().length > 0 && topic !== undefined

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-background rounded-xl border shadow-lg w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold">Edit Post</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
              maxLength={2000}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground text-right">{content.length}/2000</p>
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Topic</label>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium border transition',
                    topic === t
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
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
            disabled={!canSubmit || mutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}