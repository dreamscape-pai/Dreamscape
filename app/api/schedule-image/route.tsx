import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { startOfWeek, endOfWeek, format, eachDayOfInterval, isSameDay } from 'date-fns'
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get('weekStart')
      ? new Date(searchParams.get('weekStart')!)
      : new Date()

    const start = startOfWeek(weekStart, { weekStartsOn: 1 })
    const end = endOfWeek(weekStart, { weekStartsOn: 1 })

    const events = await db.event.findMany({
      where: {
        published: true,
        startTime: {
          gte: start,
          lte: end,
        },
      },
      include: {
        spaces: {
          include: {
            space: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    const weekDays = eachDayOfInterval({ start, end })

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '30px',
            }}
          >
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#1f2937',
              }}
            >
              Dreamscape Weekly Schedule
            </h1>
            <p style={{ fontSize: '24px', color: '#6b7280' }}>
              {format(start, 'MMM d')} - {format(end, 'MMM d, yyyy')}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              width: '100%',
            }}
          >
            {weekDays.map((day) => {
              const dayEvents = events.filter((event) =>
                isSameDay(new Date(event.startTime), day)
              )

              return (
                <div
                  key={day.toString()}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      marginBottom: '12px',
                      color: '#1f2937',
                    }}
                  >
                    {format(day, 'EEE d')}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: '#dbeafe',
                          borderLeft: '3px solid #3b82f6',
                          padding: '8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ fontWeight: 600, color: '#1e40af' }}>
                          {event.title}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '11px' }}>
                          {format(new Date(event.startTime), 'h:mm a')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 'auto',
              paddingTop: '30px',
              fontSize: '16px',
              color: '#6b7280',
            }}
          >
            Technology + Circus + Wellness | Pai, Northern Thailand
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating schedule image:', error)
    return NextResponse.json({ error: 'Failed to generate schedule image' }, { status: 500 })
  }
}
