import { auth } from '@clerk/nextjs/server'
import { db } from './db'

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await db.user.findUnique({
    where: { id: userId },
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
