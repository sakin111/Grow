'use client'

import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/lib/apiService'
import { MentorProfile, Meta, Review } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookingForm } from '@/components/mentor/BookingForm'
import { AvailabilityGrid } from '@/components/mentor/AvailabilityGrid'
import { Loader2, Star, Coins, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Pagination } from '@/components/shared/Pagination'
import { formatDistanceToNow } from 'date-fns'


export default function MentorById() {
  const { id } = useParams() as { id: string }
  const [selectedSlot, setSelectedSlot] = useState<{start: string, end: string} | null>(null)
  const [reviewPage, setReviewPage] = useState(1)

  const { data: mentor, isLoading, error } = useQuery({
    queryKey: ['mentor', id],
    queryFn: async () => {
      const res = await apiService.mentor.getMentorProfile(id)
      return res.data.data as MentorProfile
    }
  })

  const {
    data: availability = [],
    isLoading: isLoadingAvailability,
    isError: availabilityError,
    refetch: refetchAvailability,
  } = useQuery({
    queryKey: ['mentor-availability', id],
    queryFn: async () => {
      const response = await apiService.mentor.getAvailability(id)
      return response.data.data as MentorProfile['availability']
    },
    enabled: Boolean(id),
  })

  const { data: reviewsResponse, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['mentor-reviews', id, reviewPage],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(reviewPage), limit: '5' })
      const response = await apiService.review.getMentorReviews(id, params)
      return response.data
    },
  })

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
  if (error || !mentor) return <div className="text-center py-12 text-muted-foreground">Mentor not found.</div>

  const handleSelectSlot = (start: string, end: string) => {
    setSelectedSlot({ start, end })
  }

  const reviews: Review[] = reviewsResponse?.data || []
  const reviewMeta: Meta | undefined = reviewsResponse?.meta

  return (
    <div className="max-w-5xl mx-auto py-6">
      <Link href="/mentors" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Mentors
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card border rounded-xl p-8 shadow-sm flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
              <AvatarImage src={mentor.user?.picture || ''} />
              <AvatarFallback className="text-3xl">{mentor.user?.name?.charAt(0) || 'M'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{mentor.user?.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-semibold">{mentor.avgRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({mentor.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-primary bg-primary/10 px-2 py-0.5 rounded text-sm">
                  <Coins className="h-4 w-4" />
                  <span>{mentor.Token} tokens / session</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {mentor.categories.map(cat => (
                  <Badge key={cat} variant="secondary">{cat}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">About me</h3>
              <p className="text-foreground whitespace-pre-wrap">{mentor.bio}</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map(exp => (
                  <Badge key={exp} variant="outline" className="text-sm py-1">{exp}</Badge>
                ))}
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Reviews</h2>
            {isLoadingReviews ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : reviews.length > 0 ? (
              <>
                <ul className="divide-y border-y">
                  {reviews.map(review => (
                    <li key={review.id} className="space-y-2 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{review.owner?.name || 'Grow member'}</p>
                        <time className="text-xs text-muted-foreground" dateTime={review.createdAt}>
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </time>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
                        {Array.from({ length: review.rating }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </li>
                  ))}
                </ul>
                {reviewMeta && <Pagination meta={reviewMeta} onPageChange={setReviewPage} />}
              </>
            ) : (
              <p className="border-y py-6 text-sm text-muted-foreground">No reviews yet.</p>
            )}
          </section>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-24">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg">Book a Session</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {mentor.isActive ? (
                <>
                  <AvailabilityGrid
                    availability={availability || []}
                    isLoading={isLoadingAvailability}
                    hasError={availabilityError}
                    onRetry={() => void refetchAvailability()}
                    selectedStartTime={selectedSlot?.start}
                    onSelectSlot={handleSelectSlot}
                  />

                  <div className="pt-4 border-t">
                    <BookingForm
                      mentorId={mentor.id}
                      selectedStartTime={selectedSlot?.start}
                      selectedEndTime={selectedSlot?.end}
                    />
                  </div>
                </>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  This mentor is currently unavailable for bookings.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
