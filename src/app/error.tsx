'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        We apologize for the inconvenience. An unexpected error has occurred.
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
