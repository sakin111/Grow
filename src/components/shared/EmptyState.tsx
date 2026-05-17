import { LucideIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: { label: string; href?: string; onClick?: () => void }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed bg-muted/30">
      {Icon && <Icon className="h-10 w-10 text-muted-foreground mb-4" />}
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">{description}</p>
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link href={action.href} className={cn(buttonVariants({ variant: "default" }))}>
              {action.label}
            </Link>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  )
}
