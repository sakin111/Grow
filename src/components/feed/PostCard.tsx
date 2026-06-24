/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  FileText, Heart, Share2, ExternalLink, Building2,
  Loader2, UserPlus, MoreHorizontal, Pencil, Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { apiService } from '@/lib/apiService'
import Image from 'next/image'
import { Post } from './FeedPage'
import DeleteConfirmModal from './DeleteConfirmModal'
import EditPostModal from './EditPostModal'

const TOPICS = ['MARKETING', 'FUNDING', 'HIRING', 'OPERATIONS', 'TECH', 'GENERAL'] as const
export type Topic = typeof TOPICS[number]

// ─── Edit Modal ───────────────────────────────────────────────────────────────


// ─── Delete Confirm Modal ─────────────────────────────────────────────────────


// ─── Post Card ────────────────────────────────────────────────────────────────
export default function PostCard({ post }: { post: Post }) {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const isOwner = (user as any)?.company?.id === post.company?.id

  const likeMutation = useMutation({
    mutationFn: () => apiService.social.toggleLike({ postId: post.id }),
    onSuccess: (res) => {
      const liked = res.data?.data?.liked
      queryClient.setQueryData(['post', post.id], (old: any) => {
        if (!old) return old
        return {
          ...old,
          isLiked: liked,
          _count: {
            ...old._count,
            likes: liked
              ? (old._count?.likes ?? 0) + 1
              : Math.max((old._count?.likes ?? 1) - 1, 0),
          },
        }
      })
      queryClient.invalidateQueries({ queryKey: ['social-feed'] })
    },
    onError: () => toast.error('Failed to like post'),
  })

  const followMutation = useMutation({
    mutationFn: () => apiService.social.followCompany({ followingId: post.company?.id ?? '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] })
      toast.success(post.isFollowing ? 'Unfollowed company' : 'Following company')
    },
    onError: () => toast.error('Failed to follow company'),
  })

  const handleShare = async () => {
    const url = `${window.location.origin}/social/post/${post.id}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  return (
    <>
      <article className="rounded-xl border bg-card p-5 space-y-4 hover:shadow-sm transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
              {post.company?.logo
                ? <Image src={post.company.logo} alt={post.company.name} width={36} height={36} className="h-full w-full object-cover" />
                : <Building2 className="h-4 w-4 text-muted-foreground" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {post.company?.name ?? post.author?.name ?? 'Unknown'}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(post.createdAt), 'MMM d, yyyy · h:mm a')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Post badge */}
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              <FileText className="h-3 w-3" />
              Post
            </span>

            {/* Owner actions menu */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="rounded-md p-1 hover:bg-muted transition"
                >
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </button>
                {menuOpen && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-7 z-20 w-36 rounded-lg border bg-background shadow-md py-1">
                      <button
                        onClick={() => { setShowEdit(true); setMenuOpen(false) }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Post
                      </button>
                      <button
                        onClick={() => { setShowDelete(true); setMenuOpen(false) }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Post
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap line-clamp-4">
          {post.content}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1 border-t">
          <div className="flex items-center gap-1">
            {/* Like */}
            <button
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                post.isLiked
                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Heart className={cn('h-3.5 w-3.5', post.isLiked && 'fill-current')} />
              {post.likesCount ?? 0}
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Follow company */}
            {post.company && !isOwner && user?.role !== 'ADMIN' && (
              <button
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  post.isFollowing
                    ? 'border text-muted-foreground hover:bg-muted'
                    : 'border border-primary/30 text-primary hover:bg-primary/5'
                )}
              >
                {followMutation.isPending
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <UserPlus className="h-3.5 w-3.5" />
                }
                {post.isFollowing ? 'Following' : 'Follow'}
              </button>
            )}

            {/* View full post */}
            <Link
              href={`/social/post/${post.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View
            </Link>
          </div>
        </div>
      </article>

      {showEdit && <EditPostModal post={post} onClose={() => setShowEdit(false)} />}
      {showDelete && <DeleteConfirmModal postId={post.id} onClose={() => setShowDelete(false)} />}
    </>
  )
}