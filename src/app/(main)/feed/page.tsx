'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Discussion, Meta, Topic } from '@/types'
import { DiscussionCard } from '@/components/discussion/DiscussionCard'
import { SearchInput } from '@/components/shared/SearchInput'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { MessageSquarePlus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Skeleton } from 'boneyard-js/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function FeedPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [topic, setTopic] = useState<Topic | 'ALL'>('ALL')
  const user = useAuthStore(state => state.user)

  const { data, isLoading } = useQuery({
    queryKey: ['discussions', 'feed', page, searchTerm, topic],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        isPublic: 'true',
        sort: '-createdAt'
      })
      if (searchTerm) params.append('searchTerm', searchTerm)
      if (topic && topic !== 'ALL') params.append('topic', topic)
      
      const res = await api.get(`/discussion/discussion?${params.toString()}`)
      return res.data
    }
  })

  const discussions: Discussion[] = data?.data || []
  const meta: Meta = data?.meta

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Community Feed</h1>
          {user?.role === 'OWNER' && (
            <Link href="/discussions/create" className={cn(buttonVariants({ variant: "default" }))}>
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              New Discussion
            </Link>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={(v) => { setSearchTerm(v); setPage(1); }}
              placeholder="Search discussions..."
            />
          </div>
          <Select value={topic} onValueChange={(v) => { setTopic(v as Topic | 'ALL'); setPage(1); }}>
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
        </div>

        <Skeleton name="feed-page" loading={isLoading}>
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : discussions.length > 0 ? (
            <>
              <div className="space-y-4">
                {discussions.map(discussion => (
                  <DiscussionCard key={discussion.id} discussion={discussion} />
                ))}
              </div>
              <Pagination meta={meta} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState
              icon={MessageSquarePlus}
              title="No discussions found"
              description="Be the first to start a conversation on this topic."
              action={user?.role === 'OWNER' ? { label: "Create Discussion", href: "/discussions/create" } : undefined}
            />
          )}
        </Skeleton>
      </div>

      <div className="hidden lg:block space-y-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold mb-4">Your Company</h3>
          {user?.company ? (
            <div>
              <Link href={`/company/${user.company.id}`} className="font-medium text-primary hover:underline">
                {user.company.name}
              </Link>
              <p className="text-sm text-muted-foreground mt-1">{user.company.verificationStatus}</p>
            </div>
          ) : user?.role === 'OWNER' ? (
            <div className="text-sm text-muted-foreground space-y-4">
              <p>You have not set up your company profile yet.</p>
              <Link href="/company" className={cn(buttonVariants({ variant: "outline" }), "w-full flex justify-center")}>
                Create Company
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Company profiles are for owners.</p>
          )}
        </div>
      </div>
    </div>
  )
}
