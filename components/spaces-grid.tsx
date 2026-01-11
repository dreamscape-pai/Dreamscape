'use client'

import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link'

type Space = {
  id: number
  name: string
  slug: string
  description: string | null
  images: string[]
  color: string | null
  capacity?: number | null
}

interface SpacesGridProps {
  spaces: Space[]
  showViewAll?: boolean
}

function SpaceRow({ space }: { space: Space }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const hasImages = space.images && space.images.length > 0
  const hasMultipleImages = space.images && space.images.length > 1

  const goToPreviousImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasImages) {
      setCurrentImageIndex(prev =>
        prev === 0 ? space.images.length - 1 : prev - 1
      )
    }
  }

  const goToNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasImages) {
      setCurrentImageIndex(prev =>
        prev === space.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  return (
    <div
      className="flex flex-col md:flex-row bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden border border-cream/10 hover:bg-white/10 hover:border-cream/20 transition-all group cursor-default"
    >
      {/* Image Gallery Section */}
      <div className="relative w-full md:w-[300px] h-64 md:h-[300px] flex-shrink-0">
        {hasImages ? (
          <>
            <Image
              src={space.images[currentImageIndex]}
              alt={`${space.name} - Photo ${currentImageIndex + 1}`}
              fill
              className="object-cover"
              unoptimized
            />

            {/* Image Navigation */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={goToPreviousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-cream hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={goToNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-cream hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {space.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setCurrentImageIndex(index)
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-cream w-4'
                          : 'bg-cream/50 hover:bg-cream/70'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-purple-950/20 flex items-center justify-center">
            <p className="text-cream/30 text-lg">No photos yet</p>
          </div>
        )}
      </div>

      {/* Space Details Section */}
      <div className="flex-1 p-6 md:p-8">
        <h3 className="text-2xl md:text-3xl font-semibold mb-3 text-cream" style={{ fontFamily: 'var(--font-serif)' }}>
          {space.name}
        </h3>

        {space.description && (
          <p className="text-cream/80 mb-4 leading-relaxed">
            {space.description}
          </p>
        )}

        <div className="flex items-center gap-4 mt-4">
          {space.capacity && (
            <span className="text-sm text-cream/60 bg-white/5 px-3 py-1 rounded-full">
              Capacity: {space.capacity}
            </span>
          )}

        </div>
      </div>
    </div>
  )
}

export default function SpacesGrid({ spaces, showViewAll = false }: SpacesGridProps) {
  if (spaces.length === 0) {
    return (
      <p className="text-center text-cream/60 py-12">No spaces available yet</p>
    )
  }

  return (
    <>
      <div className="space-y-6 mb-8">
        {spaces.map((space) => (
          <SpaceRow key={space.id} space={space} />
        ))}
      </div>

      {showViewAll && (
        <div className="text-center">
          <Link
            href="/spaces"
            className="inline-block px-8 py-3 rounded-lg bg-white/10 border border-cream/20 text-cream hover:bg-white/20 hover:border-cream/30 transition-all"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            View All Spaces →
          </Link>
        </div>
      )}
    </>
  )
}