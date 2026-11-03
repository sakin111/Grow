'use client'

import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiService } from '@/lib/apiService'
import { toast } from 'sonner'
import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Review } from '@/types'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, 'Review must be at least 5 characters').max(2000),
})

type FormData = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  bookingId: string
  review?: Review
}

export function ReviewForm({ bookingId, review }: ReviewFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(!review)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: review?.rating ?? 5, comment: review?.comment ?? '' },
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      if (review) {
        await apiService.review.updateReview(review.id, data)
        toast.success('Review updated successfully')
        setIsEditing(false)
      } else {
        await apiService.review.createReview({ bookingId, ...data })
        toast.success('Review submitted successfully')
      }
      queryClient.invalidateQueries({ queryKey: ['session', bookingId] })
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined
      toast.error(message || 'Failed to submit review')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!review) return
    setIsLoading(true)
    try {
      await apiService.review.deleteReview(review.id)
      toast.success('Review deleted')
      queryClient.invalidateQueries({ queryKey: ['session', bookingId] })
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined
      toast.error(message || 'Failed to delete review')
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  if (review && !isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-amber-500">
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index} aria-hidden="true">{index < review.rating ? '★' : '☆'}</span>
          ))}
          <span className="text-sm font-medium text-foreground">{review.rating}/5</span>
        </div>
        <p className="text-sm text-muted-foreground">{review.comment}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit review
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete review
          </Button>
        </div>
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Delete review"
          description="This review will be permanently removed."
          confirmLabel="Delete review"
          confirmVariant="destructive"
          onConfirm={handleDelete}
          isLoading={isLoading}
        />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <Select onValueChange={(val) => field.onChange(parseInt(val || '5'))} defaultValue={field.value?.toString() || '5'}>
                <FormControl>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a rating" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ (5/5)</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ (4/5)</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ (3/5)</SelectItem>
                  <SelectItem value="2">⭐⭐ (2/5)</SelectItem>
                  <SelectItem value="1">⭐ (1/5)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review Comment</FormLabel>
              <FormControl>
                <Textarea placeholder="Share your experience..." className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {review ? 'Save review' : 'Submit review'}
          </Button>
          {review && (
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                form.reset({ rating: review.rating, comment: review.comment })
                setIsEditing(false)
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
