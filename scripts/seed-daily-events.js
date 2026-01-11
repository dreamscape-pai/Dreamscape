const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDailyEvents() {
  try {
    console.log('Seeding daily events...\n');

    // Clear existing daily events
    await prisma.dailyEvent.deleteMany();
    console.log('Cleared existing daily events');

    // Get spaces (if we want to link them)
    const spaces = await prisma.space.findMany();
    const cafeSpace = spaces.find(s => s.slug === 'cafe');
    const saunaSpace = spaces.find(s => s.slug === 'sauna-lounge');

    // Days of week: Monday (1) through Saturday (6)
    const weekdays = [1, 2, 3, 4, 5, 6];

    // Create daily events
    const dailyEvents = [
      {
        title: 'Vegan Cafe',
        startTime: '12:00',
        endTime: '20:00',
        daysOfWeek: weekdays,
        spaceId: cafeSpace?.id || null,
        published: true
      },
      {
        title: 'Sauna + Cold Plunge + Hot Pools',
        startTime: '14:00',
        endTime: '20:00',
        daysOfWeek: weekdays,
        spaceId: saunaSpace?.id || null,
        published: true
      },
      {
        title: 'Ice Bath',
        startTime: '15:00',
        endTime: '16:00',
        daysOfWeek: weekdays,
        spaceId: saunaSpace?.id || null,
        published: true
      }
    ];

    // Create daily events
    for (const eventData of dailyEvents) {
      const created = await prisma.dailyEvent.create({
        data: eventData
      });
      console.log(`✓ Created daily event: ${created.title} (${created.startTime} - ${created.endTime})`);
    }

    // Display summary
    const finalCount = await prisma.dailyEvent.count();
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total daily events created: ${finalCount}`);

  } catch (error) {
    console.error('Error seeding daily events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDailyEvents();