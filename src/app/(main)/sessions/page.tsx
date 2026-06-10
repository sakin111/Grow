'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { SessionBooking, Meta, BookingStatus } from '@/types'
import { BookingCard } from '@/components/session/BookingCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Loader2 } from 'lucide-react'

export default function SessionsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<BookingStatus | 'ALL'>('ALL')

  const { data, isLoading } = useQuery({
    queryKey: ['sessions', page, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      })
      if (status !== 'ALL') params.append('status', status)
      
      const res = await api.get(`/session/booking/my?${params.toString()}`)
      return res.data
    }
  })

  const bookings: SessionBooking[] = data?.data || []
  const meta: Meta = data?.meta

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Sessions</h1>
        <p className="text-muted-foreground">Manage your 1-on-1 mentor bookings.</p>
      </div>

      <Tabs defaultValue="ALL" onValueChange={(v) => { setStatus(v as BookingStatus | 'ALL'); setPage(1); }}>
        <TabsList className="mb-6">
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="CONFIRMED">Confirmed</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={status} className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : bookings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {bookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
              <Pagination meta={meta} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No sessions found"
              description="You don't have any bookings matching this status."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
