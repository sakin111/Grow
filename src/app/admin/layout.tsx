'use client'

import { AuthGuard } from '@/components/layout/AuthGuard'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = useAuthStore(state => state.user)
  const isLoading = useAuthStore(state => state.isLoading)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user && user.role !== 'ADMIN') {
      router.push('/feed')
    }
  }, [user, isLoading, router])

  if (isLoading || (user && user.role !== 'ADMIN')) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col pb-16 lg:pb-0">
          <Navbar />
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
