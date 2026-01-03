import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges were made.
        </p>
        <div className="space-y-3">
          <Link
            href="/schedule"
            className="block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Back to Schedule
          </Link>
        </div>
      </div>
    </div>
  )
}
