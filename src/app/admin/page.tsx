'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, MessageSquare, Calendar } from 'lucide-react'

// Hardcoded for demo since specific admin stats endpoint was not detailed
export default function AdminDashboardPage() {
  const stats = [
    { title: 'Total Users', value: '1,234', icon: Users, change: '+12%' },
    { title: 'Active Companies', value: '456', icon: Building2, change: '+5%' },
    { title: 'Total Discussions', value: '8,901', icon: MessageSquare, change: '+22%' },
    { title: 'Sessions This Month', value: '345', icon: Calendar, change: '+18%' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform statistics and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
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
