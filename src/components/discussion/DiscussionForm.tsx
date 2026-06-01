/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const discussionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Max 200 characters'),
  content: z.string().min(1, 'Content is required').max(5000, 'Max 5000 characters'),
  topic: z.enum(['MARKETING','FUNDING','HIRING','OPERATIONS','TECH','GENERAL']),
  isPublic: z.boolean(),
})

type FormData = z.infer<typeof discussionSchema>

export function DiscussionForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const user = useAuthStore(state => state.user)

  const form = useForm<FormData>({
    resolver: zodResolver(discussionSchema),
    defaultValues: { title: '', content: '', topic: 'GENERAL', isPublic: true },
  })

  if (!user?.company) {
    return (
      <div className="text-center p-8 border rounded-xl bg-muted/20">
        <h3 className="text-lg font-medium">You need a company profile to post discussions.</h3>
        <Button onClick={() => router.push('/company')} className="mt-4">
          Create Company
        </Button>
      </div>
    )
  }

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const res = await api.post('/discussion/discussion', { ...data, companyId: user?.company?.id })
      toast.success('Discussion posted')
      router.push(`/discussions/${res.data.data.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post discussion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="What's on your mind?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="FUNDING">Funding</SelectItem>
                  <SelectItem value="HIRING">Hiring</SelectItem>
                  <SelectItem value="OPERATIONS">Operations</SelectItem>
                  <SelectItem value="TECH">Tech</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Share your thoughts..." className="min-h-[150px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Public Discussion</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Allow anyone to see and comment on this discussion.
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Discussion
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/feed')} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
