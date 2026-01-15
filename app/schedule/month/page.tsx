import Image from 'next/image'
import Header from '@/components/header'
import MonthlySchedule from '@/components/monthly-schedule'
import ScheduleHeader from '@/components/schedule-header'

export default function MonthlySchedulePage() {
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
            <ScheduleHeader currentView="month" />

            <p className="text-cream/80 text-center mb-8 text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
              Festivals, Intensives & Retreats
            </p>

            <MonthlySchedule />
          </div>
        </section>
      </div>
    </>
  )
}