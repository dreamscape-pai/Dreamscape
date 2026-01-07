import { db } from '../lib/db'
import bcrypt from 'bcryptjs'

async function checkPassword() {
  const email = process.argv[2]
  const testPassword = process.argv[3]

  if (!email || !testPassword) {
    console.error('Usage: npx tsx scripts/check-password.ts <email> <test-password>')
    process.exit(1)
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true
      }
    })

    if (!user) {
      console.error(`User with email ${email} not found`)
      process.exit(1)
    }

    console.log(`User found: ID=${user.id}, Email=${user.email}`)
    console.log(`Password hash exists: ${!!user.password}`)
    console.log(`Password hash length: ${user.password?.length || 0}`)

    if (user.password) {
      const isMatch = await bcrypt.compare(testPassword, user.password)
      console.log(`Password match: ${isMatch}`)

      if (!isMatch) {
        console.log('\nPassword does NOT match. The test password you provided is incorrect.')
      } else {
        console.log('\n✓ Password matches! You should be able to sign in with this password.')
      }
    } else {
      console.log('\n⚠ No password hash found in database!')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

checkPassword()
