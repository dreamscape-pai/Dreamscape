import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { ScheduleView } from '@/components/schedule-view'
import { startOfWeek, endOfWeek } from 'date-fns'

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

  const date = searchParams.date ? new Date(searchParams.date) : new Date()
  const view = searchParams.view || 'week'

  const start = view === 'day' ? new Date(date.setHours(0, 0, 0, 0)) : startOfWeek(date, { weekStartsOn: 1 })
  const end = view === 'day' ? new Date(date.setHours(23, 59, 59, 999)) : endOfWeek(date, { weekStartsOn: 1 })

  const events = await db.event.findMany({
    where: {
      published: true,
      startTime: {
        gte: start,
        lte: end,
      },
      spaces: {
        some: {
          spaceId: space.id,
        },
      },
    },
    include: {
      spaces: {
        include: {
          space: true,
        },
      },
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
