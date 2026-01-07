'use client'

import { useState, useEffect } from 'react'
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'

type Event = {
  id: string
  title: string
  startTime: Date
  endTime: Date | null
  type: string
  spaces: Array<{
    id: string
    space: {
      name: string
    }
  }>
  isRecurring: boolean
  recurrenceEnd: Date | null
  cancellations: Array<{
    cancelledDate: Date
  }>
}

export default function HomeSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date()) // Track current viewing date
  const [allEvents, setAllEvents] = useState<Event[]>([]) // Cache all loaded events
  const [loadedRange, setLoadedRange] = useState<{ start: Date; end: Date } | null>(null) // Track loaded date range
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    async function fetchEvents() {
      // Calculate the range we need: previous week, current week, next week
      const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
      const fetchStart = subWeeks(currentWeekStart, 1)
      const fetchEnd = endOfWeek(addWeeks(currentWeekStart, 1), { weekStartsOn: 1 })

      // Check if we need to fetch (if current date is outside loaded range)
      if (loadedRange && currentDate >= loadedRange.start && currentDate <= loadedRange.end) {
        // Data already loaded, no need to fetch
        setLoading(false)
        return
      }

      setLoading(true)
      const response = await fetch(`/api/events?start=${fetchStart.toISOString()}&end=${fetchEnd.toISOString()}`)
      const data = await response.json()
      setAllEvents(data.events || [])
      setLoadedRange({ start: fetchStart, end: fetchEnd })
      setLoading(false)
    }

    fetchEvents()
  }, [currentDate, loadedRange])

  const goToPreviousWeek = () => {
    if (isMobile) {
      // On mobile, go back 3 days
      setCurrentDate(prev => new Date(prev.getTime() - 3 * 24 * 60 * 60 * 1000))
    } else {
      setCurrentDate(prev => subWeeks(prev, 1))
    }
  }

  const goToNextWeek = () => {
    if (isMobile) {
      // On mobile, go forward 3 days
      setCurrentDate(prev => new Date(prev.getTime() + 3 * 24 * 60 * 60 * 1000))
    } else {
      setCurrentDate(prev => addWeeks(prev, 1))
    }
  }

  // Calculate the view range based on current date and device type
  const viewStart = isMobile
    ? currentDate
    : startOfWeek(currentDate, { weekStartsOn: 1 })

  const viewEnd = isMobile
    ? new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000) // 3 days on mobile
    : endOfWeek(currentDate, { weekStartsOn: 1 }) // Full week on desktop

  // Filter cached events to only show those in the current view range
  const events = allEvents.filter(event => {
    const eventDate = new Date(event.startTime)
    return eventDate >= viewStart && eventDate <= viewEnd
  })

  // Format date range for display
  const start = viewStart
  const end = viewEnd

  const startMonth = start.toLocaleDateString('en-US', { month: 'long' })
  const startDay = start.getDate()
  const endDay = end.getDate()
  const getOrdinal = (day: number) => {
    if (day === 1 || day === 21 || day === 31) return 'st'
    if (day === 2 || day === 22) return 'nd'
    if (day === 3 || day === 23) return 'rd'
    return 'th'
  }
  const dateRangeTitle = `${startMonth} ${startDay}${getOrdinal(startDay)} - ${endDay}${getOrdinal(endDay)}`

  // All the existing grouping and rendering logic from page.tsx
  const allDaysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Calculate which 3 days to show on mobile based on actual view dates
  const mobileDaysToShow = isMobile
    ? [
        new Date(viewStart).toLocaleDateString('en-US', { weekday: 'long' }),
        new Date(viewStart.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
        new Date(viewStart.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' })
      ]
    : allDaysOfWeek

  const getTimePeriod = (hour: number) => {
    if (hour < 12) return 'morning'
    if (hour < 16) return 'midday'
    return 'evening'
  }

  type EventsByDayAndPeriod = Record<string, Record<string, Event[]>>
  const eventsByDayAndPeriod: EventsByDayAndPeriod = {}

  events.forEach(event => {
    const eventDate = new Date(event.startTime)
    const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'long' })
    const hour = eventDate.getHours()
    const period = getTimePeriod(hour)

    if (!eventsByDayAndPeriod[dayName]) {
      eventsByDayAndPeriod[dayName] = { morning: [], midday: [], evening: [] }
    }
    eventsByDayAndPeriod[dayName][period].push(event)
  })

  const maxEventsByPeriod = {
    morning: 0,
    midday: 0,
    evening: 0
  }

  allDaysOfWeek.forEach(day => {
    const dayEvents = eventsByDayAndPeriod[day] || { morning: [], midday: [], evening: [] }
    maxEventsByPeriod.morning = Math.max(maxEventsByPeriod.morning, dayEvents.morning.length)
    maxEventsByPeriod.midday = Math.max(maxEventsByPeriod.midday, dayEvents.midday.length)
    maxEventsByPeriod.evening = Math.max(maxEventsByPeriod.evening, dayEvents.evening.length)
  })

  maxEventsByPeriod.morning = Math.max(1, maxEventsByPeriod.morning)
  maxEventsByPeriod.midday = Math.max(1, maxEventsByPeriod.midday)
  maxEventsByPeriod.evening = Math.max(1, maxEventsByPeriod.evening)

  const renderEventItem = (event: Event) => {
    let eventColor = 'text-cream/90'
    let bgColor = 'rgba(246, 216, 157, 0.1)'

    if (event.type === 'EVERYDAY') {
      eventColor = 'text-blue-300'
      bgColor = 'rgba(147, 197, 253, 0.1)'
    } else if (event.type === 'FULL_SPACE_EVERYDAY') {
      eventColor = 'text-indigo-300'
      bgColor = 'rgba(165, 180, 252, 0.1)'
    } else if (event.type === 'WORKSHOP') {
      eventColor = 'text-pink-400'
      bgColor = 'rgba(244, 114, 182, 0.1)'
    } else if (event.type === 'DANCE_EVENT') {
      eventColor = 'text-purple-400'
      bgColor = 'rgba(192, 132, 252, 0.1)'
    } else if (event.type === 'JAM') {
      eventColor = 'text-violet-400'
      bgColor = 'rgba(167, 139, 250, 0.1)'
    } else if (event.type === 'RETREAT') {
      eventColor = 'text-orange-400'
      bgColor = 'rgba(251, 146, 60, 0.1)'
    } else if (event.type === 'FESTIVAL') {
      eventColor = 'text-yellow-400'
      bgColor = 'rgba(250, 204, 21, 0.1)'
    } else if (event.type === 'SHOW') {
      eventColor = 'text-cyan-400'
      bgColor = 'rgba(34, 211, 238, 0.1)'
    } else if (event.type === 'MEMBERSHIP_TRAINING') {
      eventColor = 'text-green-400'
      bgColor = 'rgba(74, 222, 128, 0.1)'
    }

    return (
      <div
        key={event.id}
        className="text-center mb-2 rounded-md p-2"
        style={{
          lineHeight: '1.15',
          backgroundColor: bgColor,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          minHeight: '60px'
        }}
      >
        <p
          className={`font-bold ${eventColor}`}
          style={{
            textShadow: '0 2px 6px rgba(0,0,0,0.6)',
            fontSize: '13px'
          }}
        >
          {event.title}
        </p>
        <p className="text-cream/60 text-xs mt-0.5">
          {new Date(event.startTime).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}
          {event.endTime && ` - ${new Date(event.endTime).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}`}
        </p>
        {event.spaces.length > 0 && (
          <p className="text-cream/50 text-xs mt-0.5">
            @{event.spaces.map(s => s.space.name.toLowerCase()).join(', ')}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl mb-8" style={{ maxWidth: '1200px', margin: '0 auto', minHeight: '75vh' }}>
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/assets/clouds.png"
          alt="Clouds background"
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="absolute inset-0 border-2 border-cream/30 rounded-xl" style={{ boxShadow: '0 0 30px rgba(246, 216, 157, 0.2)' }} />

      <div className="relative z-10 p-6">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-cream/30 border-t-cream rounded-full animate-spin" />
              <p className="text-cream text-lg font-semibold">Loading events...</p>
            </div>
          </div>
        )}

        {/* Date range title with navigation */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <button
            onClick={goToPreviousWeek}
            className="text-cream/80 hover:text-cream transition-colors p-2"
            aria-label="Previous week"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h3
            className="text-2xl font-bold text-cream text-center"
            style={{
              fontFamily: 'var(--font-serif)',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}
          >
            {dateRangeTitle}
          </h3>

          <button
            onClick={goToNextWeek}
            className="text-cream/80 hover:text-cream transition-colors p-2"
            aria-label="Next week"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Header row - Desktop: 7 days, Mobile: 3 days */}
        <div className="hidden md:grid grid-cols-7 gap-1 mb-2 bg-gradient-to-b from-purple-900/60 to-purple-950/40 rounded-lg p-2 border-b-2 border-black/20 backdrop-blur-md">
          {allDaysOfWeek.map(day => (
            <div key={day} className="text-center">
              <p className="text-cream font-bold text-base" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
                {day}
              </p>
            </div>
          ))}
        </div>
        <div className="grid md:hidden grid-cols-3 gap-1 mb-2 bg-gradient-to-b from-purple-900/60 to-purple-950/40 rounded-lg p-2 border-b-2 border-black/20 backdrop-blur-md">
          {mobileDaysToShow.map(day => (
            <div key={day} className="text-center">
              <p className="text-cream font-bold text-sm" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
                {day}
              </p>
            </div>
          ))}
        </div>

        {/* Day columns grid - Desktop: 7 days */}
        <div className="hidden md:grid grid-cols-7 gap-2">
          {allDaysOfWeek.map((day) => {
            const dayEvents = eventsByDayAndPeriod[day] || { morning: [], midday: [], evening: [] }

            return (
              <div
                key={day}
                className="rounded-lg"
                style={{
                  backgroundColor: 'color-mix(in oklab, #000000 70%, transparent)',
                  boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 0, 0, 0.2)',
                  minHeight: '55vh'
                }}
              >
                {(['morning', 'midday', 'evening'] as const).map((period) => {
                  const periodEvents = dayEvents[period]
                  const maxSlots = maxEventsByPeriod[period]

                  return (
                    <div key={`${day}-${period}`} className="p-2">
                      {Array.from({ length: maxSlots }).map((_, slotIndex) => {
                        const event = periodEvents[slotIndex]

                        if (!event) {
                          return <div key={slotIndex} className="min-h-[30px]" />
                        }

                        return <div key={`${event.id}-${new Date(event.startTime).toISOString()}-${slotIndex}`}>
                          {renderEventItem(event)}
                        </div>
                      })}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Day columns grid - Mobile: 3 days */}
        <div className="grid md:hidden grid-cols-3 gap-2">
          {mobileDaysToShow.map((day) => {
            const dayEvents = eventsByDayAndPeriod[day] || { morning: [], midday: [], evening: [] }

            return (
              <div
                key={day}
                className="rounded-lg"
                style={{
                  backgroundColor: 'color-mix(in oklab, #000000 70%, transparent)',
                  boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 0, 0, 0.2)',
                  minHeight: '55vh'
                }}
              >
                {(['morning', 'midday', 'evening'] as const).map((period) => {
                  const periodEvents = dayEvents[period]
                  const maxSlots = maxEventsByPeriod[period]

                  return (
                    <div key={`${day}-${period}`} className="p-2">
                      {Array.from({ length: maxSlots }).map((_, slotIndex) => {
                        const event = periodEvents[slotIndex]

                        if (!event) {
                          return <div key={slotIndex} className="min-h-[30px]" />
                        }

                        return <div key={`${event.id}-${new Date(event.startTime).toISOString()}-${slotIndex}`}>
                          {renderEventItem(event)}
                        </div>
                      })}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
