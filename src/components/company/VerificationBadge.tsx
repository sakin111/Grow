import { VerificationStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, AlertCircle, HelpCircle } from 'lucide-react'

interface VerificationBadgeProps {
  status: VerificationStatus
  showText?: boolean
}

export function VerificationBadge({ status, showText = true }: VerificationBadgeProps) {
  switch (status) {
    case 'VERIFIED':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 border-none gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {showText && 'Verified'}
        </Badge>
      )
    case 'PENDING':
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none gap-1">
          <Clock className="h-3 w-3" />
          {showText && 'Verification pending'}
        </Badge>
      )
    case 'REJECTED':
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200 border-none gap-1">
          <AlertCircle className="h-3 w-3" />
          {showText && 'Rejected'}
        </Badge>
      )
    case 'UNVERIFIED':
    default:
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-none gap-1">
          <HelpCircle className="h-3 w-3" />
          {showText && 'Unverified'}
        </Badge>
      )
  }
}
