const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Same mapping as in the sync route
const COLOR_TO_SPACE_SLUG = {
  '9': 'dome',        // Blue
  '3': 'cafe',        // Purple
  '10': 'stage',      // Green
  '11': 'stage',      // Red (also stage, as backup)
  '5': 'pole-studio', // Yellow
  '6': 'sauna-lounge', // Orange
  '4': 'sauna-lounge', // Flamingo/Pink (also sauna lounge)
  '7': 'stage',       // Peacock/Teal (default to stage)
  '8': 'dome',        // Gray (default to dome)
  '1': 'dome',        // Lavender (default to dome)
  '2': 'cafe',        // Sage (default to cafe)
};

async function fixEventSpacesBatch() {
  try {
    console.log('Starting batch fix for event space assignments...\n');

    // Get all spaces for mapping
    const spaces = await prisma.space.findMany({
      select: { id: true, slug: true, name: true }
    });

    const spaceMap = new Map(spaces.map(s => [s.slug, s]));

    // Get all events with Google Color ID but no space
    const eventsToFix = await prisma.event.findMany({
      where: {
        googleColorId: { not: null },
        spaceId: null
      }
    });

    console.log(`Found ${eventsToFix.length} events to fix\n`);

    // Group events by their target space
    const eventsBySpace = {};
    let skipped = 0;

    for (const event of eventsToFix) {
      const spaceSlug = COLOR_TO_SPACE_SLUG[event.googleColorId];

      if (!spaceSlug) {
        console.log(`⚠️  No space mapping for color ${event.googleColorId} (${event.title})`);
        skipped++;
        continue;
      }

      const space = spaceMap.get(spaceSlug);

      if (!space) {
        console.log(`⚠️  Space not found: ${spaceSlug} for event ${event.title}`);
        skipped++;
        continue;
      }

      if (!eventsBySpace[space.id]) {
        eventsBySpace[space.id] = {
          space,
          eventIds: []
        };
      }

      eventsBySpace[space.id].eventIds.push(event.id);
    }

    // Perform batch updates for each space
    let totalFixed = 0;
    for (const spaceId in eventsBySpace) {
      const { space, eventIds } = eventsBySpace[spaceId];

      console.log(`Updating ${eventIds.length} events for ${space.name}...`);

      const result = await prisma.event.updateMany({
        where: {
          id: { in: eventIds }
        },
        data: {
          spaceId: parseInt(spaceId)
        }
      });

      console.log(`✓ Fixed ${result.count} events → ${space.name}`);
      totalFixed += result.count;
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Fixed: ${totalFixed} events`);
    console.log(`Skipped: ${skipped} events`);

    // Verify the fix
    const stillBroken = await prisma.event.count({
      where: {
        googleColorId: { not: null },
        spaceId: null
      }
    });

    const nowFixed = await prisma.event.count({
      where: {
        googleColorId: { not: null },
        spaceId: { not: null }
      }
    });

    console.log(`\nEvents with Google Color and space: ${nowFixed}`);
    console.log(`Events with Google Color but no space: ${stillBroken}`);

  } catch (error) {
    console.error('Error fixing event spaces:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEventSpacesBatch();