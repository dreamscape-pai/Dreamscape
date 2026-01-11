import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import InteractiveHero from '@/components/interactive-hero'
import HomeSchedule from '@/components/home-schedule'
import VisionContent from '@/components/vision-content'
import SpacesGrid from '@/components/spaces-grid'

export default async function Home() {
  // Fetch spaces
  const spaces = await db.space.findMany({
    where: { published: true },
    orderBy: { name: 'asc' },
    take: 6 // Show first 6 spaces
  })

  return (
    <InteractiveHero isHomePage={true}>
      {/* Vision Section */}
      <section id="vision" className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2
            className="text-4xl md:text-5xl font-bold text-cream mb-8 text-center"
            style={{ fontFamily: 'var(--font-decorative)' }}
          >
            The Vision
          </h2>

          <VisionContent />
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

          <SpacesGrid spaces={spaces} showViewAll={true} />
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
          <h3 className="text-2xl md:text-3xl font-bold text-cream mb-8 text-center" style={{ fontFamily: 'var(--font-serif)' }}>
            This Week's Schedule
          </h3>

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
