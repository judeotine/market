'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Star, MapPin, Clock, Plus, Edit, Store, 
  ShoppingBag, Megaphone, UserX, RefreshCw 
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { userSignal } from '@/store';
import { Ad, Product, Shop } from '@/types/types';
import { supabase } from '@/lib/supabase';

interface DatabaseAd extends Omit<Ad, 'status' | 'ad_lifetime' | 'isPromoted' | 'date_created'> {
  status: string;
  product: Product;
  shop: Shop;
  ad_lifetime: number | null;
  is_promoted: boolean | null;
  created_at: string | null;
}

interface AdWithProduct extends Omit<Ad, 'ad_lifetime' | 'isPromoted'> {
  product: Product;
  shop: Shop;
  status: 'active' | 'inactive' | 'expired';
  date_created: string;
  ad_lifetime: number;
  isPromoted: boolean;
}

export function AdList() {
  const [ads, setAds] = useState<AdWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopLoading, setShopLoading] = useState(true);
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const user = userSignal.value;

  const fetchAds = useCallback(async (shopId: string) => {
    if (!shopId) {
      console.error('No shop ID provided to fetchAds');
      return;
    }

    try {
      setLoading(true);
      
      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select(`
          *,
          product:products(*),
          shop:shops(*)
        `)
        .eq('shop_id', shopId)
        .order('date_created', { ascending: false });

      if (adsError) throw adsError;

      // Ensure all required fields have default values
      const processedAds = (adsData || []).map((ad: DatabaseAd) => ({
        ...ad,
        ad_lifetime: ad.ad_lifetime ?? 30, // Default to 30 days if null
        status: (ad.status || 'active') as 'active' | 'inactive' | 'expired',
        isPromoted: !!ad.is_promoted,
        date_created: ad.created_at || new Date().toISOString()
      } as AdWithProduct));
      setAds(processedAds);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast.error('Failed to fetch ads');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchShop = useCallback(async () => {
    if (!user?.id) {
      console.log('Waiting for user to be available...');
      return;
    }

    try {
      setShopLoading(true);
      
      console.log('Fetching profiles for user:', user.id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id);
        
      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        throw profileError;
      }
      
      if (!profiles || profiles.length === 0) {
        console.log('No profiles found for user');
        setCurrentShop(null);
        return;
      }

      console.log('Found profiles:', profiles);
      
      for (const profile of profiles) {
        if (!profile.id) continue;
        
        console.log('Checking profile for shop:', profile.id);
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('profile_id', profile.id)
          .maybeSingle();

        if (shopError) {
          console.error('Error fetching shop for profile:', shopError);
          throw shopError;
        }
        
        if (shopData) {
          console.log('Found shop:', shopData);
          setCurrentShop(shopData);
          await fetchAds(shopData.id);
          return;
        } else {
          console.log('No shop found for profile:', profile.id);
        }
      }
      
      setCurrentShop(null);
    } catch (error) {
      console.error('Error fetching shop:', error);
      toast.error('Failed to load shop information');
    } finally {
      setShopLoading(false);
    }
  }, [user?.id, fetchAds]);

  if (!user) {
    return (
      <div className="text-center py-12 px-4 max-w-2xl mx-auto">
        <div className="bg-amber-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <UserX className="h-10 w-10 text-amber-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Not Logged In</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Please sign in to view and manage your ads.
        </p>
        <Button 
          onClick={() => window.location.href = '/login'}
          className="bg-amber-600 hover:bg-amber-700"
        >
          Sign In
        </Button>
      </div>
    );
  }

  if (shopLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        <p className="text-muted-foreground">
          {shopLoading ? 'Loading shop information...' : 'Loading ads...'}
        </p>
      </div>
    );
  }

  if (!currentShop) {
    return (
      <div className="text-center py-12 px-4 max-w-2xl mx-auto">
        <div className="bg-amber-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <Store className="h-10 w-10 text-amber-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Shop Found</h3>
        <p className="text-muted-foreground mb-6">
          You need to create a shop before you can manage ads. Your shop is where you'll list all your products and services.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => window.location.href = '/shop/create'} 
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Shop
          </Button>
          <Button 
            variant="outline" 
            onClick={async () => {
              setShopLoading(true);
              await fetchShop();
              setShopLoading(false);
            }}
            disabled={shopLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${shopLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="bg-amber-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <Megaphone className="h-10 w-10 text-amber-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Ads Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          You haven't created any ads yet. Create your first ad to start showcasing your products or services to customers.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => window.location.href = '/create-ad'}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Create Your First Ad
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Ads</h2>
          <p className="text-muted-foreground">
            Manage your product advertisements
          </p>
        </div>
        <Button 
          onClick={() => window.location.href = '/create-ad'}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Ad
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <motion.div
            key={ad.advert_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="relative p-0">
                <div className="w-full h-48 relative">
                  <div className="w-full h-full relative">
                    <img
                      src={ad.product?.other?.images?.[0] || '/placeholder-product.jpg'}
                      alt={ad.product?.name || 'Product image'}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                </div>
                {ad.isPromoted && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 bg-amber-600 text-white"
                  >
                    Promoted
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg line-clamp-2">
                    {ad.product?.name || 'Untitled Product'}
                  </h3>
                  <span className="font-bold text-amber-600 whitespace-nowrap ml-2">
                    {ad.product?.price ? `${ad.product.price} ${ad.product.price_currency || ''}` : 'Price not set'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {ad.product?.description || 'No description available'}
                </p>
                <div className="mt-auto pt-4 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {new Date(ad.date_created).toLocaleDateString()}
                    </span>
                    <Badge variant={ad.status === 'active' ? 'default' : 'outline'} className="capitalize">
                      {ad.status || 'inactive'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Expires in:{' '}
                    {Math.ceil(
                      (new Date(ad.date_created).getTime() +
                        (ad.ad_lifetime * 24 * 60 * 60 * 1000) -
                        Date.now()) /
                        (24 * 60 * 60 * 1000)
                    )}{' '}
                    days
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
