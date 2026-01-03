import { db } from '@/lib/db'
import { Navigation } from '@/components/navigation'
import { MembershipCard } from '@/components/membership-card'

export default async function MembershipsPage() {
  const plans = await db.membershipPlan.findMany({
    where: { active: true },
    orderBy: { price: 'asc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Memberships</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our community and train on world-class equipment in the mountains of Northern Thailand
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <MembershipCard key={plan.id} plan={plan} />
          ))}
        </div>

        {plans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Membership plans coming soon!</p>
          </div>
        )}

        <div className="mt-16 bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Membership Benefits</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Access to all equipment during open hours</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Train on aerial silks, lyra, trapeze, rope, and straps</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Use of Cyr wheel, acrobatics equipment, and handstand canes</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Access to dance studio, micro gym, and stretch tent</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Community of like-minded creators and athletes</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Discounts on workshops and events</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
