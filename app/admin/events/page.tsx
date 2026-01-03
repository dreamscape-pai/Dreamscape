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
        <h1 className="text-3xl font-bold">Events</h1>
        <Link
          href="/admin/events/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Event
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {events.length === 0 ? (
            <li className="px-6 py-4 text-gray-500">No events yet. Create your first event!</li>
          ) : (
            events.map((event) => (
              <li key={event.id}>
                <Link href={`/admin/events/${event.id}/edit`} className="block hover:bg-gray-50">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(event.startTime), 'MMM d, yyyy h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {event.spaces.map((es) => (
                            <span key={es.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {es.space.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {event.type}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            event.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
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
