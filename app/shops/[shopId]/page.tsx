'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Shop } from '@/types/types';
import { Button } from '@/components/ui/button';
import { FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

type ShopWithProfile = Shop & {
  profiles?: {
    name: string;
    avatar: string;
    phone?: string;
  } | null;
  other?: {
    location?: string;
    contact_email?: string;
  };
};

export default function ShopDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [shop, setShop] = useState<ShopWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShop() {
      try {
        const shopId = params.shopId as string;
        
        const { data, error: fetchError } = await supabase
          .from('shops')
          .select(`
            *,
            profiles:profile_id (
              name,
              avatar
            )
          `)
          .eq('shop_id', shopId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) {
          setError('Shop not found');
          return;
        }

        setShop(data);
      } catch (err) {
        console.error('Error fetching shop:', err);
        setError('Failed to load shop details');
      } finally {
        setLoading(false);
      }
    }

    if (params.shopId) {
      fetchShop();
    }
  }, [params.shopId]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <LoadingSkeleton type="shop" count={1} />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h1 className="text-2xl font-bold mb-4">Shop Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested shop could not be found.'}</p>
          <Button onClick={() => router.back()}>
            <FiArrowLeft className="mr-2" />
            Back to Shops
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Back to Shops
      </Button>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center space-x-4">
          <div className="p-3 rounded-full bg-amber-100">
            <FiShoppingBag className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-2xl">{shop.name}</CardTitle>
            <p className="text-gray-600">
              {shop.profiles?.name ? `Owner: ${shop.profiles.name}` : 'Unknown Owner'}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shop.description && (
              <div>
                <h3 className="font-semibold mb-1">About</h3>
                <p className="text-gray-700">{shop.description}</p>
              </div>
            )}
            
            {shop.other?.contact_email && (
              <div>
                <h3 className="font-semibold mb-1">Contact Email</h3>
                <p className="text-gray-700">{shop.other.contact_email}</p>
              </div>
            )}
            
            {shop.profiles?.phone && (
              <div>
                <h3 className="font-semibold mb-1">Phone</h3>
                <p className="text-gray-700">{shop.profiles.phone}</p>
              </div>
            )}
            
            {shop.other?.location && (
              <div>
                <h3 className="font-semibold mb-1">Location</h3>
                <p className="text-gray-700">{shop.other.location}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
