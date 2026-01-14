'use client'

import { useState, useEffect, useRef } from 'react'
import { format, addDays, subDays, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'

type Event = {
  id: string
  title: string
  startTime: Date
  endTime: Date | null
  type: string
  space?: {
    id: string
    name: string
    slug: string
  } | null
  showInCalendar?: boolean
  daysOfWeek?: number[]
  isDaily?: boolean
}

type Space = {
  id: string
  name: string
  slug: string
}

// Time grid configuration
const GRID_START_HOUR = 7 // 7 AM
const GRID_END_HOUR = 23 // 11 PM
const PIXELS_PER_HOUR = 60
const GRID_HOURS = GRID_END_HOUR - GRID_START_HOUR

export default function TodaySchedule({ initialDate }: { initialDate?: Date }) {
  const router = useRouter()
  const pathname = usePathname()
  const scheduleRef = useRef<HTMLDivElement>(null)
  const [currentDate, setCurrentDate] = useState(() => {
    const date = initialDate || new Date()
    date.setHours(12, 0, 0, 0) // Normalize to noon
    return date
  })
  const [allEvents, setAllEvents] = useState<Event[]>([]) // Cache all loaded events
  const [loadedRange, setLoadedRange] = useState<{ start: Date; end: Date } | null>(null) // Track loaded date range
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [parallaxOffset, setParallaxOffset] = useState(0) // For parallax effect
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const isMember = session?.user?.role === 'MEMBER'

  // Update URL when date changes
  const updateURL = (date: Date) => {
    const dateStr = format(date, 'M-d-yyyy')
    router.push(`/schedule/${dateStr}`, { scroll: false })
  }

  // Navigation functions
  const goToPreviousDay = () => {
    const newDate = subDays(currentDate, 1)
    setCurrentDate(newDate)
    updateURL(newDate)
  }

  const goToNextDay = () => {
    const newDate = addDays(currentDate, 1)
    setCurrentDate(newDate)
    updateURL(newDate)
  }

  // Check if next day navigation should be disabled for non-admins
  const canGoNext = () => {
    if (isAdmin) return true

    const today = new Date()
    const dayOfWeek = today.getDay()
    const nextDate = addDays(currentDate, 1)
    const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
    const nextWeekEnd = endOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 })

    // Allow navigation on Sunday to next week, otherwise restrict to current week
    if (dayOfWeek === 0) {
      return nextDate <= nextWeekEnd
    } else {
      return nextDate <= currentWeekEnd
    }
  }

  // Check if previous day navigation should be disabled (don't go too far back)
  const canGoPrevious = () => {
    const twoWeeksAgo = subDays(new Date(), 14)
    return currentDate > twoWeeksAgo
  }

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
    async function fetchData() {
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

      try {
        // Fetch all events for the range (like main schedule does)
        const [eventsResponse, spacesResponse] = await Promise.all([
          fetch(`/api/events?start=${fetchStart.toISOString()}&end=${fetchEnd.toISOString()}`),
          fetch('/api/spaces')
        ])

        const eventsData = await eventsResponse.json()
        const spacesData = await spacesResponse.json()

        setAllEvents(eventsData.events || [])
        setSpaces(spacesData || [])
        setLoadedRange({ start: fetchStart, end: fetchEnd })
      } catch (error) {
        console.error('Error fetching schedule:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentDate, loadedRange])

  // Filter events for current day and based on user role
  const dayEvents = allEvents.filter(event => {
    // Check if event is on current day
    if (!isSameDay(new Date(event.startTime), currentDate)) {
      return false
    }
    // Exclude member events for non-members/non-admins
    if (event.type === 'MEMBERSHIP_TRAINING' && !isAdmin && !isMember) {
      return false
    }
    return true
  })

  // Include all events (both daily and regular) for display in columns
  const events = dayEvents

  // Group events by space
  const eventsBySpace: Record<string, Event[]> = {}
  const unassignedEvents: Event[] = []

  // Initialize with empty arrays for all spaces
  if (spaces && spaces.length > 0) {
    spaces.forEach(space => {
      eventsBySpace[space.slug] = []
    })
  }

  // Sort events into spaces
  events.forEach(event => {
    if (event.space) {
      if (!eventsBySpace[event.space.slug]) {
        eventsBySpace[event.space.slug] = []
      }
      eventsBySpace[event.space.slug].push(event)
    } else {
      unassignedEvents.push(event)
    }
  })

  // Sort events within each space by start time
  Object.keys(eventsBySpace).forEach(spaceSlug => {
    eventsBySpace[spaceSlug].sort((a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
  })

  unassignedEvents.sort((a, b) =>
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )

  const getEventColor = (type: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      'EVERYDAY': { bg: 'rgba(147, 197, 253, 0.1)', text: 'text-blue-300' },
      'FULL_SPACE_EVERYDAY': { bg: 'rgba(165, 180, 252, 0.1)', text: 'text-indigo-300' },
      'WORKSHOP': { bg: 'rgba(244, 114, 182, 0.1)', text: 'text-pink-400' },
      'EVENT': { bg: 'rgba(191, 53, 35, 0.15)', text: 'text-red-400' }, // Changed to red #bf3523
      'JAM': { bg: 'rgba(167, 139, 250, 0.1)', text: 'text-violet-400' },
      'RETREAT': { bg: 'rgba(251, 146, 60, 0.1)', text: 'text-orange-400' },
      'FESTIVAL': { bg: 'rgba(250, 204, 21, 0.1)', text: 'text-yellow-400' },
      'SHOW': { bg: 'rgba(34, 211, 238, 0.1)', text: 'text-cyan-400' },
      'MEMBERSHIP_TRAINING': { bg: 'rgba(74, 222, 128, 0.1)', text: 'text-green-400' },
      'DAILY': { bg: 'rgba(107, 114, 128, 0.1)', text: 'text-gray-400' },
      'OTHER': { bg: 'rgba(246, 216, 157, 0.1)', text: 'text-cream/90' }
    }
    return colorMap[type] || colorMap['OTHER']
  }

  // Calculate event position and height for time grid
  const getEventPosition = (event: Event) => {
    const start = new Date(event.startTime)
    const end = event.endTime ? new Date(event.endTime) : new Date(start.getTime() + 60 * 60 * 1000) // Default 1 hour if no end

    const startHours = start.getHours() + start.getMinutes() / 60
    const endHours = end.getHours() + end.getMinutes() / 60

    // Clamp to grid bounds
    const clampedStart = Math.max(GRID_START_HOUR, Math.min(GRID_END_HOUR, startHours))
    const clampedEnd = Math.max(GRID_START_HOUR, Math.min(GRID_END_HOUR, endHours))

    const top = (clampedStart - GRID_START_HOUR) * PIXELS_PER_HOUR
    const height = Math.max(20, (clampedEnd - clampedStart) * PIXELS_PER_HOUR) // Minimum height of 20px

    return { top, height }
  }

  // Check if two events overlap
  const eventsOverlap = (event1: Event, event2: Event) => {
    const start1 = new Date(event1.startTime).getTime()
    const end1 = event1.endTime ? new Date(event1.endTime).getTime() : start1 + 60 * 60 * 1000
    const start2 = new Date(event2.startTime).getTime()
    const end2 = event2.endTime ? new Date(event2.endTime).getTime() : start2 + 60 * 60 * 1000

    return start1 < end2 && start2 < end1
  }

  // Calculate overlapping event positions
  const getEventLayout = (events: Event[]) => {
    const layout: Map<string, { left: number; width: number }> = new Map()
    const sortedEvents = [...events].sort((a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )

    // First pass: identify overlapping groups
    const overlapGroups: Set<Event>[] = []
    sortedEvents.forEach((event) => {
      let addedToGroup = false
      for (const group of overlapGroups) {
        if (Array.from(group).some(e => eventsOverlap(e, event))) {
          group.add(event)
          addedToGroup = true
          break
        }
      }
      if (!addedToGroup) {
        overlapGroups.push(new Set([event]))
      }
    })

    // Second pass: assign positions based on group size
    overlapGroups.forEach(group => {
      const groupEvents = Array.from(group).sort((a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )

      if (groupEvents.length === 1) {
        // Single event: full width
        layout.set(groupEvents[0].id, { left: 0, width: 100 })
      } else if (groupEvents.length === 2) {
        // Two overlapping events: first is 100%, second is 50% offset
        layout.set(groupEvents[0].id, { left: 0, width: 100 })
        layout.set(groupEvents[1].id, { left: 50, width: 50 })
      } else {
        // Three or more: all are 50% width with offsets
        groupEvents.forEach((event, index) => {
          layout.set(event.id, { left: (index % 2) * 50, width: 50 })
        })
      }
    })

    return layout
  }

  const renderEvent = (event: Event, layout?: { left: number; width: number }) => {
    const colors = getEventColor(event.type)
    const isDaily = typeof event.id === 'string' && event.id.startsWith('daily-')
    const position = getEventPosition(event)

    return (
      <div
        key={event.id}
        className="absolute rounded-md group"
        style={{
          backgroundColor: isDaily ? 'rgba(107, 114, 128, 0.3)' : colors.bg,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          border: '1px solid rgba(246, 216, 157, 0.1)',
          top: `${position.top}px`,
          height: `${position.height}px`,
          left: layout ? `calc(${layout.left}% + 10px)` : '10px',
          width: layout ? `calc(${layout.width}% - 20px)` : 'calc(100% - 20px)',
          zIndex: layout ? layout.left / 50 + 1 : 1,
          position: 'absolute',
          padding: '5px'
        }}
      >
        {/* Admin edit icon - absolutely positioned at top-right */}
        {isAdmin && !isDaily && (
          <Link
            href={`/admin/events/${event.id}/edit`}
            className="absolute opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              top: '2px',
              right: '2px',
              zIndex: 10
            }}
          >
            <svg className="w-4 h-4 text-cream/80 hover:text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
        )}

        <div className="h-full flex flex-col">
          <p
            className={`font-bold ${isDaily ? 'text-white' : colors.text} truncate`}
            style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)', fontSize: '15px' }}
          >
            {event.title}
          </p>
          {position.height > 35 && (
            <p className={`${isDaily ? 'text-gray-300' : 'text-cream/60'} text-xs mt-0.5`} style={{ fontSize: '12px' }}>
              {format(new Date(event.startTime), 'h:mma').toLowerCase().replace(':00', '')}
              {event.endTime && position.height > 50 && ` - ${format(new Date(event.endTime), 'h:mma').toLowerCase().replace(':00', '')}`}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Format current date for display
  const dateTitle = format(currentDate, 'EEEE, MMMM do')
  const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  // Define minimum required spaces
  const minimumSpaces = ['dome', 'stage', 'cafe', 'sauna-lounge']

  // Get spaces that have events on this day
  const spacesWithEvents = spaces.filter(space =>
    eventsBySpace[space.slug] && eventsBySpace[space.slug].length > 0
  )

  // Build the list of spaces to display
  let spacesToDisplay: Space[] = []

  // First, add minimum required spaces that exist
  minimumSpaces.forEach(slug => {
    const space = spaces.find(s => s.slug === slug)
    if (space) {
      spacesToDisplay.push(space)
    }
  })

  // If stage has no events and there are other spaces with events not in minimum list, replace stage
  const stageSpace = spacesToDisplay.find(s => s.slug === 'stage')
  const stageHasEvents = stageSpace && eventsBySpace['stage'] && eventsBySpace['stage'].length > 0

  if (stageSpace && !stageHasEvents) {
    // Find a space with events that's not already in our list
    const replacementSpace = spacesWithEvents.find(space =>
      !minimumSpaces.includes(space.slug) &&
      !spacesToDisplay.some(s => s.slug === space.slug)
    )

    if (replacementSpace) {
      // Replace stage with the space that has events
      spacesToDisplay = spacesToDisplay.map(s =>
        s.slug === 'stage' ? replacementSpace : s
      )
    }
  }

  // Add any additional spaces with events that aren't already included
  spacesWithEvents.forEach(space => {
    if (!spacesToDisplay.some(s => s.slug === space.slug)) {
      spacesToDisplay.push(space)
    }
  })

  // Ensure we have at least 4 spaces
  if (spacesToDisplay.length < 4) {
    // Add any remaining spaces up to 4
    spaces.forEach(space => {
      if (spacesToDisplay.length >= 4) return
      if (!spacesToDisplay.some(s => s.slug === space.slug)) {
        spacesToDisplay.push(space)
      }
    })
  }

  // Sort by priority order
  const spaceOrder = [
    'dome', 'stage', 'cafe', 'sauna-lounge', 'pole-studio',
    'bamboo-shala', 'dance-studio', 'aerial-shala'
  ]

  const sortedSpacesToDisplay = spacesToDisplay.sort((a, b) => {
    const aIndex = spaceOrder.indexOf(a.slug)
    const bIndex = spaceOrder.indexOf(b.slug)

    // If both are in priority order, sort by their order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    // If only one is in priority order, it comes first
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    // Otherwise sort alphabetically
    return a.name.localeCompare(b.name)
  })

  // Generate time labels
  const timeLabels: { hour: number; label: string }[] = []
  for (let hour = GRID_START_HOUR; hour <= GRID_END_HOUR; hour++) {
    const time = new Date()
    time.setHours(hour, 0, 0, 0)
    timeLabels.push({
      hour,
      label: format(time, 'ha').toLowerCase()
    })
  }

  return (
    <div ref={scheduleRef} className="relative overflow-hidden rounded-xl" style={{ minHeight: '75vh' }}>
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

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-cream/30 border-t-cream rounded-full animate-spin" />
            <p className="text-cream text-lg font-semibold">Loading schedule...</p>
          </div>
        </div>
      )}

      <div className="relative z-10 p-6">
        {/* Date title with navigation */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={goToPreviousDay}
              disabled={!canGoPrevious()}
              className={`transition-all p-2 ${
                canGoPrevious()
                  ? 'text-cream/80 hover:text-cream'
                  : 'text-cream/20 cursor-not-allowed'
              }`}
              aria-label="Previous day"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <h3
              className="text-2xl font-bold text-cream text-center min-w-[200px]"
              style={{
                fontFamily: 'var(--font-serif)',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)'
              }}
            >
              {dateTitle}
              {isToday && (
                <span className="text-sm text-cream/70 ml-2">(Today)</span>
              )}
            </h3>

            <button
              onClick={goToNextDay}
              disabled={!canGoNext()}
              className={`transition-all p-2 ${
                canGoNext()
                  ? 'text-cream/80 hover:text-cream'
                  : 'text-cream/20 cursor-not-allowed'
              }`}
              aria-label="Next day"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {!isToday && (
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-sm px-3 py-1 rounded-lg bg-white/10 border border-cream/20 text-cream hover:bg-white/20 hover:border-cream/30 transition-all"
            >
              Go to Today
            </button>
          )}
        </div>

        {/* Scrollable container */}
        <div className="overflow-x-auto overflow-y-hidden">
          <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
            {/* Time labels column */}
            <div className="flex-shrink-0 sticky left-0 z-20" style={{ width: '70px' }}>
              <div className="h-10 mb-2" /> {/* Spacer for headers */}
              <div
                className="relative rounded-lg"
                style={{
                  height: `${GRID_HOURS * PIXELS_PER_HOUR}px`,
                  background: 'linear-gradient(to bottom, rgba(147, 51, 234, 0.3), rgba(126, 34, 206, 0.2))',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)'
                }}
              >
                {timeLabels.map(({ hour, label }) => {
                  // Skip the first (7am) and last (11pm) labels
                  if (hour === GRID_START_HOUR || hour === GRID_END_HOUR) {
                    return null
                  }

                  return (
                    <div
                      key={hour}
                      className="absolute text-cream/80 text-xs font-semibold px-2"
                      style={{
                        top: `${(hour - GRID_START_HOUR) * PIXELS_PER_HOUR - 8}px`,
                        fontSize: '11px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                      }}
                    >
                      {label}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Space columns with time grid */}
            {sortedSpacesToDisplay.map(space => {
              const spaceEvents = eventsBySpace[space.slug] || []
              const layout = getEventLayout(spaceEvents)

              return (
                <div
                  key={space.id}
                  className="flex-shrink-0 flex-grow"
                  style={{ minWidth: '150px', maxWidth: '250px' }}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-b from-purple-900/60 to-purple-950/40 rounded-t-lg p-2 border-b-2 border-black/20 backdrop-blur-md mb-2 h-10">
                    <p className="text-cream font-bold text-sm text-center truncate" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
                      {space.name}
                    </p>
                  </div>

                  {/* Time grid with events */}
                  <div
                    className="relative rounded-b-lg"
                    style={{
                      backgroundColor: 'color-mix(in oklab, #000000 70%, transparent)',
                      boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 0, 0, 0.2)',
                      height: `${GRID_HOURS * PIXELS_PER_HOUR}px`,
                      minWidth: '150px'
                    }}
                  >
                    {/* Hour lines */}
                    {timeLabels.map(({ hour }) => (
                      <div
                        key={hour}
                        className="absolute w-full border-t border-white/5"
                        style={{
                          top: `${(hour - GRID_START_HOUR) * PIXELS_PER_HOUR}px`
                        }}
                      />
                    ))}

                    {/* Events */}
                    {spaceEvents.map(event => renderEvent(event, layout.get(event.id)))}
                  </div>
                </div>
              )
            })}

            {/* Unassigned events column */}
            {unassignedEvents.length > 0 && (
              <div
                className="flex-shrink-0 flex-grow"
                style={{ minWidth: '150px', maxWidth: '250px' }}
              >
                {/* Header */}
                <div className="bg-gradient-to-b from-purple-900/60 to-purple-950/40 rounded-t-lg p-2 border-b-2 border-black/20 backdrop-blur-md mb-2 h-10">
                  <p className="text-cream/70 font-bold text-sm text-center truncate" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
                    Other
                  </p>
                </div>

                {/* Time grid with events */}
                <div
                  className="relative rounded-b-lg"
                  style={{
                    backgroundColor: 'color-mix(in oklab, #000000 70%, transparent)',
                    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 0, 0, 0.2)',
                    height: `${GRID_HOURS * PIXELS_PER_HOUR}px`,
                    minWidth: '150px'
                  }}
                >
                  {/* Hour lines */}
                  {timeLabels.map(({ hour }) => (
                    <div
                      key={hour}
                      className="absolute w-full border-t border-white/5"
                      style={{
                        top: `${(hour - GRID_START_HOUR) * PIXELS_PER_HOUR}px`
                      }}
                    />
                  ))}

                  {/* Events */}
                  {(() => {
                    const layout = getEventLayout(unassignedEvents)
                    return unassignedEvents.map(event => renderEvent(event, layout.get(event.id)))
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Link to weekly view */}
        <div className="text-center mt-8">
          <Link
            href="/schedule"
            className="inline-block px-6 py-2 rounded-lg bg-white/10 border border-cream/20 text-cream hover:bg-white/20 hover:border-cream/30 transition-all"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            View Weekly Schedule →
          </Link>
        </div>
      </div>
    </div>
  )
}