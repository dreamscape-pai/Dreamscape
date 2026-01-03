import { Navigation } from '@/components/navigation'

export default function PastEventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Past Events</h1>
        <p className="text-xl text-gray-600 mb-12">
          A glimpse into the magic we&apos;ve created together
        </p>

        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">
            Past events gallery coming soon!
          </p>
          <p className="text-gray-600">
            We&apos;re working on showcasing our amazing festivals, dance parties, circus shows,
            and community gatherings. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  )
}
