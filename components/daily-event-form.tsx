'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { DailyEvent, Space, EventDisplayStyle, DailyEventType } from '@prisma/client'

type DailyEventWithSpace = DailyEvent & {
  space?: Space | null
}

type DailyEventFormProps = {
  event?: DailyEventWithSpace
  spaces: Space[]
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
]

export function DailyEventForm({ event, spaces }: DailyEventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [type, setType] = useState<DailyEventType>(event?.type || 'FACILITY')
  const [selectedDays, setSelectedDays] = useState<number[]>(event?.daysOfWeek || [])
  const [displayStyle, setDisplayStyle] = useState<EventDisplayStyle>(event?.displayStyle || 'NORMAL')
  const [overridesOthers, setOverridesOthers] = useState(event?.overridesOthers || false)
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(
    event?.spaceId?.toString() || ''
  )

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day))
    } else {
      setSelectedDays([...selectedDays, day].sort((a, b) => a - b))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate days selected
    if (selectedDays.length === 0) {
      setError('Please select at least one day')
      setLoading(false)
      return
    }

    // Only require space for non-CLOSED types
    if (type !== 'CLOSED' && !selectedSpaceId) {
      setError('Please select a space')
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      startTime: type === 'CLOSED' ? '00:00' : formData.get('startTime'),
      endTime: type === 'CLOSED' ? '23:59' : formData.get('endTime'),
      daysOfWeek: selectedDays,
      type,
      displayStyle,
      overridesOthers,
      isActive: formData.get('isActive') === 'on',
      showInCalendar: type === 'CLOSED' ? true : formData.get('showInCalendar') === 'on',
      spaceId: selectedSpaceId ? parseInt(selectedSpaceId) : null,
    }

    try {
      const url = event ? `/api/daily-events/${event.id}` : '/api/daily-events'
      const method = event ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save daily event')
      }

      router.push('/admin/daily-events')
      router.refresh()
    } catch (err) {
      setError('Failed to save daily event. Please try again.')
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!event) return
    if (!confirm('Are you sure you want to delete this daily event?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/daily-events/${event.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete daily event')
      }

      router.push('/admin/daily-events')
      router.refresh()
    } catch (err) {
      setError('Failed to delete daily event. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="type" className="block text-sm font-bold text-white mb-2">
          Event Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => {
            const newType = e.target.value as DailyEventType
            setType(newType)
            if (newType === 'CLOSED') {
              setDisplayStyle('VERTICAL')
              setOverridesOthers(true)
            }
          }}
          className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
        >
          <option value="FACILITY" className="bg-gray-800">Facility Hours (Cafe, Sauna, etc)</option>
          <option value="CLOSED" className="bg-gray-800">CLOSED (Venue Closed)</option>
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-bold text-white">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          defaultValue={event?.title || (type === 'CLOSED' ? 'CLOSED' : '')}
          placeholder={type === 'CLOSED' ? 'CLOSED' : 'e.g., Cafe Hours, Sauna'}
          className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-bold text-white">
          Description (optional)
        </label>
        <textarea
          name="description"
          id="description"
          rows={3}
          defaultValue={event?.description || ''}
          className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
        />
      </div>

      {/* Days of Week Selection */}
      <div>
        <label className="block text-sm font-bold text-white mb-3">
          Days of Week
        </label>
        <div className="grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedDays.includes(day.value)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {day.short}
            </button>
          ))}
        </div>
        {type === 'CLOSED' && selectedDays.includes(0) && (
          <p className="mt-2 text-yellow-400 text-sm">
            ✓ Perfect! Setting Sunday as CLOSED.
          </p>
        )}
      </div>

      {/* Time Selection (hidden for CLOSED type) */}
      {type !== 'CLOSED' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-bold text-white">
              Start Time
            </label>
            <input
              type="time"
              name="startTime"
              id="startTime"
              required
              defaultValue={event?.startTime || '09:00'}
              className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-bold text-white">
              End Time
            </label>
            <input
              type="time"
              name="endTime"
              id="endTime"
              required
              defaultValue={event?.endTime || '17:00'}
              className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
            />
          </div>
        </div>
      )}

      {/* CLOSED Display Options */}
      {type === 'CLOSED' && (
        <div className="space-y-3 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
          <h3 className="text-sm font-bold text-red-400 mb-2">CLOSED Display Options</h3>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="verticalDisplay"
              checked={displayStyle === 'VERTICAL'}
              onChange={(e) => setDisplayStyle(e.target.checked ? 'VERTICAL' : 'NORMAL')}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-white/10"
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
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-600 rounded bg-white/10"
            />
            <label htmlFor="overridesOthers" className="ml-2 block text-sm text-white">
              Hide/dim other events on closed days
            </label>
          </div>
        </div>
      )}

      {/* Space Selection */}
      {type !== 'CLOSED' && (
        <div>
          <label htmlFor="spaceId" className="block text-sm font-bold text-white">
            Space
          </label>
          <select
            name="spaceId"
            id="spaceId"
            value={selectedSpaceId}
            onChange={(e) => setSelectedSpaceId(e.target.value)}
            required
            className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
          >
            <option value="" className="bg-gray-800">Select a space</option>
            {spaces.map((space) => (
              <option key={space.id} value={space.id} className="bg-gray-800">
                {space.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Additional Options */}
      <div className="space-y-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            defaultChecked={event?.isActive ?? true}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-white/10"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm font-bold text-white">
            Active (uncheck to temporarily disable)
          </label>
        </div>

        {type !== 'CLOSED' && (
          <div className="flex items-center">
            <input
              type="checkbox"
              name="showInCalendar"
              id="showInCalendar"
              defaultChecked={event?.showInCalendar ?? true}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-white/10"
            />
            <label htmlFor="showInCalendar" className="ml-2 block text-sm font-bold text-white">
              Show in calendar grid
            </label>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <div className="space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : event ? 'Update' : 'Create'}
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