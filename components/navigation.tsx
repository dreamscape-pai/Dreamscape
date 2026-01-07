'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export function Navigation() {
  const { data: session } = useSession()

  return (
    <nav className="bg-gradient-to-r from-indigo-950 via-purple-900 to-indigo-950 text-white shadow-lg relative overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'url(/assets/textures/canvas.png)',
        backgroundRepeat: 'repeat',
        mixBlendMode: 'overlay'
      }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-2xl font-bold tracking-wide hover:opacity-80 transition" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              <span className="text-white">Dreamscape</span>
              <span className="text-sunset ml-2 text-lg">PAI</span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link href="/about" className="inline-flex items-center px-3 pt-1 text-sm font-medium text-sand hover:text-sunset transition">
                About
              </Link>
              <Link href="/schedule" className="inline-flex items-center px-3 pt-1 text-sm font-medium text-sand hover:text-sunset transition">
                Schedule
              </Link>
              <Link href="/spaces" className="inline-flex items-center px-3 pt-1 text-sm font-medium text-sand hover:text-sunset transition">
                Spaces
              </Link>
              <Link href="/cafe" className="inline-flex items-center px-3 pt-1 text-sm font-medium text-sand hover:text-sunset transition">
                Cafe
              </Link>
              <Link href="/memberships" className="inline-flex items-center px-3 pt-1 text-sm font-medium text-sand hover:text-sunset transition">
                Memberships
              </Link>
              <Link href="/contact" className="inline-flex items-center px-3 pt-1 text-sm font-medium text-sand hover:text-sunset transition">
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin" className="text-sm font-medium bg-sunset text-white px-4 py-2 rounded-full hover:bg-terracotta transition">
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
