export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sand border-t-sunset mb-4"></div>
        <p className="text-sand text-lg">Loading...</p>
      </div>
    </div>
  )
}
