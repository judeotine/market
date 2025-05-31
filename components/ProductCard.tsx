import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Eye, ShoppingCart, Zap } from 'lucide-react';
import type { Product, Shop } from '@/lib/types';
import { useSignal } from 'state-signal';
import { cartSignal } from '@/store';

interface ProductCardProps {
  product: Product;
  shop: Shop;
  isPromoted?: boolean;
  views?: number;
  rating?: number;
}

export default function ProductCard({
  product,
  shop,
  isPromoted,
  views = 0,
  rating = 0,
}: ProductCardProps) {
  const [cart, setCart] = useSignal<any | []>(cartSignal);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCart([...cart, product]);
  };

  return (
    <div className="group">
      <Link href={`/product/${product.product_id}`}>
        <Card className="h-full">
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.other.images[0] || '/placeholder.svg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {isPromoted && (
              <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-600">
                <Zap className="h-3 w-3 mr-1" /> Promoted
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-black/50 text-white">
              <Eye className="h-3 w-3 mr-1" /> {views}
            </Badge>
          </div>
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Image
                src={shop.logo || '/placeholder.svg'}
                alt={shop.name}
                width={20}
                height={20}
                className="rounded-full"
              />
              <span className="text-xs text-gray-600">{shop.name}</span>
              <div className="ml-auto flex items-center text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <span className="ml-1 text-xs text-gray-600">{rating}</span>
              </div>
            </div>
            <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold">${product.price}</span>
                {isPromoted && (
                  <span className="text-xs text-gray-500 line-through">
                    ${(product.price * 1.2).toFixed(2)}
                  </span>
                )}
              </div>
              <Button
                asChild
                size="sm"
                className="bg-amber-600 hover:bg-amber-700"
                onClick={handleAddToCart}>
                <div>
                  <ShoppingCart className="h-4 w-4" />
                </div>
              </Button>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
