import { Navigation } from '@/components/navigation'

export default function CafePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-4">The Cafe</h1>
        <p className="text-xl text-gray-600 mb-8">Epic sunset views & nourishing vegan food</p>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Menu</h2>
          <p className="text-gray-600 mb-6">
            Our cafe serves delicious, nourishing vegan food and drinks. All items are 100% plant-based
            and made with love.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Beverages</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Fresh juices</li>
                <li>• Smoothies</li>
                <li>• Coffee & tea</li>
                <li>• Specialty drinks</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Food</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Fresh salads & bowls</li>
                <li>• Desserts & treats</li>
                <li>• Snacks & light meals</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Special Services</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">Juice Cleanses</h3>
              <p>Detox and rejuvenate with our specially crafted juice cleanse programs</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Meal Plans</h3>
              <p>Custom meal plans for your stay or training program</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Catered Meals</h3>
              <p>Special event catering for retreats, workshops, and gatherings</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Birthday Cakes</h3>
              <p>Custom vegan birthday cakes and celebration treats</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Visit Us</h2>
          <p className="text-gray-700 mb-4">
            Come enjoy the epic sunset view from our cafe while nourishing your body with
            wholesome vegan food. Our space is open to everyone, whether you&apos;re here for
            a workshop, event, or just passing through Pai.
          </p>
          <p className="text-gray-600">
            Hours and menu are subject to change. Contact us for current offerings.
          </p>
        </div>
      </div>
    </div>
  )
}
