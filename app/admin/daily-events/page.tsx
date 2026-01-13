import { db } from '@/lib/db'
import Link from 'next/link'

export default async function DailyEventsPage() {
  const dailyEvents = await db.dailyEvent.findMany({
    include: {
      space: true,
    },
    orderBy: [
      { space: { name: 'asc' } },
      { startTime: 'asc' },
    ],
  })

  // Format time for display
  const formatTime = (time: Date) => {
    const hours = time.getHours()
    const minutes = time.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    const displayMinutes = minutes.toString().padStart(2, '0')
    return `${displayHours}:${displayMinutes} ${ampm}`
  }

  // Format days of week
  const formatDaysOfWeek = (daysOfWeek: number[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    if (daysOfWeek.length === 7) return 'Every day'
    if (daysOfWeek.length === 0) return 'No days set'
    return daysOfWeek.map(day => dayNames[day]).join(', ')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-sand" style={{ fontFamily: 'var(--font-decorative)' }}>
          Daily Facilities & Events
        </h1>
        <Link
          href="/admin/daily-events/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Daily Event
        </Link>
      </div>

      <div className="text-cream/70 text-sm">
        Manage regular daily events like cafe hours, sauna times, and ice bath availability.
      </div>

      <div className="grid gap-4">
        {dailyEvents.length === 0 ? (
          <div className="bg-gradient-to-br from-lavender/20 to-forest/20 backdrop-blur-md border border-sand/20 rounded-lg p-8 text-center">
            <p className="text-cream/70">No daily events configured yet.</p>
            <Link
              href="/admin/daily-events/new"
              className="inline-block mt-4 text-blue-400 hover:text-blue-300"
            >
              Add your first daily event →
            </Link>
          </div>
        ) : (
          dailyEvents.map((event) => (
            <div
              key={event.id}
              className="bg-gradient-to-br from-lavender/20 to-forest/20 backdrop-blur-md border border-sand/20 rounded-lg p-4 hover:from-lavender/25 hover:to-forest/25 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-cream">{event.title}</h3>
                    {event.space && (
                      <span className="px-2 py-1 bg-white/10 rounded text-xs text-cream/80">
                        {event.space.name}
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-cream/70 text-sm mb-2">{event.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-cream/60">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </span>

                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDaysOfWeek(event.daysOfWeek)}
                    </span>

                    {!event.isActive && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/admin/daily-events/${event.id}/edit`}
                    className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <h3 className="font-bold text-yellow-300 mb-2">Note about Daily Events</h3>
        <p className="text-yellow-200/80 text-sm">
          Daily events appear in the schedule view for their configured days.
          They are separate from regular events and are meant for recurring facilities like cafe hours, sauna times, etc.
        </p>
      </div>
    </div>
  )
}