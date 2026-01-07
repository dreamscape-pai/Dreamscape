import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Delete old events
  const deleted = await prisma.event.deleteMany({
    where: {
      startTime: {
        gte: new Date('2024-12-01'),
        lte: new Date('2025-02-01')
      }
    }
  })
  console.log(`Deleted ${deleted.count} old events`)

  // Get existing spaces
  const dome = await prisma.space.findUnique({ where: { slug: 'dome' } })
  const sauna = await prisma.space.findUnique({ where: { slug: 'sauna' } })
  const poleStudio = await prisma.space.findUnique({ where: { slug: 'pole-studio' } })
  const saunaLounge = await prisma.space.findUnique({ where: { slug: 'sauna-lounge' } })
  const stage = await prisma.space.findUnique({ where: { slug: 'stage' } })
  const shala = await prisma.space.findUnique({ where: { slug: 'shala' } })
  const saunaArea = await prisma.space.findUnique({ where: { slug: 'sauna-area' } })

  if (!dome || !sauna || !poleStudio || !saunaLounge || !stage || !shala || !saunaArea) {
    throw new Error('Some spaces are missing!')
  }

  const events = [
    // Monday Dec 30
    { title: 'Ballet Basics', slug: 'ballet-basics-1', startTime: new Date('2025-12-30T14:00:00+07:00'), endTime: new Date('2025-12-30T15:30:00+07:00'), type: 'MEMBERSHIP_TRAINING', spaceId: dome.id },
    { title: 'BassShip Event', slug: 'basship-1', startTime: new Date('2025-12-30T17:30:00+07:00'), endTime: new Date('2025-12-30T21:30:00+07:00'), type: 'OTHER', spaceId: dome.id },
    // Tuesday Dec 31
    { title: 'Hot Yoga', slug: 'hot-yoga-1', startTime: new Date('2025-12-31T09:30:00+07:00'), endTime: new Date('2025-12-31T10:30:00+07:00'), type: 'MEMBERSHIP_TRAINING', spaceId: sauna.id },
    { title: 'Pole Class', slug: 'pole-1', startTime: new Date('2025-12-31T11:00:00+07:00'), endTime: new Date('2025-12-31T12:30:00+07:00'), type: 'MEMBERSHIP_TRAINING', spaceId: poleStudio.id },
    { title: 'Flexibility Class', slug: 'flex-1', startTime: new Date('2025-12-31T12:00:00+07:00'), endTime: new Date('2025-12-31T13:30:00+07:00'), type: 'MEMBERSHIP_TRAINING', spaceId: dome.id },
    { title: 'Contemporary Dance Class', slug: 'contemp-1', startTime: new Date('2025-12-31T14:00:00+07:00'), endTime: new Date('2025-12-31T15:45:00+07:00'), type: 'MEMBERSHIP_TRAINING', spaceId: dome.id },
    { title: 'Sauna and Sound Event', slug: 'sauna-sound-1', startTime: new Date('2025-12-31T16:00:00+07:00'), endTime: new Date('2025-12-31T22:00:00+07:00'), type: 'OTHER', spaceId: saunaLounge.id },
    { title: 'Light Show', slug: 'light-1', startTime: new Date('2025-12-31T21:00:00+07:00'), endTime: new Date('2025-12-31T21:30:00+07:00'), type: 'SHOW', spaceId: dome.id },
    // Wednesday Jan 1
    { title: 'Acro Jam', slug: 'acro-1', startTime: new Date('2026-01-01T11:00:00+07:00'), endTime: new Date('2026-01-01T13:30:00+07:00'), type: 'JAM', spaceId: dome.id },
    { title: 'Electric Unicycle Jam', slug: 'euc-1', startTime: new Date('2026-01-01T14:00:00+07:00'), endTime: new Date('2026-01-01T16:00:00+07:00'), type: 'JAM', spaceId: dome.id },
    { title: 'Cyr Wheel Jam', slug: 'cyr-1', startTime: new Date('2026-01-01T16:00:00+07:00'), endTime: new Date('2026-01-01T17:30:00+07:00'), type: 'JAM', spaceId: stage.id },
    { title: 'Magic Show', slug: 'magic-1', startTime: new Date('2026-01-01T19:15:00+07:00'), endTime: new Date('2026-01-01T20:30:00+07:00'), type: 'SHOW', spaceId: dome.id },
    { title: 'Fire Jam', slug: 'fire-1', startTime: new Date('2026-01-01T20:30:00+07:00'), endTime: new Date('2026-01-01T22:00:00+07:00'), type: 'JAM', spaceId: stage.id },
    // Thursday Jan 2
    { title: 'Ritual Ecstatic Dance', slug: 'ritual-1', startTime: new Date('2026-01-02T11:00:00+07:00'), endTime: new Date('2026-01-02T15:00:00+07:00'), type: 'DANCE_EVENT', spaceId: saunaArea.id },
    { title: 'Pole Class', slug: 'pole-2', startTime: new Date('2026-01-02T11:00:00+07:00'), endTime: new Date('2026-01-02T12:30:00+07:00'), type: 'MEMBERSHIP_TRAINING', spaceId: poleStudio.id },
    { title: 'Acrodance Class', slug: 'acrodance-1', startTime: new Date('2026-01-02T16:00:00+07:00'), endTime: new Date('2026-01-02T17:30:00+07:00'), type: 'MEMBERSHIP_TRAINING', spaceId: dome.id },
    // Friday Jan 3
    { title: 'Kidscape', slug: 'kidscape-1', startTime: new Date('2026-01-03T17:00:00+07:00'), endTime: new Date('2026-01-03T19:00:00+07:00'), type: 'OTHER', spaceId: dome.id },
    { title: 'Sunset Open Mic', slug: 'openmic-1', startTime: new Date('2026-01-03T17:45:00+07:00'), endTime: new Date('2026-01-03T20:45:00+07:00'), type: 'SHOW', spaceId: shala.id },
    { title: 'Movie Night', slug: 'movie-1', startTime: new Date('2026-01-03T19:00:00+07:00'), endTime: new Date('2026-01-03T21:00:00+07:00'), type: 'SHOW', spaceId: dome.id },
    // Saturday Jan 4
    { title: 'To-Gather Event', slug: 'togather-1', startTime: new Date('2026-01-04T12:00:00+07:00'), endTime: new Date('2026-01-04T22:00:00+07:00'), type: 'OTHER', spaceId: dome.id },
    { title: 'Ecstatic Dreams – Ecstatic Dance', slug: 'ecstatic-1', startTime: new Date('2026-01-04T17:30:00+07:00'), endTime: new Date('2026-01-04T22:00:00+07:00'), type: 'DANCE_EVENT', spaceId: stage.id }
  ]

  for (const eventData of events) {
    const { spaceId, ...eventFields } = eventData
    await prisma.event.create({
      data: {
        ...eventFields,
        published: true,
        spaces: {
          create: { spaceId }
        }
      }
    })
    console.log(`✓ ${eventData.title}`)
  }

  console.log(`\n✅ Created ${events.length} events for this week!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
