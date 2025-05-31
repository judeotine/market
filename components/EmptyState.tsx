import { PackageSearch } from "lucide-react"

interface EmptyStateProps {
  title?: string
  message?: string
}

export default function EmptyState({
  title = "No items found",
  message = "Try adjusting your filters or search terms",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <PackageSearch className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}

