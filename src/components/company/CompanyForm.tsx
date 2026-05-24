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
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Company } from '@/types'
import { useAuthStore } from '@/stores/authStore'
import { useQueryClient } from '@tanstack/react-query'

const companySchema = z.object({
  name: z.string().min(1).max(100),
  industry: z.string().min(1).max(100),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
  stage: z.enum(['Idea', 'Early Stage', 'Growth', 'Established', 'Enterprise']),
  description: z.string().min(10).max(2000),
})

type FormData = z.infer<typeof companySchema>

interface CompanyFormProps {
  initialData?: Company
}

export function CompanyForm({ initialData }: CompanyFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const setUser = useAuthStore(state => state.setUser)
  const queryClient = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(companySchema),
    defaultValues: initialData ? {
      name: initialData.name,
      industry: initialData.industry,
      size: initialData.size as any,
      stage: initialData.stage as any,
      description: initialData.description
    } : {
      name: '',
      industry: '',
      size: '1-10',
      stage: 'Idea',
      description: ''
    },
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      if (initialData) {
        await api.patch(`/company/${initialData.id}`, data)
        toast.success('Company updated successfully!')
      } else {
        await api.post('/company', data)
        toast.success('Company created successfully!')
      }
      
      const res = await api.get('/user/me')
      setUser(res.data.data)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      
      router.push('/profile/company')
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${initialData ? 'update' : 'create'} company`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <Input placeholder="Software, Healthcare, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Size</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Stage</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Idea">Idea</SelectItem>
                    <SelectItem value="Early Stage">Early Stage</SelectItem>
                    <SelectItem value="Growth">Growth</SelectItem>
                    <SelectItem value="Established">Established</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us about your company..." className="min-h-[150px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Save Changes' : 'Create Company'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
