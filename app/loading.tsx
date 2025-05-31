export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <div className="h-[600px] bg-gradient-to-r from-amber-600 to-amber-400 -mt-8">
        <div className="container mx-auto px-4 h-full flex flex-col items-center justify-center">
          <div className="w-3/4 h-12 bg-white/20 rounded-lg mb-6 animate-pulse" />
          <div className="w-1/2 h-6 bg-white/20 rounded-lg mb-8 animate-pulse" />
          <div className="w-full max-w-2xl h-14 bg-white rounded-full animate-pulse" />
        </div>
      </div>

      {/* Categories Section Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between mb-8">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse" />
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>

      {/* Products Section Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between mb-8">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse" />
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shops Section Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between mb-8">
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse" />
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow animate-pulse">
              <div className="h-32 bg-gray-200" />
              <div className="p-4 text-center">
                <div className="h-6 bg-gray-200 rounded mb-2 mx-auto w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

