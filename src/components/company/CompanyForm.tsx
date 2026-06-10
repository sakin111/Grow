/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { companyApi, userApi } from '@/lib/apiService'
import { useAuthStore } from '@/stores/authStore'
import { Company } from '@/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  industry: z.string().min(1, 'Industry is required').max(100),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
  stage: z.enum(['Idea', 'Early Stage', 'Growth', 'Established', 'Enterprise']),
  description: z.string().min(10, 'Minimum 10 characters').max(2000),
})

type FormData = z.infer<typeof companySchema>

interface CompanyFormProps {
  initialData?: Company
}

export function CompanyForm({ initialData }: CompanyFormProps) {
  const router = useRouter()
  const setUser = useAuthStore(state => state.setUser)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(companySchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      industry: initialData?.industry || '',
      size: (initialData?.size as FormData['size']) || '1-10',
      stage: (initialData?.stage as FormData['stage']) || 'Idea',
      description: initialData?.description || '',
    },
  })

  async function onSubmit(data: FormData) {
    if (isLoading) return

    setIsLoading(true)

    try {
      if (initialData) {
        await companyApi.updateCompany(initialData.id, data)
        toast.success('Company updated successfully')

        const res = await userApi.getCurrentUser()
        setUser(res.data.data)
        router.refresh()
      } else {
        await companyApi.createCompany(data)
        toast.success('Company created successfully')
        router.push('/feed')
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          `Failed to ${initialData ? 'update' : 'create'} company`
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
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

            {/* Industry */}
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Software, Healthcare..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Size */}
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Size</FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="500+">500+</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stage */}
            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Stage</FormLabel>

                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="Idea">Idea</SelectItem>
                      <SelectItem value="Early Stage">
                        Early Stage
                      </SelectItem>
                      <SelectItem value="Growth">Growth</SelectItem>
                      <SelectItem value="Established">
                        Established
                      </SelectItem>
                      <SelectItem value="Enterprise">
                        Enterprise
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your company..."
                    className="min-h-35"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {initialData ? 'Save Changes' : 'Create Company'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}