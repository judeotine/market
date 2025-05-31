import { Shop } from '@/types/types';
import Image from 'next/image';
import { Card } from './ui/card';
import Link from 'next/link';

export function ShopCard({ shop }: { shop: Shop }) {
  return (
    <Link href={`/shop/${shop.shop_id}`} key={shop.shop_id} className="group">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-32">
          <Image
            src="/placeholder.svg"
            alt={shop.name}
            fill
            className="object-cover"
          />
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <Image
              src={shop.logo || '/placeholder.svg'}
              alt={shop.name}
              width={80}
              height={80}
              className="rounded-full border-4 border-white"
            />
          </div>
        </div>
        <div className="p-4 pt-12 text-center">
          <h3 className="font-semibold mb-1 group-hover:text-amber-600 transition-colors">
            {shop.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{shop.other.location}</p>
          {/* <div className="flex items-center justify-center text-yellow-400">
            <Star className="h-4 w-4 fill-current" />
            <span className="ml-1 text-sm text-gray-600">{shop.rating}</span>
          </div> */}
        </div>
      </Card>
    </Link>
  );
}
