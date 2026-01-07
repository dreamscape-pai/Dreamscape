import { db } from '@/lib/db'
import { EventForm } from '@/components/event-form'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params
  const [event, spaces, products] = await Promise.all([
    db.event.findUnique({
      where: { id },
      include: {
        spaces: {
          include: {
            space: true,
          },
        },
        product: true,
      },
    }),
    db.space.findMany({ orderBy: { name: 'asc' } }),
    db.product.findMany({
      where: { active: true, type: { in: ['TICKET', 'WORKSHOP'] } },
      orderBy: { name: 'asc' }
    }),
  ])

  if (!event) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-sand mb-8" style={{ fontFamily: 'var(--font-decorative)' }}>Edit Event</h1>
      <div className="bg-gradient-to-br from-lavender/20 to-forest/20 backdrop-blur-md border border-sand/20 rounded-lg p-6">
        <EventForm event={event} spaces={spaces} products={products} />
      </div>
    </div>
  )
}
