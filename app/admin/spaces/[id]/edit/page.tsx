import { db } from '@/lib/db'
import { SpaceForm } from '@/components/space-form'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditSpacePage({ params }: PageProps) {
  const { id } = await params
  const space = await db.space.findUnique({
    where: { id: parseInt(id) },
  })

  if (!space) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-sand mb-8" style={{ fontFamily: 'var(--font-decorative)' }}>Edit Space</h1>
      <div className="bg-gradient-to-br from-lavender/20 to-forest/20 backdrop-blur-md border border-sand/20 rounded-lg p-6">
        <SpaceForm space={space} />
      </div>
    </div>
  )
}
