'use client'

import { useState } from 'react'
import { format, addDays, subDays, addWeeks, subWeeks, startOfWeek, eachDayOfInterval, endOfWeek, isSameDay } from 'date-fns'
import Link from 'next/link'
import type { Event, EventSpace, Space, Product } from '@prisma/client'

type EventWithDetails = Event & {
  spaces: (EventSpace & { space: Space })[]
  product?: Product | null
}

type ScheduleViewProps = {
  events: EventWithDetails[]
  initialDate: Date
  initialView: 'day' | 'week'
  spaceFilter?: string
}

export function ScheduleView({ events, initialDate, initialView, spaceFilter }: ScheduleViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [view, setView] = useState<'day' | 'week'>(initialView)

  const goToPrevious = () => {
    setCurrentDate(view === 'day' ? subDays(currentDate, 1) : subWeeks(currentDate, 1))
  }

  const goToNext = () => {
    setCurrentDate(view === 'day' ? addDays(currentDate, 1) : addWeeks(currentDate, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const filteredEvents = spaceFilter
    ? events.filter((event) => event.spaces.some((es) => es.spaceId === spaceFilter))
    : events

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPrevious}
            className="px-4 py-2 bg-white border rounded hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-white border rounded hover:bg-gray-50"
          >
            Today
          </button>
          <button
            onClick={goToNext}
            className="px-4 py-2 bg-white border rounded hover:bg-gray-50"
          >
            Next
          </button>
          <h2 className="text-2xl font-semibold">
            {view === 'day'
              ? format(currentDate, 'MMMM d, yyyy')
              : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`}
          </h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded ${
              view === 'day' ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-gray-50'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded ${
              view === 'week' ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-gray-50'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {view === 'day' ? (
        <DayView events={filteredEvents} date={currentDate} />
      ) : (
        <WeekView events={filteredEvents} weekStart={startOfWeek(currentDate, { weekStartsOn: 1 })} />
      )}
    </div>
  )
}

function DayView({ events, date }: { events: EventWithDetails[]; date: Date }) {
  const dayEvents = events.filter((event) => isSameDay(new Date(event.startTime), date))

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {dayEvents.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No events scheduled for this day</p>
      ) : (
        <div className="space-y-4">
          {dayEvents.map((event) => (
            <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-black/20">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {event.spaces.map((es) => (
                      <span key={es.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {es.space.name}
                      </span>
                    ))}
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {event.type}
                    </span>
                  </div>
                  {event.description && (
                    <p className="mt-2 text-sm text-gray-700">{event.description}</p>
                  )}
                </div>
                {event.product && (
                  <Link
                    href={`/checkout/${event.product.id}`}
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm whitespace-nowrap"
                  >
                    Buy ${(event.product.price / 100).toFixed(2)}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function WeekView({ events, weekStart }: { events: EventWithDetails[]; weekStart: Date }) {
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  })

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {weekDays.map((day) => {
          const dayEvents = events.filter((event) => isSameDay(new Date(event.startTime), day))
          return (
            <div key={day.toString()} className="bg-white p-2 min-h-32">
              <div className="font-semibold text-sm mb-2">{format(day, 'EEE d')}</div>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="text-xs bg-black/20 border-l-2 border-blue-500 p-1 rounded"
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-gray-600">{format(new Date(event.startTime), 'h:mm a')}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
