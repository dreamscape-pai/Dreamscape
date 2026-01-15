import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import Link from 'next/link'
import { format } from 'date-fns'
import { adminStyles, getTypeBadgeClass, getStatusBadgeClass } from '@/lib/admin-styles'

export default async function MultiDayEventsAdmin() {
  await requireAdmin()

  const events = await db.multiDayEvent.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      sections: true
    }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className={adminStyles.pageTitle} style={{ fontFamily: 'var(--font-decorative)' }}>
          Multi-Day Events
        </h1>
        <Link href="/admin/multi-day-events/new" className={adminStyles.buttonPrimary}>
          Add New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <p className={adminStyles.emptyState}>No multi-day events yet. Create your first one!</p>
      ) : (
        <div className={`${adminStyles.card} overflow-hidden`}>
          <table className={adminStyles.table}>
            <thead className={adminStyles.tableHeader}>
              <tr>
                <th className={adminStyles.tableHeaderCell}>Title</th>
                <th className={adminStyles.tableHeaderCell}>Type</th>
                <th className={adminStyles.tableHeaderCell}>Dates</th>
                <th className={adminStyles.tableHeaderCell}>Sections</th>
                <th className={adminStyles.tableHeaderCell}>Status</th>
                <th className={adminStyles.tableHeaderCell}>Featured</th>
                <th className={`${adminStyles.tableHeaderCell} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className={adminStyles.tableBody}>
              {events.map((event) => (
                <tr key={event.id} className={adminStyles.tableRow}>
                  <td className={adminStyles.tableCell}>
                    <div className="text-sm font-medium text-sand">{event.title}</div>
                    <div className="text-sm text-sand/50">{event.slug}</div>
                  </td>
                  <td className={adminStyles.tableCell}>
                    <span className={getTypeBadgeClass(event.type)}>
                      {event.type}
                    </span>
                  </td>
                  <td className={adminStyles.tableCell}>
                    {format(new Date(event.startDate), 'MMM d')} - {format(new Date(event.endDate), 'MMM d, yyyy')}
                  </td>
                  <td className={adminStyles.tableCell}>
                    {event.sections.length} sections
                  </td>
                  <td className={adminStyles.tableCell}>
                    <span className={getStatusBadgeClass(event.published)}>
                      {event.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className={`${adminStyles.tableCell} text-center`}>
                    {event.featured ? (
                      <span className="text-yellow-400">⭐</span>
                    ) : (
                      <span className="text-sand/30">-</span>
                    )}
                  </td>
                  <td className={`${adminStyles.tableCell} text-right`}>
                    <Link
                      href={`/admin/multi-day-events/${event.id}/edit`}
                      className={`${adminStyles.link} mr-4`}
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/events/${event.slug}`}
                      className={adminStyles.linkMuted}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
