import { Navigation } from '@/components/navigation'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Contact & Bookings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
            <p className="text-gray-700 mb-6">
              We&apos;d love to hear from you! Whether you&apos;re interested in memberships,
              workshops, hosting an event, or just want to learn more about Dreamscape.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Location</h3>
                <p className="text-gray-700">Pai, Northern Thailand</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-gray-700">Contact information coming soon</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Social Media</h3>
                <p className="text-gray-700">Follow us for updates and daily inspiration</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">Booking Requests</h2>
            <p className="text-gray-700 mb-6">
              Interested in booking a space for your event, retreat, festival, or workshop?
              We&apos;d love to collaborate with you.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Venue Rentals</h3>
                <p className="text-gray-700">
                  Our spaces are available for private events, workshops, retreats, and performances
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Festival Hosting</h3>
                <p className="text-gray-700">
                  We welcome festival organizers to bring their vision to life at Dreamscape
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Artist Residencies</h3>
                <p className="text-gray-700">
                  Apply for residency opportunities and become part of our creative community
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Visit Us</h2>
          <p className="text-gray-700 mb-4">
            Planning to visit Pai? Stop by Dreamscape and experience the magic in person.
            Check our schedule to see what&apos;s happening during your visit.
          </p>
          <p className="text-gray-600">
            Booking system coming soon. For now, please reach out directly for all inquiries.
          </p>
        </div>
      </div>
    </div>
  )
}
