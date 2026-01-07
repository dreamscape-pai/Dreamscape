import { db } from '../lib/db'

async function normalizeEmails() {
  try {
    const users = await db.user.findMany({
      select: { id: true, email: true }
    })

    console.log(`Found ${users.length} users`)

    for (const user of users) {
      if (!user.email) continue

      const normalizedEmail = user.email.toLowerCase().trim()

      if (user.email !== normalizedEmail) {
        await db.user.update({
          where: { id: user.id },
          data: { email: normalizedEmail }
        })
        console.log(`✓ Updated: ${user.email} → ${normalizedEmail}`)
      } else {
        console.log(`- Already normalized: ${user.email}`)
      }
    }

    console.log('\n✓ All emails normalized!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

normalizeEmails()
