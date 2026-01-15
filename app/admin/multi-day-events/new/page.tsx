import { requireAdmin } from '@/lib/auth'
import MultiDayEventForm from '@/components/multi-day-event-form'
import { adminStyles } from '@/lib/admin-styles'

export default async function NewMultiDayEventPage() {
  await requireAdmin()

  return (
    <div>
      <h1 className={adminStyles.pageTitle} style={{ fontFamily: 'var(--font-decorative)' }}>
        Create New Multi-Day Event
      </h1>
      <div className={`${adminStyles.card} p-6 mt-8`}>
        <MultiDayEventForm />
      </div>
    </div>
  )
}
