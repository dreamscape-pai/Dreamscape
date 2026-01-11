const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeEvents() {
  try {
    console.log('Analyzing events in detail...\n');

    // Get events grouped by date range
    const now = new Date();
    const pastEvents = await prisma.event.count({
      where: { startTime: { lt: now } }
    });
    const futureEvents = await prisma.event.count({
      where: { startTime: { gte: now } }
    });

    console.log('=== TIME DISTRIBUTION ===');
    console.log(`Past events: ${pastEvents}`);
    console.log(`Future events: ${futureEvents}`);

    // Analyze by month
    const events = await prisma.event.findMany({
      select: {
        title: true,
        startTime: true,
        googleEventId: true
      },
      orderBy: { startTime: 'asc' }
    });

    const monthCounts = {};
    events.forEach(event => {
      const monthKey = event.startTime.toISOString().substring(0, 7); // YYYY-MM
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });

    console.log('\n=== EVENTS BY MONTH ===');
    Object.entries(monthCounts).forEach(([month, count]) => {
      console.log(`${month}: ${count} events`);
    });

    // Find recurring patterns
    const titlePatterns = {};
    events.forEach(event => {
      const baseTitle = event.title
        .replace(/\s*-\s*DOME\s*$/i, '')
        .replace(/\s*-\s*.*$/i, '')
        .trim()
        .toLowerCase();

      if (!titlePatterns[baseTitle]) {
        titlePatterns[baseTitle] = [];
      }
      titlePatterns[baseTitle].push({
        title: event.title,
        date: event.startTime.toISOString().split('T')[0],
        googleId: event.googleEventId
      });
    });

    // Find events that appear to be recurring
    const recurringEvents = Object.entries(titlePatterns)
      .filter(([_, instances]) => instances.length > 3)
      .sort((a, b) => b[1].length - a[1].length);

    console.log('\n=== RECURRING EVENT PATTERNS ===');
    console.log('(Events with similar titles appearing multiple times)');
    recurringEvents.slice(0, 10).forEach(([baseTitle, instances]) => {
      console.log(`\n"${instances[0].title}" appears ${instances.length} times:`);
      console.log(`  First: ${instances[0].date}`);
      console.log(`  Last: ${instances[instances.length - 1].date}`);
    });

    // Check for Google Calendar sources
    const calendarSources = await prisma.event.groupBy({
      by: ['googleCalendarId'],
      _count: true,
      where: {
        googleCalendarId: { not: null }
      }
    });

    console.log('\n=== GOOGLE CALENDAR SOURCES ===');
    calendarSources.forEach(source => {
      console.log(`Calendar "${source.googleCalendarId}": ${source._count} events`);
    });

  } catch (error) {
    console.error('Error analyzing events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeEvents();