'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Header from '@/components/header'

function clampNumber(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

function lerpNumber(startValue: number, endValue: number, interpolationAmount: number) {
  return startValue + (endValue - startValue) * interpolationAmount
}

interface LayeredImageProps {
  emptyScale: number
  emptyOffsetX: number
  emptyOffsetY: number
  mainScale: number
  mainOffsetX: number
  mainOffsetY: number
  opacity?: number
}

function LayeredImage({
  emptyScale,
  emptyOffsetX,
  emptyOffsetY,
  mainScale,
  mainOffsetX,
  mainOffsetY,
  opacity = 1
}: LayeredImageProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="absolute md:relative top-0 left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0"
        style={{
          width: '100vh',
          height: '100vh',
          borderRadius: '50px',
          overflow: 'hidden'
        }}
      >
        {/* Base layer */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ opacity }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'relative'
            }}
          >
            <Image
              src="/assets/main-stars.png"
              alt="Dreamscape Stars"
              fill
              style={{
                objectFit: 'contain',
                transform: `scale(${emptyScale / 100}) translate(${emptyOffsetX}px, ${emptyOffsetY}px)`,
                transformOrigin: 'center center'
              }}
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Top image: single radial reveal mask */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity,
            willChange: 'mask-image, -webkit-mask-image',
            WebkitMaskImage:
              'radial-gradient(circle at center, black calc(var(--reveal) * 140%), transparent calc(var(--reveal) * 140% + 10%))',
            maskImage:
              'radial-gradient(circle at center, black calc(var(--reveal) * 140%), transparent calc(var(--reveal) * 140% + 10%))'
          }}
        >
          <div
            style={{
              width: `${mainScale}%`,
              height: `${mainScale}%`,
              position: 'relative',
              transform: `translate3d(${mainOffsetX}px, ${mainOffsetY}px, 0)`
            }}
          >
            <Image
              src="/assets/main.png"
              alt="Dreamscape"
              fill
              style={{ objectFit: 'contain' }}
              priority
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface InteractiveHeroProps {
  children?: React.ReactNode
}

export default function InteractiveHero({ children }: InteractiveHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Image positioning values
  const emptyScale = 103.8
  const emptyOffsetX = -1.9
  const emptyOffsetY = 11.7
  const mainScale = 100
  const mainOffsetX = 0
  const mainOffsetY = 0

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    let latestScrollTop = 0
    let latestViewportHeight = 0

    // Smooth scroll-following value to remove "jumps" on some devices.
    let smoothedScrollTop = 0

    let animationFrameId: number | null = null
    let isAnimating = false

    const updateCssVariables = () => {
      const containerElement = containerRef.current
      if (!containerElement) return

      const viewportHeight = Math.max(1, latestViewportHeight)

      // Smoothly chase scroll position (small "transition-like" feel without CSS transition fights).
      smoothedScrollTop = lerpNumber(smoothedScrollTop, latestScrollTop, 0.18)

      const scrollUnits = smoothedScrollTop / viewportHeight

      // Timeline (in viewport heights):
      // 0.00 -> 0.60 : reveal radial mask  (0..1)
      // 0.60 -> 0.84 : pause (hero stays in place)
      // 0.84 -> 1.24 : hero moves up to top
      // 1.24 -> 1.54 : hero fades out while header fades in (crossfade when title hits top)
      const reveal = clampNumber(scrollUnits / 0.6, 0, 1)

      const heroMove = clampNumber((scrollUnits - 0.84) / 0.4, 0, 1) // 0..1
      const heroFade = 1 - clampNumber((scrollUnits - 1.24) / 0.3, 0, 1) // Fade out from 1.24 to 1.54

      const headerFade = clampNumber((scrollUnits - 1.24) / 0.3, 0, 1) // Fade in from 1.24 to 1.54

      containerElement.style.setProperty('--scroll-y', String(smoothedScrollTop))
      containerElement.style.setProperty('--viewport-height', String(latestViewportHeight))
      containerElement.style.setProperty('--reveal', String(reveal))
      containerElement.style.setProperty('--hero-move', String(heroMove))
      containerElement.style.setProperty('--hero-opacity', String(heroFade))
      containerElement.style.setProperty('--header-opacity', String(headerFade))
      containerElement.style.setProperty('--hero-pointer-events', heroFade > 0.1 ? 'auto' : 'none')

      // Keep animating briefly until we catch up (prevents "stair-step" feel).
      const remainingDistance = Math.abs(latestScrollTop - smoothedScrollTop)
      if (remainingDistance < 0.25) {
        isAnimating = false
        animationFrameId = null
        return
      }

      animationFrameId = window.requestAnimationFrame(updateCssVariables)
    }

    const startAnimationLoop = () => {
      if (isAnimating) return
      isAnimating = true
      animationFrameId = window.requestAnimationFrame(updateCssVariables)
    }

    const onScrollOrResize = () => {
      latestScrollTop = window.scrollY
      latestViewportHeight = window.innerHeight
      startAnimationLoop()
    }

    // Initialize
    latestScrollTop = window.scrollY
    latestViewportHeight = window.innerHeight
    smoothedScrollTop = latestScrollTop
    startAnimationLoop()

    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
      if (animationFrameId !== null) window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Hero motion in pixels (avoids vh rounding jumpiness)
  // Move at same rate as scroll: 0.4vh of scrolling = 0.4vh of movement (1:1 ratio)
  const heroTranslateY = 'calc(var(--hero-move) * -0.4 * var(--viewport-height) * 1px)'

  const foldSpacerClassName = 'h-[144vh]'

  const titleTextShadow = '0 0 40px rgba(255, 215, 0, 0.8), 0 0 80px rgba(189, 117, 44, 0.6)'

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black"
      style={
        {
          '--scroll-y': '0',
          '--viewport-height': '0',
          '--reveal': '0',
          '--hero-move': '0',
          '--hero-opacity': '1',
          '--header-opacity': '0',
          '--hero-pointer-events': 'auto'
        } as React.CSSProperties
      }
    >
      {/* HERO: scrolls off the page (smoothed) */}
      <div className="fixed top-0 left-0 right-0 z-[80] pointer-events-none">
        <div className="flex items-center justify-center" style={{ height: '100vh' }}>
          <div
            className="flex flex-col items-center gap-6"
            style={{
              transform: `translate3d(0, ${heroTranslateY}, 0)`,
              opacity: 'var(--hero-opacity)',
              willChange: 'transform, opacity'
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <h1
                className="text-5xl md:text-6xl font-bold text-white tracking-wide uppercase px-3 py-2.5"
                style={{
                  fontFamily: 'var(--font-decorative)',
                  textShadow: titleTextShadow
                }}
              >
                Dreamscape
              </h1>
              <p
                className="text-2xl md:text-3xl tracking-wide"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: '#BD752C',
                  textShadow: '0 0 20px rgba(189, 117, 44, 0.5)'
                }}
              >
                Where Movement Meets Magic
              </p>
            </div>

            <nav className="flex gap-6 text-cream" style={{ pointerEvents: 'var(--hero-pointer-events)' }}>
              {[
                { id: 'spaces', label: 'Spaces' },
                { id: 'schedule', label: 'Schedule' },
                { id: 'vision', label: 'Vision' }
              ].map(link => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-xl md:text-2xl cursor-pointer px-6 py-3 rounded-lg transition-all"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    backgroundColor: 'rgba(246, 216, 157, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(246, 216, 157, 0.2)',
                    color: '#F6D89D'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(246, 216, 157, 0.25)'
                    e.currentTarget.style.color = '#FAE1AF'
                    e.currentTarget.style.transform = 'scale(1.05)'
                    const span = e.currentTarget.querySelector('span')
                    if (span) span.style.transform = 'scale(1.10)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(246, 216, 157, 0.1)'
                    e.currentTarget.style.color = '#F6D89D'
                    e.currentTarget.style.transform = ''
                    const span = e.currentTarget.querySelector('span')
                    if (span) span.style.transform = ''
                  }}
                >
                  <span className="inline-block transition-transform">{link.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Header: fades in after hero scrolls away */}
      <div
        className="fixed top-0 left-0 right-0 z-20"
        style={{ opacity: 'var(--header-opacity)' }}
      >
        <Header />
      </div>

      {/* Scroll spacer */}
      <div className="relative z-10">
        <div className={foldSpacerClassName} />
      </div>

      {/* Fixed background stack */}
      <div className="fixed top-0 left-0 right-0 w-full h-screen z-0">
        <div className="absolute top-0 left-0 w-full h-full" style={{ opacity: 0.8 }}>
          <Image
            src="/assets/stary-background.png"
            alt="Starry Background"
            fill
            style={{ objectFit: 'cover', objectPosition: 'top' }}
            priority
            unoptimized
          />
        </div>

        <LayeredImage
          emptyScale={emptyScale}
          emptyOffsetX={emptyOffsetX}
          emptyOffsetY={emptyOffsetY}
          mainScale={mainScale}
          mainOffsetX={mainOffsetX}
          mainOffsetY={mainOffsetY}
        />
      </div>

      {/* Content sections */}
      <div className="relative z-10">
        <div
          className="h-[64px]"
          style={{
            background: 'linear-gradient(to bottom, #180A3300, #180A33FF)'
          }}
        />
        <div style={{ backgroundColor: 'rgba(24, 10, 51, 0.8)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
