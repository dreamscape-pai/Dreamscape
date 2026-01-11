import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { ScheduleView } from '@/components/schedule-view'
import { startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    date?: string
    view?: 'day' | 'week'
  }>
}

export default async function SpacePage(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const space = await db.space.findUnique({
    where: { slug: params.slug, published: true },
  })

  if (!space) {
    notFound()
  }

  // Normalize date to avoid hydration mismatches
  const date = searchParams.date ? new Date(searchParams.date) : new Date()
  date.setHours(12, 0, 0, 0) // Set to noon to avoid timezone issues
  const view = searchParams.view || 'week'

  const start = view === 'day' ? startOfDay(date) : startOfWeek(date, { weekStartsOn: 1 })
  const end = view === 'day' ? endOfDay(date) : endOfWeek(date, { weekStartsOn: 1 })

  const events = await db.event.findMany({
    where: {
      published: true,
      startTime: {
        gte: start,
        lte: end,
      },
      spaceId: space.id,
    },
    include: {
      space: true,
      product: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{space.name}</h1>
          {space.description && (
            <p className="text-lg text-gray-700 max-w-3xl">{space.description}</p>
          )}
          {space.capacity && (
            <p className="mt-4 text-gray-600">Capacity: {space.capacity}</p>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-4">Schedule</h2>
        <ScheduleView events={events} initialDate={date} initialView={view} spaceFilter={space.id} />
      </div>
    </div>
  )
}
