import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/header'
import { format } from 'date-fns'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params

  const event = await db.multiDayEvent.findUnique({
    where: {
      slug,
      published: true
    },
    include: {
      sections: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!event) {
    notFound()
  }

  const getEventTypeColor = () => {
    switch (event.type) {
      case 'FESTIVAL':
        return 'bg-purple-500/20 border-purple-400 text-purple-300'
      case 'INTENSIVE':
        return 'bg-orange-500/20 border-orange-400 text-orange-300'
      case 'RETREAT':
        return 'bg-green-500/20 border-green-400 text-green-300'
      default:
        return 'bg-blue-500/20 border-blue-400 text-blue-300'
    }
  }

  return (
    <>
      <Header isHomePage={false} />
      <div className="min-h-screen relative">
        {/* Background image */}
        <div className="fixed inset-0 z-0">
          <Image
            src="/assets/stary-background.png"
            alt="Background"
            fill
            style={{ objectFit: 'cover' }}
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <section className="relative z-10 min-h-screen pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-4">
            {/* Event Header */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl border-2 border-cream/30 p-8 mb-8"
                 style={{ boxShadow: '0 0 30px rgba(246, 216, 157, 0.2)' }}>
              {event.posterImage && (
                <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
                  <Image
                    src={event.posterImage}
                    alt={event.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <h1
                  className="text-4xl md:text-5xl font-bold text-cream"
                  style={{ fontFamily: 'var(--font-decorative)' }}
                >
                  {event.title}
                </h1>
                <span className={`inline-block text-sm px-3 py-1 rounded border ${getEventTypeColor()}`}>
                  {event.type}
                </span>
              </div>

              <div className="text-cream/80 text-xl mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                {format(new Date(event.startDate), 'MMMM d')} - {format(new Date(event.endDate), 'MMMM d, yyyy')}
              </div>

              {event.description && (
                <p className="text-cream/70 text-lg leading-relaxed mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                  {event.description}
                </p>
              )}

              {/* Social Links */}
              <div className="flex gap-4 flex-wrap">
                {event.websiteUrl && (
                  <a
                    href={event.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-cream/20 text-cream rounded-lg hover:bg-white/20 hover:border-cream/30 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Website
                  </a>
                )}
                {event.facebookUrl && (
                  <a
                    href={event.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-cream/20 text-cream rounded-lg hover:bg-white/20 hover:border-cream/30 transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                )}
                {event.instagramUrl && (
                  <a
                    href={event.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-cream/20 text-cream rounded-lg hover:bg-white/20 hover:border-cream/30 transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                    </svg>
                    Instagram
                  </a>
                )}
              </div>
            </div>

            {/* Event Sections */}
            {event.sections.length > 0 && (
              <div className="space-y-8">
                {event.sections.map((section) => (
                  <div
                    key={section.id}
                    className="bg-white/5 backdrop-blur-md rounded-xl border-2 border-cream/30 p-8"
                    style={{ boxShadow: '0 0 30px rgba(246, 216, 157, 0.2)' }}
                  >
                    {section.imageUrl && (
                      <div className="relative h-64 w-full mb-6 rounded-lg overflow-hidden">
                        <Image
                          src={section.imageUrl}
                          alt={section.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <h2
                      className="text-2xl font-bold text-cream mb-4"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {section.title}
                    </h2>
                    {section.description && (
                      <p className="text-cream/70 leading-relaxed whitespace-pre-wrap">
                        {section.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Back to Schedule */}
            <div className="text-center mt-12">
              <Link
                href="/schedule/month"
                className="inline-block px-6 py-3 rounded-lg bg-white/10 border border-cream/20 text-cream hover:bg-white/20 hover:border-cream/30 transition-all"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                ← Back to Monthly Schedule
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}