const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyEventColors() {
  try {
    console.log('Verifying event colors are correctly assigned...\n');

    // Get a sample of events with their spaces
    const events = await prisma.event.findMany({
      where: {
        published: true,
        spaceId: { not: null }
      },
      include: {
        space: true
      },
      orderBy: { startTime: 'asc' },
      take: 10
    });

    console.log('=== SAMPLE EVENTS WITH COLORS ===\n');

    events.forEach(event => {
      console.log(`Event: ${event.title}`);
      console.log(`  Space: ${event.space.name}`);
      console.log(`  Space Color: ${event.space.color}`);
      console.log(`  Google Color ID: ${event.googleColorId || 'none'}`);
      console.log('');
    });

    // Count events by space color
    const spaceColorCounts = {};

    const allEventsWithSpace = await prisma.event.findMany({
      where: {
        spaceId: { not: null }
      },
      include: {
        space: true
      }
    });

    allEventsWithSpace.forEach(event => {
      const color = event.space.color || 'no-color';
      spaceColorCounts[color] = (spaceColorCounts[color] || 0) + 1;
    });

    console.log('=== EVENT COUNT BY SPACE COLOR ===\n');
    for (const [color, count] of Object.entries(spaceColorCounts)) {
      console.log(`${color}: ${count} events`);
    }

    // Check if any events still don't have spaces
    const eventsWithoutSpace = await prisma.event.count({
      where: { spaceId: null }
    });

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total events with spaces: ${allEventsWithSpace.length}`);
    console.log(`Events without spaces: ${eventsWithoutSpace}`);

  } catch (error) {
    console.error('Error verifying event colors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyEventColors();