import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { notFound } from 'next/navigation'
import MultiDayEventForm from '@/components/multi-day-event-form'
import { adminStyles } from '@/lib/admin-styles'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditMultiDayEventPage({ params }: PageProps) {
  await requireAdmin()
  const { id } = await params

  const event = await db.multiDayEvent.findUnique({
    where: { id: parseInt(id) },
    include: {
      sections: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!event) {
    notFound()
  }

  return (
    <div>
      <h1 className={adminStyles.pageTitle} style={{ fontFamily: 'var(--font-decorative)' }}>
        Edit Multi-Day Event
      </h1>
      <div className={`${adminStyles.card} p-6 mt-8`}>
        <MultiDayEventForm event={event} />
      </div>
    </div>
  )
}
