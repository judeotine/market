export default function ContentSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden">
          <div className="aspect-square bg-gray-200 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 animate-pulse" />
            </div>
            <div className="h-4 w-3/4 bg-gray-200 animate-pulse" />
            <div className="flex justify-between items-center">
              <div className="h-6 w-20 bg-gray-200 animate-pulse" />
              <div className="h-8 w-8 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

