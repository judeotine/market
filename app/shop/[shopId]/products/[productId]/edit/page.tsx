'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateProductForm } from '@/components/shop/CreateProductForm';
import { Shop, Product } from '@/types/types';

export default function EditProductPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { shopId, productId } = useParams() as { shopId: string; productId: string };
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      if (!shopId || !productId) return;
      
      try {
        // Fetch shop data
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('shop_id', shopId)
          .single();
          
        if (shopError) throw shopError;
        
        // Fetch product data
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('product_id', productId)
          .single();
          
        if (productError) throw productError;
        
        setShop(shopData as Shop);
        setProduct(productData as Product);
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push(`/shop/${shopId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId, productId, router, supabase]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Product</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  if (!shop || !product) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The requested product could not be found.
          </p>
          <Button onClick={() => router.push(`/shop/${shopId}`)}>
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const handleSuccess = () => {
    router.push(`/shop/${shop.shop_id}`);
  };

  return (
    <div className="container py-8">
      <div className="flex items-center space-x-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push(`/shop/${shop.shop_id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">
            Update product details for {product.name}
          </p>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <CreateProductForm 
          shop={shop} 
          initialData={product}
          onSuccess={handleSuccess} 
        />
      </div>
    </div>
  );
}
