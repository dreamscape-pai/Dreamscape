import Link from 'next/link'
import { db } from '@/lib/db'

export default async function SpacesPage() {
  const spaces = await db.space.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-sand" style={{ fontFamily: 'var(--font-decorative)' }}>Spaces</h1>
        <Link
          href="/admin/spaces/new"
          className="bg-sunset text-sand px-4 py-2 rounded hover:bg-sunset/80 transition"
        >
          Add Space
        </Link>
      </div>

      <div className="bg-gradient-to-br from-lavender/20 to-forest/20 backdrop-blur-md border border-sand/20 overflow-hidden rounded-lg">
        <ul className="divide-y divide-sand/10">
          {spaces.length === 0 ? (
            <li className="px-6 py-4 text-sand/60">No spaces yet. Create your first space!</li>
          ) : (
            spaces.map((space) => (
              <li key={space.id}>
                <Link href={`/admin/spaces/${space.id}/edit`} className="block hover:bg-lavender/10 transition">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-sand">{space.name}</p>
                        <p className="text-sm text-sand/60">/{space.slug}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {space.capacity && (
                          <span className="text-sm text-sand/60">Capacity: {space.capacity}</span>
                        )}
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            space.published
                              ? 'bg-forest/30 text-sand border border-sand/20'
                              : 'bg-lavender/20 text-sand/80 border border-sand/20'
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
