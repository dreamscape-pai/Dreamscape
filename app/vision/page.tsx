import Image from 'next/image'
import Header from '@/components/header'
import VisionContent from '@/components/vision-content'

export default function VisionPage() {
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
            <h2
              className="text-4xl md:text-5xl font-bold text-cream mb-8 text-center"
              style={{ fontFamily: 'var(--font-decorative)' }}
            >
              The Vision
            </h2>

            <VisionContent />
          </div>
        </section>
      </div>
    </>
  )
}