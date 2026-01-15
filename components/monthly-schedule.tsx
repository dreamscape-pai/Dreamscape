'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isWithinInterval, addMonths, subMonths, isSameMonth } from 'date-fns'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type MultiDayEvent = {
  id: number
  title: string
  slug: string
  description?: string
  startDate: string
  endDate: string
  posterImage?: string
  type: 'FESTIVAL' | 'INTENSIVE' | 'RETREAT'
}

export default function MonthlySchedule() {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date()
    // Normalize to noon on the first of the month to avoid timezone issues
    date.setHours(12, 0, 0, 0)
    date.setDate(1)
    return date
  })
  const [events, setEvents] = useState<MultiDayEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [todayDate, setTodayDate] = useState<Date | null>(null)

  // Set today date on client side only to avoid hydration issues
  useEffect(() => {
    setTodayDate(new Date())
  }, [])

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      try {
        const response = await fetch('/api/multi-day-events')
        const data = await response.json()
        setEvents(data || [])
      } catch (error) {
        console.error('Error fetching multi-day events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Create a grid starting from Sunday
  const startDay = getDay(monthStart)
  const emptyDays = Array(startDay).fill(null)
  const calendarDays = [...emptyDays, ...monthDays]

  // Organize calendar into weeks
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  // Fill the last week with empty days if needed
  if (weeks.length > 0 && weeks[weeks.length - 1].length < 7) {
    const lastWeek = weeks[weeks.length - 1]
    while (lastWeek.length < 7) {
      lastWeek.push(null)
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'FESTIVAL':
        return 'bg-purple-500/20 border-purple-400 text-purple-300'
      case 'INTENSIVE':
        return 'bg-orange-500/20 border-orange-400 text-orange-300'
      case 'RETREAT':
        return 'bg-green-500/20 border-green-400 text-green-300'
      default:
        return 'bg-blue-500/20 border-blue-400 text-blue-300'
    }
  }

  const getDayEvents = (day: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      return isWithinInterval(day, { start: eventStart, end: eventEnd })
    })
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const goToToday = () => {
    const today = new Date()
    today.setHours(12, 0, 0, 0)
    today.setDate(1)
    setCurrentMonth(today)
  }

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl border-2 border-cream/30 p-6" style={{ boxShadow: '0 0 30px rgba(246, 216, 157, 0.2)' }}>
        {/* Month navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={goToPreviousMonth}
            className="text-cream hover:text-cream/80 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h3 className="text-2xl font-bold text-cream" style={{ fontFamily: 'var(--font-serif)' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </h3>

          <button
            onClick={goToNextMonth}
            className="text-cream hover:text-cream/80 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-cream/30 border-t-cream rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-cream/10 rounded-lg overflow-hidden">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-purple-900/40 p-2 text-center">
                  <span className="text-cream font-semibold text-sm">{day}</span>
                </div>
              ))}

              {/* Calendar days */}
              {weeks.map((week, weekIndex) => (
                week.map((day, dayIndex) => {
                  const dayEvents = day ? getDayEvents(day) : []
                  const isToday = day && todayDate && isSameDay(day, todayDate)
                  const isCurrentMonth = day && isSameMonth(day, currentMonth)

                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`bg-black/30 p-2 min-h-24 relative ${
                        !isCurrentMonth ? 'opacity-50' : ''
                      } ${isToday ? 'ring-2 ring-cream' : ''}`}
                    >
                      {day && (
                        <>
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-sm font-semibold ${isToday ? 'text-cream' : 'text-cream/70'}`}>
                              {format(day, 'd')}
                            </span>
                            {dayEvents.length > 0 && (
                              <span className="text-xs bg-purple-500/30 text-purple-300 px-1 rounded">
                                {dayEvents.length}
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map(event => (
                              <Link
                                key={event.id}
                                href={`/events/${event.slug}`}
                                className={`block text-xs p-1 rounded border ${getEventTypeColor(event.type)} hover:opacity-80 truncate`}
                              >
                                {event.title}
                              </Link>
                            ))}
                            {dayEvents.length > 2 && (
                              <span className="text-xs text-cream/50">+{dayEvents.length - 2} more</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })
              ))}
            </div>

            {/* Event list below calendar */}
            {events.length > 0 && (
              <div className="mt-8">
                <h4 className="text-xl font-bold text-cream mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                  Upcoming Events
                </h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {events.map(event => (
                    <Link
                      key={event.id}
                      href={`/events/${event.slug}`}
                      className="group block bg-white/5 rounded-lg overflow-hidden border border-cream/20 hover:border-cream/40 transition-all"
                    >
                      {event.posterImage && (
                        <div className="relative h-48 w-full">
                          <Image
                            src={event.posterImage}
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <span className={`inline-block text-xs px-2 py-1 rounded ${getEventTypeColor(event.type)} mb-2`}>
                          {event.type}
                        </span>
                        <h5 className="font-bold text-cream mb-2">{event.title}</h5>
                        <p className="text-sm text-cream/60">
                          {format(new Date(event.startDate), 'MMM d')} - {format(new Date(event.endDate), 'MMM d, yyyy')}
                        </p>
                        {event.description && (
                          <p className="text-sm text-cream/70 mt-2 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {events.length === 0 && (
              <div className="text-center py-8">
                <p className="text-cream/60">No festivals or intensives scheduled yet.</p>
              </div>
            )}
          </>
        )}
    </div>
  )
}