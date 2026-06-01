/* eslint-disable @typescript-eslint/no-explicit-any */
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function CompanyProfile() {
  const user = useAuthStore(state => state.user)
  const [isRequesting, setIsRequesting] = useState(false)
  const [open, setOpen] = useState(false)

  const [form, setForm] = useState({
    website: '',
    contactEmail: '',
    note: '',
  })

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
          action={{ label: "Set up company profile", href: "/company" }}
        />
      </div>
    )
  }

  const handleSubmitRequest = async () => {
    setIsRequesting(true)

    try {
      await api.post(
        `/company/${user.company!.id}/request`,
        form
      )

      toast.success('Verification request submitted')

      const res = await api.get('/user/me')
      useAuthStore.getState().setUser(res.data.data)

      queryClient.invalidateQueries({ queryKey: ['me'] })

      setOpen(false)
      setForm({ website: '', contactEmail: '', note: '' })
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Failed to request verification'
      )
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Company</h1>

        <Link
          href={`/companies/${user.company.id}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          View Public Profile
        </Link>
      </div>

      {/* VERIFICATION BOX */}
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
            <Button onClick={() => setOpen(true)}>
              Request Verification
            </Button>
          )}

          {user.company.verificationStatus === 'REJECTED' && (
            <Button onClick={() => setOpen(true)}>
              Resubmit Verification
            </Button>
          )}

          {user.company.verificationStatus === 'PENDING' && (
            <Button disabled variant="secondary">
              Verification in progress
            </Button>
          )}

          {user.company.verificationStatus === 'VERIFIED' && (
            <Button disabled variant="outline" className="text-green-600 border-green-200 bg-green-50">
              Verified
            </Button>
          )}
        </div>
      </div>

      {/* COMPANY DETAILS */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Company Details</h3>
        <CompanyForm />
      </div>

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95%] sm:max-w-md rounded-xl">
          
          <DialogHeader>
            <DialogTitle>Request Verification</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            
            {/* WEBSITE */}
            <div>
              <Label>Website</Label>
              <Input
                placeholder="https://yourcompany.com"
                value={form.website}
                onChange={(e) =>
                  setForm({ ...form, website: e.target.value })
                }
              />
            </div>

            {/* EMAIL */}
            <div>
              <Label>Contact Email</Label>
              <Input
                placeholder="admin@company.com"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm({ ...form, contactEmail: e.target.value })
                }
              />
            </div>

            {/* NOTE */}
            <div>
              <Label>Why should we verify you?</Label>
              <Textarea
                placeholder="Explain your company..."
                value={form.note}
                onChange={(e) =>
                  setForm({ ...form, note: e.target.value })
                }
              />
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleSubmitRequest}
                disabled={isRequesting}
                className="w-full"
              >
                {isRequesting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Request
              </Button>

              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}