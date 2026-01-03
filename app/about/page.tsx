import { Navigation } from '@/components/navigation'
import { TexturedBand } from '@/components/textured-band'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <TexturedBand color="forest" className="text-center py-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          What is this place?
        </h1>
        <p className="text-lg text-sand">Where Movement Meets Magic</p>
      </TexturedBand>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4 text-forest">Our Vision</h2>
          <p className="text-gray-700 mb-4">
            Dreamscape is a creation center nestled in the mountains of Northern Thailand in Pai.
            We are a unique, dreamy space where technology, circus, and wellness converge to create
            an art and embodiment playground like no other.
          </p>
          <p className="text-gray-700 mb-4">
            Our tagline says it all: <strong>Everything is Art</strong>. We believe in creating a
            space that is visually rich, interactive, and feels like a place you want to explore
            and get lost in.
          </p>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4 text-terracotta">Purist by Design</h2>
          <p className="text-gray-700 mb-4">
            Dreamscape is <strong>vegan and alcohol-free</strong>. We&apos;ve made these choices
            intentionally to create a pure space focused on creativity, embodiment, and wellness.
          </p>
        </div>

        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4 text-sunset">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Workshops</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Circus workshops</li>
                <li>• Yoga (various styles including hot yoga)</li>
                <li>• Movement and embodiment practices</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Events</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Circus shows and performances</li>
                <li>• Light shows and installations</li>
                <li>• Dance parties and jams</li>
                <li>• Open mic nights</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Programs</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Retreats</li>
                <li>• Festivals</li>
                <li>• Residencies for artists</li>
                <li>• Monthly memberships</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Equipment</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Aerial silks, lyra, trapeze</li>
                <li>• Cyr wheel and acrobatics</li>
                <li>• Handstand canes and poles</li>
                <li>• Electric cycles and more</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-4 text-lavender">Who We Serve</h2>
          <p className="text-gray-700 mb-4">
            Dreamscape welcomes a diverse community of creators and seekers:
          </p>
          <ul className="text-gray-700 space-y-2">
            <li>• <strong>Members:</strong> Regular trainers looking for world-class equipment and community</li>
            <li>• <strong>Workshop Students:</strong> Those eager to learn new skills in circus, wellness, and art</li>
            <li>• <strong>Event Guests:</strong> Attendees of shows, parties, and special events</li>
            <li>• <strong>Festival Organizers:</strong> Groups looking for a unique venue to host festivals</li>
            <li>• <strong>Artists & Performers:</strong> DJs, circus companies, and creative professionals</li>
            <li>• <strong>Retreat Leaders:</strong> Facilitators and resident artists</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
