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
            <div className="absolute bottom-16 right-0 w-56 bg-black/90 backdrop-blur-md rounded-lg shadow-xl border border-cream/30 overflow-hidden">
              {/* User Info */}
              <div className="p-4 border-b border-cream/20 flex items-center gap-3">
                {/* Profile Image */}
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-cream/30">
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
                </div>
                {/* Name Only */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-cream truncate">
                    {user?.name || 'User'}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-cream/90 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 hover:text-cream hover:scale-[1.02] transition-all duration-200 transform"
                  onClick={() => setIsOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </Link>
                <Link
                  href="/profile/edit"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-cream/90 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-green-500/20 hover:text-cream hover:scale-[1.02] transition-all duration-200 transform"
                  onClick={() => setIsOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-cream/90 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-500/20 hover:text-cream hover:scale-[1.02] transition-all duration-200 transform"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
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
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-cream/90 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 hover:text-cream hover:scale-[1.02] rounded transition-all duration-200 transform"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
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
