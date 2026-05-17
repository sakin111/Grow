'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import api from '@/lib/api'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Star } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(10).max(2000),
})

type FormData = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  bookingId: string
  mentorId: string
}

export function ReviewForm({ bookingId, mentorId }: ReviewFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(reviewSchema) as any,
    defaultValues: { rating: 5, comment: '' },
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      await api.post(`/session/${bookingId}/review`, data)
      toast.success('Review submitted successfully')
      queryClient.invalidateQueries({ queryKey: ['session', bookingId] })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setIsLoading(false)
    }
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
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Review
        </Button>
      </form>
    </Form>
  )
}
