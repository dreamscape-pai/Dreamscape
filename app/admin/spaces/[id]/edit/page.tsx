import { db } from '@/lib/db'
import { SpaceForm } from '@/components/space-form'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditSpacePage({ params }: PageProps) {
  const { id } = await params
  const space = await db.space.findUnique({
    where: { id },
  })

  if (!space) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Space</h1>
      <div className="bg-white shadow sm:rounded-lg p-6">
        <SpaceForm space={space} />
      </div>
    </div>
  )
}
