'use client'

import { useState } from 'react'

export function ManualSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncResult(null)

    try {
      const response = await fetch('/api/google/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const data = await response.json()

      if (response.ok) {
        const { created, updated, deleted } = data.results
        setSyncResult(`Synced: ${created} created, ${updated} updated, ${deleted} deleted`)
        // Reload page after a moment to show updated stats
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setSyncResult(`Error: ${data.error || 'Failed to sync'}`)
      }
    } catch (error) {
      console.error('Sync error:', error)
      setSyncResult('Error: Failed to sync')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="px-4 py-2 bg-sunset text-sand rounded-md hover:bg-sunset/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSyncing ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Syncing...
          </span>
        ) : (
          'Sync Now'
        )}
      </button>
      {syncResult && (
        <p className={`text-sm mt-2 ${syncResult.startsWith('Error') ? 'text-sunset' : 'text-forest'}`}>
          {syncResult}
        </p>
      )}
    </div>
  )
}
