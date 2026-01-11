'use client'

import Image from 'next/image'
import Link from 'next/link'

interface HeaderProps {
  isHomePage?: boolean
}

export default function Header({ isHomePage = false }: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-[120]"
      style={{
        pointerEvents: 'auto',
        willChange: 'opacity'
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: '86px',
          boxShadow: '0 10px 24px rgba(0, 0, 0, 0.35)'
        }}
      >
        <Image
          src="/assets/stary-background.png"
          alt="Header background"
          fill
          style={{ objectPosition: 'top' }}
          priority
          unoptimized
        />

        {/* Slight dark overlay for readability */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Feathered "drop shadow" edge */}
        <div
          className="absolute left-0 right-0 bottom-0 pointer-events-none"
          style={{
            height: '100%',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.40), rgba(0,0,0,0.15))'
          }}
        />

        <div className="relative h-full max-w-6xl mx-auto px-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-bold uppercase tracking-wide"
            style={{
              fontFamily: 'var(--font-decorative)',
              textShadow: 'rgba(255, 215, 0, 0.8) 0px 0px 40px, rgba(189, 117, 44, 0.6) 0px 0px 80px',
              fontSize: '28px',
              lineHeight: '1',
              color: 'var(--cream)'
            }}
          >
            Dreamscape
          </Link>

          <nav className="flex gap-3 md:gap-4">
            {[
              { id: 'spaces', label: 'Spaces', href: '/spaces' },
              { id: 'schedule', label: 'Schedule', href: '/schedule' },
              { id: 'vision', label: 'Vision', href: '/vision' }
            ].map(link => (
              isHomePage ? (
                <button
                  key={link.id}
                  onClick={() => {
                    const element = document.getElementById(link.id)
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className="group text-sm md:text-base text-cream px-3 py-2 rounded-md transition-all"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    backgroundColor: 'rgba(246, 216, 157, 0.10)',
                    border: '1px solid rgba(246, 216, 157, 0.22)',
                    willChange: 'transform'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(246, 216, 157, 0.25)'
                    e.currentTarget.style.color = '#FAE1AF'
                    e.currentTarget.style.transform = 'scale(1.05)'
                    const span = e.currentTarget.querySelector('span')
                    if (span) span.style.transform = 'scale(1.10)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(246, 216, 157, 0.10)'
                    e.currentTarget.style.color = '#F6D89D'
                    e.currentTarget.style.transform = ''
                    const span = e.currentTarget.querySelector('span')
                    if (span) span.style.transform = ''
                  }}
                >
                  <span className="inline-block transition-transform">{link.label}</span>
                </button>
              ) : (
                <Link
                  key={link.id}
                  href={link.href}
                  className="group text-sm md:text-base text-cream px-3 py-2 rounded-md transition-all inline-block"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    backgroundColor: 'rgba(246, 216, 157, 0.10)',
                    border: '1px solid rgba(246, 216, 157, 0.22)',
                    willChange: 'transform'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(246, 216, 157, 0.25)'
                    e.currentTarget.style.color = '#FAE1AF'
                    e.currentTarget.style.transform = 'scale(1.05)'
                    const span = e.currentTarget.querySelector('span')
                    if (span) span.style.transform = 'scale(1.10)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(246, 216, 157, 0.10)'
                    e.currentTarget.style.color = '#F6D89D'
                    e.currentTarget.style.transform = ''
                    const span = e.currentTarget.querySelector('span')
                    if (span) span.style.transform = ''
                  }}
                >
                  <span className="inline-block transition-transform">{link.label}</span>
                </Link>
              )
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
