'use client'

import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiService } from '@/lib/apiService'
import { Button } from '@/components/ui/button'
import { DayOfWeek, MentorAvailability } from '@/types'

const days: DayOfWeek[] = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
]

interface AvailabilityManagerProps {
  mentorId: string
}

interface AvailabilityInput {
  slotId?: string
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
}

const getErrorMessage = (error: unknown, fallback: string) =>
  isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function AvailabilityManager({ mentorId }: AvailabilityManagerProps) {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('MONDAY')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')

  const availabilityQuery = useQuery({
    queryKey: ['mentor-availability', mentorId],
    queryFn: async () => {
      const response = await apiService.mentor.getAvailability(mentorId)
      return response.data.data as MentorAvailability[]
    },
  })

  const refreshAvailability = () => {
    void queryClient.invalidateQueries({ queryKey: ['mentor-availability', mentorId] })
    void queryClient.invalidateQueries({ queryKey: ['my-mentor-profile'] })
    void queryClient.invalidateQueries({ queryKey: ['mentor', mentorId] })
  }

  const saveAvailability = useMutation({
    mutationFn: ({ slotId, ...payload }: AvailabilityInput) =>
      slotId
        ? apiService.mentor.updateAvailability(slotId, payload)
        : apiService.mentor.createAvailability(payload),
    onSuccess: () => {
      toast.success(editingId ? 'Availability updated' : 'Availability added')
      setEditingId(null)
      setDayOfWeek('MONDAY')
      setStartTime('09:00')
      setEndTime('17:00')
      refreshAvailability()
    },
    onError: error => toast.error(getErrorMessage(error, 'Could not save availability')),
  })

  const deleteAvailability = useMutation({
    mutationFn: (slotId: string) => apiService.mentor.deleteAvailability(slotId),
    onSuccess: () => {
      toast.success('Availability removed')
      if (editingId) setEditingId(null)
      refreshAvailability()
    },
    onError: error => toast.error(getErrorMessage(error, 'Could not remove availability')),
  })

  const slots = availabilityQuery.data || []
  const sortedSlots = [...slots].sort((first, second) =>
    days.indexOf(first.dayOfWeek) - days.indexOf(second.dayOfWeek) ||
    first.startTime.localeCompare(second.startTime)
  )

  const resetForm = () => {
    setEditingId(null)
    setDayOfWeek('MONDAY')
    setStartTime('09:00')
    setEndTime('17:00')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (toMinutes(endTime) <= toMinutes(startTime)) {
      toast.error('End time must be after start time')
      return
    }

    const overlaps = slots.some(slot => {
      if (slot.id === editingId || slot.dayOfWeek !== dayOfWeek) return false
      return toMinutes(startTime) < toMinutes(slot.endTime) &&
        toMinutes(endTime) > toMinutes(slot.startTime)
    })
    if (overlaps) {
      toast.error('This time overlaps an existing availability slot')
      return
    }

    saveAvailability.mutate({
      slotId: editingId || undefined,
      dayOfWeek,
      startTime,
      endTime,
    })
  }

  const startEditing = (slot: MentorAvailability) => {
    setEditingId(slot.id)
    setDayOfWeek(slot.dayOfWeek)
    setStartTime(slot.startTime)
    setEndTime(slot.endTime)
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Availability</h2>
        <p className="text-sm text-muted-foreground">
          Set recurring weekly time slots for session requests.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <label className="space-y-1.5 text-sm font-medium">
          Day
          <select
            value={dayOfWeek}
            onChange={event => setDayOfWeek(event.target.value as DayOfWeek)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm font-normal"
          >
            {days.map(day => <option key={day} value={day}>{day.charAt(0) + day.slice(1).toLowerCase()}</option>)}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Starts
          <input
            type="time"
            required
            value={startTime}
            onChange={event => setStartTime(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm font-normal"
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Ends
          <input
            type="time"
            required
            value={endTime}
            onChange={event => setEndTime(event.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm font-normal"
          />
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={saveAvailability.isPending}>
            {editingId ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {editingId ? 'Save slot' : 'Add slot'}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      {availabilityQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading availability...</p>
      ) : availabilityQuery.isError ? (
        <div className="flex items-center gap-3 text-sm">
          <p className="text-muted-foreground">Availability could not be loaded.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void availabilityQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : sortedSlots.length === 0 ? (
        <p className="border-t py-4 text-sm text-muted-foreground">No weekly slots added.</p>
      ) : (
        <ul className="divide-y border-y">
          {sortedSlots.map(slot => (
            <li key={slot.id} className="flex items-center justify-between gap-3 py-3">
              <p className="min-w-0 text-sm">
                <span className="font-medium">{slot.dayOfWeek.charAt(0) + slot.dayOfWeek.slice(1).toLowerCase()}</span>
                <span className="ml-3 text-muted-foreground">{slot.startTime} - {slot.endTime}</span>
              </p>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Edit availability slot"
                  onClick={() => startEditing(slot)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Delete availability slot"
                  disabled={deleteAvailability.isPending}
                  onClick={() => deleteAvailability.mutate(slot.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}