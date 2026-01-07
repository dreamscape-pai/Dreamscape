import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import InteractiveHero from '@/components/interactive-hero'
import HomeSchedule from '@/components/home-schedule'

export default async function Home() {
  // Fetch spaces
  const spaces = await db.space.findMany({
    where: { published: true },
    orderBy: { name: 'asc' },
    take: 6 // Show first 6 spaces
  })

  return (
    <InteractiveHero>
      {/* Vision Section */}
      <section id="vision" className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2
            className="text-4xl md:text-5xl font-bold text-cream mb-8 text-center"
            style={{ fontFamily: 'var(--font-decorative)' }}
          >
            The Vision
          </h2>

          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-cream/10">
              <h3 className="text-2xl font-bold mb-4 text-cream" style={{ fontFamily: 'var(--font-serif)' }}>
                What is this place?
              </h3>
              <p className="text-cream/90 mb-4 text-lg">
                Dreamscape is a creation center nestled in the mountains of Northern Thailand in Pai.
                We are a unique, dreamy space where technology, circus, and wellness converge to create
                an art and embodiment playground like no other.
              </p>
              <p className="text-cream/90 text-lg">
                Our goal says it all: <strong>Everything is Art</strong>. We believe in creating a
                space that is visually rich, interactive, and feels like a place you want to explore
                and get lost in.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-cream/10">
              <h3 className="text-2xl font-bold mb-4 text-cream" style={{ fontFamily: 'var(--font-serif)' }}>
                Purist by Design
              </h3>
              <p className="text-cream/90 text-lg">
                Dreamscape is <strong>vegan and alcohol-free</strong>. We've made these choices
                intentionally to create a pure space focused on creativity, embodiment, and wellness.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-cream/10">
              <h3 className="text-2xl font-bold mb-4 text-cream" style={{ fontFamily: 'var(--font-serif)' }}>
                What We Offer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-cream">Workshops</h4>
                  <ul className="text-cream/80 space-y-1">
                    <li>• Circus workshops</li>
                    <li>• Yoga (various styles including hot yoga)</li>
                    <li>• Movement and embodiment practices</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-cream">Events</h4>
                  <ul className="text-cream/80 space-y-1">
                    <li>• Circus shows and performances</li>
                    <li>• Light shows and installations</li>
                    <li>• Dance parties and jams</li>
                    <li>• Open mic nights</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-cream">Programs</h4>
                  <ul className="text-cream/80 space-y-1">
                    <li>• Retreats</li>
                    <li>• Festivals</li>
                    <li>• Residencies for artists</li>
                    <li>• Monthly memberships</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-cream">Equipment</h4>
                  <ul className="text-cream/80 space-y-1">
                    <li>• Aerial silks, lyra, trapeze</li>
                    <li>• Cyr wheel and acrobatics</li>
                    <li>• Handstand canes and poles</li>
                    <li>• Electric cycles and more</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Memberships Section */}
      <section id="memberships" className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-cream/10 mb-8">
            <h2
              className="text-4xl md:text-5xl font-bold text-cream mb-4 text-center"
              style={{ fontFamily: 'var(--font-decorative)' }}
            >
              Memberships
            </h2>
            <p className="text-center text-cream/90 mb-3 text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
              Keep training on your vacation
            </p>
            <p className="text-center text-cream/80 mb-8 text-lg max-w-3xl mx-auto">
              Pai Thailand is home to beautiful warm weather during the European winter and the Australian winter
            </p>

            <h3 className="text-2xl font-bold mb-6 text-cream text-center" style={{ fontFamily: 'var(--font-serif)' }}>
              Available Equipment
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                'Cyr Wheels',
                'Acrobatics Mats',
                'Plyo Boxes',
                'Air Track',
                'Trapeze',
                'Lyra',
                'Aerial Silks',
                'Electric Unicycles',
                'Handstand Canes',
                'Poles'
              ].map((equipment) => (
                <div
                  key={equipment}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-cream/20 text-center hover:bg-white/15 hover:border-cream/30 transition-all"
                >
                  <p className="text-cream/90 font-semibold text-sm">{equipment}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/memberships"
              className="inline-block px-8 py-3 rounded-lg bg-white/10 border border-cream/20 text-cream hover:bg-white/20 hover:border-cream/30 transition-all"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              View Membership Options →
            </Link>
          </div>
        </div>
      </section>

      {/* Spaces Section */}
      <section id="spaces" className="min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2
            className="text-4xl md:text-5xl font-bold text-cream mb-8 text-center"
            style={{ fontFamily: 'var(--font-decorative)' }}
          >
            Our Spaces
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {spaces.map((space) => (
              <Link
                key={space.id}
                href={`/spaces/${space.slug}`}
                className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden border border-cream/10 hover:bg-white/10 hover:border-cream/20 transition-all group"
              >
                {space.images && space.images.length > 0 && (
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={space.images[0]}
                      alt={space.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-2 text-cream">{space.name}</h3>
                  {space.description && (
                    <p className="text-cream/80 line-clamp-3">{space.description}</p>
                  )}
                  {space.capacity && (
                    <p className="mt-4 text-sm text-cream/60">Capacity: {space.capacity}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {spaces.length === 0 && (
            <p className="text-center text-cream/60 py-12">No spaces available yet</p>
          )}

          <div className="text-center">
            <Link
              href="/spaces"
              className="inline-block px-8 py-3 rounded-lg bg-white/10 border border-cream/20 text-cream hover:bg-white/20 hover:border-cream/30 transition-all"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              View All Spaces →
            </Link>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2
            className="text-4xl md:text-5xl font-bold text-cream mb-4 text-center"
            style={{ fontFamily: 'var(--font-decorative)' }}
          >
            What's Happening
          </h2>
          <p className="text-center text-cream/80 mb-8 text-lg">This Week's Schedule</p>

          <HomeSchedule />

          <div className="text-center">
            <Link
              href="/schedule"
              className="inline-block px-8 py-3 rounded-lg bg-white/10 border border-cream/20 text-cream hover:bg-white/20 hover:border-cream/30 transition-all"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              View Full Schedule →
            </Link>
          </div>
        </div>
      </section>
    </InteractiveHero>
  )
}
