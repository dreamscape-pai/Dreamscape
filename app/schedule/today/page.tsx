import { redirect } from 'next/navigation'

export default function TodaySchedulePage() {
  // Redirect to the dynamic date route with today's date
  const today = new Date()
  const dateStr = `${today.getMonth() + 1}-${today.getDate()}-${today.getFullYear()}`
  redirect(`/schedule/${dateStr}`)
}