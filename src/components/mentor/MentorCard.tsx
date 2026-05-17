import { MentorProfile } from '@/types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Star, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface MentorCardProps {
  mentor: MentorProfile
}

export function MentorCard({ mentor }: MentorCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start gap-4 pb-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={mentor.user?.picture || ''} />
          <AvatarFallback className="text-xl">{mentor.user?.name?.charAt(0) || 'M'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-lg font-semibold line-clamp-1">{mentor.user?.name}</h3>
          <div className="flex items-center gap-1 text-amber-500 mt-1">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-medium text-sm">{mentor.avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm">({mentor.totalReviews})</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {mentor.bio}
        </p>
        <div>
          <div className="flex flex-wrap gap-1 mb-2">
            {mentor.categories.slice(0, 2).map(cat => (
              <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
            ))}
            {mentor.categories.length > 2 && (
              <Badge variant="outline" className="text-xs">+{mentor.categories.length - 2}</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {mentor.expertise.slice(0, 3).map(exp => (
              <span key={exp} className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                {exp}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t flex items-center justify-between">
        <div className="flex items-center gap-1 font-medium text-primary">
          <Coins className="h-4 w-4" />
          <span>{mentor.tokenPrice}</span>
        </div>
        <Link href={`/mentors/${mentor.id}`} className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
          Book Session
        </Link>
      </CardFooter>
    </Card>
  )
}
