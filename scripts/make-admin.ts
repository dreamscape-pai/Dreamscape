import { db } from '../lib/db'

async function makeFirstUserAdmin() {
  try {
    const firstUser = await db.user.findFirst({
      orderBy: { createdAt: 'asc' }
    })

    if (!firstUser) {
      console.log('No users found')
      return
    }

    const updatedUser = await db.user.update({
      where: { id: firstUser.id },
      data: { role: 'ADMIN' },
      select: { email: true, role: true }
    })

    console.log(`✓ User ${updatedUser.email} is now ${updatedUser.role}`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

makeFirstUserAdmin()
