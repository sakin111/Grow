/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Company, Meta } from '@/types'
import { useState } from 'react'
import { SearchInput } from '@/components/shared/SearchInput'
import { Pagination } from '@/components/shared/Pagination'
import { VerificationBadge } from '@/components/company/VerificationBadge'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import ReviewModal, { ReviewAction } from '@/components/admin/AdminVerifyModal'

export default function AdminCompaniesPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-companies', page, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (searchTerm) params.append('searchTerm', searchTerm)
      const res = await api.get(`/company/getAllCompanies?${params.toString()}`)
      return res.data
    },
  })

   

  const companies: Company[] = data?.data || []
  const meta: Meta = data?.meta

  const openReviewModal = (company: Company, status: 'VERIFIED' | 'REJECTED') => {
    const vr = (company as any).verificationRequests?.[0] ?? null
    setReviewAction({
      companyId: company.id,
      companyName: company.name,
      requestId: vr?.id ?? '',
      status,
      verificationRequest: (company as any).verificationRequests?.[0] ?? null,
    })
  }

  const handleConfirm = async (adminNote: string) => {
    if (!reviewAction) return
    setIsSubmitting(true)
    try {
      await api.patch(`/admin/verification/${reviewAction.companyId}/review`, {
        status: reviewAction.status,
        adminNote: adminNote || undefined,
      })
      toast.success('Company verification status updated successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
      setReviewAction(null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update verification status')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Company Management</h1>
      </div>

      <div className="max-w-md">
        <SearchInput
          value={searchTerm}
          onChange={(v) => { setSearchTerm(v); setPage(1) }}
          placeholder="Search companies..."
        />
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Industry / Size</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Verification</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : companies.length > 0 ? (
              companies.map((company) => (
                <tr key={company.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{company.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {company.industry}
                    <br />
                    <span className="text-xs">{company.size}</span>
                  </td>
                  <td className="px-4 py-3">{company.owner?.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(company.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <VerificationBadge status={company.verificationStatus} />
                  </td>
                  <td className="px-4 py-3">
                    {company.verificationStatus === 'PENDING' ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-md border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 transition hover:bg-green-100"
                          onClick={() => openReviewModal(company, 'VERIFIED')}
                        >
                          Verify
                        </button>
                        <button
                          className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                          onClick={() => openReviewModal(company, 'REJECTED')}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {company.verificationStatus === 'VERIFIED'
                          ? 'Already verified'
                          : company.verificationStatus === 'REJECTED'
                          ? 'Already rejected'
                          : 'No pending request'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  No companies found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />

      {reviewAction && (
        <ReviewModal
          action={reviewAction}
          onClose={() => !isSubmitting && setReviewAction(null)}
          onConfirm={handleConfirm}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}