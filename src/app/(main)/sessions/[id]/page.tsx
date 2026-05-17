'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { SessionBooking } from '@/types'
import { SessionStatusBadge } from '@/components/session/SessionStatusBadge'
import { ReviewForm } from '@/components/session/ReviewForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, ArrowLeft, Video, Clock, Star } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useAuthStore } from '@/stores/authStore'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useVideoStore } from '@/stores/videoStore'

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const user = useAuthStore(state => state.user)
  const setLiveKitConfig = useVideoStore(state => state.setLiveKitConfig)
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isStartingSession, setIsStartingSession] = useState(false)

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['session', id],
    queryFn: async () => {
      const res = await api.get(`/session/${id}`)
      return res.data.data as SessionBooking
    }
  })

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
  if (error || !booking) return <div className="text-center py-12 text-muted-foreground">Booking not found.</div>

  const isMentor = user?.role === 'MENTOR'
  const isOwner = user?.role === 'OWNER'

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdatingStatus(true)
    try {
      await api.patch(`/session/${id}/status`, { status: newStatus })
      toast.success(`Booking ${newStatus.toLowerCase()}`)
      queryClient.invalidateQueries({ queryKey: ['session', id] })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleStartSession = async () => {
    setIsStartingSession(true)
    try {
      const res = await api.post(`/session/${id}/start`)
      const { token, serverUrl, roomName } = res.data.data
      setLiveKitConfig({ token, serverUrl, roomName })
      router.push(`/session/${id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start session')
      setIsStartingSession(false)
    }
  }

  const handleJoinSession = async () => {
    setIsStartingSession(true)
    try {
      const res = await api.get(`/session/${id}/join`)
      const { token, serverUrl, roomName } = res.data.data
      setLiveKitConfig({ token, serverUrl, roomName })
      router.push(`/session/${id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to join session')
      setIsStartingSession(false)
    }
  }

  // Calculate if session is joinable (15 mins before start)
  const isJoinable = new Date(booking.startTime).getTime() - Date.now() <= 15 * 60 * 1000

  return (
    <div className="max-w-4xl mx-auto py-6">
      <Link href="/sessions" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Sessions
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <CardTitle>Session Details</CardTitle>
              <SessionStatusBadge status={booking.status} type="booking" />
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{format(new Date(booking.startTime), 'EEEE, MMMM d, yyyy')}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <div className="flex-1 space-y-3 border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Owner</h4>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={booking.owner?.picture || ''} />
                      <AvatarFallback>{booking.owner?.name?.charAt(0) || 'O'}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{booking.owner?.name}</div>
                  </div>
                </div>

                <div className="flex-1 space-y-3 border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Mentor</h4>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={booking.mentor?.user?.picture || ''} />
                      <AvatarFallback>{booking.mentor?.user?.name?.charAt(0) || 'M'}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{booking.mentor?.user?.name}</div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t flex flex-wrap gap-3">
                {booking.status === 'PENDING' && (
                  <>
                    {isMentor && (
                      <Button onClick={() => handleStatusUpdate('CONFIRMED')} disabled={isUpdatingStatus}>
                        Confirm Booking
                      </Button>
                    )}
                    <Button variant="destructive" onClick={() => handleStatusUpdate('CANCELLED')} disabled={isUpdatingStatus}>
                      Cancel Booking
                    </Button>
                  </>
                )}

                {booking.status === 'CONFIRMED' && (
                  <>
                    {isMentor ? (
                      <Button onClick={handleStartSession} disabled={isStartingSession}>
                        {isStartingSession ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
                        Start Session
                      </Button>
                    ) : (
                      <Button onClick={handleJoinSession} disabled={!isJoinable || isStartingSession}>
                        {isStartingSession ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
                        {isJoinable ? 'Join Session' : 'Join available 15m before'}
                      </Button>
                    )}
                    <Button variant="destructive" onClick={() => handleStatusUpdate('CANCELLED')} disabled={isUpdatingStatus}>
                      Cancel Booking
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {booking.status === 'COMPLETED' && (
            <Card>
              <CardHeader>
                <CardTitle>Session Review</CardTitle>
              </CardHeader>
              <CardContent>
                {booking.review ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-5 w-5 ${i < booking.review!.rating ? 'fill-current' : 'text-muted'}`} />
                        ))}
                      </div>
                      <span className="font-medium">{booking.review.rating}/5</span>
                    </div>
                    <p className="text-muted-foreground italic">"{booking.review.comment}"</p>
                  </div>
                ) : (
                  isOwner ? (
                    <ReviewForm bookingId={booking.id} mentorId={booking.mentorId} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Waiting for owner to leave a review.</p>
                  )
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Video Room Status</CardTitle>
            </CardHeader>
            <CardContent>
              {booking.videoSession ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <SessionStatusBadge status={booking.videoSession.status} type="video" />
                  </div>
                  {booking.videoSession.status === 'LIVE' && booking.status === 'CONFIRMED' && (
                    <Button className="w-full" onClick={isMentor ? handleStartSession : handleJoinSession}>
                      Enter Room
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Video room has not been created yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
