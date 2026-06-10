import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, MessageSquare, Calendar } from 'lucide-react'
import api from '@/lib/api'
import { getCookie } from '@/ForProxy/getCookie'

const page = async () => {
  const token = await getCookie('accessToken')
  let stats = [
    { title: 'Total Users', value: '0', icon: Users, change: '0%' },
    { title: 'Active Companies', value: '0', icon: Building2, change: '0%' },
    { title: 'Total Discussions', value: '0', icon: MessageSquare, change: '0%' },
    { title: 'Sessions This Month', value: '0', icon: Calendar, change: '0%' },
  ]

  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    
    const [usersRes, companiesRes, discussionsRes] = await Promise.all([
      api.get('/admin/users?limit=1', { headers }),
      api.get('/admin/companies?limit=1', { headers }),
      api.get('/discussion/discussion?limit=1', { headers }),
    ])

    const totalUsers = usersRes.data.meta?.total || 0
    const totalCompanies = companiesRes.data.meta?.total || 0
    const totalDiscussions = discussionsRes.data.meta?.total || 0

    stats = [
      { title: 'Total Users', value: String(totalUsers), icon: Users, change: '+5%' },
      { title: 'Active Companies', value: String(totalCompanies), icon: Building2, change: '+3%' },
      { title: 'Total Discussions', value: String(totalDiscussions), icon: MessageSquare, change: '+12%' },
      { title: 'Sessions This Month', value: '0', icon: Calendar, change: '0%' },
    ]
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform statistics and moderation actions for the admin role.</p>
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
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500 font-medium">{stat.change}</span> from last month
              </p>
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
              <p>Review user accounts, ban or approve users, and inspect login activity.</p>
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
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1 text-sm">New user registration: john.doe@example.com</div>
                <div className="text-xs text-muted-foreground">2 mins ago</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1 text-sm">Company TechFlow verified by admin</div>
                <div className="text-xs text-muted-foreground">1 hour ago</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <div className="flex-1 text-sm">New verification request from Innovate Ltd.</div>
                <div className="text-xs text-muted-foreground">3 hours ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default page