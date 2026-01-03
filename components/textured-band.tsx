type TexturedBandProps = {
  children: React.ReactNode
  color: 'terracotta' | 'forest' | 'sunset' | 'lavender' | 'purple'
  className?: string
}

export function TexturedBand({ children, color, className = '' }: TexturedBandProps) {
  const colorMap = {
    terracotta: 'bg-terracotta',
    forest: 'bg-forest',
    sunset: 'bg-sunset',
    lavender: 'bg-lavender',
    purple: 'bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800',
  }

  return (
    <div className={`${colorMap[color]} text-white relative overflow-hidden ${className}`}>
      {/* Canvas texture overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'url(/assets/textures/canvas.png)',
          backgroundRepeat: 'repeat',
          mixBlendMode: 'overlay'
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
