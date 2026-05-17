import { BookingStatus, SessionStatus } from '@/types'
import { Badge } from '@/components/ui/badge'

interface SessionStatusBadgeProps {
  status: BookingStatus | SessionStatus
  type?: 'booking' | 'video'
}

export function SessionStatusBadge({ status, type = 'booking' }: SessionStatusBadgeProps) {
  if (type === 'booking') {
    switch (status as BookingStatus) {
      case 'COMPLETED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 border-none">Completed</Badge>
      case 'CONFIRMED':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">Confirmed</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200 border-none">Cancelled</Badge>
      case 'PENDING':
      default:
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none">Pending</Badge>
    }
  } else {
    switch (status as SessionStatus) {
      case 'COMPLETED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 border-none">Completed</Badge>
      case 'LIVE':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 animate-pulse hover:bg-red-200 border-none">Live</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200 border-none">Cancelled</Badge>
      case 'SCHEDULED':
      default:
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">Scheduled</Badge>
    }
  }
}
