import Link from 'next/link'
import { db } from '@/lib/db'
import { format } from 'date-fns'

export default async function EventsPage() {
  const events = await db.event.findMany({
    include: {
      spaces: {
        include: {
          space: true,
        },
      },
    },
    orderBy: { startTime: 'desc' },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-sand" style={{ fontFamily: 'var(--font-decorative)' }}>Events</h1>
        <Link
          href="/admin/events/new"
          className="bg-sunset text-sand px-4 py-2 rounded hover:bg-sunset/80 transition"
        >
          Add Event
        </Link>
      </div>

      <div className="bg-gradient-to-br from-lavender/20 to-forest/20 backdrop-blur-md border border-sand/20 overflow-hidden rounded-lg">
        <ul className="divide-y divide-sand/10">
          {events.length === 0 ? (
            <li className="px-6 py-4 text-sand/60">No events yet. Create your first event!</li>
          ) : (
            events.map((event) => (
              <li key={event.id}>
                <Link href={`/admin/events/${event.id}/edit`} className="block hover:bg-lavender/10 transition">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-sand">{event.title}</p>
                        <p className="text-sm text-sand/60">
                          {format(new Date(event.startTime), 'MMM d, yyyy h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {event.spaces.map((es) => (
                            <span key={es.id} className="text-xs bg-sunset/20 text-sand border border-sand/20 px-2 py-1 rounded">
                              {es.space.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs bg-lavender/30 text-sand border border-sand/20 px-2 py-1 rounded">
                          {event.type}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            event.published
                              ? 'bg-forest/30 text-sand border border-sand/20'
                              : 'bg-lavender/20 text-sand/80 border border-sand/20'
                          }`}
                        >
                          {event.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
