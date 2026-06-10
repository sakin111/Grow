'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, MessageSquare, Users, Calendar, UserCircle, Shield, Briefcase } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { getDefaultDashboardRoute } from '@/lib/auth-utils'

const navItems = [
  { name: 'Feed', href: '/feed', icon: Home },
  { name: 'Discussions', href: '/discussions', icon: MessageSquare },
  { name: 'Mentors', href: '/mentors', icon: Users },
  { name: 'Sessions', href: '/sessions', icon: Calendar },
  { name: 'Profile', href: '/profile', icon: UserCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore(state => state.user)

  const dashboardItem = user?.role
    ? {
        ADMIN: { name: 'Dashboard', href: getDefaultDashboardRoute(user.role), icon: Shield },
        OWNER: { name: 'Dashboard', href: getDefaultDashboardRoute(user.role), icon: Briefcase },
        MENTOR: { name: 'Dashboard', href: getDefaultDashboardRoute(user.role), icon: Calendar },
      }[user.role]
    : null

  const items = [
    ...(dashboardItem ? [dashboardItem] : []),
    ...navItems,
  ]

  if (user?.role === 'ADMIN') {
    items.push({ name: 'Admin', href: '/admin', icon: Shield })
  }

  return (
    <div className="hidden lg:flex w-64 flex-col border-r bg-card min-h-screen">
      <div className="p-6">
        <Link href="/feed" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">🌱 Grow</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-2">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
