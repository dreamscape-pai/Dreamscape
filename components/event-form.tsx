'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Event, Space, EventDisplayStyle } from '@prisma/client'

type EventWithDetails = Event & {
  space?: Space | null
}

type EventFormProps = {
  event?: EventWithDetails
  spaces: Space[]
}

const EVENT_TYPES = ['CLOSED', 'WORKSHOP', 'SHOW', 'JAM', 'EVENT', 'RETREAT', 'FESTIVAL', 'MEMBERSHIP_TRAINING', 'OTHER']

export function EventForm({ event, spaces }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(
    event?.spaceId?.toString() || ''
  )
  const [isAllDay, setIsAllDay] = useState(event?.isAllDay || false)
  const [isRecurring, setIsRecurring] = useState(event?.isRecurring || false)
  const [recurringDays, setRecurringDays] = useState<number[]>(event?.recurringDays || [])
  const [displayStyle, setDisplayStyle] = useState<EventDisplayStyle>(
    event?.displayStyle || 'NORMAL'
  )
  const [overridesOthers, setOverridesOthers] = useState(event?.overridesOthers || false)
  const [eventType, setEventType] = useState(event?.type || 'OTHER')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Only require space if not a CLOSED event
    if (!selectedSpaceId && eventType !== 'CLOSED') {
      setError('Please select a space')
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)

    // For all-day events, set times to start and end of day
    let startTime = formData.get('startTime') as string
    let endTime = formData.get('endTime') as string

    if (isAllDay) {
      const date = formData.get('eventDate') as string
      if (date) {
        startTime = `${date}T00:00`
        endTime = `${date}T23:59`
      }
    }

    const data = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      startTime,
      endTime,
      type: eventType,
      capacity: formData.get('capacity'),
      published: formData.get('published') === 'on',
      isAllDay,
      isRecurring,
      recurringDays,
      displayStyle,
      overridesOthers,
      spaceId: selectedSpaceId ? parseInt(selectedSpaceId) : null,
    }

    try {
      const url = event ? `/api/events/${event.id}` : '/api/events'
      const method = event ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save event')
      }

      router.push('/admin/events')
      router.refresh()
    } catch (err) {
      setError('Failed to save event. Please try again.')
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!event) return
    if (!confirm('Are you sure you want to delete this event?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      router.push('/admin/events')
      router.refresh()
    } catch (err) {
      setError('Failed to delete event. Please try again.')
      setLoading(false)
    }
  }

  // Format datetime for input field
  const formatDateTimeLocal = (date: Date | string) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-bold text-white">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          defaultValue={event?.title}
          onChange={(e) => {
            // Auto-generate slug for new events
            if (!event) {
              const slugField = document.getElementById('slug') as HTMLInputElement
              if (slugField) {
                slugField.value = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)/g, '')
              }
            }
          }}
          className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
        />
      </div>

      {/* Hidden slug field - auto-generated */}
      <input
        type="hidden"
        name="slug"
        id="slug"
        defaultValue={event?.slug || ''}
      />

      <div>
        <label htmlFor="description" className="block text-sm font-bold text-white">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          defaultValue={event?.description || ''}
          className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
        />
      </div>

      {/* Special Event Options */}
      <div className="space-y-3 p-4 bg-white/5 rounded-lg">
        <h3 className="text-sm font-bold text-white mb-2">Special Options</h3>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isAllDay"
            checked={isAllDay}
            onChange={(e) => setIsAllDay(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-white/10"
          />
          <label htmlFor="isAllDay" className="ml-2 block text-sm text-white">
            All-day event (e.g., CLOSED days)
          </label>
        </div>

        {eventType === 'CLOSED' && (
          <>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="verticalDisplay"
                checked={displayStyle === 'VERTICAL'}
                onChange={(e) => setDisplayStyle(e.target.checked ? 'VERTICAL' : 'NORMAL')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-white/10"
              />
              <label htmlFor="verticalDisplay" className="ml-2 block text-sm text-white">
                Display text vertically (C-L-O-S-E-D style)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="overridesOthers"
                checked={overridesOthers}
                onChange={(e) => setOverridesOthers(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-white/10"
              />
              <label htmlFor="overridesOthers" className="ml-2 block text-sm text-white">
                Hide other events on this day
              </label>
            </div>
          </>
        )}
      </div>

      {/* Date/Time Fields */}
      {isAllDay ? (
        <div>
          <label htmlFor="eventDate" className="block text-sm font-bold text-white">
            Date
          </label>
          <input
            type="date"
            name="eventDate"
            id="eventDate"
            required
            defaultValue={event ? formatDateTimeLocal(event.startTime).split('T')[0] : ''}
            className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-bold text-white">
              Start Time
            </label>
            <input
              type="datetime-local"
              name="startTime"
              id="startTime"
              required
              defaultValue={event ? formatDateTimeLocal(event.startTime) : ''}
              className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-bold text-white">
              End Time
            </label>
            <input
              type="datetime-local"
              name="endTime"
              id="endTime"
              required
              defaultValue={event ? formatDateTimeLocal(event.endTime) : ''}
              className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="type" className="block text-sm font-bold text-white">
          Event Type
        </label>
        <select
          name="type"
          id="type"
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value)
            // Auto-enable all-day for CLOSED events
            if (e.target.value === 'CLOSED') {
              setIsAllDay(true)
              setDisplayStyle('VERTICAL')
              setOverridesOthers(true)
            }
          }}
          className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
        >
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type} className="bg-gray-800">
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="spaceId" className="block text-sm font-bold text-white">
          Space {eventType === 'CLOSED' ? '(Optional for CLOSED events)' : ''}
        </label>
        <select
          name="spaceId"
          id="spaceId"
          value={selectedSpaceId}
          onChange={(e) => setSelectedSpaceId(e.target.value)}
          required={eventType !== 'CLOSED'}
          className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
        >
          <option value="" className="bg-gray-800">
            {eventType === 'CLOSED' ? 'No space (applies to all)' : 'Select a space'}
          </option>
          {spaces.map((space) => (
            <option key={space.id} value={space.id} className="bg-gray-800">
              {space.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="capacity" className="block text-sm font-bold text-white">
          Capacity (optional)
        </label>
        <input
          type="number"
          name="capacity"
          id="capacity"
          min="1"
          defaultValue={event?.capacity || ''}
          className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="published"
          id="published"
          defaultChecked={event?.published}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-white/10"
        />
        <label htmlFor="published" className="ml-2 block text-sm font-bold text-white">
          Published
        </label>
      </div>

      <div className="flex justify-between">
        <div className="space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
        {event && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  )
}
