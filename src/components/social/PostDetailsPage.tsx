/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useParams, useRouter } from 'next/navigation'
import { apiService } from '@/lib/apiService'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Building2,
  FileText,
  Heart,
  Share2,
  UserPlus,
  Loader2,
  MessageCircle,
  Send,
  ChevronDown,
} from 'lucide-react'
import RepliesSection from './RepliesSection'

export default function PostDetailsPage() {
  const params = useParams()
  const user = useAuthStore(state => state.user)
  const router = useRouter()
  const queryClient = useQueryClient()

  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

  const { data, isLoading, isError } = useQuery({
    queryKey: ['post', params.id],
    queryFn: async () => {
      const res = await apiService.social.getPostById(params.id as string)
      return res.data?.data
    },
    enabled: !!params.id,
  })

  const post = data

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', params.id],
    queryFn: async () => {
      const res = await apiService.social.getComments(params.id as string)
      return res.data
    },
    enabled: !!params.id,
  })

  const comments = commentsData?.data ?? []

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
            likes: liked ? (old._count?.likes ?? 0) + 1 : Math.max((old._count?.likes ?? 1) - 1, 0),
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
      queryClient.invalidateQueries({ queryKey: ['post', params.id] })
      queryClient.invalidateQueries({ queryKey: ['social-feed'] })
      toast.success(post?.isFollowing ? 'Unfollowed company' : 'Now following company')
    },
    onError: () => toast.error('Failed to follow company'),
  })

  const createCommentMutation = useMutation({
    mutationFn: (payload: { content: string; postId?: string; parentId?: string }) =>
      apiService.social.createComment(payload),
    onSuccess: () => {
      setCommentText('')
      setReplyingTo(null)
      queryClient.invalidateQueries({ queryKey: ['comments', params.id] })
    },
    onError: () => toast.error('Failed to post comment'),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => apiService.social.deleteComment(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', params.id] }),
    onError: () => toast.error('Failed to delete comment'),
  })

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleSubmitComment = () => {
    if (!commentText.trim()) return
    createCommentMutation.mutate({
      content: commentText,
      postId: replyingTo ? undefined : params.id as string,
      parentId: replyingTo?.id,
    })
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev)
      next.has(commentId) ? next.delete(commentId) : next.add(commentId)
      return next
    })
  }

 
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <div className="h-6 w-24 rounded bg-muted animate-pulse" />
        <div className="rounded-xl border bg-card p-6 space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-3 w-full rounded bg-muted" />
            ))}
            <div className="h-3 w-3/5 rounded bg-muted" />
          </div>
          <div className="h-48 rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-3">
        <p className="text-muted-foreground">Post not found or has been removed.</p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </button>

      <article className="rounded-xl border bg-card overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-6 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
              {post.company?.logo ? (
                <Image
                  src={post.company.logo}
                  alt={post.company.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <Link
                href={`/company/${post.company?.id}`}
                className="text-sm font-semibold hover:underline truncate block"
              >
                {post.company?.name ?? 'Unknown'}
              </Link>
              <p className="text-xs text-muted-foreground">
                {format(new Date(post.createdAt), 'MMM d, yyyy · h:mm a')}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 shrink-0">
            <FileText className="h-3 w-3" />
            Post
          </span>
        </div>

        {/* Image */}
        {post.image && (
          <div className="relative w-full aspect-video bg-muted">
            <Image
              src={post.image}
              alt="Post image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 px-6 py-2 border-t border-b text-xs text-muted-foreground">
          <span>{post._count?.likes ?? 0} likes</span>
          <span>{post._count?.shares ?? 0} shares</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-3">
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
              <Heart className={cn('h-4 w-4', post.isLiked && 'fill-current')} />
              {post.isLiked ? 'Liked' : 'Like'}
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>

          {/* Follow company */}
          {post.company && user?.role !== 'ADMIN' && (
            <button
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition',
                post.isFollowing
                  ? 'text-muted-foreground hover:bg-muted'
                  : 'border-primary/30 text-primary hover:bg-primary/5'
              )}
            >
              {followMutation.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <UserPlus className="h-4 w-4" />
              }
              {post.isFollowing ? 'Following' : 'Follow Company'}
            </button>
          )}
        </div>

      </article>

      {/* Company card */}
      {post.company && (
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold">About the Company</h3>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
              {post.company.logo ? (
                <Image
                  src={post.company.logo}
                  alt={post.company.name}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{post.company.name}</p>
              {post.company.industry && (
                <p className="text-xs text-muted-foreground">{post.company.industry}</p>
              )}
            </div>
          </div>
          {post.company.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {post.company.description}
            </p>
          )}
          <Link
            href={`/company/${post.company.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition"
          >
            View Company Profile
          </Link>
        </div>
      )}

      {/* Comments Section */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Comments
        </h3>

        {/* Input */}
        <div className="flex-1 flex flex-col gap-2">
          {replyingTo && (
            <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              <span>Replying to <span className="font-medium text-foreground">{replyingTo.name}</span></span>
              <button onClick={() => setReplyingTo(null)} className="hover:text-foreground">✕</button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmitComment()}
              placeholder={replyingTo ? 'Write a reply...' : 'Write a comment...'}
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleSubmitComment}
              disabled={createCommentMutation.isPending || !commentText.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition"
            >
              {createCommentMutation.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />
              }
            </button>
          </div>
        </div>

        {/* Comments List */}
        {commentsLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment: any) => (
              <div key={comment.id} className="space-y-2">
                {/* Comment */}
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 border overflow-hidden">
                    {comment.user?.picture ? (
                      <Image src={comment.user.picture} alt={comment.user.name} width={32} height={32} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-medium">{comment.user?.name?.[0] ?? '?'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="rounded-xl bg-muted px-3 py-2">
                      <p className="text-xs font-semibold">{comment.user?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-foreground mt-0.5">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 px-1">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.createdAt), 'MMM d · h:mm a')}
                      </span>
                      <button
                        onClick={() => setReplyingTo({ id: comment.id, name: comment.user?.name ?? 'Unknown' })}
                        className="text-xs text-muted-foreground hover:text-foreground transition"
                      >
                        Reply
                      </button>
                      {comment.repliesCount > 0 && (
                        <button
                          onClick={() => toggleReplies(comment.id)}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline transition"
                        >
                          <ChevronDown className={cn('h-3 w-3 transition-transform', expandedReplies.has(comment.id) && 'rotate-180')} />
                          {expandedReplies.has(comment.id) ? 'Hide' : `${comment.repliesCount} repl${comment.repliesCount > 1 ? 'ies' : 'y'}`}
                        </button>
                      )}
                      {comment.userId === user?.id && (
                        <button
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                          className="text-xs text-red-500 hover:text-red-700 transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {expandedReplies.has(comment.id) && (
                  <RepliesSection
                    commentId={comment.id}
                    userId={user?.id}
                    onReply={(name) => setReplyingTo({ id: comment.id, name })}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}


