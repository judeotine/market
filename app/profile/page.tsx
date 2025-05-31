'use client';

import { useState, useEffect } from 'react';
import { userSignal } from '@/store';
import { FaUser, FaStore, FaShoppingCart, FaClipboardList } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { showErrorToast } from '@/lib/utils';
import { ReviewDialog } from '@/components/ReviewDialog';
import { Order, User } from '@/types/supabase';

type OrderWithReview = Order & {
  has_review: boolean;
  products?: {
    name: string;
  } | null;
  services?: {
    name: string;
  } | null;
  shops?: {
    name: string;
  } | null;
};

const ProfileSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-6 w-full" />
            ))}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const ProfileSection = ({ 
  icon, 
  title, 
  content 
}: { 
  icon: React.ReactNode, 
  title: string, 
  content: React.ReactNode 
}) => (
  <div className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-200">
    <div className="flex items-center mb-4">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        {icon}
      </div>
      <h2 className="ml-3 text-lg font-semibold text-gray-800">{title}</h2>
    </div>
    <div className="space-y-3 text-gray-700">
      {content}
    </div>
  </div>
);

const SellerProfile = () => {
  const user = userSignal.value;
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative group">
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              <Avatar className="w-full h-full border-4 border-white/90 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <AvatarImage 
                  src={user?.avatar || ''} 
                  alt={user?.name || 'User'} 
                  className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
                  <span className="text-4xl md:text-5xl font-bold text-white/90">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </AvatarFallback>
              </Avatar>
              
              {/* Camera icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </div>
              
              {/* Online status indicator */}
              <div className="absolute bottom-0 right-0 transform translate-x-1 translate-y-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <CardTitle className="text-3xl font-bold text-gray-900">
              {user?.name || 'Seller Account'}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">Seller</Badge>
              <Badge variant="secondary">
                {user?.businessType || 'N/A'}
              </Badge>
              <span>{user?.businessName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Business Type</span>
              <span>{user?.businessType || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Products</span>
              <span className="text-blue-600 font-medium">
                {user?.productCount || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Products Added Today</span>
                  <span className="text-blue-600 font-medium">{user?.productsAddedToday || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Sales</span>
                  <span className="text-green-600 font-medium">
                    ${user?.totalSales?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileSection 
            icon={<FaUser className="w-6 h-6 text-gray-600" />} 
            title="Personal Information" 
            content={
              <>
                <div className="flex justify-between">
                  <span className="font-medium">Name</span>
                  <span>{user?.name || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email</span>
                  <span>{user?.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Phone</span>
                  <span>{user?.phone || 'Not provided'}</span>
                </div>
              </>
            }
          />
          
          <ProfileSection 
            icon={<FaClipboardList className="w-6 h-6 text-blue-600" />} 
            title="Business Details" 
            content={
              <>
                <div className="flex justify-between">
                  <span className="font-medium">Business Name</span>
                  <span>{user?.businessName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Business Type</span>
                  <span>{user?.businessType || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Location</span>
                  <span>{user?.address || 'N/A'}</span>
                </div>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
};

const BuyerProfile = () => {
  const user = userSignal.value as User | null;
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<OrderWithReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [error, setError] = useState<string | null>(null);

  // Function to get user initials
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0]?.toUpperCase())
      .join('')
      .substring(0, 2);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsProfileLoading(false);
        setError('User not authenticated');
        return;
      }

      try {
        // Get the user's profile - no need to order since we're getting by user_id
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .limit(1);

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw new Error(profileError.message || 'Failed to fetch profile');
        }
        
        const profile = profiles?.[0];
        setProfile(profile || {});
        setError(null);
      } catch (error) {
        console.error('Error in fetchProfile:', error);
        setError(error instanceof Error ? error.message : 'Failed to load profile');
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;

        // First, get all reviews by this user
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('buyer_id', currentUser.id);

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
          // Continue with empty reviews if there's an error
          return [];
        }

        // Get all orders for the current user
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('buyer_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        if (!orders) return;

        // Get unique shop IDs from orders
        const shopIds = [...new Set(orders.map(order => order.shop_id))];
        
        // Fetch shop details in a single query
        const { data: shops, error: shopsError } = await supabase
          .from('users')
          .select('id, name, avatar_url')
          .in('id', shopIds);
          
        if (shopsError) console.error('Error fetching shops:', shopsError);

        // Create a map of shop IDs to shop details
        const shopMap = new Map(shops?.map(shop => [shop.id, shop]));

        // Add has_review flag and shop details to each order
        const ordersWithDetails = orders.map(order => {
          // Check if there's a review for this order's product or service
          const hasReview = reviews?.some(review => {
            // Check if review is for this order's product or service
            // Based on the error, we'll check the review type and match accordingly
            if (review.type === 'product' && order.product_id) {
              return review.product_id === order.product_id;
            } else if (review.type === 'service' && order.service_id) {
              return review.service_id === order.service_id;
            }
            return false;
          });
          
          const shop = shopMap.get(order.shop_id);
          
          return {
            ...order,
            has_review: hasReview || false,
            shops: shop ? {
              id: shop.id,
              name: shop.name,
              avatar: shop.avatar_url
            } : null
          };
        });

        setOrders(ordersWithDetails);
      } catch (error) {
        console.error('Error fetching orders:', error);
        showErrorToast('Failed to load order history');
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  if (isProfileLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Profile</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative group">
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              <Avatar className="w-full h-full border-4 border-white/90 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <AvatarImage 
                  src={profile?.avatar || ''} 
                  alt={profile?.name || 'User'} 
                  className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
                  <span className="text-4xl md:text-5xl font-bold text-white/90">
                    {getInitials(profile?.name || user?.email)}
                  </span>
                </AvatarFallback>
              </Avatar>
              
              {/* Camera icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </div>
              
              {/* Online status indicator */}
              <div className="absolute bottom-0 right-0 transform translate-x-1 translate-y-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {profile?.name || user?.email?.split('@')[0] || 'User'}
              </CardTitle>
              {profile?.name && (
                <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
              <Badge 
                variant="outline" 
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {profile?.user_type || 'Buyer'}
              </Badge>
              <Badge 
                variant={profile?.is_active ? 'default' : 'secondary'}
                className={profile?.is_active ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
              >
                {profile?.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {profile?.is_banned && (
                <Badge variant="destructive" className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-white mr-1.5"></span>
                  Banned
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Profile Info</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProfileSection
                icon={<FaUser className="w-6 h-6 text-gray-600" />}
                title="Personal Information"
                content={
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Full Name</span>
                      <span className="text-gray-800 font-medium">{profile?.name || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Email</span>
                      <span className="text-gray-800 font-medium truncate max-w-[180px]" title={user?.email}>
                        {user?.email || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Phone</span>
                      <span className="text-gray-800 font-medium">
                        {profile?.phone ? (
                          <a href={`tel:${profile.phone}`} className="text-blue-600 hover:underline">
                            {profile.phone}
                          </a>
                        ) : 'Not provided'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Account Status</span>
                      <Badge variant={profile?.is_active ? 'default' : 'secondary'} className="ml-2">
                        {profile?.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Trial Ads Remaining</span>
                      <div className="flex items-center">
                        <span className="text-gray-800 font-medium mr-2">{profile?.trial_ads_count || 0}</span>
                        <span className="text-xs text-gray-500">/ 3</span>
                      </div>
                    </div>
                  </>
                }
              />

              <ProfileSection
                icon={<FaClipboardList className="w-6 h-6 text-blue-600" />}
                title="Account Summary"
                content={
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Total Orders</span>
                      <div className="flex items-center">
                        <span className="text-gray-800 font-medium">{orders.length}</span>
                        {orders.length > 0 && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {orders.filter(o => o.status === 'completed').length} completed
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Member Since</span>
                      <span className="text-gray-800 font-medium">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">Last Active</span>
                      <span className="text-gray-500 text-sm">
                        {new Date().toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </>
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-8 w-32 mb-4" />
                    <div className="space-y-2">
                      {[1, 2].map((j) => (
                        <Skeleton key={j} className="h-6 w-full" />
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">
                          Order #{order.order_number}
                        </CardTitle>
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              {order.products?.name || order.services?.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Seller: {order.shops?.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${order.total_amount}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {order.status === 'completed' && !order.has_review && (
                          <ReviewDialog
                            orderId={order.id}
                            itemId={order.product_id || order.service_id}
                            itemType={order.product_id ? 'product' : 'service'}
                            shopId={order.shop_id}
                            buyerId={order.buyer_id}
                            itemName={order.products?.name || order.services?.name}
                            onReviewSubmitted={() => {
                              // Refresh orders after review
                              const fetchOrders = async () => {
                                try {
                                  const { data: { user: currentUser } } = await supabase.auth.getUser();
                                  if (!currentUser) return;

                                  const { data, error } = await supabase
                                    .from('orders')
                                    .select(`
                                      *,
                                      products:product_id (*),
                                      services:service_id (*),
                                      shops:shop_id (*)
                                    `)
                                    .eq('buyer_id', currentUser.id)
                                    .order('created_at', { ascending: false });

                                  if (error) throw error;
                                  setOrders(data || []);
                                } catch (error) {
                                  console.error('Error fetching orders:', error);
                                  showErrorToast('Failed to load order history');
                                }
                              };
                              fetchOrders();
                            }}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const user = userSignal.value;
  
  if (!user) {
    return <ProfileSkeleton />;
  }

  return user.account_type === 'seller' ? <SellerProfile /> : <BuyerProfile />;
}
