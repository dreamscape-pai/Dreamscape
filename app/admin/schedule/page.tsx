import { auth } from '@/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import { GoogleCalendarConnect } from '@/components/google-calendar-connect'
import { ManualSyncButton } from '@/components/manual-sync-button'
import { redirect } from 'next/navigation'

export default async function AdminSchedulePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Get server-wide Google Calendar credential status (we only have one)
  const credential = await db.googleCalendarCredential.findFirst()

  // Get event stats
  const [totalEvents, googleEvents] = await Promise.all([
    db.event.count(),
    db.event.count({
      where: {
        googleEventId: { not: null }
      }
    })
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sand" style={{ fontFamily: 'var(--font-decorative)' }}>Schedule Management</h1>
        <p className="text-sand/60 mt-2">
          Manage your event schedule and sync with Google Calendar
        </p>
      </div>

      {/* Google Calendar Integration Card */}
      <div className="bg-gradient-to-br from-lavender/20 to-forest/20 backdrop-blur-md border border-sand/20 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-sand mb-4">Google Calendar Integration</h2>

        {credential ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-forest rounded-full"></div>
                  <span className="font-medium text-sand">Connected</span>
                </div>
                <p className="text-sm text-sand/60">
                  Syncing from: <span className="font-medium text-sand">{credential.googleAccountEmail}</span>
                </p>
                {credential.lastSyncAt && (
                  <p className="text-sm text-sand/50 mt-1">
                    Last synced: {new Date(credential.lastSyncAt).toLocaleString()}
                  </p>
                )}
              </div>
              <ManualSyncButton />
            </div>

            <div className="pt-4 border-t border-sand/20">
              <h3 className="text-sm font-medium text-sand mb-2">Sync Settings</h3>
              <p className="text-sm text-sand/60">
                Calendars: {credential.selectedCalendarIds.join(', ')}
              </p>
            </div>

            <div className="pt-4 border-t border-sand/20">
              <GoogleCalendarConnect
                isConnected={true}
                userEmail={credential.googleAccountEmail || undefined}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sand/60">
              Connect your Google Calendar to automatically sync events to your schedule.
            </p>
            <div className="bg-sunset/10 border border-sunset/30 rounded-md p-4">
              <h3 className="text-sm font-medium text-sand mb-2">What happens when you connect?</h3>
              <ul className="text-sm text-sand/80 space-y-1 list-disc list-inside">
                <li>Events from your Google Calendar will be imported</li>
                <li>New events are automatically synced daily</li>
                <li>All synced events are auto-published on your schedule</li>
                <li>Your calendar remains private - only event data is synced</li>
              </ul>
            </div>
            <GoogleCalendarConnect isConnected={false} />
          </div>
        )}
      </div>

      {/* Event Stats Card */}
      <div className="bg-gradient-to-br from-forest/20 to-lavender/20 backdrop-blur-md border border-sand/20 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-sand mb-4">Event Statistics</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-3xl font-bold text-sand">{totalEvents}</div>
            <div className="text-sm text-sand/60">Total Events</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-sunset">{googleEvents}</div>
            <div className="text-sm text-sand/60">From Google Calendar</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-lavender/20 to-forest/20 backdrop-blur-md border border-sand/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-sand mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/events/new"
            className="px-4 py-2 bg-sunset text-sand rounded-md hover:bg-sunset/80 transition"
          >
            Create Manual Event
          </Link>
          <Link
            href="/admin/events"
            className="px-4 py-2 border border-sand/20 rounded-md hover:bg-lavender/20 text-sand transition"
          >
            View All Events
          </Link>
          <Link
            href="/schedule"
            target="_blank"
            className="px-4 py-2 border border-sand/20 rounded-md hover:bg-lavender/20 text-sand transition"
          >
            Preview Public Schedule
          </Link>
        </div>
      </div>
    </div>
  )
}
