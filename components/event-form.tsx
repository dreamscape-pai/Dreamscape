'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Event, EventSpace, Space, Product } from '@prisma/client'

type EventWithSpaces = Event & {
  spaces: (EventSpace & { space: Space })[]
  product?: Product | null
}

type EventFormProps = {
  event?: EventWithSpaces
  spaces: Space[]
  products: Product[]
}

const EVENT_TYPES = ['WORKSHOP', 'SHOW', 'JAM', 'RETREAT', 'FESTIVAL', 'OTHER']

export function EventForm({ event, spaces, products }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>(
    event?.spaces.map((es) => es.spaceId) || []
  )

  function toggleSpace(spaceId: string) {
    setSelectedSpaces((prev) =>
      prev.includes(spaceId) ? prev.filter((id) => id !== spaceId) : [...prev, spaceId]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (selectedSpaces.length === 0) {
      setError('Please select at least one space')
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      type: formData.get('type'),
      capacity: formData.get('capacity'),
      productId: formData.get('productId') || null,
      published: formData.get('published') === 'on',
      spaceIds: selectedSpaces,
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
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          defaultValue={event?.title}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
          Slug
        </label>
        <input
          type="text"
          name="slug"
          id="slug"
          required
          defaultValue={event?.slug}
          pattern="[a-z0-9-]+"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">Lowercase letters, numbers, and hyphens only</p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          defaultValue={event?.description || ''}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="datetime-local"
            name="startTime"
            id="startTime"
            required
            defaultValue={event ? formatDateTimeLocal(event.startTime) : ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            type="datetime-local"
            name="endTime"
            id="endTime"
            required
            defaultValue={event ? formatDateTimeLocal(event.endTime) : ''}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Event Type
        </label>
        <select
          name="type"
          id="type"
          defaultValue={event?.type || 'OTHER'}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Spaces (select at least one)
        </label>
        <div className="space-y-2">
          {spaces.map((space) => (
            <label key={space.id} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedSpaces.includes(space.id)}
                onChange={() => toggleSpace(space.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-900">{space.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
          Capacity (optional)
        </label>
        <input
          type="number"
          name="capacity"
          id="capacity"
          min="1"
          defaultValue={event?.capacity || ''}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
          Linked Product (optional)
        </label>
        <select
          name="productId"
          id="productId"
          defaultValue={event?.productId || ''}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">No product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} - ${(product.price / 100).toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="published"
          id="published"
          defaultChecked={event?.published}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
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
