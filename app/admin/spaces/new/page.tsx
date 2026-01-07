import { SpaceForm } from '@/components/space-form'

export default function NewSpacePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-sand mb-8" style={{ fontFamily: 'var(--font-decorative)' }}>Create New Space</h1>
      <div className="bg-gradient-to-br from-lavender/20 to-forest/20 backdrop-blur-md border border-sand/20 rounded-lg p-6">
        <SpaceForm />
      </div>
    </div>
  )
}
