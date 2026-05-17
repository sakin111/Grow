'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, X } from 'lucide-react'
import { MentorProfile } from '@/types'
import { Badge } from '@/components/ui/badge'

const mentorProfileSchema = z.object({
  bio: z.string().min(10).max(2000),
  tokenPrice: z.coerce.number().min(0),
  isActive: z.boolean().default(true),
  expertiseStr: z.string(), // We'll parse this to array
  categoriesStr: z.string() // We'll parse this to array
})

type FormData = z.infer<typeof mentorProfileSchema>

interface MentorProfileFormProps {
  initialData?: MentorProfile
}

export function MentorProfileForm({ initialData }: MentorProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const [expertise, setExpertise] = useState<string[]>(initialData?.expertise || [])
  const [categories, setCategories] = useState<string[]>(initialData?.categories || [])

  const form = useForm<FormData>({
    resolver: zodResolver(mentorProfileSchema) as any,
    defaultValues: {
      bio: initialData?.bio || '',
      tokenPrice: initialData?.tokenPrice || 0,
      isActive: initialData?.isActive ?? true,
      expertiseStr: '',
      categoriesStr: ''
    },
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const payload = {
        bio: data.bio,
        tokenPrice: data.tokenPrice,
        isActive: data.isActive,
        expertise,
        categories
      }
      
      if (initialData) {
        await api.patch(`/mentor/mentor/${initialData.id}`, payload)
        toast.success('Mentor profile updated')
      } else {
        await api.post('/mentor/mentor', payload)
        toast.success('Mentor profile created')
      }
      
      router.push('/profile/mentor')
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${initialData ? 'update' : 'create'} profile`)
    } finally {
      setIsLoading(false)
    }
  }

  const addExpertise = () => {
    const val = form.getValues('expertiseStr').trim()
    if (val && !expertise.includes(val)) {
      setExpertise([...expertise, val])
      form.setValue('expertiseStr', '')
    }
  }

  const addCategory = () => {
    const val = form.getValues('categoriesStr').trim()
    if (val && !categories.includes(val)) {
      setCategories([...categories, val])
      form.setValue('categoriesStr', '')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="bio"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell mentees about your experience..." className="min-h-[150px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="tokenPrice"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Token Price per Session</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }: { field: any }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Profile Active</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Allow mentees to find and book you.
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
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="categoriesStr"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Categories (Press enter to add)</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      placeholder="e.g. Engineering, Design" 
                      {...field} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCategory();
                        }
                      }}
                    />
                  </FormControl>
                  <Button type="button" variant="secondary" onClick={addCategory}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map(cat => (
                    <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                      {cat}
                      <button type="button" onClick={() => setCategories(categories.filter(c => c !== cat))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expertiseStr"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Expertise Tags</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      placeholder="e.g. React, Fundraising, SEO" 
                      {...field} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addExpertise();
                        }
                      }}
                    />
                  </FormControl>
                  <Button type="button" variant="secondary" onClick={addExpertise}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {expertise.map(exp => (
                    <Badge key={exp} variant="outline" className="flex items-center gap-1">
                      {exp}
                      <button type="button" onClick={() => setExpertise(expertise.filter(e => e !== exp))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Save Profile' : 'Create Profile'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
