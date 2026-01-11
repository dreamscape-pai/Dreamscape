const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicates() {
  try {
    console.log('Checking for duplicate events...\n');

    // Get total event count
    const totalCount = await prisma.event.count();
    console.log(`Total events in database: ${totalCount}`);

    // Check for events with the same Google Event ID
    const eventsWithGoogleId = await prisma.event.findMany({
      where: {
        googleEventId: { not: null }
      },
      select: {
        id: true,
        title: true,
        googleEventId: true,
        googleCalendarId: true,
        startTime: true
      },
      orderBy: [
        { googleEventId: 'asc' },
        { startTime: 'asc' }
      ]
    });

    console.log(`\nEvents with Google IDs: ${eventsWithGoogleId.length}`);

    // Group by googleEventId to find duplicates
    const groupedEvents = {};
    eventsWithGoogleId.forEach(event => {
      const key = `${event.googleEventId}-${event.googleCalendarId}`;
      if (!groupedEvents[key]) {
        groupedEvents[key] = [];
      }
      groupedEvents[key].push(event);
    });

    // Find duplicates
    const duplicates = Object.entries(groupedEvents).filter(([_, events]) => events.length > 1);

    if (duplicates.length > 0) {
      console.log(`\n=== FOUND ${duplicates.length} SETS OF DUPLICATES ===\n`);

      let totalDuplicates = 0;
      duplicates.slice(0, 10).forEach(([key, events]) => {
        console.log(`Google ID: ${events[0].googleEventId}`);
        console.log(`Calendar ID: ${events[0].googleCalendarId}`);
        console.log(`Duplicates: ${events.length} copies`);
        events.forEach(event => {
          console.log(`  - ID: ${event.id}, Title: "${event.title}", Time: ${event.startTime.toISOString()}`);
        });
        console.log('');
        totalDuplicates += events.length - 1; // Count extra copies
      });

      const totalExtraCopies = duplicates.reduce((sum, [_, events]) => sum + (events.length - 1), 0);
      console.log(`Total duplicate events that should be removed: ${totalExtraCopies}`);
      console.log(`Events after cleanup would be: ${totalCount - totalExtraCopies}`);

    } else {
      console.log('\nNo duplicates found based on Google Event ID!');
    }

    // Check for events without Google IDs (manually created)
    const eventsWithoutGoogleId = await prisma.event.count({
      where: {
        googleEventId: null
      }
    });

    console.log(`\nEvents without Google IDs (manually created): ${eventsWithoutGoogleId}`);

    // Check for potential title duplicates on the same day
    const allEvents = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        startTime: true,
        googleEventId: true
      },
      orderBy: [
        { title: 'asc' },
        { startTime: 'asc' }
      ]
    });

    const titleDuplicates = {};
    allEvents.forEach(event => {
      const dateKey = event.startTime.toISOString().split('T')[0];
      const key = `${event.title.toLowerCase().trim()}-${dateKey}`;
      if (!titleDuplicates[key]) {
        titleDuplicates[key] = [];
      }
      titleDuplicates[key].push(event);
    });

    const sameTitleSameDay = Object.entries(titleDuplicates).filter(([_, events]) => events.length > 1);
    if (sameTitleSameDay.length > 0) {
      console.log(`\n=== Events with same title on same day: ${sameTitleSameDay.length} sets ===`);
      console.log('(Showing first 5 examples)');
      sameTitleSameDay.slice(0, 5).forEach(([key, events]) => {
        console.log(`\n"${events[0].title}" on ${events[0].startTime.toISOString().split('T')[0]}:`);
        events.forEach(event => {
          console.log(`  - ID: ${event.id}, Google ID: ${event.googleEventId || 'none'}`);
        });
      });
    }

  } catch (error) {
    console.error('Error checking duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();