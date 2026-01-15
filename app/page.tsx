import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import InteractiveHero from '@/components/interactive-hero'
import HomeSchedule from '@/components/home-schedule'
import VisionContent from '@/components/vision-content'
import SpacesGrid from '@/components/spaces-grid'
import ScheduleHeader from '@/components/schedule-header'
import { format } from 'date-fns'

export default async function Home() {
  // Fetch spaces
  const spaces = await db.space.findMany({
    where: { published: true },
    orderBy: { name: 'asc' },
    take: 6 // Show first 6 spaces
  })

  // Fetch featured multi-day events
  const featuredEvents = await db.multiDayEvent.findMany({
    where: {
      published: true,
      featured: true
    },
    orderBy: { startDate: 'asc' },
    take: 3 // Show up to 3 featured events
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
          <ScheduleHeader currentView="week" />

          <HomeSchedule />

          <div className="text-center mt-8">
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

      {/* Festivals and Intensives Section */}
      {featuredEvents.length > 0 && (
        <section id="festivals" className="pt-16 pb-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2
              className="text-4xl md:text-5xl font-bold text-cream mb-4 text-center"
              style={{ fontFamily: 'var(--font-decorative)' }}
            >
              Festivals & Intensives
            </h2>
            <p className="text-cream/80 text-center mb-12 text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
              Join us for transformative multi-day experiences
            </p>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map(event => {
                const eventTypeColor =
                  event.type === 'FESTIVAL' ? 'bg-purple-500/20 border-purple-400 text-purple-300' :
                  event.type === 'INTENSIVE' ? 'bg-orange-500/20 border-orange-400 text-orange-300' :
                  'bg-green-500/20 border-green-400 text-green-300'

                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className="group block bg-white/5 backdrop-blur-md rounded-lg overflow-hidden border-2 border-cream/20 hover:border-cream/40 transition-all"
                    style={{ boxShadow: '0 0 20px rgba(246, 216, 157, 0.1)' }}
                  >
                    {event.posterImage && (
                      <div className="relative h-64 w-full overflow-hidden">
                        <Image
                          src={event.posterImage}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`inline-block text-xs px-2 py-1 rounded border ${eventTypeColor}`}>
                          {event.type}
                        </span>
                      </div>
                      <h3 className="font-bold text-cream text-xl mb-2 group-hover:text-cream/90 transition">
                        {event.title}
                      </h3>
                      <p className="text-cream/60 text-sm mb-3">
                        {format(new Date(event.startDate), 'MMM d')} - {format(new Date(event.endDate), 'MMM d, yyyy')}
                      </p>
                      {event.description && (
                        <p className="text-cream/70 text-sm line-clamp-3">
                          {event.description}
                        </p>
                      )}
                      <div className="mt-4 text-cream/80 text-sm group-hover:text-cream transition">
                        Learn more →
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/schedule/month"
                className="inline-block px-8 py-3 rounded-lg bg-white/10 border border-cream/20 text-cream hover:bg-white/20 hover:border-cream/30 transition-all"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                View All Events →
              </Link>
            </div>
          </div>
        </section>
      )}
    </InteractiveHero>
  )
}
