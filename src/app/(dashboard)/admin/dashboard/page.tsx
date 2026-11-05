import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Building2, Calendar, MessageSquare, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiService } from '@/lib/apiService'
import { getCookie } from '@/ForProxy/getCookie'
import { Company, Discussion, SessionBooking, User } from '@/types'

interface ActivityItem {
  id: string
  description: string
  createdAt: string
  color: string
}

const page = async () => {
  const token = await getCookie('accessToken')
  const headers = token ? { Cookie: `accessToken=${token}` } : {}
  let stats = [
    { title: 'Total Users', value: 'Unavailable', icon: Users },
    { title: 'Companies', value: 'Unavailable', icon: Building2 },
    { title: 'Discussions', value: 'Unavailable', icon: MessageSquare },
    { title: 'Sessions', value: 'Unavailable', icon: Calendar },
  ]
  let activities: ActivityItem[] = []
  let dashboardError = false

  const [usersResult, companiesResult, discussionsResult, bookingsResult] = await Promise.allSettled([
    apiService.admin.getUsers('?limit=5', { headers }),
    apiService.admin.getCompanies('?limit=5', { headers }),
    apiService.discussion.getDiscussions('?limit=5', { headers }),
    apiService.session.getAllBookings('?limit=5', { headers }),
  ])
  const results = [usersResult, companiesResult, discussionsResult, bookingsResult]
  dashboardError = results.some(result => result.status === 'rejected')

  if (usersResult.status === 'rejected') console.error('Failed to fetch admin users:', usersResult.reason)
  if (companiesResult.status === 'rejected') console.error('Failed to fetch admin companies:', companiesResult.reason)
  if (discussionsResult.status === 'rejected') console.error('Failed to fetch admin discussions:', discussionsResult.reason)
  if (bookingsResult.status === 'rejected') console.error('Failed to fetch admin sessions:', bookingsResult.reason)

  const users = usersResult.status === 'fulfilled'
    ? (usersResult.value.data.data || []) as User[]
    : []
  const companies = companiesResult.status === 'fulfilled'
    ? (companiesResult.value.data.data || []) as Company[]
    : []
  const discussions = discussionsResult.status === 'fulfilled'
    ? (discussionsResult.value.data.data || []) as Discussion[]
    : []
  const bookings = bookingsResult.status === 'fulfilled'
    ? (bookingsResult.value.data.data || []) as SessionBooking[]
    : []

  stats = [
    {
      title: 'Total Users',
      value: usersResult.status === 'fulfilled'
        ? String(usersResult.value.data.meta?.total ?? 'Unavailable')
        : 'Unavailable',
      icon: Users,
    },
    {
      title: 'Companies',
      value: companiesResult.status === 'fulfilled'
        ? String(companiesResult.value.data.meta?.total ?? 'Unavailable')
        : 'Unavailable',
      icon: Building2,
    },
    {
      title: 'Discussions',
      value: discussionsResult.status === 'fulfilled'
        ? String(discussionsResult.value.data.meta?.total ?? 'Unavailable')
        : 'Unavailable',
      icon: MessageSquare,
    },
    {
      title: 'Sessions',
      value: bookingsResult.status === 'fulfilled'
        ? String(bookingsResult.value.data.meta?.total ?? 'Unavailable')
        : 'Unavailable',
      icon: Calendar,
    },
  ]

  activities = [
    ...users.map(user => ({
      id: `user-${user.id}`,
      description: `New user registration: ${user.name || user.email}`,
      createdAt: user.createdAt,
      color: 'bg-blue-500',
    })),
    ...companies.map(company => ({
      id: `company-${company.id}`,
      description: `Company created: ${company.name}`,
      createdAt: company.createdAt,
      color: 'bg-green-500',
    })),
    ...discussions.map(discussion => ({
      id: `discussion-${discussion.id}`,
      description: `New discussion: ${discussion.title}`,
      createdAt: discussion.createdAt,
      color: 'bg-amber-500',
    })),
    ...bookings.map(booking => ({
      id: `booking-${booking.id}`,
      description: `Session booked with ${booking.mentor?.user?.name || 'a mentor'}`,
      createdAt: booking.createdAt,
      color: 'bg-purple-500',
    })),
  ]
    .filter(activity => activity.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform statistics and moderation actions for the admin role.</p>
      </div>

      {dashboardError && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Some dashboard data could not be loaded. Unavailable metrics are marked.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <Card key={stat.title}>
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
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <Link href="/admin/users" className="font-medium text-primary hover:underline">
                Manage users
              </Link>
              <p>Review user accounts, update account status, or delete accounts.</p>
              <Link href="/admin/companies" className="font-medium text-primary hover:underline">
                Manage companies
              </Link>
              <p>Review company verification status and edit company records.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map(activity => (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${activity.color}`} />
                    <div className="flex-1 text-sm">{activity.description}</div>
                    <time
                      className="shrink-0 text-xs text-muted-foreground"
                      dateTime={activity.createdAt}
                    >
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </time>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {dashboardError ? 'Activity is unavailable.' : 'No recent activity.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default page
