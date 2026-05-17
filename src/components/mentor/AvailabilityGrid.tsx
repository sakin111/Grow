'use client'

import { MentorAvailability } from '@/types'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface AvailabilityGridProps {
  availability: MentorAvailability[]
  onSelectSlot: (startTime: string, endTime: string) => void
}

export function AvailabilityGrid({ availability, onSelectSlot }: AvailabilityGridProps) {
  // Simple implementation: generate some upcoming dates and map availability
  // In a real app, this would use a proper calendar component
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Mock days for demo purposes
  const nextDays = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return d
  })

  // Get DayOfWeek enum value
  const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const selectedDayString = daysOfWeek[selectedDate.getDay()]

  const availableSlotsForDay = availability.filter(a => a.dayOfWeek === selectedDayString)

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {nextDays.map((date, i) => (
          <button
            key={i}
            onClick={() => setSelectedDate(date)}
            className={`flex flex-col items-center justify-center min-w-[60px] p-2 rounded-lg border ${
              date.getDate() === selectedDate.getDate() 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-card hover:bg-muted'
            }`}
          >
            <span className="text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span className="font-bold">{date.getDate()}</span>
          </button>
        ))}
      </div>

      <div className="pt-2">
        <h4 className="text-sm font-medium mb-3">Available Slots</h4>
        {availableSlotsForDay.length > 0 ? (
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
                  variant="outline" 
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
