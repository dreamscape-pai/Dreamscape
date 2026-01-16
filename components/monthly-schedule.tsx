'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isWithinInterval, addMonths, subMonths, isSameMonth } from 'date-fns'
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

type Event = {
  id: string
  title: string
  slug: string
  startTime: string
  endTime: string
  type: string
  space?: {
    name: string
    slug: string
  } | null
}

export default function MonthlySchedule() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date()
    date.setHours(12, 0, 0, 0)
    date.setDate(1)
    return date
  })
  const [multiDayEvents, setMultiDayEvents] = useState<MultiDayEvent[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [todayDate, setTodayDate] = useState<Date | null>(null)

  // Set today date on client side only to avoid hydration issues
  useEffect(() => {
    setTodayDate(new Date())
  }, [])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)

        const [multiDayResponse, eventsResponse] = await Promise.all([
          fetch('/api/multi-day-events'),
          fetch(`/api/events?start=${monthStart.toISOString()}&end=${monthEnd.toISOString()}`)
        ])

        const multiDayData = await multiDayResponse.json()
        const eventsData = await eventsResponse.json()

        setMultiDayEvents(multiDayData || [])
        setEvents(eventsData.events || [])
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentMonth])

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

  const getMultiDayEventTypeColor = (type: string) => {
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

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'WORKSHOP':
        return 'bg-pink-500/20 border-pink-400 text-pink-300'
      case 'EVENT':
        return 'bg-red-500/20 border-red-400 text-red-300'
      case 'JAM':
        return 'bg-violet-500/20 border-violet-400 text-violet-300'
      case 'SHOW':
        return 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
      default:
        return 'bg-cream/10 border-cream/30 text-cream/80'
    }
  }

  const getDayMultiDayEvents = (day: Date) => {
    return multiDayEvents.filter(event => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      return isWithinInterval(day, { start: eventStart, end: eventEnd })
    })
  }

  const getDayEvents = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime)
      return isSameDay(eventDate, day) && event.type === 'EVENT'
    })
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
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
                  const dayMultiDayEvents = day ? getDayMultiDayEvents(day) : []
                  const dayEvents = day ? getDayEvents(day) : []
                  const totalEvents = dayMultiDayEvents.length + dayEvents.length
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
                            <Link
                              href={`/schedule/${format(day, 'M-d-yyyy')}`}
                              className={`text-sm font-semibold hover:underline ${isToday ? 'text-cream' : 'text-cream/70'}`}
                            >
                              {format(day, 'd')}
                            </Link>
                            {totalEvents > 0 && (
                              <span className="text-xs bg-purple-500/30 text-purple-300 px-1 rounded">
                                {totalEvents}
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            {/* Multi-day events first */}
                            {dayMultiDayEvents.slice(0, 1).map(event => (
                              <Link
                                key={`multi-${event.id}`}
                                href={`/events/${event.slug}`}
                                className={`block text-xs p-1 rounded border ${getMultiDayEventTypeColor(event.type)} hover:opacity-80 truncate`}
                              >
                                {event.title}
                              </Link>
                            ))}
                            {/* Regular events */}
                            {dayEvents.slice(0, dayMultiDayEvents.length > 0 ? 1 : 2).map(event => (
                              <Link
                                key={`event-${event.id}`}
                                href={`/schedule/${format(day, 'M-d-yyyy')}`}
                                className={`block text-xs p-1 rounded border ${getEventTypeColor(event.type)} hover:opacity-80 truncate`}
                              >
                                {event.title}
                              </Link>
                            ))}
                            {totalEvents > 2 && (
                              <Link
                                href={`/schedule/${format(day, 'M-d-yyyy')}`}
                                className="text-xs text-cream/50 hover:text-cream/70"
                              >
                                +{totalEvents - 2} more
                              </Link>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })
              ))}
            </div>

            {/* Multi-day event list below calendar */}
            {multiDayEvents.length > 0 && (
              <div className="mt-8">
                <h4 className="text-xl font-bold text-cream mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                  Festivals & Intensives
                </h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {multiDayEvents.map(event => (
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
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <span className={`inline-block text-xs px-2 py-1 rounded border ${getMultiDayEventTypeColor(event.type)} mb-2`}>
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

            {multiDayEvents.length === 0 && events.length === 0 && (
              <div className="text-center py-8">
                <p className="text-cream/60">No events scheduled for this month.</p>
              </div>
            )}
          </>
        )}
    </div>
  )
}
