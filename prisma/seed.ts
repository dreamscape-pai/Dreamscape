import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create spaces based on docs/02-spaces-and-equipment.md
  const spaces = await Promise.all([
    prisma.space.create({
      data: {
        name: 'The Aerial Shala',
        slug: 'aerial-shala',
        description: 'Our main aerial training space equipped with silks, lyra, trapeze, rope, and straps',
        capacity: 20,
        published: true,
        images: [],
      },
    }),
    prisma.space.create({
      data: {
        name: 'The Dance Studio',
        slug: 'dance-studio',
        description: 'Spacious dance studio with mirrors, ballet bar, and sound system',
        capacity: 30,
        published: true,
        images: [],
      },
    }),
    prisma.space.create({
      data: {
        name: 'The Dome',
        slug: 'dome',
        description: 'Unique dome space perfect for workshops, installations, and intimate gatherings',
        capacity: 25,
        published: true,
        images: [],
      },
    }),
    prisma.space.create({
      data: {
        name: 'The Amphitheater',
        slug: 'amphitheater',
        description: 'Outdoor amphitheater for shows, performances, and large events',
        capacity: 100,
        published: true,
        images: [],
      },
    }),
    prisma.space.create({
      data: {
        name: 'The Bamboo Circle',
        slug: 'bamboo-circle',
        description: 'Open-air bamboo circle space for gatherings and ceremonies',
        capacity: 40,
        published: true,
        images: [],
      },
    }),
    prisma.space.create({
      data: {
        name: 'The Cafe',
        slug: 'cafe',
        description: 'Vegan cafe with epic sunset views serving fresh juices, smoothies, and wholesome food',
        capacity: 30,
        published: true,
        images: [],
      },
    }),
    prisma.space.create({
      data: {
        name: 'Sauna Lounge',
        slug: 'sauna-lounge',
        description: 'Backyard sauna area with big sauna, little sauna, ice baths, and hot pools',
        capacity: 15,
        published: true,
        images: [],
      },
    }),
    prisma.space.create({
      data: {
        name: 'The Micro Gym',
        slug: 'micro-gym',
        description: 'Compact gym space with essential equipment for strength training',
        capacity: 10,
        published: true,
        images: [],
      },
    }),
    prisma.space.create({
      data: {
        name: 'The Stretch Tent',
        slug: 'stretch-tent',
        description: 'Flexible covered space for workshops and events',
        capacity: 50,
        published: true,
        images: [],
      },
    }),
    prisma.space.create({
      data: {
        name: 'Bamboo Shala',
        slug: 'bamboo-shala',
        description: 'Traditional bamboo shala for yoga and meditation',
        capacity: 20,
        published: true,
        images: [],
      },
    }),
  ])

  console.log(`Created ${spaces.length} spaces`)

  // Create sample events for the coming week
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const events = await Promise.all([
    // Monday - Aerial Basics Workshop
    prisma.event.create({
      data: {
        title: 'Aerial Silks Basics',
        slug: 'aerial-silks-basics-mon',
        description: 'Introduction to aerial silks for beginners. Learn fundamental climbing techniques and basic moves.',
        startTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Mon 10am
        endTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 11.5 * 60 * 60 * 1000), // Mon 11:30am
        type: 'WORKSHOP',
        published: true,
        capacity: 12,
        spaceId: spaces[0].id, // Aerial Shala
      },
    }),
    // Monday - Yoga
    prisma.event.create({
      data: {
        title: 'Morning Vinyasa Flow',
        slug: 'vinyasa-flow-mon',
        description: 'Start your week with an energizing vinyasa yoga flow',
        startTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // Mon 8am
        endTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // Mon 9am
        type: 'OTHER',
        published: true,
        capacity: 20,
        spaceId: spaces[9].id, // Bamboo Shala
      },
    }),
    // Tuesday - Circus Jam
    prisma.event.create({
      data: {
        title: 'Circus Training Jam',
        slug: 'circus-jam-tue',
        description: 'Open training session for all levels. Come practice on our equipment!',
        startTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // Tue 3pm
        endTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // Tue 6pm
        type: 'JAM',
        published: true,
        capacity: 25,
        spaceId: spaces[0].id, // Aerial Shala
      },
    }),
    // Wednesday - Cyr Wheel Workshop
    prisma.event.create({
      data: {
        title: 'Cyr Wheel Introduction',
        slug: 'cyr-wheel-intro-wed',
        description: 'Learn the basics of cyr wheel in this beginner-friendly workshop',
        startTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // Wed 2pm
        endTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // Wed 4pm
        type: 'WORKSHOP',
        published: true,
        capacity: 8,
        spaceId: spaces[4].id, // Bamboo Circle
      },
    }),
    // Thursday - Dance Party
    prisma.event.create({
      data: {
        title: 'Ecstatic Dance Night',
        slug: 'ecstatic-dance-thu',
        description: 'Free your body and soul in this guided ecstatic dance journey',
        startTime: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // Thu 7pm
        endTime: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000), // Thu 10pm
        type: 'OTHER',
        published: true,
        capacity: 50,
        spaceId: spaces[1].id, // Dance Studio
      },
    }),
    // Friday - Circus Show
    prisma.event.create({
      data: {
        title: 'Friday Night Circus Show',
        slug: 'circus-show-fri',
        description: 'An evening of aerial performances, acrobatics, and wonder',
        startTime: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000), // Fri 8pm
        endTime: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000), // Fri 10pm
        type: 'SHOW',
        published: true,
        capacity: 100,
        spaceId: spaces[3].id, // Amphitheater
      },
    }),
    // Saturday - Handstand Workshop
    prisma.event.create({
      data: {
        title: 'Handstand Fundamentals',
        slug: 'handstand-fundamentals-sat',
        description: 'Build strength and technique for solid handstands',
        startTime: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Sat 10am
        endTime: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), // Sat 12pm
        type: 'WORKSHOP',
        published: true,
        capacity: 15,
        spaceId: spaces[7].id, // Micro Gym
      },
    }),
    // Sunday - Community Brunch
    prisma.event.create({
      data: {
        title: 'Sunday Community Brunch',
        slug: 'community-brunch-sun',
        description: 'Join us for a delicious vegan brunch and community connection',
        startTime: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // Sun 11am
        endTime: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // Sun 2pm
        type: 'OTHER',
        published: true,
        capacity: 40,
        spaceId: spaces[5].id, // Cafe
      },
    }),
  ])

  console.log(`Created ${events.length} events`)

  // Create a sample membership plan
  const membershipPlan = await prisma.membershipPlan.create({
    data: {
      name: 'Monthly Membership',
      description: 'Full access to all equipment during open hours, discounts on workshops and events',
      price: 15000, // $150/month in cents
      interval: 'month',
      active: true,
    },
  })

  console.log('Created membership plan')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
