import { SpaceForm } from '@/components/space-form'

export default function NewSpacePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Create New Space</h1>
      <div className="bg-white shadow sm:rounded-lg p-6">
        <SpaceForm />
      </div>
    </div>
  )
}
