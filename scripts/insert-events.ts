import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // First, let's get or create the spaces
  const spaces = {
    dome: await prisma.space.upsert({
      where: { slug: 'dome' },
      update: {},
      create: { name: 'Dome', slug: 'dome', published: true }
    }),
    sauna: await prisma.space.upsert({
      where: { slug: 'sauna' },
      update: {},
      create: { name: 'Sauna', slug: 'sauna', published: true }
    }),
    poleStudio: await prisma.space.upsert({
      where: { slug: 'pole-studio' },
      update: {},
      create: { name: 'Pole Studio', slug: 'pole-studio', published: true }
    }),
    saunaLounge: await prisma.space.upsert({
      where: { slug: 'sauna-lounge' },
      update: {},
      create: { name: 'Sauna Lounge', slug: 'sauna-lounge', published: true }
    }),
    stage: await prisma.space.upsert({
      where: { slug: 'stage' },
      update: {},
      create: { name: 'Stage', slug: 'stage', published: true }
    }),
    shala: await prisma.space.upsert({
      where: { slug: 'shala' },
      update: {},
      create: { name: 'Shala', slug: 'shala', published: true }
    }),
    saunaArea: await prisma.space.upsert({
      where: { slug: 'sauna-area' },
      update: {},
      create: { name: 'Sauna Area', slug: 'sauna-area', published: true }
    })
  }

  const events = [
    // Monday Dec 30
    {
      title: 'Ballet Basics',
      slug: 'ballet-basics-dec-30',
      startTime: new Date('2024-12-30T14:00:00+07:00'),
      endTime: new Date('2024-12-30T15:30:00+07:00'),
      type: 'MEMBERSHIP_TRAINING',
      spaceId: spaces.dome.id,
      published: true
    },
    {
      title: 'BassShip Event',
      slug: 'basship-event-dec-30',
      startTime: new Date('2024-12-30T17:30:00+07:00'),
      endTime: new Date('2024-12-30T21:30:00+07:00'),
      type: 'OTHER',
      spaceId: spaces.dome.id,
      published: true
    },
    // Tuesday Dec 31
    {
      title: 'Hot Yoga',
      slug: 'hot-yoga-dec-31',
      startTime: new Date('2024-12-31T09:30:00+07:00'),
      endTime: new Date('2024-12-31T10:30:00+07:00'),
      type: 'MEMBERSHIP_TRAINING',
      spaceId: spaces.sauna.id,
      published: true
    },
    {
      title: 'Pole Class',
      slug: 'pole-class-dec-31',
      startTime: new Date('2024-12-31T11:00:00+07:00'),
      endTime: new Date('2024-12-31T12:30:00+07:00'),
      type: 'MEMBERSHIP_TRAINING',
      spaceId: spaces.poleStudio.id,
      published: true
    },
    {
      title: 'Flexibility Class',
      slug: 'flexibility-class-dec-31',
      startTime: new Date('2024-12-31T12:00:00+07:00'),
      endTime: new Date('2024-12-31T13:30:00+07:00'),
      type: 'MEMBERSHIP_TRAINING',
      spaceId: spaces.dome.id,
      published: true
    },
    {
      title: 'Contemporary Dance Class',
      slug: 'contemporary-dance-dec-31',
      startTime: new Date('2024-12-31T14:00:00+07:00'),
      endTime: new Date('2024-12-31T15:45:00+07:00'),
      type: 'MEMBERSHIP_TRAINING',
      spaceId: spaces.dome.id,
      published: true
    },
    {
      title: 'Sauna and Sound Event',
      slug: 'sauna-sound-dec-31',
      startTime: new Date('2024-12-31T16:00:00+07:00'),
      endTime: new Date('2024-12-31T22:00:00+07:00'),
      type: 'OTHER',
      spaceId: spaces.saunaLounge.id,
      published: true
    },
    {
      title: 'Light Show',
      slug: 'light-show-dec-31',
      startTime: new Date('2024-12-31T21:00:00+07:00'),
      endTime: new Date('2024-12-31T21:30:00+07:00'),
      type: 'SHOW',
      spaceId: spaces.dome.id,
      published: true
    },
    // Wednesday Jan 1
    {
      title: 'Acro Jam',
      slug: 'acro-jam-jan-1',
      startTime: new Date('2025-01-01T11:00:00+07:00'),
      endTime: new Date('2025-01-01T13:30:00+07:00'),
      type: 'JAM',
      spaceId: spaces.dome.id,
      published: true
    },
    {
      title: 'Electric Unicycle Jam',
      slug: 'euc-jam-jan-1',
      startTime: new Date('2025-01-01T14:00:00+07:00'),
      endTime: new Date('2025-01-01T16:00:00+07:00'),
      type: 'JAM',
      spaceId: spaces.dome.id,
      published: true
    },
    {
      title: 'Cyr Wheel Jam',
      slug: 'cyr-wheel-jam-jan-1',
      startTime: new Date('2025-01-01T16:00:00+07:00'),
      endTime: new Date('2025-01-01T17:30:00+07:00'),
      type: 'JAM',
      spaceId: spaces.stage.id,
      published: true
    },
    {
      title: 'Magic Show',
      slug: 'magic-show-jan-1',
      startTime: new Date('2025-01-01T19:15:00+07:00'),
      endTime: new Date('2025-01-01T20:30:00+07:00'),
      type: 'SHOW',
      spaceId: spaces.dome.id,
      published: true
    },
    {
      title: 'Fire Jam',
      slug: 'fire-jam-jan-1',
      startTime: new Date('2025-01-01T20:30:00+07:00'),
      endTime: new Date('2025-01-01T22:00:00+07:00'),
      type: 'JAM',
      spaceId: spaces.stage.id,
      published: true
    },
    // Thursday Jan 2
    {
      title: 'Ritual Ecstatic Dance',
      slug: 'ritual-ecstatic-dance-jan-2',
      startTime: new Date('2025-01-02T11:00:00+07:00'),
      endTime: new Date('2025-01-02T15:00:00+07:00'),
      type: 'DANCE_EVENT',
      spaceId: spaces.saunaArea.id,
      published: true
    },
    {
      title: 'Pole Class',
      slug: 'pole-class-jan-2',
      startTime: new Date('2025-01-02T11:00:00+07:00'),
      endTime: new Date('2025-01-02T12:30:00+07:00'),
      type: 'MEMBERSHIP_TRAINING',
      spaceId: spaces.poleStudio.id,
      published: true
    },
    {
      title: 'Acrodance Class',
      slug: 'acrodance-jan-2',
      startTime: new Date('2025-01-02T16:00:00+07:00'),
      endTime: new Date('2025-01-02T17:30:00+07:00'),
      type: 'MEMBERSHIP_TRAINING',
      spaceId: spaces.dome.id,
      published: true
    },
    // Friday Jan 3
    {
      title: 'Kidscape',
      slug: 'kidscape-jan-3',
      startTime: new Date('2025-01-03T17:00:00+07:00'),
      endTime: new Date('2025-01-03T19:00:00+07:00'),
      type: 'OTHER',
      spaceId: spaces.dome.id,
      published: true
    },
    {
      title: 'Sunset Open Mic',
      slug: 'sunset-open-mic-jan-3',
      startTime: new Date('2025-01-03T17:45:00+07:00'),
      endTime: new Date('2025-01-03T20:45:00+07:00'),
      type: 'SHOW',
      spaceId: spaces.shala.id,
      published: true
    },
    {
      title: 'Movie Night',
      slug: 'movie-night-jan-3',
      startTime: new Date('2025-01-03T19:00:00+07:00'),
      endTime: new Date('2025-01-03T21:00:00+07:00'),
      type: 'SHOW',
      spaceId: spaces.dome.id,
      published: true
    },
    // Saturday Jan 4
    {
      title: 'To-Gather Event',
      slug: 'to-gather-jan-4',
      startTime: new Date('2025-01-04T12:00:00+07:00'),
      endTime: new Date('2025-01-04T22:00:00+07:00'),
      type: 'OTHER',
      spaceId: spaces.dome.id,
      published: true
    },
    {
      title: 'Ecstatic Dreams – Ecstatic Dance',
      slug: 'ecstatic-dreams-jan-4',
      startTime: new Date('2025-01-04T17:30:00+07:00'),
      endTime: new Date('2025-01-04T22:00:00+07:00'),
      type: 'DANCE_EVENT',
      spaceId: spaces.stage.id,
      published: true
    },
    // Sunday Jan 5
    {
      title: 'Closed',
      slug: 'closed-jan-5',
      startTime: new Date('2025-01-05T00:00:00+07:00'),
      endTime: new Date('2025-01-05T23:59:00+07:00'),
      type: 'OTHER',
      spaceId: spaces.dome.id,
      published: true
    }
  ]

  // Insert events
  for (const eventData of events) {
    const { spaceId, ...eventFields } = eventData
    const event = await prisma.event.create({
      data: {
        ...eventFields,
        spaces: {
          create: {
            spaceId: spaceId
          }
        }
      }
    })
    console.log(`Created event: ${event.title}`)
  }

  console.log('All events created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
