'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Discussion, Meta, Topic } from '@/types'
import { DiscussionCard } from '@/components/discussion/DiscussionCard'
import { SearchInput } from '@/components/shared/SearchInput'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MessageSquarePlus,
  FileText,
  
} from 'lucide-react'
import { apiService } from '@/lib/apiService'
import PostCard from './PostCard'




type FeedTab = 'posts' | 'discussions'

export type Post = {
  id: string
  content: string
  createdAt: string
  topic: string
  author?: { id: string; name: string; avatar?: string }
  company?: { id: string; name: string; logo?: string }
  likesCount?: number
  isLiked?: boolean
  isFollowing?: boolean
}







function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-xl border bg-card p-5 space-y-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-muted" />
            <div className="space-y-1.5">
              <div className="h-3 w-32 rounded bg-muted" />
              <div className="h-2.5 w-20 rounded bg-muted" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-4/5 rounded bg-muted" />
            <div className="h-3 w-3/5 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}



export default function FeedPage() {
  const [tab, setTab] = useState<FeedTab>('posts')
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [topic, setTopic] = useState<Topic | 'ALL'>('ALL')
  const user = useAuthStore(state => state.user)

  const handleTabChange = (t: FeedTab) => {
    setTab(t)
    setPage(1)
    setSearchTerm('')
    setTopic('ALL')
  }

  // Posts query
  const postsQuery = useQuery({
    queryKey: ['social-feed', page, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '10' })
      if (searchTerm) params.append('searchTerm', searchTerm)
      const res = await apiService.social.getFeed(params)
      return res.data
    },
    enabled: tab === 'posts',
  })

  // Discussions query
  const discussionsQuery = useQuery({
    queryKey: ['discussions', 'feed', page, searchTerm, topic],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        isPublic: 'true',
        sort: '-createdAt',
      })
      if (searchTerm) params.append('searchTerm', searchTerm)
      if (topic && topic !== 'ALL') params.append('topic', topic)
      const res = await apiService.discussion.getDiscussions(params)
      return res.data
    },
    enabled: tab === 'discussions',
  })

  const posts: Post[] = postsQuery.data?.data || []
  const discussions: Discussion[] = discussionsQuery.data?.data || []
  const postsMeta: Meta = postsQuery.data?.meta
  const discussionsMeta: Meta = discussionsQuery.data?.meta
  const isLoading = tab === 'posts' ? postsQuery.isLoading : discussionsQuery.isLoading

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

      {/* ── Main Feed ── */}
      <div className="lg:col-span-3 space-y-6">

        {/* Page title + create buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Feed</h1>
          {user?.role === 'OWNER' && (
            <div className="flex items-center gap-2">
              <Link
                href="/social/create"
                className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
              >
                <FileText className="mr-1.5 h-4 w-4" />
                New Post
              </Link>
              <Link
                href="/discussions/create"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                <MessageSquarePlus className="mr-1.5 h-4 w-4" />
                New Discussion
              </Link>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
          <button
            onClick={() => handleTabChange('posts')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition',
              tab === 'posts'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <FileText className="h-4 w-4" />
            Posts
          </button>
          <button
            onClick={() => handleTabChange('discussions')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition',
              tab === 'discussions'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <MessageSquarePlus className="h-4 w-4" />
            Discussions
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={(v) => { setSearchTerm(v); setPage(1) }}
              placeholder={tab === 'posts' ? 'Search posts...' : 'Search discussions...'}
            />
          </div>
          {tab === 'discussions' && (
            <Select value={topic} onValueChange={(v) => { setTopic(v as Topic | 'ALL'); setPage(1) }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Topics</SelectItem>
                <SelectItem value="MARKETING">Marketing</SelectItem>
                <SelectItem value="FUNDING">Funding</SelectItem>
                <SelectItem value="HIRING">Hiring</SelectItem>
                <SelectItem value="OPERATIONS">Operations</SelectItem>
                <SelectItem value="TECH">Tech</SelectItem>
                <SelectItem value="GENERAL">General</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Feed content */}
        {isLoading ? (
          <FeedSkeleton />
        ) : tab === 'posts' ? (
          posts.length > 0 ? (
            <>
              <div className="space-y-4">
                {posts.map(post => <PostCard key={post.id} post={post} />)}
              </div>
              <Pagination meta={postsMeta} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState
              icon={FileText}
              title="No posts yet"
              description="Posts from companies you follow will appear here."
              action={user?.role === 'OWNER' ? { label: 'Create Post', href: '/social/create' } : undefined}
            />
          )
        ) : (
          discussions.length > 0 ? (
            <>
              <div className="space-y-4">
                {discussions.map(discussion => (
                  <DiscussionCard key={discussion.id} discussion={discussion} />
                ))}
              </div>
              <Pagination meta={discussionsMeta} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState
              icon={MessageSquarePlus}
              title="No discussions found"
              description="Be the first to start a conversation on this topic."
              action={user?.role === 'OWNER' ? { label: 'Create Discussion', href: '/discussions/create' } : undefined}
            />
          )
        )}
      </div>

      {/* ── Sidebar ── */}
      <div className="hidden lg:block space-y-6">
        {/* Company card */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-sm">Your Company</h3>
          {user?.company ? (
            <div className="space-y-1">
              <Link
                href={`/company/${user.company.id}`}
                className="text-sm font-medium text-primary hover:underline block truncate"
              >
                {user.company.name}
              </Link>
              <p className="text-xs text-muted-foreground">{user.company.verificationStatus}</p>
            </div>
          ) : user?.role === 'OWNER' ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">You have not set up your company profile yet.</p>
              <Link
                href="/company"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-center')}
              >
                Create Company
              </Link>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Company profiles are for owners.</p>
          )}
        </div>

        {/* Quick links */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-sm">Quick Links</h3>
          <div className="space-y-1.5 text-sm">
            <Link href="/discussions" className="block text-muted-foreground hover:text-foreground transition">
              All Discussions
            </Link>
            <Link href="/mentor" className="block text-muted-foreground hover:text-foreground transition">
              Find a Mentor
            </Link>
            <Link href="/profile" className="block text-muted-foreground hover:text-foreground transition">
              My Profile
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}