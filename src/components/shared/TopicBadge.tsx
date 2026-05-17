import { Topic } from '@/types'
import { Badge } from '@/components/ui/badge'

const topicColorMap: Record<Topic, string> = {
  MARKETING: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  FUNDING: 'bg-green-100 text-green-800 hover:bg-green-200',
  HIRING: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  OPERATIONS: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  TECH: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
  GENERAL: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
}

interface TopicBadgeProps {
  topic: Topic
}

export function TopicBadge({ topic }: TopicBadgeProps) {
  return (
    <Badge variant="secondary" className={`${topicColorMap[topic]} border-none`}>
      {topic}
    </Badge>
  )
}
