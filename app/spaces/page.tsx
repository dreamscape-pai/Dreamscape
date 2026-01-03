import Link from 'next/link'
import { db } from '@/lib/db'
import { Navigation } from '@/components/navigation'

export default async function SpacesPage() {
  const spaces = await db.space.findMany({
    where: { published: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8">Spaces</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <Link
              key={space.id}
              href={`/spaces/${space.slug}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2">{space.name}</h2>
                {space.description && (
                  <p className="text-gray-600 line-clamp-3">{space.description}</p>
                )}
                {space.capacity && (
                  <p className="mt-4 text-sm text-gray-500">Capacity: {space.capacity}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {spaces.length === 0 && (
          <p className="text-center text-gray-500 py-12">No spaces available yet</p>
        )}
      </div>
    </div>
  )
}
