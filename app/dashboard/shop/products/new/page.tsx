'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateProductForm } from '@/components/shop/CreateProductForm';
import { Shop } from '@/types/types';
import { toast } from 'sonner';

// Enhanced session check with retry and refresh token handling
const checkAndRefreshSession = async (supabase: any, retries = 2, delay = 300) => {
  for (let i = 0; i <= retries; i++) {
    try {
      // First try to get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      // If we have a valid session, return it
      if (session) {
        return { session, error: null };
      }
      
      // If no session, try to refresh it
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) throw refreshError;
      if (refreshedSession) {
        return { session: refreshedSession, error: null };
      }
      
      // If we're still here, wait and retry
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    } catch (error) {
      console.error(`Session check/refresh attempt ${i + 1} failed:`, error);
      if (i === retries) {
        console.error('Max retries reached for session check/refresh');
        return { session: null, error };
      }
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  return { session: null, error: new Error('Unable to establish session') };
};

export default function NewProductPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  // Get shop ID from URL with proper validation
  const shopId = useMemo(() => {
    const id = searchParams?.get('shopId')?.trim();
    // Basic validation to ensure it's not empty
    if (!id) {
      console.error('No shopId found in URL');
      return null;
    }
    return id;
  }, [searchParams]);

  // Redirect if no valid shop ID is found
  useEffect(() => {
    if (shopId === null) {
      console.error('Invalid or missing shop ID, redirecting to shop dashboard');
      toast.error('Invalid shop reference. Please select a shop first.');
      router.push('/dashboard/shop');
    }
  }, [shopId, router]);

  // Fetch shop data with retry logic and enhanced session handling
  const fetchShop = useCallback(async () => {
    if (!shopId) {
      console.error('No shop ID available for fetching');
      return null;
    }
    
    console.log('Attempting to fetch shop with ID:', shopId);
    
    try {
      setLoading(true);
      console.log('Fetching shop with ID:', shopId);

      // 1. Check and refresh session if needed
      const { session: currentSession, error: sessionError } = await checkAndRefreshSession(supabase);
      
      if (sessionError || !currentSession) {
        console.error('Session check/refresh failed:', sessionError);
        const redirectPath = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?redirectedFrom=${redirectPath}`;
        return null;
      }

      // 2. Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Failed to get user after session refresh:', userError);
        throw new Error('Authentication required');
      }

      // 3. Fetch shop data with proper error handling
      console.log('Querying shops table with shopId:', shopId);
      
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .or(`id.eq.${shopId},shop_id.eq.${shopId}`)
        .maybeSingle();
      
      console.log('Shop data response:', { 
        hasData: !!shopData,
        error: shopError ? shopError.message : 'No error'
      });
      
      if (shopError) throw shopError;
      
      if (!shopData) {
        console.error('No shop found with ID:', shopId);
        toast.error('Shop not found');
        router.push('/dashboard/shop');
        return null;
      }

      // 4. Verify ownership
      const isOwner = shopData.owner_id === user.id || 
                     shopData.profile_id === user.id ||
                     shopData.id === shopId ||
                     shopData.shop_id === shopId;

      if (!isOwner) {
        console.error('User does not have permission to access this shop');
        toast.error('You do not have permission to add products to this shop');
        router.push('/dashboard/shop');
        return null;
      }

      return shopData;
      
    } catch (error) {
      console.error('Error in fetchShop:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Authentication required' || 
            error.message.includes('JWT')) {
          console.log('Authentication error, redirecting to login');
          const redirectPath = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?redirectedFrom=${redirectPath}`;
          return null;
        }
      }
      
      toast.error('Failed to load shop data. Please try again.');
      router.push('/dashboard/shop');
      return null;
      
    } finally {
      setLoading(false);
    }
  }, [shopId, router, supabase]);

  // Initial data load
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!shopId) {
        console.error('No shop ID available for data loading');
        return;
      }
      
      const shopData = await fetchShop();
      if (!isMounted || !shopData) return;

      // Prepare shop data with defaults
      const shopWithDefaults: Shop = {
        id: shopData.id || shopId || '',
        shop_id: shopData.shop_id || shopId || '',
        name: shopData.name || 'My Shop',
        description: shopData.description || '',
        ads_count: shopData.ads_count || 0,
        ads_duration: shopData.ads_duration || 30,
        ads_duration_units: shopData.ads_duration_units || 'days',
        price_per_ad: shopData.price_per_ad || 0,
        price_currency: shopData.price_currency || 'USD',
        ads_payment_id: shopData.ads_payment_id,
        profile_id: shopData.profile_id,
        logo: shopData.logo || '',
        rating: shopData.rating || '0',
        owner_id: shopData.owner_id,
        ...shopData
      };

      setShop(shopWithDefaults);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchShop, shopId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Loading shop data...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="text-2xl font-bold">Shop not found</h2>
        <p className="text-muted-foreground">We couldn't find the shop you're looking for.</p>
        <Button onClick={() => router.push('/dashboard/shop')}>
          Back to Shops
        </Button>
      </div>
    );
  }

  const handleSuccess = () => {
    router.push('/dashboard/shop/products');
  };

  return (
    <div className="container py-8">
      <CreateProductForm shop={shop} onSuccess={handleSuccess} />
    </div>
  );
}
