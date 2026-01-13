import Image from 'next/image'
import TodaySchedule from '@/components/today-schedule'
import Header from '@/components/header'
import { redirect } from 'next/navigation'

export default function ScheduleDatePage({ params }: { params: { date: string } }) {
  // Handle "today" route - redirect to actual date
  if (params.date === 'today') {
    const today = new Date()
    const dateStr = `${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}`
    redirect(`/schedule/${dateStr}`)
  }

  // Parse the date from the URL (format: M-D-YYYY)
  const dateParts = params.date.split('-')
  if (dateParts.length !== 3) {
    redirect('/schedule/today')
  }

  const month = parseInt(dateParts[0]) - 1 // JavaScript months are 0-indexed
  const day = parseInt(dateParts[1])
  const year = parseInt(dateParts[2])

  const scheduleDate = new Date(year, month, day, 12, 0, 0, 0)

  // Validate the date
  if (isNaN(scheduleDate.getTime())) {
    redirect('/schedule/today')
  }

  // Format display date
  const displayDate = scheduleDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const isToday = scheduleDate.toDateString() === new Date().toDateString()

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
              {isToday ? "Today at Dreamscape" : "Dreamscape Schedule"}
            </h2>
            <p className="text-cream/80 text-center mb-8 text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
              {displayDate}
            </p>

            <TodaySchedule initialDate={scheduleDate} />
          </div>
        </section>
      </div>
    </>
  )
}