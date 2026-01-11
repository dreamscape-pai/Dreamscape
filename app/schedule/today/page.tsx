import Image from 'next/image'
import TodaySchedule from '@/components/today-schedule'
import Header from '@/components/header'

export default function TodaySchedulePage() {
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
          <div className="max-w-7xl mx-auto px-4">
            <h2
              className="text-4xl md:text-5xl font-bold text-cream mb-4 text-center"
              style={{ fontFamily: 'var(--font-decorative)' }}
            >
              Today at Dreamscape
            </h2>
            <p className="text-cream/80 text-center mb-8 text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
              See what's happening across all our spaces today
            </p>

            <TodaySchedule />
          </div>
        </section>
      </div>
    </>
  )
}