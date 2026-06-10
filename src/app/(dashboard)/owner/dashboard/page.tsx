import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, BarChart3, MessageSquare } from 'lucide-react'
import api from '@/lib/api'
import { SessionBooking, User, Discussion } from '@/types'
import { getCookie } from '@/ForProxy/getCookie'

const getStatusDisplay = (status?: string) => {
  switch (status) {
    case 'VERIFIED':
      return { text: '✓ Verified', color: 'text-green-600', bgColor: 'bg-green-50' }
    case 'UNVERIFIED':
      return { text: '⚠ Pending Verification', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    default:
      return { text: 'Pending Verification', color: 'text-gray-600', bgColor: 'bg-gray-50' }
  }
}

const page = async () => {
  const token = await getCookie('accessToken')
  let stats = [
    { title: 'Company Status', value: 'Loading...', icon: Users },
    { title: 'Open Sessions', value: '0', icon: Briefcase },
    { title: 'Discussions', value: '0', icon: BarChart3 },
    { title: 'Mentors Connected', value: '0', icon: MessageSquare },
  ]
  let companyInfo: (User['company']) | null = null
  let discussions: Discussion[] = []

  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    const [userRes, bookingsRes] = await Promise.all([
      api.get('/user/me', { headers }),
      api.get('/session/booking/my', { headers }),
    ])

    const user = userRes.data.data as User
    companyInfo = user?.company
    const bookings = (bookingsRes.data.data || []) as SessionBooking[]
    const openSessions = bookings.filter((b: SessionBooking) => ['PENDING', 'CONFIRMED'].includes(b.status)).length

    let discussionCount = 0
    if (companyInfo) {
      const discussionsRes = await api.get(`/discussion/discussion?companyId=${companyInfo.id}`, { headers })
      discussions = (discussionsRes.data.data || []) as Discussion[]
      discussionCount = discussions.length
    }

    stats = [
      { title: 'Company Status', value: getStatusDisplay(companyInfo?.verificationStatus).text, icon: Users },
      { title: 'Open Sessions', value: String(openSessions), icon: Briefcase },
      { title: 'Discussions', value: String(discussionCount), icon: BarChart3 },
      { title: 'Mentors Connected', value: '0', icon: MessageSquare },
    ]
  } catch (error) {
    console.error('Failed to fetch owner dashboard:', error)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Owner Dashboard</h1>
        <p className="text-muted-foreground">Overview of your company activity, mentor connections, and session demand.</p>
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
            <CardTitle>Owner Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <Link href="/company" className="font-medium text-primary hover:underline">
                View company profile
              </Link>
              <p>Review your company details, verification status, and goals.</p>
              <Link href="/mentors" className="font-medium text-primary hover:underline">
                Browse mentors
              </Link>
              <p>Find mentors and connect with the right experts for your team.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-muted-foreground">
              {companyInfo ? (
                <>
                  <p><span className="font-semibold">Company:</span> {companyInfo.name}</p>
                  <p><span className="font-semibold">Industry:</span> {companyInfo.industry}</p>
                  <div className={`p-3 rounded-md ${getStatusDisplay(companyInfo.verificationStatus).bgColor}`}>
                    <p className={`font-semibold ${getStatusDisplay(companyInfo.verificationStatus).color}`}>
                      Status: {getStatusDisplay(companyInfo.verificationStatus).text}
                    </p>
                    {companyInfo.verificationStatus === 'UNVERIFIED' && (
                      <p className="text-xs text-gray-600 mt-2">Your company is pending verification. Complete your profile to speed up the process.</p>
                    )}
                  </div>
                </>
              ) : (
                <p>No company information available</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Suggested Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Review mentor session feedback.</li>
              <li>Approve new booking requests.</li>
              <li>Update company profile and goals.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default page