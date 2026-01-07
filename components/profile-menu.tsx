'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const user = session?.user

  if (status === 'loading') {
    return null
  }

  return (
    <>
      {!session && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link href="/auth/signin">
            <button className="w-12 h-12 rounded-full bg-cream/10 backdrop-blur-md border border-cream/20 hover:bg-cream/20 hover:border-cream/30 transition-all flex items-center justify-center">
              <svg
                className="w-6 h-6 text-cream"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </Link>
        </div>
      )}

      {session && (
        <div className="fixed bottom-6 right-6 z-50" ref={menuRef}>
          {/* Profile Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-12 h-12 rounded-full bg-cream/10 backdrop-blur-md border border-cream/20 hover:bg-cream/20 hover:border-cream/30 transition-all flex items-center justify-center overflow-hidden"
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-cream/20 text-cream font-semibold">
                {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute bottom-16 right-0 w-80 bg-black/90 backdrop-blur-md rounded-lg shadow-xl border border-cream/30 overflow-hidden">
              {/* User Info */}
              <div className="p-4 border-b border-cream/20 flex items-center gap-3">
                {/* Profile Image */}
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-cream/30">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-cream/20 text-cream font-semibold text-lg">
                      {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                {/* Name & Email */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-cream truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-sm text-cream/70 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-cream/90 hover:bg-cream/10 transition"
                  onClick={() => setIsOpen(false)}
                >
                  View Profile
                </Link>
                <Link
                  href="/profile/edit"
                  className="block px-4 py-2 text-sm text-cream/90 hover:bg-cream/10 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Edit Profile
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-cream/90 hover:bg-cream/10 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>

              {/* Sign Out */}
              <div className="border-t border-cream/20 p-2">
                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/' })
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-2 py-2 text-sm text-cream/90 hover:bg-cream/10 rounded transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
