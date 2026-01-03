import Link from 'next/link'
import { db } from '@/lib/db'

export default async function SpacesPage() {
  const spaces = await db.space.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Spaces</h1>
        <Link
          href="/admin/spaces/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Space
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {spaces.length === 0 ? (
            <li className="px-6 py-4 text-gray-500">No spaces yet. Create your first space!</li>
          ) : (
            spaces.map((space) => (
              <li key={space.id}>
                <Link href={`/admin/spaces/${space.id}/edit`} className="block hover:bg-gray-50">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{space.name}</p>
                        <p className="text-sm text-gray-500">/{space.slug}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {space.capacity && (
                          <span className="text-sm text-gray-500">Capacity: {space.capacity}</span>
                        )}
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            space.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {space.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
