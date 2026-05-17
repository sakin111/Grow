import { Button } from '@/components/ui/button'
import { Meta } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  meta?: Meta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (!meta || meta.totalPage <= 1) return null

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(meta.page - 1)}
        disabled={!meta.hasPrevPage}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      <div className="text-sm font-medium">
        Page {meta.page} of {meta.totalPage}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(meta.page + 1)}
        disabled={!meta.hasNextPage}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  )
}
