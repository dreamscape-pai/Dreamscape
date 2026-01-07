import { auth } from '@/auth'
import { db } from './db'

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null

  // Defensive check: if ID is not a number, session is stale
  if (typeof session.user.id !== 'number') {
    console.warn('Stale session detected with non-integer ID. User needs to re-authenticate.')
    return null
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  })

  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
  return user
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN'
}
