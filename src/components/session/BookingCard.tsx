import { SessionBooking } from '@/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SessionStatusBadge } from './SessionStatusBadge'
import { useAuthStore } from '@/stores/authStore'
import { format } from 'date-fns'
import Link from 'next/link'

interface BookingCardProps {
  booking: SessionBooking
}

export function BookingCard({ booking }: BookingCardProps) {
  const user = useAuthStore(state => state.user)
  const isMentor = user?.role === 'MENTOR'

  const otherPerson = isMentor ? booking.owner : booking.mentor?.user

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherPerson?.picture || ''} />
            <AvatarFallback>{otherPerson?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium line-clamp-1">{otherPerson?.name}</h4>
            <p className="text-xs text-muted-foreground">{isMentor ? 'Owner' : 'Mentor'}</p>
          </div>
        </div>
        <SessionStatusBadge status={booking.status} type="booking" />
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-1 text-sm bg-muted/30 p-3 rounded-lg border">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">{format(new Date(booking.startTime), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span className="font-medium">
              {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 justify-between">
        <Link href={`/sessions/${booking.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full flex justify-center")}>
          View Details
        </Link>
      </CardFooter>
    </Card>
  )
}
