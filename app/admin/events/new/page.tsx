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
      <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
      <div className="bg-white shadow sm:rounded-lg p-6">
        <EventForm spaces={spaces} products={products} />
      </div>
    </div>
  )
}
