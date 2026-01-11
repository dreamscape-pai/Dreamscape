const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSpaceColors() {
  try {
    // Define colors matching your Google Calendar colors
    const spaceColors = [
      { slug: 'dome', color: 'blue' },        // Blue on Google Calendar
      { slug: 'cafe', color: 'purple' },      // Purple on Google Calendar
      { slug: 'stage', color: 'green' },      // Green on Google Calendar
      { slug: 'pole-studio', color: 'yellow' }, // Yellow on Google Calendar
      { slug: 'sauna-lounge', color: 'orange' }, // Orange on Google Calendar
      { slug: 'sauna', color: 'orange' },     // Also orange
      { slug: 'sauna-area', color: 'orange' }, // Also orange
      { slug: 'shala', color: 'indigo' }      // Default to indigo
    ];

    for (const { slug, color } of spaceColors) {
      const updated = await prisma.space.updateMany({
        where: { slug },
        data: { color }
      });

      if (updated.count > 0) {
        console.log(`✓ Updated ${slug} with color: ${color}`);
      }
    }

    // Verify the updates
    const spaces = await prisma.space.findMany({
      orderBy: { name: 'asc' }
    });

    console.log('\nAll spaces with colors:');
    spaces.forEach(space => {
      console.log(`- ${space.name}: ${space.color || 'no color'}`);
    });

  } catch (error) {
    console.error('Error updating space colors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSpaceColors();