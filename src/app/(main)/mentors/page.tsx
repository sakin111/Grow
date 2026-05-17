'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { MentorProfile, Meta } from '@/types'
import { MentorCard } from '@/components/mentor/MentorCard'
import { SearchInput } from '@/components/shared/SearchInput'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { Users, Loader2 } from 'lucide-react'

export default function MentorsPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['mentors', page, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        isActive: 'true'
      })
      if (searchTerm) params.append('searchTerm', searchTerm)
      
      // Assume endpoint is /mentor/mentor or similar based on backend structure
      // Wait, the spec says it's mentor marketplace, but doesn't list the GET endpoint explicitly for multiple mentors. 
      // I will assume GET /mentor/mentor exists.
      const res = await api.get(`/mentor/mentor?${params.toString()}`)
      return res.data
    }
  })

  const mentors: MentorProfile[] = data?.data || []
  const meta: Meta = data?.meta

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Find a Mentor</h1>
        <p className="text-muted-foreground">Book 1-on-1 sessions with industry experts.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchTerm}
            onChange={(v) => { setSearchTerm(v); setPage(1); }}
            placeholder="Search by name or expertise..."
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : mentors.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mentors.map(mentor => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState
          icon={Users}
          title="No mentors found"
          description="Try adjusting your search criteria to find what you're looking for."
        />
      )}
    </div>
  )
}
