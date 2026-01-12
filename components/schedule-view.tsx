'use client'

import { useState } from 'react'
import { format, addDays, subDays, addWeeks, subWeeks, startOfWeek, eachDayOfInterval, endOfWeek, isSameDay } from 'date-fns'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import type { Event, Space, Product } from '@prisma/client'

type EventWithDetails = Event & {
  space?: Space | null
  product?: Product | null
}

type ScheduleViewProps = {
  events: EventWithDetails[]
  initialDate: Date
  initialView: 'day' | 'week'
  spaceFilter?: string
}

// Map space colors to Tailwind color classes
const getSpaceColorClasses = (color: string | null | undefined) => {
  const colorMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      badge: 'bg-blue-100 text-blue-800'
    },
    purple: {
      border: 'border-purple-500',
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      badge: 'bg-purple-100 text-purple-800'
    },
    green: {
      border: 'border-green-500',
      bg: 'bg-green-50',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-800'
    },
    yellow: {
      border: 'border-yellow-500',
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100 text-yellow-800'
    },
    orange: {
      border: 'border-orange-500',
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      badge: 'bg-orange-100 text-orange-800'
    },
    indigo: {
      border: 'border-indigo-500',
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      badge: 'bg-indigo-100 text-indigo-800'
    }
  }

  return colorMap[color || ''] || colorMap.blue // Default to blue if no color
}

export function ScheduleView({ events, initialDate, initialView, spaceFilter }: ScheduleViewProps) {
  // Ensure the initial date is normalized to avoid hydration issues
  const [currentDate, setCurrentDate] = useState(() => {
    const date = new Date(initialDate)
    date.setHours(12, 0, 0, 0) // Normalize to noon to avoid timezone issues
    return date
  })
  const [view, setView] = useState<'day' | 'week'>(initialView)

  const goToPrevious = () => {
    setCurrentDate(view === 'day' ? subDays(currentDate, 1) : subWeeks(currentDate, 1))
  }

  const goToNext = () => {
    setCurrentDate(view === 'day' ? addDays(currentDate, 1) : addWeeks(currentDate, 1))
  }

  const goToToday = () => {
    const today = new Date()
    today.setHours(12, 0, 0, 0) // Normalize to noon
    setCurrentDate(today)
  }

  const filteredEvents = spaceFilter
    ? events.filter((event) => event.spaceId === parseInt(spaceFilter))
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
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {dayEvents.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No events scheduled for this day</p>
      ) : (
        <div className="space-y-4">
          {dayEvents.map((event) => {
            // Check if it's a daily event
            const isDaily = (event as any).isDaily || (typeof event.id === 'string' && event.id.startsWith('daily-'))

            // Get the space color (don't apply background for daily events)
            const colorClasses = getSpaceColorClasses(event.space?.color)

            return (
              <div key={event.id} className={`relative group border-l-4 ${colorClasses.border} pl-4 py-2 ${isDaily ? 'bg-gray-700' : colorClasses.bg}`}>
                {isAdmin && !isDaily && (
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                )}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${isDaily ? 'text-white' : ''}`}>{event.title}</h3>
                    <p className={`text-sm ${isDaily ? 'text-gray-300' : 'text-gray-600'}`}>
                      {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                    </p>
                    {event.space && (
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${isDaily ? 'bg-gray-600 text-gray-200' : colorClasses.badge}`}>
                          {event.space.name}
                        </span>
                      </div>
                    )}
                    {event.description && (
                      <p className={`mt-2 text-sm ${isDaily ? 'text-gray-300' : 'text-gray-700'}`}>{event.description}</p>
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
            )
          })}
        </div>
      )}
    </div>
  )
}

function WeekView({ events, weekStart }: { events: EventWithDetails[]; weekStart: Date }) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

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
                {dayEvents.map((event) => {
                  // Check if it's a daily event
                  const isDaily = (event as any).isDaily || (typeof event.id === 'string' && event.id.startsWith('daily-'))

                  // Get the space color
                  const colorClasses = getSpaceColorClasses(event.space?.color)

                  return (
                    <div
                      key={event.id}
                      className={`relative group text-xs ${isDaily ? 'bg-gray-700' : colorClasses.bg} border-l-2 ${colorClasses.border} p-1 rounded`}
                    >
                      {isAdmin && !isDaily && (
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="absolute -top-1 -right-1 p-0.5 bg-white/90 hover:bg-white rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                        >
                          <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                      )}
                      <div className={`font-medium truncate ${isDaily ? 'text-white' : ''}`}>{event.title}</div>
                      <div className={isDaily ? 'text-gray-300' : 'text-gray-600'}>{format(new Date(event.startTime), 'h:mm a')}</div>
                      {event.space && (
                        <div className={`text-xs font-medium ${isDaily ? 'text-gray-300' : colorClasses.text}`}>
                          {event.space.name}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}