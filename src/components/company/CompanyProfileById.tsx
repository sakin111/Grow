'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Company, Discussion } from '@/types'
import { VerificationBadge } from '@/components/company/VerificationBadge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DiscussionCard } from '@/components/discussion/DiscussionCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { MessageSquare, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'


export default function CompanyProfileById({ params }: { params: { id: string } }) {
  const { id } = params

  const { data: company, isLoading, error } = useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const res = await api.get(`/company/company/${id}`)
      return res.data.data as Company
    }
  })

  const { data: discussionsData, isLoading: isLoadingDiscussions } = useQuery({
    queryKey: ['discussions', 'company', id],
    queryFn: async () => {
      const res = await api.get(`/discussion/discussion?companyId=${id}&isPublic=true`)
      return res.data.data as Discussion[]
    },
    enabled: !!company
  })

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
  if (error || !company) return <div className="text-center py-12 text-muted-foreground">Company not found.</div>

  const discussions = discussionsData || []

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-card border rounded-xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <VerificationBadge status={company.verificationStatus} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{company.industry}</span>
              <span>·</span>
              <span>{company.size} employees</span>
              <span>·</span>
              <span>{company.stage} Stage</span>
            </div>
          </div>
        </div>
        <p className="text-base text-foreground whitespace-pre-wrap max-w-3xl">
          {company.description}
        </p>
      </div>

      <Tabs defaultValue="discussions" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="discussions">Discussions ({discussions.length})</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="discussions" className="space-y-4">
          {isLoadingDiscussions ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : discussions.length > 0 ? (
            discussions.map(discussion => (
              <DiscussionCard key={discussion.id} discussion={discussion} showCompany={false} />
            ))
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="No discussions yet"
              description="This company hasn't posted any public discussions."
            />
          )}
        </TabsContent>
        
        <TabsContent value="about">
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Owner</h3>
              {company.owner ? (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {company.owner.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{company.owner.name}</div>
                    <div className="text-sm text-muted-foreground">Company Owner</div>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">Information unavailable</span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div>
                <h3 className="font-semibold mb-1 text-sm text-muted-foreground">Member Since</h3>
                <p>{formatDistanceToNow(new Date(company.createdAt), { addSuffix: true })}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-sm text-muted-foreground">Verification Status</h3>
                <div className="flex items-center gap-2">
                  <VerificationBadge status={company.verificationStatus} />
                  {company.verifiedAt && (
                    <span className="text-sm text-muted-foreground">
                      ({new Date(company.verifiedAt).toLocaleDateString()})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
