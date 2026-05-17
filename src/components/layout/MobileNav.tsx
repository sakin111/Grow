'use client'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu, Home, MessageSquare, Users, Calendar, UserCircle, Shield } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useState } from 'react'

const navItems = [
  { name: 'Feed', href: '/feed', icon: Home },
  { name: 'Discussions', href: '/discussions', icon: MessageSquare },
  { name: 'Mentors', href: '/mentors', icon: Users },
  { name: 'Sessions', href: '/sessions', icon: Calendar },
  { name: 'Profile', href: '/profile', icon: UserCircle },
]

export function MobileNav() {
  const pathname = usePathname()
  const user = useAuthStore(state => state.user)
  const [open, setOpen] = useState(false)

  const items = [...navItems]
  if (user?.role === 'ADMIN') {
    items.push({ name: 'Admin', href: '/admin', icon: Shield })
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 sm:w-72">
          <div className="px-2 py-6">
            <Link href="/feed" className="flex items-center gap-2 mb-8" onClick={() => setOpen(false)}>
              <span className="text-2xl font-bold text-primary">🌱 Grow</span>
            </Link>
            <nav className="flex flex-col space-y-2">
              {items.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors',
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
        </SheetContent>
      </Sheet>

      {/* Bottom bar for mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background flex items-center justify-around p-2 pb-safe lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center p-2 rounded-lg min-w-[64px]',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] mt-1">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
