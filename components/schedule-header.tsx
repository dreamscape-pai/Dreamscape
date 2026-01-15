'use client'

import { useRouter, usePathname } from 'next/navigation'
import { format } from 'date-fns'

type ScheduleHeaderProps = {
  currentView?: 'day' | 'week' | 'month'
  currentDate?: Date
}

export default function ScheduleHeader({ currentView, currentDate }: ScheduleHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Determine active view from pathname if not provided
  const activeView = currentView || (
    pathname.includes('/month') ? 'month' :
    pathname.includes('/schedule/') || pathname === '/schedule/today' ? 'day' :
    'week'
  )

  const handleTodayClick = () => {
    const today = new Date()
    const dateStr = format(today, 'M-d-yyyy')
    router.push(`/schedule/${dateStr}`)
  }

  const handleDayClick = () => {
    if (currentDate) {
      const dateStr = format(currentDate, 'M-d-yyyy')
      router.push(`/schedule/${dateStr}`)
    } else {
      router.push('/schedule/today')
    }
  }

  const handleWeekClick = () => {
    router.push('/schedule')
  }

  const handleMonthClick = () => {
    router.push('/schedule/month')
  }

  return (
    <div className="mb-8">
      <h2
        className="text-4xl md:text-5xl font-bold text-cream mb-6 text-center"
        style={{ fontFamily: 'var(--font-decorative)' }}
      >
        Dreamscape Schedule
      </h2>

      <div className="flex justify-center gap-2">
        <button
          onClick={handleTodayClick}
          className="px-4 py-2 rounded-lg bg-white/10 border border-cream/20 text-cream hover:bg-white/20 hover:border-cream/30 transition-all"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Today
        </button>
        <button
          onClick={handleDayClick}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeView === 'day'
              ? 'bg-white/20 border border-cream/30 text-cream cursor-default'
              : 'bg-white/10 border border-cream/20 text-cream hover:bg-white/20 hover:border-cream/30'
          }`}
          style={{ fontFamily: 'var(--font-serif)' }}
          disabled={activeView === 'day'}
        >
          Day
        </button>
        <button
          onClick={handleWeekClick}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeView === 'week'
              ? 'bg-white/20 border border-cream/30 text-cream cursor-default'
              : 'bg-white/10 border border-cream/20 text-cream hover:bg-white/20 hover:border-cream/30'
          }`}
          style={{ fontFamily: 'var(--font-serif)' }}
          disabled={activeView === 'week'}
        >
          Week
        </button>
        <button
          onClick={handleMonthClick}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeView === 'month'
              ? 'bg-white/20 border border-cream/30 text-cream cursor-default'
              : 'bg-white/10 border border-cream/20 text-cream hover:bg-white/20 hover:border-cream/30'
          }`}
          style={{ fontFamily: 'var(--font-serif)' }}
          disabled={activeView === 'month'}
        >
          Month
        </button>
      </div>
    </div>
  )
}