import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Eye, Calendar, Zap } from "lucide-react"
import type { Service, Shop } from "@/lib/types"
import { toast } from "sonner"

interface ServiceCardProps {
  service: Service
  shop: Shop
  isPromoted?: boolean
  views?: number
  rating?: number
}

export default function ServiceCard({ service, shop, isPromoted, views = 0, rating = 0 }: ServiceCardProps) {
  const handleBookNow = (e: React.MouseEvent) => {
    e.preventDefault()
    toast.success("Booking started!")
  }

  return (
    <Link href={`/service/${service.service_id}`} className="group">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="relative aspect-video">
          <Image
            src={service.other.images[0] || "/placeholder.svg"}
            alt={service.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {isPromoted && (
            <Badge className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-amber-600">
              <Zap className="h-3 w-3 mr-1" /> Promoted
            </Badge>
          )}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Badge variant="secondary" className="bg-black/50 text-white">
              <Eye className="h-3 w-3 mr-1" /> {views}
            </Badge>
          </div>
          <div className="absolute inset-x-4 bottom-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button asChild className="flex-1 bg-white text-amber-600 hover:bg-amber-50" onClick={handleBookNow}>
              <div>
                <Calendar className="h-4 w-4 mr-2" />
                Book Now
              </div>
            </Button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Image
                src={shop.logo || "/placeholder.svg"}
                alt={shop.name}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm text-gray-600 hover:text-amber-600 transition-colors">{shop.name}</span>
            </div>
            <div className="flex items-center text-yellow-400">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 text-sm text-gray-600">{rating}</span>
            </div>
          </div>
          <h3 className="font-semibold mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
            {service.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">${service.price}</span>
            <span className="text-sm text-gray-600">per session</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

