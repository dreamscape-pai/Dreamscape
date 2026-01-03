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
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/spaces" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">Spaces</div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">{spacesCount}</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/events" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">Events</div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">{eventsCount}</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/products" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500">Products</div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">{productsCount}</div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
