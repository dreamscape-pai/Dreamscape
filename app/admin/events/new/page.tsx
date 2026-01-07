import { EventForm } from '@/components/event-form'
import { db } from '@/lib/db'

export default async function NewEventPage() {
  const [spaces, products] = await Promise.all([
    db.space.findMany({ orderBy: { name: 'asc' } }),
    db.product.findMany({
      where: { active: true, type: { in: ['TICKET', 'WORKSHOP'] } },
      orderBy: { name: 'asc' }
    }),
  ])

  return (
    <div>
      <h1 className="text-3xl font-bold text-sand mb-8" style={{ fontFamily: 'var(--font-decorative)' }}>Create New Event</h1>
      <div className="bg-gradient-to-br from-lavender/20 to-forest/20 backdrop-blur-md border border-sand/20 rounded-lg p-6">
        <EventForm spaces={spaces} products={products} />
      </div>
    </div>
  )
}
