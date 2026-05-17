'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Company, Meta } from '@/types'
import { useState } from 'react'
import { SearchInput } from '@/components/shared/SearchInput'
import { Pagination } from '@/components/shared/Pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VerificationBadge } from '@/components/company/VerificationBadge'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminCompaniesPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()
  
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-companies', page, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (searchTerm) params.append('searchTerm', searchTerm)
      const res = await api.get(`/company/company?${params.toString()}`)
      return res.data
    }
  })

  const companies: Company[] = data?.data || []
  const meta: Meta = data?.meta

  const handleVerifyChange = async (companyId: string, status: string) => {
    setUpdatingId(companyId)
    try {
      await api.patch(`/admin/companies/${companyId}/verify`, { status })
      toast.success(`Verification status updated`)
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update verification status')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Company Management</h1>
      </div>

      <div className="max-w-md">
        <SearchInput value={searchTerm} onChange={v => { setSearchTerm(v); setPage(1); }} placeholder="Search companies..." />
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
              <tr><td colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
            ) : companies.length > 0 ? (
              companies.map(company => (
                <tr key={company.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{company.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {company.industry}<br/>
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
                    <Select 
                      value={company.verificationStatus || 'UNVERIFIED'} 
                      onValueChange={(status) => handleVerifyChange(company.id, status || 'UNVERIFIED')}
                      disabled={updatingId === company.id}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNVERIFIED">Unverified</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="VERIFIED">Verified</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No companies found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  )
}
