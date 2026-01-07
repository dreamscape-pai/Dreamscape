import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1410] via-[#2a1f1a] to-[#1a1410]">
      {/* Subtle texture overlay */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'url(/assets/textures/paper.png)',
        backgroundRepeat: 'repeat'
      }}></div>

      <nav className="bg-gradient-to-r from-lavender/20 via-forest/20 to-lavender/20 backdrop-blur-md border-b border-sand/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center text-xl font-bold text-sand hover:text-sunset transition">
                <span style={{ fontFamily: 'var(--font-decorative)' }}>Dreamscape</span>
                <span className="text-sunset ml-2">Admin</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
                <Link href="/admin" className="inline-flex items-center px-3 pt-1 text-sm font-medium text-sand/80 hover:text-sunset border-b-2 border-transparent hover:border-sunset transition">
                  Dashboard
                </Link>
                <Link href="/admin/schedule" className="inline-flex items-center px-3 pt-1 text-sm font-medium text-sand/80 hover:text-sunset border-b-2 border-transparent hover:border-sunset transition">
                  Schedule
                </Link>
                <Link href="/admin/spaces" className="inline-flex items-center px-3 pt-1 text-sm font-medium text-sand/80 hover:text-sunset border-b-2 border-transparent hover:border-sunset transition">
                  Spaces
                </Link>
                <Link href="/admin/events" className="inline-flex items-center px-3 pt-1 text-sm font-medium text-sand/80 hover:text-sunset border-b-2 border-transparent hover:border-sunset transition">
                  Events
                </Link>
                <Link href="/admin/products" className="inline-flex items-center px-3 pt-1 text-sm font-medium text-sand/80 hover:text-sunset border-b-2 border-transparent hover:border-sunset transition">
                  Products
                </Link>
                <Link href="/admin/memberships" className="inline-flex items-center px-3 pt-1 text-sm font-medium text-sand/80 hover:text-sunset border-b-2 border-transparent hover:border-sunset transition">
                  Memberships
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/" className="text-sm font-medium text-sand/80 hover:text-sunset transition px-4 py-2 rounded-full border border-sand/20 hover:border-sunset/50">
                ← View Site
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
