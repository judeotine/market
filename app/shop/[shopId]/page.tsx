'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Product } from '@/types/types';

// Define local types
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Shop {
  shop_id: string;
  name: string;
  description?: string;
  logo?: string;
  rating?: string | number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface ShopStats {
  totalProducts: number;
  totalOrders: number;
  monthlyRevenue: number;
  rating: number;
  reviewCount: number;
  totalViews: number;
  conversionRate: number;
}

interface ExtendedOrder {
  id: string;
  created_at: string;
  currency: string;
  order_id: string;
  status: OrderStatus;
  shop_id: string;
  user_id: string;
  total_amount: number;
  [key: string]: any; // For any additional properties
}

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ShoppingBag, BarChart2, Plus, Loader2, XCircle, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { ProductList } from '@/components/shop/ProductList';

// Helper function to validate UUID
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export default function ShopPage() {
  const router = useRouter();
  const params = useParams();
  const shopId = Array.isArray(params.shopId) ? params.shopId[0] : params.shopId;
  
  // Redirect if shopId is 'new'
  useEffect(() => {
    if (shopId === 'new') {
      router.push('/dashboard/shop/create');
      return;
    }
    
    // Validate UUID format
    if (shopId && !isValidUUID(shopId)) {
      console.error('Invalid shop ID format:', shopId);
      router.push('/shops');
      return;
    }
  }, [shopId, router]);
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [stats, setStats] = useState<ShopStats>({
    totalProducts: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
    rating: 0,
    reviewCount: 0,
    totalViews: 0,
    conversionRate: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [activeTab, setActiveTab] = useState('products' as 'products' | 'orders');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  
  // Validate shopId on component mount
  useEffect(() => {
    if (!shopId || !isValidUUID(shopId)) {
      console.error('Invalid shop ID in URL:', shopId);
      setError('Invalid shop ID. Please check the URL and try again.');
      setIsLoading(false);
      router.push('/shop');
    }
  }, [shopId, router]);

  // Fetch shop data
  const fetchShop = useCallback(async () => {
    if (!shopId || !isValidUUID(shopId)) {
      console.error('Invalid shop ID:', shopId);
      setError('Invalid shop ID format');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // First try with shop_id (as it's the most reliable identifier)
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .or(`shop_id.eq.${shopId},id.eq.${shopId}`)
        .maybeSingle();

      if (shopError) throw shopError;
      
      if (!shopData) {
        throw new Error('Shop not found');
      }

      // Ensure we have all required fields
      const shopWithDefaults = {
        id: shopData.id || shopData.shop_id || shopId,
        shop_id: shopData.shop_id || shopData.id || shopId, // Ensure shop_id is always set
        name: shopData.name || 'Untitled Shop',
        description: shopData.description || '',
        ...shopData
      };

      setShop(shopWithDefaults as Shop);
    } catch (error) {
      console.error('Error fetching shop:', error);
      setError('Failed to load shop data. Please try again.');
      toast.error('Failed to load shop data');
    } finally {
      setIsLoading(false);
    }
  }, [shopId, supabase]);

  // Fetch shop stats
  const fetchShopStats = useCallback(async () => {
    if (!shopId) return;

    try {
      // Fetch products count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId);

      // Fetch orders and calculate monthly revenue
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('shop_id', shopId);

      const monthlyRevenue = ordersData?.reduce((sum, order: ExtendedOrder) => {
        const orderDate = new Date(order.created_at);
        const now = new Date();
        if (orderDate.getMonth() === now.getMonth() && 
            orderDate.getFullYear() === now.getFullYear()) {
          return sum + (order.total_amount || 0);
        }
        return sum;
      }, 0) || 0;

      // Fetch reviews for rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('shop_id', shopId);

      const rating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        : 0;

      // Update stats
      setStats(prev => ({
        ...prev,
        totalProducts: productCount || 0,
        totalOrders: ordersData?.length || 0,
        monthlyRevenue,
        rating: parseFloat(rating.toFixed(1)),
        reviewCount: reviews?.length || 0,
      }));

    } catch (error) {
      console.error('Error fetching shop stats:', error);
    }
  }, [shopId, supabase]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!shopId) return;

    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  }, [shopId, supabase]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!shopId) return;

    // Initial fetch
    const handleTabChange = (value: 'products' | 'orders') => {
      setActiveTab(value);
    };

    const loadData = async () => {
      await Promise.all([
        fetchShop(),
        fetchShopStats(),
        fetchProducts(),
      ]);
      setIsLoading(false);
    };
    
    loadData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('shop-updates')
      .on('postgres_changes', 
        { 
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `shop_id=eq.${shopId}`
        },
        () => {
          fetchProducts();
          fetchShopStats();
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `shop_id=eq.${shopId}`
        },
        () => fetchShopStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, supabase, fetchShop, fetchShopStats, fetchProducts]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading shop data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/shop')}
                  className="text-sm"
                >
                  Back to Shops
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Shop Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The requested shop could not be found. It may have been removed or you don't have permission to view it.
          </p>
          <div className="space-x-4">
            <Button onClick={() => router.push('/shop')} variant="outline">
              Back to Shops
            </Button>
            <Button onClick={() => router.push('/')}>
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Shop Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{shop.name}</h1>
            <p className="text-muted-foreground">{shop.description}</p>
          </div>
          <Button 
            onClick={() => {
              // Use the shop ID from the shop state instead of the URL params
              const targetShopId = shop?.shop_id || shop?.id;
              if (!targetShopId) {
                console.error('No valid shop ID found in shop data');
                toast.error('Unable to add product: Invalid shop information');
                return;
              }
              router.push(`/shop/${targetShopId}/products/new`);
            }}
            className="bg-amber-600 hover:bg-amber-700"
            disabled={!shop}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <span className="text-muted-foreground text-sm">{shop.price_currency || 'UGX'}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.monthlyRevenue, shop.price_currency || 'UGX')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
              <span>{stats.rating.toFixed(1)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {stats.reviewCount} {stats.reviewCount === 1 ? 'review' : 'reviews'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs 
        value={activeTab} 
        onValueChange={(value: string) => {
          if (value === 'products' || value === 'orders') {
            setActiveTab(value);
          }
        }} 
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <ProductList 
            shop_id={shopId || ''}
            products={products} 
            loading={isLoading}
            onProductCreated={fetchProducts}
            refreshKey={products.length}
          />
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.order_id || order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Order #{order.order_id?.slice(0, 8) || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {order.other?.total_amount ? formatCurrency(order.other.total_amount, order.currency || 'UGX') : 'N/A'}
                          </p>
                          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="mt-1">
                            {order.status?.toUpperCase() || 'PENDING'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No orders yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <p className="text-sm text-muted-foreground">
                View your shop's performance metrics
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalViews}</div>
                    <p className="text-xs text-muted-foreground">
                      Total number of views on your products
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.conversionRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Views to orders conversion rate
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
