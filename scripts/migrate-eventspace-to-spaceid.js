const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateEventSpaces() {
  try {
    console.log('Starting migration from EventSpace to Event.spaceId...');

    // Get all EventSpace relationships
    const eventSpaces = await prisma.eventSpace.findMany({
      include: {
        event: true,
        space: true
      }
    });

    console.log(`Found ${eventSpaces.length} event-space relationships to migrate`);

    let migrated = 0;
    let skipped = 0;

    for (const es of eventSpaces) {
      // If event already has a spaceId, skip
      if (es.event.spaceId) {
        console.log(`Event "${es.event.title}" already has spaceId, skipping...`);
        skipped++;
        continue;
      }

      // Update event with the spaceId
      await prisma.event.update({
        where: { id: es.eventId },
        data: { spaceId: es.spaceId }
      });

      console.log(`✓ Migrated event "${es.event.title}" to space "${es.space.name}"`);
      migrated++;
    }

    console.log(`\nMigration complete!`);
    console.log(`- Migrated: ${migrated} events`);
    console.log(`- Skipped: ${skipped} events (already had spaceId)`);

    // Verify migration
    const eventsWithSpace = await prisma.event.count({
      where: { spaceId: { not: null } }
    });

    console.log(`\nTotal events with spaceId: ${eventsWithSpace}`);

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateEventSpaces();