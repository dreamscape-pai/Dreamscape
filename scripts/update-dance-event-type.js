const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Updating DANCE_EVENT to WORKSHOP temporarily...')

  // First, update all events with DANCE_EVENT type to WORKSHOP temporarily
  const result = await prisma.$executeRaw`
    UPDATE "Event"
    SET "type" = 'WORKSHOP'
    WHERE "type" = 'DANCE_EVENT'
  `

  console.log(`Updated ${result} events from DANCE_EVENT to WORKSHOP temporarily`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })