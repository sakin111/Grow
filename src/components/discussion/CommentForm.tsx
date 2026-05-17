'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import api from '@/lib/api'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useQueryClient } from '@tanstack/react-query'

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
})

type FormData = z.infer<typeof commentSchema>

interface CommentFormProps {
  discussionId: string
  onSuccess?: () => void
}

export function CommentForm({ discussionId, onSuccess }: CommentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const user = useAuthStore(state => state.user)
  const queryClient = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  })

  if (!user?.company) return null

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      await api.post('/discussion/comments', {
        content: data.content,
        discussionId,
        companyId: user?.company?.id
      })
      toast.success('Comment posted')
      form.reset()
      queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] })
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post comment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="Add a comment..." className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Post Comment
          </Button>
        </div>
      </form>
    </Form>
  )
}
