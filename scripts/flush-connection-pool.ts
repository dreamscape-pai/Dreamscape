import { PrismaClient } from '@prisma/client'

async function main() {
  console.log('Flushing connection pool...')

  // Create multiple connections to flush the pool
  for (let i = 0; i < 5; i++) {
    const prisma = new PrismaClient()
    try {
      // Execute a simple query to establish connection
      await prisma.$queryRaw`SELECT 1`
      console.log(`Connection ${i + 1} established and closed`)
    } finally {
      await prisma.$disconnect()
    }
  }

  console.log('✓ Connection pool flushed')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
