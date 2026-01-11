const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEventSpaces() {
  try {
    console.log('Checking event space assignments and colors...\n');

    // Check spaces and their colors
    const spaces = await prisma.space.findMany({
      orderBy: { name: 'asc' }
    });

    console.log('=== SPACES AND COLORS ===');
    spaces.forEach(space => {
      console.log(`${space.name} (${space.slug}): color = ${space.color || 'NO COLOR'}`);
    });

    // Check events with spaces
    const events = await prisma.event.findMany({
      where: {
        googleEventId: { not: null }
      },
      include: {
        space: true
      },
      orderBy: { startTime: 'asc' },
      take: 20 // Just check first 20 events
    });

    console.log('\n=== EVENTS AND THEIR SPACES (first 20) ===');
    events.forEach(event => {
      const spaceName = event.space ? event.space.name : 'NO SPACE';
      const spaceColor = event.space ? event.space.color : 'NO COLOR';
      const googleColor = event.googleColorId || 'NO GOOGLE COLOR';

      console.log(`${event.title}:`);
      console.log(`  Space: ${spaceName}`);
      console.log(`  Space Color: ${spaceColor}`);
      console.log(`  Google Color ID: ${googleColor}`);
      console.log('---');
    });

    // Count events by space
    const eventCounts = await prisma.event.groupBy({
      by: ['spaceId'],
      _count: true,
      where: {
        googleEventId: { not: null }
      }
    });

    console.log('\n=== EVENT COUNTS BY SPACE ===');
    for (const count of eventCounts) {
      if (count.spaceId) {
        const space = await prisma.space.findUnique({
          where: { id: count.spaceId }
        });
        console.log(`${space.name}: ${count._count} events`);
      } else {
        console.log(`No space assigned: ${count._count} events`);
      }
    }

    // Check if any events have no space
    const eventsWithoutSpace = await prisma.event.count({
      where: {
        googleEventId: { not: null },
        spaceId: null
      }
    });
    console.log(`\nEvents without space: ${eventsWithoutSpace}`);

  } catch (error) {
    console.error('Error checking event spaces:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEventSpaces();