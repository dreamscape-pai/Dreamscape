import { db } from '@/lib/db'
import { Navigation } from '@/components/navigation'
import { ScheduleView } from '@/components/schedule-view'
import { startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns'

type SearchParams = Promise<{
  date?: string
  view?: 'day' | 'week'
}>

export default async function SchedulePage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams
  const date = searchParams.date ? new Date(searchParams.date) : new Date()
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
        <h1 className="text-4xl font-bold mb-8">What&apos;s Happening</h1>
        <ScheduleView events={events} initialDate={date} initialView={view} />
      </div>
    </div>
  )
}
