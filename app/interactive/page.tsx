'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

function clampNumber(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
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

  // Keep your tuning controls (optional)
  const [emptyScale, setEmptyScale] = useState(104.2)
  const [mainScale, setMainScale] = useState(100)
  const [emptyOffsetX, setEmptyOffsetX] = useState(-0.08)
  const [emptyOffsetY, setEmptyOffsetY] = useState(14.3)
  const [mainOffsetX, setMainOffsetX] = useState(0)
  const [mainOffsetY, setMainOffsetY] = useState(0)

  useEffect(() => {
    let latestScrollTop = 0
    let latestViewportHeight = 0
    let animationFrameId: number | null = null

    const updateCssVariables = () => {
      const containerElement = containerRef.current
      if (!containerElement) return

      const viewportHeight = Math.max(1, latestViewportHeight)
      const scrollUnits = latestScrollTop / viewportHeight

      // Phase timing (in viewport-heights):
      // 0.00 -> 0.90 : reveal  (reveal goes 0..1)
      // 0.90 -> 1.60 : lift    (hero moves to top)
      // 1.60 -> 2.30 : compact (turn into header)
      const reveal = clampNumber(scrollUnits / 0.9, 0, 1)
      const lift = clampNumber((scrollUnits - 0.9) / 0.7, 0, 1)
      const compact = clampNumber((scrollUnits - 1.6) / 0.7, 0, 1)

      containerElement.style.setProperty('--scroll-y', String(latestScrollTop))
      containerElement.style.setProperty('--viewport-height', String(latestViewportHeight))
      containerElement.style.setProperty('--reveal', String(reveal))
      containerElement.style.setProperty('--lift', String(lift))
      containerElement.style.setProperty('--compact', String(compact))

      animationFrameId = null
    }

    const onScrollOrResize = () => {
      latestScrollTop = window.scrollY
      latestViewportHeight = window.innerHeight

      if (animationFrameId !== null) return
      animationFrameId = window.requestAnimationFrame(updateCssVariables)
    }

    onScrollOrResize()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
      if (animationFrameId !== null) window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const headerTranslateY = 'calc(var(--lift) * -35vh)'
  const headerPaddingTop = 'calc(var(--lift) * 18px)'

  const cornerShiftX = 'clamp(140px, 38vw, 540px)'
  const compactScale = 'calc(1 - (var(--compact) * 0.35))'
  const compactTranslateY = 'calc(var(--compact) * -10px)'

  const titleTransform = `translate3d(calc(var(--compact) * -1 * ${cornerShiftX}), ${compactTranslateY}, 0) scale(${compactScale})`
  const navTransform = `translate3d(calc(var(--compact) * ${cornerShiftX}), ${compactTranslateY}, 0) scale(${compactScale})`

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black"
      style={
        {
          '--scroll-y': '0',
          '--viewport-height': '0',
          '--reveal': '0',
          '--lift': '0',
          '--compact': '0'
        } as React.CSSProperties
      }
    >
      {/* Debug controls (keep/remove) */}
      <div className="fixed top-4 right-4 z-[100] bg-black/80 p-4 rounded-lg text-white space-y-3 max-h-screen overflow-y-auto text-xs">
        <div>
          <p className="font-bold mb-2">Empty Ring</p>
          <p className="mb-1">Scale: {emptyScale.toFixed(1)}%</p>
          <div className="flex gap-1 mb-2">
            <button onClick={() => setEmptyScale(value => value - 0.1)} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
              -0.1
            </button>
            <button onClick={() => setEmptyScale(value => value + 0.1)} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
              +0.1
            </button>
          </div>

          <p className="mb-1">X Offset: {emptyOffsetX}px</p>
          <div className="flex gap-1 mb-2">
            <button onClick={() => setEmptyOffsetX(value => value - 0.1)} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
              -0.1
            </button>
            <button onClick={() => setEmptyOffsetX(value => value + 0.1)} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
              +0.1
            </button>
          </div>

          <p className="mb-1">Y Offset: {emptyOffsetY}px</p>
          <div className="flex gap-1">
            <button onClick={() => setEmptyOffsetY(value => value - 0.1)} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
              -0.1
            </button>
            <button onClick={() => setEmptyOffsetY(value => value + 0.1)} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
              +0.1
            </button>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-3">
          <p className="font-bold mb-2">Main Image</p>
          <p className="mb-1">Scale: {mainScale}%</p>
          <div className="flex gap-1 mb-2">
            <button onClick={() => setMainScale(value => value - 1)} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
              -1
            </button>
            <button onClick={() => setMainScale(value => value + 1)} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
              +1
            </button>
          </div>

          <p className="mb-1">X Offset: {mainOffsetX}px</p>
          <div className="flex gap-1 mb-2">
            <button onClick={() => setMainOffsetX(value => value - 1)} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
              -1
            </button>
            <button onClick={() => setMainOffsetX(value => value + 1)} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
              +1
            </button>
          </div>

          <p className="mb-1">Y Offset: {mainOffsetY}px</p>
          <div className="flex gap-1">
            <button onClick={() => setMainOffsetY(value => value - 1)} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
              -1
            </button>
            <button onClick={() => setMainOffsetY(value => value + 1)} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">
              +1
            </button>
          </div>
        </div>
      </div>

      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-center" style={{ height: '100vh', paddingTop: headerPaddingTop }}>
          <div
            className="flex flex-col items-center gap-6"
            style={{
              transform: `translate3d(0, ${headerTranslateY}, 0)`,
              willChange: 'transform'
            }}
          >
            <div
              className="flex flex-col items-center gap-1"
              style={{
                transform: titleTransform,
                transformOrigin: 'center',
                willChange: 'transform'
              }}
            >
              <h1
                className="text-5xl md:text-6xl font-bold text-white tracking-wide uppercase px-3 py-2.5"
                style={{
                  fontFamily: 'var(--font-decorative)',
                  textShadow: '0 0 40px rgba(255, 215, 0, 0.8), 0 0 80px rgba(189, 117, 44, 0.6)'
                }}
              >
                Dreamscape
              </h1>
              <p className="text-cream text-sm md:text-base tracking-wide" style={{ fontFamily: 'var(--font-decorative)' }}>
                Circus, Embodiment, Creation Center in Pai, Thailand
              </p>
            </div>

            <nav
              className="flex gap-6 text-cream pointer-events-auto"
              style={{
                transform: navTransform,
                transformOrigin: 'center',
                willChange: 'transform'
              }}
            >
              {[
                { href: '/spaces', label: 'Spaces' },
                { href: '/schedule', label: 'Schedule' },
                { href: '/about', label: 'Vision' }
              ].map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-xl md:text-2xl hover:text-white hover:scale-105 cursor-pointer px-6 py-3 rounded-lg transition-transform"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    backgroundColor: 'rgba(246, 216, 157, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(246, 216, 157, 0.2)'
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Scroll spacer: shorter so the “fold” isn’t so far down */}
      <div className="relative z-10">
        <div className="h-[260vh]" />
      </div>

      {/* Fixed background */}
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
          className="h-[100px]"
          style={{
            background: 'linear-gradient(to bottom, #180A3300, #180A33FF)'
          }}
        />
        <div className="min-h-screen pt-24" style={{ backgroundColor: '#180A33' }}>
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-cream mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
              Below the Fold
            </h2>
            <p className="text-cream text-lg mb-4">
              Replace this with your real page content.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

