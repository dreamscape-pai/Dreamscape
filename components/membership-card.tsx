'use client'

import { useState } from 'react'
import type { MembershipPlan } from '@prisma/client'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

type MembershipCardProps = {
  plan: MembershipPlan
}

export function MembershipCard({ plan }: MembershipCardProps) {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/memberships')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membershipPlanId: plan.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create subscription')
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error subscribing:', error)
      alert('Failed to start subscription. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold">${(plan.price / 100).toFixed(0)}</span>
        <span className="text-gray-600">/{plan.interval}</span>
      </div>
      {plan.description && (
        <p className="text-gray-600 mb-6 flex-1">{plan.description}</p>
      )}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {loading ? 'Loading...' : 'Subscribe'}
      </button>
    </div>
  )
}
