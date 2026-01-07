import Link from 'next/link'
import { db } from '@/lib/db'

export default async function AdminDashboard() {
  const [spacesCount, eventsCount, productsCount] = await Promise.all([
    db.space.count(),
    db.event.count(),
    db.product.count(),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-sand mb-2" style={{ fontFamily: 'var(--font-decorative)' }}>
          Dashboard
        </h1>
        <p className="text-sand/60">Manage your Dreamscape content</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/schedule" className="group bg-gradient-to-br from-lavender/20 to-forest/20 backdrop-blur-md border border-sand/20 overflow-hidden rounded-lg hover:border-sunset/50 hover:shadow-lg hover:shadow-sunset/10 transition-all duration-300">
          <div className="p-6">
            <div className="flex flex-col">
              <div className="text-sm font-medium text-sand/60 mb-2">Schedule</div>
              <div className="text-2xl font-bold text-sunset group-hover:text-sand transition">Manage</div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-transparent via-sunset/50 to-transparent"></div>
        </Link>

        <Link href="/admin/spaces" className="group bg-gradient-to-br from-forest/20 to-lavender/20 backdrop-blur-md border border-sand/20 overflow-hidden rounded-lg hover:border-sunset/50 hover:shadow-lg hover:shadow-sunset/10 transition-all duration-300">
          <div className="p-6">
            <div className="flex flex-col">
              <div className="text-sm font-medium text-sand/60 mb-2">Spaces</div>
              <div className="text-4xl font-bold text-sand group-hover:text-sunset transition">{spacesCount}</div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-transparent via-sunset/50 to-transparent"></div>
        </Link>

        <Link href="/admin/events" className="group bg-gradient-to-br from-lavender/20 to-forest/20 backdrop-blur-md border border-sand/20 overflow-hidden rounded-lg hover:border-sunset/50 hover:shadow-lg hover:shadow-sunset/10 transition-all duration-300">
          <div className="p-6">
            <div className="flex flex-col">
              <div className="text-sm font-medium text-sand/60 mb-2">Events</div>
              <div className="text-4xl font-bold text-sand group-hover:text-sunset transition">{eventsCount}</div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-transparent via-sunset/50 to-transparent"></div>
        </Link>

        <Link href="/admin/products" className="group bg-gradient-to-br from-forest/20 to-lavender/20 backdrop-blur-md border border-sand/20 overflow-hidden rounded-lg hover:border-sunset/50 hover:shadow-lg hover:shadow-sunset/10 transition-all duration-300">
          <div className="p-6">
            <div className="flex flex-col">
              <div className="text-sm font-medium text-sand/60 mb-2">Products</div>
              <div className="text-4xl font-bold text-sand group-hover:text-sunset transition">{productsCount}</div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-transparent via-sunset/50 to-transparent"></div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-sand mb-6" style={{ fontFamily: 'var(--font-decorative)' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/events/new" className="flex items-center gap-3 p-4 bg-lavender/10 border border-sand/20 rounded-lg hover:border-sunset/50 hover:bg-lavender/20 transition group">
            <span className="text-2xl">📅</span>
            <div>
              <div className="font-medium text-sand group-hover:text-sunset transition">Create Event</div>
              <div className="text-sm text-sand/60">Add a new event to the schedule</div>
            </div>
          </Link>
          <Link href="/admin/spaces/new" className="flex items-center gap-3 p-4 bg-forest/10 border border-sand/20 rounded-lg hover:border-sunset/50 hover:bg-forest/20 transition group">
            <span className="text-2xl">🏛️</span>
            <div>
              <div className="font-medium text-sand group-hover:text-sunset transition">Add Space</div>
              <div className="text-sm text-sand/60">Create a new space or venue</div>
            </div>
          </Link>
          <Link href="/admin/products/new" className="flex items-center gap-3 p-4 bg-lavender/10 border border-sand/20 rounded-lg hover:border-sunset/50 hover:bg-lavender/20 transition group">
            <span className="text-2xl">🎫</span>
            <div>
              <div className="font-medium text-sand group-hover:text-sunset transition">New Product</div>
              <div className="text-sm text-sand/60">Add tickets or merchandise</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
