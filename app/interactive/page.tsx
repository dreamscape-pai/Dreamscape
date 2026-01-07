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
              width: `${emptyScale}%`,
              height: `${emptyScale}%`,
              position: 'relative',
              transform: `translate3d(${emptyOffsetX}px, ${emptyOffsetY}px, 0)`
            }}
          >
            <Image
              src="/assets/main-stars.png"
              alt="Dreamscape Stars"
              fill
              style={{ objectFit: 'contain' }}
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

export default function InteractivePage() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Debug tuning controls (keep/remove)
  const [emptyScale, setEmptyScale] = useState(104.2)
  const [mainScale, setMainScale] = useState(100)
  const [emptyOffsetX, setEmptyOffsetX] = useState(-0.08)
  const [emptyOffsetY, setEmptyOffsetY] = useState(14.3)
  const [mainOffsetX, setMainOffsetX] = useState(0)
  const [mainOffsetY, setMainOffsetY] = useState(0)

  useEffect(() => {
    let latestScrollTop = 0
    let latestViewportHeight = 0

    // Smooth scroll-following value to remove “jumps” on some devices.
    let smoothedScrollTop = 0

    let animationFrameId: number | null = null
    let isAnimating = false

    const updateCssVariables = () => {
      const containerElement = containerRef.current
      if (!containerElement) return

      const viewportHeight = Math.max(1, latestViewportHeight)

      // Smoothly chase scroll position (small “transition-like” feel without CSS transition fights).
      smoothedScrollTop = lerpNumber(smoothedScrollTop, latestScrollTop, 0.18)

      const scrollUnits = smoothedScrollTop / viewportHeight

      // Timeline (in viewport heights) - moved earlier:
      // 0.00 -> 0.60 : reveal radial mask  (0..1)
      // 0.60 -> 1.00 : hero moves up and offscreen + fades out
      // 1.00 -> 1.12 : header fades in
      const reveal = clampNumber(scrollUnits / 0.6, 0, 1)

      const heroMove = clampNumber((scrollUnits - 0.6) / 0.4, 0, 1) // 0..1
      const heroFade = 1 - clampNumber((scrollUnits - 0.82) / 0.18, 0, 1) // 1..0

      const headerFade = clampNumber((scrollUnits - 1.0) / 0.12, 0, 1)

      containerElement.style.setProperty('--scroll-y', String(smoothedScrollTop))
      containerElement.style.setProperty('--viewport-height', String(latestViewportHeight))
      containerElement.style.setProperty('--reveal', String(reveal))
      containerElement.style.setProperty('--hero-move', String(heroMove))
      containerElement.style.setProperty('--hero-opacity', String(heroFade))
      containerElement.style.setProperty('--header-opacity', String(headerFade))

      // Keep animating briefly until we catch up (prevents “stair-step” feel).
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

  // Fold much sooner (was ~195vh). This is a big jump up, per your note.
  const foldSpacerClassName = 'h-[120vh]'

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
          '--header-opacity': '0'
        } as React.CSSProperties
      }
    >
      {/* Debug controls (keep/remove) */}
      <div className="fixed top-4 right-4 z-[200] bg-black/80 p-4 rounded-lg text-white space-y-3 max-h-screen overflow-y-auto text-xs">
        <div>
          <p className="font-bold mb-2">Empty Ring</p>
          <p className="mb-1">Scale: {emptyScale.toFixed(1)}%</p>
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => setEmptyScale(currentValue => currentValue - 0.1)}
              className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              -0.1
            </button>
            <button
              onClick={() => setEmptyScale(currentValue => currentValue + 0.1)}
              className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              +0.1
            </button>
          </div>

          <p className="mb-1">X Offset: {emptyOffsetX}px</p>
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => setEmptyOffsetX(currentValue => currentValue - 0.1)}
              className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              -0.1
            </button>
            <button
              onClick={() => setEmptyOffsetX(currentValue => currentValue + 0.1)}
              className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              +0.1
            </button>
          </div>

          <p className="mb-1">Y Offset: {emptyOffsetY}px</p>
          <div className="flex gap-1">
            <button
              onClick={() => setEmptyOffsetY(currentValue => currentValue - 0.1)}
              className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              -0.1
            </button>
            <button
              onClick={() => setEmptyOffsetY(currentValue => currentValue + 0.1)}
              className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              +0.1
            </button>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-3">
          <p className="font-bold mb-2">Main Image</p>
          <p className="mb-1">Scale: {mainScale}%</p>
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => setMainScale(currentValue => currentValue - 1)}
              className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              -1
            </button>
            <button
              onClick={() => setMainScale(currentValue => currentValue + 1)}
              className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              +1
            </button>
          </div>

          <p className="mb-1">X Offset: {mainOffsetX}px</p>
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => setMainOffsetX(currentValue => currentValue - 1)}
              className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              -1
            </button>
            <button
              onClick={() => setMainOffsetX(currentValue => currentValue + 1)}
              className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              +1
            </button>
          </div>

          <p className="mb-1">Y Offset: {mainOffsetY}px</p>
          <div className="flex gap-1">
            <button
              onClick={() => setMainOffsetY(currentValue => currentValue - 1)}
              className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              -1
            </button>
            <button
              onClick={() => setMainOffsetY(currentValue => currentValue + 1)}
              className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              +1
            </button>
          </div>
        </div>
      </div>

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
            <div className="flex flex-col items-center gap-1">
              <h1
                className="text-5xl md:text-6xl font-bold text-white tracking-wide uppercase px-3 py-2.5"
                style={{
                  fontFamily: 'var(--font-decorative)',
                  textShadow: titleTextShadow
                }}
              >
                Dreamscape
              </h1>
            </div>

            <nav className="flex gap-6 text-cream pointer-events-auto">
              {[
                { href: '/spaces', label: 'Spaces' },
                { href: '/schedule', label: 'Schedule' },
                { href: '/about', label: 'Vision' }
              ].map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-xl md:text-2xl hover:scale-105 cursor-pointer px-6 py-3 rounded-lg transition-all"
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
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(246, 216, 157, 0.1)'
                    e.currentTarget.style.color = '#F6D89D'
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Header: fades in after hero scrolls away */}
      <div style={{ opacity: 'var(--header-opacity)' }}>
        <Header />
      </div>

      {/* Scroll spacer: fold much sooner */}
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

      {/* Below the fold */}
      <div className="relative z-10">
        <div
          className="h-[64px]"
          style={{
            background: 'linear-gradient(to bottom, #180A3300, #180A33FF)'
          }}
        />
        <div className="min-h-screen pt-24" style={{ backgroundColor: '#180A33' }}>
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-cream mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
              Below the Fold
            </h2>
            <p className="text-cream text-lg mb-4">Replace this with your real page content.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

