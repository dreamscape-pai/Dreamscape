const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSpaces() {
  try {
    const spaces = await prisma.space.findMany({
      orderBy: { name: 'asc' }
    });

    console.log('Existing spaces:');
    spaces.forEach(space => {
      console.log(`- ${space.name} (slug: ${space.slug}, id: ${space.id})`);
    });

    if (spaces.length === 0) {
      console.log('No spaces found. Creating default spaces...');

      const defaultSpaces = [
        { name: 'Dome', slug: 'dome', description: 'Main dome space' },
        { name: 'Cafe', slug: 'cafe', description: 'Cafe area' },
        { name: 'Stage', slug: 'stage', description: 'Performance stage' },
        { name: 'Pole Studio', slug: 'pole-studio', description: 'Pole dance studio' },
        { name: 'Sauna Lounge', slug: 'sauna-lounge', description: 'Sauna and lounge area' }
      ];

      for (const space of defaultSpaces) {
        const created = await prisma.space.create({
          data: { ...space, published: true }
        });
        console.log(`Created space: ${created.name}`);
      }
    }

    // Check EventSpace relationships
    const eventSpaces = await prisma.eventSpace.count();
    console.log(`\nTotal event-space relationships: ${eventSpaces}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpaces();