'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

// Extended Product type to include additional fields used in the component
type ExtendedProduct = Product & {
  id: string;
  images: string[];
  quantity_sold: number;
  // Add other missing properties as needed
};
import { Shop, Product, Ad } from '@/types/types';
import { userSignal } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MapPin, Plus, Edit, Star, Package, ShoppingBag, BarChart2, Settings, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ShopTabs } from '@/components/shop/ShopTabs';
import { formatCurrency } from '@/lib/utils';

// Stat Card Component
function StatCard({ icon, title, value, description }: { icon: React.ReactNode; title: string; value: string; description: string }) {
  return (
    <Card className="bg-white shadow-md border-0 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ShopStats {
  totalProducts: number;
  totalOrders: number;
  monthlyRevenue: number;
  rating: number;
  reviewCount: number;
}

export default function ShopPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [stats, setStats] = useState<ShopStats>({
    totalProducts: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
    rating: 0,
    reviewCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const user = userSignal.value;
  const router = useRouter();
  const supabase = createClientComponentClient();

  const fetchShop = useCallback(async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      
      // Get all user's profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id);

      if (profileError) throw profileError;
      if (!profiles || profiles.length === 0) {
        setShop(null);
        return;
      }

      // Find the first shop associated with any of the user's profiles
      for (const profile of profiles) {
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('profile_id', profile.profile_id)
          .maybeSingle();

        if (shopError) {
          console.error('Error fetching shop:', shopError);
          continue;
        }

        if (shopData) {
          // Create the shop object with proper typing
          const shopInfo = {
            id: shopData.id,
            name: shopData.name,
            description: shopData.description || 'Welcome to our shop! Browse our latest products and offers.',
            ads_count: 0, // Will be updated by stats
            ads_duration: 0,
            ads_duration_units: 'days',
            price_per_ad: 0,
            price_currency: 'UGX',
            ads_payment_id: '',
            profile_id: shopData.profile_id,
            logo: shopData.logo_url || '',
            rating: '0',
            other: {
              location: shopData.address || shopData.other?.location || 'No location specified',
              address: shopData.address || shopData.other?.address,
              contact_email: shopData.contact_email,
              contact_phone: shopData.contact_phone,
              banner_url: shopData.banner_url
            },
            shop_id: shopData.id // For backward compatibility
          } as unknown as Shop; // Use type assertion to handle the shop_id property
          
          setShop(shopInfo);
          await fetchShopStats(shopData.id);
          return;
        }
      }
      
      setShop(null);
    } catch (error) {
      console.error('Error in fetchShop:', error);
    } finally {
      setLoading(false);
    }
  }, [user, router, supabase]);

  const fetchShopStats = async (shopId: string) => {
    if (!shopId) return;
    
    try {
      // Initialize default values
      let productCount = 0;
      let orderCount = 0;
      let monthlyRevenue = 0;
      let rating = 0;
      let reviewCount = 0;

      // Fetch shop rating and review count
      try {
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('rating, other->review_count')
          .eq('id', shopId)
          .single();
          
        if (!shopError && shopData) {
          // Ensure rating is a number
          const ratingValue = typeof shopData.rating === 'string' 
            ? parseFloat(shopData.rating) 
            : Number(shopData.rating);
          rating = isNaN(ratingValue) ? 0 : ratingValue;
          
          // Ensure reviewCount is a number
          const reviewCountValue = typeof shopData.review_count === 'number' 
            ? shopData.review_count 
            : 0;
          reviewCount = reviewCountValue;
        }
      } catch (error) {
        console.error('Error fetching shop rating:', error);
      }

      try {
        // First try to get products from the shop_products table
        const { data: shopProducts, error: shopProductsError } = await supabase
          .from('shop_products')
          .select('*', { count: 'exact' })
          .eq('shop_id', shopId);
        
        if (!shopProductsError && shopProducts) {
          productCount = shopProducts.length;
          // If shop_products exists, fetch the actual product details
          const productIds = shopProducts.map(sp => sp.product_id);
          if (productIds.length > 0) {
            const { data: products } = await supabase
              .from('products')
              .select('*')
              .in('id', productIds);
            setProducts(products || []);
          } else {
            setProducts([]);
          }
        } else {
          // Fallback to direct products table query
          const { data: products, count } = await supabase
            .from('products')
            .select('*', { count: 'exact' })
            .eq('shop_id', shopId);
          
          productCount = count || 0;
          setProducts(products || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Try alternative approach if the first one fails
        try {
          const { data: products, count } = await supabase
            .from('products')
            .select('*', { count: 'exact' })
            .eq('shop_id', shopId);
          
          productCount = count || 0;
          setProducts(products || []);
        } catch (fallbackError) {
          console.error('Fallback products fetch failed:', fallbackError);
        }
      }

      try {
        // Fetch orders count and revenue
        const { data: orders, count } = await supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .eq('shop_id', shopId);
        
        orderCount = count || 0;
        
        // Calculate monthly revenue
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        monthlyRevenue = orders?.reduce((sum, order) => {
          const orderDate = new Date(order.created_at || new Date());
          if (orderDate.getMonth() === currentMonth && 
              orderDate.getFullYear() === currentYear) {
            return sum + (order.total_amount || 0);
          }
          return sum;
        }, 0) || 0;

        setOrders(orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }

      // Set the stats with the fetched or default values
      setStats(prevStats => ({
        ...prevStats,
        totalProducts: productCount,
        totalOrders: orderCount,
        monthlyRevenue: monthlyRevenue,
        rating: rating,
        reviewCount: reviewCount
      }));

    } catch (error) {
      console.error('Error in fetchShopStats:', error);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;
    if (!shop) return;

    const shopChannel = supabase
      .channel('shop-updates')
      .on('postgres_changes', 
        { 
          event: '*',
          schema: 'public',
          table: 'shops',
          filter: `id=eq.${shop.shop_id}`
        },
        (payload) => {
          // Update shop data and refresh stats when shop data changes
          if (payload.eventType === 'UPDATE') {
            // Update the shop state with new data
            if (payload.new) {
              setShop(prev => ({
                ...prev!,
                ...payload.new,
                other: {
                  ...prev?.other,
                  ...(payload.new.other || {})
                }
              }));
            }
            // Refresh stats which includes rating
            fetchShopStats(shop.shop_id);
          } else {
            fetchShop();
          }
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `shop_id=eq.${shop.shop_id}`
        },
        () => fetchShopStats(shop.shop_id)
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `shop_id=eq.${shop.shop_id}`
        },
        () => fetchShopStats(shop.shop_id)
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `shop_id=eq.${shop.shop_id}`
        },
        () => fetchShopStats(shop.shop_id)
      )
      .subscribe();

    return () => {
      shopChannel.unsubscribe();
    };
  }, [user, router, supabase, shop, fetchShop]);

  // Initial data fetch
  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="aspect-video bg-muted"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
              <CardTitle>No Shop Found</CardTitle>
              <CardDescription className="text-amber-100">
                You don't have a shop yet. Create one to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Button 
                className="w-full" 
                onClick={() => router.push('/shop/new')}
              >
                Create Shop
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Shop Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {shop.logo ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/20 flex items-center justify-center">
                    <img 
                      src={shop.logo} 
                      alt={shop.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to store icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '';
                        target.parentElement!.innerHTML = '<Store className="w-6 h-6" />';
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Store className="w-6 h-6" />
                  </div>
                )}
                <h1 className="text-3xl font-bold tracking-tight">{shop.name}</h1>
                <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  {stats.rating.toFixed(1)} ({stats.reviewCount})
                </Badge>
              </div>
              <div className="flex items-center text-amber-100 mb-6">
                <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span className="truncate">
                  {shop.other?.location || (shop.other as any)?.address || 'No location specified'}
                </span>
              </div>
              <p className="text-amber-50 max-w-2xl">
                {shop.description || 'Welcome to our shop! Browse our latest products and offers.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white"
                onClick={() => router.push(`/shop/${shop.shop_id}/edit`)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Shop Settings
              </Button>
              <Button 
                className="bg-white text-amber-600 hover:bg-amber-50"
                onClick={() => router.push(`/shop/${shop.shop_id}/products/new`)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="container -mt-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <h3 className="text-2xl font-bold">
                  {`UGX ${stats.monthlyRevenue.toLocaleString()}`}
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <BarChart2 className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container pb-12">
        <Tabs defaultValue="products" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-transparent p-0 h-auto gap-1">
              <TabsTrigger 
                value="products" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-amber-600 px-4 py-2 rounded-lg font-medium"
              >
                Products
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-amber-600 px-4 py-2 rounded-lg font-medium"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-amber-600 px-4 py-2 rounded-lg font-medium"
              >
                Analytics
              </TabsTrigger>
            </TabsList>
            <div className="text-sm text-muted-foreground">
              {products.length > 0 
                ? `Showing 1-${Math.min(products.length, 5)} of ${products.length} products`
                : 'No products found'}
            </div>
          </div>
          
          <Separator className="mb-6" />
          
          <TabsContent value="products">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
            ) : shop ? (
              <ShopTabs shop={shop} />
            ) : (
              <div className="bg-white rounded-xl border p-6">
                <p className="text-muted-foreground">No shop found. Please create a shop first.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="orders">
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Order #{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="font-medium">
                          {`UGX ${order.total_amount?.toLocaleString() || '0'}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No orders found</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard 
                icon={<BarChart2 className="h-5 w-5" />}
                title="Total Sales"
                value={`UGX ${stats.monthlyRevenue.toLocaleString()}`}
                description="This month"
              />
              <StatCard 
                icon={<ShoppingBag className="h-5 w-5" />}
                title="Total Orders"
                value={stats.totalOrders.toString()}
                description={`${Math.floor((stats.totalOrders / 30) * 100)}% from last month`}
              />
              <StatCard 
                icon={<Package className="h-5 w-5" />}
                title="Products"
                value={stats.totalProducts.toString()}
                description={`${Math.floor((stats.totalProducts / 50) * 100)}% of shop capacity`}
              />
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-medium mb-6">Sales Overview</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <BarChart2 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Sales chart will be displayed here</p>
                  <p className="text-sm text-gray-400">Coming in the next update</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-medium mb-4">Top Products</h3>
                {products.length > 0 ? (
                  <div className="space-y-4">
                    {products.slice(0, 3).map((product) => (
                      <div key={product.id} className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                          {product.images?.[0] ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="h-full w-full object-cover rounded-md"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.price ? `UGX ${product.price.toLocaleString()}` : 'Price not set'}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          {product.quantity_sold || 0} sold
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No products found</p>
                )}
              </div>

              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            New order #{order.order_number}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleString()}
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          UGX {order.total_amount?.toLocaleString() || '0'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent orders</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
