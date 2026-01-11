'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import type { Space } from '@prisma/client'

type SpaceFormProps = {
  space?: Space
}

export function SpaceForm({ space }: SpaceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<string[]>(space?.images || [])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleAddImage = () => {
    if (newImageUrl && !images.includes(newImageUrl)) {
      setImages([...images, newImageUrl])
      setNewImageUrl('')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
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
        setImages((prev) => [...prev, data.url])
        setUploadProgress(((i + 1) / files.length) * 100)
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload files')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset the file input
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < images.length) {
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]]
      setImages(newImages)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string) : null,
      published: formData.get('published') === 'on',
      images: images,
    }

    try {
      const url = space ? `/api/spaces/${space.id}` : '/api/spaces'
      const method = space ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save space')
      }

      router.push('/admin/spaces')
      router.refresh()
    } catch (err) {
      setError('Failed to save space. Please try again.')
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!space) return
    if (!confirm('Are you sure you want to delete this space?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/spaces/${space.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete space')
      }

      router.push('/admin/spaces')
      router.refresh()
    } catch (err) {
      setError('Failed to delete space. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-bold text-white">
          Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          defaultValue={space?.name}
          className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-bold text-white">
          Slug
        </label>
        <input
          type="text"
          name="slug"
          id="slug"
          required
          defaultValue={space?.slug}
          pattern="[a-z0-9-]+"
          className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
        />
        <p className="mt-1 text-sm text-gray-400">Lowercase letters, numbers, and hyphens only</p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-bold text-white">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          defaultValue={space?.description || ''}
          className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
        />
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
          defaultValue={space?.capacity || ''}
          className="mt-1 block w-full rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3"
        />
      </div>

      {/* Images Management Section */}
      <div className="space-y-4">
        <label className="block text-sm font-bold text-white">
          Photos
        </label>

        {/* File upload section */}
        <div className="space-y-4">
          {/* Upload from computer */}
          <div className="flex items-center gap-4">
            <label className="relative cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <span className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors">
                {uploading ? 'Uploading...' : 'Upload from Computer'}
              </span>
            </label>
            {uploading && (
              <div className="flex-1">
                <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{Math.round(uploadProgress)}% uploaded</p>
              </div>
            )}
          </div>

          {/* Or add by URL */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Or add by URL:</span>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Enter image URL"
              className="flex-1 rounded-md bg-white/10 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 placeholder-gray-400"
              disabled={uploading}
            />
            <button
              type="button"
              onClick={handleAddImage}
              disabled={!newImageUrl || uploading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add URL
            </button>
          </div>
        </div>

        {/* Image list */}
        {images.length > 0 && (
          <div className="space-y-2 border border-gray-600 rounded-lg p-4 bg-white/5">
            {images.map((imageUrl, index) => (
              <div key={index} className="flex items-center gap-4 p-2 bg-white/10 rounded border border-gray-600">
                {/* Image preview */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={imageUrl}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover rounded"
                    unoptimized
                  />
                </div>

                {/* URL display */}
                <div className="flex-1 truncate text-sm text-gray-300">
                  {imageUrl}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Move up */}
                  <button
                    type="button"
                    onClick={() => handleMoveImage(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>

                  {/* Move down */}
                  <button
                    type="button"
                    onClick={() => handleMoveImage(index, 'down')}
                    disabled={index === images.length - 1}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-1 text-red-400 hover:text-red-300"
                    title="Remove"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-400 mt-2">
              First photo will be the primary image. Use arrows to reorder.
            </p>
          </div>
        )}

        {images.length === 0 && (
          <p className="text-sm text-gray-400">No photos added yet</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="published"
          id="published"
          defaultChecked={space?.published}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-white/10"
        />
        <label htmlFor="published" className="ml-2 block text-sm text-white">
          Published
        </label>
      </div>

      <div className="flex justify-between">
        <div className="space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Saving...' : space ? 'Update Space' : 'Create Space'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-700 text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold"
          >
            Cancel
          </button>
        </div>
        {space && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  )
}