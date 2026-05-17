'use client'

import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MobileNav } from './MobileNav'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="lg:hidden">
        <MobileNav />
      </div>
      <div className="flex-1 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full" />}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.picture || ''} alt={user?.name || ''} />
              <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
