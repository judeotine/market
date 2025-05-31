'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shop, Product } from '@/types/types';

export default function ShopProductsPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user's profile
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Get user's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!profile) {
          router.push('/complete-profile');
          return;
        }

        // Get user's shop
        const { data: shopData } = await supabase
          .from('shops')
          .select('*')
          .eq('profile_id', profile.id)
          .single();

        if (!shopData) {
          router.push('/dashboard/shop/create');
          return;
        }

        setShop(shopData as Shop);

        // Get shop's products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', shopData.shop_id)
          .order('created_at', { ascending: false });

        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No Shop Found</h2>
        <p className="text-muted-foreground mb-6">
          You need to create a shop to manage products.
        </p>
        <Button onClick={() => router.push('/dashboard/shop/create')}>
          Create Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Products</h1>
          <p className="text-muted-foreground">
            Manage your shop's products and services
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/shop/products/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-6">
                Get started by adding your first product to your shop.
              </p>
              <Button onClick={() => router.push('/dashboard/shop/products/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.product_id} className="overflow-hidden">
              <div className="aspect-video bg-muted/50 relative">
                {product.other?.images?.[0] ? (
                  <img
                    src={product.other.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    {product.other?.category && (
                      <span className="text-sm text-muted-foreground">
                        {product.other.category}
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-semibold">
                    {product.price_currency} {product.price.toLocaleString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
