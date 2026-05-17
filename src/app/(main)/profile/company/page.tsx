'use client'

import { useAuthStore } from '@/stores/authStore'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/EmptyState'
import { Building2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CompanyForm } from '@/components/company/CompanyForm'
import { VerificationBadge } from '@/components/company/VerificationBadge'
import { useState } from 'react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export default function MyCompanyPage() {
  const user = useAuthStore(state => state.user)
  const [isRequesting, setIsRequesting] = useState(false)
  const queryClient = useQueryClient()

  if (!user) return null

  if (!user.company) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">My Company</h1>
        <EmptyState
          icon={Building2}
          title="No company profile yet"
          description="Set up your company profile to start posting discussions and engaging with the community."
          action={{ label: "Set up company profile", href: "/profile/company/create" }}
        />
      </div>
    )
  }

  const handleRequestVerification = async () => {
    setIsRequesting(true)
    try {
      await api.patch(`/company/company/${user.company!.id}`, { verificationStatus: 'PENDING' })
      toast.success('Verification requested successfully')
      
      const res = await api.get('/user/me')
      useAuthStore.getState().setUser(res.data.data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    } catch (error) {
      toast.error('Failed to request verification')
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Company</h1>
        <Link href={`/companies/${user.company.id}`} className={cn(buttonVariants({ variant: "outline" }))}>
          View Public Profile
        </Link>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Verification Status</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Verified companies get a badge and build more trust in the community.
          </p>
          <VerificationBadge status={user.company.verificationStatus} />
        </div>
        
        <div>
          {user.company.verificationStatus === 'UNVERIFIED' && (
            <Button onClick={handleRequestVerification} disabled={isRequesting}>
              {isRequesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request Verification
            </Button>
          )}
          {user.company.verificationStatus === 'REJECTED' && (
            <Button onClick={handleRequestVerification} disabled={isRequesting}>
              {isRequesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resubmit for Verification
            </Button>
          )}
          {user.company.verificationStatus === 'PENDING' && (
            <Button disabled variant="secondary">Verification in progress</Button>
          )}
          {user.company.verificationStatus === 'VERIFIED' && (
            <Button disabled variant="outline" className="text-green-600 border-green-200 bg-green-50">Verified</Button>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Company Details</h3>
        <CompanyForm initialData={user.company} />
      </div>
    </div>
  )
}
