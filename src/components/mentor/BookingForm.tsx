'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import api from '@/lib/api'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

const bookingSchema = z.object({
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
}).refine(data => new Date(data.endTime) > new Date(data.startTime), {
  message: 'End time must be after start time',
  path: ['endTime'],
})

type FormData = z.infer<typeof bookingSchema>

interface BookingFormProps {
  mentorId: string
  selectedStartTime?: string
  selectedEndTime?: string
}

export function BookingForm({ mentorId, selectedStartTime, selectedEndTime }: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const user = useAuthStore(state => state.user)
  const router = useRouter()

  const form = useForm<FormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      startTime: selectedStartTime || '',
      endTime: selectedEndTime || ''
    },
  })

  // Update form when props change
  useState(() => {
    if (selectedStartTime) form.setValue('startTime', selectedStartTime)
    if (selectedEndTime) form.setValue('endTime', selectedEndTime)
  })

  if (user?.role === 'MENTOR') {
    return <div className="text-sm text-center text-muted-foreground p-4">Mentors cannot book sessions.</div>
  }

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const res = await api.post('/session', {
        mentorId,
        startTime: data.startTime,
        endTime: data.endTime
      })
      toast.success('Booking request sent!')
      router.push(`/sessions/${res.data.data.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book session')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Selected Start</FormLabel>
                <FormControl>
                  <div className="text-sm p-2 border rounded bg-muted/50">
                    {field.value ? new Date(field.value).toLocaleString() : 'Select a slot'}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Selected End</FormLabel>
                <FormControl>
                  <div className="text-sm p-2 border rounded bg-muted/50">
                    {field.value ? new Date(field.value).toLocaleTimeString() : '-'}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !form.watch('startTime') || user?.role !== 'OWNER'}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Request Booking
        </Button>
      </form>
    </Form>
  )
}
