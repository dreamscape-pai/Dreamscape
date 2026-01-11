const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function classifyEventType(title) {
  const lowerTitle = title.toLowerCase();

  // Priority order matters - check most specific first
  if (lowerTitle.includes('members')) {
    return 'MEMBERSHIP_TRAINING';  // Using existing enum for members-only events
  }

  if (lowerTitle.includes('jam')) {
    return 'JAM';
  }

  if (lowerTitle.includes('show')) {
    return 'SHOW';
  }

  // Check for event keywords
  const eventKeywords = ['movie', 'bass ship', 'bassship', 'event', 'sauna and sound', 'sauna & sound'];

  // Special case for ecstatic dance or similar
  if (lowerTitle.includes('ecstatic')) {
    return 'DANCE_EVENT';
  }

  if (eventKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return 'OTHER'; // Using OTHER for general events
  }

  // Default to workshop for everything else
  return 'WORKSHOP';
}

async function classifyAllEvents() {
  try {
    console.log('Starting event type classification...\n');

    // Get all events
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        type: true
      },
      orderBy: { title: 'asc' }
    });

    console.log(`Found ${events.length} events to classify\n`);

    // Track changes by type
    const typeChanges = {
      'MEMBERSHIP_TRAINING': [],
      'JAM': [],
      'SHOW': [],
      'DANCE_EVENT': [],
      'WORKSHOP': [],
      'OTHER': []
    };

    // Classify each event
    for (const event of events) {
      const newType = classifyEventType(event.title);

      if (event.type !== newType) {
        await prisma.event.update({
          where: { id: event.id },
          data: { type: newType }
        });

        if (typeChanges[newType]) {
          typeChanges[newType].push(event.title);
        }

        console.log(`✓ "${event.title}" → ${newType}`);
      }
    }

    // Print summary
    console.log('\n=== CLASSIFICATION SUMMARY ===');
    for (const [type, titles] of Object.entries(typeChanges)) {
      if (titles.length > 0) {
        console.log(`\n${type}: ${titles.length} events`);
        if (titles.length <= 5) {
          titles.forEach(title => console.log(`  - ${title}`));
        } else {
          titles.slice(0, 5).forEach(title => console.log(`  - ${title}`));
          console.log(`  ... and ${titles.length - 5} more`);
        }
      }
    }

    // Verify final counts
    const finalCounts = await prisma.event.groupBy({
      by: ['type'],
      _count: true,
      orderBy: { _count: { type: 'desc' } }
    });

    console.log('\n=== FINAL EVENT TYPE DISTRIBUTION ===');
    finalCounts.forEach(({ type, _count }) => {
      console.log(`${type}: ${_count} events`);
    });

  } catch (error) {
    console.error('Error classifying events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

classifyAllEvents();