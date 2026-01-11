const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testDailyEvents() {
  try {
    // Create some test daily events
    console.log('Creating test daily events...')

    // Create a daily event that shows in calendar (default)
    const inCalendarEvent = await prisma.dailyEvent.upsert({
      where: { id: 999991 },
      update: {},
      create: {
        id: 999991,
        title: 'Morning Yoga',
        startTime: '08:00',
        endTime: '09:00',
        daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
        spaceId: 1, // Assuming Dome exists
        published: true,
        showInCalendar: true // This should appear in the calendar grid
      }
    })
    console.log('Created in-calendar event:', inCalendarEvent.title)

    // Create a daily event that does NOT show in calendar
    const aboveCalendarEvent = await prisma.dailyEvent.upsert({
      where: { id: 999992 },
      update: {},
      create: {
        id: 999992,
        title: 'Cafe Open Hours',
        startTime: '07:00',
        endTime: '22:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
        spaceId: 2, // Assuming Cafe exists
        published: true,
        showInCalendar: false // This should appear above the calendar
      }
    })
    console.log('Created above-calendar event:', aboveCalendarEvent.title)

    // Create another above-calendar event with non-continuous days
    const nonContinuousEvent = await prisma.dailyEvent.upsert({
      where: { id: 999993 },
      update: {},
      create: {
        id: 999993,
        title: 'Sauna Sessions',
        startTime: '18:00',
        endTime: '21:00',
        daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
        spaceId: 5, // Assuming Sauna exists
        published: true,
        showInCalendar: false // This should appear above the calendar
      }
    })
    console.log('Created non-continuous event:', nonContinuousEvent.title)

    // List all daily events
    console.log('\n--- All Daily Events ---')
    const allDailyEvents = await prisma.dailyEvent.findMany({
      include: { space: true }
    })

    allDailyEvents.forEach(event => {
      const days = event.daysOfWeek.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')
      console.log(`${event.title}: ${event.startTime}-${event.endTime} on ${days} @${event.space?.name || 'Unknown'} (showInCalendar: ${event.showInCalendar})`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDailyEvents()