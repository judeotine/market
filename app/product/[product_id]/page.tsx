'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  StarIcon,
  Heart,
  Share2,
  ShoppingCart,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ProductDetailsTab } from '@/components/product/product-details-tabs';
import { supabase } from '@/utils/supabase-client';
import { Ad, Product, Shop, Review } from '@/types/types';
import NotFound from '@/app/not-found-page';

export default function ProductPage({
  params,
}: {
  params: { product_id: string };
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [ad, setAd] = useState<Ad | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchProductData();
  }, [params.product_id]);

  const fetchProductData = async () => {
    setIsLoading(true);
    try {
      // First fetch the ad that contains the product
      const { data: adData, error: adError } = await supabase
        .from('ads')
        .select('*')
        .eq('product_id', params.product_id)
        .eq('type', 'product')
        .single();

      if (adError) throw adError;
      if (!adData) return <NotFound />;

      setAd(adData);

      // Fetch the product details
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('product_id', params.product_id)
        .single();

      if (productError) throw productError;
      if (!productData) return <NotFound />;

      setProduct(productData);

      // Fetch shop data
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('shop_id', adData.shop_id)
        .single();

      if (shopError) throw shopError;
      setShop(shopData);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('ad_id', adData.advert_id);

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching product data:', error);
      toast.error('Failed to load product data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    toast.success('Added to cart!');
  };

  const handleWishlist = () => {
    toast.success('Added to wishlist!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <span className="ml-2">Loading product...</span>
      </div>
    );
  }

  if (!ad || !product || !shop) {
    return <NotFound />;
  }

  // Calculate discounted price if there's a discount rate
  const discountRate = ad.discount_rate;
  const originalPrice = product.price;
  const discountedPrice =
    discountRate > 0 ? originalPrice * (1 - discountRate / 100) : originalPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <span>Home</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span>{product.other.category}</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-amber-600">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-white p-2 border">
              <Image
                src={product.other.images[selectedImage] || '/placeholder.svg'}
                alt={product.name}
                fill
                className="object-cover object-center"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.other.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 
                    ${
                      selectedImage === index
                        ? 'border-amber-600'
                        : 'border-transparent'
                    }`}>
                  <Image
                    src={image || '/placeholder.svg'}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-cover object-center"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(Number(shop.rating))
                          ? 'text-yellow-400'
                          : 'text-gray-200'
                      }`}
                      fill="currentColor"
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    ({reviews.length} reviews)
                  </span>
                </div>
                <span className="text-sm text-gray-600">{ad.views} views</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  {discountedPrice.toFixed(2)} {product.price_currency}
                </span>
                {discountRate > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800">
                    {discountRate}% OFF
                  </Badge>
                )}
              </div>
              {discountRate > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <span>
                    Original price: {originalPrice.toFixed(2)}{' '}
                    {product.price_currency}
                  </span>
                </div>
              )}
              {ad.isPromoted && (
                <Badge className="mt-2 bg-amber-100 text-amber-800">
                  Promoted
                </Badge>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 hover:bg-gray-100">
                    -
                  </button>
                  <span className="px-4 py-1 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 hover:bg-gray-100">
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 h-12 text-lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleWishlist}
                  variant="outline"
                  className="h-12 w-12 flex items-center justify-center">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Share link copied!');
                  }}
                  variant="outline"
                  className="h-12 w-12 flex items-center justify-center">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 py-6 border-y">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-amber-600" />
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-600" />
                <span className="text-sm">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-amber-600" />
                <span className="text-sm">Easy Returns</span>
              </div>
            </div>
            {/* Ad Expiry Info */}
            {ad.ad_lifetime > 0 && (
              <div className="text-sm text-gray-600">
                <p>
                  Ad expires in: {ad.ad_lifetime} {ad.ad_lifetime_units}
                </p>
              </div>
            )}
            {/* Seller Info */}
            <Card className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={shop.logo || '/placeholder.svg'}
                    alt={shop.name}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                  <h3 className="font-semibold">{shop.name}</h3>
                </div>
                <div className="text-sm text-gray-600">
                  <span>{shop.other.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {shop.rating} Rating
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      (window.location.href = `/shop/${shop.shop_id}`)
                    }>
                    View Shop
                  </Button>
                </div>
              </div>
            </Card>{' '}
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <ProductDetailsTab product={product} reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
