'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ProductForm } from '@/components/product/ProductForm';
import { transformToProductAndAd } from '@/lib/validations/product';
import { createProductWithAd } from '@/lib/api/products';
import type { Database } from '@/types/types';

interface ShopData {
  shop_id: string;
  name: string;
  description: string;
  logo?: string;
  profile_id: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient<Database>();
  
  // Get shopId from URL params and validate it
  const shopId = Array.isArray(params.shopId) ? params.shopId[0] : params.shopId;
  
  const [shop, setShop] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  // Fetch shop data and verify user permissions
  useEffect(() => {
    const fetchData = async () => {
      if (!shopId) {
        setError('No shop ID provided');
        setLoading(false);
        return;
      }

      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setError('You must be logged in to add products');
          setLoading(false);
          router.push('/login');
          return;
        }
        
        setUser({ id: session.user.id });
        
        // Fetch shop data
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('shop_id', shopId)
          .single();
          
        if (shopError || !shopData) {
          throw new Error(shopError?.message || 'Shop not found');
        }
        
        // Verify user owns the shop
        if (shopData.profile_id !== session.user.id) {
          setError('You do not have permission to add products to this shop');
          setLoading(false);
          router.push('/dashboard');
          return;
        }
        
        setShop(shopData);
      } catch (err) {
        console.error('Error fetching shop data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [shopId, router, supabase]);

  // Handle form submission
  const handleProductSubmit = useCallback(async (formData: any) => {
    if (!shop?.shop_id || !user?.id) {
      toast.error('Shop or user information is missing');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Transform form data to match Product and Ad types
      const { product, ad } = transformToProductAndAd(formData, shop.shop_id, user.id);
      
      // Create product and ad in the database
      await createProductWithAd({
        product,
        ad,
        userId: user.id,
        shopId: shop.shop_id,
      });

      toast.success('Product created successfully!');
      
      // Redirect to the shop page after successful creation
      router.push(`/shop/${shop.shop_id}`);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  }, [shop, user, router]);

  // Handle navigation back
  const handleBack = useCallback(() => {
    if (shopId) {
      router.push(`/shop/${shopId}`);
    } else {
      router.push('/dashboard');
    }
  }, [router, shopId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading shop information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
          <Button 
            variant="link" 
            className="mt-2 p-0 h-auto text-red-700"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          <p>Shop not found</p>
          <Button 
            variant="link" 
            className="mt-2 p-0 h-auto text-yellow-700"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">
            Add a new product to {shop.name}
          </p>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <ProductForm 
          shopId={shop.shop_id}
          userId={user?.id || ''}
          onSuccess={() => {
            toast.success('Product created successfully!');
            router.push(`/shop/${shop.shop_id}`);
          }}
          defaultValues={{
            price: 0,
            category: '',
            condition: 'new',
            isPromoted: false,
            promotionDuration: 7,
            promotionCost: 10,
            name: '',
            description: '',
            images: [],
          }}
        />
      </div>
    </div>
  );
}
