'use client'

import { useState, useEffect, useRef } from 'react'
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

type Event = {
  id: string
  title: string
  startTime: Date
  endTime: Date | null
  type: string
  space?: {
    id: string
    name: string
  } | null
  canceled?: boolean
  showInCalendar?: boolean
  daysOfWeek?: number[]
  isDaily?: boolean
  isAllDay?: boolean
  displayStyle?: 'NORMAL' | 'VERTICAL'
  overridesOthers?: boolean
}

type EventTypeInfo = {
  type: string
  label: string
  color: string
  bgColor: string
}

const eventTypes: EventTypeInfo[] = [
  { type: 'DAILY', label: 'Daily', color: 'text-gray-400', bgColor: 'rgba(107, 114, 128, 0.1)' },
  { type: 'MEMBERSHIP_TRAINING', label: 'Members', color: 'text-green-400', bgColor: 'rgba(74, 222, 128, 0.1)' },
  { type: 'WORKSHOP', label: 'Workshops', color: 'text-pink-400', bgColor: 'rgba(244, 114, 182, 0.1)' },
  { type: 'EVENT', label: 'Event', color: 'text-red-400', bgColor: 'rgba(191, 53, 35, 0.15)' }, // Changed to red #bf3523
  { type: 'JAM', label: 'Jams', color: 'text-violet-400', bgColor: 'rgba(167, 139, 250, 0.1)' },
  { type: 'SHOW', label: 'Shows', color: 'text-cyan-400', bgColor: 'rgba(34, 211, 238, 0.1)' },
  { type: 'RETREAT', label: 'Retreats', color: 'text-orange-400', bgColor: 'rgba(251, 146, 60, 0.1)' },
  { type: 'FESTIVAL', label: 'Festivals', color: 'text-yellow-400', bgColor: 'rgba(250, 204, 21, 0.1)' },
  { type: 'CLOSED', label: 'Closed', color: 'text-red-500', bgColor: 'rgba(220, 38, 38, 0.2)' },
]

// Helper to format days of week
const formatDaysOfWeek = (daysOfWeek: number[]): string => {
  if (!daysOfWeek || daysOfWeek.length === 0) return ''

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const sortedDays = [...daysOfWeek].sort((a, b) => a - b)

  // Check if days are continuous
  let isContinuous = true
  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i] !== sortedDays[i - 1] + 1) {
      isContinuous = false
      break
    }
  }

  if (isContinuous && sortedDays.length > 2) {
    // Format as "Mon-Sat"
    return `${dayNames[sortedDays[0]]}-${dayNames[sortedDays[sortedDays.length - 1]]}`
  } else {
    // Format as "Mon, Tue, Thu, Sat"
    return sortedDays.map(day => dayNames[day]).join(', ')
  }
}

export default function HomeSchedule() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const isMember = session?.user?.role === 'MEMBER'
  const scheduleRef = useRef<HTMLDivElement>(null) // Reference to the schedule container

  // Initialize with a normalized date to avoid hydration issues
  const [currentDate, setCurrentDate] = useState(() => {
    const date = new Date()
    date.setHours(12, 0, 0, 0) // Normalize to noon
    return date
  })
  const [allEvents, setAllEvents] = useState<Event[]>([]) // Cache all loaded events
  const [loadedRange, setLoadedRange] = useState<{ start: Date; end: Date } | null>(null) // Track loaded date range
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined) // Start undefined to avoid hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(eventTypes.map(t => t.type)))
  const [showFilters, setShowFilters] = useState(false) // Hide filters by default
  const [parallaxOffset, setParallaxOffset] = useState(0) // For parallax effect

  // Update selected types when session changes - exclude MEMBERSHIP_TRAINING for non-members/non-admins
  useEffect(() => {
    if (!isAdmin && !isMember) {
      setSelectedTypes(prev => {
        const newTypes = new Set(prev)
        newTypes.delete('MEMBERSHIP_TRAINING')
        return newTypes
      })
    }
  }, [isAdmin, isMember])

  // Detect mobile view after mount to avoid hydration issues
  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Add parallax effect on scroll relative to component position
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking && scheduleRef.current) {
        window.requestAnimationFrame(() => {
          const rect = scheduleRef.current?.getBoundingClientRect()
          if (rect) {
            // Calculate the center of the viewport and the component
            const windowCenter = window.innerHeight / 2
            const componentCenter = rect.top + (rect.height / 2)

            // Calculate offset from center - this gives us a "zero" when component is centered
            const centerOffset = windowCenter - componentCenter

            // Only apply parallax when component is in view
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              // Scale the offset for a subtle effect
              // Positive when scrolling down (component moving up), negative when scrolling up
              setParallaxOffset(centerOffset * 0.15) // Subtle parallax factor
            }
          }
          ticking = false
        })
        ticking = true
      }
    }

    // Initial calculation
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
    // Check if non-admin can view next week
    if (!isAdmin) {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const nextWeekStart = startOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 })
      const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })

      // If it's not Sunday (0) or if next week is beyond current week, don't allow
      if (dayOfWeek !== 0 && nextWeekStart > currentWeekEnd) {
        return // Don't allow navigation
      }
    }

    if (isMobile) {
      // On mobile, go forward 3 days
      setCurrentDate(prev => new Date(prev.getTime() + 3 * 24 * 60 * 60 * 1000))
    } else {
      setCurrentDate(prev => addWeeks(prev, 1))
    }
  }

  const toggleEventType = (type: string) => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(type)) {
        newSet.delete(type)
      } else {
        newSet.add(type)
      }
      return newSet
    })
  }

  // Calculate the view range based on current date and device type
  // Default to desktop view until we know if mobile (avoids hydration mismatch)
  const effectiveIsMobile = isMobile === true // Only true if explicitly set to true

  const viewStart = effectiveIsMobile
    ? currentDate
    : startOfWeek(currentDate, { weekStartsOn: 1 })

  const viewEnd = effectiveIsMobile
    ? new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000) // 3 days on mobile
    : endOfWeek(currentDate, { weekStartsOn: 1 }) // Full week on desktop

  // Separate unique daily events that should be shown above the calendar
  const nonCalendarDailyEvents = allEvents
    .filter(event => {
      const isDaily = typeof event.id === 'string' && event.id.startsWith('daily-')
      return isDaily && event.showInCalendar === false && selectedTypes.has('DAILY')
    })
    .reduce((acc, event) => {
      // Extract the base daily event ID (before the timestamp)
      const baseId = event.id.split('-').slice(0, 2).join('-')
      // Only keep one instance of each daily event
      if (!acc.some(e => e.id.startsWith(baseId))) {
        acc.push(event)
      }
      return acc
    }, [] as Event[])

  // Filter cached events to only show those in the current view range and selected types
  const events = allEvents.filter(event => {
    const eventDate = new Date(event.startTime)
    const inDateRange = eventDate >= viewStart && eventDate <= viewEnd

    // Check if this is a daily event (cafe, sauna, ice bath)
    const isDaily = typeof event.id === 'string' && event.id.startsWith('daily-')

    if (isDaily) {
      // Only show daily events that should be in calendar
      return inDateRange && selectedTypes.has('DAILY') && event.showInCalendar !== false
    }

    const isSelectedType = selectedTypes.has(event.type) || event.type === 'OTHER' || event.type === 'EVERYDAY' || event.type === 'FULL_SPACE_EVERYDAY'
    return inDateRange && isSelectedType
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

  // Check if next week navigation should be disabled for non-admins
  const canGoNext = () => {
    if (isAdmin) return true

    const today = new Date()
    const dayOfWeek = today.getDay()
    const nextWeekStart = effectiveIsMobile
      ? new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000)
      : startOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 })
    const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })

    // Allow navigation on Sunday or if still within current week
    return dayOfWeek === 0 || nextWeekStart <= currentWeekEnd
  }

  // All the existing grouping and rendering logic from page.tsx
  const allDaysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Calculate which 3 days to show on mobile based on actual view dates
  const mobileDaysToShow = effectiveIsMobile
    ? [
        format(new Date(viewStart), 'EEEE'),
        format(new Date(viewStart.getTime() + 24 * 60 * 60 * 1000), 'EEEE'),
        format(new Date(viewStart.getTime() + 2 * 24 * 60 * 60 * 1000), 'EEEE')
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
    } else if (event.type === 'EVENT') {
      eventColor = 'text-red-400'
      bgColor = 'rgba(191, 53, 35, 0.15)'
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

    const isDaily = typeof event.id === 'string' && event.id.startsWith('daily-')

    return (
      <div
        key={event.id}
        className="text-center mb-2 rounded-md p-2 relative group"
        style={{
          lineHeight: '1.15',
          backgroundColor: bgColor,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          minHeight: '60px',
          position: 'relative'
        }}
      >
        {/* Admin edit icon - absolutely positioned at top-right */}
        {isAdmin && !isDaily && (
          <Link
            href={`/admin/events/${event.id}/edit`}
            className="absolute opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              top: '4px',
              right: '4px',
              zIndex: 10
            }}
          >
            <svg className="w-4 h-4 text-cream/80 hover:text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
        )}

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
          {format(new Date(event.startTime), 'h:mm a')}
          {event.endTime && ` - ${format(new Date(event.endTime), 'h:mm a')}`}
        </p>
        {event.space && (
          <p className="text-cream/50 text-xs mt-0.5">
            @{event.space.name.toLowerCase()}
          </p>
        )}
      </div>
    )
  }

  return (
    <div ref={scheduleRef} className="relative overflow-hidden rounded-xl mb-8" style={{ maxWidth: '1200px', margin: '0 auto', minHeight: '75vh' }}>
      {/* Background image with parallax */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${parallaxOffset}px)`,
          // Buffer for parallax movement
          top: '-10%',
          height: '120%',
          willChange: 'transform'
        }}
      >
        <Image
          src="/assets/clouds.png"
          alt="Clouds background"
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="absolute inset-0 border-2 border-cream/30 rounded-xl" style={{ boxShadow: '0 0 30px rgba(246, 216, 157, 0.2)' }} />

      {/* Loading overlay - moved outside padded div to cover full container */}
      {mounted && loading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-cream/30 border-t-cream rounded-full animate-spin" />
            <p className="text-cream text-lg font-semibold">Loading events...</p>
          </div>
        </div>
      )}

      <div className="relative z-10 p-6">

        {/* Non-calendar daily events display - moved above date navigation */}
        {nonCalendarDailyEvents.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {nonCalendarDailyEvents.map((event, index) => {
              // Format time with proper handling of round hours
              const formatTime = (date: Date) => {
                const hour = date.getHours()
                const minute = date.getMinutes()
                const period = hour >= 12 ? 'pm' : 'am'
                const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour

                if (minute === 0) {
                  return `${displayHour}${period}`
                } else {
                  return `${displayHour}:${minute.toString().padStart(2, '0')}${period}`
                }
              }

              return (
                <div
                  key={event.id}
                  className="flex-1 min-w-0 text-center text-cream/80 text-sm px-3 py-2 rounded-md border border-cream/30 bg-black/40 backdrop-blur-sm"
                >
                  <div className="font-bold text-white">{event.title}</div>
                  <div className="mt-1">
                    {event.startTime && formatTime(new Date(event.startTime))}
                    {event.endTime && ` - ${formatTime(new Date(event.endTime))}`}
                    {event.daysOfWeek && (
                      <span className="text-cream/60"> • {formatDaysOfWeek(event.daysOfWeek)}</span>
                    )}
                  </div>
                  {event.space && (
                    <div className="text-cream/60">@{event.space.name.toLowerCase()}</div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Date range title with navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6 flex-1 justify-center">
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
              className={`transition-all p-2 ${
                canGoNext()
                  ? 'text-cream/80 hover:text-cream'
                  : 'text-cream/20 cursor-not-allowed'
              }`}
              aria-label="Next week"
              disabled={!canGoNext()}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-cream hover:text-white transition-all p-2 rounded-lg bg-black/50 backdrop-blur-sm border border-cream/30 hover:bg-black/70 ml-auto"
            aria-label="Toggle filters"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>

        {/* Event type filters - now with conditional visibility */}
        {showFilters && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {eventTypes.map(eventType => {
              const isSelected = selectedTypes.has(eventType.type)
              const hasEvents = eventType.type === 'DAILY'
                ? allEvents.some(e => typeof e.id === 'string' && e.id.startsWith('daily-'))
                : allEvents.some(e => e.type === eventType.type)

              if (!hasEvents) return null // Don't show filter if no events of this type

              return (
                <button
                  key={eventType.type}
                  onClick={() => toggleEventType(eventType.type)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${eventType.color}`}
                  style={{
                    backgroundColor: isSelected ? eventType.bgColor : 'rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${isSelected ? 'currentColor' : 'rgba(246, 216, 157, 0.2)'}`,
                    opacity: isSelected ? 1 : 0.6,
                  }}
                >
                  {/* Checkbox circle */}
                  <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-current" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{eventType.label}</span>
                </button>
              )
            })}
          </div>
        )}

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

            // Check for CLOSED events on this day (including daily recurring CLOSED)
            const allDayEvents = [...dayEvents.morning, ...dayEvents.midday, ...dayEvents.evening]

            // Also check for daily CLOSED events for this day of week
            const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day)
            const dailyClosedEvent = allEvents.find(e =>
              typeof e.id === 'string' &&
              e.id.startsWith('daily-closed-') &&
              e.displayStyle === 'VERTICAL'
            )

            const closedEvent = allDayEvents.find(e => e.type === 'CLOSED' && e.displayStyle === 'VERTICAL') || dailyClosedEvent
            const shouldHideOthers = closedEvent?.overridesOthers

            return (
              <div
                key={day}
                className="rounded-lg relative"
                style={{
                  backgroundColor: closedEvent ? 'rgba(220, 38, 38, 0.15)' : 'color-mix(in oklab, #000000 70%, transparent)',
                  boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 0, 0, 0.2)',
                  minHeight: '55vh'
                }}
              >
                {closedEvent && closedEvent.displayStyle === 'VERTICAL' ? (
                  // Render vertical CLOSED text
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-red-500 font-bold text-2xl tracking-[0.5em] rotate-0"
                         style={{
                           writingMode: 'vertical-lr',
                           textOrientation: 'upright',
                           letterSpacing: '0.3em',
                           textShadow: '0 2px 8px rgba(220, 38, 38, 0.5)'
                         }}>
                      {closedEvent.title}
                    </div>
                  </div>
                ) : null}

                {/* Regular events (hidden if CLOSED overrides) */}
                <div className={shouldHideOthers ? 'opacity-20' : ''}>
                  {(['morning', 'midday', 'evening'] as const).map((period) => {
                    const periodEvents = dayEvents[period].filter(e => e.type !== 'CLOSED')
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
