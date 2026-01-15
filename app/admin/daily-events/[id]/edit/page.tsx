import { db } from '@/lib/db'
import { DailyEventForm } from '@/components/daily-event-form'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditDailyEventPage({ params }: PageProps) {
  const { id } = await params
  const [dailyEvent, spaces] = await Promise.all([
    db.dailyEvent.findUnique({
      where: { id: parseInt(id) },
      include: {
        space: true,
      },
    }),
    db.space.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!dailyEvent) {
    notFound()
  }

  const event = dailyEvent

  return (
    <div>
      <h1 className="text-3xl font-bold text-sand mb-8" style={{ fontFamily: 'var(--font-decorative)' }}>
        Edit Daily Event
      </h1>

      <div className="bg-gradient-to-br from-lavender/20 to-forest/20 backdrop-blur-md border border-sand/20 rounded-lg p-6">
        {event.type === 'CLOSED' && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <h3 className="font-bold text-red-300 mb-2">Editing CLOSED Days</h3>
            <p className="text-red-200/80 text-sm">
              This controls which days the venue is marked as CLOSED.
              Currently set for: {event.daysOfWeek.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
            </p>
          </div>
        )}

        <DailyEventForm event={event} spaces={spaces} />
      </div>
    </div>
  )
}