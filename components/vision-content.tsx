export default function VisionContent() {
  return (
    <div className="space-y-8">
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-cream/10">
        <h3 className="text-2xl font-bold mb-4 text-cream" style={{ fontFamily: 'var(--font-serif)' }}>
          What is this place?
        </h3>
        <p className="text-cream/90 mb-4 text-lg">
          Dreamscape is a creation center nestled in the mountains of Northern Thailand in Pai.
        </p>
        <p className="text-cream/90 text-lg mb-4">
          We are a unique, dreamy space where circus, and wellness converge to create
          an art and embodiment playground like no other.
        </p>
        <p className="text-cream/90 text-lg mb-4">
          From the beginning, our space was designed as a circus training facility built to support and empower the thriving circus and flow community in Pai.
        </p>
        <p className="text-cream/90 text-lg">
          Our goal says it all: <strong>Everything is Art</strong>. We believe in creating a
          space that is visually rich, interactive, and feels like a place you want to explore
          and lose yourself.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-cream/10">
        <h3 className="text-2xl font-bold mb-4 text-cream" style={{ fontFamily: 'var(--font-serif)' }}>
          Purist by Design
        </h3>
        <p className="text-cream/90 text-lg">
          Dreamscape is <strong>vegan and alcohol-free</strong>. We&apos;ve made these choices
          intentionally to create a pure space focused on creativity, embodiment, and wellness.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-cream/10">
        <h3 className="text-2xl font-bold mb-4 text-cream" style={{ fontFamily: 'var(--font-serif)' }}>
          What We Offer
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-lg mb-2 text-cream">Workshops</h4>
            <ul className="text-cream/80 space-y-1">
              <li>• Circus workshops</li>
              <li>• Yoga (various styles including hot yoga)</li>
              <li>• Movement and embodiment practices</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2 text-cream">Events</h4>
            <ul className="text-cream/80 space-y-1">
              <li>• Circus shows and performances</li>
              <li>• Light shows and installations</li>
              <li>• Dance parties and jams</li>
              <li>• Open mic nights</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2 text-cream">Programs</h4>
            <ul className="text-cream/80 space-y-1">
              <li>• Retreats</li>
              <li>• Festivals</li>
              <li>• Residencies for artists</li>
              <li>• Monthly memberships</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2 text-cream">Equipment</h4>
            <ul className="text-cream/80 space-y-1">
              <li>• Aerial silks, lyra, trapeze</li>
              <li>• Cyr wheel and acrobatics</li>
              <li>• Handstand canes and poles</li>
              <li>• Electric cycles and more</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-cream/10">
        <h3 className="text-2xl font-bold mb-4 text-cream" style={{ fontFamily: 'var(--font-serif)' }}>
          Who We Serve
        </h3>
        <p className="text-cream/90 mb-4 text-lg">
          Dreamscape welcomes a diverse community of creators and seekers:
        </p>
        <ul className="text-cream/80 space-y-2 text-lg">
          <li>• <strong>Members:</strong> Regular trainers looking for world-class equipment and community</li>
          <li>• <strong>Workshop Students:</strong> Those eager to learn new skills in circus, wellness, and art</li>
          <li>• <strong>Event Guests:</strong> Attendees of shows, parties, and special events</li>
          <li>• <strong>Festival Organizers:</strong> Groups looking for a unique venue to host festivals</li>
          <li>• <strong>Artists & Performers:</strong> DJs, circus companies, and creative professionals</li>
          <li>• <strong>Retreat Leaders:</strong> Facilitators and resident artists</li>
        </ul>
      </div>
    </div>
  )
}
