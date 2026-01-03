import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { TexturedBand } from '@/components/textured-band'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section - Dark Purple with Moon/Stars vibe */}
      <div className="relative bg-gradient-to-b from-black via-purple-950 to-black text-white py-24 overflow-hidden">
        {/* Twinkling stars */}
        <div className="absolute top-20 right-1/4 text-5xl star magical-glow">✦</div>
        <div className="absolute top-32 right-1/3 text-3xl opacity-60 star">✦</div>
        <div className="absolute top-40 left-1/4 text-4xl opacity-40 star">✦</div>
        <div className="absolute bottom-32 left-1/3 text-2xl opacity-50 star">✦</div>
        <div className="absolute top-1/2 right-1/5 text-xl opacity-30 star">✦</div>

        {/* Floating moon */}
        <div className="absolute top-16 left-1/4 text-6xl opacity-80 float">🌙</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-7xl md:text-9xl font-bold mb-4 tracking-wide fade-in" style={{ fontFamily: 'var(--font-decorative)' }}>
              Dreamscape
            </h1>
            <p className="text-4xl md:text-5xl mb-8 tracking-widest magical-glow fade-in-delay" style={{ color: '#BD752C', fontFamily: 'var(--font-serif)' }}>
              PAI
            </p>
            <div className="w-64 h-1 bg-gradient-to-r from-transparent via-sunset to-transparent mx-auto mb-10 shimmer"></div>
            <p className="text-2xl md:text-4xl mb-12 tracking-wide fade-in-delay" style={{ color: '#BD752C', fontFamily: 'var(--font-serif)', textShadow: '0 0 20px rgba(189, 117, 44, 0.5)' }}>
              Where Movement Meets Magic
            </p>
          </div>
        </div>
      </div>

      {/* Tagline Bands */}
      <TexturedBand color="terracotta" className="text-center py-6 px-4">
        <p className="text-2xl md:text-3xl" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          Play. Flow. Restore.
        </p>
      </TexturedBand>

      {/* Five Pillars - Circular Badges */}
      <div className="py-20 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {/* Movement & Flow */}
            <div className="flex flex-col items-center fade-in">
              <div className="w-44 h-44 rounded-full bg-terracotta text-white flex flex-col items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ boxShadow: '0 10px 40px rgba(172, 86, 45, 0.4)' }}>
                <div className="text-6xl mb-2" style={{ animation: 'float 3s ease-in-out infinite' }}>🤸</div>
                <p className="text-sm font-semibold text-center px-4">Movement<br />& Flow</p>
              </div>
            </div>

            {/* Wellness & Restore */}
            <div className="flex flex-col items-center fade-in-delay">
              <div className="w-44 h-44 rounded-full bg-forest text-white flex flex-col items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ boxShadow: '0 10px 40px rgba(61, 82, 35, 0.4)' }}>
                <div className="text-6xl mb-2" style={{ animation: 'float 3.5s ease-in-out infinite 0.5s' }}>🧘</div>
                <p className="text-sm font-semibold text-center px-4">Wellness<br />& Restore</p>
              </div>
            </div>

            {/* Community & Events */}
            <div className="flex flex-col items-center fade-in">
              <div className="w-44 h-44 rounded-full bg-sunset text-white flex flex-col items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ boxShadow: '0 10px 40px rgba(189, 117, 44, 0.4)' }}>
                <div className="text-6xl mb-2" style={{ animation: 'float 2.8s ease-in-out infinite 1s' }}>🎪</div>
                <p className="text-sm font-semibold text-center px-4">Community<br />& Events</p>
              </div>
            </div>

            {/* Nature & Escape */}
            <div className="flex flex-col items-center fade-in-delay">
              <div className="w-44 h-44 rounded-full bg-lavender text-white flex flex-col items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 cursor-pointer" style={{ boxShadow: '0 10px 40px rgba(108, 90, 116, 0.4)' }}>
                <div className="text-6xl mb-2" style={{ animation: 'float 3.2s ease-in-out infinite 1.5s' }}>🏔️</div>
                <p className="text-sm font-semibold text-center px-4">Nature<br />& Escape</p>
              </div>
            </div>

            {/* Experience */}
            <div className="flex flex-col items-center col-span-2 md:col-span-1 mx-auto fade-in">
              <div className="w-44 h-44 rounded-full bg-sunset text-white flex flex-col items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 cursor-pointer magical-glow" style={{ boxShadow: '0 10px 40px rgba(189, 117, 44, 0.5)' }}>
                <div className="text-6xl mb-2" style={{ animation: 'float 2.5s ease-in-out infinite 0.8s' }}>✨</div>
                <p className="text-sm font-semibold text-center px-4">Experience<br />Magic</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sunset Background Section */}
      <div
        className="relative py-32 overflow-hidden"
        style={{
          backgroundImage: 'url(/assets/pai-sunset.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40"></div>
        <div className="relative z-10 text-center px-4">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 magical-glow" style={{ fontFamily: 'var(--font-script)', textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)' }}>
            Elevate Every Moment
          </h2>
          <p className="text-2xl md:text-3xl text-cream font-semibold" style={{ fontFamily: 'var(--font-serif)', textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)' }}>
            In the Mountains of Northern Thailand
          </p>
        </div>
      </div>

      {/* What We Offer */}
      <div className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 magical-glow" style={{ fontFamily: 'var(--font-script)', color: '#F6D89D' }}>
              Workshops • Retreats • Gatherings
            </h2>
            <p className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: '#BD752C' }}>
              Discover Your Practice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <Link href="/spaces" className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition text-center">
              <h3 className="text-2xl font-bold mb-4 text-forest">Explore Our Spaces</h3>
              <p className="text-gray-600">
                Aerial Shala, Dance Studio, Dome, Amphitheater, Sauna Lounge, and more
              </p>
            </Link>

            <Link href="/schedule" className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition text-center">
              <h3 className="text-2xl font-bold mb-4 text-terracotta">What&apos;s Happening</h3>
              <p className="text-gray-600">
                Circus workshops, yoga flows, dance parties, shows, and community jams
              </p>
            </Link>

            <Link href="/memberships" className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition text-center">
              <h3 className="text-2xl font-bold mb-4 text-sunset">Join the Community</h3>
              <p className="text-gray-600">
                Monthly memberships for full access to equipment and spaces
              </p>
            </Link>
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/schedule"
              className="inline-block bg-gradient-to-r from-terracotta to-sunset text-white px-12 py-5 rounded-full text-xl font-bold shadow-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-110 magical-glow relative overflow-hidden"
              style={{ boxShadow: '0 10px 40px rgba(172, 86, 45, 0.5)' }}
            >
              <span className="relative z-10">View Schedule</span>
              <div className="absolute inset-0 shimmer"></div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Band */}
      <TexturedBand color="purple" className="text-center py-8 px-4">
        <p className="text-lg opacity-90">Purist by Design: Vegan & Alcohol-Free</p>
        <p className="text-sm opacity-75 mt-2">Technology + Circus + Wellness</p>
      </TexturedBand>
    </div>
  )
}
