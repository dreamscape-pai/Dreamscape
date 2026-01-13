import { db } from '@/lib/db'
import { DailyEventForm } from '@/components/daily-event-form'

export default async function NewDailyEventPage() {
  const spaces = await db.space.findMany({ orderBy: { name: 'asc' } })

  return (
    <div>
      <h1 className="text-3xl font-bold text-sand mb-8" style={{ fontFamily: 'var(--font-decorative)' }}>
        Create Daily Event
      </h1>

      <div className="bg-gradient-to-br from-lavender/20 to-forest/20 backdrop-blur-md border border-sand/20 rounded-lg p-6">
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="font-bold text-blue-300 mb-2">Quick Setup for Closed Days</h3>
          <p className="text-blue-200/80 text-sm">
            To set up "Closed every Sunday": Select CLOSED as the type, then click on Sunday (and any other closed days).
            The venue will show as CLOSED with vertical text on those days.
          </p>
        </div>

        <DailyEventForm spaces={spaces} />
      </div>
    </div>
  )
}