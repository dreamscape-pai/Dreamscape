import { db } from '../lib/db'

async function listUsers() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })

    console.log('Users in database:')
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Role: ${user.role}, Created: ${user.createdAt}`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

listUsers()
