import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Star, MessageSquare, UserCheck } from 'lucide-react'
import { apiService } from '@/lib/apiService'
import { Review, SessionBooking, MentorProfile } from '@/types'
import { getCookie } from '@/ForProxy/getCookie'
import { formatDistanceToNow } from 'date-fns'

const page = async () => {
  const token = await getCookie('accessToken')
  let stats = [
    { title: 'Upcoming Sessions', value: '0', icon: Calendar },
    { title: 'Average Rating', value: '0', icon: Star },
    { title: 'Unread Messages', value: '0', icon: MessageSquare },
    { title: 'New Requests', value: '0', icon: UserCheck },
  ]
  let todaysSessions: { time: string; title: string }[] = []
  let recentReviews: Review[] = []
  let reviewsFailedToLoad = false

  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    const [bookingsRes, mentorRes] = await Promise.all([
      apiService.session.getMyBookings(undefined, { headers }),
      apiService.mentor.getCurrentMentorProfile({ headers }),
    ])

    const bookings = (bookingsRes.data.data || []) as SessionBooking[]
    const upcomingSessions = bookings.filter((b: SessionBooking) => ['PENDING', 'CONFIRMED'].includes(b.status)).length
    const mentorProfile = mentorRes.data.data as MentorProfile

    if (mentorProfile?.id) {
      try {
        const reviewsQuery = new URLSearchParams({ page: '1', limit: '3' })
        const reviewsRes = await apiService.review.getMentorReviews(
          mentorProfile.id,
          reviewsQuery,
          { headers }
        )
        recentReviews = (reviewsRes.data.data || []) as Review[]
      } catch (error) {
        console.error('Failed to fetch recent mentor feedback:', error)
        reviewsFailedToLoad = true
      }
    }

    stats = [
      { title: 'Upcoming Sessions', value: String(upcomingSessions), icon: Calendar },
      { title: 'Average Rating', value: String(mentorProfile?.avgRating || '0'), icon: Star },
      { title: 'Total Reviews', value: String(mentorProfile?.totalReviews || '0'), icon: MessageSquare },
      { title: 'Active Status', value: mentorProfile?.isActive ? 'Active' : 'Inactive', icon: UserCheck },
    ]

    todaysSessions = bookings.slice(0, 3).map((booking: SessionBooking) => ({
      time: new Date(booking.createdAt).toLocaleTimeString(),
      title: `Session with ${booking.owner?.name || 'Guest'}`,
    }))
  } catch (error) {
    console.error('Failed to fetch mentor dashboard:', error)
    todaysSessions = [
      { time: 'N/A', title: 'Unable to load sessions' },
    ]
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mentor Dashboard</h1>
        <p className="text-muted-foreground">Quick access to your upcoming sessions, messages, and mentoring activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mentor Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <Link href="/sessions" className="font-medium text-primary hover:underline">
                View upcoming sessions
              </Link>
              <p>Open your session schedule and manage upcoming bookings.</p>
              <Link href="/profile/mentor" className="font-medium text-primary hover:underline">
                Update mentor profile
              </Link>
              <p>Refresh your skills, availability, and description for mentees.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-muted-foreground">
              {todaysSessions.length > 0 ? (
                todaysSessions.map((session, i) => (
                  <p key={i}><span className="font-semibold">{session.time}</span> — {session.title}</p>
                ))
              ) : (
                <p>No sessions scheduled</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {reviewsFailedToLoad ? (
              <p className="text-sm text-muted-foreground">Recent feedback could not be loaded.</p>
            ) : recentReviews.length > 0 ? (
              <ul className="divide-y">
                {recentReviews.map(review => (
                  <li key={review.id} className="space-y-2 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{review.owner?.name || 'Grow member'}</p>
                      <time
                        className="shrink-0 text-xs text-muted-foreground"
                        dateTime={review.createdAt}
                      >
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </time>
                    </div>
                    <div
                      className="flex items-center gap-1 text-amber-500"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {Array.from({ length: review.rating }, (_, index) => (
                        <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No feedback yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default page