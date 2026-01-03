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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center text-xl font-bold">
                Dreamscape Admin
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/admin" className="inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/admin/spaces" className="inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Spaces
                </Link>
                <Link href="/admin/events" className="inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Events
                </Link>
                <Link href="/admin/products" className="inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Products
                </Link>
                <Link href="/admin/memberships" className="inline-flex items-center px-1 pt-1 text-sm font-medium">
                  Memberships
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/" className="text-sm font-medium text-gray-700">
                View Site
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
