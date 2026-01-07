import { db } from '../lib/db'
import bcrypt from 'bcryptjs'

async function resetPassword() {
  const email = process.argv[2]
  const newPassword = process.argv[3]

  if (!email || !newPassword) {
    console.error('Usage: npx tsx scripts/reset-password.ts <email> <new-password>')
    process.exit(1)
  }

  try {
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.error(`User with email ${email} not found`)
      process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await db.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    console.log(`✓ Password reset successfully for ${email}`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

resetPassword()
