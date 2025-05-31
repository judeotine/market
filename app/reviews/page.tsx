'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarIcon } from 'lucide-react';
import { supabase } from '@/utils/supabase-client';
import { useEffect, useState } from 'react';
import { Review, Ad, Product, Service } from '@/types/types';
import { toast } from 'sonner';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReviewsData() {
      try {
        // Fetch reviews
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('You must be logged in to view reviews');
          return;
        }

        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (reviewsError) {
          toast.error('Error loading reviews');
          console.error('Error fetching reviews:', reviewsError);
          return;
        }

        setReviews(reviewsData as Review[]);

        // Get ad IDs from reviews
        const adIds = reviewsData?.map((review) => review.ad_id) || [];

        // Fetch ads
        if (adIds.length > 0) {
          const { data: adsData, error: adsError } = await supabase
            .from('ads')
            .select('*')
            .in('advert_id', adIds);

          if (adsError) {
            toast.error('Error loading ads');
            console.error('Error fetching ads:', adsError);
            return;
          }

          setAds(adsData as Ad[]);

          // Get product IDs and service IDs from ads
          const productIds =
            adsData
              ?.filter((ad) => ad.type === 'product' && ad.product_id)
              .map((ad) => ad.product_id) || [];

          const serviceIds =
            adsData
              ?.filter((ad) => ad.type === 'service' && ad.service_id)
              .map((ad) => ad.service_id) || [];

          // Fetch products
          if (productIds.length > 0) {
            const { data: productsData, error: productsError } = await supabase
              .from('products')
              .select('*')
              .in('product_id', productIds);

            if (productsError) {
              toast.error('Error loading products');
              console.error('Error fetching products:', productsError);
            } else {
              setProducts(productsData as Product[]);
            }
          }

          // Fetch services
          if (serviceIds.length > 0) {
            const { data: servicesData, error: servicesError } = await supabase
              .from('services')
              .select('*')
              .in('service_id', serviceIds);

            if (servicesError) {
              toast.error('Error loading services');
              console.error('Error fetching services:', servicesError);
            } else {
              setServices(servicesData as Service[]);
            }
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviewsData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-600 mb-6">Reviews</h1>
      <div className="grid gap-6">
        {reviews.map((review) => {
          const ad = ads.find((ad) => ad.advert_id === review.ad_id);
          const item =
            ad?.type === 'product'
              ? products.find((p) => p.product_id === ad.product_id)
              : services.find((s) => s.service_id === ad?.service_id);

          return (
            <Card key={review.review_id}>
              <CardHeader>
                <CardTitle>{item?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p>{review.comment}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
