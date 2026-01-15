'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import Image from 'next/image'
import { adminStyles } from '@/lib/admin-styles'

type MultiDayEvent = {
  id?: number
  title: string
  slug: string
  description?: string | null
  startDate: Date | string
  endDate: Date | string
  posterImage?: string | null
  type: 'FESTIVAL' | 'INTENSIVE' | 'RETREAT'
  websiteUrl?: string | null
  facebookUrl?: string | null
  instagramUrl?: string | null
  published: boolean
  featured: boolean
}

type MultiDayEventSection = {
  id?: number
  title: string
  description?: string | null
  imageUrl?: string | null
  order: number
}

type MultiDayEventFormProps = {
  event?: MultiDayEvent & { sections?: MultiDayEventSection[] }
}

export default function MultiDayEventForm({ event }: MultiDayEventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sections, setSections] = useState<MultiDayEventSection[]>(
    event?.sections || []
  )
  const [posterImage, setPosterImage] = useState<string>(event?.posterImage || '')
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      posterImage: posterImage || null,
      type: formData.get('type'),
      websiteUrl: formData.get('websiteUrl'),
      facebookUrl: formData.get('facebookUrl'),
      instagramUrl: formData.get('instagramUrl'),
      published: formData.get('published') === 'on',
      featured: formData.get('featured') === 'on',
    }

    try {
      const response = await fetch(
        event ? `/api/multi-day-events/${event.id}` : '/api/multi-day-events',
        {
          method: event ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) throw new Error('Failed to save event')

      const savedEvent = await response.json()

      // Save sections
      for (const section of sections) {
        if (section.id) {
          // Update existing section
          await fetch(`/api/multi-day-events/${savedEvent.id}/sections`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sectionId: section.id,
              ...section
            }),
          })
        } else {
          // Create new section
          await fetch(`/api/multi-day-events/${savedEvent.id}/sections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(section),
          })
        }
      }

      router.push('/admin/multi-day-events')
      router.refresh()
    } catch (err) {
      setError('Failed to save event')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload file')
      }

      const data = await response.json()
      setPosterImage(data.url)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploading(false)
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const handleSectionImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload file')
      }

      const data = await response.json()
      updateSection(index, 'imageUrl', data.url)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploading(false)
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const addSection = () => {
    setSections([...sections, { title: '', description: '', order: sections.length }])
  }

  const updateSection = (index: number, field: string, value: string | number) => {
    const newSections = [...sections]
    newSections[index] = { ...newSections[index], [field]: value }
    setSections(newSections)
  }

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index))
  }

  // Format dates for input fields
  const startDate = event?.startDate
    ? format(new Date(event.startDate), 'yyyy-MM-dd')
    : ''
  const endDate = event?.endDate
    ? format(new Date(event.endDate), 'yyyy-MM-dd')
    : ''

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className={adminStyles.alertError}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className={adminStyles.label}>
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={event?.title}
            className={adminStyles.input}
          />
        </div>

        <div>
          <label htmlFor="slug" className={adminStyles.label}>
            URL Slug
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            defaultValue={event?.slug}
            placeholder="auto-generated if empty"
            className={adminStyles.input}
          />
        </div>

        <div>
          <label htmlFor="type" className={adminStyles.label}>
            Event Type *
          </label>
          <select
            id="type"
            name="type"
            defaultValue={event?.type || 'FESTIVAL'}
            className={adminStyles.select}
          >
            <option value="FESTIVAL">Festival</option>
            <option value="INTENSIVE">Intensive</option>
            <option value="RETREAT">Retreat</option>
          </select>
        </div>

        <div>
          <label className={adminStyles.label}>
            Poster Image
          </label>
          <div className="mt-1 space-y-3">
            {/* Upload button */}
            <label className="relative cursor-pointer inline-block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <span className={`${adminStyles.buttonPrimary} inline-block ${uploading ? 'opacity-50' : ''}`}>
                {uploading ? 'Uploading...' : 'Upload Image'}
              </span>
            </label>

            {/* Or enter URL */}
            <div className="flex items-center gap-2">
              <span className="text-sand/60 text-sm">Or enter URL:</span>
            </div>
            <input
              type="url"
              value={posterImage}
              onChange={(e) => setPosterImage(e.target.value)}
              placeholder="https://..."
              className={adminStyles.input}
            />

            {/* Preview */}
            {posterImage && (
              <div className="relative w-40 h-40 mt-2 rounded overflow-hidden border border-sand/20">
                <Image
                  src={posterImage}
                  alt="Poster preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => setPosterImage('')}
                  className="absolute top-1 right-1 p-1 bg-red-600 rounded-full hover:bg-red-700 transition"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="startDate" className={adminStyles.label}>
            Start Date *
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            required
            defaultValue={startDate}
            className={adminStyles.input}
          />
        </div>

        <div>
          <label htmlFor="endDate" className={adminStyles.label}>
            End Date *
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            required
            defaultValue={endDate}
            className={adminStyles.input}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={adminStyles.label}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={event?.description || ''}
          className={adminStyles.textarea}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="websiteUrl" className={adminStyles.label}>
            Website URL
          </label>
          <input
            type="url"
            id="websiteUrl"
            name="websiteUrl"
            defaultValue={event?.websiteUrl || ''}
            className={adminStyles.input}
          />
        </div>

        <div>
          <label htmlFor="facebookUrl" className={adminStyles.label}>
            Facebook URL
          </label>
          <input
            type="url"
            id="facebookUrl"
            name="facebookUrl"
            defaultValue={event?.facebookUrl || ''}
            className={adminStyles.input}
          />
        </div>

        <div>
          <label htmlFor="instagramUrl" className={adminStyles.label}>
            Instagram URL
          </label>
          <input
            type="url"
            id="instagramUrl"
            name="instagramUrl"
            defaultValue={event?.instagramUrl || ''}
            className={adminStyles.input}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="published"
            name="published"
            defaultChecked={event?.published}
            className={adminStyles.checkbox}
          />
          <label htmlFor="published" className={adminStyles.checkboxLabel}>
            Published (visible to public)
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            defaultChecked={event?.featured}
            className={adminStyles.checkbox}
          />
          <label htmlFor="featured" className={adminStyles.checkboxLabel}>
            Featured on home page
          </label>
        </div>
      </div>

      {/* Sections */}
      <div className={adminStyles.sectionDivider}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={adminStyles.sectionTitle}>Event Sections</h3>
          <button
            type="button"
            onClick={addSection}
            className={adminStyles.buttonSuccess}
          >
            Add Section
          </button>
        </div>

        {sections.map((section, index) => (
          <div key={index} className={`${adminStyles.sectionCard} mb-4`}>
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-sm font-medium text-sand">Section {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeSection(index)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={adminStyles.labelMuted}>
                  Section Title
                </label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(index, 'title', e.target.value)}
                  className={adminStyles.input}
                />
              </div>
              <div>
                <label className={adminStyles.labelMuted}>
                  Section Image
                </label>
                <div className="mt-1 space-y-2">
                  <label className="relative cursor-pointer inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSectionImageUpload(index, e)}
                      disabled={uploading}
                      className="hidden"
                    />
                    <span className={`${adminStyles.buttonSecondary} inline-block text-sm ${uploading ? 'opacity-50' : ''}`}>
                      Upload
                    </span>
                  </label>
                  <input
                    type="url"
                    value={section.imageUrl || ''}
                    onChange={(e) => updateSection(index, 'imageUrl', e.target.value)}
                    placeholder="Or enter URL"
                    className={adminStyles.input}
                  />
                  {section.imageUrl && (
                    <div className="relative w-20 h-20 rounded overflow-hidden border border-sand/20">
                      <Image
                        src={section.imageUrl}
                        alt={`Section ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={adminStyles.labelMuted}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={section.description || ''}
                  onChange={(e) => updateSection(index, 'description', e.target.value)}
                  className={adminStyles.textarea}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push('/admin/multi-day-events')}
          className={adminStyles.buttonMuted}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`${adminStyles.buttonPrimary} disabled:opacity-50`}
        >
          {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  )
}
