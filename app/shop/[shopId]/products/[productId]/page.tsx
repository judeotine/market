'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shop, Product } from '@/types/types';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
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
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId, productId, supabase]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('product_id', productId);

      if (error) throw error;

      toast.success('Product deleted successfully');
      router.push(`/shop/${shopId}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
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

  const { name, description, price, other } = product;
  const { images = [], category, brand, condition, model, variants = [] } = other || {};

  return (
    <div className="container py-8">
      <div className="flex items-center space-x-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push(`/shop/${shopId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          <p className="text-muted-foreground">
            Product in {shop.name}
          </p>
        </div>
        <div className="ml-auto flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/shop/${shopId}/products/${productId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            {images?.length > 0 ? (
              <img
                src={images[0]}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>
          {images?.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1).map((img, i) => (
                <div key={i} className="aspect-square bg-muted rounded-md overflow-hidden">
                  <img
                    src={img}
                    alt={`${name} ${i + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-bold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'UGX',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(price)}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {category && <Badge variant="outline" className="mr-2">{category}</Badge>}
                    {brand && <Badge variant="outline">{brand}</Badge>}
                  </CardDescription>
                </div>
                {condition && (
                  <Badge variant="secondary" className="capitalize">
                    {condition}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {description || 'No description provided.'}
                </p>
              </div>

              {model && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Model</h4>
                  <p>{model}</p>
                </div>
              )}

              {variants?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Variants</h4>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant, i) => (
                      <Badge key={i} variant="outline">
                        {variant}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Sold by</h3>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                {shop.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{shop.name}</p>
                <p className="text-sm text-muted-foreground">
                  {shop.location || 'No location provided'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
