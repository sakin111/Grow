import { Discussion } from '@/types'
import { TopicBadge } from '@/components/shared/TopicBadge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MessageSquare, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface DiscussionCardProps {
  discussion: Discussion
  showCompany?: boolean
}

export function DiscussionCard({ discussion, showCompany = true }: DiscussionCardProps) {
  return (
    <Link href={`/discussions/${discussion.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer mb-4">
        <CardHeader className="py-4">
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-lg font-semibold line-clamp-2">{discussion.title}</h3>
            <TopicBadge topic={discussion.topic} />
          </div>
        </CardHeader>
        <CardContent className="py-0 pb-4">
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {discussion.content}
          </p>
          <div className="flex items-center text-xs text-muted-foreground gap-4">
            {showCompany && discussion.company && (
              <span className="font-medium text-foreground hover:underline">
                {discussion.company.name}
              </span>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{discussion._count?.comments || 0} comments</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
