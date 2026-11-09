'use client'

import { MentorAvailability } from '@/types'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface AvailabilityGridProps {
  availability: MentorAvailability[]
  isLoading?: boolean
  hasError?: boolean
  onRetry?: () => void
  selectedStartTime?: string
  onSelectSlot: (startTime: string, endTime: string) => void
}

export function AvailabilityGrid({
  availability,
  isLoading = false,
  hasError = false,
  onRetry,
  selectedStartTime,
  onSelectSlot,
}: AvailabilityGridProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  })

  const nextDays = Array.from({ length: 14 }, (_, dayOffset) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + dayOffset + 1)
    return d
  })

  const getDateKey = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

  const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const selectedDayString = daysOfWeek[selectedDate.getDay()]

  const availableSlotsForDay = availability.filter(a => a.dayOfWeek === selectedDayString)

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {nextDays.map(date => (
          <button
            key={getDateKey(date)}
            type="button"
            onClick={() => setSelectedDate(date)}
            className={`flex flex-col items-center justify-center min-w-[60px] p-2 rounded-lg border ${
              getDateKey(date) === getDateKey(selectedDate)
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-card hover:bg-muted'
            }`}
            aria-pressed={getDateKey(date) === getDateKey(selectedDate)}
          >
            <span className="text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span className="font-bold">{date.getDate()}</span>
          </button>
        ))}
      </div>

      <div className="pt-2">
        <h4 className="text-sm font-medium mb-3">Available Slots</h4>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading availability...
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <p className="text-sm text-muted-foreground">Availability could not be loaded.</p>
            {onRetry && (
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            )}
          </div>
        ) : availableSlotsForDay.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {availableSlotsForDay.map(slot => {
              // Construct actual ISO strings for the selected date + slot time
              const startDate = new Date(selectedDate)
              const [startH, startM] = slot.startTime.split(':')
              startDate.setHours(parseInt(startH), parseInt(startM), 0, 0)

              const endDate = new Date(selectedDate)
              const [endH, endM] = slot.endTime.split(':')
              endDate.setHours(parseInt(endH), parseInt(endM), 0, 0)

              return (
                <Button 
                  key={slot.id} 
                  type="button"
                  variant={selectedStartTime === startDate.toISOString() ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSelectSlot(startDate.toISOString(), endDate.toISOString())}
                >
                  {slot.startTime} - {slot.endTime}
                </Button>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4 border rounded-md bg-muted/20">
            No availability on this day
          </p>
        )}
      </div>
    </div>
  )
}
