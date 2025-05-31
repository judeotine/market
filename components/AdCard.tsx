import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Ad, Product, Service } from '@/types/types';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Star from '@/components/ui/star';

interface AdCardProps {
  ad: Ad;
  item?: Product | Service;
}

export default function AdCard({ ad, item }: AdCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleAdClick = () => {
    if (!item) return;
    if (ad.type === 'product') {
      router.push(`/product/${ad.product_id}`);
    } else if (ad.type === 'service') {
      router.push(`/service/${ad.service_id}`);
    }
  };

  if (!item) return null;

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
      onClick={handleAdClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square">
        {item.other?.images?.[0] && (
          <Image
            src={item.other.images[0]}
            alt={item.name}
            fill
            className="object-cover w-full h-48"
          />
        )}
        {ad.isPromoted && (
          <Badge
            variant="outline"
            className="absolute top-2 right-2 text-xs bg-amber-200 text-amber-800"
          >
            Promoted
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
          <p className="text-lg font-bold text-amber-600">
            {item.price} {item.price_currency}
          </p>
          {ad.discount_rate > 0 && (
            <p className="text-sm text-green-600">{ad.discount_rate}% off</p>
          )}
          {ad.type === 'product' && item && 'rating' in item && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < (item as Product).rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{(item as Product).rating}/5</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <Link
          href={`/${ad.type}/${
            ad.type === 'product' ? ad.product_id : ad.service_id
          }`}
          className="w-full"
        >
          <button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded">
            View Details
          </button>
        </Link>
      </CardFooter>
    </Card>
  );
}
