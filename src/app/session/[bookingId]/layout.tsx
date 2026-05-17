import { AuthGuard } from '@/components/layout/AuthGuard'

export default function SessionLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="h-screen w-screen overflow-hidden bg-background">
        {children}
      </div>
    </AuthGuard>
  )
}
